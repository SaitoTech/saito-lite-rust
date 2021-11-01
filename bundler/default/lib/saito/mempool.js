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
    this.blocks                   = [];
    this.transactions             = [];

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


  canBundleBlock() {

    if (this.app.mempool.processing_active == true) {
      console.log("CANNOT PRODUCE AS MEMPOOL PROCESSING ACTIVE");
      return false;
    }
    if (this.app.mempool.clearing_active == true) {
      console.log("CANNOT PRODUCE AS MEMPOOL CLEARING ACTIVE");
      return false;
    }
    if (this.app.mempool.blocks.length > true) {
      console.log("CANNOT PRODUCE AS MEMPOOL BLOCKS WAITING FOR PROCESSING");
      return false;
    }
    if (this.app.mempool.bundling_active == true) {
      console.log("CANNOT PRODUCE AS MEMPOOL BUNDLING ACTIVE");
      return false;
    }
    if (this.transactions.length == 0 && this.app.blockchain.last_bid > 1) {
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

    let previous_block = this.app.blockchain.returnLatestBlock();
    if (previous_block != null) {
      this.routing_work_needed = this.app.burnfee.returnWorkNeeded(prevblk.block.ts, (new Date().getTime()), prevblk.block.bf);
    } else {
      this.routing_work_needed = this.app.burnfee.returnWorkNeeded();
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

  initialize() {

    let bf1 = this.app.burnfee.returnRoutingWorkNeededToProduceBlockInNolan(10, 2 * this.app.burnfee.heartbeat, 0);

console.log("bf1: " + bf1);

  }



}

module.exports = Mempool;

