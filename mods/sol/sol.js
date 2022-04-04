const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');

class SOL extends ModTemplate {

  constructor(app) {

    super(app);

    this.appname = "SOL";
    this.name = "SOL";
    this.ticker = "SOL";
    this.description = "Adds support for Mixin-powered Solana transfers on the Saito Network";
    this.categories = "Utility Cryptocurrency Finance";

    // MIXIN STUFF
    this.asset_id = "64692c23-8971-4cf4-84a7-4dd1271dd887";
    this.chain_id = "64692c23-8971-4cf4-84a7-4dd1271dd887";

  }
  
  respondTo(type = "") {
    if (type == "mixin-crypto") {
      return {
        name: this.name,
        ticker: this.ticker,
        description: this.description,
        asset_id: this.asset_id,
      };
    }
    return null;
  }

}

module.exports = SOL;


