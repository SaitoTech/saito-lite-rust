'use strict'
const saito         = require('./saito');

class UtxoSet {
  constructor() {
    this.slips          = [];
  }

  isSpendable(idxkey) {
    return true;
  }

}

module.exports = UtxoSet;

