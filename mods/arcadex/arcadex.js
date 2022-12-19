const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const InviteManager = require("./lib/invite-manager");
const GameWizard = require("./lib/overlays/game-wizard");

class Arcade extends ModTemplate {

  constructor(app) {
    super(app);
    this.name = "Arcadex";
    this.description = "Interface for creating and joining games coded for the Saito Open Source Game Engine.";
    this.categories = "Games Entertainment Utilities";

    this.mods = [];
    this.icon_fa = "fas fa-gamepad";
    this.ui_initialized = false;

    this.styles = ['/arcadex/css/arcade-invites.css'];
    this.debug = false;
  }


  canRenderInto(qs) {
    if (qs === ".redsquare-sidebar") { return true; }
    return false;
  }
  renderInto(qs) {
    if (qs == ".redsquare-sidebar") {
      this.styles = ['/arcadex/css/arcade-join-game-overlay.css','/arcadex/css/arcade-invites.css', '/arcadex/css/arcade-wizard.css'];
      if (!this.renderIntos[qs]) {
        this.renderIntos[qs] = [];
        this.renderIntos[qs].push(new InviteManager(this.app, this, ".saito-sidebar.right"));
      }
      this.attachStyleSheets();
      this.renderIntos[qs].forEach((comp) => { comp.render(); });



      //
      // TEMPORARY event for rendering hardcoded game invite
      //

      let invites = [
        {
          id: "abcd1234",
          game: "twilight",
          name: "Twilight Struggle",
          type: "custom",
          players: 1
        },
        {
          id: "abcd5678",
          game: "solitrio",
          name: "Beleaguered Solitaire",
          type: "standard",
          players: 3
        },
        {
          id: "abcd12346677",
          game: "settlers",
          name: "Settlers of Saitoa",
          type: "standard",
          players: 5
        },
      ]



      for (let i = 0; i < invites.length; i++) {
        this.app.connection.emit('invite-render-request', invites[i]);
      }
    }

  }

  initialize(app) {
    arcade_self = this;
    super.initialize(app);

    app.connection.on("launch-game-wizard", (obj)=>{
      if (obj.game){
        
        arcade_self.styles = [];

        let game_mod = app.modules.returnModule(obj.game);
        if (game_mod) {
          let x = new GameWizard(app, arcade_self, game_mod, obj);
          x.render(app, arcade_self);
        }

      }
    });
  }



}

module.exports = Arcade;
