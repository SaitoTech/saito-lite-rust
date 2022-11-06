const saito = require('./../../lib/saito/saito');
const GameTemplate = require('./../../lib/templates/gametemplate');
const NwasmGameOptionsTemplate = require("./lib/nwasm-game-options.template");
const UploadRom = require("./lib/upload-rom");
const NwasmLibrary = require("./lib/libraries");
const JSON = require("json-bigint");

//
// ROMS -- saved as 'Nwams' modules
// SAVEGAMES --- saved as 'NwasmGAMESIG' (hash of title)
//
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


    this.libraries = {}; // ANY available libraries of games. 

    this.active_rom = null;
    this.active_rom_name = "";
    this.active_rom_sig = "";
    this.active_rom_manufacturer = "";
    this.active_game = new ArrayBuffer(8);

    this.uploaded_rom = false;


    return this;
  }

  returnGameOptionsHTML() {
    return NwasmGameOptionsTemplate(this.app, this);
  }



  respondTo(type="") {

    if (super.respondTo(type) != null) {
      return super.respondTo(type);
    }

    if (type === "library-collection") {
      return { module : "Nwasm" , collection : "Nwasm" };
    }

    return null;

  }



  onPeerHandshakeComplete(app, peer) {

    if (!app.BROWSER) { return; }

    let nwasm_mod = this;

    //
    // query for collection info
    //
    let message = {};
        message.request = "library collection";
        message.data = {};
        message.data.collection = "Nwasm";
        app.network.sendRequestWithCallback(message.request, message.data, function(res) {
          nwasm_mod.addCollectionToLibrary(peer.peer.publickey, res);
          nwasm_mod.updateVisibleLibrary();
	}, peer);
 
  }

  hideLibrary() {
    let obj = document.getElementById("nwasm-libraries");
    if (obj) { obj.style.display = "none"; }
  }

  updateVisibleLibrary() {
    let nlib = new NwasmLibrary(this.app, this);
    nlib.render(this.app, this);
  }

  addCollectionToLibrary(publickey, collection) {
    this.libraries[publickey] = collection;
  }

  initialize(app) {

    if (app.BROWSER == 0) { return; }
    super.initialize(app);


    //
    // if we have a library, we may have games...
    //
    // this is not the purest way to handle cross-module interactivity, but it is fast
    // and we should come back and clean this up once we know exactly how we want modules
    // to work.
    //
    let library_mod = app.modules.returnModule("Library");
    if (library_mod) {
      let collection = library_mod.returnCollection("Nwasm");
      if (collection.length > 0) {
        this.addCollectionToLibrary(app.wallet.returnPublicKey(), collection);
        this.updateVisibleLibrary();
      }
    }   



    //
    // monitor log to extra game name
    //
    if (this.browser_active == 1) {
      {
        const log = console.log.bind(console)
        console.log = (...args) => {
          if (args.length > 0) {
            if (typeof args[0] === 'string') {
              this.processNwasmLog(args[0], log);
            }
            log(...args);
          }
        }
      }
    }
  }

  //
  // for the love of God don't add console.logs within this function
  //
  processNwasmLog(logline="", log) {

    let x = logline;

    if (logline.indexOf("mupen64plus: ") == 0) {
      x = logline.substring(13);
      if (x.indexOf("Name: ") == 0) {
        x = x.substring(6);
        this.active_rom_name = x.trim();
        this.active_rom_sig = this.app.crypto.hash(x.trim());
      }
      if (x.indexOf("Manufacturer: ") == 0) {
        x = x.substring(14);
        this.active_rom_manufacturer = x;
      }
    }

    //
    // upload the rom
    //
    if (this.uploaded_rom == false && this.active_rom_name != "" && this.active_rom_manufacturer != "") {
      //
      // save ROM in archives --dynamically is best
      //
      this.uploaded_rom = true;
      this.saveRomFile(this.active_rom);
    }
  }


  async onPeerHandshakeComplete(app, peer) {

    let nwasm_self = this;

    this.app.storage.loadTransactions("Nwasm", 10, (txs) => {
      if (txs.length > 0) {
        let tx = txs[0];
        let txmsg = tx.returnMessage();
        let data = txmsg.data;
	let binary_data = nwasm_self.convertBase64ToByteArray(data);
	nwasm_self.active_rom = binary_data;
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
    this.hideLibrary();
  }


  //////////////////
  // transactions //
  //////////////////
  loadRomFile(tx) {

    let txmsg = tx.returnMessage();
    let filebase64 = txmsg.data;
    let b = Buffer.from(filebase64, 'base64');

    let ab = new ArrayBuffer(b.length);
    let view = new Uint8Array(ab);
    for (let i = 0; i < b.length; ++i) {
      view[i] = b[i];
    }

    //
    // prevents us saving the file, this is an already uploaded rom
    //
    this.uploaded_rom = true;

    //
    // initialize ROM gets the ROM the APP and the MOD
    //
    myApp.initializeRom(ab, this.app, this);

  }

  saveRomFile(data) {

    let base64data = this.convertByteArrayToBase64(data);

    let obj = {
      module: this.name,
      id: this.app.crypto.hash(this.active_rom_name.trim()) ,
      title: this.active_rom_name.trim() ,
      manufacturer: this.active_rom_manufacturer.trim(),
      request: "upload rom",
      data: base64data,
    };

    let newtx = this.app.wallet.createUnsignedTransaction();
    newtx.msg = obj;
    newtx = this.app.wallet.signTransaction(newtx);
    this.app.storage.saveTransaction(newtx);

  }
  loadGameFile() {

    let nwasm_mod = this;
    let module_type = "Nwasm"+this.active_rom_sig;

    this.app.storage.loadTransactions(("Nwasm"+this.active_rom_sig), 1, function(txs) {

try {
      if (txs.length <= 0) { alert("No Saved Games Available"); }

      let newtx = new saito.default.transaction(txs[0].transaction);
      let txmsg = newtx.returnMessage();

      let byteArray = nwasm_mod.convertBase64ToByteArray(txmsg.data);

      //
      // set this to game byteArray
      //
      nwasm_mod.active_game = byteArray;

      //
      // then load
      //
      myApp.loadStateLocal();

} catch (err) {
console.log("error loading Nwasm game...: " + err);
}

    });


  }
  saveGameFile(data) {

    let base64data = this.convertByteArrayToBase64(data);

    let obj = {
      module: (this.name + this.active_rom_sig),
      name: this.active_rom_name.trim() ,
      manufacturer: this.active_rom_manufacturer.trim(),
      request: "upload savegame",
      data: base64data,
    };

    let newtx = this.app.wallet.createUnsignedTransaction();
    newtx.msg = obj;
    newtx = this.app.wallet.signTransaction(newtx);
    this.app.storage.saveTransaction(newtx);

  }


  /////////////////////
  // data conversion //
  /////////////////////
  convertByteArrayToBase64(data) {
    return Buffer.from(data, 'binary').toString('base64');;
  } 

  convertBase64ToByteArray(data) {
    let b = Buffer.from(data, 'base64');
    let b2 = new Uint8Array(b.length)
    for (let i = 0; i < b.length; ++i) {
      b2[i] = b[i];
    }
    return b2;
  }


  ////////////////////////
  // saving and loading //
  ////////////////////////
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
      // we might want to show a menu with fetch, for now just
      // load whatever is there...
      this.loadGameFile();
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


