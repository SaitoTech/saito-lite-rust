const GameTemplate = require('./../../lib/templates/gametemplate');
const NwasmGameOptionsTemplate = require("./lib/nwasm-game-options.template");
const UploadRom = require("./lib/upload-rom");

class Nwasm extends GameTemplate {

  constructor(app) {
    super(app);

    this.app = app;
    this.name = "Nwasm";

    this.gamename = "Nintendo";
    this.description = "The Saito N64 module provides a user-friendly N64 emulator that allows players to backup and play the N64 games you own directly in your browser. Game files are encrypted so only you can access them and uploaded for storage to the cloud.";
    this.categories = "Games Entertainment";

    this.maxPlayers      = 1;
    this.minPlayers      = 1;

    this.load();

    return this;
  }

  returnGameOptionsHTML() {
    return NwasmGameOptionsTemplate(this.app, this);
  }

  initializeGame(game_id) {
    if (!this.game.state) {
      this.game.state = {};
      this.game.queue = [];
      this.game.queue.push("round");
      this.game.queue.push("READY");
    }
  }

  handleGameLoop(msg=null) {

    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {
      let qe = this.game.queue.length-1;
      let mv = this.game.queue[qe].split("\t");
      let shd_continue = 1;

      if (mv[0] === "round") {
        this.game.queue.splice(this.game.queue.length-1, 1);
      }

      if (shd_continue == 0) {
        return 0;
      }
    }
    return 1;
  }


  initializeHTML(app) {
    mod_self = this;
    if (!this.browser_active) { return; }

    super.initializeHTML(app);

    //
    // ADD MENU
    //
    this.menu.addMenuOption({
      text : "Game",
      id : "game-game",
      class : "game-game",
      callback : function(app, game_mod) {
        game_mod.menu.showSubMenu("game-game");
      }
    });
    this.menu.addSubMenuOption("game-game",{
      text : "Upload ROM",
      id : "game-upload-rom",
      class : "game-upload-rom",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.uploadRom(app);
      }
    });
    this.menu.addSubMenuOption("game-game",{
      text : "Save",
      id : "game-save",
      class : "game-save",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
	game_mod.saveGame();
      }
    });
    this.menu.addSubMenuOption("game-game",{
      text : "Load",
      id : "game-load",
      class : "game-load",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
      }
    });

    this.menu.addChatMenu(app, this);
    this.menu.render(app, this);

  }


  saveGameState() {
    myApp.saveLocalState();
  }

  loadGameState() {
    myApp.loadLocalState();
  }

  exportGameState() {
    myApp.exportEep();
  }

  importGameState() {
    myApp.exportEep();
  }

  save() {
    this.app.options.nwasm = this.roms;
    this.app.storage.saveOptions();
  }

  load() {
    if (this.app.options.nwasm) {
      this.roms = this.app.options.nwasm;
      return;
    }
    this.roms = {};
  }


  uploadRom(app) {
    let upoad_rom = new UploadRom(app, this);
    upoad_rom.render(app, this);
  }
  initializeRom(bytearray) {
    myApp.initializeRom(bytearray);
  }

  sendUploadRomTransaction(app, mod, data) {
/***
    let mod_self = this;

    let obj = {
      module: mod_self.name,
      request: "upload rom",
      data: {},
    };

    let newtx = mod_self.app.wallet.createUnsignedTransaction();
    newtx.msg = obj;
    newtx = mod_self.app.wallet.signTransaction(newtx);
    mod_self.app.network.propagateTransaction(newtx);

    return newtx;
***/
  }

}

module.exports = Nwasm;


