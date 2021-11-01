 saito = require('./saito');
const Big = require('big.js');

class Blockchain {

  constructor(app) {
    this.app                   = app || {};
  }

  initialize() {

  }

  //  TODO fix
  returnLowestSpendableBlock() {
    return 0;
  }

}

module.exports = Blockchain;

