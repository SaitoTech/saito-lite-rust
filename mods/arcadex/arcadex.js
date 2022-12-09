const saito = require("./../../lib/saito/saito");
const SaitoOverlay = require("../../lib/saito/new-ui/saito-overlay/saito-overlay");
const ModTemplate = require("../../lib/templates/modtemplate");
const Invite = require("./lib/invite");

class Arcade extends ModTemplate {

  constructor(app) {
    super(app);
    this.name = "Arcade";
    this.description = "Interface for creating and joining games coded for the Saito Open Source Game Engine.";
    this.categories = "Games Entertainment Utilities";

    this.mods = [];
    this.affix_callbacks_to = [];
    this.games = []; //Game Invites
    this.old_game_removal_delay = 2000000;
    this.services = [{ service: "arcade", domain: "saito" }];
    this.request_no_interrupts = false; // ask other modules not to insert content

    this.viewing_arcade_initialization_page = 0;
    this.viewing_game_homepage = this.name;

    this.icon_fa = "fas fa-gamepad";

    this.accepted = [];

    this.active_tab = "arcade";
    this.manual_ordering = false; // Toggle this to either sort games by their categories or go by the module.config order

    this.ui_initialized = false;

    this.styles = ['/saito/saito.css', "/arcade/carousel.css", "/arcade/style.css", "/arcade/saito-arcade-invites.css"];

    this.overlay = null;
    this.debug = false;

  }


  renderInto(qs) {
    if (qs == ".redsquare-sidebar") {
      this.invite = new Invite(this.app, this, qs);
      this.attachStyleSheets();
      this.invite.render();
    }

  }

  initialize(app) {
    super.initialize(app);

  }

}

module.exports = Arcade;
