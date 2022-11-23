const saito = require("./../../lib/saito/saito");
const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/new-ui/saito-header/saito-header');
const ArcadeMain = require("./lib/main");

class xArcade extends ModTemplate {

  constructor(app) {
    super(app);

    this.appname = "Arcade";
    this.name = "Arcade";
    this.description = "Interface for creating and joining games coded for the Saito Open Source Game Engine.";
    this.categories = "Games Entertainment";
    this.slug = "arcade";

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

      this.addComponent(this.main);
    }

    super.render(app, this);
  }
}

module.exports = xArcade;

