/*********************************************************************************

 GAME MODULE v.2

 This is a general parent class for modules that wish to implement Game logic. It
 introduces underlying methods for creating games via email invitations, and sending
 and receiving game messages over the Saito network. The module also includes random
 number routines for dice and deck management. Thanks for the Web3 Foundation for its
 support developing code that allows games to interact with cryptocurrency tokens and
 Polkadot parachains.

 This module attempts to use peer-to-peer connections with fellow gamers where
 possible in order to avoid the delays associated with on-chain transactions. All
 games should be able to fallback to using on-chain communications however. Peer-
 to-peer connections will only be used if both players have a proxymod connection
 established.

 Developers please note that every interaction with a random dice and or processing
 of the deck requires an exchange between machines, so games that do not have more
 than one random dice roll per move and/or do not require constant dealing of cards
 from a deck are easier to implement on a blockchain than those which require
 multiple random moves per turn.

 HOW IT WORKS

 We recommend new developers check out the WORDBLOCKS game for a quick introduction
 to how to build complex games atop the Saito Game Engine. Essentially, games require
 developers to manage a "stack" of instructions which are removed one-by-one from
 the main stack, updating the state of all players in the process.

 MINOR DEBUGGING NOTE

 core functionality from being re-run -- i.e. DECKBACKUP running twice on rebroadcast
 or reload, clearing the old deck twice. What this means is that if the msg.extra
 data fields are used to communicate, they should not be expected to persist AFTER
 core functionality is called like DEAL or SHUFFLE. etc. An example of this is in the
 Twilight Struggle headline code.

**********************************************************************************/
let ModTemplate = require("./modtemplate");
let saito = require("../saito/saito");
let GameClock = require("../saito/ui/game-clock/game-clock");
let GameLog = require("../saito/ui/game-log/game-log");
let GameHud = require("../saito/ui/game-hud/game-hud");
let GameMenu = require("../saito/ui/game-menu/game-menu");
let GameOverlay = require("../saito/ui/game-overlay/game-overlay");
let GameCardbox = require("../saito/ui/game-cardbox/game-cardbox");
let GamePlayerbox = require("../saito/ui/game-playerbox/game-playerbox");
let GameCardfan = require("../saito/ui/game-cardfan/game-cardfan");
let GameHexGrid = require("../saito/ui/game-hexgrid/game-hexgrid");
let GameObserver = require("../saito/ui/game-observer/game-observer");
let GameCryptoTransferManager = require("../saito/ui/game-crypto-transfer-manager/game-crypto-transfer-manager");
let GameBoardSizer = require("../saito/ui/game-board-sizer/game-board-sizer");
const GameHammerMobile = require("../saito/ui/game-hammer-mobile/game-hammer-mobile");
const JSON = require("json-bigint");



class GameTemplate extends ModTemplate {
  constructor(app) {
    super(app);

    this.name = "Game";
    this.game = {};
    this.moves = [];
    this.commands = [];
    this.initializeQueueCommandsExecuted = 0;
    this.game_state_pre_move = "";

    //
    // timer to rebroadcast moves
    //
    this.move_rebroadcasting_active = false;
    this.move_rebroadcasting_speed = 15000;
    this.move_rebroadcasting_timer = null;

    // card height-width-ratio
    this.card_height_ratio = 1.53;
    //size of the board in pixels
    this.boardWidth = 500; //Should be overwritten by the (board game's) full size pixel width
    this.boardRatio = 1;

    this.grace_window = 4;    
    //
    // optional interface -- shouldn't really have these defaults
    //
    this.useHUD = 0;
    this.useCardbox = 0;
    this.useClock = 0;
    this.useObserver = 0;

    this.lock_interface = 0;
    this.lock_interface_step = "";
    this.lock_interface_tx = "";

    this.confirm_moves = 0;
    this.confirm_this_move = 0;

    //
    // game interface variables
    //
    this.interface = 0; // 0 = no hud
    // 1 = graphics hud
    // 2 = text hud

    this.relay_moves_offchain_if_possible = 1;
    this.initialize_game_offchain_if_possible = 1;

    this.next_move_onchain_only = 0;

    this.hud = new GameHud(app);
    this.clock = new GameClock(app);
    this.log = new GameLog(app);
    this.overlay = new GameOverlay(app);
    this.cardfan = new GameCardfan(app);
    this.playerbox = new GamePlayerbox(app);
    this.cardbox = new GameCardbox(app);
    this.menu = new GameMenu(app);
    this.hammer = GameHammerMobile; //no constructor
    this.sizer = new GameBoardSizer(app); //yes constructor
    this.crypto_transfer_manager = new GameCryptoTransferManager(app);
    this.hexgrid = new GameHexGrid();
    this.observer = new GameObserver();

    this.clock_timer = null; //Interval reference updating countdown clock
    this.menus = [];
    this.minPlayers = 2;
    this.maxPlayers = 2;
    this.lang = "en";
    this.log_length = 150;

    this.publisher_message = "";

    this.time = {};
    this.time.last_received = 0; //For when we last received control of game 
    this.time.last_sent = 0;     //For when we send our moves

    //
    // used to generate provably-fair dice rolls
    //
    this.secureroll_rnums = [];
    this.secureroll_hash = "";

    this.observer_mode = 0;

    //
    // used in reshuffling
    //
    this.old_discards = {};
    this.old_removed = {};
    this.old_cards = {};
    this.old_crypt = [];
    this.old_keys = [];
    this.old_hand = [];

    this.gaming_active = 0; //
    // this works like game.halted, except at the level of
    // the game engine. when a move arrives it flips to 1
    // and when a move (rnQueue) has finished executing it
    // goes back to 0. The purpose is to prevent a second
    // move from arriving and executing while the previous
    // one is still executing.
    //
    // the difference between game.halted and gaming_active
    // for design purposes is that game.halted should be
    // used when the interface stops the game (i.e. user
    // acknowledgement is required for the game to progress
    // while gaming_active happens behind the scenes.
    //

    //
    // have we tried running our existing queue?
    //
    this.initialize_game_run = 0;

    //
    // this is distinct from this.game.initialize_game_run
    // the reason is that BOTH are set to 1 when the game
    // is initialized. But we only nope out on initializing
    // the game if BOTH are 1. This allows us to swap in and
    // out saved games, but still init the game on reload if
    // this.game.initialize_game_run is set to 1 but it is
    // a freshly loaded browser.
    //

    //
    // instead of associating a different function with each card css we are
    // associating a single one, and changing the reference function inside
    // to get different actions executed on click. Basically we swap out the
    // changeable function before attachingCardEvents and everything just works
    //
    let temp_self = this;
    this.changeable_callback = function (card) {};
    this.cardbox_callback = function (card) {
      if (temp_self.changeable_callback !== null) {
        temp_self.changeable_callback(card);
      }
    };
    this.menu_backup_callback = null;
    this.back_button_html = `<i class="fa fa-arrow-left" id="back_button"></i>`;
    
    this.hiddenTab = "hidden";
    this.notifications = 0;

    return this;
  }

  startMoveRebroadcasting() {
    if (this.app.BROWSER == 0) {
      return;
    }
    if (this.move_rebroadcasting_active) {
      clearInterval(this.move_rebroadcasting_timer);
    }
    this.move_rebroadcasting_active = true;
    this.move_rebroadcasting_timer = setInterval(() => {
      for (let i = 0; i < this.app.wallet.wallet.pending.length; i++) {
        let ptx = new saito.default.transaction(JSON.parse(this.app.wallet.wallet.pending[i]));
        if (ptx.msg) {
          if (ptx.msg.game_id) {
            if (ptx.msg.game_id == this.game.id) {
            }
          }
        }
      }
    }, this.move_rebroadcasting_speed);
  }

  stopMoveRebroadcasting() {
    this.move_rebroadcasting_active = false;
    clearInterval(this.move_rebroadcasting_timer);
  }


  async displayModal(modalHeaderText, modalBodyText="") {
    await salert(`${modalHeaderText}${(modalBodyText)?": ":""}${modalBodyText}`);
  }

  displayWarning(warningTitle, warningText="", time = 4000){
    let html = `<div class="game_warning_overlay">
                  <div class="game_warning_header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div class="game_warning_timer" >Auto close in <span id="clock_number">${Math.ceil(time/1000)}</span>s</div>
                  </div>
                  <h2>${warningTitle}</h2>
                  <p>${warningText}</p>
                </div>`;

    let overlay_self = this.overlay;
    let timeouthash = null, intervalHash = null;
    if (time > 0){
      timeouthash = setTimeout(()=>{
        overlay_self.hide();
      }, time );
      intervalHash = setInterval(()=>{
        time -= 1000;
        try{
          document.getElementById('clock_number').innerHTML = Math.ceil(time/1000);
        }catch(err){}
      },1000);
    }

    this.overlay.show(this.app, this, html, ()=>{
      if (timeouthash){
        clearTimeout(timeouthash);
      }
      if (intervalHash){
        clearInterval(intervalHash);
      }
    });
 
  }

  async preloadImages() {}

  returnCardHeight(card_width = 1) {
    return card_width * this.card_height_ratio;
  }

  //Since games are still on initializeHTML, we don't want default mod behavior to 
  //add a bunch of random html to our games
  render(app){
    return;
  }

  initializeHTML(app) {
    //
    // initialize game feeder tries to do this
    //
    // it needs to as the QUEUE which starts
    // executing may updateStatus and affect
    // the interface. So this is a sanity check
    //
    if (this.browser_active == 0) {
      return;
    }
    if (this.initialize_game_run == 1) {
      return 0;
    }

    //
    // hash reflects game position
    //
    try {
      let oldHash = window.location.hash;
      if (oldHash != "") {
        let results = app.browser.parseHash(oldHash);
        let arcade_mod = app.modules.returnModule("Arcade");
        if (arcade_mod) {
          let game_id = results.gid;
          let bid = results.bid;
          let tid = results.tid;
          let last_move = results.lm;
          let player = "";

          msg = {};
          msg.game_id = game_id;
          msg.bid = bid;
          msg.tid = tid;
          msg.last_move = last_move;
          msg.player = "";
          msg.module = this.name;

          let msgobj = app.crypto.stringToBase64(JSON.stringify(msg));

          if (this.game.id != game_id) {
            arcade_mod.observeGame(msgobj, last_move);
            return;
          }
        }
      }

      window.location.hash = `#`;
      window.location.hash = app.browser.initializeHash(
        `#gid=${this.game.id}&bid=1&tid=1&lm=0`,
        oldHash,
        {}
      );
    } catch (err) {}

    //
    // check options for clock
    //
    if (this.game?.options.clock) {
      if (parseInt(this.game.options.clock) == 0) {
        this.game.clock_limit = 0;
        this.useClock = 0;
      } else {
        if (this.game.clock_spent == 0) {
          this.game.clock_limit = parseInt(this.game.options.clock) * 60 * 1000;
          this.saveGame(this.game.id);
        }
        this.useClock = 1;
      }
      console.log("Set clock limit to ",this.game.clock_limit);
    }

    if (this.useClock == 1) {
      this.clock.render(app, this);
      this.clock.attachEvents(app, this);
    }

    if (this.useObserver == 1 || this.game.player == 0) {
      this.observer.render(app, this);
      this.observer.attachEvents(app, this);
    }

    //
    // load initial display preferences
    //
    if (this.app.options != undefined) {
      if (this.app.options.gameprefs != undefined) {
        if (this.app.options.gameprefs.lang != undefined) {
          this.lang = this.app.options.gameprefs.lang;
        }
        if (this.app.options.gameprefs.interface != undefined) {
          this.interface = this.app.options.gameprefs.interface;
        }
      }
    }

    // Set the name of the hidden property and the change event for visibility
    let visibilityChange;
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
      this.hiddenTab = "hidden";
      visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      this.hiddenTab = "msHidden";
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      this.hiddenTab = "webkitHidden";
      visibilityChange = "webkitvisibilitychange";
    }

    document.addEventListener(visibilityChange,()=>{
      if (document[this.hiddenTab]){
      }else{
        if (this.tabInterval){
          clearInterval(this.tabInterval);
          this.tabInterval = null;
          document.title = this.gamename || this.name;
          this.notifications = 0;
        }
      }
    },false);
  }

  attachEvents(app) {
    //
    // initialize game feeder tries to do this
    //
    // it needs to as the QUEUE which starts
    // executing may updateStatus and affect
    // the interface. So this is a sanity check
    //
    if (this.browser_active == 0) {
      return;
    }
    if (this.initialize_game_run == 1) {
      return;
    }
  }

  //
  // ARCADE SUPPORT
  //
  respondTo(type) {
    /*
    This is primarily used as a flag to say "Yes I am a game", but adding functionality
    to use it to define the img in the arcade rather than all the previous hardcoding
    */
    if (type == "arcade-games") {
      let obj = {};
      obj.img = `/${this.returnSlug()}/img/arcade/arcade.jpg`;
      obj.render = this.renderArcade;
      obj.attachEvents = this.attachEventsArcade;
      return obj;
    }

    if (type == "arcade-carousel") {
      let obj = {};
      obj.background = `/${this.returnSlug()}/img/arcade/arcade-banner-background.png`;
      obj.title = this.gamename || this.name;
      return obj;
    }

    if (type == "default-league") {
      let obj = {};
      obj.name = this.gamename || this.name;
      obj.module = this.name;
      obj.desc = this.description;
      obj.type = "elo";
      return obj;
    }

    return null;
  }
  renderArcade(app, data) {}
  attachEventsArcade(app, data) {}


  async onConfirmation(blk, tx, conf, app) {

    let txmsg = tx.returnMessage();
    let game_self = app.modules.returnModule(txmsg.module);
    
    if (conf == 0) {

      let old_game_id = "";

      // what if no game is loaded into module
      if (txmsg.game_id && !game_self.game){
        game_self.game = game_self.loadGame(txmsg.game_id);
      }

      // acceptances
      /*if (tx.isTo(app.wallet.returnPublicKey()) && txmsg.request === "accept") {
        console.log("Processing accept from on-chain message to Game Engine");
        let accept_game = await game_self.receiveAcceptRequest(blk, tx, conf, app);
        return;
      }*/

      // gameover requests
      if (tx.isTo(app.wallet.returnPublicKey()) && txmsg.request === "gameover") {
        await game_self.receiveGameoverRequest(blk, tx, conf, app);
        return;
      }
      // stopgame requests
      if (tx.isTo(app.wallet.returnPublicKey()) && txmsg.request === "stopgame") {
        game_self.processResignation(tx.transaction.from[0].add, txmsg);
        return;
      }


      if (!txmsg?.step?.game) { //Not a game move
        console.log("skipping " + JSON.stringify(txmsg));
        return;
      }

console.log("receiving on-chain tx in: " + game_self.name);

      //
      // process game move
      let game_id = txmsg.game_id;
      if (app.options?.games) {
        //console.log("looking for this game...");
        for (let i = 0; i < app.options.games.length; i++) {
          if (game_id == app.options.games[i].id) {
            if (tx.isTo(app.wallet.returnPublicKey())) {
                console.log("Game OnChain Message",conf,JSON.parse(JSON.stringify(txmsg)));              

                // game_self is module, but may not have game loaded
                // -- this should be precluded by loadGame above
                if (game_self.game.id != game_id) {
                  console.log("Game engine, move received. Safety catch, loading game...");
                  game_self.loadGame(game_id);
                }

                if (game_self.initialize_game_run == 0 || game_self.isFutureMove(tx.transaction.from[0].add, txmsg)) {
                  console.log("is future move "+ txmsg.step.game);
                  game_self.addFutureMove(tx);
                } else if (game_self.isUnprocessedMove(tx.transaction.from[0].add, txmsg)) {
                  console.log("is unprocessed move " + txmsg.step.game);
                  game_self.addNextMove(tx);
                  if (document[this.hiddenTab]){
                    this.startNotification();
                  }
                } else {
                  //We just ignore this...
                  console.log("is old move "+ txmsg.step.game);
                }
            } else {  // tx not addressed to me // if observer mode enabled
              if (app.options.games[i].observer_mode == 1) {
                if (txmsg.request !== "game") {
                  return;
                }
                // only load the game if not active, otherwise we load every move and repeat moves
                if (game_self.game.id != game_id) {
                  console.log("Game engine [Observer mode], move received. Safety catch, loading game...");
                  game_self.loadGame(game_id);
                }

                if (game_self.isUnprocessedMove(tx.transaction.from[0].add, txmsg)) {
                  game_self.addNextMove(tx);

                } else if (game_self.isFutureMove(tx.transaction.from[0].add, txmsg)) {
                  game_self.addFutureMove(tx);
                } 
              }
            }
          }
        }
      }
    }
  }


  async sendMessage(type = "game", extra = {}, mycallback = null) {
    
    //
    // TODO - avoid browser overheating
    //
    // adding a minor delay here allows JQUERY to execute
    // out-of-order, so that the board and UI can update
    // before we take back control.
    //
    this.stopClock(); //Don't penalize the player for this minor timeout
    
    setTimeout(() => {
      //
      // trigger regeneration of secure hash for generating random
      // numbers if we have requested it during the course of making
      // our move.
      //
      if (this.game.sroll == 1) {
        let hash1 = this.app.crypto.hash(Math.random());
        let hash2 = this.app.crypto.hash(hash1);
        let hash1_sig = this.app.crypto.signMessage(hash1, this.app.wallet.returnPrivateKey());
        let hash2_sig = this.app.crypto.signMessage(hash2, this.app.wallet.returnPrivateKey());

        this.game.sroll_hash = hash1;
        this.game.sroll_done = 0;
        this.game.sroll = 0; // do not trigger next message sent

        this.game.turn.slice().unshift("SECUREROLL_END");
        this.game.turn.push("SECUREROLL\t" + this.game.player + "\t" + hash2 + "\t" + hash2_sig);
      }

      //
      // game timer
      //
      if (this.useClock){
        this.time.last_sent = new Date().getTime();
        if (this.time.last_sent > this.time.last_received + 1000) {
          this.game.clock_spent += this.time.last_sent - this.time.last_received;
          let time_left = this.game.clock_limit - this.game.clock_spent;
          console.log("TIME LEFT: " + time_left);
          this.clock.displayTime(time_left);
        }
      }

      //
      // observer mode
      //
      if (this.game.player == 0) {
        return;
      }
      if (this.game.opponents == undefined) {
        return;
      }

      let send_onchain_only = 0;
      for (let i = 0; i < this.game.turn.length; i++) {
        if (this.game.turn[i] == "READY") {
          send_onchain_only = 1;
        }
      }

      let game_self = this;
      let mymsg = {};

      //
      // steps
      //
      let ns = {};
      ns.game = this.game.step.game;
      if (type == "game") {
        ns.game++;
        mymsg.request = "game";
      }

      //
      // OBSERVER MODE - gameState
      //
      // if we are saving game state, we make sure the other player does too!
      if (this.game.saveGameState == 1) {
        if (this.observer_mode == 0) {
          this.game.turn.push("OBSERVER\t" + this.game.player + "\t1");
          this.game.turn.push("SETVAR\tsaveGameState\t1");
        }
        mymsg.game_state = this.returnPreMoveGameState();
        mymsg.sharekey = this.loadGamePreference(this.game.id + "_sharekey");
      }

      //
      // if our crypto key is out-of-date, update
      //
      if (game_self.game.crypto !== "SAITO" && game_self.game.crypto !== "") {
        let crypto_mod = this.app.wallet.returnCryptoModuleByTicker(game_self.game.crypto);
        let crypto_key = this.app.wallet.returnCryptoAddressByTicker(game_self.game.crypto);
        if (crypto_mod) {
          crypto_key = crypto_mod.returnAddress();
        }
        for (let i = 0; i < this.game.players.length; i++) {
          if (this.game.players[i] == this.app.wallet.returnPublicKey()) {
            if (this.game.keys[i] !== crypto_key) {
              this.game.turn.push(`CRYPTOKEY\t${this.app.wallet.returnPublicKey()}\t${crypto_key}\t${this.app.crypto.signMessage(crypto_key, this.app.wallet.returnPrivateKey())}`);
            }
          }
        }
        //
        // revert keys to SAITO if necessary
        //
      } else {
        let crypto_key = this.app.wallet.returnPublicKey();
        for (let i = 0; i < this.game.players.length; i++) {
          if (this.game.players[i] == this.app.wallet.returnPublicKey()) {
            if (this.game.keys[i] !== crypto_key) {
              this.game.turn.push(`CRYPTOKEY\t${crypto_key}\t${crypto_key}\t${this.app.crypto.signMessage(crypto_key, this.app.wallet.returnPrivateKey())}`);
            }
          }
        }
      }

      mymsg.turn = this.game.turn;
      mymsg.module = this.name;
      mymsg.game_id = this.game.id;
      mymsg.player = this.game.player;
      mymsg.step = ns;
      mymsg.extra = extra;

      //console.log("sending TX with what step? " + JSON.stringify(mymsg.step));

      let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee(
        this.app.wallet.returnPublicKey(),
        0.0
      );
      if (newtx == null) {
        salert("ERROR: Difficulty Sending Transaction, please reload");
        return;
      }

      for (let i = 0; i < this.game.accepted.length; i++) {
        newtx.transaction.to.push(new saito.default.slip(this.game.accepted[i], 0.0));
      }

      newtx.msg = mymsg;
      newtx = this.app.wallet.signTransaction(newtx);

      game_self.app.wallet.wallet.pending.push(JSON.stringify(newtx.transaction));
      game_self.app.wallet.saveWallet();

      game_self.saveGame(game_self.game.id);

      //
      // send off-chain if possible - step 2 onchain to avoid relay issues with options
      //
      if (this.relay_moves_offchain_if_possible && send_onchain_only == 0) {
        // only game moves to start
        if ((newtx.msg.request === "game" && this.game.initializing == 0) || this.initialize_game_offchain_if_possible == 1) {
          let relay_mod = this.app.modules.returnModule("Relay");
          
          if (relay_mod){
            relay_mod.sendRelayMessage(this.game.accepted, "game relay gamemove", newtx);
          }
        }
      }

      game_self.app.network.propagateTransaction(newtx);
    }, 100);
  }

  //
  // respond to off-chain game moves
  //
  async handlePeerRequest(app, message, peer, mycallback = null) {

    // servers should not make game moves
    if (app.BROWSER == 0) {
      return;
    }

    super.handlePeerRequest(app, message, peer, mycallback);

    if (message.request.includes("game relay")) {
      if (message.data != undefined) {
        let gametx = new saito.default.transaction(message.data.transaction);
        let gametxmsg = gametx.returnMessage();

        //
        // nope out if game does not exist locally
        //
        if (!this.doesGameExistLocally(gametxmsg.game_id)) {
          //console.log("Game does not exist locally. Not processing HPR message: waiting for on-chain");
          return;
        }

        //
        // we appear to have two types of inbound message formats, so have a sanity
        // check on the loading mechanism.
        //
        if (this.name === gametxmsg.module) {
         //console.log("Game Peer Request",JSON.parse(JSON.stringify(gametxmsg)));
     
          if (gametxmsg.game_id) {
            if (this.game.id !== gametxmsg.game_id) {
              this.game = this.loadGame(gametxmsg.game_id);
            }
          } else if (gametxmsg.id) {
            gametxmsg.game_id = gametxmsg.id; 
            if (this.game.id !== gametxmsg.id) {
              this.game = this.loadGame(gametxmsg.id);
            }
          }
        
          //
          // if we are undefined here, we are not a module 
          // that should be thinking about doing anything in
          // response to this game message.
          // -- or loading the game id came up with a different game module
          //
          if (!this.game?.id || gametxmsg.module != this.name) {
            return;
          }

          if (gametxmsg.game_id != this.game.id) {
            return;
          }
       

          if (message.request === "game relay gamemove") {
            if (this.initialize_game_run == 0 || this.isFutureMove(gametx.transaction.from[0].add, gametxmsg)) {
              //console.log("is future move " + gametxmsg.step.game);
              this.addFutureMove(gametx);
      	                
            } else if (this.isUnprocessedMove(gametx.transaction.from[0].add, gametxmsg)) {
              //console.log("is unprocessed move " + gametxmsg.step.game);
              this.addNextMove(gametx);

              if (document[this.hiddenTab]){
                this.startNotification();
              }

            } else {
              //console.log("is old move " + gametxmsg.step.game);
              //console.log("Receive Move Offchain but neither future nor unprocessed: " + gametx.transaction.from[0].add + " -- " + JSON.stringify(gametxmsg.step));
            }
          } else if (message.request === "game relay gameover") {
            this.receiveGameoverRequest(null, gametx, 0, app);
          } else if (message.request === "game relay stopgame") {
            this.processResignation(gametx.transaction.from[0].add, gametxmsg);
            return;
          }
        }
      }
    }
  }


  startNotification(){
    if (!this.browser_active) { return; }
    //If we haven't already started flashing the tab
    this.notifications++;
    if (!this.tabInterval){
      this.tabInterval = setInterval(()=>{
        let modName = this.gamename || this.name;
        if (document.title === modName){
          document.title = (this.notifications == 1) ? "New move" : `(${this.notifications}) new moves`;
        }else{
          document.title = modName;
        }
      }, 650);
    } 
  }
  


  initializeSinglePlayerGame(game_data) {
    this.game = this.loadGame();
    let game_id = this.game.id;
    this.game.module = this.name;
    this.game.options = game_data.options;
    this.game.over = 0;
    
    //
    // enable save game state if observer mode is an advanced option
    /*
    if (this.game.options.observer === "enable") {
      this.game.observer_mode = 1;
      this.observer_mode = 1;
      this.game.saveGameState = 1;
    }*/

    if (this.game.players_set == 0) {
      this.game.players = [];
      this.game.players.push(this.app.wallet.returnPublicKey());
      this.game.accepted = this.game.players;
      this.game.step.players[this.app.wallet.returnPublicKey()] = 1;
      this.game.players_set = 1;
      this.game.player = 1;

      console.log("!!!!!!!!!!!!!!!!!!!!");
      console.log("!!! SINGLE PLAYER GAME CREATED !!!");
      console.log("!!!!!!!!!!!!!!!!!!!!");
      console.log("My Public Key: " + this.app.wallet.returnPublicKey());
      console.log("My Position: " + this.game.player);
      console.log("ALL KEYS: " + JSON.stringify(this.game.players));
      console.log("saving with id: " + game_id);
      console.log("!!!!!!!!!!!!!!!!!!!!");
      console.log("!!!!!!!!!!!!!!!!!!!!");
      console.log("!!!!!!!!!!!!!!!!!!!!");
    }
    this.saveGame(game_id);
    this.initializeGameFeeder(game_id);
    
    
    //
    // single player games with undefined game ids will hash to this dice
    //
    // ... in which case we want to set it randomly
    //
    if (this.game.dice === "dba5865c0d91b17958e4d2cac98c338f85cbbda07b71a020ab16c391b5e7af4b") {
      // single player games do not necessarily have a proper
      // game-id supplied, so we set the dice to a random source
      // on initialize if needed.
      this.game.dice = this.app.crypto.hash(Math.random());
    }

    return this.game.id;
  }


  // called from Arcade to kick off game initialization
  async receiveAcceptRequest(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();
    let game_id = txmsg.game_id;

    /*
    // we do not want to re-accept
    if (app.options?.games.length) {
      for (let i = 0; i < app.options.games.length; i++) {
        if (app.options.games[i].id === game_id) {
          if (app.options.games[i].step.game > 2) {
            return false;
          }
        }
      }
    }*/

    //
    // accepted games should have all the players. If they do not, drop out
    //
    if (txmsg.players_needed > txmsg.players.length) {
      console.log(
        "ACCEPT REQUEST RECEIVED -- but not enough players in accepted transaction.... aborting"
      );
      return false;
    }

    //
    // ignore games not containing us
    //
    if (!txmsg.players.includes(app.wallet.returnPublicKey())) {
      console.log("ACCEPT REQUEST RECEIVED -- but not for a game with us in it!");
      return false;
    }

    //
    // NOTE: re-loading the game might throw out some data
    //
    if (!this.game) {
      this.loadGame(game_id);
    }

    if (this.game.id != game_id) {
      this.loadGame(game_id);
    }


    //
    // do not re-accept
    //
    if (this.game.step.game > 2) {
      return false;
    }

    //
    // validate all accept-sigs are proper
    //
    let msg_to_verify = "invite_game_" + txmsg.ts;
    
    if (txmsg.players.length == txmsg.players_sigs.length) {
      for (let i = 0; i < txmsg.players.length; i++) {
        if (!app.crypto.verifyMessage(msg_to_verify, txmsg.players_sigs[i], txmsg.players[i])) {
          console.log("PLAYER SIGS do not verify for all players, aborting game acceptance");
          this.game.halted = 0;
          return false;
        }
      }
    } else {
      console.log("Players and player_sigs different lengths!");
      return false;
    }
    //
    // if game is over, exit
    //
    if (this.game.over == 1) {
      this.game.halted = 0;
      return false;
    }

    //
    // otherwise setup the game
    //
    this.game.options = txmsg.options;
    this.game.module = txmsg.module;
    this.game.originator = txmsg.originator; //Keep track of who initiated the game

    //this.game.creator = ""; //We need to save who creates the game (on receiveCreateRequest) so options to pick roles are applied to the right player

    //
    // enable save game state if observer mode is an advanced option
    //
    if (this.game.options.observer === "enable") {
      this.game.observer_mode = 1;
      this.observer_mode = 1;
      this.game.saveGameState = 1;
    }

    //
    // add all the players
    //
    for (let i = 0; i < txmsg.players.length; i++) {
      this.addPlayer(txmsg.players[i]);
    }

    this.saveGame(game_id);

    if (this.game.players_set == 0) {
      //
      // TEST - shifted down to init section
      //
      this.gaming_active = 1;
      //
      // set our player numbers alphabetically
      //
      let players = [];
      for (let z = 0; z < this.game.players.length; z++) {
        players.push(this.app.crypto.hash(this.game.players[z] + this.game.id));
      }

      players.sort();
      
      let players_reconstructed = [];
      for (let z = 0; z < players.length; z++) {
        for (let zz = 0; zz < this.game.players.length; zz++) {
          if (players[z] === this.app.crypto.hash(this.game.players[zz] + this.game.id)) {
            players_reconstructed.push(this.game.players[zz]);
          }
        }
      }
      this.game.players = players_reconstructed;

      for (let i = 0; i < players.length; i++) {
        if (players[i] === this.app.crypto.hash(this.app.wallet.returnPublicKey() + this.game.id)) {
          this.game.player = i + 1;
        }

        this.game.keys.push(this.game.players[i]); // defaults to SAITO keys
        // use KEY to update to DOT / etc.

      }
      //
      // game step
      //
      for (let i = 0; i < this.game.players.length; i++) {
        this.game.step.players[this.game.players[i]] = 1;
      }

      //
      // special key for keystate encryption
      //
      this.saveGamePreference(game_id + "_sharekey", app.crypto.generateRandomNumber());

      console.log("!!!!!!!!!!!!!!!!!!!!");
      console.log("!!! GAME CREATED !!!");
      console.log("!!!!!!!!!!!!!!!!!!!!");
      console.log("My Public Key: " + this.app.wallet.returnPublicKey());
      console.log("My Position: " + this.game.player);
      console.log("My Share Key: " + this.loadGamePreference(game_id + "_sharekey"));
      console.log("ALL KEYS: " + JSON.stringify(this.game.players));
      console.log("saving with id: " + game_id);
      console.log("!!!!!!!!!!!!!!!!!!!!");
      console.log("!!!!!!!!!!!!!!!!!!!!");
      console.log("!!!!!!!!!!!!!!!!!!!!");

      this.game.players_set = 1;

      this.gaming_active = 0;
      this.saveGame(game_id);

      //
      // players are set and game is accepted, so move into handleGame
      //
      this.initializeGameFeeder(game_id);
      //this.processFutureMoves();
    }

    return game_id;
  }

  /*
  Called by Saito on browser load
  */
  initialize(app) {
    this.initializeQueueCommands(); // Define standard queue commands
    //this.startMoveRebroadcasting(); // loop to check for stalled txs

    if (!this.browser_active) { return; }
    
    //
    // screen ratio (for determining scaling)
    //
    try {
      if (document.querySelector(".gameboard")) {
        let gameWidth = document.querySelector(".gameboard").getBoundingClientRect().width;
        //Only needed for gameTemplate.scale, for putting game pieces on a game board
        this.boardRatio = gameWidth / this.boardWidth;
        //console.log("BOARD RATIO:",this.boardRatio)
      }
    } catch (err) {
      console.error(err);
    }

    //
    // we grab the game with the most current timestamp (ts)
    // since no ID is provided
    this.loadGame();

    //
    // dice initialization
    //
    //if (this.game.dice === "") {
    //  this.game.dice = app.crypto.hash(this.game.id);
    // }

    //
    // initialize the clock
    //
      this.time.last_received = new Date().getTime();
      this.time.last_sent = new Date().getTime();

console.log("INITIALIZE GAME FEEDER!: " + this.name);

    //
    this.initializeGameFeeder(this.game.id);

console.log("DONE INITIALIZE GAME FEEDER!: " + this.name);
  }

  removeEventsFromBoard() {}

  removeGameFromOptions(game_id="") {
    if (game_id === "") { return; }
    if (this.app.options?.games) {
      for (let i = 0; i < this.app.options.games.length; i++) {
        if (this.app.options.games[i].id === game_id) {
	         this.app.options.games.splice(i, 1);
	         i--;
	      }
      }
    }
    this.app.storage.saveOptions();
    return;
  }

  /*
  Minimum default, should be overwritten by every game module
  */
  initializeGame() {
    //
    //
    if (this.game.dice == "") {
      this.initializeDice();
      this.queue.push("READY");
      this.saveGame(this.game.id);
    }
  }

  // this function prepares the game for any moves that are receives, including
  // preparing the UI. if it is NOT run then the queue is not executed and we should
  // not process new moves.
  async initializeGameFeeder(game_id) {

    //
    // sanity load (multiplayer)
    //
    if (this.game) {
      if (this.game.id !== game_id) {
        this.loadGame(game_id);
      }
    }

    //
    // proactively initialize HTML so that the HUD
    // and other graphical elements exist for the game
    // queue to handle. We must specify not to do this
    // twice, ergo initializeHTML doing the init check
    //
    this.initializeHTML(this.app);
    this.attachEvents(this.app);

    this.restoreLog();
    if (this.game.status != "") { this.updateStatus(this.game.status); }

    //
    // quit if already initialized, or not first time initialized
    //
    if (this.game.initialize_game_run == 1 && this.initialize_game_run == 1) {
      return 0;
    } else {
      this.game.initialize_game_run = 1;
      this.initialize_game_run = 1;
    }
    
    //Quit if reloading a game that is already finished.
    if (this.game.over == 1){
      return 0;
    }

    this.initializeDice(); // Make sure we have dice before initializing the game
  
    //Implicit crypto staking for all games (if included in the options)
    if (this.game.options?.crypto){
      this.game.stake = (this.game.options.stake) ? parseFloat(this.game.options.stake) : 0;
      this.game.crypto =  this.game.options.crypto || "";  
    }

    this.initializeGame(game_id);


    // FEB 12 - disabling causes init on receiver so reduce to earliest step
    if (this.game.step.game < 2) {
      this.saveGame(this.game.id);
    }
    this.startQueue();
    
    return 1;
  }

  startQueue() {

console.log("START QUEUE: " + JSON.stringify(this.game.queue));

    if (this.runQueue() == 0) {
      this.processFutureMoves();
    }

    this.queue_started = 1;

  }

  /*
  To restart the queue after it was paused for UI display
  */
  restartQueue(){
    console.log("Restarting Queue");
    this.game.halted = 0;
    // save so we continue from AFTER this point...
    this.saveGame(this.game.id);

    //Process remaining moves in my queue
    //When we get to a stop point, check on all the future moves that had come in
    if (this.runQueue() == 0) {
      this.processFutureMoves();
    }
  }

 runQueue() {

    let game_self = this;
    let cont = 1;
    let loops_through_queue = 0;
    let queue_length = 0;
    let last_instruction = "";

    this.gaming_active = 1; // gaming_active prevents future moves from getting added to the queue while it is processing
    
    //stash a copy of state before doing anything
    this.game_state_pre_move = JSON.parse(JSON.stringify(game_self.game));

    //
    // loop through the QUEUE (game stack)
    //
    while (game_self.game.queue.length > 0 && cont == 1) {

      console.log("QUEUE: " + JSON.stringify(game_self.game.queue));
      console.log("LATEST: " + game_self.game.queue[game_self.game.queue.length-1]);

      if (loops_through_queue >= 100 && queue_length == game_self.game.queue.length && last_instruction === game_self.game.queue[queue_length - 1]) {
        console.log("ENDLESS QUEUE LOOPING");
        return -1;
      }


      let gqe = game_self.game.queue.length - 1;
      let gmv = game_self.game.queue[gqe].split("\t");

      loops_through_queue++;
      queue_length = game_self.game.queue.length;
      last_instruction = game_self.game.queue[gqe];

      //Update the clock each time we process something automatically (so shuffling doesn't count against us)
      this.time.last_received = new Date().getTime();

      //Check each of our game engine commands if anything triggers on gmv[0]
      for (let i = 0; i < game_self.commands.length; i++) {
        if (game_self.commands[i](game_self, gmv) === 0) { //Game engine requests queue processing pauses
          this.gaming_active = 0; 
          return 0;
        }
      }

      //
      // we have not removed anything, so throw it to the game module to process the move
      //
      if (queue_length == game_self.game.queue.length && cont == 1 && last_instruction === game_self.game.queue[queue_length - 1]) {
        cont = this.handleGameLoop();
      }
    }
    
    this.gaming_active = 0; 
    return 0;
  }


  //
  // we accept this as the next move if it is either one more than the current
  // in the MASTER step (i.e. legacy for two player games) or if it is one more
  // than the last move made by the specific player (i.e. 3P simultaneous moves)
  // 
  isFutureMove(playerpkey, txmsg) {
    let tx_step = parseInt(txmsg.step.game) - 1;

    if (txmsg.game_id !== this.game.id) {
      return 0;
    }


    if (tx_step <= Math.min(this.game.step.game, this.game.step.players[playerpkey])) {
      return 0; 
    }

    if (tx_step > Math.max(this.game.step.game, this.game.step.players[playerpkey])) {
      return 1;
    }

    return 0;
  }

  /*
  Is this tx the next game move? It should have a step exactly one more than the main game 
  @param player - the public key address of the player
  */
   isUnprocessedMove(player, txmsg) {
    let tx_step = parseInt(txmsg.step.game) - 1;

    if (txmsg.game_id !== this.game.id) {
      return 0;
    }

    if (tx_step == this.game.step.game ) {
      return 1;
    }
    
    if (this.game.step.players[player]) {

      if (tx_step == this.game.step.players[player] ) {
        return 1;
      }

      // MAY 28 - player has an updated move, but not the next move
      // When on earth does this actually occur?
      // -- this is a great question -- perhaps this pre-dates getting futureMoves right?
      // 
      if (tx_step >= this.game.step.players[player] && tx_step < this.game.step.game) {
        return 1;
      }
    }

    return 0;
  }

  addNextMove(gametx) {

    let game_self = this;
    let gametxmsg = gametx.returnMessage();

    ////////////
    // HALTED  -- a safety catch for future moves
    ////////////
    if (this.game.halted == 1 || this.gaming_active == 1 || this.initialize_game_run == 0) {
      console.log(this.game.halted, this.gaming_active);
      console.log("Save as future move");
      this.addFutureMove(gametx);
      return;
    }

    ////////////////////////////////////
    // observer mode update last_move //
    ////////////////////////////////////
    /***
    if (gametxmsg.last_move > 0) {
      game_self.game.step.ts = gametxmsg.last_move;
      game_self.game.step.bid = gametxmsg.last_bid;
      game_self.game.step.tid = gametxmsg.last_tid;
      try {
        window.location.hash = `#gid=${this.game.id}&bid=${game_self.game.step.bid}&tid=${game_self.game.step.tid}&lm=${game_self.game.step.ts}`; 
      } catch (err) {
        console.log("ERROR updating hash in observer mode");
      }
    } else {
      //
      // we are not in observer mode because we don't have last_move in the tx
      // which would need to be supplied by the server or peer that is saving
      // gamestate, but we can create a link that will approximate the point of
      // entry, by providing the current timestamp as our ts.
      //
      window.location.hash = `#gid=${this.game.id}&bid=0&tid=0&lm=${new Date().getTime()}`; 
    }
    **/

    //Update player's step value
    this.game.step.players[gametx.transaction.from[0].add] = gametxmsg.step.game;

    //And master game step value (if actually incremented)
    if (gametxmsg.step.game > this.game.step.game) {
      this.game.step.game = gametxmsg.step.game;
    }

    /***
    //
    // OBSERVER MODE - 
    //
    if (game_self.game.player == 0) {
      if (gametxmsg.game_state.deck) {
        if (gametxmsg.game_state.deck.length > 0) {
          console.log("DECK SENT: " + JSON.stringify(gametxmsg.game_state.deck));
          let sharekey = null;
          //
          // create object to hold player deck
          //
          if (game_self.game.player_decks) {} else {
            game_self.game.player_decks = [];
            if (game_self.game.player_decks.length < game_self.game.players) {
              for (let i = 0; i < game_self.game.players.length; i++) {
                game_self.game.player_decks.push = {};
                game_self.game.player_decks[i].deck = [];
              }
            }
          }
        }
  
        //
        // update non-secret deck info
        //
        for (let i = 0; i < gametxmsg.game_state.deck.length; i++) {
          game_self.game.deck[i] = gametxmsg.game_state.deck[i];
        }
        if (gametxmsg.sharekey) {
          let player_idx = 0;
          for (let i = 0; i < game_self.game.players.length; i++) {
            if (game_self.game.players[i] === gametx.transaction.from[0].add) {
              player_idx = i;
            }
          }
          let sharekey = gametxmsg.sharekey;
          if (sharekey) {
            for (let i = 0; i < gametxmsg.game_state.deck.length; i++) {
              while (game_self.game.player_decks.length <= player_idx) {
                game_self.game.player_decks.push({});
                game_self.game.player_decks[game_self.game.player_decks.length-1].deck = [];
              }
              while (game_self.game.player_decks[player_idx].deck.length <= i) {
                game_self.game.player_decks[player_idx].deck.push({});
              }
              game_self.game.player_decks[player_idx].deck[i].hand = JSON.parse(this.app.crypto.hexToString(this.app.crypto.decodeXOR(gametxmsg.game_state.deck[i].hand, sharekey)));
              game_self.game.player_decks[player_idx].deck[i].keys = JSON.parse(this.app.crypto.hexToString(this.app.crypto.decodeXOR(gametxmsg.game_state.deck[i].keys, sharekey)));
            }
          }
        }
      }
    }
    ***/

    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue) {
      for (let i = 0; i < gametxmsg.turn.length; i++) {
        this.game.queue.push(gametxmsg.turn[i]);
      }

      //
      // added sept 27 - we may have spliced away, so don't read in saveGame -- ????
      //
      this.saveFutureMoves(this.game.id);
      this.saveGame(this.game.id);
      this.startQueue();
    }
  }

 /*
  Stash incoming transaction (a set of game moves) into an array of to be processed later
  */
  addFutureMove(gametx) {
    if (!this.game.future) { this.game.future = []; }

    if (!this.game.future.includes(JSON.stringify(gametx.transaction))) {
      this.game.future.push(JSON.stringify(gametx.transaction));
      this.saveFutureMoves(this.game.id);
    }
    ////////////////////////////////////
    // observer mode update last_move //
    ////////////////////////////////////
    if (this.game.player == 0) {
      try {
        this.observer.showNextMoveButton();
      } catch (err) {}
    }
  }

  /*
  The goal of this function is not to process all the future moves, but to search
  the archived future moves for JUST the NEXT one, so we can continue processing the game steps
  */
  processFutureMoves() {
    let game_self = this;

        console.log("FUTURE MOVES: " + game_self.game.future.length);
        console.log("the moves ---> " + JSON.stringify(game_self.game.future));
        console.log("gaming active --> " + game_self.gaming_active);
        console.log("game halted   --> " + game_self.game.halted);
        console.log("game step --> " + game_self.game.step.game);
        console.log("PLAYER: " + game_self.game.player);

    let max_loop_length = game_self.game.future.length;
    let loop_length = game_self.game.future.length;
    let tx_processed = 0;
  
    let last_loop_instruction_processed = 0;
    let loop_length_instruction = "";

    let num_txs_processed = 0;

    //Ideally clear out the whole future queue
    while (game_self.game.future.length > 0 && num_txs_processed < max_loop_length) {
      
      loop_length_instruction = game_self.game.queue[game_self.game.queue.length - 1];

      console.log("LastQueueInstr: " + loop_length_instruction);

      loop_length = game_self.game.future.length;
      
      //Search all future moves for the next one
      for (let i = 0; i < game_self.game.future.length; i++) {
        
        let ftx = new saito.default.transaction(JSON.parse(game_self.game.future[i]));
        let ftxmsg = ftx.returnMessage();
        console.log("FTMSG: " + JSON.stringify(ftxmsg));

        if (game_self.isUnprocessedMove(ftx.transaction.from[0].add, ftxmsg)) {
          //This move (future[i]) is the next one, move it to the queue
          game_self.game.future.splice(i, 1);
          console.log("Move to queue and continue processing");
          /*
            addNextMove will kickstart looping through the queue again, 
            so we should end this function immediately
          */
          game_self.gaming_active = 0; //Make sure we can successfully push move to the run queue
          game_self.addNextMove(ftx); 
          return;
        } else if (game_self.isFutureMove(ftx.transaction.from[0].add, ftxmsg)) {
          //This move (future[i]) is still for the future, so leave it alone
        } else { //Old move, can ignore
          game_self.game.future.splice(i, 1);
          i--; // reduce index as deleted
        }
      }
      
      //
      // If we pass through all of future without changing queue or future, then there is nothing to do now
      if (loop_length == game_self.game.future.length) {
        return;
      }
    }
  }

  handleGameLoop() {
    //console.log("handle game loop returning 0...");
    return 0;
  }

  removePlayer(address) {
    if (address === "") {
      return;
    }
    for (let i = this.game.players.length-1; i>=0 ; i--) {
      if (this.game.players[i] === address) {
        this.game.players.splice(i, 1);
        this.game.keys.splice(i,1);
        //this.game.accepted.splice(i, 1);
      }
    }
    for (let i = 0; i < this.game.opponents.length; i++) {
      if (this.game.opponents[i] === address) {
        this.game.opponents.splice(i, 1);
      }
    }

    //Reassign id's
    this.game.player = 0;
    for (let i = 0; i < this.game.players.length; i++) {
      if (this.game.players[i] === this.app.wallet.returnPublicKey()) {
        this.game.player = (i + 1);
      }
    }
  }

  addPlayer(address) {
    if (address === "") {
      return;
    }
    for (let i = 0; i < this.game.players.length; i++) {
      if (this.game.players[i] === address) {
        return;
      }
    }
    this.game.players.push(address);
    this.game.accepted.push(address);
    if (this.app.wallet.returnPublicKey() !== address) {
      this.game.opponents.push(address);
    }
  }

  /*
  Process receipt of a transaction announcing end-of-game
  Updates the internal game status and through UI notifies all players that the game is over
  For convenience, a displayed <div id="status"> on the game page acquires a button to return player to the arcade
  If elsewhere on the site, uses sitemessage to announce end of game
  If crypto is staked on the game, launches a settlement interface 
  */
  receiveGameoverRequest(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();
    let { game_id, winner, module } = txmsg;

    if (this.game.id !== game_id){
      this.loadGame(game_id);
    }    
    console.log("Received Gameover Request");
    //
    // sender must be in game to end it (removed players no problem)
    //
    if (this.game.players.includes(tx.transaction.from[0].add) && this.game.over == 0) {
      this.game.over = 1;
      this.game.last_block = this.app.blockchain.last_bid;

      if (this.browser_active){
        this.removeEvents();
        
        //Check if multiple winners, or none
        let readable = ""
        if (winner.includes(this.app.wallet.returnPublicKey())){
          readable = "You win";
        }else{
          if (Array.isArray(winner)) {
            for (let w of winner){
              readable += this.identifyPlayerByPublicKey(w)+", ";
            }
            readable = readable.substring(0,readable.length-2) + " win";          
          }else{
            readable = this.identifyPlayerByPublicKey(winner) + " wins";
          }  
        }

        //Include reason if given
        if (txmsg.reason != "") {
          readable += " by " + txmsg.reason;
        }else{
          readable += "!";
        }

        //Just state reason if no winners
        if (winner.length == 0){
          readable = txmsg.reason;
        }

        try{
          this.unlockInterface(); //Override any player input interface
          //this.displayModal("Game Over", readable);
          this.updateLog(`Game Over: ${readable}`);
          this.updateStatus(`Game Over: ${readable}`);
          this.playerAcknowledgeNotice(`Game Over: ${readable}`, ()=>{ window.location.href = "/arcade"; });
        
          document.getElementById("confirmit").textContent = "Return to Arcade";
        }catch(err){}
      }else{
        siteMessage(txmsg.module + ': Game Over', 5000);
      }

      //Crypto settlement???
      if (this.game.crypto && this.game?.stake > 0 && txmsg.reason !== "cancellation"){
        this.payWinners(winner);
      }

      this.saveGame(game_id);
      
      let arcade = this.app.modules.returnModule("Arcade");
      if (arcade){
        arcade.viewing_arcade_initialization_page = 0; //Make sure can restore arcade main
        if (txmsg.reason == "cancellation"){
          arcade.receiveCloseRequest(blk, tx, conf, app); //Update SQL Database  
        } else {
          arcade.receiveGameoverRequest(blk, tx, conf, app); //Update SQL Database  
        }
        arcade.removeGameFromOpenList(game_id);            //remove from arcade.games[]
        //It may be okay to include this here since we are definitively done with the game
        //However, there is code in Arcade to scan for finished games and remove them from options
        this.removeGameFromOptions(game_id);            //remove from options.games[]
      }
    
    }
    
    return;
  }

  

  //
  // call this to end game as tie
  //
  tieGame() {
    game_id = game_id || this.game.id;

    this.endGame(this.game.players, "tie");  
  }

  /*
  Typically run by all the players, so we filter to make sure just one player sends to transaction
  Can also be used by a player (A) to announce to opponents that A is the winner.
  Function selects a winner to generate the game ending transaction, which is processed above 
  in receiveGameOverRequest
  */
  endGame(winner = [], method = "") {
    this.game.winner = winner;

    let player_to_send = (Array.isArray(winner)) ? winner[0] : winner;
    player_to_send = player_to_send || this.game.players[0];

    //Only one player needs to generate the transaction
    if (player_to_send == this.app.wallet.returnPublicKey()) {
      var newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
      newtx.transaction.to = this.game.accepted.map((player) => new saito.default.slip(player));
      newtx.msg = {
        request: "gameover",
        game_id: this.game.id,
        winner,
        module: this.game.module,
        reason: method,
      };

      newtx = this.app.wallet.signTransaction(newtx);

      console.log("TRANS: " + JSON.stringify(newtx.transaction));

      //Send message
      this.app.network.propagateTransaction(newtx);

      let relay_mod = this.app.modules.returnModule("Relay");
      if (relay_mod){
        relay_mod.sendRelayMessage(this.game.accepted, "game relay gameover", newtx);
      }
    }

  }


  /*
  Intermediate step that may or may not lead to an end game (via forfeit)
  Only triggered by a single player
  IF the game logic finds that a player loses the game, they can notify the opponent by setting game.over to 1 
  calling resignGame.
  Otherwise, the game engine interprets it as a standard resignation and has other player(s) win by forfeit
  */
  resignGame(game_id = null, reason = "forfeit") {
    //May be called from Arcade and have to load the game to send out the message to correct players
    if (game_id && this.game.id != game_id) {
      this.loadGame(game_id);
    }

    var newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    newtx.transaction.to = this.game.accepted.map((player) => new saito.default.slip(player));
    newtx.msg = {
        request: "stopgame",
        game_id: this.game.id,
        loser: this.game.player,
        module: this.game.module,
        is_game_over: this.game.over,
        reason,
      };

    newtx = this.app.wallet.signTransaction(newtx);

    //Send message
    this.app.network.propagateTransaction(newtx);
    let relay_mod = this.app.modules.returnModule("Relay");
    if (relay_mod){
      relay_mod.sendRelayMessage(this.game.accepted, "game relay stopgame", newtx);
    }

    //We use game.over as a flag to differentiate between player quitting and player reaching a lose game condition and needing to notify the other players
    this.game.over = 0;
  }


  /*
    Games should have a function to turn off all game-specific dom events
  */
  removeEvents(){

  }

  /*
  We receive a transaction (on/off chain) saying that a player hit the quit button
  We figure out who the other players are and if the game has gone beyond its grace period, 
  call another function to push us into end game state (which requires another transaction)
  Resigning a game does still lead to a default game cancellation
  */
  processResignation(resigning_player, txmsg){
    this.game.queue = [];
    this.moves = []; 

    if (this.game.over == 1){
      return;
    }

    console.log(resigning_player, JSON.parse(JSON.stringify(txmsg)));
    console.log(this.game.players);

    //This is for games like chess, which allow the player to click resign within the game page
    let arcade = this.app.modules.returnModule("Arcade");
    if (arcade){ arcade.removeGameFromOpenList(this.game.id); }

    //We DO NOT want to run this here because the game engine still needs to send/receive a message
    //confirming the end of the game state and triggering the right UI
    //this.removeGameFromOptions(this.game.id);            //remove from options.games[]

    if (this.game?.players) {
      if (!this.game.players.includes(resigning_player)){ 
      //Player already not an active player, make sure they are also removed from accepted to stop receiving messages
        for (let i = this.game.accepted.length; i>=0; i--){
          if (this.game.accepted[i] == player_key){
            this.game.accepted.splice(i,1);
          }
        }

        return;
      }
    }
    
    if (txmsg.is_game_over == 0){
      this.updateLog(`Player ${txmsg.loser} quits the game`);  
    }

    let winners = [];
    for (let p of this.game.players){
      if (p !== resigning_player){
        winners.push(p);
      }
    }

    if (this.game.step.game > this.grace_window || txmsg.is_game_over == 1){
      this.endGame(winners, txmsg.reason);
    }else{
      this.endGame([],"cancellation"); //No one is marked as a winner
    }
    
  }

    //
    // saves future moves without disrupting our queue state
    // so that we can continue without reloading and reload
    // without losing future moves.
    //
  saveFutureMoves(game_id = null) {
    if (game_id === null) {
      return;
    }
    
    if (this.app.options?.games) {
      for (let i = 0; i < this.app.options.games.length; i++) {
        if (this.app.options.games[i].id === this.game.id) {
          this.app.options.games[i].future = this.game.future;
        }
      }
    }
    

    this.app.storage.saveOptions();
  }



  deleteGamePreference(key) {
    if (this.app.options) {
      if (this.app.options.gameprefs) {
        if (this.app.options.gameprefs[key]) {
          delete this.app.options.gameprefs[key];
        }
      }
    }
    return null;
  }
  loadGamePreference(key) {
    if (this.app.options) {
      if (this.app.options.gameprefs) {
        return this.app.options.gameprefs[key];
      }
    }
    return null;
  }
  saveGamePreference(key, value) {
    if (this.app.options.games == undefined) {
      this.app.options.games = [];
    }
    if (this.app.options.gameprefs == undefined) {
      this.app.options.gameprefs = {};
      this.app.options.gameprefs.random = this.app.crypto.generateKeys();
    }

    this.app.options.gameprefs[key] = value;
    this.app.storage.saveOptions();
  }

  //
  // async not used now, but exists to we can potentially add a delay after saves
  // in the future if needed.
  //
  async saveGame(game_id) {
    //console.log("===== SAVING GAME ID: "+game_id);
    if (this.app.options) {
      if (!this.app.options.games) {
        this.app.options = Object.assign(
          {
            games: [],
            gameprefs: { random: this.app.crypto.generateKeys() },
          },
          this.app.options
        );
      }
    }

    //console.log("saveGame version: "+this.app.crypto.hash(Math.random()));
    if (!game_id || game_id !== this.game.id) {
      //game_id = this.app.crypto.hash(Math.random().toString(32));
      console.log("ERR? Save game with wrong id");
      console.log("Parameter: "+game_id, "this game.id = "+this.game.id);
    }

    let new_game = true;

    if (game_id != null) {
      if (this.app.options) {
        if (this.app.options.games) {
          for (let i = 0; i < this.app.options.games.length; i++) {
            if (this.app.options.games[i].id === game_id) {
              new_game = false;
              if (this.game == undefined) {
                console.log("Saving Game Error: safety catch 1");
                return;
              }
              if (this.game.id != game_id) {
                console.log("Saving Game Error: safety catch 2");
                return;
              }
              this.game.ts = new Date().getTime();

              //
              // sept 25 - do not overwrite any future moves saved separately
              //
              for (let ii = 0; ii < this.app.options.games[i].future.length; ii++) {
                let do_we_contain_this_move = 0;
                for (let iii = 0; iii < this.game.future.length; iii++) {
                  if (this.app.options.games[i].future[ii] === this.game.future[iii]) {
                    do_we_contain_this_move = 1;
                  }
                }
                if (do_we_contain_this_move == 0) {
                  this.game.future.push(this.app.options.games[i].future[ii]);
                }
              }

              this.app.options.games[i] = JSON.parse(JSON.stringify(this.game)); //create new object 
              this.app.storage.saveOptions();
              return;
              /*
              // add slight delay on saves to permit storage to save before next move
              // -- doesn't introduce a delay unless calling function uses await.
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  resolve(1);
                }, 1000);
              });*/
            }
          }
        }
      }
    }

   

    if (new_game){ this.app.options.games.push(this.game); }

    this.app.storage.saveOptions();
    /*return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(1);
      }, 1000);
    });*/
  }

  loadGame(game_id = null) {
    if (this.app.options.games == undefined) {
      this.app.options.games = [];
    }
    if (this.app.options.gameprefs == undefined) {
      this.app.options.gameprefs = {};
      this.app.options.gameprefs.random = this.app.crypto.generateKeys(); // returns private key for self-encryption (save keys)
    }

    //
    // try to load most recent game
    //
    if (game_id == null) {
      let game_to_open = 0;

      if (this.app.options.games.length > 0){
        for (let i = 1; i < this.app.options.games.length; i++) {
          if (this.app.options.games[i].ts > this.app.options.games[game_to_open].ts) {
            game_to_open = i;
          }
        }  
        game_id = this.app.options.games[game_to_open].id;  
      }
    }

    if (game_id != null) {
      for (let i = 0; i < this.app.options.games.length; i++) {
        if (this.app.options.games[i].id === game_id) {
          this.game = JSON.parse(JSON.stringify(this.app.options.games[i]));
          return this.game;
        }
      }
    }

    console.log(`Load failed (${game_id} not found), so creating new game`);
    console.log(JSON.parse(JSON.stringify(this.app.options.games)));

    //we don't have a game with game_id stored in app.options.games
    this.game = this.newGame(game_id); 
    this.saveGame(this.game.id); 

    return this.game;
  }

  newGame(game_id = null) {
    console.log("=====CREATING NEW GAME ID: "+game_id);
    if (!game_id) {
      game_id = this.app.crypto.hash(Math.random().toString(32)); //Returns 0.19235734589 format. We never want this to happen!
      //game_id = this.app.crypto.hash(Math.random());
      console.log("new id -- "+game_id);
    }
    //console.trace("Creating New Game","ID = "+game_id);
    let game = {};
    game.id = game_id;
    game.confirms_needed = [];
    game.crypto = "";
    game.player = 1;
    game.players = [];
    game.opponents = []; //Is this not redundanct?
    game.keys = [];
    game.players_needed = 1; //For when the Arcade (createGameTXfromOptionsGame) 
    game.accepted = []; //Not clear what this was originally for, but is now a master list of players
    game.players_set = 0;
    game.target = 1;
    game.invitation = 1;
    game.initializing = 1;
    game.initialize_game_run = 0;
    game.accept = 0;
    game.over = 0;
    game.winner = 0;
    game.module = "";
    game.originator = "";
    game.ts = new Date().getTime();
    game.last_block = 0;
    game.options = {};
    game.options.ver = 1;
    game.invite_sig = "";
    game.future = []; // future moves (arrive while we take action)
    game.halted = 0;
    game.lock_interface = 0;
    game.saveGameState = 0;

    game.clock_spent = 0;
    game.clock_limit = 0;

    game.step = {};
    game.step.game = 1;
    game.step.players = {}; // associative array mapping pkeys to last game step
    game.step.ts = 0; // last_move in observer mode

    game.queue = [];
    game.turn = [];
    game.deck = []; // shuffled cards
    game.pool = []; // pools of revealed cards
    game.dice = this.app.crypto.hash(game_id); //Why not just initialize the dice here?

    game.status = ""; // status message
    game.log = [];
    game.sroll = 0; // secure roll
    game.sroll_hash = "";
    game.sroll_done = 0;
    game.spick_card = ""; // card selected
    game.spick_hash = ""; // secure pick (simulatenous card pick)
    game.spick_done = 0;

    return game;
  }

  rollDice(sides = 6, mycallback = null) {
    this.game.dice = this.app.crypto.hash(this.game.dice);
    let a = parseInt(this.game.dice.slice(0, 12), 16) % sides;
    if (mycallback != null) {
      mycallback(a + 1);
    } else {
      return a + 1;
    }
  }

  initializeDice() {
    if (this.game.dice === "") {
      if (!this.game.id) { this.game.id = this.app.crypto.hash(new Date().getTime()); }
      this.game.dice = this.app.crypto.hash(this.game.id);
    }
    console.log("Initialize Dice 2:" + this.game.dice);
  }

  //
  // requests generation of a secure random number for all
  // subsequent rolls.
  //
  requestSecureRoll() {
    this.game.sroll = 1;
  }


  /**
   * Some game modules place elements directly on the board, but when we resize the board (to fit the screen).
   * need to remember the scale ratio in order for the board elements to move with the board
   */
  scale(x) {
    let y = Math.floor(this.boardRatio * x);
    return y;
  }

  
  //
  // Fisher–Yates shuffle algorithm:
  //
  shuffleArray(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  }

  returnNextPlayer(num) {
    let p = parseInt(num) + 1;
    if (p > this.game.players.length) {
      return 1;
    }
    return p;
  }

    /* standard 52 card deck */
    returnPokerDeck() {
    var deck = {};
    var suits = ["S","C","H","D"];
    let indexCt = 1;
    for (let i = 0; i<4; i++){
      for (let j = 1; j<=13; j++){
        let cardImg = `${suits[i]}${j}`;
        deck[indexCt.toString()] = { name: cardImg};  /*need to make this shit consistent*/
        indexCt++;
      }
    }
    return deck;

  }



  shuffleDeck(deckidx = 1) {
    let new_cards = [];
    let new_keys = [];

    let old_crypt = this.game.deck[deckidx - 1].crypt;
    let old_keys = this.game.deck[deckidx - 1].keys;

    let total_cards = this.game.deck[deckidx - 1].crypt.length;
    let total_cards_remaining = total_cards;

    for (let i = 0; i < total_cards; i++) {
      // will never have zero die roll, so we subtract by 1
      let random_card = this.rollDice(total_cards_remaining) - 1;

      new_cards.push(old_crypt[random_card]);
      new_keys.push(old_keys[random_card]);

      old_crypt.splice(random_card, 1);
      old_keys.splice(random_card, 1);

      total_cards_remaining--;
    }

    this.game.deck[deckidx - 1].crypt = new_cards;
    this.game.deck[deckidx - 1].keys = new_keys;
  }

  
  addPool() {
    let newIndex = this.game.pool.length;
    this.resetPool(newIndex);
  }
  addDeck() {
    let newIndex = this.game.deck.length;
    this.resetDeck(newIndex);
  }
  resetPool(newIndex = 0) {
    this.game.pool[newIndex] = {};
    this.game.pool[newIndex].cards = {};
    this.game.pool[newIndex].crypt = [];
    this.game.pool[newIndex].keys = [];
    this.game.pool[newIndex].hand = [];
    this.game.pool[newIndex].decrypted = 0;
  }
  resetDeck(newIndex = 0) {
    this.game.deck[newIndex] = {};
    this.game.deck[newIndex].cards = {};
    this.game.deck[newIndex].crypt = [];
    this.game.deck[newIndex].keys = [];
    this.game.deck[newIndex].hand = [];
    this.game.deck[newIndex].xor = "";
    this.game.deck[newIndex].discards = {};
    this.game.deck[newIndex].removed = {};
  }

  
  bindBackButtonFunction(mycallback) {
    document.getElementById("back_button").onclick = (e) => {
      mycallback();
    };
  }

  //
  // force can be set to 1 to override "lock_interface"
  // which is often set to 1 in the game engine to prevent
  // moves that come in while the player is waiting from
  // updating the screen.
  //
  updateStatus(str, force = 0) {
    if (this.lock_interface == 1 && force == 0) {
      return;
    }

    this.game.status = str; //Don't know why we do this

    if (!this.browser_active) {
      return;
    }

    try {
      if (this.useHUD) {
        this.hud.updateStatus(str);
      } else {
        let status_obj = document.getElementById("status") || document.querySelector(".status");
        if (status_obj) {
          status_obj.innerHTML = str;
        }else{
          console.log("Unable to update status, msg: "+str);
        }
      }
    } catch (err) {
      console.log("Error Updating Status: ignoring: " + err);
    }
  }

  /*
   * Wrapper functions for dealing with log
   */

  /*
   * Duplicates/Overwrites embedded functionality of gameLog in a seperate array that is remembered between game sessions
   * this.game.log will not store consecutive identical logs, but force is passed on to gameLog where it will display
   */
  updateLog(str, force = 0) {
    try {
      this.game.log.unshift(str);
      if (this.game.log.length > this.log_length) {
        this.game.log.splice(length);
      }

      if (this.browser_active) {
        this.log.updateLog(str, force);
        if (this.useCardbox) {
          this.cardbox.attachCardEvents();
        }
      }
    } catch (err) {}
  }

  /*
   * When reloading a game, restore the history of log messages
   */
  restoreLog() {
    try {
      this.log.logs = [...this.game.log];
    } catch (err) {}
  }

  //
  // OBSERVER MODE - return keystate prior to move (hand, etc.)
  //
  returnPreMoveGameState() {
    let game_clone = JSON.parse(JSON.stringify(this.game_state_pre_move));
    let sharekey = this.loadGamePreference(this.game.id + "_sharekey");
    for (let i = 0; i < game_clone.deck.length; i++) {
      if (sharekey) {
        game_clone.deck[i].hand = this.app.crypto.encodeXOR(
          this.app.crypto.stringToHex(JSON.stringify(game_clone.deck[i].hand)),
          sharekey
        );
        game_clone.deck[i].keys = this.app.crypto.encodeXOR(
          this.app.crypto.stringToHex(JSON.stringify(game_clone.deck[i].keys)),
          sharekey
        );
      } else {
        game_clone.deck[i].keys = [];
        game_clone.deck[i].hand = [];
      }
    }
    return game_clone;
  }
  returnGameState() {
    let game_clone = JSON.parse(JSON.stringify(this.game));
    let sharekey = this.loadGamePreference(this.game.id + "_sharekey");
    for (let i = 0; i < game_clone.deck.length; i++) {
      if (sharekey) {
        game_clone.deck[i].hand = this.app.crypto.encodeXOR(
          this.app.crypto.stringToHex(JSON.stringify(game_clone.deck[i].hand)),
          sharekey
        );
        game_clone.deck[i].keys = this.app.crypto.encodeXOR(
          this.app.crypto.stringToHex(JSON.stringify(game_clone.deck[i].keys)),
          sharekey
        );
      } else {
        game_clone.deck[i].keys = [];
        game_clone.deck[i].hand = [];
      }
    }
    return game_clone;
  }

  /**
   * A stub that should be overwritten by the game module to return a formatted HTML (to be inserted into an overlay) description of the game rules
   */
  returnGameRulesHTML() {
    return "<h1>How to Play</h1>";
  }

  /**
   * Advanced options interface in Arcade creates an overlay with the returned html
   * Can use <div class="overlay-input"></div> to neatly group options
   * Should include <div id="game-wizard-advanced-return-btn" class="game-wizard-advanced-return-btn button">accept</div>
   */
  returnGameOptionsHTML() {
    return "";
  }

  returnCryptoOptionsHTML(values = null){
    values = values || [0.001, 0.01, 0.1, 1, 5, 10, 50, 100, 500, 1000];
    let html = `
        <div class="overlay-input">
          <label for="crypto">Crypto:</label>
          <select id="crypto" name="crypto">
            <option value="" selected>none</option>`;

    let listed = [];
    for (let i = 0; i < this.app.modules.mods.length; i++) {
      if (this.app.modules.mods[i].ticker && !listed.includes(this.app.modules.mods[i].ticker)) {
        html += `<option value="${this.app.modules.mods[i].ticker}">${this.app.modules.mods[i].ticker}</option>`;
        listed.push(this.app.modules.mods[i].ticker);
      }
    }

    html += `</select></div>`;

    html += `<div id="stake_input" class="overlay-input" style="display:none;">
                <label for="stake">Stake:</label>
                <select id="stake" name="stake">`;

    for (let i = 1; i < values.length; i++){
      html += `<option value="${values[i]}" >${values[i]}</option>`;
    }
    html += `</select></div>`;

    return html;    
  }

  /**
   * Semi-Advanced options interface in Arcade allows 2 player games to elevate a separate option in lieu of # players
   * Should be a <select> 
   */
  returnSingularGameOption(){
    return "";
  }

  /*
  * A method to filter out some of the game options to clean up the game invite display in the arcade
  * Game invites list options, or rename the options in a more user friendly way
  * See also arcade/lib/arcade-main/templates/arcade-invite.template.js
  */
  returnShortGameOptionsArray(options) {
    let sgo = {};
    let crypto = "";
    console.log(JSON.parse(JSON.stringify(options)));
    for (let i in options) {
      if (options[i] != "") {
        let output_me = 1;
        if (i == "clock" && options[i] == 0) {
          output_me = 0;
        }
        if (i == "observer" && options[i] != "enable") {
          output_me = 0;
        }
        if (i == "game-wizard-players-select") {
          output_me = 0;
        }
        if (i == "game") {
          output_me = 0;
        }
        if (i == "crypto"){
          output_me = 0;
          crypto = options[i]; //Don't display but save this info
        }
        if (i == "stake"){
          output_me = 0;
          if (crypto && parseFloat(options["stake"]) > 0){
            sgo["stake"] = options["stake"] + " " + crypto; 
          }
        }
        if (output_me == 1) {
          sgo[i] = options[i];
        }
      }
    }

    return sgo;
  }

  /*
  * A method for game modules to (optionally) filter the whole list of options to a smaller object.
  * That object gets included in the game data packaged with the transaction to create an invite
  */
  returnFormattedGameOptions(options) {
    return options;
  }

  /**
  * Called when displaying advanced game options, so you can dynamically change the DOM as users select options
  * (i.e. hide/display options that have prerequisites)
  */
  attachAdvancedOptionsEventListeners(){
    let crypto = document.getElementById("crypto");
    let stakeInput = document.getElementById("stake_input");
    if (crypto && stakeInput){
      crypto.onchange = ()=>{
        if (crypto.value){
          stakeInput.style.display = "block";
        }else{
          stakeInput.style.display = "none";
        }
      }  
    }
    return;
  }

  prependMove(mv) {
    this.moves.unshift(mv);
  }

  addMove(mv) {
    this.moves.push(mv);
  }

  removeMove() {
    return this.moves.pop();
  }

  endTurn(nexttarget = 0) {
    let extra = {};
    this.game.turn = this.moves;
    this.moves = [];
    this.sendMessage("game", extra);
  }

  /**FIX HERE**/
  formatStatusHeader(status_header, include_back_button = false) {
    return `
    <div class="status-header">
      ${include_back_button ? this.back_button_html : ""}
      <span id="status-content">${status_header}</span>
    </div>
    `;
  }

  /**
   *  Update Status (in HUD) and include a graphical display/textual description of cards (either provided or in one's hand)
   *  @param message - text (non-HTML formatted message) to insert in the (HUD) status
   *  @param cards - an array of cards (indices to this.game.deck[].cards)
   *
   */
  updateStatusAndListCards(message, cards = [], include_back_button = false) {
    //
    // OBSERVER MODE
    if (this.game.player == 0) {
      this.updateStatus(`<div id="status-header" class="status-header">${message}</div>`);
      return;
    }

    //console.log("UPDATE STATUS AND LIST CARDS");
    html = `<div class="status-header">
              ${include_back_button ? this.back_button_html : ""}
            <span id="status-content">${message}</span>
            </div>`;
    //console.log("INTERFACE: " + this.interface);
    if (this.interface === 1) {
      html += `<div class="status-cardbox" id="status-cardbox">${this.returnCardList(cards)}</div>`;
    } else if (this.interface === 2) {
      html += `<ul id="status-cardbox">${this.returnCardList(cards)}</ul>`;
    }

    this.updateStatus(html);
    if (include_back_button && this.menu_backup_callback) {
      document.getElementById("back_button").onclick = this.menu_backup_callback;
    }
  }

  /**
   *  Update Status (in HUD) and include a graphical display/textual description of cards (either provided or in one's hand)
   *  @param message - text (non-HTML formatted message) to insert in the (HUD) status
   *  @param optionHTML - an html list of actions a user can take
   *
   */
  updateStatusWithOptions(message = "", optionHTML = "", include_back_button = false) {
    let html = `<div class="status-header">`;
    if (include_back_button){
      html += this.back_button_html;
    }
    html += `<span id="status-content">${message}</span></div>
      <div class="status-text-menu">
        ${optionHTML}
      </div>`;

    this.updateStatus(html);
    if (include_back_button && this.menu_backup_callback) {
      document.getElementById("back_button").onclick = this.menu_backup_callback;
    }
  }

  /**
   * refreshes dom for elements (by stored class name) which trigger the cardbox
   * can update the stored action for clicking
   */
  attachCardboxEvents(mycallback = null) {
    if (this.useCardbox){
      this.changeable_callback = mycallback;
      //console.log("New Callback", mycallback);
      this.cardbox.hide(1);
      this.cardbox.attachCardEvents();
    }
  }

  returnCardList(cardarray = [], deckid = 0) {

    if (cardarray.length === 0) {
      //Get the "hand"
      cardarray = this.game.deck[deckid].hand; //Keys to the deck object
    }

    if (cardarray.length === 0) {
      console.log("No cards to render...");
      return "";
    }

    //console.log("cardarray length in returnCardList: " + cardarray.length);

    let html = "";
    if (this.interface === 2) {
      //text
      for (i = 0; i < cardarray.length; i++) {
        html += this.returnCardItem(cardarray[i]);
      }
      return html;
    } else {
      for (i = 0; i < cardarray.length; i++) {
        //console.log("card image: " + this.returnCardImage(cardarray[i], deckid));
        html += `<div id="${cardarray[i]}" class="card hud-card">${this.returnCardImage(
          cardarray[i],
          deckid
        )}</div>`;
      }
      return html;
    }
  }

  returnCardItem(card, deckid) {

    card = card.replace(/ /g, "").toLowerCase();
    let c = this.game.deck[deckid].cards[card];

    //Fallback (try discard/remove piles and other decks if card not found)
    for (let z = 0; c == undefined && z < this.game.deck.length; z++) {
      c = this.game.deck[z].cards[cardname];
      if (c == undefined) {
        c = this.game.deck[z].discards[cardname];
      }
      if (c == undefined) {
        c = this.game.deck[z].removed[cardname];
      }
    }

    if (c) {
      return `<li class="card" id="${card}">${c.name}</li>`;
    } else {
      return `<li class="card noncard" id="${card}">card not found</li>`;
    }
  }

  /**
   * Attempt to create a html <img> tag of the given card (prioritizing searching in a particular deck)
   */
  returnCardImage(cardname, deckid = null) {
    let c = null;
    if (deckid == null) {
      for (let i = 0; i < this.game.deck.length; i++) {
        c = this.game.deck[i].cards[cardname];
        if (c) {
          deckid = i;
          break;
        }
      }
    }

    //console.log("return Card Image with: " + cardname + " -- " + deckid);

    //Fallback (try discard/remove piles and other decks if card not found)
    if (c == null) {
      for (let z = 0; c == null && z < this.game.deck.length; z++) {
        c = this.game.deck[z].cards[cardname];
        if (c == undefined) {
          c = this.game.deck[z].discards[cardname];
        }
        if (c == undefined) {
          c = this.game.deck[z].removed[cardname];
        }
      }
    }

    //
    // this is not a card, it is something like "skip turn" or cancel
    //
    if (c == null) {
      // if this is an object, it might have a returnCardImage() function attached
      // that will give us what we need. try before bailing.
      if (typeof cardname === "object" && !Array.isArray(cardname) && cardname != null) {
        if (cardname.returnCardImage != null) {
          let x = cardname.returnCardImage();
          if (x) {
            return x;
          }
        }
      }
      return '<div class="noncard">' + cardname + "</div>";
    }

    let suggested_img = this.returnSlug() + "/img/";
    if (c.img.indexOf(suggested_img) != -1) {
      return `<img class="cardimg" id="${cardname}" src="${c.img}" />`;
    }
    return `<img class="cardimg" id="${cardname}" src="/${this.returnSlug()}/img/${c.img}" />`;
  }

  //
  // returns discarded cards and removes them from discard pile
  //
  returnDiscardedCards(deckidx = 1) {
    var discarded = {};
    deckidx = parseInt(deckidx - 1);

    for (var i in this.game.deck[deckidx].discards) {
      discarded[i] = this.game.deck[deckidx].cards[i];
      delete this.game.deck[deckidx].cards[i];
    }

    this.game.deck[deckidx].discards = {};

    return discarded;
  }

  /**
   * Convert a hand (array of cards) to the html hand
   */
  handToHTML(hand) {
    let html = "<div class='htmlCards'>";
    hand.forEach((card) => {
      html += `<img class="card" src="${this.card_img_dir}/${card}.png">`;
    });
    html += "</div> ";
    return html;
  }


  /**
   * Get the player name from the this.game.player
   */ 
  identifyPlayer(player){
    let name =  this.game.players[player - 1];
    name = this.app.keys.returnUsername(name);
    
    if (!name){ name = this.app.keys.returnIdentifierByPublicKey(this.game.players[player - 1]); }
    if (name != "") {
      if (name.indexOf("@") > 0) {
        name = name.substring(0, name.indexOf("@"));
      }else{
        name = name.substring(0, 10)+"...";
      }
    }else{
      name = "Player "+ player;
    }
    return name;
  }

  identifyPlayerByPublicKey(pkey){
    let name = this.app.keys.returnUsername(pkey);
    
    if (!name){ name = this.app.keys.returnIdentifierByPublicKey(pkey); }
    if (name != "") {
      if (name.indexOf("@") > 0) {
        name = name.substring(0, name.indexOf("@"));
      }else{
        name = name.substring(0, 10)+"...";
      }
    }else{
      name = `Player ${this.game.players.indexOf(pkey) + 1}`;
    }
    return name;
  }


  /**
   *
   */
  removeCardFromHand(card) {
    for (let z = 0; z < this.game.deck.length; z++) {
      for (i = 0; i < this.game.deck[z].hand.length; i++) {
        if (this.game.deck[z].hand[i] === card) {
          this.game.deck[z].hand.splice(i, 1);
        }
      }
    }
  }

  /**
   * Given a list of player names in string format: {"player 1, player 2, player 3, "}
   * Remove the final comma and insert an "and"
   */
  prettifyList(list) {
    list = list.substring(0, list.length - 2); //cut the final ,
    if (list.split(",").length >= 2) {
      let index = list.lastIndexOf(",");
      list = list.slice(0, index) + " and" + list.slice(index + 1);
    }
    return list;
  }

  playerAcknowledgeNotice(msg, mycallback) {
    let html = `<ul><li class="textchoice" id="confirmit">I understand...</li></ul>`;

    try {
      this.updateStatusWithOptions(msg, html);
      this.attachCardboxEvents();
      document.getElementById("confirmit").onclick = (e) => {
        document.getElementById("confirmit").onclick = null; //If player clicks multiple times, don't want callback executed multiple times
        mycallback();
      };
    } catch (err) {
      console.error("Error with ACKWNOLEDGE notice!: " + err);
    }

    return 0;
  }

  nonPlayerTurn() {
    console.log("it is not my turn!");
    this.hud.updateStatusMessage("Waiting for Opponent to Move");
  }

  playerTurn() {
    game_self = this;

    console.log(`
  This is the default Player Turn function. It should be replaced in any 
  game by code logic that specifies what players actually do. Their moves
  should be added to the queue using addMove() and then endTurn() to 
  submit those moves to all other players.

  Note that other players will execute the contents of this queue in 
  reverse order. Complicated game moves that require conditional should
  be handled in .

  The PLAY instruction does not "fall-out" automatically (it will keep 
  coming back to the player whose turn it is. This is deliberate design.
  In order to remove this move, RESOLVE command must be issued by the 
  player whose turn it is. This will permit the queue to clear and 
  the game will continue with the next player.
    `);

    game_self.addMove("RESOLVE\t" + game_self.app.wallet.returnPublicKey());
    game_self.addMove("NOTIFY\tPlayer " + game_self.game.player + " has moved");
    game_self.endTurn();
  }

  addPublickeyConfirm(pubkey, confs) {
    this.game.tmp_confirms_received += parseInt(confs);
    this.game.tmp_confirms_players.push(pubkey);
  }
  hasPlayerConfirmed(pubkey) {
    if (this.game.tmp_confirms_players.includes(pubkey)) {
      return 1;
    }
    if (this.game.confirms_players.includes(pubkey)) {
      return 1;
    }
    return 0;
  }

  removeConfirmsNeeded(array_of_player_nums) {
    this.game.confirms_needed = [];
    this.game.confirms_received = 0;
    this.game.confirms_players = [];
    this.game.tmp_confirms_received = 0;
    this.game.tmp_confirms_players = [];

    for (let i = 0; i < this.game.players.length; i++) {
      this.game.confirms_needed[i] = 0;
    }
  }
  resetConfirmsNeeded(array_of_player_nums) {
    this.game.confirms_needed = [];
    this.game.confirms_received = 0;
    this.game.confirms_players = [];
    this.game.tmp_confirms_received = 0;
    this.game.tmp_confirms_players = [];

    for (let i = 0; i < this.game.players.length; i++) {
      if (
        array_of_player_nums.includes(i + 1) ||
        array_of_player_nums.includes(this.game.players[i])
      ) {
        this.game.confirms_needed[i] = 1;
      } else {
        this.game.confirms_needed[i] = 0;
      }
    }
  }

  returnPlayerName(num) {
    let x = this.game.players[num - 1].substring(0, 11);
    return x;
  }


  startClock() {
    if (!this.useClock) { return; }

    clearInterval(this.clock_timer); //Just in case
    console.log("Clock Limit: " + this.game.clock_limit);
    console.log("Time spent so far: " + this.game.clock_spent);


    //Refresh the clock every second
    this.clock_timer = setInterval(() => {
      let t = new Date().getTime();
      let time_on_clock = this.game.clock_limit - (t - this.time.last_received) - this.game.clock_spent;
      if (time_on_clock <= 0){
        clearInterval(this.clock_timer);
        this.clock.displayTime(0);
        this.game.over = 1;
        this.resignGame(this.game.id, "time out");        
      }
      this.clock.displayTime(time_on_clock);
    }, 1000); 
  }

  stopClock() {
    if (!this.useClock) { return; }
    clearInterval(this.clock_timer);
  }

  lockInterface() {
    this.lock_interface = 1;
    this.lock_interface_step = this.game.queue[this.game.queue.length - 1];
  }
  unlockInterface() {
    this.lock_interface = 0;
  }
  mayUnlockInterface() {
    if (this.lock_interface_step === this.game.queue[this.game.queue.length - 1]) {
      return 1;
    }
    return 0;
  }

  /**
   * Definition of core gaming logic commands
   */
initializeQueueCommands() {
    //
    // add stuff to queue
    //
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "SETVAR") {
        if (gmv[1]) {
          if (gmv[3]) {
            if (gmv[4]) {
              game_self.game[gmv[1]][gmv[2]][gmv[3]] = gmv[4];
            } else {
              game_self.game[gmv[1]][gmv[2]] = gmv[3];
            }
          } else {
            if (gmv[2]) {
              game_self.game[gmv[1]] = gmv[2];
            }
          }
        }
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
      }
      return 1;
    });


    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "NOTIFY" || gmv[0] === "notify") {
        game_self.updateLog(gmv[1]);
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
      }
      return 1;
    });

    /*DEPRECATED BECAUSE model of status has become very complicated*/
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "STATUS" || gmv[0] === "status") {
        game_self.updateStatus(gmv[1]);
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "LOAD") {
        console.log("LOAD not supported in game engine - see saveload module");
      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "SAVE") {

        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);

        if (!game_self.app.options.saves) {
          game_self.app.options.saves = {};
        }

  //
  // we don't save from the LIVE version as we may have executed commands
  //
  // we save from the SAVED version in the options file
  //
  let game_id = game_self.game.id;
        let backup_game = JSON.parse(JSON.stringify(game_self.game));

  for (let i = 0; i < this.app.options.games.length; i++) {
    if (this.app.options.games[i].id === game_id) {
            backup_game = this.app.options.games[i];
      i = this.app.options.games.length+1;
    }
  }

        backup_game.queue.push(
          `ACKNOWLEDGE\tre you sure you want to continue? Your game will continue the next time you click to continue, but if not all players have reloaded the game will break.`
        );
        backup_game.queue.push(
          `ACKNOWLEDGE\tGame Reloaded. Please confirm all players have reloaded before clicking to continue.`
        );

        game_self.app.options.saves[game_self.game.id] = backup_game;

  let loadurl = this.app.browser.protocol + "://" + this.app.browser.host;
  game_self.updateLog(`<p></p>This game has been saved. To restore from this point, all players should visit the following URL:<p></p>&nbsp;<p></p>${loadurl}/load?game_id=${game_self.game.id}<p></p>&nbsp;<p></p>`);

  //
  // is it safe to save here?
  //
        game_self.app.storage.saveOptions();

      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "ACKNOWLEDGE") {
        let notice = gmv[1];
        game_self.game.halted = 1;
        let my_specific_game_id = game_self.game.id;

        game_self.saveGame(game_self.game.id);

        console.log("about to ACKNOWLEDGE");

        game_self.playerAcknowledgeNotice(notice, function () {
          if (game_self.game.id != my_specific_game_id) {
            game_self.game = game_self.loadGame(my_specific_game_id);
          }
          game_self.updateStatus(" acknowledged...");
          game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
          game_self.restartQueue();

          return 1;
        });

        console.log("should halt game...");
        return 0;
      }

      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "GAMEOVER") {
        if (game_self.browser_active == 1) {
          game_self.updateLog("Player has Quit the Game");
        }
        return 0;
      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "OBSERVER") {
        let msgobj = {
          game_id: game_self.game.id,
          player: game_self.app.wallet.returnPublicKey(),
          module: game_self.game.module,
        };
        let msg = game_self.app.crypto.stringToBase64(JSON.stringify(msgobj));
        try {
          //
          // OBSOLETE MSG -- keeping code so reference for improvements here though
          //
          //  game_self.displayModal("Observer Mode now Active");
          //  game_self.updateLog(`Player ${game_self.game.player} has enabled observer mode. This can leak data on your private hand to your opponent.`);
        } catch (err) {}
        game_self.observer_mode = 1;
        game_self.game.saveGameState = 1;
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "PLAY") {
        let players_to_go = [];
        if (gmv[1] === "all") {
          for (let i = 0; i < game_self.game.players.length; i++) {
            players_to_go.push(i + 1);
          }
        } else {
          try {
            if (gmv[1].isArray()) {
              players_to_go = gmv[1];
            } else {
              players_to_go = [gmv[1]];
            }
          } catch (err) {
            players_to_go = gmv[1];
          }
        }

        //
        // reset confs if we do not have confirms_needed
        //
        let reset_confirmations = 1;
        for (let i = 0; i < game_self.game.confirms_needed.length; i++) {
          if (game_self.game.confirms_needed[i] == 1) {
            reset_confirmations = 0;
          }
        }
        if (reset_confirmations == 1) {
          game_self.resetConfirmsNeeded(players_to_go);
        }

        let can_i_go = 0;
        for (let i = 0; i < players_to_go.length; i++) {
          if (game_self.game.player == parseInt(players_to_go[i])) {
            can_i_go = 1;
            if (game_self.game.confirms_needed[players_to_go[i] - 1] == 1) {
              game_self.playerTurn();
            }
          }
        }
        if (can_i_go == 0) {
          game_self.nonPlayerTurn();
        }

        return 0;
      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "RESETCONFIRMSNEEDED") {
        let players_to_go = [];
        if (gmv[1] === "all") {
          for (let i = 0; i < game_self.game.players.length; i++) {
            players_to_go.push(i + 1);
          }
        } else {
          try {
            if (gmv[1].isArray()) {
              players_to_go = gmv[1];
            } else {
              players_to_go = [gmv[1]];
            }
          } catch (err) {
            players_to_go = gmv[1];
          }
        }

        //
        // reset confs if we do not have confirms_needed
        //
        let reset_confirmations = 1;
        for (let i = 0; i < game_self.game.confirms_needed.length; i++) {
          if (game_self.game.confirms_needed[i] == 1) {
            reset_confirmations = 0;
          }
        }
        if (reset_confirmations == 1) {
          game_self.resetConfirmsNeeded(players_to_go);
        }

        //
        // remove this instruction
        //
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
        return 1;
      }
      return 1;
    });

    //
    // [RESOLVE]
    // or
    // [RESOLVE \t publickey] (multi-player simulatenous)
    //
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "RESOLVE") {
        //
        // resolve coming from specific player
        //
        if (gmv[1]) {
          for (let i = 0; i < game_self.game.players.length; i++) {
            if (game_self.game.players[i] === gmv[1]) {
              game_self.game.confirms_needed[i] = 0;
            }
          }
          if (game_self.app.wallet.returnPublicKey() === gmv[1]) {
            game_self.unlockInterface();
          }
        } else {
          // no userkey provided, so this could be a DEAL or
          // some other command that is being executed WHILE
          // a lower-level command is waiting for all players
          // to move...
          if (game_self.game.queue.length - 1 == 0) {
            game_self.game.queue = [];
            return 1;
          } else {
            let gle = game_self.game.queue.length - 2;
            if (game_self.game.queue[gle] === "RESOLVE") {
              game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
              return 1;
            } else {
              if (gle <= 0) {
                game_self.game.queue = [];
                return 1;
              } else {
                game_self.game.queue.splice(gle, 2);
                return 1;
              }
            }
          }
        }

        //
        // resolve previous command if we are not waiting for anyone
        //
        let resolve_queue = 1;
        for (let i = 0; i < game_self.game.confirms_needed.length; i++) {
          if (game_self.game.confirms_needed[i] == 1) {
            resolve_queue = 0;
          }
        }

        let notice = "Players still to move: <ul>";
        let am_i_still_to_move = 0;
        let anyone_left_to_move = 0;
        for (let i = 0; i < game_self.game.confirms_needed.length; i++) {
          if (game_self.game.confirms_needed[i] == 1) {
            notice += '<li class="option">' + game_self.returnPlayerName(i + 1) + "</li>";
            anyone_left_to_move = 1;
          }
          if (game_self.game.player == i + 1) {
            am_i_still_to_move = game_self.game.confirms_needed[i];
          }
        }
        notice += "</ul>";
        if (am_i_still_to_move == 0) {
          console.log("is anyone left to move: " + anyone_left_to_move);
          game_self.updateStatus(notice);
        }

        //
        // return 1 if we remove stuff
        //
        if (resolve_queue == 1) {
          if (game_self.game.queue.length - 1 == 0) {
            game_self.game.queue = [];
            return 1;
          } else {
            let gle = game_self.game.queue.length - 2;
            if (game_self.game.queue[gle] === "RESOLVE") {
              game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
              return 1;
            } else {
              if (gle <= 0) {
                game_self.game.queue = [];
                return 1;
              } else {
                game_self.game.queue.splice(gle, 2);
                return 1;
              }
            }
          }
        }

        //
        // queue not resolves
        //
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
        return 1;
      }

      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] == "READY") {
        console.log("GAME READY");
        game_self.game.initializing = 0;
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
        game_self.saveGame(game_self.game.id);
        if (game_self.app.modules.isModuleActive("Arcade")) {
          let arcade_self = game_self.app.modules.returnModule("Arcade");
          if (arcade_self.initialization_timer == null) {
            console.log(
              "We seem to have loaded into a READY process while viewing the arcade, but our game is not waiting for the initialization screen, so we should check and show that launch screen."
            );
            arcade_self.launchGame(game_self.game.id);
          }
        }
      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "SHUFFLE") {
        game_self.shuffleDeck(parseInt(gmv[1]));
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "SHUFFLEDISCARDS"){
        let deckidx = parseInt(gmv[1]);

        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
        let discarded_cards = {};

        for (let i in game_self.game.deck[deckidx - 1].discards) {
          discarded_cards[i] = game_self.game.deck[deckidx - 1].cards[i];
          delete game_self.game.deck[deckidx - 1].cards[i];
        }
        game_self.game.deck[deckidx - 1].discards = {};

        game_self.game.queue.push("SHUFFLE\t" + deckidx);
        game_self.game.queue.push("DECKRESTORE\t" + deckidx);
        for (let z = game_self.game.players.length; z >= 1; z--) {
          game_self.game.queue.push("DECKENCRYPT\t" + deckidx + "\t" + z);
        }
        for (let z = game_self.game.players.length; z >= 1; z--) {
          game_self.game.queue.push("DECKXOR\t" + deckidx + "\t" + z);
        }
        game_self.game.queue.push("DECK\t" + deckidx + "\t" + JSON.stringify(discarded_cards));
        game_self.game.queue.push("DECKBACKUP\t" + deckidx);  

      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "LOGDECK") {
        let deckidx = parseInt(gmv[1]);
        game_self.updateLog(`Contents of Deck: ${JSON.stringify(game_self.game.deck[deckidx - 1].crypt)}`);
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "LOGHAND") {
        let deckidx = parseInt(gmv[1]);
        game_self.updateLog(`Contents of Hand: ${game_self.game.deck[deckidx - 1].hand}`);
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "LOGPOOL") {
        let poolidx = parseInt(gmv[1]);
        game_self.updateLog(`Contents of Pool: ${game_self.game.pool[poolidx - 1].hand}`);
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "RESOLVEDEAL") {
        let deckidx = parseInt(gmv[1]);
        let recipient = parseInt(gmv[2]);
        let cards = parseInt(gmv[3]);

        if (game_self.game.player == recipient) {
          // card must exist
          if (game_self.game.deck[deckidx - 1].crypt.length >= cards) {
            for (let i = 0; i < cards; i++) {
              let newcard = game_self.game.deck[deckidx - 1].crypt[i];
              //
              // if we have a key, this is encrypted
              //
              if (game_self.game.deck[deckidx - 1].keys[i] != undefined) {
                newcard = game_self.app.crypto.decodeXOR(
                  newcard,
                  game_self.game.deck[deckidx - 1].keys[i]
                );
              }

              newcard = game_self.app.crypto.hexToString(newcard);

              //NOTE: Each card in the deck must be unique
              if (!game_self.game.deck[deckidx - 1].hand.includes(newcard)) {
                game_self.game.deck[deckidx - 1].hand.push(newcard);
              }

              //Sanity check
              if (!game_self.game.deck[deckidx -1].cards[newcard]){
                console.log("Card decryption error!");
                console.log("Card: "+newcard,"deck:",JSON.parse(JSON.stringify(game_self.game.deck[deckidx -1])));
              }
            }
          }
        }

        if (game_self.game.queue.length < 2) {
          game_self.game.queue = [];
        } else {
          game_self.game.queue.splice(game_self.game.queue.length - 2, 2);
        }

        //
        // observer mode
        //
        if (game_self.game.player == 0) {
          if (game_self.game.issued_keys_deleted == 0) {
            game_self.game.issued_keys_deleted = 1;
          }
          return 1;
        }

        //
        // everyone purges their spent keys
        //
        if (game_self.game.issued_keys_deleted == 0) {
          if (game_self.game.deck[deckidx - 1].keys.length <= cards) {
            game_self.game.deck[deckidx - 1].keys = [];
            game_self.game.deck[deckidx - 1].crypt = [];
          } else {
            //Isn't this backwards????
            game_self.game.deck[deckidx - 1].keys = game_self.game.deck[deckidx - 1].keys.splice(
              cards,
              game_self.game.deck[deckidx - 1].keys.length - cards
            );
            game_self.game.deck[deckidx - 1].crypt = game_self.game.deck[deckidx - 1].crypt.splice(
              cards,
              game_self.game.deck[deckidx - 1].crypt.length - cards
            );
            if (game_self.game.deck[deckidx-1].keys.length !== game_self.game.deck[deckidx-1].crypt.length){
              console.log("Key-Crypt mismatch:",JSON.parse(JSON.stringify(game_self.game.deck[deckidx-1])));
            }
          }
          game_self.game.issued_keys_deleted = 1;
        }
      }
      return 1;
    });


    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "SIMPLEDEAL") {
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);

        let players = game_self.game.players.length;
        let cards = parseInt(gmv[1]);
        let deckidx = parseInt(gmv[2]);
        let deck = JSON.parse(gmv[3]);

        for (let i = players; i >= 1; i--) {
          game_self.game.queue.push("DEAL\t" + deckidx + "\t" + i + "\t" + cards);
        }
        for (let i = players; i >= 1; i--) {
          game_self.game.queue.push("DECKENCRYPT\t" + deckidx + "\t" + i);
        }
        for (let i = players; i >= 1; i--) {
          game_self.game.queue.push("DECKXOR\t" + deckidx + "\t" + i);
        }
        game_self.game.queue.push("DECK\t" + deckidx + "\t" + JSON.stringify(deck));
      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "DEAL") {
        let deckidx = parseInt(gmv[1]);
        let recipient = parseInt(gmv[2]);
        let cards = parseInt(gmv[3]);


        console.log(`Dealing ${cards} cards to ${recipient}. Deck has ${game_self.game.deck[deckidx-1].crypt.length} cards`);
        //
        // resolvedeal checks this when
        // deleting the keys from its
        // crypt.
        //
        game_self.game.issued_keys_deleted = 0;

        let total_players = game_self.game.players.length;

        //
        // do not permit dealing more keys than exist in this deck
        //
        if (game_self.game.deck[deckidx - 1].keys.length < cards) {
          cards = game_self.game.deck[deckidx - 1].keys.length;
        }

        // if the total players is 1 -- solo game
        if (total_players == 1) {
          game_self.game.queue.push("RESOLVEDEAL\t" + deckidx + "\t" + recipient + "\t" + cards);
        } else {
          game_self.game.queue.push("RESOLVEDEAL\t" + deckidx + "\t" + recipient + "\t" + cards);
          for (let i = 1; i <= total_players; i++) {
            if (i != recipient) { //The recipient decodes last (without broadcasting their keys so other players cannot snoop)
              game_self.game.queue.push("REQUESTKEYS\t" + deckidx + "\t" + i + "\t" + recipient + "\t" + cards);
            }
          }
        }
      }
      return 1;
    });

    //
    // SAFEDEAL shuffles discards back into the deck before dealing
    // if necessary and discards are available. if there are no more
    // cards to be dealt, it ends the game.
    //
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "SAFEDEAL") {
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);

        let deckidx = parseInt(gmv[1]);
        let recipient = parseInt(gmv[2]);
        let cards_to_deal = parseInt(gmv[3]);

        //
        // check we have enough cards in this deck
        //

        if (game_self.game.deck[deckidx - 1].crypt.length >= cards_to_deal) {
          this.game.queue.push("DEAL\t" + deckidx + "\t" + recipient + "\t" + cards_to_deal);
        } else {
          let cards_to_deal_first = game_self.game.deck[deckidx - 1].crypt.length;
          let cards_to_deal_after = cards_to_deal - cards_to_deal_first;

          let discarded_cards = {};

          for (let i in game_self.game.deck[deckidx - 1].discards) {
            discarded_cards[i] = game_self.game.deck[deckidx - 1].cards[i];
            delete game_self.game.deck[deckidx - 1].cards[i];
          }
          game_self.game.deck[deckidx - 1].discards = {};

          if (Object.keys(discarded_cards).length <= 0) {
            game_self.updateLog("skipping deal - no cards available and no discards for reshuffling");
          } else {
            game_self.game.queue.push("DEAL\t" + deckidx + "\t" + recipient + "\t" + cards_to_deal_after);
            //
            // shuffle in discarded cards
            //
            game_self.game.queue.push("SHUFFLE\t" + deckidx);
            game_self.game.queue.push("DECKRESTORE\t" + deckidx);
            for (let z = game_self.game.players.length; z >= 1; z--) {
              game_self.game.queue.push("DECKENCRYPT\t" + deckidx + "\t" + z);
            }
            for (let z = game_self.game.players.length; z >= 1; z--) {
              game_self.game.queue.push("DECKXOR\t" + deckidx + "\t" + z);
            }
            // DECKFLUSH not needed as we are all executing this
            game_self.game.queue.push("DECK\t" + deckidx + "\t" + JSON.stringify(discarded_cards));
            game_self.game.queue.push("DECKBACKUP\t" + deckidx);
            game_self.game.queue.push("NOTIFY\tshuffling discards back into deck...");
            if (cards_to_deal_first > 0){
              game_self.game.queue.push("DEAL\t" + deckidx + "\t" + recipient + "\t" + cards_to_deal_first);
            }
            
          }
        }
      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "PUSHONDECK"){
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);

        let deckidx = parseInt(gmv[1]);
        //game_self.game.queue.push("LOGDECK\t"+deckidx);
        game_self.game.queue.push(`DECKRESTORE\t${deckidx}\tpush`);
        for (let z = game_self.game.players.length; z >= 1; z--) {
          game_self.game.queue.push("DECKENCRYPT\t" + deckidx + "\t" + z);
        }
        for (let z = game_self.game.players.length; z >= 1; z--) {
          game_self.game.queue.push("DECKXOR\t" + deckidx + "\t" + z);
        }
        game_self.game.queue.push("DECK\t" + deckidx + "\t" + gmv[2]);
        game_self.game.queue.push("DECKBACKUP\t" + deckidx);
        //game_self.game.queue.push("LOGDECK\t"+deckidx);
      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "REQUESTKEYS") {
        let deckidx = parseInt(gmv[1]);
        let sender = parseInt(gmv[2]);
        let recipient = parseInt(gmv[3]);
        let cards = parseInt(gmv[4]); //number of cards to deal


        //Only the player who is the sender should process
        if (game_self.game.player !== sender) {
          return 0;
        }

        //
        // I sends keys
        //
        game_self.game.turn = [];
        game_self.game.turn.push("RESOLVE");
        for (let i = 0; i < cards; i++) {
          game_self.game.turn.push(game_self.game.deck[deckidx - 1].keys[i]);
        }
        game_self.game.turn.push(`ISSUEKEYS\t${deckidx}\t${sender}\t${recipient}\t${cards}\t${game_self.game.deck[deckidx - 1].keys.length}`);
        game_self.sendMessage("game", {});

        return 0;
      }
      return 1;
    });


    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "ISSUEKEYS") {
        let deckidx = parseInt(gmv[1]);
        let sender = parseInt(gmv[2]);
        let recipient = parseInt(gmv[3]);
        let cards = parseInt(gmv[4]);
        let opponent_deck_length = parseInt(gmv[5]); // this is telling us how many keys the other player has, so we can coordinate and now double-decrypt

        game_self.game.queue.splice(game_self.game.queue.length - 1, 1); //Remove "ISSUEKEYS"

        let keyidx = game_self.game.queue.length - cards;

        let my_deck_length = game_self.game.deck[deckidx - 1].crypt.length;
        if (my_deck_length !== opponent_deck_length){
          console.log("ISSUEKEYS issue: deck lengths mismatch");
        }

        if (game_self.game.player == recipient && my_deck_length == opponent_deck_length) {
          for (let i = 0; i < cards; i++) {
            if (game_self.game.queue[keyidx + i] != null) {
              game_self.game.deck[deckidx - 1].crypt[i] = game_self.app.crypto.decodeXOR(
                game_self.game.deck[deckidx - 1].crypt[i],
                game_self.game.queue[keyidx + i]
              );
            } else {
            }
          }
        }

        //
        // this avoids splicing out valuable instructions if no cards left
        //
        if (cards > 0) {
          game_self.game.queue.splice(keyidx, cards);
        }
      }
      return 1;
    });

    //
    // SECUREROLL player [hash] [sig_affirming_hash]
    //
    // designed to be stateless, so that if initiating player forgets their commit hash, we fallback
    // to the other players.
    //
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "SECUREROLL") {
        let player = parseInt(gmv[1]);
        let hash = gmv[2];
        let sig = gmv[3];

        let players = [];
        let hashes = [];

        let move = "";

        for (let i = game_self.game.queue.length - 1; i >= 0; i--) {
          let sr = game_self.game.queue[i].split("\t");
          if (sr[0] === "SECUREROLL") {
            // validate player signed (not a fake submission)
            if (
              game_self.app.crypto.verifyMessage(sr[2], sr[3], game_self.game.players[sr[1] - 1]) ==
              true
            ) {
              players.push(sr[1]);
              hashes.push(sr[2]);
            } else {
              console.log(
                "SIG DOES NOT VERIFY " +
                  sr[2] +
                  " / " +
                  sr[3] +
                  " / " +
                  game_self.game.players[sr[1] - 1]
              );
              return 0;
            }
          } else {
            if (sr[0] === "SECUREROLL_END") {
              break;
            } else {
              // normal move requiring hash
              move += game_self.game.queue[i];
            }
          }
        }

        //
        // at this point we have the game move to be executed in a single string so it can
        // be hashed and used as an input. any changes to the moves broadcast would result
        // in a different hash.
        //

        //
        // our players and hashes array contains the hashes of all players who have already
        // broadcast them AND -- if we are ready to continue -- two hashes from the initiating
        // player which validate each other and demonstrate the initiating player has not
        // attempted to game the random-number selection mechanism.
        //
        // players <--- numbers
        // hashes <--- submitted hashes
        //
        // game.sroll <--- 1 when requesting secureroll
        // game.sroll_hash <--- prehash that needs remembering for initiating player
        // game.sroll_done <--- have I broadcast my contribution to randgen?
        //

        //
        // the last player in the array will be the one who started the SECUREROLL request
        // as theirs (the first) will be the last hash added to our array. so we can use
        // this technique to identify the originating player in a stateless fashion.
        //
        let initiating_player = players[players.length - 1];
        let initiating_hash = hashes[hashes.length - 1];

        //
        //
        //
        let do_we_have_all_players = 1;
        let has_initiating_player_committed_two_hashes = 0;
        let does_second_hash_hash_to_first = 0;

        for (let y = 1; y <= game_self.game.players.length; y++) {
          let player_found = 0;
          for (let z = 0; z < players.length; z++) {
            if (players[z] == y) {
              player_found = 1;
            }
          }
          if (player_found == 0) {
            do_we_have_all_players = 0;
            break;
          }
        }

        //
        //
        //
        if (game_self.game.sroll_done == 0) {
          if (game_self.game.player != initiating_player) {
            //
            // contribute my own random number
            //
            let hash1 = game_self.app.crypto.hash(Math.random());
            let hash1_sig = game_self.app.crypto.signMessage(
              hash1,
              game_self.app.wallet.returnPrivateKey()
            );
            game_self.addMove(
              "SECUREROLL\t" + game_self.game.player + "\t" + hash1 + "\t" + hash1_sig
            );
            game_self.game.sroll_done = 1;
            game_self.endTurn();
            return 0;
          }
        }

        //
        // if we do not have all players, just wait until we do
        //
        if (do_we_have_all_players == 0) {
          return 0;
        }

        //
        // now we have all players, so find out
        //
        // has originating player send double commit
        //
        let originating_player = players[players.length - 1];
        let originating_hash = hashes[players.length - 1];
        let their_second_hash = "";
        for (let z = 0; z < players.length - 1; z++) {
          if (players[z] == originating_player) {
            their_second_hash = hashes[z];
          }
        }

        //
        //
        //
        if (their_second_hash === "") {
          // if I am the originating player, I send the second hash now
          if (game_self.game.player == originating_player) {
            let hash_sig = game_self.app.crypto.signMessage(
              game_self.game.sroll_hash,
              game_self.app.wallet.returnPrivateKey()
            );
            game_self.addMove(
              "SECUREROLL\t" +
                game_self.game.player +
                "\t" +
                game_self.game.sroll_hash +
                "\t" +
                hash_sig
            );
            game_self.game.sroll_done = 1;
            game_self.endTurn();
            return 0;
          }
          return 0;
        } else {
          if (game_self.app.crypto.hash(their_second_hash) === originating_hash) {
            let new_random = game_self.app.crypto.hash(move);
            for (let z = 0; z < hashes.length; z++) {
              new_random = game_self.app.crypto.hash(new_random + hashes[z]);
            }

            game_self.game.dice = new_random;

            //
            // we have updated the dice to a new random, so we can
            // remove the SECUREROLL components. One this is done we
            // can return 1 to continue the move!
            //
            for (let i = game_self.game.queue.length - 1; i >= 0; i--) {
              let sr = game_self.game.queue[i].split("\t");
              if (sr[0] === "SECUREROLL") {
                game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
              } else {
                break;
              }
            }

            //
            // we should have cleared the move
            //
            return 1;
          } else {
            alert(
              "ERROR: the player which triggered the secure-dice-roll did not submit a second hash which hashed to their original commit. This invalidates the security of the random number generation. Halting."
            );
          }
          return 0;
        }
        //
        // we do not clear the queue by default
        //
        return 0;
      }
      return 1;
    });
    //
    // remove for natural fallthrough
    //
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "SECUREROLL_END") {
        // reset for next time
        game_self.game.sroll = 0;
        game_self.game.sroll_hash = "";
        game_self.game.sroll_done = 0;
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
      }
      return 1;
    });

    //
    // SIMULTANEOUS_PICK player [hash] [sig_affirming_hash]
    //
    // designed to be stateless, so that all information needed to decode the cards
    // ends up on the game queue.
    //
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "SIMULTANEOUS_PICK") {
        let player = parseInt(gmv[1]);
        let hash = gmv[2];
        let sig = gmv[3];

        let players = [];
        let hashes = [];
        let move = "";

        for (let i = game_self.game.queue.length - 1; i >= 0; i--) {
          let sr = game_self.game.queue[i].split("\t");
          if (sr[0] === "SIMULTANEOUS_PICK") {
            // validate player signed (not a fake submission)
            if ( game_self.app.crypto.verifyMessage(sr[2], sr[3], game_self.game.players[sr[1] - 1]) ==
              true
            ) {
              players.push(sr[1]);
              hashes.push(sr[2]);
            } else {
              console.log(`SIG DOES NOT VERIFY  ${sr[2]} / ${sr[3]} / ${game_self.game.players[sr[1] - 1]}`);
              return 0;
            }
          } else {
            if (sr[0] === "SIMULTANEOUS_PICK_END") {
              break;
            }
          }
        }

        //
        // the hashes and players array is filled with any submitted moves. we want to wait
        // until all (other) players have submitted their initial commits before we submit
        // our follow-up hash that will unlock our selection.
        //

        //
        // our players and hashes array contains the hashes of all players who have already
        // broadcast them AND -- if we are ready to continue -- two hashes from the initiating
        // player which validate each other and demonstrate the initiating player has not
        // attempted to game the random-number selection mechanism.
        //
        // players <--- numbers
        // hashes <--- submitted hashes
        //
        // game.spick_hash <--- prehash that needs remembering for initiating player
        // game.spick_done <--- have I broadcast my second hash yet?
        //

        //
        // the order of provision does not matter in simulatenous card picks, as all players
        // will / should only submit their unlocking hashes once the other players have
        // submitted at least one hash.
        //

        //
        //
        //
        let do_we_have_all_players = 1;
        let do_we_have_me = 0;

        for (let y = 1; y <= game_self.game.players.length; y++) {
          let player_found = 0;
          for (let z = 0; z < players.length; z++) {
            if (players[z] == y) {
              player_found = 1;
              if (z == game_self.game.player - 1) { //should be tested against y, no?
                do_we_have_me = 1;
              }
            }
          }
          if (player_found == 0) {
            do_we_have_all_players = 0;
            break;
          }
        }

        //
        // if we do not have all players, just wait until we do
        //
        if (do_we_have_all_players == 0) {
          return 0;
        }

        //
        // if we reach here, all players have submitted, so we send the second
        //
        if (game_self.game.spick_done == 0) {
          //
          // the order of submission gets the selection onto the queue last
          //
          let card_sig = game_self.app.crypto.signMessage( game_self.game.spick_card, game_self.app.wallet.returnPrivateKey() );
          let hash2 = game_self.game.spick_hash;
          let hash2_sig = game_self.app.crypto.signMessage( hash2, game_self.app.wallet.returnPrivateKey() );
          game_self.addMove("SIMULTANEOUS_PICK\t" + game_self.game.player + "\t" + hash2 + "\t" + hash2_sig );
          game_self.addMove(`SIMULTANEOUS_PICK\t${game_self.game.player}\t${game_self.game.spick_card}\t${card_sig}`);
          game_self.game.spick_done = 1;
          game_self.endTurn();
          return 0;
        }

        //
        // have all players submitted all three sigs?
        //
        let have_all_players_submitted_three_sigs = 1;

        //
        // find out
        //
        for (let y = 1; y <= game_self.game.players.length; y++) {
          let commits_found = 0;
          for (let z = 0; z < players.length; z++) {
            if (players[z] == y) {
              commits_found++;
            }
          }
          if (commits_found < 3) {
            have_all_players_submitted_three_sigs = 0;
          }
        }

        //
        // keep waiting otherwise
        //
        if (have_all_players_submitted_three_sigs == 0) {
          return 0;
        }

        //
        // hashes will be on the blockchain in verse order
        //
        game_self.game.state.sp = [];
        for (let player_id = 1; player_id <= game_self.game.players.length; player_id++) {
          let player_card = "";
          let player_card_set = 0;
          let player_hash_idx = 0;
          let player_hash = "";

          for (let k = 0; k < players.length; k++) {
            if (players[k] == player_id) {
              player_hash_idx++;
              if (player_card_set == 0) {
                player_card = hashes[k];
                player_card_set = 1;
                player_hash = game_self.app.crypto.hash(player_card);
              } else {
                if (player_hash_idx == 2) {
                  player_hash = game_self.app.crypto.hash(hashes[k] + player_hash);
                } else {
                  //
                  // if hash is incorrect, player is dishonest
                  //
                  if (player_hash != hashes[k]) {
                    alert(
                      "ERROR: Player " +
                        player_id +
                        " has submitted inconsistent hash values for their card selection. Halting."
                    );
                    return 0;
                  } else {
                    game_self.game.state.sp[player_id - 1] = player_card;
                  }
                }
              }
            }
          }
        }

        console.log("SIMULTANEOUS_PICK finished..., pruning queue");
        //
        // we have updated so we can remove the SIMULTANEOUS_PICK instructions
        //
        for (let i = game_self.game.queue.length - 1; i >= 0; i--) {
          console.log(game_self.game.queue[i]);
          let sr = game_self.game.queue[i].split("\t");
          if (sr[0] === "SIMULTANEOUS_PICK") {
            game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
          } else {
            break;
          }
        }
        console.log(JSON.parse(JSON.stringify(game_self.game.queue)));
        //
        // if we hit here, we should be ready to continue
        //
        return 1;
      }
      return 1;
    });

    //
    // module requires updating
    //
    // TODO -- update copy basic on dynamic contents, hasOwnProperty, etc. not manually
    // this allows for modules to dynamically add their own properties to the deck and
    // have those backed-up as well -- see fhand. Also DECKRESTORE should do reverse.
    //
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "DECKBACKUP") {

        let deckidx = parseInt(gmv[1]);

        while (game_self.game.deck.length < deckidx) {
          game_self.addDeck();
        }

        game_self.old_discards = game_self.game.deck[deckidx - 1].discards;
        game_self.old_removed = game_self.game.deck[deckidx - 1].removed;
        game_self.old_cards = {};
        game_self.old_crypt = [];
        game_self.old_keys = [];
        game_self.old_hand = [];
	if (game_self.game.deck[deckidx-1].fhand) { game_self.old_fhand = game_self.game.deck[deckidx-1].fhand; }

        for (let i = 0; i < game_self.game.deck[deckidx - 1].crypt.length; i++) {
          game_self.old_crypt[i] = game_self.game.deck[deckidx - 1].crypt[i];
          game_self.old_keys[i] = game_self.game.deck[deckidx - 1].keys[i];
        }
        for (var i in game_self.game.deck[deckidx - 1].cards) {
          game_self.old_cards[i] = game_self.game.deck[deckidx - 1].cards[i];
        }
        for (let i = 0; i < game_self.game.deck[deckidx - 1].hand.length; i++) {
          game_self.old_hand[i] = game_self.game.deck[deckidx - 1].hand[i];
        }

        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
      }
      return 1;
    });

    /*There are two ways to restore, which usually doesn't matter as the next
      instruction is almost always a shuffle, but we can restore the deck before/after
      the (added deck cards) add "push" to put new cards on top of deck, 
      otherwise defaults to bottom of deck
    */
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "DECKRESTORE") {
        let deckidx = gmv[1];
        if (gmv[2] == "push"){
          for (let i = 0; i < game_self.old_hand.length; i++) {
          game_self.game.deck[deckidx - 1].hand.push(game_self.old_hand[i]);
          }
          for (let i = 0; i < game_self.old_crypt.length; i++) {
            game_self.game.deck[deckidx - 1].crypt.push(game_self.old_crypt[i]);
            game_self.game.deck[deckidx - 1].keys.push(game_self.old_keys[i]);
          }  
        }else{
          for (let i = game_self.old_hand.length - 1; i >= 0 ; i--) {
          game_self.game.deck[deckidx - 1].hand.unshift(game_self.old_hand[i]);
          }
          for (let i = game_self.old_crypt.length - 1; i >= 0 ; i--) {
            game_self.game.deck[deckidx - 1].crypt.unshift(game_self.old_crypt[i]);
            game_self.game.deck[deckidx - 1].keys.unshift(game_self.old_keys[i]);
          }
        }
        
        for (var b in game_self.old_cards) {
          game_self.game.deck[deckidx - 1].cards[b] = game_self.old_cards[b];
        }
        
        game_self.game.deck[deckidx - 1].removed = game_self.old_removed;
        game_self.game.deck[deckidx - 1].discards = game_self.old_discards;

        game_self.old_removed = {};
        game_self.old_discards = {};

        game_self.old_cards = {};
        game_self.old_crypt = [];
        game_self.old_keys = [];
        game_self.old_hand = [];
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
      }
    });

    /*
      Given index of deck and length of crypt array
      Reads gmv[2] cards from game.queue and inserts them into deck[].crypt
    */
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "CARDS") {
        //console.log("CARDS START: " + JSON.stringify(game_self.game.queue));
        let deckidx = parseInt(gmv[1]);
        let cryptLength = parseInt(gmv[2]);

        //console.log(deckidx + " --- " + gmv[2]);
        let gqe = game_self.game.queue.length - 1;
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);

        for (let i = 1; i <= cryptLength; i++) { //Adding one to i here so don't have to insert additional -1 term 
          let card = game_self.game.queue.pop();
          if (game_self.game.player != 0) {
            game_self.game.deck[deckidx - 1].crypt[cryptLength - i] = card;
              //game_self.game.queue[gqe - 1 - i];
          }
          //game_self.game.queue.splice(gqe - 1 - i, 1);
        }
        //console.log("CARDS END: " + JSON.stringify(game_self.game.queue));
      }
      return 1;
    });


    /*
      Creates the pool data structure
    */
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "POOL") {
        let poolidx = gmv[1];
        while (game_self.game.pool.length < poolidx) {
          game_self.addPool();
        }
        game_self.resetPool(poolidx - 1);

        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
      }
      return 1;
    });

    this.commands.push((game_self, gmv) =>{
      if (gmv[0] === "SAFEPOOLDEAL"){
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
        let deckidx = parseInt(gmv[1]);
        let cards_to_flip = parseInt(gmv[2]);
        let poolidx = parseInt(gmv[3]);
        
        game_self.game.issued_keys_deleted = 0;
        if (cards_to_flip <= game_self.game.deck[deckidx - 1].crypt.length){
          game_self.game.queue.push(`POOLDEAL\t${gmv[1]}\t${gmv[2]}\t${gmv[3]}`);
        }else{
          let cards_in_deck = game_self.game.deck[deckidx - 1].crypt.length;
          game_self.game.queue.push(`POOLDEAL\t${gmv[1]}\t${cards_to_flip-cards_in_deck}\t${gmv[3]}`);
          game_self.game.queue.push(`SHUFFLEDISCARDS\t${deckidx}`);
          game_self.game.queue.push(`POOLDEAL\t${gmv[1]}\t${cards_in_deck}\t${gmv[3]}`);
        }
      }
      return 1;
    });
    /**
     * A command of convenience for the flop in poker
     */ 
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "POOLDEAL") {
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
        let deckidx = parseInt(gmv[1]);
        let cards_to_flip = parseInt(gmv[2]);
        let poolidx = parseInt(gmv[3]);
        
        game_self.game.issued_keys_deleted = 0;

        for (let i = 1; i <= this.game.players.length; i++) {
          this.game.queue.push(`FLIPCARD\t${deckidx}\t${cards_to_flip}\t${poolidx}\t${i}`);
        }

        //Reset the pool
        this.game.queue.push("FLIPRESET\t" + poolidx);
      
      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "FLIPRESET") {
        let poolidx = gmv[1];
        while (game_self.game.pool.length < poolidx) {
          game_self.addPool();
        }
        //Doesn't reset game_self.game.pool[poolidx-1].cards {} or .hand []
        game_self.game.pool[poolidx - 1].crypt = [];
        game_self.game.pool[poolidx - 1].keys = [];
        game_self.game.pool[poolidx - 1].decrypted = 0;
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
      }
      return 1;
    });


    /*
    Deals cards from the deck to the pool (a common "hand" all players can see)
    */
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "FLIPCARD") {
        let deckidx = gmv[1];
        let cardnum = gmv[2];
        let poolidx = gmv[3];
        let playerid = parseInt(gmv[4]); //who is sending the keys 

        //
        // players process 1 by 1
        //
        if (playerid != game_self.game.player) {
          return 0;
        }

        //
        // create pool if not exists
        //
        while (game_self.game.pool.length < poolidx) {
          game_self.addPool();
        }

        //
        // share card decryption information
        //
        game_self.game.turn = [];
        game_self.game.turn.push("RESOLVE");

        cardnum = Math.min(cardnum, game_self.game.deck[deckidx - 1].crypt.length);
        //Deals from bottom of deck ??
        for (let i = 0; i < cardnum; i++) {
          game_self.game.turn.push(game_self.game.deck[deckidx - 1].keys[i]);
        }
        game_self.game.turn.push(`RESOLVEFLIP\t${deckidx}\t${cardnum}\t${poolidx}`);

        game_self.sendMessage("game", {});

        return 0;
      }
      return 1;
    });

    /*
    Preceeds (cardnum) keys on the queue for decrypting cards to store into each players pool
    */
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "RESOLVEFLIP") {

        let deckidx = parseInt(gmv[1]);
        let cardnum = parseInt(gmv[2]);
        let poolidx = parseInt(gmv[3]);

        //
        // create pool if not exists, possible edge-case
        //
        while (game_self.game.pool.length < poolidx) {
          game_self.addPool();
        }

        //
        // how many players are going to send us decryption keys?
        //
        let decryption_keys_needed = game_self.game.players.length;

        //
        // if this is the first flip, we add the card to the crypt deck
        // so that we can decrypt them as the keys come in.
        //
        if (game_self.game.pool[poolidx - 1].crypt.length == 0) {
          //console.log("First pool resolution");
          //
          // update cards available to pool (master description of the deck)
          game_self.game.pool[poolidx - 1].cards = game_self.game.deck[deckidx - 1].cards;

          //
          // copy the card info over from the deck
          //
          for (let z = 0; z < cardnum; z++) {
            game_self.game.pool[poolidx - 1].crypt.push(game_self.game.deck[deckidx - 1].crypt[z]);
          }
          //for (let p = 0; p < decryption_keys_needed; p++) {
          //  game_self.game.pool[poolidx - 1].keys.push([]);
          //}
        }

        //
        // now we can get the keys
        //
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);//Remove "ISSUEKEYS"
        let keyidx = game_self.game.queue.length - cardnum;
        
        for (let i = 0; i < cardnum; i++) {
          let nc = game_self.game.pool[poolidx - 1].crypt[i];
          let thiskey = game_self.game.queue[keyidx + i];

          // add the key -- do we need to save it ?
          //game_self.game.pool[poolidx - 1].keys[i] = thiskey;
            
          if (thiskey != null) {
            nc = game_self.app.crypto.decodeXOR(nc, thiskey);
          } else {
            // nc does not require decoding
            console.log("Card doesn't need decoding");
          }

          // store card in pool
          game_self.game.pool[poolidx - 1].crypt[i] = nc;  
        }
        // processed one set of keys
        game_self.game.pool[poolidx - 1].decrypted++;
      
        if (cardnum > 0){
          game_self.game.queue.splice(keyidx, cardnum);
        }
        
        //
        // if everything is handled, purge old deck data
        //
        if (game_self.game.pool[poolidx - 1].decrypted == decryption_keys_needed) {
          for (let i = 0; i < cardnum; i++) {
            let newcard = game_self.game.pool[poolidx-1].crypt[i];
            newcard = game_self.app.crypto.hexToString(newcard);
            if (!game_self.game.pool[poolidx-1].hand.includes(newcard)){
              game_self.game.pool[poolidx - 1].hand.push(newcard);  
            }
            if (!game_self.game.pool[poolidx-1].cards[newcard]){
              console.log("Card decryption error!");
              console.log("Card: "+newcard,"pool:",JSON.parse(JSON.stringify(game_self.game.pool[poolidx -1])));
            }              
          }
          game_self.game.pool[poolidx - 1].crypt.splice(0, cardnum);
          game_self.game.deck[deckidx - 1].keys.splice(0,cardnum);
          game_self.game.deck[deckidx - 1].crypt.splice(0,cardnum);
        }
      }
      return 1;
    });


    //
    // OBSERVER_CHECKPOINT - observers stop execution
    //
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "OBSERVER_CHECKPOINT") {
        if (game_self.game.player == 0) {
          game_self.game.halted = 1;
          game_self.saveGame(game_self.game.id);
          return 0;
        }
        return 1;
      }
      return 1;
    });

    /*
    * A command of convience to create and process a deck
    */
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "DECKANDENCRYPT") {
        let deckidx = parseInt(gmv[1]);
        let players = parseInt(gmv[2]);
        //let cards = JSON.parse(gmv[3]);

        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);

        for (let i = players; i > 0; i--) {
          this.game.queue.push("DECKENCRYPT\t" + deckidx + "\t" + i);
        }
        for (let i = players; i > 0; i--) {
          this.game.queue.push("DECKXOR\t" + deckidx + "\t" + i);
        }
        this.game.queue.push("DECK\t" + deckidx + "\t" + gmv[3]);
      }
      return 1;
    });

    /*
      Creates a deck + it's cryptographic version
    */
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "DECK") {
        let deckidx = parseInt(gmv[1]);
        let cards = JSON.parse(gmv[2]);
        //
        // create deck if not exists
        //
        while (game_self.game.deck.length < deckidx) {
          game_self.addDeck();
        }
        game_self.resetDeck(deckidx - 1);
        game_self.game.deck[deckidx - 1].cards = cards;

        for (var i in game_self.game.deck[deckidx - 1].cards) {
          game_self.game.deck[deckidx - 1].crypt.push(game_self.app.crypto.stringToHex(i));
        }

        if (game_self.game.deck[deckidx-1].crypt.length !== game_self.game.deck[deckidx-1].crypt.length){
          console.log("Deck error, queue length mismatch");
          console.log(JSON.parse(JSON.stringify(game_self.game.deck[deckidx-1])));
        }

        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
      }
      return 1;
    });


    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "DECKXOR") {
        //console.log("DECKXOR HERE: " + JSON.stringify(gmv));

        let deckidx = parseInt(gmv[1]);
        let playerid = parseInt(gmv[2]);

        if (playerid != game_self.game.player) {
          return 0;
        }
        if (game_self.game.deck[deckidx - 1].xor == "") {
          game_self.game.deck[deckidx - 1].xor = game_self.app.crypto.hash(Math.random());
        }

        for (let i = 0; i < game_self.game.deck[deckidx - 1].crypt.length; i++) {
          game_self.game.deck[deckidx - 1].crypt[i] = game_self.app.crypto.encodeXOR(game_self.game.deck[deckidx - 1].crypt[i], game_self.game.deck[deckidx - 1].xor);
          game_self.game.deck[deckidx - 1].keys[i] = game_self.app.crypto.generateKeys();
        }

        //
        // shuffle the encrypted deck
        //
        game_self.game.deck[deckidx - 1].crypt = game_self.shuffleArray(game_self.game.deck[deckidx - 1].crypt);

        game_self.game.turn = [];
        game_self.game.turn.push("RESOLVE");
        for (let i = 0; i < game_self.game.deck[deckidx - 1].crypt.length; i++) {
          game_self.game.turn.push(game_self.game.deck[deckidx - 1].crypt[i]);
        }
        game_self.game.turn.push(`CARDS\t${deckidx}\t${game_self.game.deck[deckidx - 1].crypt.length}`);

        let extra = {};

        game_self.sendMessage("game", extra);

        //
        // stop execution until messages received
        //
        return 0;
      }
      return 1;
    });

    //
    // required by safedeal
    //
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "DECKFLUSH") {
        let deckidx = parseInt(gmv[1]);
        if (gmv[2] == "discards") {
          this.game.deck[deckidx].discards = {};
        }
        this.game.queue.splice(qe, 1);
      }
      return 1;
    });


    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "DECKENCRYPT") {
        let deckidx = parseInt(gmv[1]);
        let playerid = parseInt(gmv[2]);


        if (playerid != game_self.game.player) {
          return 0;
        }
        for (let i = 0; i < game_self.game.deck[deckidx - 1].crypt.length; i++) {
          game_self.game.deck[deckidx - 1].crypt[i] = game_self.app.crypto.decodeXOR(
            game_self.game.deck[deckidx - 1].crypt[i],
            game_self.game.deck[deckidx - 1].xor
          );
          game_self.game.deck[deckidx - 1].crypt[i] = game_self.app.crypto.encodeXOR(
            game_self.game.deck[deckidx - 1].crypt[i],
            game_self.game.deck[deckidx - 1].keys[i]
          );
        }

        game_self.game.turn = [];
        game_self.game.turn.push("RESOLVE");
        for (let i = 0; i < game_self.game.deck[deckidx - 1].crypt.length; i++) {
          game_self.game.turn.push(game_self.game.deck[deckidx - 1].crypt[i]);
        }

        game_self.game.turn.push(`CARDS\t${deckidx}\t${game_self.game.deck[deckidx - 1].crypt.length}`);

        let extra = {};
        game_self.sendMessage("game", extra);
     
        return 0;
      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === null || gmv[0] == "null") {
        console.log("REMOVING NULL ENTRY");
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
      }
    });



    /////////////////
    // web3 crypto //
    /////////////////
    // supporting arbitrary third-party crypto modules -- specify receiving address
    //
    this.commands.push((game_self,gmv) => {
      if (gmv[0] === "CRYPTOKEY") {

        let playerkey = gmv[1];
        let cryptokey = gmv[2];
        let confsig   = gmv[3];

  //
  // if the playerkey has signed this cryptokey, update
  //
        if (game_self.app.crypto.verifyMessage(cryptokey, confsig, playerkey)) {
    for (let i = 0; i < game_self.game.keys.length; i++) {
      if (game_self.game.players[i] === playerkey) {
        game_self.game.keys[i] = cryptokey;
      }
    }
  }

        game_self.game.queue.splice(game_self.game.queue.length-1, 1);

        return 1;

      }
      return 1;
    });


    //
    // supporting arbitrary third-party crypto modules
    //
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "SEND") {
        let sender = gmv[1];
        let receiver = gmv[2];
        let amount = gmv[3];
        let ts = gmv[4];
        let unique_hash = gmv[5];
        let ticker = game_self.game.crypto;
        if (gmv[6]) { ticker = gmv[6]; }

        //
        // if we are not the sender, we do not need to worry and can continue
        //
        // note: senders identified by Saito publickey not other in this function
        //
        if (this.app.wallet.returnPublicKey() !== sender) {
          game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
          return 1;
        }

        //
        // if we are the sender, lets get sending and receiving addresses
        //
        let sender_crypto_address = "";
        let receiver_crypto_address = "";
        for (let i = 0; i < game_self.game.players.length; i++) {
          if (game_self.game.players[i] === sender) {
            sender_crypto_address = game_self.game.keys[i];
          }
          if (game_self.game.players[i] === receiver) {
            receiver_crypto_address = game_self.game.keys[i];
          }
        }

        let my_specific_game_id = game_self.game.id;
        game_self.saveGame(game_self.game.id);
        game_self.game.halted = 1;

        game_self.crypto_transfer_manager.sendPayment(this.app, this, [sender_crypto_address.split("|")[0]], [receiver_crypto_address.split("|")[0]], [amount], ts, ticker, function() {
          game_self.app.wallet.sendPayment([sender_crypto_address], [receiver_crypto_address], [amount], ts, unique_hash, function(robj) {

                if (game_self.game.id != my_specific_game_id) {
                  game_self.game = game_self.loadGame(my_specific_game_id);
                }

                game_self.updateLog("payments issued...");
                game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
                game_self.restartQueue();

            return 0;

          }, ticker);

          return 0;

        });

       return 0;
      }
      return 1;
    });




    this.commands.push((game_self,gmv) => {
      if (gmv[0] === "RECEIVE") {

        let sender = gmv[1];
        let receiver = gmv[2];
        let amount = gmv[3];
        let ts = gmv[4];
        let unique_hash = gmv[5];
        let ticker = game_self.game.crypto;
        if (gmv[6]) { ticker = gmv[6]; }


        //
        // if we are not the receiver, we do not need to worry and can continue
        //
        // note: senders identified by Saito publickey not other in this function
        //
        if (this.app.wallet.returnPublicKey() !== receiver) {
          game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
          return 1;
        }


        //
        // if we are the sender, lets get sending and receiving addresses
        //
        let sender_crypto_address = "";
        let receiver_crypto_address = "";
        for (let i = 0; i < game_self.game.players.length; i++) {
          if (game_self.game.players[i] === sender) { sender_crypto_address = game_self.game.keys[i]; }
          if (game_self.game.players[i] === receiver) { receiver_crypto_address = game_self.game.keys[i]; }
        }

        let my_specific_game_id = game_self.game.id;
        game_self.saveGame(game_self.game.id);
        game_self.game.halted = 1;

        game_self.crypto_transfer_manager.receivePayment(this.app, this, [sender_crypto_address.split("|")[0]], [receiver_crypto_address.split("|")[0]], [amount], ts, ticker, function(divname) {
          game_self.app.wallet.receivePayment([sender_crypto_address], [receiver_crypto_address], [amount], ts, unique_hash, function(robj) {
            //Update crypto-transfer-manager
            if (document.querySelector(".spinner")){
              document.querySelector(".spinner").remove();
            }
            $(".game-crypto-transfer-manager-container .hidden").removeClass("hidden");
            if (divname){
              if (robj){ //==1, success
                divname.textContent = "Success"; 
              }else{ //==0, failure
                divname.textContent = "Failed";
              }
            }
            if (game_self.game.id != my_specific_game_id) { game_self.game = game_self.loadGame(my_specific_game_id); }

            game_self.updateLog("payments received...");
            game_self.game.queue.splice(game_self.game.queue.length-1, 1);
            game_self.restartQueue();

            return 0;

          }, ticker, -1);

          return 0;
        });
        return 0;
      }
      return 1;
    });


    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "BALANCE") {
        let addresses = [];
        let amount = parseInt(gmv[1]);
        let address = gmv[2];
        let ticker = gmv[3];

        addresses[0] = address;

        //
        // october 4th
        //
        game_self.saveGame(game_self.game.id);
        game_self.game.halted = 1;
        let my_specific_game_id = game_self.game.id;
        let polling_timer = setTimeout(() => {
          game_self.app.wallet.returnPreferredCryptoBalances(
            addresses,
            function (robj) {
              let balance_adequate = 0;

              for (let z = 0; z < robj.length; z++) {
                if (robj[z].address === address) {
                  if (robj[z].balance >= amount) {
                    balance_adequate = 1;
                    clearInterval(polling_timer);
                  }
                }
              }

              if (balance_adequate == 1) {
                if (game_self.game.id != my_specific_game_id) {
                  game_self.game = game_self.loadGame(my_specific_game_id);
                }
                game_self.updateStatus(" balance adequate ... ");
                game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
                game_self.restartQueue();

                return 0;
              }
            },
            ticker
          );
        }, 8000);

        return 0;
      }
      return 1;
    });
  }
  
  doesGameExistLocally(game_id) {
    if (this.app?.options?.games) {
      for (let i = 0; i < this.app.options.games.length; i++) {
        if (this.app.options.games[i].id === game_id) {
          return 1;
        }
      }
    }
    return 0;
  }

  payWinners(winner){
    if (Array.isArray(winner)){
      let num_winners = winner.length;
      let amount_to_send = (this.game.stake/num_winners).toFixed(8);
      for (let i = 0; i < this.game.players.length; i++){
        if (!winner.includes(this.game.players[i])){
          for (let w of winner){
            this.payWinner(this.game.players[i], w, amount_to_send);
          }  
        }
      }
    }else{
      for (let i = 0; i < this.game.players.length; i++){
        if (this.game.players[i] !== winner){
          this.payWinner(this.game.players[i], winner, this.game.stake.toString());  
        }
      }
    }
  }

  payWinner(sender, receiver, amount){
      let ts = new Date().getTime();
      this.rollDice();
      let unique_hash = this.game.dice;
      amount = amount.toString(); //ensure string representation
      let ticker = this.game.crypto;

      //
      // if we are the sender, lets get sending and receiving addresses
      //
      let sender_crypto_address = "";
      let receiver_crypto_address = "";
      for (let i = 0; i < this.game.players.length; i++) {
        if (this.game.players[i] === sender) {
          sender_crypto_address = this.game.keys[i];
        }
        if (this.game.players[i] === receiver) {
          receiver_crypto_address = this.game.keys[i];
        }
      }
      let game_self = this;

      if (this.app.wallet.returnPublicKey() === sender){
        this.crypto_transfer_manager.sendPayment(this.app, this, [sender_crypto_address.split("|")[0]], [receiver_crypto_address.split("|")[0]], [amount], ts, ticker, function() {
          game_self.app.wallet.sendPayment([sender_crypto_address], [receiver_crypto_address], [amount], ts, unique_hash, function(robj){
            siteMessage(game_self.name + ': payment issued', 5000);
          }, ticker);

          return 0;
        });  
      }else if (this.app.wallet.returnPublicKey() === receiver){
        game_self.crypto_transfer_manager.receivePayment(this.app, this, [sender_crypto_address.split("|")[0]], [receiver_crypto_address.split("|")[0]], [amount], ts, ticker, function(divname) {
          game_self.app.wallet.receivePayment([sender_crypto_address], [receiver_crypto_address], [amount], ts, unique_hash, function(robj) {
            //Update crypto-transfer-manager
            if (document.querySelector(".spinner")){
              document.querySelector(".spinner").remove();
            }
            $(".game-crypto-transfer-manager-container .hidden").removeClass("hidden");
            if (divname){
              if (robj){ //==1, success
                divname.textContent = "Success"; 
              }else{ //==0, failure
                divname.textContent = "Failed";
              }
            }
            return 0;

          }, ticker, -1);

          return 0;
        });

      }

  }



  // this function runs "connect" event
  onConnectionStable(app, peer) {
    siteMessage("Connection Restored", 1000);
  }

  //
  //
  // ON CONNECTION UNSTABLE
  //
  // this function runs "disconnect" event
  onConnectionUnstable(app, peer) {
    siteMessage("Connection Unstable", 1000);
  }
}

module.exports = GameTemplate;
