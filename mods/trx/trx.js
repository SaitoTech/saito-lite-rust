const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');

class TRX extends ModTemplate {

  constructor(app) {

    super(app);

    this.appname = "TRX";
    this.name = "TRX";
    this.ticker = "TRX";
    this.description = "Adds support for Mixin-powered Ethereum transfers on the Saito Network";
    this.categories = "Utility Cryptocurrency Finance";

    // MIXIN STUFF
    this.asset_id = "25dabac5-056a-48ff-b9f9-f67395dc407c";
    this.chain_id = "25dabac5-056a-48ff-b9f9-f67395dc407c";


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

module.exports = TRX;


