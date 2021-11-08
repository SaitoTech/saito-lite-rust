 saito = require('./saito');
const Big = require('big.js');

class Blockchain {

  constructor(app) {

    this.app                   = app || {};
    this.genesis_period        = 10;

    this.blockring 	       = new saito.blockring(this.app);  
    this.staking	       = new saito.staking(this.app);
  }

  initialize() {
    this.app.miner.startMining(this.returnLatestBlockHash(), this.returnDifficulty());
  }

  returnDifficulty() {
    return 1;
  }

  returnGenesisPeriod() {
    return this.genesis_period;
  }

  //  TODO fix
  returnLowestSpendableBlock() {
    return 0;
  }

  returnLatestBlock() {
    return null;
  }

  returnLatestBlockHash() {
    return "";
  }

  returnLatestBlockId() {
    return 0;
  }

}

module.exports = Blockchain;

