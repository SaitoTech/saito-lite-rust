const ModTemplate = require('../../lib/templates/modtemplate');
const RedSquareMain = require('./lib/main/redsquare-main');
const SaitoHeader = require('../../lib/saito/new-ui/saito-header/saito-header');

class RedSquare extends ModTemplate {

  constructor(app) {

    super(app);

    this.appname = "Red Square";
    this.name = "RedSquare";
    this.slug = "redsquare";
    this.description = "Open Source Twitter-clone for the Saito Network";
    this.categories = "Social Entertainment";

    this.header = new SaitoHeader(app);
    this.main = new RedSquareMain(app);

  }


  render(app) {
    this.header.render(app, this);
    this.main.render(app, this);
  }

}

module.exports = RedSquare;

