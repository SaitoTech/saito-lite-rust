const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');

class ETH extends ModTemplate {

  constructor(app) {

    super(app);

    this.appname = "ETH";
    this.name = "ETH";
    this.ticker = "ETH";
    this.description = "Adds support for Mixin-powered Ethereum transfers on the Saito Network";
    this.categories = "Utility Cryptocurrency Finance";

    // MIXIN STUFF
    this.asset_id = "43d61dcd-e413-450d-80b8-101d5e903357";
    this.chain_id = "43d61dcd-e413-450d-80b8-101d5e903357";


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

module.exports = ETH;


