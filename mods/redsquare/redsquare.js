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
    this.styles = ['/saito/saito.css', '/redsquare/css/redsquare-main.css', '/saito/lib/saito-date-picker/style.css'];
    this.scripts = ['/saito/lib/saito-date-picker/script.js'];
    this.main = new RedSquareMain(app);
    this.header = new SaitoHeader(app);

  }


  render(app) {

    // add components
    // this.addComponent(this.main);
    // this.addComponent(this.header);

    // saito-container added and all rendered
    // super.render(app);

    //    this.main.render(app, this);
    //    this.header.render(app, this);
  }

}

module.exports = RedSquare;

