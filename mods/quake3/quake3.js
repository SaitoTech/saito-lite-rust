const GameTemplate = require('./../../lib/templates/gametemplate');
const QuakeGameOptionsTemplate = require('./lib/quake-game-options.template');


class Quake3 extends GameTemplate {

  constructor(app) {

    super(app);

    this.app = app;
    this.name = "Quake3";
    this.description = "Quake3 is a multiplayer first-person-shooter originally released by ID Software in 1999. This version runs directly in your browser and connects with Saito to use other Saito applications and bring modules right into the game.";
    this.categories = "Games Entertainment";
    this.publisher_message = "Quake 3 is owned by ID Software. This module is made available under an open source license. Your browser will use data-files distributed freely online but please note that the publisher requires purchase of the game to play. Saito recommends GOG.com for purchase.";

    this.minPlayers      = 1;
    this.maxPlayers      = 4;

    // ask chat not to start on launch
    this.request_no_interrupts = true;

    this.content_server  = "q3.saito.io";
    this.game_server  = "q3.saito.io:27959";

    //this.content_server  = "18.163.184.251:80";
    //this.game_server     = "18.163.184.251:27960";
  }


  handleGameLoop() {
    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {
      let qe = this.game.queue.length - 1;
      let mv = this.game.queue[qe].split("\t");
      let shd_continue = 1;

      console.log("QUEUE: " + JSON.stringify(this.game.queue));

      if (mv[0] === "init") {
        return 0;
      }

      if (mv[0] === "player_kill") {

	this.game.queue.splice(qe, 1);
	let victim = mv[1];
	let killer = mv[2];

	let victim_web3_address = "";
	let killer_web3_address = "";

	for (let i = 0; i < this.game.players.length; i++) {
	  if (this.game.players[i] === victim) {
	    victim_web3_address = this.game.keys[i];
	  }
	  if (this.game.players[i] === killer) {
	    killer_web3_address = this.game.keys[i];
	  }
	}

	//
	// victim offers sacrificial tribue
	//
	if (this.game.options.crypto) {
	  if (this.app.wallet.returnPublicKey() === victim) {
	    let ts = new Date().getTime();
	    let ticker = this.game.options.crypto;
            let stake = this.game.options.stake;
	    let uhash = this.app.crypto.hash(`${victim}${killer}${this.game.step.game}`);
	    // the user is proactively sending tokens unsolicited, so we can skip the 
	    // confirmation prompt provided by the crypto-manager.
	    this.app.wallet.sendPayment(
	      [victim_web3_address], 
	      [killer_web3_address],
	      [stake],
	      ts,
	      uhash,
	      function() {
		siteMessage(`${stake} ${ticker} sent in tribute`, 8000);
	      },
	      ticker
            );	  

	  } else {
	    let ts = new Date().getTime();
	    let ticker = this.game.options.crypto;
            let stake = this.game.options.stake;
	    let uhash = this.app.crypto.hash(`${victim}${killer}${this.game.step.game}`);
	    //
	    // monitor for receipt
	    //
            this.app.wallet.receivePayment(
	      [victim_web3_address] ,
	      [killer_web3_address] ,
    	      [stake] ,
    	      ts ,
              uhash ,
              function() {
	        siteMessage(`${stake} ${ticker} received in tribute`, 8000);
	      },
	      ticker
	    );
	  }
	}
        return 1;
      }


      if (mv[0] === "player_name") {
	this.game.queue.splice(qe, 1);
	let publickey = mv[1];
	let name = mv[2];
	this.setPlayerName(publickey, name);
        if (publickey === this.app.wallet.returnPublicKey()) { this.game.player_name_identified = true; }
        return 1;
      }

      //
      // avoid infinite loops
      //
      if (shd_continue == 0) {
        console.log("NOT CONTINUING");
        return 0;
      }

    } else {
      console.log("QUEUE EMPTY!");
    }

    return 1;
  }
  returnGameOptionsHTML() {
    return QuakeGameOptionsTemplate(this.app, this);
  }


  attachAdvancedOptionsEventListeners(){

    let crypto = document.getElementById("crypto");
    let stake = document.getElementById("stake");
    let stake_wrapper = document.getElementById("stake_wrapper");

    const updateChips = function(){
      if (stake) {
        if (crypto.value == ""){
          stake_wrapper.style.display = "none";
          stake.value = "0";
        } else {
          let stakeAmt = parseFloat(stake.value);
          stake_wrapper.style.display = "block";
        }
      }
    };

    if (crypto){
      crypto.onchange = updateChips;
    }
    if (stake){
      stake.onchange = updateChips;
    }

  }


  initializeGame(game_id) {

    if (!this.game.state) {
      console.log("******Generating the Game******");
      this.game.state = {};
      this.game.queue = [];
      this.game.queue.push("init");
      this.game.queue.push("READY");

      //
      // when we join a game, we remember the name
      //
      this.game.player_name_identified = false;
      this.game.player_name = "";
      this.game.all_player_names = [];

      //
      // set player names
      //
      if (this.game?.players) {
        for (let i = 0; i < this.game.players.length; i++) {
          this.game.all_player_names[i] = "";
        }
      }
    }
  }


  initialize(app) {

    if (app.BROWSER == 0) { return; }
    super.initialize(app);

    if (this.browser_active == 1) {
      //
      // bind console.log to track outside app
      //
      {
        const log = console.log.bind(console)
        console.log = (...args) => {
  	  if (args.length > 0) {
	    if (typeof args[0] === 'string') {
	      this.processQuakeLog(args[0], log);
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
  processQuakeLog(logline="", log) {

    //
    // register publickey/name when we enter the game if unset
    //
    if (this.game.player_name_identified == false) {
      if (logline.indexOf("entered the game") > 0) {
        let name = this.app.wallet.returnPublicKey().toLowerCase();
	this.registerPlayerName();
      }
    }

    //
    // someone got murdered
    //
    if (this.game?.all_player_names) {
    for (let z = 0; z < this.game.all_player_names.length; z++) {
      let pn = this.game.all_player_names[z].toLowerCase().substring(0, 15);
      let pos = logline.indexOf(pn);
        if (pos == 0) {
          for (let i = 0; i < this.game.all_player_names.length; i++) {
            let pn2 = this.game.all_player_names[i].toLowerCase().substring(0, 15);
	    if (pn !== pn2) {
              if (logline.indexOf(pn2) > -1) {
	        let victim = z;
	        let killer = i;
	        if (this.game.players[victim] === this.app.wallet.returnPublicKey()) {
                  this.addMove("player_kill\t"+this.game.players[victim]+"\t"+this.game.players[killer]);
                  this.endTurn();
	        }
	      }
	    }
  	  }
        }
      }
    }
  }



  registerPlayerName() {
    //
    // prevent Saito components from processing
    //
    SAITO_COMPONENT_ACTIVE = false;
    SAITO_COMPONENT_CLICKED = false;

    if (document.getElementById("chat-container")) { document.getElementById("chat-container").remove(); }
    if (document.getElementById("viewport")) { document.getElementById("viewport").focus(); }

    document.dispatchEvent(new KeyboardEvent('keydown', {'keyCode': 192}));

    // type "/name "
    document.dispatchEvent(new KeyboardEvent('keydown', {'keyCode': 191}));
    document.dispatchEvent(new KeyboardEvent('keydown', {'keyCode': 78}));
    document.dispatchEvent(new KeyboardEvent('keydown', {'keyCode': 65}));
    document.dispatchEvent(new KeyboardEvent('keydown', {'keyCode': 77}));
    document.dispatchEvent(new KeyboardEvent('keydown', {'keyCode': 69}));
    document.dispatchEvent(new KeyboardEvent('keydown', {'keyCode': 32}));

    // type lowercase publickey
    let publickey = this.app.wallet.returnPublicKey().toLowerCase();
    for (let z = 0; z < publickey.length; z++) {
      let char = publickey[z];
      let charCode = char.charCodeAt(0);
      if (charCode > 65) { charCode -= 32; } // 97 -> 65
      console.log("typing in: " + char);
      document.dispatchEvent(new KeyboardEvent('keydown', {'keyCode': charCode}));
    }

    // type "enter" and hide console (w/ tilde)
    document.dispatchEvent(new KeyboardEvent('keydown', {'keyCode': 13}));
    document.dispatchEvent(new KeyboardEvent('keydown', {'keyCode': 192}));

    this.setPlayerName(this.app.wallet.returnPublicKey(), publickey);
    this.addMove("player_name\t"+this.app.wallet.returnPublicKey()+"\t"+this.game.player_name);
    this.endTurn();

    return;
  }

  setPlayerName(publickey, name) {
    for (let i = 0; i < this.game.players.length; i++) {
      if (this.game.players[i] === publickey) {
        this.game.all_player_names[i] = name;
        console.log("PLAYER " + (i+1) + " is " + name);
      }
    }
    if (this.app.wallet.returnPublicKey() === publickey) {
      this.game.player_name = name;
    }
  }



  onPeerHandshakeComplete(app, peer) {
    if (app.BROWSER == 0 || !document) { return; } 
    if (document.querySelector(".chat-input")) {
      let c = document.querySelector(".chat-input");
      if (c) {
        c.placeholder = 'typing T activates chat...';
      }
    }
  }


  initializeHTML(app) {

    if (this.browser_active != 1) { return; }
    if (this.initialize_game_run) { return; }
    
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

    this.menu.addSubMenuOption("game-game", {
        text : "Screenshot",
        id : "game-post",
        class : "game-post",
        callback : async function(app, game_mod) {
          let m = game_mod.app.modules.returnModule("RedSquare");
          if (m){
            let log = document.getElementById("log-wrapper");
            if (log && !log.classList.contains("log_lock")) { log.style.display = "none"; }
            let menu = document.getElementById("game-menu");
            menu.style.display = "none";
            await app.browser.screenshotCanvasElementById("viewport", function(image) {
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

    this.menu.addSubMenuOption("game-game", {
        text : "Update Name",
        id : "game-register",
        class : "game-register",
        callback : async function(app, game_mod) {
	  siteMessage("Updating Player Name to Saito Address");
	  game_mod.menu.hideSubMenus();
	  game_mod.registerPlayerName();
        },
    });

    this.menu.addChatMenu(app, this);
    this.menu.render(app, this);


if (app.BROWSER != 0) {
    if (this.game.options.server === "as") {
alert("Asian Game Server - use advanced options to change");
      this.content_server = "q3.saito.io";
      this.game_server = "q3.saito.io:27960";
    }
    if (this.game.options.server === "na") {
alert("North American Game Server - use advanced options to change");
      this.content_server = "q3-us.saito.io";
      this.game_server = "q3-us.saito.io:27959";
    }
}


    //
    // helper functions
    //
    let getQueryCommands = function() {

      var search = /([^&=]+)/g;
      var query  = window.location.search.substring(1);
      var args = [];
      var match;

      while (match = search.exec(query)) {
        var val = decodeURIComponent(match[1]);
        val = val.split(' ');
        val[0] = '+' + val[0];
        args.push.apply(args, val);
      }
       return args;
    };

    let resizeViewport = function() {
      if (!ioq3.canvas) { return; }
      if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] || document['mozFullScreenElement'] || document['mozFullscreenElement'] || document['fullScreenElement'] || document['fullscreenElement'])) {
        return;
      }
      ioq3.setCanvasSize(ioq3.viewport.offsetWidth, ioq3.viewport.offsetHeight);
    }

    ioq3.viewport = document.getElementById('viewport-frame');
    ioq3.elementPointerLock = true;
    ioq3.exitHandler = function (err) {

console.log(err);
return;

      if (err) {
        var form = document.createElement('form');
        form.setAttribute('method', 'POST');
        form.setAttribute('action', '/');
        var hiddenField = document.createElement('input');
        hiddenField.setAttribute('type', 'hidden');
        hiddenField.setAttribute('name', 'error');
        hiddenField.setAttribute('value', err);
        form.appendChild(hiddenField);
        document.body.appendChild(form);
        form.submit();
        return;
      }
      window.location.href = '/';
    }

    window.addEventListener('resize', resizeViewport);

    // merge default args with query string args
    //var args = ['+set', 'fs_cdn', 'content.quakejs.com:80', '+set', 'sv_master1', 'master.quakejs.com:27950']; //original args to list the servers from master.quakejs.com
    //var args = ['+set', 'fs_cdn', 'content.quakejs.com:80', '+set', 'sv_master1', 'master.quakejs.com:27950', '+connect', 'YOUR_SERVER_HERE:27960']; //additional +connect arguement to connect to a specific server
    //var args = ['+set', 'fs_cdn', '18.163.184.251:80', '+connect', '18.163.184.251:27960']; //custom args list targeting a local content server and local game server both at the address 'quakejs'
    //var args = ['+set', 'fs_cdn', '18.163.184.251:80', '+set', 'sv_enable_bots', '1', '+connect', '18.163.184.251:27960']; //custom args list targeting a local content server and local game server both at the address 'quakejs'
    var args = ['+set', 'fs_cdn', this.content_server, '+connect', this.game_server];
    args.push.apply(args, getQueryCommands());

    if (this.browser_active == 1) {
      console.log("CALLING QUAKE");
      ioq3.callMain(args);
    }

  }

}

module.exports = Quake3;

