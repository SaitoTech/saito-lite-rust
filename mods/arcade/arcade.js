const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const ArcadeMain = require("./lib/main/main");
const SaitoHeader = require("./../../lib/saito/ui/saito-header/saito-header");
const InviteManager = require("./lib/invite-manager");
const GameWizard = require("./lib/overlays/game-wizard");

class Arcade extends ModTemplate {

  constructor(app) {
    super(app);
    this.name = "Arcade";
    this.description = "Interface for creating and joining games coded for the Saito Open Source Game Engine.";
    this.categories = "Games Entertainment Utilities";

    this.mods = [];
    this.games = [];

    this.icon_fa = "fas fa-gamepad";
    this.ui_initialized = false;

    this.styles = ['/arcade/style.css', '/arcade/css/arcade-join-game-overlay.css','/arcade/css/arcade-invites.css', '/arcade/css/arcade-wizard.css'];
    this.debug = false;
  }

  canRenderInto(qs) {
    if (qs === ".redsquare-sidebar") { return true; }
    return false;
  }

  renderInto(qs) {

    console.log("qs");
    console.log(qs);

    if (qs == ".redsquare-sidebar") {
   
      if (!this.renderIntos[qs]) {
        this.renderIntos[qs] = [];
        let obj = new InviteManager(this.app, this, ".saito-sidebar.right");
        obj.type = "short";
        this.renderIntos[qs].push(obj);
      }
    }

    if (qs == ".arcade-invites-box") {
      if (!this.renderIntos[qs]) {
        this.renderIntos[qs] = [];
        let obj = new InviteManager(this.app, this, ".arcade-invites-box");
        obj.type = "long";
        this.renderIntos[qs].push(obj);
      }
 
    }

    if (this.renderIntos[qs] != null && this.renderIntos[qs].length > 0) {
       console.log(this.renderIntos);   
      this.renderIntos[qs].forEach((comp) => { comp.render(); });
    }


    // temporary invite render
    if (qs == ".redsquare-sidebar" || qs == ".arcade-invites-box") {
      this.temporaryInviteRender();
    }
  }


  temporaryInviteRender() {
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


  //
  // this initializes the DOM but does not necessarily show the loaded content
  // onto the page, as we are likely being asked to render the components on
  // the application BEFORE we have any peers capable of feeding us content.
  //
  render() {
    
    if (this.main == null) {
      this.main = new ArcadeMain(this.app, this);
      this.header = new SaitoHeader(this.app, this);
      this.addComponent(this.header);
      this.addComponent(this.main);
    }

    this.app.modules.returnModulesRespondingTo("chat-manager").forEach((mod) => {
      let cm = mod.respondTo("chat-manager");
      cm.container = ".saito-sidebar.left";
      this.addComponent(cm);
    });
    
    super.render();
    
  } 
    


  //
  //
  //
  initialize(app) {

    arcade_self = this;
    super.initialize(app);

    //
    // list of arcade games
    //
    app.modules.respondTo("arcade-games").forEach(game_mod => {
console.log("ADDING: " + game_mod.returnName());
      arcade_self.games.push(game_mod);
    });

    //
    // initiate game wizard and listener inside constructor for invites
    //
    let x = new GameWizard(app, arcade_self, null, {});

  }


}

module.exports = Arcade;
