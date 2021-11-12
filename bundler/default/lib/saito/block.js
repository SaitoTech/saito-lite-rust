const Big = require('big.js');
const saito = require('./saito');
const Transaction = require('./transaction');

const BLOCK_HEADER_SIZE = 213;
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


  /**
   * deserialize block
   * @param {array} buffer -
   * @returns {Block}
   */
  deserialize(buffer) {

    let transactions_length = this.app.networkApi.u32FromBytes(buffer.slice(0, 4));
    this.block.id = this.app.networkApi.u64FromBytes(buffer.slice(4, 12));
    this.block.timestamp = this.app.networkApi.u64FromBytes(buffer.slice(12, 20));
    this.block.previous_block_hash = this.app.crypto.stringToHex(buffer.slice(20, 52));
    this.block.creator = this.app.crypto.stringToHex(buffer.slice(52, 85));
    this.block.merkle = this.app.crypto.stringToHex(buffer.slice(85, 117));
    this.block.signature = this.app.crypto.stringToHex(buffer.slice(117, 181));
    this.block.treasury = this.app.networkApi.u64FromBytes(buffer.slice(181, 189));
    this.block.staking_treasury = this.app.networkApi.u64FromBytes(buffer.slice(189, 197));
    this.block.burnfee = this.app.networkApi.u64FromBytes(buffer.slice(197, 205));
    this.block.difficulty = this.app.networkApi.u64FromBytes(buffer.slice(205, 213));
    let start_of_transaction_data = BLOCK_HEADER_SIZE;

console.log("CONTENTS DESERIALIZE: " + JSON.stringify(this.block));
console.log("TX LEN: " + transactions_length);

//    for (let i = 0; i < transactions_length; i++) {
//      let inputs_len = this.app.networkApi.u32FromBytes(buffer.slice(start_of_transaction_data, start_of_transaction_data + 4));
//      let outputs_len = this.app.networkApi.u32FromBytes(buffer.slice(start_of_transaction_data + 4, start_of_transaction_data + 8));
//      let message_len = this.app.networkApi.u32FromBytes(buffer.slice(start_of_transaction_data + 8, start_of_transaction_data + 12));
//      let path_len = this.app.networkApi.u32FromBytes(buffer.slice(start_of_transaction_data + 12, start_of_transaction_data + 16));
//      let end_of_transaction_data = start_of_transaction_data
//        + TRANSACTION_SIZE
//        + ((inputs_len + outputs_len) * SLIP_SIZE)
//        + message_len
//        + path_len * HOP_SIZE;
//
//      let tx = this.deserializeTransaction(
//        buffer,
//        start_of_transaction_data
//      );
//
//      block.transactions.push(tx);
//      start_of_transaction_data = end_of_transaction_data;
//    }
  }



  //
  // if the block is not at the proper type, try to downgrade it by removing elements
  // that take up significant amounts of data / memory. if this is possible return
  // true, otherwise return false.
  //
  async downgradeBlockToBlockType(block_type) {

    if (this.block_type === block_type) {
      return true;
    }

    if (block_type === BlockType.Pruned) {
      this.block.transactions = [];
      this.block_type = BlockType.Pruned;
      return true;
    }
    return false;
  }

  deserializeFromNet(buffer) {
    return this.deserialize();
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

  returnHash() {
    if (this.hash != "") { return this.hash; }
    this.prehash = this.app.crypto.hash(this.serializeForSignature());
    this.hash = this.app.crypto.hash(this.prehash + this.block.previous_block_hash);
    return this.hash;
  }

  returnId() { 
    return this.block.id;
  }

  returnPreviousBlockHash() {
    return this.block.previous_block_hash;
  }

  returnTimestamp() {
    return this.block.timestamp;
  }  


  /**
   * Serialize Block
   * @param {Block} block
   * @returns {array} - raw bytes
   */
  serialize() {

    let transactions_length = this.app.networkApi.u32AsBytes(0);
    if (this.transactions.length > 0) { transactions_length = this.app.networkApi.u32AsBytes(this.transactions.length); }
    let id = this.app.networkApi.u64AsBytes(new Big(this.block.id));
    let timestamp = this.app.networkApi.u64AsBytes(new Big(this.block.timestamp));
    let previous_block_hash = Buffer.from(this.block.previous_block_hash, 'hex');
    let creator = Buffer.from(this.block.creator, 'hex');
    let merkle_root = Buffer.from(this.block.merkle, 'hex');
    let signature = Buffer.from(this.block.signature, 'hex');
    let treasury = this.app.networkApi.u64AsBytes(new Big(this.block.treasury));
    let staking_treasury = this.app.networkApi.u64AsBytes(new Big(this.block.staking_treasury));
    let burnfee = this.app.networkApi.u64AsBytes(new Big(this.block.burnfee));
    let difficulty = this.app.networkApi.u64AsBytes(new Big(this.block.difficulty));
    let block_header_data = new Uint8Array([
      ...transactions_length,
      ...id,
      ...timestamp,
      ...previous_block_hash,
      ...creator,
      ...merkle_root,
      ...signature,
      ...treasury,
      ...staking_treasury,
      ...burnfee,
      ...difficulty,
    ]);

    let total_tx_length = 0;
    let transactions = [];
    for (let i = 0; i < this.transactions.length; i++) {
      let next_tx_data = this.serializeTransaction(this.transactions[i]);
      total_tx_length += next_tx_data.length;
      transactions.push(next_tx_data);
    }

    let ret = new Uint8Array(BLOCK_HEADER_SIZE + total_tx_length);
    ret.set(block_header_data, 0);
    let next_tx_location = BLOCK_HEADER_SIZE;
    for (let i = 0; i < transactions.length; i++) {
      ret.set(transactions[i], next_tx_location);
      next_tx_location += transactions[i].length;
    }

    return ret;
  }

  serializeForNet() {
    return this.serialize();
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

    //
    // load block from disk if full is needed
    //
    if (block_type === BlockType.Full) {

      let block = await this.app.storage.loadBlockByFilename(this.app.storage.generateBlockFilename(this));
      block.generateHashes();

      this.transactions = block.transactions;
      this.generateMetadata();
      this.block_type = BlockType.Full;
      return true;
    }

    return false;
  }



}

Block.BlockType = BlockType;

module.exports = Block;


