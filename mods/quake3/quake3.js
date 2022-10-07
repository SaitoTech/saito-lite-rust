const GameTemplate = require('./../../lib/templates/gametemplate');
const QuakeGameOptionsTemplate = require('./lib/quake-game-options.template');


class Quake3 extends GameTemplate {

  constructor(app) {

    super(app);

    this.app = app;
    this.name = "Quake3";
    this.description = "Quake3-Saito Interface";
    this.categories = "Games Entertainment";
    this.publisher_message = "Quake 3 is owned by ID Software. This module is made available under an open source license and executes open source code. Your browser will use data-files distributed freely online but please note that the publisher requires purchase of the game to play. Saito recommends GOG.com for purchase.";

    this.minPlayers      = 1;
    this.maxPlayers      = 4;

    this.content_server  = "q3.saito.io";
    //this.content_server  = "18.163.184.251:80";
    this.game_server     = "18.163.184.251:27960";
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

	if (this.game.options.crypto) {

	  let ts = new Date().getTime();
	  let ticker = this.game.options.crypto;
          let killValue = this.game.options.killValue;
	  let uhash = this.app.crypto.hash(`${victim}${killer}${this.game.step.game}`);

	  // the user is proactively sending tokens unsolicited, so we can skip the 
	  // confirmation prompt provided by the crypto-manager.
	  this.app.wallet.sendPayment(
	    [victim], 
	    [killer],
	    [killValue],
	    ts,
	    uhash,
	    null,
	    ticker
          );	  
	}

        return 1;
      }

      if (mv[0] === "player_name") {
	this.game.queue.splice(qe, 1);
	let publickey = mv[1];
	let name = mv[2];
	this.setPlayerName(publickey, name);
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
    let killValue = document.getElementById("killValue");
    let killValue_wrapper = document.getElementById("killValue_wrapper");

    const updateChips = function(){
      if (killValue) {
        if (crypto.value == ""){
          killValue_wrapper.style.display = "none";
          killValue.value = "0";
        } else {
          let killValueAmt = parseFloat(killValue.value);
          killValue_wrapper.style.display = "block";
        }
      }
    };

    if (crypto){
      crypto.onchange = updateChips;
    }
    if (killValue){
      killValue.onchange = updateChips;
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
  processQuakeLog(logline, log) {
    if (this.game?.all_player_names) {
    for (let z = 0; z < this.game.all_player_names.length; z++) {
      let pn = this.game.all_player_names[z].toLowerCase().substring(0, 15);
      let pos = logline.indexOf(pn);
        if (pos == 0) {
          //
          // someone got murdered
          //
          for (let i = 0; i < this.game.all_player_names.length; i++) {
            let pn2 = this.game.all_player_names[i].toLowerCase().substring(0, 15);
	    if (pn !== pn2) {
              if (logline.indexOf(pn2) > -1) {
	        let victim = z;
	        let killer = i;
                //
                // someone got murdered
                //
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




  setPlayerName(publickey, name) {
    for (let i = 0; i < this.game.players.length; i++) {
      if (this.game.players[i] === publickey) {
        this.game.all_player_names[i] = name;
        console.log("PLAYER " + (i+1) + " is " + name);
      }
    }
    if (this.app.wallet.returnPublicKey() === publickey) {
      this.game.player_name = name;
      this.game.player_name_identified = true;
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
              m.tweetImage(image);
            });
          }
        },
    });

    this.menu.addSubMenuOption("game-game", {
        text : "Register",
        id : "game-register",
        class : "game-register",
        callback : async function(app, game_mod) {

          document.dispatchEvent(new KeyboardEvent('keydown', {'keyCode': 192}));

	  // "/name "
          document.dispatchEvent(new KeyboardEvent('keydown', {'keyCode': 191}));
          document.dispatchEvent(new KeyboardEvent('keydown', {'keyCode': 78}));
          document.dispatchEvent(new KeyboardEvent('keydown', {'keyCode': 65}));
          document.dispatchEvent(new KeyboardEvent('keydown', {'keyCode': 77}));
          document.dispatchEvent(new KeyboardEvent('keydown', {'keyCode': 69}));
          document.dispatchEvent(new KeyboardEvent('keydown', {'keyCode': 32}));

	  // provide publickey
	  let publickey = app.wallet.returnPublicKey().toLowerCase();
	  for (let z = 0; z < publickey.length; z++) {
	    let char = publickey[z];
	    let charCode = char.charCodeAt(0);
	    if (charCode > 65) { charCode -= 32; } // 97 -> 65
            console.log("typing in: " + char);
            document.dispatchEvent(new KeyboardEvent('keydown', {'keyCode': charCode}));
	  }

          document.dispatchEvent(new KeyboardEvent('keydown', {'keyCode': 13}));
          document.dispatchEvent(new KeyboardEvent('keydown', {'keyCode': 192}));

	  game_mod.game.player_name = publickey;
	  game_mod.game.player_name_identified = true;
	  game_mod.game.all_player_names[game_mod.game.player-1] = publickey;

          game_mod.addMove("player_name\t"+game_mod.app.wallet.returnPublicKey()+"\t"+game_mod.game.player_name);
          game_mod.endTurn();

        },
    });

    this.menu.addChatMenu(app, this);
    this.menu.render(app, this);


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

