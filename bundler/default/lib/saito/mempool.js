'use strict';
const Big = require('big.js')
const saito = require('./saito');
const path = require('path');

class Mempool {

  constructor(app) {

    this.app                      = app || {};

    //
    // data stores
    //
    this.mempool		  = {}; // contained in object so pass-by-reference
    this.mempool.blocks           = []; // in block creation -- block can remove from 
    this.mempool.transactions     = []; // mempool quickly.
    this.mempool.golden_tickets   = [];

    //
    // work in mempool
    //
    this.routing_work_needed      = 0.0;
    this.routing_work_in_mempool  = 0.0;

    //
    // mempool safety caps
    //
    this.transaction_size_cap     = 25600000;// bytes hardcap 25 MB
    this.transaction_size_current = 0.0;
    this.block_size_cap           = 1024000000; // bytes hardcap 1GB
    this.block_size_current       = 0.0;


    //
    // removing block and transactions
    //
    this.clearing_active          = false;
    this.accept_zero_fee_txs      = true;

    //
    // processing timer
    //
    this.processing_active        = false;
    this.processing_speed         = 10;
    this.processing_timer         = null;

    //
    // bundling timer
    //
    this.bundling_active          = false;
    this.bundling_speed           = 1000;
    this.bundling_timer           = null;

    //
    // hashmap
    //
    this.transactions_hmap        = [];  // index is tx.transaction.sig
    this.transactions_inputs_hmap = [];  // index is slip returnSignatureSource()

    //
    // downloads
    //
    this.downloads                = {};
    this.downloads_hmap           = {};
    this.downloading_active       = 0;

  }


  addBlock(block) {

    if (block == null) { return false; }
    if (!block.is_valid) { return false; }

    //
    // insert into queue
    //
    let hash = block.returnHash();
    let insertme = true;
    for (let i = 0; i < this.mempool.blocks.length; i++) {
      if (this.mempool.blocks[i].returnHash() == hash) {
	insertme = false;
      }
    }

    if (insertme) {
      this.mempool.blocks.push(block);
    } else {
      return false;
    }

    //
    // process queue
    //
    if (this.processing_active == 1) { return; }
    this.processing_active = 1;

    //
    // sort our block queue before adding to chain
    //
    this.mempool.blocks.sort((a,b) => a.block.id - b.block.id);

    try {
      this.processing_timer = setInterval(async () => {
        if (this.mempool.blocks.length > 0) {
          if (this.app.blockchain.indexing_active == false) {
            let block = this.mempool.blocks.shift();
            await this.app.blockchain.addBlockToBlockchain(block);
          }
        } else {
          this.processing_active = 0;
          clearInterval(this.processing_timer);
        }
      }, this.processing_speed);
    } catch (err) {
      console.log(err);
    }

  }


  async bundleBlock() {

    //
    // stop if already bundling?
    //
    if (this.bundling_active == true) {
      console.log("ERROR 850293: mempool already bundling a block, not bundling another");
      return;
    }

    //
    // and don't spam the public network
    //
    if (this.mempool.transactions.length == 0) {
      if (!this.app.network.isPrivateNetwork()) {
	if (this.app.network.isProductionNetwork()) {
          console.log("WARNING 582034: refusing to spam public network with no-tx blocks.");
          return;
        }
      }
    }


    //
    // start bundling
    //
    this.bundling_active = true;


    //
    // create block
    //
    try {

      //
      // create the block
      //
      let block = new saito.block(this.app);
      let previous_block_hash = this.app.blockring.returnLatestBlockHash();

      //
      // update its consensus data
      //
      await block.generateFromMempool(this.app.mempool, previous_block_hash);

      //
      // and add to mempool
      //
      this.addBlock(block);

    } catch(err) {
      console.log("ERROR 781029: unexpected problem bundling block in mempool: " + err);
    }

    //
    // reset
    //
    this.bundling_active = false;

  }


  canBundleBlock() {

    if (this.app.mempool.processing_active == true) {
      console.log("CANNOT PRODUCE AS MEMPOOL PROCESSING ACTIVE");
      return false;
    }
    if (this.app.mempool.clearing_active == true) {
      console.log("CANNOT PRODUCE AS MEMPOOL CLEARING ACTIVE");
      return false;
    }
    if (this.mempool.blocks.length > true) {
      console.log("CANNOT PRODUCE AS MEMPOOL BLOCKS WAITING FOR PROCESSING");
      return false;
    }
    if (this.app.mempool.bundling_active == true) {
      console.log("CANNOT PRODUCE AS MEMPOOL BUNDLING ACTIVE");
      return false;
    }
    if (this.mempool.transactions.length == 0 && this.app.blockchain.last_bid > 1) {
      console.log("CANNOT PRODUCE AS MEMPOLL HAS NO TXS AND LAST_BID > 1");
      return false;
    }
    if (this.app.blockchain.indexing_active == true) {
      console.log("CANNOT PRODUCE AS BLOCKCHAIN ACTIVELY INDEXING BLOCK");
      return false;
    }
    if (this.app.blockchain.loading_blocks_from_disk_active == true) {
      console.log("CANNOT PRODUCE AS BLOCKCHAIN LOADING FROM DISK");
      return false;
    }
    if (this.app.network.downloading_active == true) {
      console.log("CANNOT PRODUCE AS NETWORK DOWNLOADING BLOCKS");
      return false;
    }

    if (this.app.options) {
      if (this.app.options.wallet) {
        if (typeof this.app.options.wallet.bundleBlocks == "number" && this.app.options.wallet.bundleBlocks == 0) {
          return false;
        }
      }
      if (this.app.options.peers) {
        if (this.app.options.peers.length > 0 && this.app.blockchain.index.blocks.length == 0) {
          console.log("ERROR: 502843: REFUSING TO SELF-GENERATE BLOCK #1 on PEER CHAIN...");
          return false;
        }
      }
    }


    //
    // made it this far? see if we have enough work
    //
    let previous_block = this.app.blockchain.returnLatestBlock();
    if (previous_block != null) {
      this.routing_work_needed = this.app.burnfee.returnRoutingWorkNeededToProduceBlockInNolan(previous_block.block.burnfee, (new Date().getTime()), previous_block.block.timestamp);
    } else {
      this.routing_work_needed = 0;
    }

    //
    // TODO - optimize so we don't always recalculate
    //
    this.routing_work_in_mempool = parseFloat(this.returnRoutingWorkAvailable());

    console.log("Total Work Needed: " + this.routing_work_needed + " ---- available ---> " + this.routing_work_in_mempool + "     (" + this.app.wallet.returnBalance() + ")");

    if (this.routing_work_in_mempool >= this.routing_work_needed) {
      return 1;
    }
    return 0;


  }

  async initialize() {

    if (this.app.BROWSER == 1) { return; }
    if (this.app.SPVMODE == 1) { return; }

    try {
      this.bundling_timer = setInterval(async () => {
        if (this.canBundleBlock()) {
          await this.bundleBlock();
        }
      }, this.bundling_speed);
    } catch (err) {
      console.log(err);
      this.bundling_active          = false;
      this.bundling_speed           = 1000;
      this.bundling_timer           = null;
    }

/***** TESTING
    let hash = await this.app.crypto.hash("Testing");

console.log("hash: " + hash);

    let bf1 = this.app.burnfee.returnRoutingWorkNeededToProduceBlockInNolan(10, 2 * this.app.burnfee.heartbeat, 0);
    let bf2 = this.app.burnfee.returnRoutingWorkNeededToProduceBlockInNolan(10_0000_0000, 0, 0);
    let bf3 = this.app.burnfee.returnBurnFeeForBlockProducedAtCurrentTimestampInNolan(100_000_000, this.app.burnfee.heartbeat, 0);
    let bf4 = this.app.burnfee.returnBurnFeeForBlockProducedAtCurrentTimestampInNolan(100_000_000, this.app.burnfee.heartbeat / 10, 0);
    let bf4out = Math.round(100_000_000.0 * Math.sqrt(10.0));

console.log("bf1: " + bf1 + " -- " + 0);
console.log("bf2: " + bf2 + " -- " + 10_000_000_000_000_000_000);
console.log("bf3: " + bf3 + " -- " + 100_000_000);
console.log("bf4: " + bf4 + " -- " + bf4out);

*****/

  }



  returnRoutingWorkAvailable() {

    let v = Big(0);

    for (let i = 0; i < this.mempool.transactions.length; i++) {
      if (this.mempool.transactions[i].is_valid == 1) {
        let available_work = Big(this.mempool.transactions[i].returnRoutingWorkAvailableToPublicKey(this.app, this.app.wallet.returnPublicKey()));
        v = v.plus(available_work);
      }
    }
    return v.toFixed(8);

  }


}

module.exports = Mempool;

