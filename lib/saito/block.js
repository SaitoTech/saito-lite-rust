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
    this.block.difficulty              = 0;
    this.block.treasury                = Big("0");
    this.block.staking_treasury        = Big("0");
    this.block.signature               = "";

    this.lc 	                       = 0;

    this.transactions                  = [];

    this.block_type                     = BlockType.Full;
    this.hash                          = "";
    this.prehash                       = "";
    this.filename		       = ""; // set when saved

    this.total_fees 		       = 0;
    this.routing_work_for_creator      = 0;

    this.is_valid		       = 1;
    this.has_golden_ticket	       = false;
    this.has_hashmap_of_slips_spent_this_block = false;
    this.slips_spent_this_block        = {};
    this.rebroadcast_hash              = "";
    this.total_rebroadcast_slips       = 0;
    this.total_rebroadcast_nolans      = 0;

  }


  /**
   * deserialize block
   * @param {array} buffer -
   * @returns {Block}
   */
  deserialize(buffer) {
    let binary = new saito.binary(this.app);
    let transactions_length = binary.u32FromBytes(buffer.slice(0, 4));
    this.block.id = parseInt(binary.u64FromBytes(buffer.slice(4, 12)).toString()); // TODO : fix this to support correct ranges.
    this.block.timestamp = parseInt(binary.u64FromBytes(buffer.slice(12, 20)).toString());

    //
    // Sanka -- note -- this fix sorts out issues
    //
    // crypto.stringToHex assumes UTF8 input, which assumes 8-bit chars instead of 4 as in binary-hex conversion
    //
    //this.block.previous_block_hash = this.app.crypto.stringToHex(Buffer.from(buffer.slice(20, 52)).toString());
    this.block.previous_block_hash = Buffer.from(buffer.slice(20, 52)).toString('hex');

    // ditto
    //this.block.creator = this.app.crypto.stringToHex(buffer.slice(52, 85));
    //this.block.merkle = this.app.crypto.stringToHex(buffer.slice(85, 117));
    //this.block.signature = this.app.crypto.stringToHex(buffer.slice(117, 181));

    this.block.creator = Buffer.from(buffer.slice(52, 85)).toString('hex');
    this.block.merkle = Buffer.from(buffer.slice(85, 117)).toString('hex');
    this.block.signature = Buffer.from(buffer.slice(117, 181)).toString('hex');

    this.block.treasury = binary.u64FromBytes(buffer.slice(181, 189));
    this.block.staking_treasury = binary.u64FromBytes(buffer.slice(189, 197));
    this.block.burnfee = parseInt(binary.u64FromBytes(buffer.slice(197, 205)));
    this.block.difficulty = parseInt(binary.u64FromBytes(buffer.slice(205, 213)));
    let start_of_transaction_data = BLOCK_HEADER_SIZE;

    //
    // TODO - there is a cleaner way to do this
    //
    if (this.block.previous_block_hash === "0000000000000000000000000000000000000000000000000000000000000000") { this.block.previous_block_hash = ""; }
    if (this.block.merkle === "0000000000000000000000000000000000000000000000000000000000000000") { this.block.merkle = ""; }
    if (this.block.creator === "000000000000000000000000000000000000000000000000000000000000000000") { this.block.creator = ""; }
    if (this.block.signature === "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000") { this.block.signature = ""; }

    for (let i = 0; i < transactions_length; i++) {

      let inputs_len = binary.u32FromBytes(buffer.slice(start_of_transaction_data, start_of_transaction_data + 4));
      let outputs_len = binary.u32FromBytes(buffer.slice(start_of_transaction_data + 4, start_of_transaction_data + 8));
      let message_len = binary.u32FromBytes(buffer.slice(start_of_transaction_data + 8, start_of_transaction_data + 12));
      let path_len = binary.u32FromBytes(buffer.slice(start_of_transaction_data + 12, start_of_transaction_data + 16));
      let end_of_transaction_data = start_of_transaction_data
        + saito.transaction.TRANSACTION_SIZE
        + ((inputs_len + outputs_len) * saito.transaction.SLIP_SIZE)
        + message_len
        + path_len * saito.transaction.HOP_SIZE;

      let transaction = new saito.transaction(this.app);
      transaction.deserialize(buffer, start_of_transaction_data);
      this.transactions.push(transaction);
      start_of_transaction_data = end_of_transaction_data;

    }

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

    //
    // generate block hashes
    //
    this.generateHashes();

    //
    // if we are generating the metadata for a block, we use the
    // publickey of the block creator when we calculate the fees
    // and the routing work.
    //
    let creator_publickey = this.returnCreator();
    this.transactions.map(tx => tx.generateMetadata(creator_publickey));

    //
    // we need to calculate the cumulative figures AFTER the
    // original figures.
    //
    let cumulative_fees = 0;
    let cumulative_work = 0;

    let has_golden_ticket = false;
    let has_fee_transaction = false;
    let has_issuance_transaction = false;
    let issuance_transaction_idx = 0;
    let golden_ticket_idx = 0;
    let fee_transaction_idx = 0;

    //
    // we have to do a single sweep through all of the transactions in
    // non-parallel to do things like generate the cumulative order of the
    // transactions in the block for things like work and fee calculations
    // for the lottery.
    //
    // we take advantage of the sweep to perform other pre-validation work
    // like counting up our ATR transactions and generating the hash
    // commitment for all of our rebroadcasts.
    //
    for (let i = 0; i < this.transactions.length; i++) {

      let transaction = this.transactions[i];

      cumulative_fees = transaction.generateMetadataCumulativeFees(cumulativeFees);
      cumulative_work = transaction.generateMetadataCumulativeWork(cumulativeWork);

      //
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
      //
      if (!this.has_hashmap_of_slips_spent_this_block) {

        if (transaction.transaction.type !== Transaction.TranasctionType.Fee) {
          for (let i = 0; i < transaction.transaction.from.length; i++) {
            let key = transaction.transaction.from[i].returnKey();
            this.slips_spent_this_block[key] = 1;
          }
          this.has_hashmap_of_slips_spent_this_block = true;
        }
      }

      //
      // also check the transactions for golden ticket and fees
      //
      switch (transaction.transaction.type) {
        case TransactionType.Issuance:
          has_issuance_transaction = true;
          issuance_transaction_idx = i;
          break;
        case TransactionType.Fee:
          has_fee_transaction = true;
          fee_transaction_idx = i;
          break;
        case TransactionType.GoldenTicket:
          has_golden_ticket = true;
          golden_ticket_idx = i;
          break;
        case TransactionType.ATR: {

          // TODO : move to another method
          let bytes = new Uint8Array([...this.rebroadcast_hash, ...transaction.serializeForSignature()]);
          this.rebroadcast_hash = this.app.crypto.hash(bytes);

          for (let i = 0; i < transaction.transaction.from.length; i++) {
            this.total_rebroadcast_slips += 1;
            this.total_rebroadcast_nolans += input.returnAmount();
          }
          break;
        }
        default:
          break;
      }
    }

    this.has_fee_tranasction = has_fee_transaction;
    this.has_golden_ticket = has_golden_ticket;
    this.has_issuance_transaction = has_issuance_transaction;
    this.fee_transaction_idx = fee_transaction_idx;
    this.golden_ticket_idx = golden_ticket_idx;
    this.issuance_transaction_idx = issuance_transaction_idx;

    //
    // update block with total fees
    //
    this.total_fees = cumulative_fees;
    this.routing_work_for_creator = cumulative_work;

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

  returnCreator() {
    return this.block.creator;
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

  toSizedArray(value, size) {
    let value_buffer = Buffer.from(value, "hex");
    let new_buffer = Buffer.alloc(size);
    console.assert(size >= value_buffer.length, "unhandled value ranges found");
    value_buffer.copy(new_buffer, size - value_buffer.length);
    return new_buffer;
  }

  /**
   * Serialize Block
   * @param {Block} block
   * @returns {array} - raw bytes
   */
  serialize() {

    //
    // ensure strings have appropriate number of bytes if empty
    //
    let block_previous_block_hash = this.block.previous_block_hash;
    // if (block_previous_block_hash === "") { block_previous_block_hash = "0000000000000000000000000000000000000000000000000000000000000000"; }

    //
    // TODO - there is a cleaner way to do this
    //
    let block_merkle = this.block.merkle;
    // if (block_merkle === "") { block_merkle = "0000000000000000000000000000000000000000000000000000000000000000"; }
    let block_creator = this.block.creator;
    // if (block_creator === "") { block_creator = "0000000000000000000000000000000000000000000000000000000000000000"; }
    let block_signature = this.block.signature;
    // if (block_signature === "") { block_signature = "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"; }

    let transactions_length = this.app.binary.u32AsBytes(0);
    if (this.transactions.length > 0) { transactions_length = this.app.binary.u32AsBytes(this.transactions.length); }
    let id = this.app.binary.u64AsBytes(new Big(this.block.id));
    let timestamp = this.app.binary.u64AsBytes(new Big(this.block.timestamp));

    let previous_block_hash = this.toSizedArray(block_previous_block_hash, 32);
    let creator = this.toSizedArray(block_creator, 33);
    let merkle_root = this.toSizedArray(block_merkle, 32);
    let signature = this.toSizedArray(block_signature, 64);

    let treasury = this.app.binary.u64AsBytes(new Big(this.block.treasury));
    let staking_treasury = this.app.binary.u64AsBytes(new Big(this.block.staking_treasury));

    let burnfee = this.app.binary.u64AsBytes(new Big(this.block.burnfee));
    let difficulty = this.app.binary.u64AsBytes(new Big(this.block.difficulty));

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
      let next_tx_data = this.transactions[i].serialize(this.app);
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

  signBlock(publickey, privatekey) {
    this.block.creator = publickey;
    this.block.signature = this.app.crypto.signMessage(this.serializeForSignature(), privatekey);
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


