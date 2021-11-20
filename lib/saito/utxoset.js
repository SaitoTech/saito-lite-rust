'use strict'
const saito         = require('./saito');

class UtxoSet {
  constructor() {
    this.slips          = [];
  }

  update(slipkey, val) {
    this.slips[slipkey] = val;
  }

  validate(slipkey) {
    if (this.slips[slipkey] == 1) { return true; }
    return false;
  }

}

module.exports = UtxoSet;

