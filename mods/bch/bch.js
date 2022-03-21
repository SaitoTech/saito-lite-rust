const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');

class BCH extends ModTemplate {

  constructor(app) {

    super(app);

    this.appname = "BCH";
    this.name = "BCH";
    this.ticker = "BCH";
    this.description = "Adds support for Mixin-powered BSV transfers on the Saito Network";
    this.categories = "Utility Cryptocurrency Finance";

    // MIXIN STUFF
    this.asset_id = "fd11b6e3-0b87-41f1-a41f-f0e9b49e5bf0";
    this.chain_id = "fd11b6e3-0b87-41f1-a41f-f0e9b49e5bf0";

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

module.exports = BCH;


