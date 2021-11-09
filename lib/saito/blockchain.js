 saito = require('./saito');
const Big = require('big.js');

class Blockchain {

  constructor(app) {

    this.app                   	   = app || {};
    this.genesis_period        	   = 10;

    this.blockring 	       	   = new saito.blockring(this.app, this.genesis_period);  
    this.staking	       	   = new saito.staking(this.app);
    this.blocks                    = {}; // hashmap of block_hash => block

  }


  addBlockToBlockchain(block, force=0) {

    //
    // first things first, ensure hashes OK
    //
    block.generate_hashes();

    //
    // start by extracting some variables that we will use
    // repeatedly in the course of adding this block to the
    // blockchain and our various indices.
    //
    let block_hash = block.returnHash();
    let block_id = block.returnId();
    let previous_block_hash = this.blockring.get_latest_block_hash();

    //
    // sanity checks
    //
    if (this.blocks[block_hash]) {
      console.log("ERROR 581023: block exists in blockchain index");
      return;
    }

    //
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
    if (!this.blockring.containsBlockHashAtBlockId(block_id, block_hash) {
      this.blockring.addBlock(block);
    }

    //
    // blocks are stored in a hashmap indexed by the block_hash. we expect all
    // all block_hashes to be unique, so simply insert blocks one-by-one on
    // arrival if they do not exist.
    //
    if (!this.blocks[block_hash]) {
      this.blocks[block_hash] = block;
    }

    //
    // find shared ancestor of new_block with old_chain
    //
    let new_chain = [];
    let old_chain = [];
    let shared_ancestor_found = false;
    let new_chain_hash = block_hash;
    let old_chain_hash = previous_block_hash;

    while (!shared_ancestor_found) {
      if (self.blocks[new_chain_hash]) {
        if (self.blocks[new_chain_hash].lc == 1) {
          shared_ancestor_found = true;
          break;
        } else {
	  if (new_chain_hash === "") {
	    break;
          }
        }
      }
    }

  }

  addBlockSuccess() {

  }

  addBlockFailure() {

  }

  initialize() {
    this.app.miner.startMining(this.returnLatestBlockHash(), this.returnDifficulty());
  }

  returnDifficulty() {
    return 1;
  }

  returnGenesisPeriod() {
    return this.genesis_period;
  }

  //  TODO fix
  returnLowestSpendableBlock() {
    return 0;
  }

  returnLatestBlock() {
    return null;
  }

  returnLatestBlockHash() {
    return "";
  }

  returnLatestBlockId() {
    return 0;
  }

  unwindChain() {

  }

  windChain() {

  }

}

module.exports = Blockchain;

