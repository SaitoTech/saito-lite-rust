const Big = require('big.js');
const saito = require('./saito');
const Transaction = require('./transaction');

const BlockType = {
  Ghost: 0,
  Header: 1,
  Pruned: 2,
  Full: 3
};

class Block {

  constructor(app, blkobj = null, confirmations = -1) {

    this.app = app || {};

    //
    // consensus variables
    //
    this.block                         = {};
    this.block.id                      = 1;
    this.block.timestamp               = new Date().getTime();
    this.block.previous_block_hash     = "";
    this.block.merkle                  = "";
    this.block.creator                 = "";
    this.block.burnfee                 = 0;
    this.block.difficulty              = 0.0;
    this.block.treasury                = Big("0.0");
    this.block.staking_treasury        = Big("0.0");
    this.block.signature               = "";

    this.lc 	                       = 0;

    this.transactions                  = [];

    this.block_type                     = BlockType.Full;
    this.hash                          = "";
    this.prehash                       = "";
    this.filename		       = ""; // set when saved

    this.is_valid		       = 1;
    this.has_golden_ticket	       = false;

  }

  async downgradeBlockToBlockType(block_type) {
  }

  async generateFromMempool(mempool, previous_block_hash) {

    //
    // fetch consensus values from preceding block
    //
    let previous_block_id = 0;
    let previous_block_burnfee = 0;
    let previous_block_timestamp = 0;
    let previous_block_difficulty = 0;
    let previous_block_treasury = 0;
    let previous_block_staking_treasury = 0;
    let current_timestamp = new Date().getTime();

    let previous_block = await mempool.app.blockchain.loadBlockAsync(previous_block_hash);

    if (previous_block) {
      previous_block_id = previous_block.block.id;
      previous_block_burnfee = previous_block.block.burnfee;
      previous_block_timestamp = previous_block.block.timestamp;
      previous_block_difficulty = previous_block.block.difficulty;
      previous_block_treasury = previous_block.block.treasury;
      previous_block_staking_treasury = previous_block.block.staking_treasury;
    }

    let current_burnfee = this.app.burnfee.returnBurnFeeForBlockProducedAtCurrentTimestampInNolan(
      previous_block_burnfee,
      current_timestamp,
      previous_block_timestamp
    );

    //
    // set our values
    //
    this.block.id = previous_block_id + 1;
    this.block.previous_block_hash = previous_block_hash;
    this.block.burnfee = current_burnfee;
    this.block.timestamp = current_timestamp;
    this.block.difficulty = previous_block_difficulty;


    //
    // swap in transactions
    //
    // note that these variables are submitted attached to the mempool
    // object, so we can hot-swap using pass-by-reference. these
    // modifications change the mempool in real-time.
    //
    this.transactions = mempool.mempool.transactions;
    mempool.mempool.transactions = [];


    //
    // swap in golden ticket
    //
    // note that these variables are submitted attached to the mempool
    // object, so we can hot-swap using pass-by-reference. these
    // modifications change the mempool in real-time.
    //
    for (let i = 0; i < mempool.mempool.golden_tickets.length; i++) {
      if (mempool.golden_tickets[i].returnMessage() === previous_block_hash) {
        this.transactions.unshift(mempool.golden_tickets[i]);
        this.has_golden_ticket = 1;
        mempool.golden_tickets.splice(i, 1);
        i = mempool.mempool.golden_tickets.length + 2;
      }
    }

    //
    // update dynamic consensus-variables
    //
    await this.updateConsensusValues();

    //
    // and return to normal
    //
    this.bundling_active = false;

  }

  generateMetadata() {
    this.generate_hashes();
  }

  generateHashes() {
    this.hash = "";
    this.hash = this.returnHash();
  }

  hasGoldenTicket() {
    return this.has_golden_ticket; 
  }

  returnBurnFee() {
    return this.block.burnfee;
  }  

  returnDifficulty() {
    return this.block.difficulty;
  }

  returnFilename() {
    return this.filename;
  }

  returnId() { 
    return this.block.id;
  }

  returnHash() {
    if (this.hash != "") { return this.hash; }
    this.prehash = this.app.crypto.hash(this.serializeForSignature());
    this.hash = this.app.crypto.hash(this.prehash + this.block.previous_block_hash);
    return this.hash;
  }

  returnPreviousBlockHash() {
    return this.block.previous_block_hash;
  }

  returnTimestamp() {
    return this.block.timestamp;
  }  

  serializeForSignature() {

    let vbytes = "";
        vbytes += this.block.id;
        vbytes += this.block.timestamp;
        vbytes += this.block.previous_block_hash;
        vbytes += this.block.creator;
        vbytes += this.block.merkle;
        vbytes += this.block.treasury;
        vbytes += this.block.staking_treasury;
        vbytes += this.block.burnfee;
        vbytes += this.block.difficulty;
    return vbytes

  }

  serializeForNet() {
    return this.app.networkApi.serializeBlock(this);
  }

  deserializeFromNet(buffer) {
    return this.app.networkApi.deserializeBlock(buffer);
  }
  
  async updateConsensusValues() {

  }

  async validate() {
    return true;
  }



  //
  // if the block is not at the proper type, try to upgrade it to have the
  // data that is necessary for blocks of that type if possible. if this is
  // not possible, return false. if it is possible, return true once upgraded.
  //
  async upgradeBlockToBlockType(block_type) {a

    console.trace("upgrading block to block type : " + block_type);

    if (this.block_type === block_type) {
      return true;
    }

    // TODO: if the block does not exist on disk, we have to attempt a remote fetch.

    //
    // load block from disk if full is needed
    //
    if (block_type === BlockType.Full) {

      let block = await this.app.storage.loadBlockByFilename(this.app.storage.generateBlockFilename(this));
      newBlock.prehash = this.app.crypto.hash(newBlock.serializeForSignature());

      newBlock.hash = this.app.crypto.hash(newBlock.serializeForHash());

      let old = this.transactions;
      this.transactions = newBlock.block.transactions;
      newBlock.transactions = old;

      // transactions need hashes
      this.generateMetaData();
      this.blockType = BlockType.Full;
      return true;
    }
    return false;
  }

  // if the block is not at the proper type, try to downgrade it by removing elements
  // that take up significant amounts of data / memory. if this is possible return
  // true, otherwise return false.
  async downgradeBlockToBlockType(blockType) {
    console.info("Downgrading block : " + blockType);

    if (this.block.blockType === blockType) {
      return true;
    }

    // if the block type needed is full and we are not, load the block if it exists on disk.
    if (blockType === BlockType.Pruned) {
      this.block.transactions = [];
      this.block.blockType = BlockType.Pruned;
      return true;
    }
    return false;
  }

  generateMetadata() {
    console.trace(" ... block.prevalid - pre hash: " + Date.now());

    // ensure hashes correct
    this.generateHashes();

    // if we are generating the metadata for a block, we use the
    // publickey of the block creator when we calculate the fees
    // and the routing work.
    let creatorPublicKey = this.getCreator();

    this.transactions.map(tx => tx.generateMetaData(creatorPublicKey));
    console.trace(" ... block.prevalid - pst hash: " + Date.now());

    // we need to calculate the cumulative figures AFTER the
    // original figures.
    let cumulativeFees = 0;
    let cumulativeWork = 0;

    let hasGoldenTicket = false;
    let hasFeeTransaction = false;
    let hasIssuanceTransaction = false;
    let issuanceTransactionIdx = 0;
    let goldenTicketIdx = 0;
    let feeTransactionIdx = 0;

    // we have to do a single sweep through all of the transactions in
    // non-parallel to do things like generate the cumulative order of the
    // transactions in the block for things like work and fee calculations
    // for the lottery.
    //
    // we take advantage of the sweep to perform other pre-validation work
    // like counting up our ATR transactions and generating the hash
    // commitment for all of our rebroadcasts.
    for (let i = 0; i < this.transactions.length; i++) {
      let transaction = this.transactions[i];

      cumulativeFees = transaction.generateMetadataCumulativeFees(cumulativeFees);
      cumulativeWork = transaction.generateMetadataCumulativeWork(cumulativeWork);

      // update slips_spent_this_block so that we have a record of
      // how many times input slips are spent in this block. we will
      // use this later to ensure there are no duplicates. this include
      // during the fee transaction, so that we cannot pay a staker
      // that is also paid this block otherwise.
      //
      // we skip the fee transaction as otherwise we have trouble
      // validating the staker slips if we have received a block from
      // someone else -- i.e. we will think the slip is spent in the
      // block when generating the FEE TX to check against the in-block
      // fee tx.
      if (!this.createdHashmapOfSlipsSpentThisBlock) {
        if (transaction.transactionType !== Transaction.TranasctionType.Fee) {
          for (let input of transaction.getInputs()) {
            let key = input.getUtxosetKey();
            this.slipsSpentThisBlock[key] = this.slipsSpentThisBlock[key] ? (this.slipsSpentThisBlock[key] + 1) : 1;
          }
          this.createdHashmapOfSlipsSpentThisBlock = true;
        }
      }

      // also check the transactions for golden ticket and fees
      switch (transaction.transactionType) {
        case Transaction.TranasctionType.Issuance:
          hasIssuanceTransaction = true;
          issuanceTransactionIdx = i;
          break;
        case Transaction.TranasctionType.Fee:
          hasFeeTransaction = true;
          feeTransactionIdx = i;
          break;
        case Transaction.TranasctionType.GoldenTicket:
          hasGoldenTicket = true;
          goldenTicketIdx = i;
          break;
        case Transaction.TranasctionType.ATR: {
          // TODO : move to another method
          let bytes = new Uint8Array([...this.rebroadcastHash, ...transaction.serializeForSignature()]);
          this.rebroadcastHash = this.app.crypto.hash(bytes);

          for (let input of transaction.inputs) {
            this.totalRebroadcastSlips += 1;
            this.totalRebroadcastNolans += input.getAmount();
          }
          break;
        }
        default:
          break;
      }
    }

    this.hasFeeTranasction = hasFeeTransaction;
    this.hasGoldenTicket = hasGoldenTicket;
    this.hasIssuanceTransaction = hasIssuanceTransaction;
    this.feeTransactionIdx = feeTransactionIdx;
    this.goldenTicketIdx = goldenTicketIdx;
    this.issuanceTransactionIdx = issuanceTransactionIdx;

    // update block with total fees
    this.totalFees = cumulativeFees;
    this.routingWorkForCreator = cumulativeWork;
    console.trace(" ... block.pre_validation_done:" + Date.now());

    return true;
  }
}

Block.BlockType = BlockType;

module.exports = Block;


