const Toggler = require('../../lib/saito/saito-ui/dark_mode_toggler');
const ModTemplate = require("../../lib/templates/modtemplate");
const ChirpMain = require("./lib/main/chirp-main");

class Chirp extends ModTemplate {

  constructor(app) {
    super(app);

    this.name = "Chirp";
    this.description = "Twitter-style Social Media Network on Saito";
    this.categories = "Social Information Community";

    this.events = ["chat-render-request"];
    this.icon_fa = "fas fa-crow";
    this.mods = [];
    this.affix_callbacks_to = [];

    this.header = null;
    this.overlay = null;
    this.darkModeToggler = new Toggler(app);

    this.styles = ['/saito/chirp.css'];

  }

  render(app) {

      super.render(app)

      this.darkModeToggler.initialize();
      ChirpMain.render(app, this);

  }

}

module.exports = Chirp;


