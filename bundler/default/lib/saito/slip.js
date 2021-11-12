'use strict';
const saito = require('./saito');

class Slip {

  constructor(add="", amt="", type="", uuid="", sid=1, payout=0, lc=1) {

    //
    // consensus variables
    //
    this.add = add;
    this.amt = amt;
    this.type = type;
    this.uuid = uuid;
    this.sid = sid;
    this.type = type;

    //
    // non-consensus variables
    //
    this.ts = 0;
    this.payout = 0;
    this.key = "";

  }


  clone() {
    return new saito.slip(this.add, this.amt, this.type, this.uuid, this.sid, this.payout, this.lc);
  }

  deserialize(app, buffer) {
    let publickey = app.crypto.stringToHex(buffer.slice(0, 33));
    let uuid = app.crypto.stringToHex(buffer.slice(33, 65));
    let amount = app.networkApi.u64FromBytes(buffer.slice(65, 73));
    let slip_ordinal = app.networkApi.u8FromByte(buffer[73]);
    let slip_type = app.networkApi.u8FromByte(buffer[SLIP_SIZE - 1]);
    return {
      publickey: publickey,
      uuid: uuid,
      amount: amount,
      slip_ordinal: slip_ordinal,
      slip_type: slip_type
    };
  }


  isNonZeroAmount() {
    if (this.amt === "0" || this.amt === "0.0") { return 0; }
    return 1;
  }

  returnKey() {
    return this.add + this.uuid + amt + this.sid;
  }

  /**
   * Serialize Slip
   * @param {Slip} slip
   * @returns {array} raw bytes
   */
  serialize(app) {

    let publickey = Buffer.from(this.publickey, 'hex');
    let uuid = Buffer.from(this.uuid, 'hex');
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

  serializeInputForSignature() {
    return this.add + this.uuid + this.amt + this.sid + this.type;
  }

  serializeOutputForSignature() {
    return this.add + (new Array(32).fill(0).toString()) + this.amt + this.sid + this.type;
  }

  validate() {
    return true;
  }

}


module.exports = Slip;
