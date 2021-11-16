const Big = require('big.js');
const saito = require('./saito');

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
    this.block.treasury                = "0";
    this.block.staking_treasury        = "0";
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
    this.has_fee_transaction	       = false;
    this.has_issuance_transaction       = false;
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

    let transactions_length = this.app.binary.u32FromBytes(buffer.slice(0, 4));
    this.block.id = parseInt(this.app.binary.u64FromBytes(buffer.slice(4, 12)));
    this.block.timestamp = parseInt(this.app.binary.u64FromBytes(buffer.slice(12, 20)));

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

    this.block.treasury = this.app.binary.u64FromBytes(buffer.slice(181, 189));
    this.block.staking_treasury = this.app.binary.u64FromBytes(buffer.slice(189, 197));
    this.block.burnfee = parseInt(this.app.binary.u64FromBytes(buffer.slice(197, 205)));
    this.block.difficulty = parseInt(this.app.binary.u64FromBytes(buffer.slice(205, 213)));
    let start_of_transaction_data = BLOCK_HEADER_SIZE;

    //
    // TODO - there is a cleaner way to do this
    //
    if (this.block.previous_block_hash === "0000000000000000000000000000000000000000000000000000000000000000") { this.block.previous_block_hash = ""; }
    if (this.block.merkle === "0000000000000000000000000000000000000000000000000000000000000000") { this.block.merkle = ""; }
    if (this.block.creator === "0000000000000000000000000000000000000000000000000000000000000000") { this.block.creator = ""; }
    if (this.block.signature === "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000") { this.block.signature = ""; }


    for (let i = 0; i < transactions_length; i++) {

      let inputs_len = this.app.binary.u32FromBytes(buffer.slice(start_of_transaction_data, start_of_transaction_data + 4));
      let outputs_len = this.app.binary.u32FromBytes(buffer.slice(start_of_transaction_data + 4, start_of_transaction_data + 8));
      let message_len = this.app.binary.u32FromBytes(buffer.slice(start_of_transaction_data + 8, start_of_transaction_data + 12));
      let path_len = this.app.binary.u32FromBytes(buffer.slice(start_of_transaction_data + 12, start_of_transaction_data + 16));
      let end_of_transaction_data = start_of_transaction_data
        + TRANSACTION_SIZE
        + ((inputs_len + outputs_len) * SLIP_SIZE)
        + message_len
        + path_len * HOP_SIZE;

      let transaction = new saito.transaction();
      transaction.deserialize(buffer, start_of_transaction_data);
      block.transactions.push(transaction);
      start_of_transaction_data = end_of_transaction_data;

    }

  }



  //
  // if the block is not at the proper type, try to downgrade it by removing elements
  // that take up significant amounts of data / memory. if this is possible return
  // true, otherwise return false.
  //
  async downgradeBlockToBlockType(block_type) {

    if (this.isType(block_type)) {
      return true;
    }

    if (block_type === "Pruned") {
      this.block.transactions = [];
      this.block_type = BlockType.Pruned;
      return true;
    }
    return false;
  }

  deserializeFromNet(buffer) {
    return this.deserialize();
  }


  isType(type) {
    if (type == "Ghost") { return (this.block_type === BlockType.Ghost); }
    if (type == "Pruned") { return (this.block_type === BlockType.Pruned); }
    if (type == "Header") { return (this.block_type === BlockType.Header); }
    if (type == "Full") { return (this.block_type === BlockType.Full); }
  }

  async generateConsensusValues() {

    //
    // return obj w/ default values
    //
    let cv = {};

        cv.total_fees = 0;

        cv.ft_num = 0;
        cv.gt_num = 0;
        cv.it_num = 0;
        cv.ft_idx = 0;
        cv.gt_idx = 0;
        cv.it_idx = 0;

        cv.expected_difficulty = 1;

        cv.total_rebroadcast_nolan = 0;
        cv.total_rebroadcast_fees_nolan = 0
        cv.total_rebroadcast_slips = 0;
        cv.nolan_falling_off_chain = 0;

	cv.rebroadcast_hash = "";

	cv.staking_treasury = 0;

    //
    // total fees and indices
    //
    for (let i = 0; i < this.transactions.length; i++) {
      if (!this.transactions[i].isFeeTransaction()) {
        cv.total_fees += this.transactions[i].returnFeesTotal();
      } else {
        cv.ft_num += 1;
        cv.ft_idx = i;
        this.has_fee_transaction = true;
     }
      if (this.transactions[i].isGoldenTicket()) {
        cv.gt_num += 1;
        cv.gt_idx = i;
        this.has_golden_ticket = true; 
      }
      if (this.transactions[i].isIssuanceTransaction()) {
        cv.it_num += 1;
        cv.it_idx = i;
        this.has_issuance_transaction = true; 
      }
    }
    
    //
    // burn-fee
    //
    let previous_block = await this.app.blockchain.loadBlockAsync(this.block.previous_block_hash);
    if (previous_block) {

      let difficulty = previous_block.returnDifficulty();

      if (previous_block.hasGoldenTicket() && cv.gt_num == 0) {
        if (difficulty > 0) {
          cv.expected_difficulty = previous_block.returnDifficulty() - 1;
        }
      } else if (previous_block.hasGoldenTicket() && cv.gt_num > 0) {
        cv.expected_difficulty = difficulty + 1;
      } else {
        cv.expected_difficulty = difficulty;
      }

    } else {
      //
      // if there is no previous block, the burn fee is not adjusted. validation
      // rules will cause the block to fail unless it is the first block.
      //
    }


    //
    // calculate automatic transaction rebroadcasts / ATR / atr
    //
    if (this.block.id > this.app.blockchain.returnGenesisPeriod()) {

      let pruned_block_id = this.block.id - this.app.blockchain.returnGenesisPeriod();
      let pruned_block_hash = this.app.blockring.returnLongestChainBlockHashByBlockId(pruned_block_id);
      let pruned_block = await this.blockchain.loadBlockAync(pruned_block_hash);

      //
      // generate metadata should have prepared us with a pre-prune block
      // that contains all of the transactions and is ready to have its
      // ATR rebroadcasts calculated.
      //
      if (pruned_block) {

        //
        // identify unspent transactions
        //
        for (let i = 0; i < pruned_block.transactions.length; i++) {

	  let tx = pruned_block.transactions[i];

          for (let k = 0; k < tx.to.length; k++) {

	    let output = tx.to[k];
	    let REBROADCAST_FEE = 200_000_000;

            //
            // valid means spendable and non-zero
            //
            if (output.validate(this.app)) {

              //
	      // TODO - no parse int as numbers potentially too big
	      //
              if (parseInt(output.returnAmount()) > 200_000_000) {

                cv.total_rebroadcast_nolan += parseInt(output.returnAmount());
                cv.total_rebroadcast_fees_nolan += 200_000_000;
                cv.total_rebroadcast_slips += 1;

                //
                // create rebroadcast transaction
                //
                // TODO - floating fee based on previous block average
                //
                let rebroadcast_transaction = new saito.transaction();
	        rebroadcast_transaction.generateRebroadcastTransaction(ouput, 200_000_000);

                //
                // update cryptographic hash of all ATRs
                //
                cv.rebroadcast_hash = this.app.crypto.hash(cv.rebroadcast_hash + rebroadcast_transaction.serialize_for_signature());

              } else {

                //
                // rebroadcast dust is either collected into the treasury or
                // distributed as a fee for the next block producer. for now
                // we will simply distribute it as a fee. we may need to
                // change this if the DUST becomes a significant enough amount
                // each block to reduce consensus security.
                //
                cv.total_rebroadcast_fees_nolan += parseInt(output.returnAmount());

              }
            }
          }
        }
      }
    }



/*****
    //
    // calculate payments to miners / routers / stakers
    //
    if (cv.gt_idx > 0) {

      let golden_ticket: GoldenTicket = GoldenTicket::deserialize_for_transaction(
        this.transactions[gt_idx].get_message().to_vec(),
      );
            // generate input hash for router
            let mut next_random_number = hash(&golden_ticket.get_random().to_vec());
            let _miner_publickey = golden_ticket.get_publickey();

            //
            // miner payout is fees from previous block, no staking treasury
            //
            if let Some(previous_block) = blockchain.blocks.get(&this.get_previous_block_hash()) {
                let miner_payment = previous_block.get_total_fees() / 2;
                let router_payment = previous_block.get_total_fees() - miner_payment;

                //
                // calculate miner and router payments
                //
                let block_payouts: RouterPayout =
                    previous_block.find_winning_router(next_random_number);
                let router_publickey = block_payouts.publickey;

                // these two from find_winning_router - 3, 4
                next_random_number = hash(&next_random_number.to_vec());
                next_random_number = hash(&next_random_number.to_vec());

                let mut payout = BlockPayout::new();
                payout.miner = golden_ticket.get_publickey();
                payout.router = router_publickey;
                payout.miner_payout = miner_payment;
                payout.router_payout = router_payment;

                cv.block_payout.push(payout);

                //
                // loop backwards until MAX recursion OR golden ticket
                //
                let mut cont = 1;
                let mut loop_idx = 0;
                let mut did_the_block_before_our_staking_block_have_a_golden_ticket =
                    previous_block.get_has_golden_ticket();
                //
                // staking block hash is 3 back, pre
                //
                let mut staking_block_hash = previous_block.get_previous_block_hash();

                while cont == 1 {
                    loop_idx += 1;

                    //
                    // we start with the second block, so once loop_IDX hits the same
                    // number as MAX_STAKER_RECURSION we have processed N blocks where
                    // N is MAX_STAKER_RECURSION.
                    //
                    if loop_idx >= MAX_STAKER_RECURSION {
                        cont = 0;
                    } else {
                        if let Some(staking_block) = blockchain.blocks.get(&staking_block_hash) {
                            staking_block_hash = staking_block.get_previous_block_hash();
                            if !did_the_block_before_our_staking_block_have_a_golden_ticket {
                                //
                                // update with this block info in case of next loop
                                //
                                did_the_block_before_our_staking_block_have_a_golden_ticket =
                                    staking_block.get_has_golden_ticket();

                                //
                                // calculate staker and router payments
                                //
                                // the staker payout is contained in the slip of the winner. this is
                                // because we calculate it afresh every time we reset the staking table
                                // the payment for the router requires calculating the amount that will
                                // be withheld for the staker treasury, which is what previous_staker_
                                // payment is measuring.
                                //
                                let sp = staking_block.get_total_fees() / 2;
                                let rp = staking_block.get_total_fees() - sp;

                                let mut payout = BlockPayout::new();
                                payout.router = staking_block
                                    .find_winning_router(next_random_number)
                                    .publickey;
                                payout.router_payout = rp;
                                payout.staking_treasury = sp as i64;

                                // router consumes 2 hashes
                                next_random_number = hash(&next_random_number.to_vec());
                                next_random_number = hash(&next_random_number.to_vec());

                                let staker_slip_option =
                                    blockchain.staking.find_winning_staker(next_random_number);
                                if let Some(staker_slip) = staker_slip_option {
                                    let mut slip_was_spent = 0;

                                    //
                                    // check to see if the block already pays out to this slip
                                    //
                                    for i in 0..cv.block_payout.len() {
                                        if cv.block_payout[i].staker_slip.get_utxoset_key()
                                            == staker_slip.get_utxoset_key()
                                        {
                                            slip_was_spent = 1;
                                            break;
                                        }
                                    }

                                    //
                                    // check to see if staker slip already spent/withdrawn
                                    //
                                    if this
                                        .slips_spent_this_block
                                        .contains_key(&staker_slip.get_utxoset_key())
                                    {
                                        slip_was_spent = 1;
                                    }

                                    //
                                    // add payout to staker if staker is new
                                    //
                                    // the payout is the return on staking, stored separately so that the
                                    // UTXO for the slip will still validate.
                                    //
                                    if slip_was_spent == 0 {
                                        payout.staker = staker_slip.get_publickey();
                                        payout.staker_payout =
                                            staker_slip.get_amount() + staker_slip.get_payout();
                                        payout.staker_slip = staker_slip.clone();
                                    }

                                    next_random_number = hash(&next_random_number.to_vec());

                                    cv.block_payout.push(payout);
                                }
                            }
                        }
                    }
                }
            }
            //
            // now create fee transaction using the block payout data
            //
            let mut slip_ordinal = 0;
            let mut transaction = Transaction::new();
            transaction.set_transaction_type(TransactionType::Fee);

            for i in 0..cv.block_payout.len() {
                if cv.block_payout[i].miner != [0; 33] {
                    let mut output = Slip::new();
                    output.set_publickey(cv.block_payout[i].miner);
                    output.set_amount(cv.block_payout[i].miner_payout);
                    output.set_slip_type(SlipType::MinerOutput);
                    output.set_slip_ordinal(slip_ordinal);
                    transaction.add_output(output.clone());
                    slip_ordinal += 1;
                }
                if cv.block_payout[i].router != [0; 33] {
                    let mut output = Slip::new();
                    output.set_publickey(cv.block_payout[i].router);
                    output.set_amount(cv.block_payout[i].router_payout);
                    output.set_slip_type(SlipType::RouterOutput);
                    output.set_slip_ordinal(slip_ordinal);
                    transaction.add_output(output.clone());
                    slip_ordinal += 1;
                }
                if cv.block_payout[i].staker != [0; 33] {
                    transaction.add_input(cv.block_payout[i].staker_slip.clone());

                    let mut output = Slip::new();
                    output.set_publickey(cv.block_payout[i].staker);
                    output.set_amount(cv.block_payout[i].staker_payout);
                    output.set_slip_type(SlipType::StakerOutput);
                    output.set_slip_ordinal(slip_ordinal);
                    transaction.add_output(output);
                    slip_ordinal += 1;
                    cv.staking_treasury += cv.block_payout[i].staking_treasury;
                    cv.staking_treasury -= cv.block_payout[i].staker_payout as i64;
                }
            }

            cv.fee_transaction = Some(transaction);
        }

        //
        // if there is no golden ticket AND there is no golden ticket before the MAX
        // blocks we recurse to collect NOLAN we have to add the amount of the unpaid
        // block to the amount of NOLAN that is falling off our chain.
        //
        if cv.gt_num == 0 {
            for i in 1..=MAX_STAKER_RECURSION {
                if i >= this.returnId() {
                    break;
                }

                let bid = self.get_id() - i;
                let previous_block_hash = blockchain
                    .blockring
                    .get_longest_chain_block_hash_by_block_id(bid);

                // previous block hash can be [0; 32] if there is no longest-chain block

                if previous_block_hash != [0; 32] {
                    let previous_block = blockchain.get_block(&previous_block_hash).await.unwrap();

                    if previous_block.get_has_golden_ticket() {
                        break;
                    } else {
                        //
                        // this is the block BEFORE from which we need to collect the nolan due to
                        // our iterator starting at 0 for the current block. i.e. if MAX_STAKER_
                        // RECURSION is 3, at 3 we are the fourth block back.
                        //
                        if i == MAX_STAKER_RECURSION {
                            cv.nolan_falling_off_chain = previous_block.get_total_fees();
                        }
                    }
                }
            }
        }
******/

    return cv;
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

  hasFeeTransaction() {
    return this.has_fee_transaction;
  }

  hasGoldenTicket() {
    return this.has_golden_ticket; 
  }

  hasIssuanceTransaction() {
    return this.has_issuance_transaction;
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

  returnStakingTreasury() {
    return this.block.staking_treasury;
  }  

  returnTreasury() {
    return this.block.treasury;
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

    //
    // ensure strings have appropriate number of bytes if empty
    //
    let block_previous_block_hash = this.block.previous_block_hash;
    if (block_previous_block_hash === "") { block_previous_block_hash = "0000000000000000000000000000000000000000000000000000000000000000"; }

    //
    // TODO - there is a cleaner way to do this
    //
    let block_merkle = this.block.merkle;
    if (block_merkle === "") { block_merkle = "0000000000000000000000000000000000000000000000000000000000000000"; }
    let block_creator = this.block.creator;
    if (block_creator === "") { block_creator = "0000000000000000000000000000000000000000000000000000000000000000"; }
    let block_signature = this.block.signature;
    if (block_signature === "") { block_signature = "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"; }

    let transactions_length = this.app.binary.u32AsBytes(0);
    if (this.transactions.length > 0) { transactions_length = this.app.binary.u32AsBytes(this.transactions.length); }
    let id = this.app.binary.u64AsBytes(new Big(this.block.id));
    let timestamp = this.app.binary.u64AsBytes(new Big(this.block.timestamp));

    let previous_block_hash = Buffer.from(block_previous_block_hash, 'hex');
    let creator = Buffer.from(block_creator, 'hex');
    let merkle_root = Buffer.from(block_merkle, 'hex');
    let signature = Buffer.from(block_signature, 'hex');

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

    //
    // invalid if no transactions
    //
    if (this.transactions.length == 0) {
      console.log("ERROR 582034: no transactions in blocks, thus invalid");
      return false;
    }

    //
    // verify creator signed
    //
    if (!this.app.crypto.verifyMessage(this.serializeForSignature(), this.block.signature, this.block.creator)) {
      console.log("ERROR 582039: block is not signed by creator or signature does not validate",);
      return false;
    }

    //
    // generate consensus values
    //
    let cv = await this.generateConsensusValues(this.app);


    //
    // only block #1 can have an issuance transaction
    //
    if (cv.it_num > 0 && this.get_id() > 1) {
      console.log("ERROR 712923: blockchain contains issuance after block 1 in chain",);
      return false;
    }

    //
    // checks against previous block
    //
    let previous_block = await this.app.blockchain.loadBlockAsync(this.block.previous_block_hash);
    if (previous_block) {


      //
      // treasury
      //
      if (Big(this.returnTreasury()).toString() !== Big(previous_block.returnTreasury()).plus(Big(cv.nolan_falling_off_chain)).toString()) {
        console.log("ERROR 123243: treasury is not calculated properly");
        return false;
      }


      //
      // staking treasury
      //
      let adjusted_staking_treasury = Big(previous_block.returnStakingTreasury());
      let cv_st = Big(cv.staking_treasury);
      if (cv_st.lt(0)) {
        let x = cv_st.times(-1);
        if (adjusted_staking_treasury.lt(x)) {
          adjusted_staking_treasury = adjusted_staking_treasury.minus(x);
        } else {
          adjusted_staking_treasury = Big(0);
        }
      } else {
        let x = cv_st;
        adjusted_staking_treasury = adjusted_staking_treasury.plus(x);
      }
      if (this.returnStakingTreasury() != adjusted_staking_treasury.toString()) {
        console.log("ERROR 820391: staking treasury does not validate");
        return false;
      }


      //
      // burn fee
      //
      let new_burnfee = this.app.burnfee.returnBurnFeeForBlockProducedAtCurrentTimestampInNolan(previous_block.returnBurnFee(), this.returnTimestamp(), previous_block.returnTimestamp());
      if (new_burnfee != this.returnBurnFee()) {
        console.log("ERROR 182085: burn fee not calculated properly thus invalid");
        return false;
      }


      //
      // validate routing work required
      //
      let amount_of_routing_work_needed = this.app.burnfee.returnRoutingWorkNeededToProduceBlockInNolan(previous_block.returnBurnFee(), this.returnTimestamp(), previous_block.returnTimestamp());
      if (this.routing_work_for_creator < amount_of_routing_work_needed) {
        console.log("ERROR 510293: block lacking adequate routing work from creator");
        return false;
      }


      //
      // validate golden ticket
      //
      // the golden ticket is a special kind of transaction that stores the
      // solution to the network-payment lottery in the transaction message
      // field. it targets the hash of the previous block, which is why we
      // tackle it's validation logic here.
      //
      // first we reconstruct the ticket, then calculate that the solution
      // meets our consensus difficulty criteria. note that by this point in
      // the validation process we have already examined the fee transaction
      // which was generated using this solution. If the solution is invalid
      // we find that out now, and it invalidates the block.
      //
      if (cv.gt_idx > 0) {
/***
                let golden_ticket: GoldenTicket = GoldenTicket::deserialize_for_transaction(
                    self.get_transactions()[gt_idx].get_message().to_vec(),
                );
                let solution = GoldenTicket::generate_solution(
                    previous_block.get_hash(),
                    golden_ticket.get_random(),
                    golden_ticket.get_publickey(),
                );
                if !GoldenTicket::is_valid_solution(solution, previous_block.get_difficulty()) {
                    error!(
                        "ERROR: Golden Ticket solution does not validate against previous block hash and difficulty"
                    );
                    return false;
                }

***/
      }


    } else {

      //
      // no previous block?
      //

    }


    return true;
  }



  //
  // if the block is not at the proper type, try to upgrade it to have the
  // data that is necessary for blocks of that type if possible. if this is
  // not possible, return false. if it is possible, return true once upgraded.
  //
  async upgradeBlockToBlockType(block_type) {

    if (this.isType(block_type)) {
      return true;
    }

    //
    // load block from disk if full is needed
    //
    if (block_type === "Full") {

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


