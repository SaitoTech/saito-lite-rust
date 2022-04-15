import { Saito } from "../../apps/core";
import Block, { BlockType } from "./block";

class Blockchain {
  public app: Saito;
  public blockchain = {
    fork_id: "",

    // last in longest_chain
    last_block_hash: "",
    last_block_id: 0,
    last_timestamp: new Date().getTime(),
    last_burnfee: 0,

    // earliest in epoch
    genesis_period: 100000,
    genesis_block_id: 0,
    genesis_timestamp: 0,
    genesis_block_hash: "",

    // first received this sync (used to prevent recursive fetch forever)
    lowest_acceptable_timestamp: 0,
    lowest_acceptable_block_hash: "",
    lowest_acceptable_block_id: 0,

    // set dynamically on load to avoid duplicating callbacks
    last_callback_block_id: 0,
  };
  // public blockring: Blockring;
  // public staking: Staking;
  public blocks: Map<string, Block>;
  // public utxoset: any;
  public prune_after_blocks: number;
  public indexing_active: boolean;
  public run_callbacks: any;
  public callback_limit: number;
  public res_spend: any;
  public res_unspend: any;
  public res_delete: any;

  constructor(app: Saito) {
    this.app = app;

    //
    // core components
    //
    // this.blockring = new Blockring(this.app, this.blockchain.genesis_period);
    // this.staking = new Staking(this.app);
    this.blocks = new Map<string, Block>(); // hashmap of block_hash => block
    // this.utxoset = new UtxoSet();

    //
    // downgrade blocks after N blocks
    //
    this.prune_after_blocks = 6;

    //
    // set to true when adding blocks to disk (must be done one at a time!)
    //
    // NOTE: this is set to true on creation so that mempool does not start
    // producing blocks on initialization until the blockchain class as got
    // through its own initialization process and had a chance to load blocks
    // off disk.
    //
    this.indexing_active = true;

    //
    // set to zero to disable module execution
    //
    this.run_callbacks = 1;
    this.callback_limit = 2; // 2 blocks
  }

  addGhostToBlockchain(
    id = 0,
    previous_block_hash = "",
    ts = 0,
    prehash = "",
    gt = false,
    hash = ""
  ) {
    this.indexing_active = true;

    ////////////////////
    // insert indexes //
    ////////////////////
    let block = new Block(this.app);
    block.block.id = id;
    block.block.previous_block_hash = previous_block_hash;
    block.block.timestamp = ts;
    block.has_golden_ticket = gt;
    block.prehash = prehash;
    block.hash = hash;
    block.block_type = BlockType.Ghost;

    //
    // sanity checks
    //
    if (this.isBlockIndexed(block.hash)) {
      console.error("ERROR 581023: block exists in blockchain index");
      this.indexing_active = false;
      return;
    }

    if (!this.app.blockring.containsBlockHashAtBlockId(block.block.id, block.hash)) {
      this.app.blockring.addBlock(block);
    }

    //
    // blocks are stored in a hashmap indexed by the block_hash. we expect all
    // all block_hashes to be unique, so simply insert blocks one-by-one on
    // arrival if they do not exist.
    //
    if (!this.isBlockIndexed(block.hash)) {
      this.blocks[block.hash] = block;
    }

    // update longest-chain
    this.indexing_active = false;
    return;
  }

  async addBlockToBlockchain(block, force = 0) {
    //
    //
    //
    this.indexing_active = true;

    //
    //
    // first things first, ensure hashes OK
    //
    block.generateHashes();

    console.log("blockchain.addBlockToBlockchain : " + block.returnHash());
    //console.debug(this);

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
      console.error("ERROR 581023: block exists in blockchain index");
      this.indexing_active = false;
      return;
    }

//
// IS GB INDEXED?
//
if (this.app.blockchain.blockchain.genesis_block_hash !== "") {
  console.log("=== IS GENESIS BLOCK INDEXED ===");
  console.log(this.isBlockIndexed(this.app.blockchain.blockchain.genesis_block_hash));
}


    // check if previous block exists and if not fetch that block.
    let parent_block_hash = block.block.previous_block_hash;
    if (!this.app.blockring.isEmpty() && !this.isBlockIndexed(parent_block_hash)) {
      console.log("fetching unknown block: " + parent_block_hash);
      if (!parent_block_hash) {
        console.log("hash is empty for parent: ", block.returnHash());
      } else {
        console.log("parent block hash is not indexed...");
        await this.app.network.fetchBlock(parent_block_hash);
      }
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
    let am_i_the_longest_chain = 0;

    while (!shared_ancestor_found) {
      if (this.blocks[new_chain_hash]) {
        if (this.blocks[new_chain_hash].lc === 1) {
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
      while (new_chain_hash !== old_chain_hash) {
        if (this.blocks[old_chain_hash]) {
          old_chain.push(old_chain_hash);
          old_chain_hash = this.blocks[old_chain_hash].block.previous_block_hash;
          if (old_chain_hash === "") {
            break;
          }
          if (new_chain_hash === old_chain_hash) {
            break;
          }
        } else {
          //
          // this is an edge case where we simply do not have the old block
          // in our case. we should be a lite-client that is syncing to the
          // chain and does not have the block synced.
          break;
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
        if (
          block.block.previous_block_hash === this.blockchain.last_block_hash &&
          block.block.previous_block_hash !== ""
        ) {
          //
          // NOTE - requires testing
          //
          console.log("potential edge case requires handling: blocks received out-of-order");

          let disconnected_block_id = this.app.blockring.returnLatestBlockId();

          for (let i = block.returnId() + 1; i < disconnected_block_id; i++) {
            let disconnected_block_hash =
              this.app.blockring.returnLongestChainBlockHashAtBlockId(i);
            if (disconnected_block_hash) {
              this.app.blockring.onChainReorganization(i, disconnected_block_hash, false);
              let disconnected_block = await this.loadBlockAsync(disconnected_block_hash);
              if (disconnected_block) {
                disconnected_block.lc = 0;
              }
            }
          }

          new_chain = [];
          new_chain.push(block.returnHash());
          am_i_the_longest_chain = 1;
        }
      }
    }

    //
    // at this point we should have a shared ancestor or not
    //
    // does this block require validation?
    //
    if (!am_i_the_longest_chain) {
      if (this.isNewChainTheLongestChain(new_chain, old_chain)) {
        am_i_the_longest_chain = 1;
      }
    }
    if (am_i_the_longest_chain) {
      block.lc = 1;
    }
    block.force = force;

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
        this.app.connection.emit("BlockchainNewLongestChainBlock", {
          block_hash: block_hash,
          difficulty: block_difficulty,
        });
        this.indexing_active = false;
        return 1;
      } else {
        await this.addBlockFailure(block);
        this.blocks[block_hash].lc = 0;
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
    //console.log("blockchain.addBlockSuccess : ", block.returnHash());
    //this.app.blockring.print();

    let block_id = block.returnId();

    //
    // save to disk
    //
    if (!block.isType("Header")) {
      await this.app.storage.saveBlock(block);
    }

    //
    // set genesis block hash if block #1
    //
    if (this.app.blockchain.blockchain.genesis_block_hash === "") {
console.log("setting our genesis block hash to first hash received!");
      this.app.blockchain.blockchain.genesis_block_hash = block.returnHash();
    }


    //
    // pre-load for next block
    //

    //
    // clean up mempool
    //
    this.app.mempool.removeBlockAndTransactions(block);

    //
    // propagate block to network
    //
    this.app.network.propagateBlock(block);

    //
    // run callbacks if desired
    //
    let already_processed_callbacks = 0;
    if (block_id <= this.blockchain.last_callback_block_id) {
      already_processed_callbacks = 1;
    }
    if (this.run_callbacks === 1 && already_processed_callbacks === 0) {
      //
      // this block is initialized with zero-confs processed
      //
      block.affixCallbacks();

      //
      // don't run callbacks if reloading (force!)
      //
      if (block.lc === 1 && block.force !== 1) {
        let block_id_from_which_to_run_callbacks = block.returnId() - this.callback_limit + 1;
        let block_id_in_which_to_delete_callbacks = block.returnId() - this.prune_after_blocks;
        if (block_id_from_which_to_run_callbacks <= 0) {
          block_id_from_which_to_run_callbacks = 1;
        }
        if (block_id_from_which_to_run_callbacks <= block_id_in_which_to_delete_callbacks) {
          block_id_from_which_to_run_callbacks = block_id_from_which_to_run_callbacks + 1;
        }

        //console.log(
        //  "block_id_from_which_to_run_callbacks: " + block_id_from_which_to_run_callbacks
        //);
        //console.log(
        //  "block_id_in_which_to_delete_callbacks: " + block_id_in_which_to_delete_callbacks
        //);

        if (block_id_from_which_to_run_callbacks > 0) {
          for (let i = block_id_from_which_to_run_callbacks; i <= block.returnId(); i++) {
            let blocks_back = block.returnId() - i;
            let this_confirmation = blocks_back + 1;
            let run_callbacks = 1;

            //
            // if bid is less than our last-bid but it is still
            // the biggest BID we have, then we should avoid
            // running callbacks as we will have already run
            // them. We check TS as sanity check as well.
            //
            if (block.returnId() < this.blockchain.last_block_id) {
              if (block.returnTimestamp() < this.blockchain.last_timestamp) {
                if (block.lc === 1) {
                  run_callbacks = 0;
                }
              }
            }

            if (run_callbacks === 1) {
              let callback_block_hash = this.app.blockring.returnLongestChainBlockHashAtBlockId(i);
              if (callback_block_hash !== "") {
                let callback_block = this.blocks[callback_block_hash];
                if (callback_block) {
                  await callback_block.runCallbacks(this_confirmation);
                }
              }
            }
          }
        }

        //
        // delete callbacks as appropriate to save memory
        //
        if (block_id_in_which_to_delete_callbacks >= 0) {
          let callback_block_hash = this.app.blockring.returnLongestChainBlockHashAtBlockId(
            block_id_in_which_to_delete_callbacks + 1 // because block ring starts from 1
          );
          let callback_block = this.blocks[callback_block_hash];
          if (callback_block) {
            callback_block.callbacks = [];
            callback_block.callbackTxs = [];
          }
        }
      }

      //
      // callback
      //
      this.app.modules.onNewBlock(block, true /*i_am_the_longest_chain*/); // TODO : undefined i_am_the_longest_chain ???
    }
  }

  async addBlockFailure(block) {
    console.log("FAILURE: " + block.returnHash());
    //
    // clean up mempool
    //
    this.app.mempool.removeBlockAndTransactions(block);
  }

  //
  // deletes all blocks at a single block_id
  //
  async deleteBlocks(delete_block_id: number) {
    let block_hashes = this.app.blockring.returnBlockHashesAtBlockId(delete_block_id);
    console.debug("blockchain.deleteBlocks : " + delete_block_id, block_hashes);
    for (let i = 0; i < block_hashes.length; i++) {
      if (this.blocks[block_hashes[i]]) {
        if (this.blocks[block_hashes[i]].returnId() === delete_block_id) {
          await this.deleteBlock(delete_block_id, block_hashes[i]);
        }
      }
    }
  }

  async downgradeBlockchainData() {
    console.debug("blockchain.downgradeBlockchainData");
    //
    // downgrade blocks still on the chain
    //
    if (this.prune_after_blocks > this.app.blockring.returnLatestBlockId()) {
      return;
    }

    let prune_blocks_at_block_id =
      this.app.blockring.returnLatestBlockId() - this.prune_after_blocks;
    if (prune_blocks_at_block_id < 1) {
      return;
    }

    let block_hashes_copy = [];
    let block_hashes = this.app.blockring.returnBlockHashesAtBlockId(prune_blocks_at_block_id);

    for (let i = 0; i < block_hashes.length; i++) {
      if (this.blocks[block_hashes[i]]) {
        if (prune_blocks_at_block_id >= this.blocks[block_hashes[i]].returnId()) {
          block_hashes_copy.push(block_hashes[i]);
        }
      }
    }

    for (let i = 0; i < block_hashes_copy.length; i++) {
      //
      // ask block to remove its transactions
      //
      let hash = block_hashes_copy[i];

      let pblock = await this.loadBlockAsync(hash);
      await pblock.downgradeBlockToBlockType("Pruned");
    }
  }

  generateForkId(block_id) {
    let fork_id = [];
    for (let i = 0; i < 32; i++) {
      fork_id[i] = "0";
    }
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
      if (current_block_id > block_id || current_block_id <= 0) {
        break;
      }

      //
      // index to update
      //
      let idx = 2 * i;
      let block_hash = this.app.blockring.returnLongestChainBlockHashByBlockId(current_block_id);

      if (block_hash[idx]) {
        fork_id[idx] = block_hash[idx];
        fork_id[idx + 1] = block_hash[idx + 1];
      }
    }

    let fork_id_str = "";
    for (let i = 0; i < fork_id.length; i++) {
      fork_id_str += fork_id[i];
    }
    return fork_id_str;
  }

  // deletes a single block
  async deleteBlock(deletedBlockId: number, deletedBlockHash: string) {
    console.debug("blockchain.deleteBlock : " + deletedBlockId + " : " + deletedBlockHash);
    //
    // ask block to delete itself / utxo-wise
    // -- need to load data as async
    let block = await this.loadBlockAsync(deletedBlockHash);
    if (!block) {
      console.trace("deleting non-existing block : " + deletedBlockHash);
    }

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
    await block.deleteBlock(this.app.utxoset);

    // deletes block from disk
    this.app.storage.deleteBlockFromDisk(blockFilename);

    // ask blockring to remove
    this.app.blockring.deleteBlock(block);

    // remove from block index
    if (this.isBlockIndexed(deletedBlockHash)) {
      delete this.blocks[deletedBlockHash];
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
        //if ((pbid - BigInt(i)) % BigInt(10) === BigInt(0)) {
        //  pbid -= BigInt(i);
        if ((pbid - i) % 10 === 0) {
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
          if (fork_id[idx] === block_hash[idx] && fork_id[idx + 1] === block_hash[idx + 1]) {
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
        if ((mbid - i) % 10 === 0) {
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
          let block_hash =
            this.app.blockring.returnLongestChainBlockHashByBlockId(current_block_id);
          if (fork_id[idx] === block_hash[idx] && fork_id[idx + 1] === block_hash[idx + 1]) {
            return current_block_id;
          }
        }
      }

      return 0;
    }
  }

  async initialize() {
    //
    // load blockchain from options if exists
    //
    if (this.app?.options?.blockchain) {
      this.blockchain = this.app.options.blockchain;
      this.blockchain.last_callback_block_id = this.blockchain.last_block_id;
    }

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
    if (this.app.blockring.isEmpty()) {
      return true;
    }
    if (old_chain.length > new_chain.length) {
      return false;
    }
    if (this.app.blockring.returnLatestBlockId() >= this.blocks[new_chain[0]].block.id) {
      return false;
    }

    let old_bf = BigInt(0);
    let new_bf = BigInt(0);

    for (let i = 0; i < old_chain.length; i++) {
      old_bf += BigInt(this.blocks[old_chain[i]].block.burnfee);
    }
    for (let i = 0; i < new_chain.length; i++) {
      new_bf += BigInt(this.blocks[new_chain[i]].block.burnfee);
    }

    //
    // new chain must have more accumulated work AND be longer
    //
    return old_chain.length < new_chain.length && old_bf <= new_bf;
  }

  isBlockIndexed(block_hash) {
    return !!this.blocks[block_hash];
  }

  async loadBlockAsync(block_hash: string) {
    if (!block_hash) return null;
    if (typeof window === "undefined") {
      if (this.blocks[block_hash] && this.blocks[block_hash].block_type === BlockType.Full) {
        return this.blocks[block_hash];
      }
      console.debug(`loading block from disk : ${block_hash}`);
      let block = await this.app.storage.loadBlockByHash(block_hash);
      if (!block) {
        console.warn(`block is not found in disk : ${block_hash}`);
        return null;
      }
      block.block_type = BlockType.Full;
      return block;
    } else {
      if (this.blocks[block_hash]) {
        return this.blocks[block_hash];
      }
    }

    return null;
  }

  //
  // keeps any blockchain variables like fork_id or genesis_period
  // tracking variables updated as the chain gets new blocks. also
  // pre-loads any blocks needed to improve performance.
  //
  async onChainReorganization(block, lc = false) {
    //
    // skip out if earlier than we need to be vis-a-vis last_block_id
    //
    if (this.blockchain.last_block_id >= block.returnId()) {
      return;
    }

    if (lc) {
      //
      // update consensus variables
      //
      this.blockchain.last_block_hash = block.returnHash();
      this.blockchain.last_block_id = block.returnId();
      this.blockchain.last_timestamp = block.returnTimestamp();
      this.blockchain.last_burnfee = block.returnBurnFee();

      //
      // update on first received block (used to prevent recursive fetch forever)
      //
      if (this.blockchain.lowest_acceptable_timestamp === 0) {
        this.blockchain.lowest_acceptable_timestamp = block.returnTimestamp();
        this.blockchain.lowest_acceptable_block_hash = block.returnHash();
        this.blockchain.lowest_acceptable_block_id = block.returnId();
      }

      //
      // downgrade before update genesis period, as that deletes blocks
      //
      await this.downgradeBlockchainData();

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
  }

  resetBlockchain() {
    //
    // last in longest_chain
    //
    this.blockchain.last_block_hash = "";
    this.blockchain.last_block_id = 0;
    this.blockchain.last_timestamp = new Date().getTime();
    this.blockchain.last_burnfee = 0;

    //
    // earliest in epoch
    //
    this.blockchain.genesis_block_id = 0;
    this.blockchain.genesis_timestamp = 0;

    //
    // first received this sync (used to prevent recursive fetch forever)
    //
    this.blockchain.lowest_acceptable_timestamp = 0;
    this.blockchain.lowest_acceptable_block_hash = "";
    this.blockchain.lowest_acceptable_block_id = 0;

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

  async unwindChain(new_chain, old_chain, current_unwind_index, wind_failure) {
    let block = await this.loadBlockAsync(old_chain[current_unwind_index]);

    // utxoset update
    block.onChainReorganization(false);
    // blockring update
    this.app.blockring.onChainReorganization(block.returnId(), block.returnHash(), false);
    // staking tables
    let { res_spend, res_unspend, res_delete } = this.app.staking.onChainReorganization(
      block,
      false
    );
    this.app.wallet.onChainReorganization(block, false);
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

    if (current_unwind_index === old_chain.length - 1) {
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
      return await this.windChain(new_chain, old_chain, new_chain.length - 1, wind_failure);
    } else {
      //
      // continue unwinding,, which means
      //
      // unwinding requires moving FORWARD in our vector (and backwards in
      // the blockchain). So we increment our unwind index.
      //
      return await this.unwindChain(new_chain, old_chain, current_unwind_index + 1, wind_failure);
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
    const latest_block_id: number = longest_chain_block.returnId();
    if (latest_block_id >= this.returnGenesisPeriod() * 2 + 1) {
      //
      // prune blocks
      //
      const purge_block_id: number = latest_block_id - this.returnGenesisPeriod() * 2;
      this.blockchain.genesis_block_id = latest_block_id - this.returnGenesisPeriod();

      //
      // in either case, we are OK to throw out everything below the
      // lowest_block_id that we have found. we use the purge_id to
      // handle purges.
      //
      if (purge_block_id > 0) {
        await this.deleteBlocks(purge_block_id);

        //
        // update blockchain consensus variables
        //
        this.blockchain.genesis_block_id = purge_block_id + 1;
        this.blockchain.genesis_block_hash =
          this.app.blockring.returnLongestChainBlockHashAtBlockId(purge_block_id + 1);
        const genesis_block = this.blocks[this.blockchain.genesis_block_hash];
        if (genesis_block) {
          this.blockchain.genesis_timestamp = genesis_block.returnTimestamp();
        }
      }
    }
  }

  async doesChainMeetGoldenTicketRequirements(
    previous_block_hash,
    current_block_has_golden_ticket = false
  ) {
    //
    // ensure adequate mining support
    //
    let golden_tickets_found = 0;
    let search_depth_idx = 0;
    let latest_block_hash = previous_block_hash;

    let MIN_GOLDEN_TICKETS_NUMERATOR = 2;
    let MIN_GOLDEN_TICKETS_DENOMINATOR = 6;

    //
    // make sure we have enough golden tickets
    //
    for (let i = 0; i < MIN_GOLDEN_TICKETS_DENOMINATOR; i++) {
      search_depth_idx += 1;

      if (this.blocks[latest_block_hash]) {
        let block: Block = this.blocks[latest_block_hash];

        if (i === 0) {
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
    if (
      golden_tickets_found < MIN_GOLDEN_TICKETS_NUMERATOR &&
      search_depth_idx >= MIN_GOLDEN_TICKETS_DENOMINATOR
    ) {
      if (current_block_has_golden_ticket) {
        golden_tickets_found++;
      }
    }

    if (
      golden_tickets_found < MIN_GOLDEN_TICKETS_NUMERATOR &&
      search_depth_idx >= MIN_GOLDEN_TICKETS_DENOMINATOR
    ) {
      console.log(
        "not enough golden tickets: " + golden_tickets_found + " --- " + search_depth_idx
      );
      //
      // TODO - browsers might want to implement this check somehow
      //
      if (this.app.BROWSER != 1 && this.app.SPVMODE == 0) {
        return false;
      }
    }

    return true;
  }

  async validate(new_chain, old_chain) {
    let block = this.blocks[new_chain[0]];
    let previous_block_hash = block.returnPreviousBlockHash();

    let does_chain_meet_golden_ticket_requirements =
      await this.doesChainMeetGoldenTicketRequirements(
        previous_block_hash,
        block.hasGoldenTicket()
      );

    if (!does_chain_meet_golden_ticket_requirements) {
      console.log("not enough golden tickets!");
      return false;
    }

    if (old_chain.length === 0) {
      return await this.windChain(new_chain, old_chain, new_chain.length - 1, false);
    } else {
      if (new_chain.length > 0) {
        return await this.unwindChain(new_chain, old_chain, 0, true);
      } else {
        console.log("lengths are inappropriate");
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
    if (wind_failure === true && new_chain.length === 0) {
      return false;
    }

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
      if (i >= latest_block_id) {
        break;
      }
      let bid = latest_block_id - i;

      //
      // bid starts from the latest block, which will not have its blockring
      // lc_pos variable correctly set yet, and thus can return the incorrect
      // block_hash when fetching the previous_block_hash. so we want to
      // skip loading the previous_block_hash if this is the same as the
      // latest_block_id;
      //
      let insert_pos = bid % this.app.blockring.ring_buffer_length;

      let previous_block_hash;

      if (i == 0) {
        previous_block_hash = block.returnPreviousBlockHash();
      } else {
        previous_block_hash = this.app.blockring.returnLongestChainBlockHashByBlockId(bid);
      }

      if (this.isBlockIndexed(previous_block_hash)) {
        let previous_block = await this.loadBlockAsync(previous_block_hash);
        await previous_block.upgradeBlockToBlockType("Full");
      }
    }

    let does_block_validate = await block.validate();

    if (does_block_validate) {
      // update so block_id and block_hash updates
      this.app.blockring.onChainReorganization(block.returnId(), block.returnHash(), true);

      // utxoset update
      //block.onChainReorganization(true);
      let { res_spend, res_unspend, res_delete } = this.app.staking.onChainReorganization(
        block,
        true
      );
      this.app.wallet.onChainReorganization(block, true);

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
      if (current_wind_index === 0) {
        return !wind_failure;
      }
      return await this.windChain(new_chain, old_chain, current_wind_index - 1, false);
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
      if (current_wind_index === new_chain.length - 1) {
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
          return await this.windChain(old_chain, new_chain, old_chain.len() - 1, true);
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
        return await this.unwindChain(old_chain, chain_to_unwind, 0, true);
      }
    }
  }
}

export default Blockchain;
