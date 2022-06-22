const ModTemplate = require('../../lib/templates/modtemplate');
const RedSquareMain = require('./lib/main/redsquare-main');
const SaitoHeader = require('../../lib/saito/new-ui/saito-header/saito-header');
const SaitoSidebar = require('../../lib/saito/new-ui/saito-sidebar/saito-sidebar');

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
    this.sidebar = new SaitoSidebar(app);

  }


  render(app, mod) {

    this.addComponent(this.main);
    this.addComponent(this.sidebar);
    this.addComponent(this.header);

    super.render(app);

  }

}

module.exports = RedSquare;

