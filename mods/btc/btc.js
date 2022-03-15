const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');

class BTC extends ModTemplate {

  constructor(app) {

    super(app);

    this.appname = "BTC";
    this.name = "BTC";
    this.ticker = "BTC";
    this.description = "Adds support for Mixin-powered BTC transfers on the Saito Network";
    this.categories = "Utility Cryptocurrency Finance";

    // MIXIN STUFF
    this.asset_id = "c6d0c728-2624-429b-8e0d-d9d19b6592fa";
    this.chain_id = "c6d0c728-2624-429b-8e0d-d9d19b6592fa";

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

module.exports = BTC;


