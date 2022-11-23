const saito = require("./../../lib/saito/saito");
const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/new-ui/saito-header/saito-header');
const ArcadeMain = require("./lib/main");
const ArcadeLeftSidebar = require("./lib/arcade-left-sidebar");
const ArcadeRightSidebar = require("./lib/arcade-right-sidebar");
const ArcadeDetails = require("./lib/arcade-details");

class xArcade extends ModTemplate {

  constructor(app) {
    super(app);

    this.appname = "Arcade";
    this.name = "Arcade";
    this.description = "Interface for creating and joining games coded for the Saito Open Source Game Engine.";
    this.categories = "Games Entertainment";
    this.slug = "xarcade";

    this.styles = [
      '/saito/saito.css',
      '/xarcade/css/styles.css',
    ];

    return this;
  }

  initialize(app) {
    super.initialize(app);
  }

  render(app, mod) {

    if (this.main == null) {
      this.main = new ArcadeMain(app, mod);
      this.header = new SaitoHeader(app, mod);
      this.sidebar_left = new ArcadeLeftSidebar(app, mod, '.saito-arcade-sidebar.left');
      this.sidebar_right = new ArcadeRightSidebar(app, mod, '.saito-arcade-sidebar.right');
      this.arcade_details = new ArcadeDetails(app, mod, '.saito-arcade-main');

      this.addComponent(this.header);
      this.addComponent(this.main);
      this.addComponent(this.sidebar_left);
      this.addComponent(this.sidebar_right);
      this.addComponent(this.arcade_details);
    }

    super.render(app, this);
  }
}

module.exports = xArcade;

