'use strict';
const saito = require('./saito');

const SlipType = {
    Normal : 0,
    ATR : 1 ,
    VipInput : 2,
    VipOutput : 3,
    MinerInput : 4,
    MinerOutput : 5,
    RouterInput : 6,
    RouterOutput : 7,
    StakerOutput : 8,
    StakerDeposit : 9,
    StakerWithdrawalPending : 10,
    StakerWithdrawalStaking : 11,
};

class Slip {

  constructor(publickey="", amount="0", type=0, uuid="", slip_ordinal=0, payout=0, lc=1) {

    //
    // consensus variables
    //
    this.add = publickey;
    this.amt = amount;
    this.type = type;
    this.uuid = uuid;
    this.sid = slip_ordinal;

    //
    // modules create using numerals at present, so we
    // handle SlipType this way for backwards compatibility
    // but use a SlipType so that new code can set directly
    // as needed, and we have an upgrade path.
    //
    if (type == 0) { this.type = SlipType.Normal; }
    if (type == 1) { this.type = SlipType.ATR; }
    if (type == 2) { this.type = SlipType.VipInput; }
    if (type == 3) { this.type = SlipType.VipOutput; }
    if (type == 4) { this.type = SlipType.MinerInput; }
    if (type == 5) { this.type = SlipType.MinerOutput; }
    if (type == 6) { this.type = SlipType.RouterInput; }
    if (type == 7) { this.type = SlipType.RouterOutput; }
    if (type == 8) { this.type = SlipType.StakerInput; }
    if (type == 9) { this.type = SlipType.StakerOutput; }
    if (type == 10) { this.type = SlipType.StakerWithdrawalPending; }
    if (type == 11) { this.type = SlipType.StakerWithdrawalStaking; }

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
    if (this.amt === "0" || this.amt === "0.0") { return 0; }
    return 1;
  }

  returnKey() {
    return this.add + this.uuid + this.amt + this.sid;
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
   * @returns {array} raw bytes
   */
  serialize(app, uuid="") {

    if (uuid === "") { uuid = this.uuid; }

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
