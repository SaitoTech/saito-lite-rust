const GameTemplate = require('./../../lib/templates/gametemplate');
const SaitoHeader = require('../../lib/saito/new-ui/saito-header/saito-header');
const ModTemplate = require('../../lib/templates/modtemplate');

class Nwasm extends ModTemplate {

  constructor(app) {
    super(app);

    this.app = app;
    this.name = "Nwasm";
    this.mod_name = "nwasm";
    this.description = "Nwasm testing";
    this.categories = "Games Entertainment";

    return this;
  }

  initialize(app) {
    if (app.BROWSER == 0) { return; }
    super.initialize(app);
  }

  render(app, mod, selector = "") {
    this.header = new SaitoHeader(this.app, this);
    this.header.setClickTarget("/"+this.mod_name);
    this.addComponent(this.header);
    super.render(app, this);
  }

}

module.exports = Nwasm;