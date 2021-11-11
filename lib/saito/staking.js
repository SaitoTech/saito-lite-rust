const saito = require('./saito');

class Staking {

  constructor(app) {

    this.app = app || {};

  }

  onChainReorganization(block, lc) {

    return { res_spend : [] , res_unspend : [] , res_delete : [] };

  }


}

module.exports = Staking;


