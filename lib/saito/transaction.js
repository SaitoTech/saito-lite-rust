const Big      = require('big.js');
const saito    = require('./saito');

const TRANSACTION_SIZE = 89;
const SLIP_SIZE = 75;
const HOP_SIZE = 130;

const TransactionType = {
  Normal: 0,
  Fee: 1,
  GoldenTicket: 2,
  ATR: 3,
  Vip: 4,
  StakerDeposit: 5,
  StakerWithdrawal: 6,
  Other: 7,
  Issuance: 8
};

class Transaction {

  constructor(app=null) {

    this.app = app;
    /////////////////////////
    // consensus variables //
    /////////////////////////
    this.transaction                  = {};
    this.transaction.to	 	      = [];
    this.transaction.from	      = [];
    this.transaction.ts               = 0;
    this.transaction.sig              = "";
    this.transaction.path             = [];
    this.transaction.r                = 1; // replaces
    this.transaction.type             = TransactionType.Normal;
    this.transaction.m                = "";

    this.fees_total                   = "";
    this.work_available_to_me         = "";
    this.work_available_to_creator    = "";
    this.work_cumulative              = "0.0";
				 	  //
                                          // cumulative fees. this is calculated when
					  // we process the block so that we can quickly
					  // select the winning transaction based on the
					  // golden ticket. it indicates how much this
					  // transaction carries in work in the overall
                                          // weight of the block. we use this to find
                                          // the winning node in the block for the
                                          // routing payment. i.e. this measures the
                                          // cumulative weight of the usable fees that
                                          // are behind the transactions.

    this.msg                       = {};
    this.dmsg                      = "";
    this.size                      = 0;
    this.is_valid                  = 1;

    return this;
  }

  decryptMessage(app) {
    if (this.transaction.from[0].add != app.wallet.returnPublicKey()) {
      try {
        let parsed_msg = this.msg;
        this.dmsg = app.keys.decryptMessage(this.transaction.from[0].add, parsed_msg);
      } catch (e) {
        console.log("ERROR: " + e);
      }
      return;
    }
    try { this.dmsg = app.keys.decryptMessage(this.transaction.to[0].add, this.msg); } catch (e) {}
    return;
  }


  /**
   * Deserialize Transaction
   * @param {array} buffer - raw bytes, perhaps an entire block
   * @param {number} start_of_transaction_data - where in the buffer does the tx data begin
   * @returns {Transaction}
   */
  deserialize(buffer, start_of_transaction_data) {
    let binary = new saito.binary(this.app);

    let inputs_len = binary.u32FromBytes(buffer.slice(start_of_transaction_data, start_of_transaction_data + 4));
    let outputs_len = binary.u32FromBytes(buffer.slice(start_of_transaction_data + 4, start_of_transaction_data + 8));
    let message_len = binary.u32FromBytes(buffer.slice(start_of_transaction_data + 8, start_of_transaction_data + 12));
    let path_len = binary.u32FromBytes(buffer.slice(start_of_transaction_data + 12, start_of_transaction_data + 16));

    let signature = this.app.crypto.stringToHex(buffer.slice(start_of_transaction_data + 16, start_of_transaction_data + 80));
    let timestamp = binary.u64FromBytes(buffer.slice(start_of_transaction_data + 80, start_of_transaction_data + 88)).toString();
    let transaction_type = buffer[start_of_transaction_data + 88];
    let start_of_inputs = start_of_transaction_data + TRANSACTION_SIZE;
    let start_of_outputs = start_of_inputs + inputs_len * SLIP_SIZE;
    let start_of_message = start_of_outputs + outputs_len * SLIP_SIZE;
    let start_of_path = start_of_message + message_len;

    let inputs = [];
    for (let i = 0; i < inputs_len; i++) {
      let start_of_slip = start_of_inputs + (i * SLIP_SIZE);
      let end_of_slip = start_of_slip + SLIP_SIZE;
      let input = new saito.slip();
      input.deserialize(this.app, buffer.slice(start_of_slip, end_of_slip));
      inputs.push(input);
    }
    let outputs = [];
    for (let i = 0; i < outputs_len; i++) {
      let start_of_slip = start_of_outputs + (i * SLIP_SIZE);
      let end_of_slip = start_of_slip + SLIP_SIZE;
      let output = new saito.slip();
      output.deserialize(this.app, buffer.slice(start_of_slip, end_of_slip));
      outputs.push(output);
    }
    let message = buffer.slice(start_of_message, start_of_message + message_len);

    let path = [];
    for (let i = 0; i < path_len; i++) {
      let start_of_data = start_of_path + (i * HOP_SIZE);
      let end_of_data = start_of_data + HOP_SIZE;
      let hop = new saito.hop();
      hop.deserialize(this.app, buffer.slice(start_of_data, end_of_data));
      path.push(hop);
    }

    this.transaction.from = inputs;
    this.transaction.to = outputs;
    this.transaction.ts = timestamp;
    this.transaction.sig = signature;
    this.transaction.path = path;
    this.transaction.type = transaction_type;
    this.transaction.m = message;

  }

  generateRebroadcastTransaction(output_to_rebroadcast, fee_to_deduct) {

  }

  isGoldenTicket() {
    if (this.transaction.type == TransactionType.GoldenTicket) {
      return true;
    }
    return false;
  }

  isFeeTransaction() {
    if (this.transaction.type == TransactionType.Fee) {
      return true;
    }
    return false;
  }

  isIssuanceTransaction() {
    if (this.transaction.type == TransactionType.Issuance) {
      return true;
    }
    return false;
  }

  returnFeesTotal(app) {
    if (this.fees_total == "") {

      //
      // sum inputs
      //
      let inputs = Big(0.0);
      if (this.transaction.from != null) {
        for (let v = 0; v < this.transaction.from.length; v++) {
          inputs = inputs.plus(Big(this.transaction.from[v].amt));
        }
      }

      //
      // sum outputs
      //
      let outputs = Big(0.0);
      for (let v = 0; v < this.transaction.to.length; v++) {
        //
        // do not count outputs in GT and FEE txs create outputs that cannot be counted.
        //
        if (this.transaction.to[v].type != 1 && this.transaction.to[v].type != 2) {
          outputs = outputs.plus(Big(this.transaction.to[v].amt));
        }
      }

      this.fees_total = inputs.minus(outputs).toFixed(8);
    }

    return this.fees_total;
  }

  returnMessage() {
    if (this.dmsg != "") { return this.dmsg; }
    if (this.msg != {}) { return this.msg; }
    return this.msg;
  }

  returnRoutingWorkAvailableToPublicKey(app) {
    let uf =  Big(this.returnFeesTotal(app));
    for (let i = 0; i < this.transaction.path.length; i++) {
      let d = 1;
      for (let j = i; j > 0; j--) { d = d*2; }
      uf = uf.div(d);
    }
    return uf.toFixed(8);
  }

  returnSignature(app, force=0) {
    if (this.transaction.sig != "" && force != 1) { return this.transaction.sig; }
    this.sign(app);
    return this.transaction.sig;
  }

  /**
   * Serialize TX
   * @param {TransactionV2} transaction
   * @returns {array} raw bytes
   */
  serialize(app) {

    let inputs_len = app.binary.u32AsBytes(this.transaction.from.length);
    let outputs_len = app.binary.u32AsBytes(this.transaction.to.length);
    let message_len = app.binary.u32AsBytes(this.transaction.m.length);
    let path_len = app.binary.u32AsBytes(this.transaction.path.length);
    let signature = app.crypto.toSizedArray(this.transaction.sig, 64);
    let timestamp = app.binary.u64AsBytes(this.transaction.ts);
    let transaction_type = app.binary.u8AsByte(this.transaction.type);
    let inputs = [];
    let outputs = [];
    let path = [];

    let start_of_inputs = TRANSACTION_SIZE;
    let start_of_outputs = TRANSACTION_SIZE + ((this.transaction.from.length) * SLIP_SIZE);
    let start_of_message = TRANSACTION_SIZE + ((this.transaction.from.length + this.transaction.to.length) * SLIP_SIZE);
    let start_of_path = TRANSACTION_SIZE + ((this.transaction.from.length + this.transaction.to.length) * SLIP_SIZE) + this.transaction.m.length;
    let size_of_tx_data = TRANSACTION_SIZE + ((this.transaction.from.length + this.transaction.to.length) * SLIP_SIZE) + this.transaction.m.length + this.transaction.path.length * HOP_SIZE;

    let ret = new Uint8Array(size_of_tx_data);
    ret.set(new Uint8Array([
      ...inputs_len,
      ...outputs_len,
      ...message_len,
      ...path_len,
      ...signature,
      ...timestamp,
      transaction_type]),
      0);

    for (let i = 0; i < this.transaction.from.length; i++) {
      inputs.push(this.transaction.from[i].serialize(app));
    }
    let next_input_location = start_of_inputs;
    for (let i = 0; i < inputs.length; i++) {
      ret.set(inputs[i], next_input_location);
      next_input_location += SLIP_SIZE;
    }

    for (let i = 0; i < this.transaction.to.length; i++) {
      outputs.push(this.transaction.to[i].serialize(app));
    }
    let next_output_location = start_of_outputs;
    for (let i = 0; i < outputs.length; i++) {
      ret.set(outputs[i], next_output_location);
      next_output_location += SLIP_SIZE;
    }

    ret.set(this.transaction.m, start_of_message);

    for (let i = 0; i < this.transaction.path.length; i++) {
      let serialized_hop = this.transaction.path[i].serialize(app);
      path.push(serialized_hop);
    }
    let next_hop_location = start_of_path;
    for(let i = 0; i < path.length; i++) {
      ret.set(path[i], next_hop_location);
      next_hop_location += HOP_SIZE;
    }

    return ret;
  }


  serializeForSignature(app) {
    let buffer = Buffer.from(app.binary.u64AsBytes(this.transaction.ts));

    for (let i = 0; i < this.transaction.from.length; i++) {
      buffer = Buffer.concat([buffer, this.transaction.from[i].serializeInputForSignature(app)])
    }
    for (let i = 0; i < this.transaction.to.length; i++) {
      buffer = Buffer.concat([buffer, this.transaction.to[i].serializeOutputForSignature(app)])
    }
    buffer = Buffer.concat([buffer, Buffer.from(app.binary.u32AsBytes(this.transaction.type)), Buffer.from(this.transaction.m)])
    return Uint8Array.from(buffer);
  }


  sign(app) {
    //
    // set slip ordinals
    //
    for (let i = 0; i < this.transaction.to.length; i++) { this.transaction.to[i].sid = i; }
    this.transaction.m = this.msg;
    this.transaction.sig = app.crypto.signMessage(this.serializeForSignature(app), app.wallet.returnPrivateKey());
  }


  validate() {

    for (let i = 0; i < this.transaction.from.length; i++) {
      if (this.transaction.from[i].validate() != true) {
	return false;
      }
    }

    return true;

  }

  generateMetadata() {

  }

  generateMetadataCumulativeFees(){ return 0; }
  generateMetadataCumulativeWork(){ return 0; }
}

Transaction.TransactionType = TransactionType;
Transaction.TRANSACTION_SIZE = TRANSACTION_SIZE;
Transaction.SLIP_SIZE = SLIP_SIZE;
Transaction.HOP_SIZE = HOP_SIZE;

module.exports = Transaction;

