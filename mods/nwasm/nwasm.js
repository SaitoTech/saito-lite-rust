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

    this.active_rom = null;
    this.active_game = null;

    this.game_logs = [];

    return this;
  }

  returnGameOptionsHTML() {
    return NwasmGameOptionsTemplate(this.app, this);
  }


  async onPeerHandshakeComplete(app, peer) {

    let nwasm_self = this;

console.log("LOADING TXS FROM ARCHIVE");
    this.app.storage.loadTransactions("Nwasm", 10, (txs) => {
console.log("retrieved tx from storage");
      if (txs.length > 0) {
console.log("length > 0");
        let tx = txs[0];
        let txmsg = tx.returnMessage();
        let data = txmsg.data;
console.log("data: " + data);
	let binary_data = nwasm_self.convertBase64ToByteArray(data);
	nwasm_self.active_game = binary_data;
        console.log("LOADED: " + data);
      }
    });

  }

  initializeGame(game_id) {

    let nwasm_self = this;

    if (!this.game.state) {
      this.game.state = {};
      this.game.queue = [];
      this.game.queue.push("round");
      this.game.queue.push("READY");
    }

    //
    // when games are saved in the emulator
    //
    this.app.connection.on("nwasm-export-game-save", (savegame) => {
      nwasm_self.active_game = savegame;
      nwasm_self.saveGameFile(savegame);
    });

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
        game_mod.uploadRom(app, game_mod);
      }
    });
    this.menu.addSubMenuOption("game-game",{
      text : "Instant Save",
      id : "game-save",
      class : "game-save",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
	game_mod.saveState();
      }
    });
    this.menu.addSubMenuOption("game-game",{
      text : "Instant Load",
      id : "game-load",
      class : "game-load",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
	game_mod.loadState();
      }
    });
    this.menu.addSubMenuOption("game-game",{
      text : "Export Tx",
      id : "game-export",
      class : "game-export",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
	game_mod.exportState();
      }
    });
    this.menu.addSubMenuOption("game-game",{
      text : "Import Tx",
      id : "game-import",
      class : "game-import",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
	game_mod.importState();
      }
    });
    this.menu.addChatMenu(app, this);
    this.menu.render(app, this);
  }


  uploadRom(app) {
    let upload_rom = new UploadRom(app, this);
    upload_rom.render(app, this);
  }

  initializeRom(bytearray) {
    myApp.initializeRom(bytearray);
  }




  saveRomFile(data) {

    console.log("save rom file: " + data);

    let base64data = this.convertByteArrayToBase64(data);

    console.log("save rom file: " + base64data);

    let obj = {
      module: this.name,
      request: "upload rom",
      data: base64data,
    };

    let newtx = this.app.wallet.createUnsignedTransaction();
    newtx.msg = obj;
    // temp not signing
console.log("BEFORE SIGN TX");
    newtx = this.app.wallet.signTransaction(newtx);
console.log("AFTER SIGN TX");
    this.app.storage.saveTransaction(newtx);

  }
  saveGameFile(data) {

    console.log("save game file: " + data);

    let base64data = this.convertByteArrayToBase64(data);

    console.log("save game file: " + base64data);

    let obj = {
      module: this.name,
      request: "upload savegame",
      data: base64data,
    };

    let newtx = this.app.wallet.createUnsignedTransaction();
    newtx.msg = obj;
    // temp not signing
console.log("BEFORE SIGN TX");
    newtx = this.app.wallet.signTransaction(newtx);
console.log("AFTER SIGN TX");
    this.app.storage.saveTransaction(newtx);

  }

  convertByteArrayToBase64(data) {
    return Buffer.from(data, 'binary').toString('base64');;
  } 

  convertBase64ToByteArray(data) {
    let b = Buffer.from(data, 'base64');
    let ab = new ArrayBuffer(b.length);
    let view = new Uint8Array(ab);
    for (let i = 0; i < b.length; ++i) {
      view[i] = b[i];
    }
    return ab;
  }

  saveState() {
    myApp.saveStateLocal();
  }

  loadState() {
    myApp.loadStateLocal();
  }

  exportState() {
    myApp.saveStateLocal();
    myApp.exportStateLocal();
  }

  importState() {
    if (this.active_game == null) {
      alert("Load from Transaction not done yet!");
    } else {
      myApp.importStateLocal();
    }
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

}

module.exports = Nwasm;


