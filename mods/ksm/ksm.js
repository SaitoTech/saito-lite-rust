const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');

class KSM extends ModTemplate {

  constructor(app) {

    super(app);

    this.appname = "KSM";
    this.name = "KSM";
    this.ticker = "KSM";
    this.description = "Adds support for Mixin-powered KSM transfers on the Saito Network";
    this.categories = "Utility Cryptocurrency Finance";

    // MIXIN STUFF
    this.asset_id = "bced5614-2fdc-3463-a680-0b3e3b32ce2e";
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

module.exports = KSM;


