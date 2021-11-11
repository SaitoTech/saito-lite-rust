'use strict';
const saito = require('./saito');
const Big = require('big.js');


class Miner {

  constructor(app) {
    this.app                = app || {};

    this.mining_active    = false;
    this.mining_speed     = 100;
    this.mining_timer     = null;

    this.target           = "";
    this.difficulty       = 1;

  }

  initialize() {

    this.app.connection.on('BlockchainNewLongestChainBlock', (msg) => {
console.log("MINER HAS RECEIVED NEW LONGEST CHAIN BLOCK EVENT");
      this.stopMining();
      this.startMining(msg.block_hash, msg.difficulty);
    });


  }


  startMining(previous_block_hash, difficulty) {

    this.target = previous_block_hash;
    this.difficulty = difficulty;

    if (this.mining_active) { clearInterval(this.mining_timer); }
    this.mining_active = true;
    this.mining_timer = setInterval(async () => { await this.mine(); }, this.mining_speed);

  }


  stopMining() {

    this.mining_active = false;
    clearInterval(this.mining_timer);

  }


  async mine() {

    if (this.mining_active) {

      let random_hash = this.app.crypto.generateRandomNumber();

      if (this.app.goldenticket.validate(this.target, random_hash, this.app.wallet.returnPublicKey(), this.difficulty)) {
         //this.app.network.propagateTransaction();
         //this.app.mempool.addTransaction();
console.log("we found a valid golden ticket!");
         this.stopMining();
      }
    }

  }

}

module.exports = Miner;

