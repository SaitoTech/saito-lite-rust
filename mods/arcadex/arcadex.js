const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const InviteManager = require("./lib/invite-manager");

class Arcade extends ModTemplate {

  constructor(app) {
    super(app);
    this.name = "Arcade";
    this.description = "Interface for creating and joining games coded for the Saito Open Source Game Engine.";
    this.categories = "Games Entertainment Utilities";

    this.mods = [];
    this.icon_fa = "fas fa-gamepad";
    this.ui_initialized = false;

    this.styles = [];
    this.debug = false;
  }


  canRenderInto(qs) {
    if (qs === ".redsquare-sidebar") { return true; }
    return false;
  }
  renderInto(qs) {
    if (qs == ".redsquare-sidebar") {
      if (!this.renderIntos[qs]) {
        this.renderIntos[qs] = [];
        this.renderIntos[qs].push(new InviteManager(this.app, this, qs));
      }
      this.attachStyleSheets();
      this.renderIntos[qs].forEach((comp) => { comp.render(); });



      //
      // TEMPORARY event for rendering hardcoded game invite
      //

      let invite = {
        id: "abcd1234"
      }

      this.app.connection.emit('invite-render-request', invite);

    }

  }

  initialize(app) {
    super.initialize(app);


  }

}

module.exports = Arcade;
