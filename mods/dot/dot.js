const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');

class DOT extends ModTemplate {

  constructor(app) {

    super(app);

    this.appname = "DOT";
    this.name = "DOT";
    this.ticker = "DOT";
    this.description = "Adds support for Mixin-powered Polkadot transfers on the Saito Network";
    this.categories = "Utility Cryptocurrency Finance";

    // MIXIN STUFF
    this.asset_id = "54c61a72-b982-4034-a556-0d99e3c21e39";
    this.chain_id = "54c61a72-b982-4034-a556-0d99e3c21e39";

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

module.exports = DOT;


