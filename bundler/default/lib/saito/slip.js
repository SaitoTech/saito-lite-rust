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

  isNonZeroAmount() {
    if (this.amt === "0" || this.amt === "0.0") { return 0; }
    return 1;
  }

  returnKey() {
    return this.add + this.uuid + amt + this.sid;
  }

  serializeInputForSignature() {
    return this.add + this.uuid + this.amt + this.sid + this.type;
  }

  serializeOutputForSignature() {
    return this.add + "00000000000000000000000000000000" + this.amt + this.sid + this.type;
  }

  validate() {
    return true;
  }

}


module.exports = Slip;
