const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');

class BSV extends ModTemplate {

  constructor(app) {

    super(app);

    this.appname = "BSV";
    this.name = "BSV";
    this.ticker = "BSV";
    this.description = "Adds support for Mixin-powered BSV transfers on the Saito Network";
    this.categories = "Utility Cryptocurrency Finance";

    // MIXIN STUFF
    this.asset_id = "574388fd-b93f-4034-a682-01c2bc095d17";
    this.chain_id = "574388fd-b93f-4034-a682-01c2bc095d17";

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

module.exports = BSV;


