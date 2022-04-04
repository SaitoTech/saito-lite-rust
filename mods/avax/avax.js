const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');

class BTC extends ModTemplate {

  constructor(app) {

    super(app);

    this.appname = "AVAX";
    this.name = "AVAX";
    this.ticker = "AVAX";
    this.description = "Adds support for Mixin-powered AVAX transfers on the Saito Network";
    this.categories = "Utility Cryptocurrency Finance";

    // MIXIN STUFF
    this.asset_id = "cbc77539-0a20-4666-8c8a-4ded62b36f0a";
    this.chain_id = "cbc77539-0a20-4666-8c8a-4ded62b36f0a";

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

module.exports = AVAX;


