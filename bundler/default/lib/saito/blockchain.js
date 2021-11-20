saito = require('./saito');
const Big = require('big.js');
const UtxoSet = require('./utxoset');

class Blockchain {
  constructor(app) {

    this.app                   	   = app || {};

    this.blockchain                    			= {};
    this.blockchain.fork_id            			= "";

    //
    // last in longest_chain
    //
    this.blockchain.last_block_hash    			= "";
    this.blockchain.last_block_id      			= "";
    this.blockchain.last_timestamp     			= new Date().getTime();
    this.blockchain.last_burnfee       			= 0;

    //
    // earliest in epoch
    //
    this.blockchain.genesis_period     			= 10;
    this.blockchain.genesis_block_id   			= 0;
    this.blockchain.genesis_timestamp  			= 0;

    //
    // first received this sync (used to prevent recursive fetch forever)
    //
    this.blockchain.lowest_acceptable_timestamp 	= 0;
    this.blockchain.lowest_acceptable_block_hash 	= "";
    this.blockchain.lowest_acceptable_block_id 		= 0;

    //
    // core components
    //
    this.blockring 	       	   = new saito.blockring(this.app, this.blockchain.genesis_period);
    this.staking	       	   = new saito.staking(this.app);
    this.blocks                    = {}; // hashmap of block_hash => block
    this.utxoset                   = new UtxoSet();


    //
    // downgrade blocks after N blocks
    //
    this.prune_after_blocks = 20;

    //
    // set to true when adding blocks to disk (must be done one at a time!)
    //
    // NOTE: this is set to true on creation so that mempool does not start
    // producing blocks on initialization until the blockchain class as got
    // through its own initialization process and had a chance to load blocks
    // off disk.
    //
    this.indexing_active	     = true;

  }


  async addBlockToBlockchain(block, force=0) {

    //
    // 
    //
    this.indexing_active = true;

    //
    //
    // first things first, ensure hashes OK
    //
    block.generateHashes();

    //
    // start by extracting some variables that we will use
    // repeatedly in the course of adding this block to the
    // blockchain and our various indices.
    //
    let block_hash = block.returnHash();
    let block_id = block.returnId();
    let block_difficulty = block.returnDifficulty();

    let previous_block_hash = this.app.blockring.returnLatestBlockHash();

    //
    // sanity checks
    //
    if (this.isBlockIndexed(block_hash)) {
      console.log("ERROR 581023: block exists in blockchain index");
      this.indexing_active = false;
      return;
    }

    // pre-validation
    //
    // this would be a great place to put in a prevalidation check
    // once we are finished implementing Saito Classic. Goal would
    // be a fast form of lite-validation just to determine that it
    // is worth going through the more general effort of evaluating
    // this block for consensus.
    //

    //
    // save block to disk
    //
    // we have traditionally saved blocks to disk AFTER validating them
    // but this can slow down block propagation. So it may be sensible
    // to start a save earlier-on in the process so that we can relay
    // the block faster serving it off-disk instead of fetching it
    // repeatedly from memory. Exactly when to do this is left as an
    // optimization exercise.
    //

    //
    // insert block into hashmap and index
    //
    // the blockring is a BlockRing which lets us know which blocks (at which depth)
    // form part of the longest-chain. We also use the BlockRing to track information
    // on network congestion (how many block candidates exist at various depths and
    // in the future potentially the amount of work on each viable fork chain.
    //
    // we are going to transfer ownership of the block into the HashMap that stores
    // the block next, so we insert it into our BlockRing first as that will avoid
    // needing to borrow the value back for insertion into the BlockRing.
    //
    if (!this.app.blockring.containsBlockHashAtBlockId(block_id, block_hash)) {
      this.app.blockring.addBlock(block);
    }

    //
    // blocks are stored in a hashmap indexed by the block_hash. we expect all
    // all block_hashes to be unique, so simply insert blocks one-by-one on
    // arrival if they do not exist.
    //
    if (!this.isBlockIndexed(block_hash)) {
      this.blocks[block_hash] = block;
    }

    //
    // find shared ancestor
    //
    let new_chain = [];
    let old_chain = [];
    let shared_ancestor_found = false;
    let new_chain_hash = block_hash;
    let old_chain_hash = previous_block_hash;

    while (!shared_ancestor_found) {
      if (this.blocks[new_chain_hash]) {
        if (this.blocks[new_chain_hash].lc == 1) {
          shared_ancestor_found = true;
          break;
        } else {
	  if (new_chain_hash === "") {
	    break;
          }
        }
        new_chain.push(new_chain_hash);
        new_chain_hash = this.blocks[new_chain_hash].block.previous_block_hash;
      } else {
	break;
      }
    }


    //
    // get old chain
    //
    if (shared_ancestor_found) {
      while (1) {
        if (new_chain_hash === old_chain_hash) { break; }
        if (this.blocks[old_chain_hash]) {
	  old_chain.push(old_chain_hash);
          old_chain_hash = this.blocks[old_chain_hash].block.previous_block_hash;
	  if (old_chain_hash === "") { break; }
          if (new_chain_hash === old_chain_hash) { break; }
        }
      }
    } else {
      //
      // we have a block without a parent.
      //
      if (this.app.blockring.isEmpty()) {
        //
        // no need for action as fall-through will result in proper default
        // behavior. we have the comparison here to separate expected from
        // unexpected / edge-case issues around block receipt.
        //
      } else {
        //
        // if this not our first block, handle edge-case around receiving
        // block 503 before block 453 when block 453 is our expected proper
        // next block and we are getting blocks out-of-order because of
        // connection or network issues.
        //
        console.log("potential edge case requires handling: blocks received out-of-order");
      }
    }



    //
    // at this point we should have a shared ancestor or not
    //
    // does this block require validation?
    //
    let am_i_the_longest_chain = this.isNewChainTheLongestChain(new_chain, old_chain);

    //
    // now update blockring so it is not empty
    //
    // we do this down here instead of automatically on 
    // adding a block, as we want to have the above check
    // for handling the edge-case of blocks received in the
    // wrong order. the longest_chain check also requires a 
    // first-block-received check that is conducted against 
    // the blockring.
    //
    this.app.blockring.is_empty = false;

    //
    // validate
    //
    // blockchain validate "validates" the new_chain by unwinding the old
    // and winding the new, which calling validate on any new previously-
    // unvalidated blocks. When the longest-chain status of blocks changes
    // the function on_chain_reorganization is triggered in blocks and
    // with the BlockRing. We fail if the newly-preferred chain is not
    // viable.
    //
    if (am_i_the_longest_chain) {

      let does_new_chain_validate = await this.validate(new_chain, old_chain);

      if (does_new_chain_validate) {

        await this.addBlockSuccess(block);
        this.blocks[block_hash].lc = 1;

	this.app.connection.emit("BlockchainAddBlockSuccess", block_hash);
	this.app.connection.emit("BlockchainNewLongestChainBlock", { block_hash : block_hash, block_difficulty : block_difficulty});
        this.indexing_active = false;
        return 1;

      } else {

	await this.addBlockFailure(block);
	this.app.connection.emit("BlockchainAddBlockFailure", block_hash);
        this.indexing_active = false;
        return 0;

      }
    } else {

      await this.addBlockSuccess(block);
      this.app.connection.emit("BlockchainAddBlockSuccess", block_hash);
      this.indexing_active = false;
      return 1;

    }

  }


  async addBlockSuccess(block) {

    let block_id = block.returnId();

    //
    // save to disk
    //
    if (!block.isType("Header")) {
      await this.app.storage.saveBlock(block);
    }

    //
    // pre-load for next block
    //
console.log("is our block indexed now? " + this.isBlockIndexed(block.returnHash()));

    //
    // clean up mempool
    //
    this.app.mempool.removeBlockAndTransactions(block);

    //
    //
    //
console.log(block.asReadableString());

  }

  async addBlockFailure(block) {

    //
    // clean up mempool
    //
    this.app.mempool.removeBlockAndTransactions(block);

  }



  //
  // deletes all blocks at a single block_id
  //
  async deleteBlocks(delete_block_id) {
    let block_hashes = this.app.blockring.returnBlockHashesAtBlockId(delete_block_id);
    for (let hash in block_hashes) {
      await this.deleteBlock(delete_block_id, hash);
    }
  }   


  //
  // deletes a single block
  //
  async deleteBlock(delete_block_id, delete_block_hash) {
    //
    // ask block to delete itself / utxo-wise
    //
    let pblock = await this.loadBlockSync(delete_block_hash);

    // 
    // remove slips from wallet
    //
            
    // 
    // removes utxoset data
    //
    //await pblock.delete();
            
    // 
    // deletes block from disk
    //
    //await this.app.storage.deleteBlock(pblock);

    //
    // ask blockring to remove
    //
    //this.app.blockring.deleteBlock(delete_block_id, delete_block_hash);

    //
    // remove from block index
    //
    if (this.isBlockIndexed(delete_block_hash)) {
      delete this.blocks[delete_block_hash];
    }
  }


    async downgradeBlockchainData() {

      //
      // downgrade blocks still on the chain
      //
      if (this.prune_after_blocks > this.app.blockring.returnLatestBlockId()) {
        return;
      }

      let prune_blocks_at_block_id = this.app.blockring.returnLatestBlockId() - this.prune_after_blocks;
      if (prune_blocks_at_block_id < 1) { return; }

      let block_hashes_copy = [];
      let block_hashes = this.app.blockring.returnBlockHashesAtBlockId(prune_blocks_at_block_id);
      for (let hash in block_hashes) { block_hashes_copy.push(hash); }

      for (let hash in block_hashes_copy) {
        //
        // ask block to remove its transactions
        //
        let pblock = await this.self.loadBlockAsync(hash);
        await pblock.downgradeBlockToBlockType("Pruned");
      }

    }



  generateForkId(block_id) {

    let fork_id = new Array(32).fill(0).toString();
    let current_block_id = block_id;

    //
    // roll back to last even 10 blocks
    //
    for (let i = 0; i < 10; i++) {
      if ((current_block_id - i) % 10 === 0) {
        current_block_id -= i;
      }
    }

    let weights = [0, 10, 10, 10, 10, 10, 25, 25, 100, 300, 500, 4000, 10000, 20000, 50000, 100000];

    //
    // loop backwards through blockchain
    //
    for (let i = 0; i < 16; ++i) {

      current_block_id -= weights[i];

      //
      // do not loop around if block id < 0
      //
      if (current_block_id > block_id || current_block_id === 0) {
        break;
      }

      //
      // index to update
      //
      let idx = 2 * i;
      let block_hash = this.blockring.returnLongestChainBlockHashByBlockId(current_block_id);

      forkId[idx] = blockHash[idx];
      forkId[idx + 1] = blockHash[idx + 1];

    }
    return fork_id;
  }


  async updateGenesisPeriod(){

    //
    // we need to make sure this is not a random block that is disconnected
    // from our previous genesis_id. If there is no connection between it
    // and us, then we cannot delete anything as otherwise the provision of
    // the block may be an attack on us intended to force us to discard
    // actually useful data.
    //
    // so we check that our block is the head of the longest-chain and only
    // update the genesis period for the block that should be removed when it 
    // is added to the chain. 
    //
    let latest_block_id = this.app.blockring.returnLatestBlockId();

    if (latest_block_id >= (this.blockchain.genesis_period *2)+1) {

      //
      // we should prune blocks
      //
      let purge_block_id = latest_block_id = (this.blockchain.genesis_period * 2);

      //
      // sanity check
      //
      if (purge_block_id > 0) {

        this.blockchain.genesis_block_id = latest_block_id - this.blockchain.genesis_period;

	//
        // in either case, we are OK to throw out everything below the
        // lowest_block_id that we have found. we use the purge_id to
        // handle purges.
	//
        await this.deleteBlocks(purge_block_id);

      }
    }
  }


  // deletes all blocks at a single block_id
  async deleteBlocks(deletedBlockId) {

    let blockHashesCopy = [];
    let blockHashes = this.blockring.returnBlockHashesAtBlockId(deletedBlockId);
    for (let hash of blockHashes){
      blockHashesCopy.push([...hash]);
    }

    for (let hash of blockHashesCopy){
      await this.deleteBlock(deletedBlockId, hash);
    }
  }

  // deletes a single block
  async deleteBlock(deletedBlockId, deletedBlockHash) {
    //
    // ask block to delete itself / utxo-wise
    // -- need to load data as async
    let block = this.blocks[deletedBlockHash];

    let blockFilename = this.app.storage.generateBlockFilename(block);

    //
    // loop backwards through blockchain
    //

    //
    // remove slips from wallet
    //
    let wallet = this.app.wallet;
    wallet.deleteBlock(block);

    // removes utxoset data
    await block.delete(this.utxoset);

    // deletes block from disk
    this.app.storage.deleteBlockFromDisk(blockFilename);

    // ask blockring to remove
    this.blockring.deleteBlock(deletedBlockId,deletedBlockHash);

    // remove from block index
    if (this.isBlockIndexed(deletedBlockHash))
    {
      delete this.blocks[deletedBlockHash];
    }
  }

  async downgradeBlockchainData() {

    //
    // downgrade blocks
    //
    if (this.prune_after_blocks > this.app.blockring.returnLatestBlockId()) {
      return;
    }
  
    let prune_block_id = this.app.blockring.returnLatestBlockId() - this.prune_after_blocks;
    let block_hashes_copy = [];
    let block_hashes = this.blockring.returnBlockHashesAtBlockId(pruneBlocksAtBlockId);

    for (let hash of block_hashes){
      blockHashesCopy.push([...hash]);
    }

    for (let hash of blockHashesCopy){
      // ask the block to remove its transactions
      await this.blocks[hash].downgradeBlockToBlockType(Block.BlockType.Pruned);
    }
  }


   generateLastSharedAncestor(peer_latest_block_id, fork_id) {

    let my_latest_block_id = this.app.blockring.returnLatestBlockId();

    let pbid = peer_latest_block_id;
    let mbid = my_latest_block_id;
    let weights = [0, 10, 10, 10, 10, 10, 25, 25, 100, 300, 500, 4000, 10000, 20000, 50000, 100000];

    //
    // peer is further ahead
    //
    if (peer_latest_block_id >= my_latest_block_id) {        

      //
      // roll back to last even 10 blocks
      //
      for (let i = 0; i < 10; i++) {
        if ((pbid - i) % 10 == 0) {
          pbid -= i;
          break;
        }
      }

      let current_block_id = pbid;

      //
      // loop backwards through blockchain
      //
      for (let i = 0; i < 16; ++i) {

        current_block_id -= weights[i];

        //
        // do not loop around if block id < 0
        //
        if (current_block_id < mbid && current_block_id > 0) {

          let idx = 2 * i;

          let block_hash = this.app.blockring.returnLongestChainBlockHashByBlockId(pbid);
          if (fork_id[idx] == block_hash[idx] && fork_id[idx + 1] == block_hash[idx + 1]) {
            return current_block_id;
          }

	}
      }

      return 0;

    //
    // peer is not further ahead
    //
    } else {

      //
      // roll back to last even 10 blocks
      //
      for (let i = 0; i < 10; i++) {
        if ((mbid - i) % 10 == 0) {
          mbid -= i;
          break;
        }
      }

      let current_block_id = mbid;

      for (let i = 0; i < 16; ++i) {

        current_block_id -= weights[i];

        //
        // do not loop around if block id < 0
        //
        if (current_block_id <= peer_latest_block_id && current_block_id > 0) {

          //
          // index in fork_id hash
          //
          let idx = 2 * i;

          //
          // compare input hash to my hash
          //
          let block_hash = this.app.blockring.returnLongestChainBlockHashByBlockId(current_block_id);
          if (fork_id[idx] == block_hash[idx] && fork_id[idx + 1] == block_hash[idx + 1]) {
            return current_block_id;
          }
        }
      }

      return 0;

    }
  }


  async initialize() {

    //
    // prevent mempool from producing blocks while we load
    //
    this.app.mempool.bundling_active = true;
    this.indexing_active = false;


    //
    // load blocks from disk
    //
    await this.app.storage.loadBlocksFromDisk(); 


    //
    // and start mining
    //
    this.app.miner.startMining(this.returnLatestBlockHash(), this.returnDifficulty());

    //
    // permit mempool to continue
    //
    this.app.mempool.bundling_active = false;

  }

  isNewChainTheLongestChain(new_chain, old_chain) {

    if (this.app.blockring.isEmpty()) { return true; }
    if (old_chain.length > new_chain.length) { return false; }
    if (this.app.blockring.returnLatestBlockId() >= this.blocks[new_chain[0]].block.id) { return false; }

    let old_bf = BigInt(0);
    let new_bf = BigInt(0);

    for (let i = 0; i < old_chain.length; i++) {
      old_bf += this.blocks[old_chain[i]].block.burnfee;
    }
    for (let i = 0; i < new_chain.length; i++) {
      new_bf += this.blocks[new_chain[i]].block.burnfee;
    }

    //
    // new chain must have more accumulated work AND be longer
    //
    if (old_chain.length < new_chain.length && old_bf <= new_bf) { return true; }

    return false;

  }


  isBlockIndexed(block_hash) {
    if (this.blocks[block_hash]) { return true; }
    return false;
  }

  //
  // TODO - fetch from disk if needed, ergo async
  //
  async loadBlockAsync(block_hash) {
    if (this.blocks[block_hash]) { return this.blocks[block_hash]; }
    return null;
  }

  //
  // keeps any blockchain variables like fork_id or genesis_period 
  // tracking variables updated as the chain gets new blocks. also
  // pre-loads any blocks needed to improve performance.
  //
  async onChainReorganization(block, lc=false) {

    if (lc) {

      //
      // update consensus variables
      //
      this.blockchain.last_block_hash                   = block.returnHash();
      this.blockchain.last_block_id                     = block.returnId();
      this.blockchain.last_timestamp                    = block.returnTimestamp();
      this.blockchain.last_burnfee                      = block.returnBurnFee();

      //
      // update on first received block (used to prevent recursive fetch forever)
      //
      if (this.blockchain.lowest_acceptable_timestamp == 0) {
        this.blockchain.lowest_acceptable_timestamp     = block.returnTimestamp();
        this.blockchain.lowest_acceptable_block_hash    = block.returnHash();
        this.blockchain.lowest_acceptable_block_id      = block.returnId();
      }

      //
      // update genesis period, purge old data
      //
      await this.updateGenesisPeriod(block);

      //
      // generate fork_id
      //
      this.blockchain.fork_id = this.generateForkId(block.returnId());


      //
      // save options
      // 
      this.saveBlockchain();

    }

    await this.downgradeBlockchainData();

  }

  resetBlockchain() {

    //
    // last in longest_chain
    //
    this.blockchain.last_block_hash    			= "";
    this.blockchain.last_block_id      			= "";
    this.blockchain.last_timestamp     			= new Date().getTime();
    this.blockchain.last_burnfee       			= 0;

    //
    // earliest in epoch
    //
    this.blockchain.genesis_block_id   			= 0;
    this.blockchain.genesis_timestamp  			= 0;

    //
    // first received this sync (used to prevent recursive fetch forever)
    //
    this.blockchain.lowest_acceptable_timestamp 	= 0;
    this.blockchain.lowest_acceptable_block_hash 	= "";
    this.blockchain.lowest_acceptable_block_id 		= 0;

    this.saveBlockchain();

  }

  returnDifficulty() {
    return 1;
  }

  returnGenesisPeriod() {
    return this.blockchain.genesis_period;
  }

  //  TODO fix
  returnLowestSpendableBlock() {
    return 0;
  }

  // returns header info as indexed, txs and purged data not guaranteed
  returnLatestBlock() {
    return this.app.blockring.returnLatestBlock();
  }

  returnLatestBlockHash() {
    return this.app.blockring.returnLatestBlockHash();
  }

  returnLatestBlockId() {
    return this.app.blockring.returnLatestBlockId();
  }

  saveBlockchain() {
    this.app.options.blockchain = this.blockchain;
    this.app.storage.saveOptions();
  }

  async unwindChain(new_chain, old_chain, current_wind_index, wind_failure) {

    let block = await this.loadBlockAsync(old_chain[current_unwind_index]);;

    // utxoset update
    block.onChainReorganization(false);
    // blockring update
    this.app.blockring.onChainReorganization(block.returnId(), block.returnHash(), false);
    // staking tables
    let {res_spend, res_unspend, res_delete} = this.staking.onChainReorganization(block, false);
    //this.app.wallet.onChainReorganization(block, false);
    await this.onChainReorganization(block, false);

    //
    // we cannot pass the UTXOSet into the staking object to update as that would
    // require multiple mutable borrows of the blockchain object, so we receive
    // return vectors of the slips that need to be inserted, spent or deleted and
    // handle this after-the-fact. this keeps the UTXOSet up-to-date with whatever
    // is in the staking tables.
    //
    for (let i = 0; i < res_spend.length; i++) {
      //res_spend[i].onChainReorganization(this.app, true, 1);
    }
    for (let i = 0; i < res_unspend.length; i++) {
      //res_unspend[i].onChainReorganization(this.app, true, 0);
    }
    for (let i = 0; i < res_delete.length; i++) {
      //res_spend[i].delete(this.app);
    }

    if (current_unwind_index == old_chain.length - 1) {

      //
      // start winding new chain
      //
      // new_chain --> adds the hashes in this order
      //   [5] [4] [3] [2] [1]
      //
      // old_chain --> adds the hashes in this order
      //   [4] [3] [2] [1]
      //
      // winding requires starting at the END of the vector and rolling
      // backwards until we have added block #5, etc.
      //
      let res = await this.windChain(new_chain, old_chain, new_chain.length - 1, wind_failure);
      return res;

    } else {
      //
      // continue unwinding,, which means
      //
      // unwinding requires moving FORWARD in our vector (and backwards in
      // the blockchain). So we increment our unwind index.
      //
      let res = await this.unwindChain(new_chain, old_chain, current_unwind_index + 1, wind_failure);
      return res;
    }
  }



  async updateGenesisPeriod(longest_chain_block) {

    //
    // we need to make sure this is not a random block that is disconnected
    // from our previous genesis_id. If there is no connection between it
    // and us, then we cannot delete anything as otherwise the provision of
    // the block may be an attack on us intended to force us to discard
    // actually useful data.
    //
    // so we check that our block is the head of the longest-chain and only
    // update the genesis period when that is the case.
    //
    let latest_block_id = longest_chain_block.returnId();
    if (latest_block_id >= ((this.returnGenesisPeriod() * 2) + 1)) {

      //
      // prune blocks
      //
      let purge_bid = latest_block_id - (this.returnGenesisPeriod() * 2);
      this.blockchain.genesis_block_id = latest_block_id - this.returnGenesisPeriod();

      //
      // in either case, we are OK to throw out everything below the
      // lowest_block_id that we have found. we use the purge_id to
      // handle purges.
      //
      await this.deleteBlocks(purge_bid);

      //
      // update blockchain consensus variables
      //
      this.blockchain.genesis_block_id   			= purge_bid+1;
      this.blockchain.genesis_block_hash   			= this.app.blockring.returnLongestChainBlockHashAtBlockId(purge_bid+1);
      let genesis_block 				        = this.blocks[this.blockchain.genesis_block_hash];
      if (genesis_block) { this.blockchain.genesis_timestamp  	= genesis_block.returnTimestamp(); }

    }

  }


  async validate(new_chain, old_chain) {

    //
    // ensure adequate mining support
    //
    let golden_tickets_found = 0;
    let search_depth_idx = 0;
    let latest_block_hash = new_chain[0];

    let MIN_GOLDEN_TICKETS_NUMERATOR = 2;
    let MIN_GOLDEN_TICKETS_DENOMINATOR = 6;

    //
    // make sure we have enough golden tickets
    //
    for (let i = 0; i < MIN_GOLDEN_TICKETS_DENOMINATOR; i++) {

      search_depth_idx += 1;

      if (this.blocks[latest_block_hash]) {

        let block = this.blocks[latest_block_hash];

        if (i == 0) {
          if (block.returnId() < MIN_GOLDEN_TICKETS_DENOMINATOR) {
	    golden_tickets_found = MIN_GOLDEN_TICKETS_DENOMINATOR;
	    break;
          }
        }

        if (block.hasGoldenTicket()) {
          golden_tickets_found += 1;
        }

        latest_block_hash = block.returnPreviousBlockHash();

      } else {
        break;
      }
    }

    //
    // make sure we have enough golden tickets
    //
    if (golden_tickets_found < MIN_GOLDEN_TICKETS_NUMERATOR && search_depth_idx >= MIN_GOLDEN_TICKETS_DENOMINATOR) {
      if (this.blocks[new_chain[0]]) {
	if (this.blocks[new_chain[0]].hasGoldenTicket()) {
	  golden_tickets_found++;
	}
      }
    }
    if (golden_tickets_found < MIN_GOLDEN_TICKETS_NUMERATOR) { 
      return false;
    }

    if (old_chain.length == 0) {
      return await this.windChain(new_chain, old_chain, new_chain.length-1, false);
    } else {
      if (new_chain.length > 0) {
        return await this.unwindChain(new_chain, old_chain, 0, true);
      } else {
	return false;
      }
    }

  }

  async windChain(new_chain, old_chain, current_wind_index, wind_failure) {

    //
    // if we are winding a non-existent chain with a wind_failure it
    // means our wind attempt failed and we should move directly into
    // add_block_failure() by returning false.
    //
    if (wind_failure == true && new_chain.length == 0) { return false; }

    //
    // winding the chain requires us to have certain data associated
    // with the block and the transactions, particularly the tx hashes
    // that we need to generate the slip UUIDs and create the tx sigs.
    //
    // we fetch the block mutably first in order to update these vars.
    // we cannot just send the block mutably into our regular validate()
    // function because of limitatins imposed by Rust on mutable data
    // structures. So validation is "read-only" and our "write" actions
    // happen first.
    //
    let block = await this.loadBlockAsync(new_chain[current_wind_index]);

    let latest_block_id = block.returnId();

    //
    // ensure previous blocks that may be needed to calculate the staking
    // tables or the nolan that are potentially falling off the chain have
    // full access to their transaction data.
    //
    let MAX_STAKER_RECURSION = 3; // current block + 2 payouts

    for (let i = 0; i < MAX_STAKER_RECURSION; i++) {
      if (i >= latest_block_id) { break; }
      let bid = latest_block_id - i;
      let previous_block_hash = this.app.blockring.returnLongestChainBlockHashByBlockId(bid);
      if (this.isBlockIndexed(previous_block_hash)) {
        let previous_block = await this.loadBlockAsync(previous_block_hash);
        await previous_block.upgradeBlockToBlockType("Full");
      }
    }


    let does_block_validate = await block.validate();

console.log("does block validate? " + does_block_validate);

    if (does_block_validate) {

      // update so block_id and block_hash updates
      this.app.blockring.onChainReorganization(block.returnId(), block.returnHash(), true);

      // utxoset update
      //block.onChainReorganization(true);
      let {res_spend, res_unspend, res_delete} = this.staking.onChainReorganization(block, true);
      //this.app.wallet(onChainReorganization(block, true);

      //
      // TODO - do we want async on this?
      //
      await this.onChainReorganization(block, true);

      //
      // we cannot pass the UTXOSet into the staking object to update as that would
      // require multiple mutable borrows of the blockchain object, so we receive
      // return vectors of the slips that need to be inserted, spent or deleted and
      // handle this after-the-fact. this keeps the UTXOSet up-to-date with whatever
      // is in the staking tables.
      //
      // this is actually not a problem in Javascript, but we are handling the same
      // way as Rust in order to maintain consistency in approach across our two
      // major codebases.
      //
      for (let i = 0; i < res_spend.length; i++) {
        //res_spend[i].onChainReorganization(this.app, true, 1);
      }
      for (let i = 0; i < res_unspend.length; i++) {
        //res_unspend[i].onChainReorganization(this.app, true, 0);
      }
      for (let i = 0; i < res_delete.length; i++) {
        //res_spend[i].delete(this.app);
      }

      //
      // we have received the first entry in new_blocks() which means we
      // have added the latest tip. if the variable wind_failure is set
      // that indicates that we ran into an issue when winding the new_chain
      // and what we have just processed is the old_chain (being rewound)
      // so we should exit with failure.
      //
      // otherwise we have successfully wound the new chain, and exit with
      // success.
      //
      if (current_wind_index == 0) {
        if (wind_failure) { return false; }
        return true;
      }
      let res = await self.windChain(new_chain, old_chain, current_wind_index - 1, false);
      return res;

    } else {

      //
      // we have had an error while winding the chain. this requires us to
      // unwind any blocks we have already wound, and rewind any blocks we
      // have unwound.
      //
      // we set wind_failure to "true" so that when we reach the end of
      // the process of rewinding the old-chain, our wind_chain function
      // will know it has rewound the old chain successfully instead of
      // successfully added the new chain.
      //
      if (current_wind_index == new_chain.length - 1) {

        //
        // this is the first block we have tried to add
        // and so we can just roll out the older chain
        // again as it is known good.
        //
        // note that old and new hashes are swapped
        // and the old chain is set as null because
        // we won't move back to it. we also set the
        // resetting_flag to 1 so we know to fork
        // into addBlockToBlockchainFailure
        //
        // true -> force -> we had issues, is failure
        //
        // new_chain --> hashes are still in this order
        //   [5] [4] [3] [2] [1]
        //
        // we are at the beginning of our own vector so we have nothing
        // to unwind. Because of this, we start WINDING the old chain back
        // which requires us to start at the END of the new chain vector.
        //
        if (old_chain.length > 0) {
          let res = await this.windChain(old_chain, new_chain, old_chain.len() - 1, true);
	  return res;
        } else {
          return false;
        }
      } else {

        let chain_to_unwind = [];

        //
        // if we run into a problem winding our chain after we have
        // wound any blocks, we take the subset of the blocks we have
        // already pushed through on_chain_reorganization (i.e. not
        // including this block!) and put them onto a new vector we
        // will unwind in turn.
        //
        for (let i = current_wind_index + 1; i < new_chain.length; i++) {
          chain_to_unwind.push(new_chain[i]);
        }

        //
        // chain to unwind is now something like this...
        //
        //  [3] [2] [1]
        //
        // unwinding starts from the BEGINNING of the vector
        //
        let res = await this.unwindChain(old_chain, chain_to_unwind, 0, true);
        return res;
      }
    }
  }

}

module.exports = Blockchain;

