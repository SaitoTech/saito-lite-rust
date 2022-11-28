const saito = require('./../../lib/saito/saito');
const GameTemplate = require('./../../lib/templates/gametemplate');
const NwasmGameOptionsTemplate = require("./lib/nwasm-game-options.template");
const UploadRom = require("./lib/upload-rom");
const ControlsOverlay = require("./lib/controls");
const NwasmLibrary = require("./lib/libraries");
const SaveGameOverlay = require("./lib/save-games");
const JSON = require("json-bigint");
const xorInplace = require('buffer-xor/inplace');

//
// ROMS -- saved as 'Nwams' modules
// SAVEGAMES --- saved as 'NwasmGAMESIG' (hash of title)
//
class Nwasm extends GameTemplate {

  constructor(app) {
    super(app);

    this.app = app;
    this.name = "Nwasm";

    this.gamename = "Nintendo 64";
    this.description = "The Saito Nintendo 64 emulator provides a user-friendly in-browser N64 emulator that allows players to archive and play the N64 games you own directly in your browser. Game files are encrypted so only you can access them and archived in your private transaction store.";
    this.categories = "Games Entertainment";

    this.maxPlayers      = 1;
    this.minPlayers      = 1;
    this.winnable        = 0;

    this.uploader        = null;

    this.load();

    this.libraries = {}; // ANY available libraries of games. 

    this.active_rom = null;
    this.active_rom_name = "";
    this.active_rom_sig = "";
    this.active_game = new ArrayBuffer(8);
    this.active_game_img = "";
    this.active_game_saves = [];

    this.active_game_time_played = 0;
    this.active_game_load_ts = 0;
    this.active_game_save_ts = 0;

    this.uploaded_rom = false;

    return this;
  }



  async handlePeerRequest(app, message, peer, mycallback = null) {
    //
    // this code doubles onConfirmation
    //
    if (message.request === "nwasm testing") {
      mycallback("HPR RESPONSE FROM NWASM");
      return;
    }

    super.handlePeerRequest(app, message, peer, mycallback);

  }
  

  startPlaying(ts=null) {
    if (ts == null) { ts = new Date().getTime(); }
    this.active_game_load_ts = ts;
    this.active_game_save_ts = ts;
  }
  stopPlaying(ts=null) {
    if (ts == null) { ts = new Date().getTime(); }
    this.active_game_time_played += (ts - this.active_game_load_ts);
    this.active_game_load_ts = ts;
  }

  respondTo(type="") {
    if (super.respondTo(type) != null) {
      return super.respondTo(type);
    }
    if (type === "library-collection") {
      return { module : "Nwasm" , collection : "Nwasm" , key : this.nwasm.random };
    }
    return null;
  }

  ////////////////////
  // initialization //
  ////////////////////
  initialize(app) {

    if (app.BROWSER == 0) { return; }
    super.initialize(app);
    if (this.browser_active == 0) { return; }

    //
    // if we have a library, we may have games...
    //
    let library_mod = app.modules.returnModule("Library");
    if (library_mod) {
      let collection = library_mod.returnCollection("Nwasm", app.wallet.returnPublicKey());
      if (collection.length > 0) {
        this.addCollectionToLibrary(app.wallet.returnPublicKey(), collection);
        this.updateVisibleLibrary();
      }
    }   

    //
    // monitor log
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

  initializeHTML(app) {
    mod_self = this;
    if (!this.browser_active) { return; }

    super.initializeHTML(app);

    //
    // ADD MENU
    //
    this.menu.addMenuOption("game-game", "Game");
    this.menu.addSubMenuOption("game-game",{
      text : "Upload ROM",
      id : "game-upload-rom",
      class : "game-upload-rom",
      callback : function(app, game_mod) {
	game_mod.uploaded_rom = false;
	game_mod.active_rom_name = "";
        game_mod.menu.hideSubMenus();
        game_mod.uploadRom(app, game_mod);
      }
    });
    this.menu.addSubMenuOption("game-game",{
      text : "Controls",
      id : "game-controls",
      class : "game-controls",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.editControls(app, game_mod);
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
    this.menu.addSubMenuOption("game-game", {
        text : "Share",
        id : "game-share",
        class : "game-share",
        callback : async function(app, game_mod) {
          let m = game_mod.app.modules.returnModule("RedSquare");
          if (m){
            let log = document.getElementById("log-wrapper");
            if (log && !log.classList.contains("log_lock")) { log.style.display = "none"; }
            let menu = document.getElementById("game-menu");
            menu.style.display = "none";
            await app.browser.screenshotCanvasElementById("canvas", function(image) {
              if (log && !log.classList.contains("log_lock")) { log.style.display = "block"; }
              menu.style.display = "block";
              SAITO_COMPONENT_ACTIVE = true;
              SAITO_COMPONENT_CLICKED = true;
              m.tweetImage(image);
            });
            game_mod.menu.hideSubMenus();
          }
        },
    });
    this.menu.addSubMenuOption("game-game",{
      text : "Import Tx",
      id : "game-import",
      class : "game-import",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
	let x = new SaveGameOverlay(app, game_mod);
	x.render(app, game_mod);
	//game_mod.importState();
      }
    });


    this.menu.addMenuOption("game-remove", "Delete Roms");
    this.menu.addSubMenuOption("game-remove",{
      text : "Delete ROMs",
      id : "game-rom-delete",
      class : "game-rom-delete",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
	let c = confirm("Confirm: delete all ROMS?");
	if (c) {
	  game_mod.deleteRoms();
	  game_mod.libraries = {};
	  game_mod.updateVisibleLibrary();
	}
      }
    });

    this.menu.addChatMenu(app, this);
    this.menu.render(app, this);
  }

  deleteRoms() {

    let message = {};
        message.request = "library delete";
        message.data = {};
        message.data.collection = "Nwasm";
        message.data.publickey = this.app.wallet.returnPublicKey();

	let library_mod = this.app.modules.returnModule("Library");
	if (library_mod) {
	  library_mod.handlePeerRequest(this.app, message, null, function() {
            nwasm_mod.libraries = {};
	    nwasm_mod.save();
            nwasm_mod.updateVisibleLibrary();
	  });
	}
  }

  initializeRom(bytearray) {
    this.active_game_saves = [];
    myApp.initializeRom(bytearray);
    this.hideLibrary();
  }

  returnGameOptionsHTML() {
    return NwasmGameOptionsTemplate(this.app, this);
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
console.log("RECEIVED LIBRARY: " + JSON.stringify(res));
	  if (res.length > 0) {
            nwasm_mod.addCollectionToLibrary(peer.peer.publickey, res);
            nwasm_mod.updateVisibleLibrary();
	  }
    	}, peer);
 

    //
    //
    //
    //this.app.storage.loadTransactions("Nwasm", 10, (txs) => {
    //  if (txs.length > 0) {
    //    let tx = txs[0];
    //    let txmsg = tx.returnMessage();
    //    let data = txmsg.data;
    //	let binary_data = nwasm_self.convertBase64ToByteArray(data);
    //	nwasm_self.active_rom = binary_data;
    //  }
    //});
    //
  }


  hideSplashScreen() {

    let obj = null;

    obj = document.querySelector(".nwasm-instructions");
    if (obj) { obj.style.display = "none"; }

    obj = document.querySelector(".afterLoad");
    if (obj) { obj.style.display = "none"; }
    
  }

  hideLibrary() {

    this.hideSplashScreen();

    let obj = document.getElementById("nwasm-libraries");
    if (obj) { obj.style.display = "none"; }

  }

  updateVisibleLibrary() {
    this.hideSplashScreen();
    let nlib = new NwasmLibrary(this.app, this);
    nlib.render(this.app, this);
  }

  addCollectionToLibrary(publickey, collection) {
    this.libraries[publickey] = collection;
  }

  //
  // for the love of God don't add console.logs within this function
  //
  processNwasmLog(logline="", log) {

    let x = logline;
    let nwasm_self = this;

    if (logline.indexOf("detected emulator started") == 0) {
      if (this.uploader != null) {
        this.uploader.overlay.hide();
      }
    }

    if (logline.indexOf("mupen64plus: ") == 0) {
      x = logline.substring(13);
      if (x.indexOf("Name: ") == 0) {
        x = x.substring(6);
	if (x.indexOf("muopen") > -1) {
	  x = x.substring(0, x.indexOf("muopen"));
	}

	let len = x.trim().length; if (len > 6) { len = 6; }

	if (this.active_rom_name.indexOf(x.trim().substring(0, len)) != 0) {

          this.active_rom_name = x.trim();
          this.active_rom_sig = this.app.crypto.hash(this.active_rom_name);

          //
          // archive the rom
          //
          if (this.uploaded_rom == false && this.active_rom_name !== "") {
            //
            // save ROM in archives --dynamically is best
            //
            this.uploaded_rom = true;
	    let similar_rom_exists = false;
	    for (let item in this.libraries[this.app.wallet.returnPublicKey()]) {
	      if (item.title === this.active_rom_name) { similar_rom_exists = true; }
	    }
	    if (this.browser_active) {
	      if (similar_rom_exists) {
	        let c = confirm("Archive: ROM with this name already archived - is this a separate lawful copy?");
	        if (c) {
                  this.saveRomFile(this.active_rom);
	        }
	      } else {
                this.saveRomFile(this.active_rom);
	      }
	    }
          }


	  //
	  // load 5 saved games
	  //
          this.app.storage.loadTransactions(("Nwasm"+this.active_rom_sig), 5, function(txs) {
            try {
	      for (let z = 0; z < txs.length; z++) {
                let newtx = new saito.default.transaction(txs[z].transaction);
                nwasm_self.active_game_saves.push(newtx);
              }
            } catch (err) {
              log("error loading Nwasm game...: " + err);
            }
          });

	}
      }
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

  editControls(app) {
    this.controls = new ControlsOverlay(app, this);
    this.controls.render(app, this);
  }
  uploadRom(app) {
    this.uploader = new UploadRom(app, this);
    this.uploader.render(app, this);
  }

  //////////////////
  // transactions //
  //////////////////
  loadRomFile(tx) {

    let txmsg = tx.returnMessage();
    let ab = this.convertBase64ToByteArray(this.xorBase64(txmsg.data));

    //
    // prevents us saving the file, this is an already uploaded rom
    //
    this.uploaded_rom = true;
    this.active_game_saves = [];

    this.startPlaying();

    //
    // initialize ROM gets the ROM the APP and the MOD
    //
    myApp.initializeRom(ab, this.app, this);

  }
  async saveRomFile(data) {

    let nwasm_self = this;

    let base64data = this.xorBase64(this.convertByteArrayToBase64(data));
    let added_to_library = 0;
    let iobj = document.querySelector(".nwasm-upload-instructions");

    //
    // larger tx, so we use subrequest and manually handle the save
    // transaction process...
    //
    let obj = {
      module: this.name,
      id: this.app.crypto.hash(this.active_rom_name) ,
      title: this.active_rom_name.trim() ,
      request: "archive save",
      subrequest: "archive rom",
      data: base64data,
    };

    if (iobj) { iobj.innerHTML = "bundling ROM into archive file..."; }

    let newtx = this.app.wallet.createUnsignedTransaction();
    newtx.msg = obj;
    
    document.querySelector('.loader').classList.add("steptwo");

    if (iobj) { iobj.innerHTML = "cryptographically signing archive file..."; }
    newtx = this.app.wallet.signTransaction(newtx);

    if (iobj) { iobj.innerHTML = "uploading archive file: "+newtx.transaction.m.length+" bytes"; }

    this.app.network.sendTransactionWithCallback(newtx, async function (res) {

      if (iobj) { iobj.innerHTML = "archive upload completed..."; }

      if (added_to_library == 1) { return; }
      added_to_library = 1;
      nwasm_self.app.connection.emit("save-transaction", newtx);

      if (iobj) { iobj.innerHTML = "adding to personal library..."; }    

    });

  }


  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  loadSaveGame(sig) {
    for (let i = 0; i < this.active_game_saves.length; i++) {
      let newtx = this.active_game_saves[i];
      if (sig === newtx.transaction.sig) {
        let txmsg = newtx.returnMessage();
        let byteArray = this.convertBase64ToByteArray(txmsg.data);
        this.active_game = byteArray;
        myApp.loadStateLocal();
      }
    }
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
        nwasm_mod.active_game = byteArray;
        mwasm_mod.active_game_time_played = txmsg.time_played;
	nwasm.startPlaying();
        myApp.loadStateLocal();
      } catch (err) {
        console.log("error loading Nwasm game...: " + err);
      }
    });
  }
  async saveGameFile(data) {

    let base64data = this.convertByteArrayToBase64(data);
    let screenshot = await this.app.browser.resizeImg(this.active_game_img);

console.log("screenshot: " + screenshot);

    let newtx = this.app.wallet.createUnsignedTransaction();

    this.stopPlaying();

    let obj = {
      module: (this.name + this.active_rom_sig),
      request: "upload savegame",
      name: this.active_rom_name.trim() ,
      screenshot: screenshot,
      time_played: this.active_game_time_played ,
      data: base64data,
    };

    newtx.msg = obj;
    newtx = this.app.wallet.signTransaction(newtx);
    this.app.storage.saveTransaction(newtx);

    this.active_game_saves.push(newtx);

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
  xorBase64(data) {
    let b = Buffer.from(data, 'base64');
    let r = Buffer.from(this.nwasm.random, 'utf8');
    return xorInplace(b, r).toString('base64');
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
    let nwasm_mod = this;
    this.app.browser.screenshotCanvasElementById("canvas", function(img) {
      nwasm_mod.active_game_img = img;
      myApp.saveStateLocal();
      myApp.exportStateLocal();
    });
  }

  importState() {
    if (this.active_game == null) {
      alert("Load from Transaction not done yet!");
    } else {
      this.loadGameFile();
    }
  }

  save() {
    this.app.options.nwasm = this.nwasm;
    this.app.storage.saveOptions();
  }

  load() {
    if (this.app.options.nwasm) {
      this.nwasm = this.app.options.nwasm;
      return;
    }
    this.nwasm = {};
    this.nwasm.random = this.app.crypto.generateRandomNumber();
    this.save();
  }

}

module.exports = Nwasm;


