'use strict';
const saito = require('./saito');

class Slip {

  constructor(publickey="", amount="0", type=1, uuid="", slip_ordinal=0, payout=0, lc=1) {

    //
    // consensus variables
    //
    this.add = publickey;
    this.amt = amount;
    this.type = type;
    this.uuid = uuid;
    this.sid = slip_ordinal;

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
    this.add = app.crypto.stringToHex(buffer.slice(0, 33));
    this.uuid = app.crypto.stringToHex(buffer.slice(33, 65));
    this.amt = app.binary.u64FromBytes(buffer.slice(65, 73));
    this.sid = app.binary.u8FromByte(buffer[73]);
    this.type = app.binary.u8FromByte(buffer[saito.transaction.SLIP_SIZE - 1]);
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

    let publickey = Buffer.from(this.add, 'hex');
    let uuidx = Buffer.from(uuid, 'hex');
    let amount = app.binary.u64AsBytes(this.amt);
    let slip_ordinal = app.binary.u8AsByte(this.sid);
    let slip_type = app.binary.u8AsByte(this.type);

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
