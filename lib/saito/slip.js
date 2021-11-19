'use strict';
const saito = require('./saito');

const SlipType = {
  Normal: 0,
  ATR: 1,
  VipInput: 2,
  VipOutput: 3,
  MinerInput: 4,
  MinerOutput: 5,
  RouterInput: 6,
  RouterOutput: 7,
  StakerOutput: 8,
  StakerDeposit: 9,
  StakerWithdrawalPending: 10,
  StakerWithdrawalStaking: 11,
  Other: 12,
};

class Slip {

  constructor(publickey = "", amount = "0", type = SlipType.Normal, uuid = "", slip_ordinal = 0, payout = 0, lc = 1) {

    //
    // consensus variables
    //
    this.add = publickey;
    this.amt = BigInt(amount);
    this.type = type;
    this.uuid = uuid;
    this.sid = slip_ordinal;

    //
    // non-consensus variables
    //
    this.lc = lc;			// longest-chain
    this.timestamp = 0;			// timestamp
    this.payout = BigInt(payout);	// calculated for staking slips
    this.key = "";			// index in utxoset hashmap

  }

  returnAmount() { return this.amt; }

  clone() {
    return new saito.slip(this.add, this.amt.toString(), this.type, this.uuid, this.sid, this.payout, this.lc);
  }

  deserialize(app, buffer) {
    this.add = Buffer.from(buffer.slice(0, 33)).toString("hex");
    this.uuid = Buffer.from(buffer.slice(33, 65)).toString("hex");
    this.amt = app.binary.u64FromBytes(buffer.slice(65, 73)).toString();
    this.sid = app.binary.u8FromByte(buffer[73]);
    this.type = app.binary.u32FromBytes(buffer.slice(74, 78));

    // convert to BigInts
    this.amt = BigInt(this.amt);

  }


  isNonZeroAmount() {
    if (this.amt == BigInt(0)) { return 0; }
    return 1;
  }

  returnKey() {
    return this.add + this.uuid + this.amt.toString() + this.sid;
  }

  returnPublicKey() {
    return this.add;
  }

  returnAmount() {
    return this.amt;
  }

  returnPayout() {
    return this.payout;
  }

  /**
   * Serialize Slip
   * @param {Slip} slip
   * @returns {Uint8Array} raw bytes
   */
  serialize(app, uuid="") {

    if (uuid === "") { uuid = this.uuid; }

    let publickey = app.crypto.toSizedArray(this.add, 33);
    let uuidx = app.crypto.toSizedArray(Buffer.from(uuid,"hex"), 32);
    let amount = app.binary.u64AsBytes(this.amt.toString());
    let slip_ordinal = app.binary.u8AsByte(this.sid);
    let slip_type = app.binary.u32AsBytes(this.type);

    return new Uint8Array([
        ...publickey,
        ...uuidx,
        ...amount,
        slip_ordinal,
        ...slip_type,
    ]);
  }

  serializeInputForSignature(app) {
    return this.serialize(app, this.uuid);
  }

  serializeOutputForSignature(app) {
    return this.serialize(app, (new Array(32).fill(0).toString()));
  }

  validate(app) {
    if (this.amt > 0) {
      if (app.utxoset.isSpendable(this.returnKey())) {
	return true;
      } else {
	return false;
      }
    } else {
      return true;
    }
  }

}

Slip.SlipType = SlipType;

module.exports = Slip;
