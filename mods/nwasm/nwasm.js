const GameTemplate = require('./../../lib/templates/gametemplate');

class Nwasm extends GameTemplate {

  constructor(app) {
    super(app);

    this.app = app;
    this.name = "Nwasm";
    this.mod_name = "nwasm";
    this.description = "Nwasm testing";
    this.categories = "Games Entertainment";

    return this;
  }

}

module.exports = Nwasm;
