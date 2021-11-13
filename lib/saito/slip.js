'use strict';
const saito = require('./saito');

class Slip {

  constructor(publickey="", amount="", type=1, uuid="", slip_ordinal=0, payout=0, lc=1) {

    //
    // consensus variables
    //
    this.publickey = publickey;
    this.amount = amount;
    this.type = type;
    this.uuid = uuid;
    this.slip_ordinal = slip_ordinal;

    //
    // non-consensus variables
    //
    this.lc = lc;		// longest-chain
    this.timestamp = 0;		// timestamp
    this.payout = payout;	// calculated for staking slips
    this.key = "";		// index in utxoset hashmap

  }


  clone() {
    return new saito.slip(this.publickey, this.amount, this.type, this.uuid, this.slip_ordinal, id, this.payout, this.lc);
  }

  deserialize(app, buffer) {
    this.publickey = app.crypto.stringToHex(buffer.slice(0, 33));
    this.uuid = app.crypto.stringToHex(buffer.slice(33, 65));
    this.amount = app.networkApi.u64FromBytes(buffer.slice(65, 73));
    this.slip_ordinal = app.networkApi.u8FromByte(buffer[73]);
    this.slip_type = app.networkApi.u8FromByte(buffer[SLIP_SIZE - 1]);
  }


  isNonZeroAmount() {
    if (this.amount === "0" || this.amount === "0.0") { return 0; }
    return 1;
  }

  returnKey() {
    return this.publickey + this.uuid + this.amount + this.slip_ordinal;
  }

  /**
   * Serialize Slip
   * @param {Slip} slip
   * @returns {array} raw bytes
   */
  serialize(app, uuid) {

    let publickey = Buffer.from(this.publickey, 'hex');
    let uuidx = Buffer.from(uuid, 'hex');
    let amount = app.networkApi.u64AsBytes(this.amount);
    let slip_ordinal = app.networkApi.u8AsByte(this.slip_ordinal);
    let slip_type = app.networkApi.u8AsByte(this.slip_type);

    return new Uint8Array([
        ...publickey,
        ...uuid,
        ...amount,
        slip_ordinal,
        slip_type,
    ]);
  }

  serializeInputForSignature(app) {
    return this.serialize(app, this.uuid);
  }

  serializeOutputForSignature(app) {
    return this.serialize(app, (new Array(32).fill(0).toString()));
  }

  validate() {
    return true;
  }

}


module.exports = Slip;
