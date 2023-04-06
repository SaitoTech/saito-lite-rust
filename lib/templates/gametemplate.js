/*********************************************************************************
 GAME MODULE v.

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
let saito = require("./../saito/saito");
let GameLog = require("./../saito/ui/game-log/game-log");
let GameHud = require("./../saito/ui/game-hud/game-hud");
let GameMenu = require("./../saito/ui/game-menu/game-menu");
let GameClock = require("./../saito/ui/game-clock/game-clock");
let SaitoOverlay = require("./../saito/ui/saito-overlay/saito-overlay");
let GameCardbox = require("./../saito/ui/game-cardbox/game-cardbox");
let GamePlayerbox = require("./../saito/ui/game-playerbox/game-playerbox");
let GameCardfan = require("./../saito/ui/game-cardfan/game-cardfan");
let GameBoardSizer = require("./../saito/ui/game-board-sizer/game-board-sizer");
let GameHexGrid = require("./../saito/ui/game-hexgrid/game-hexgrid");
let GameCryptoTransferManager = require("./../saito/ui/game-crypto-transfer-manager/game-crypto-transfer-manager");
let GameAcknowledgeOverlay = require("./../saito/ui/game-acknowledge-overlay/game-acknowledge-overlay");
const GameScoreboard = require("./../saito/ui/game-scoreboard/game-scoreboard");
const GameHammerMobile = require("./../saito/ui/game-hammer-mobile/game-hammer-mobile");
const JSON = require("json-bigint");

class GameTemplate extends ModTemplate {

  constructor(app) {

    super(app);

    this.name = "Game";
    this.game_length = 30; //Estimated number of minutes to complete a game
    this.game = {};
    this.moves = [];
    this.commands = [];
    this.game_state_pre_move = "";

    // card height-width-ratio
    this.card_height_ratio = 1.53;
    //size of the board in pixels
    this.boardWidth = 500; //Should be overwritten by the (board game's) full size pixel width
    this.boardRatio = 1;

    //
    // crypto transfers auto-approved set to zero (manually confirm)
    //
    this.crypto_transfers_outbound_approved = 0;
    this.crypto_transfers_inbound_trusted = 0;
    this.grace_window = 4;
    this.decimal_precision = 8; /* used to round off strings representing crypto/token fractions */

    //
    // optional interface -- shouldn't really have these defaults
    //
    this.useHUD = 0;
    this.useCardbox = 0;
    this.useClock = 0;

    this.lock_interface = 0;
    this.lock_interface_step = "";
    this.lock_interface_tx = "";

    this.crypto_msg = "winner takes all";
    this.winnable = 1; // if it is possible to win this game
    this.loseable = 1; // if it is possible to lose this game
    this.cooperative = 0; // if this is a cooperative game

    this.request_no_interrupts = true;

    this.confirm_moves = 0;
    this.confirm_this_move = 0;

    this.animationSpeed = 1500;
    /*
     * Our self defined animations add a marker (their div id) whenever they start and remove it when they finish
     * so we can know if animations are actively moving around the screen through animation_queue
     * Meanwhile, we may want to set up a series of animations with slight pauses between each one kicks off, so animationSequence
     * holds structure object data with the animation function and its parameters. The method runAnimationQueue will execute each animation in turn
    */
    this.animation_queue = [];
    this.animationSequence = [];

    //
    // game interface variables
    //
    this.interface = 0; // 0 = no hud
    // 1 = graphics hud
    // 2 = text hud

    this.relay_moves_offchain_if_possible = 1;
    this.initialize_game_offchain_if_possible = 1;

    this.next_move_onchain_only = 0;

    this.hud = new GameHud(app, this);
    this.clock = new GameClock(app, this);
    this.log = new GameLog(app, this);
    this.cardfan = new GameCardfan(app, this);
    this.playerbox = new GamePlayerbox(app, this);
    this.cardbox = new GameCardbox(app, this);
    this.menu = new GameMenu(app, this);
    this.hammer = GameHammerMobile; //no constructor
    this.sizer = new GameBoardSizer(app, this); //yes constructor
    this.crypto_transfer_manager = new GameCryptoTransferManager(app, this);
    this.scoreboard = new GameScoreboard(app, this);
    this.hexgrid = new GameHexGrid(app, this);
    this.overlay = new SaitoOverlay(app, this, false);
    this.acknowledge_overlay = new GameAcknowledgeOverlay(app, this);
    this.observer = null;

    this.clock_timer = null; //Interval reference updating countdown clock
    this.menus = [];
    this.minPlayers = 2;
    this.maxPlayers = 2;
    this.lang = "en";
    this.log_length = 150;

    this.card_back = "red_back.png";

    this.publisher_message = "";

    this.time = {};
    this.time.last_received = 0; //For when we last received control of game
    this.time.last_sent = 0; //For when we send our moves

    //
    // used to generate provably-fair dice rolls
    //
    this.secureroll_rnums = [];
    this.secureroll_hash = "";

    //
    // used in reshuffling
    //
    this.old_discards = {};
    this.old_removed = {};
    this.old_cards = {};
    this.old_crypt = [];
    this.old_keys = [];
    this.old_hand = [];

    this.gaming_active = 1; //
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
    this.changeable_callback = function (card) { };
    this.cardbox_callback = function (card) {
      if (temp_self.changeable_callback !== null) {
        temp_self.changeable_callback(card);
      }
    };
    this.menu_backup_callback = null;
    this.back_button_html = `<i class="fa fa-arrow-left" id="back_button"></i>`;

    this.hiddenTab = "hidden";
    this.notifications = 0;


    app.connection.on("update-username-in-game", () => {
      if (this.browser_active) {
        this.resetPlayerNames();
        for (let i = 0; i < this.game.players.length; i++) {
          try {
            Array.from(document.querySelectorAll(`.saito-playername[data-id='${this.game.players[i]}']`)).forEach(
              add => (add.innerHTML = this.game.playerNames[i])
            );
          } catch (err) {
            console.error(err);
          }
        }

      }
    });

    return this;
  }

  async displayModal(modalHeaderText, modalBodyText = "") {
    await salert(`${modalHeaderText}${modalBodyText ? ": " : ""}${modalBodyText}`);
  }

  displayWarning(warningTitle, warningText = "", time = 4000) {
    let html = `<div class="game_warning_overlay">
                  <div class="game_warning_header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div class="game_warning_timer" >Auto close in <span id="clock_number">${Math.ceil(
      time / 1000
    )}</span>s</div>
                  </div>
                  <h2>${warningTitle}</h2>
                  <p ${warningText.length == 0 ? "style='flex:1;'" : "style='flex:2;'"
      }>${warningText}</p>
                </div>`;

    let overlay_self = this.overlay;
    let timeouthash = null,
      intervalHash = null;
    if (time > 0) {
      timeouthash = setTimeout(() => {
        overlay_self.hide();
        clearInterval(intervalHash);
      }, time);
      intervalHash = setInterval(() => {
        time -= 250;
        try {
          document.getElementById("clock_number").innerHTML = Math.ceil(time / 1000);
        } catch (err) { }
      }, 250);
    }

    this.overlay.show(html, () => {
      if (timeouthash) {
        clearTimeout(timeouthash);
      }
      if (intervalHash) {
        clearInterval(intervalHash);
      }
    });
  }

  returnArcadeImg() {
    return `/${this.returnSlug()}/img/arcade/arcade.jpg`;
  }

  returnArcadeBanner() {
    return `/${this.returnSlug()}/img/arcade/arcade-banner-background.png`;
  }

  async preloadImages() { }

  returnCardHeight(card_width = 1) {
    return card_width * this.card_height_ratio;
  }

  //Since games are still on initializeHTML, we don't want default mod behavior to
  //add a bunch of random html to our games
  render(app) {
    app.connection.emit("set-relay-status-to-busy", {});
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
    // These two tests should be copied to the top of any module that extends gameTemplate
    //
    if (this.browser_active == 0) {
      return;
    }
    if (this.initialize_game_run == 1) {
      return 0;
    }

    //
    // Query server to make sure you know and remember your new friends names
    this.app.connection.emit("registry-fetch-identifiers-and-update-dom", this.game.players);


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

          msg = {};
          msg.game_id = game_id;
          msg.bid = bid;
          msg.tid = tid;
          msg.last_move = last_move;
          msg.player = "";
          msg.module = this.name;

          let msgobj = app.crypto.stringToBase64(JSON.stringify(msg));
          // removed NOV 10
          //if (this.game.id != game_id) {
          //  arcade_mod.observeGame(msgobj);
          //  return;
          //}
        }
      }

      window.location.hash = `#`;
      window.location.hash = app.browser.initializeHash(
        `#gid=${this.game.id}&bid=1&tid=1&lm=0`,
        oldHash,
        {}
      );
    } catch (err) {
      console.error(err);
    }

    //
    // check options for clock
    //
    if (this.game?.options?.clock) {
      if (parseFloat(this.game.options.clock) == 0) {
        this.game.clock_limit = 0;
        this.useClock = 0;
      } else {
        if (this.game.clock_spent == 0) {
          this.game.clock_limit = parseFloat(this.game.options.clock) * 60 * 1000;
          this.saveGame(this.game.id);
        }
        this.useClock = 1;
      }
      //console.log("Set clock limit to ", this.game.clock_limit);
    }

    if (this.useClock == 1) {
      this.clock.render();
    }

    if (this.game.player == 0) {
      this.observer = app.modules.returnModule("Observer");
      if (this.observer) {
        this.observer.renderControls(app, this);
        if (this.game.live) {
          this.observer.step_speed = 3;
          this.observer.controls.play(); //Just update the controls so they match our altered state
          //console.log("FAST PLAY GAME!");
          //console.log("Paused/Halted: " + this.observer.is_paused + " " + this.game.halted);
        }
      }
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
    if (typeof document.hidden !== "undefined") {
      // Opera 12.10 and Firefox 18 and later support
      this.hiddenTab = "hidden";
      visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      this.hiddenTab = "msHidden";
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      this.hiddenTab = "webkitHidden";
      visibilityChange = "webkitvisibilitychange";
    }

    document.addEventListener(
      visibilityChange,
      () => {
        if (document[this.hiddenTab]) {
        } else {
          if (this.tabInterval) {
            clearInterval(this.tabInterval);
            this.tabInterval = null;
            document.title = this.gamename || this.name;
            this.notifications = 0;
          }
        }
      },
      false
    );

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
    This is primarily used as a flag to say "Yes I am a game", but some arcade functions want to 
    access the game properties to render properly 
    */
    if (type == "arcade-games") {
      return true;
    }

    if (type == "default-league") {
      let obj = {};
      obj.name = this.gamename || this.name;
      obj.game = this.name;
      obj.description = this.description;
      obj.ranking_algorithm = "ELO";
      obj.default_score = 1500;
      return obj;
    }

    return null;
  }
  renderArcade(app, data) { }
  attachEventsArcade(app, data) { }

  onPeerHandshakeComplete(app, peer) {
    //
    // if we have pending moves in this game in our wallet, relay again
    // Probably only need to check on startQueue (when reconnecting to network)

    if (this.hasGameMovePending() && this.game?.initializing == 0) {
      //
      // rebroadcast game move out of paranoia
      //
      for (let i = 0; i < this.app.wallet.wallet.pending.length; i++) {
        let tx = new saito.default.transaction();
        tx.deserialize_from_web(this.app.wallet.wallet.pending[i]);
        let txmsg = tx.returnMessage();
        if (txmsg.module === this.name) {
          if (txmsg.game_id === this.game?.id) {
            if (txmsg?.step?.game) {
              if (this.game.step.players[tx.transaction.from[0].add] < txmsg.step.game) {
                this.app.network.propagateTransaction(tx);
                this.app.connection.emit("relay-send-message", { recipient: this.game.accepted, request: "game relay gamemove", data: tx.transaction });
              }
            }
          }
        }
      }
    }
  }

  async onConfirmation(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();
    let game_self = app.modules.returnModule(txmsg.module);

    if (conf == 0) {
      let game_id = txmsg.game_id;

      if (!tx.isTo(app.wallet.returnPublicKey())) {
        return;
      }

      if (!this.doesGameExistLocally(game_id)) {
        return;
      }

      if (!app.BROWSER) {
        return;
      }

      // what if no game is loaded into module
      if ((!game_self.game && game_id) || (game_self.game.id !== game_id)) {
        console.info("Game engine, move received. Safety catch (1), loading game...");
        game_self.loadGame(game_id);
      }

      // gameover requests
      if (txmsg.request === "gameover") {
        game_self.receiveGameoverRequest(blk, tx, conf, app);
        return;
      }
      // stopgame requests
      if (txmsg.request === "stopgame") {
        game_self.processResignation(tx.transaction.from[0].add, txmsg);
        return;
      }


      //
      // TODO - poker init fails if this is commented out
      //
      // do we have a failure here if relay not running / fails?
      //
      //
      // this could be a game init
      //
      if (!txmsg?.step?.game) { //Not a game move
        console.info(`${this.name} skipping ${JSON.stringify(txmsg)}`);
        return;
      }

      //
      // process game move
      //
      if (game_self.initialize_game_run == 0 || game_self.isFutureMove(tx.transaction.from[0].add, txmsg)) {
        //console.log("ONCHAIN: is future move " + txmsg.step.game);
        game_self.addFutureMove(tx);

        //Safety check in case observer missed a move
        //If we have multiple moves in the future queue and are receiving moves on chain,
        //then something has probably gone wrong
        if (game_self.game.player === 0 && game_self.game.future.length > 3) {
          game_self.observer.controls.next();
        }
      } else if (game_self.isUnprocessedMove(tx.transaction.from[0].add, txmsg)) {
        //console.log("ONCHAIN: is next move " + txmsg.step.game);
        game_self.addNextMove(tx);
        if (document[this.hiddenTab]) {
          this.startNotification();
        }
      } else {
        //console.log("is old move " + txmsg.step.game);
      }
    }
  }

  sendGameObserverTx(initial_state) {
    let mymsg = {};
    mymsg.game_state = JSON.parse(JSON.stringify(initial_state)); //this.returnGameState(JSON.parse(JSON.stringify(initial_state)));
    mymsg.module = this.name;
    mymsg.game_id = this.game.id;
    mymsg.request = "observer";

    //Hardcode observer stats
    mymsg.game_state.player = 0;
    mymsg.game_state.step.ts = new Date().getTime();
    mymsg.game_state.observer_mode = 1; //Not really necessary

    let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee(
      this.app.wallet.returnPublicKey(),
      0.0
    );

    if (newtx) {
      newtx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));
      newtx.msg = mymsg;
      newtx = this.app.wallet.signTransaction(newtx);
      this.app.network.propagateTransaction(newtx);
      // why commented out?
      //this.app.connection.emit("relay-send-message", { recipient: this.game.accepted, request: "game relay observer", data: newtx.transaction });      
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


      // observers don't send game moves
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
        ns.ts = new Date().getTime();
        mymsg.request = "game";
      }

      //
      // if our crypto key is out-of-date, update -- note that SAITO and CHIPS are not checked
      //
      if (game_self.game.crypto !== "SAITO" && game_self.game.crypto !== "" && game_self.game.crypto !== "CHIPS") {
        let crypto_mod = this.app.wallet.returnCryptoModuleByTicker(game_self.game.crypto);
        let crypto_key = this.app.wallet.returnCryptoAddressByTicker(game_self.game.crypto);
        if (crypto_mod) {
          crypto_key = crypto_mod.returnAddress();
        }
        for (let i = 0; i < this.game.players.length; i++) {
          if (this.game.players[i] === this.app.wallet.returnPublicKey()) {
            if (this.game.keys[i] !== crypto_key) {
              this.game.turn.push(
                `CRYPTOKEY\t${this.app.wallet.returnPublicKey()}\t${crypto_key}\t${this.app.crypto.signMessage(
                  crypto_key,
                  this.app.wallet.returnPrivateKey()
                )}`
              );
            }
          }
        }
        //
        // revert keys to SAITO if necessary
        //
      } else {
        let crypto_key = this.app.wallet.returnPublicKey();
        for (let i = 0; i < this.game.players.length; i++) {
          if (this.game.players[i] === this.app.wallet.returnPublicKey()) {
            if (this.game.keys[i] !== crypto_key) {
              this.game.turn.push(
                `CRYPTOKEY\t${crypto_key}\t${crypto_key}\t${this.app.crypto.signMessage(
                  crypto_key,
                  this.app.wallet.returnPrivateKey()
                )}`
              );
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

      //console.log("GAME ADDING TX TO PENDING: " + newtx.returnMessage());

      game_self.app.wallet.addTransactionToPending(newtx); //Use the API!

      game_self.saveGame(game_self.game.id);

      console.info("Sending Move: ", JSON.parse(JSON.stringify(mymsg)));

      //
      // send off-chain if possible - step 2 onchain to avoid relay issues with options
      //
      if (this.relay_moves_offchain_if_possible && send_onchain_only == 0) {
        // only game moves to start
        if (
          (newtx.msg.request === "game" && this.game.initializing == 0) ||
          this.initialize_game_offchain_if_possible == 1
        ) {
          this.app.connection.emit("relay-send-message", { recipient: this.game.accepted, request: "game relay gamemove", data: newtx.transaction });
        }
      }

      game_self.app.network.propagateTransaction(newtx);
    }, 100);
  }

  async handlePeerTransaction(app, tx = null, peer, mycallback = null) {

    let message;
    if (tx == null) { return; }
    try {
      message = tx.returnMessage();
    } catch (err) {
      console.log("@#421341234 error");
      console.log(JSON.stringify(tx));
      return;
    }


    if (app.BROWSER == 0) {
      return;
    }

    super.handlePeerTransaction(app, tx, peer, mycallback);

    if (message?.request?.includes("game relay")) {
      if (message?.data != undefined) {
        let gametx = new saito.default.transaction(message.data);

        let gametxmsg = gametx.returnMessage();

        //
        // nope out if game does not exist locally
        //
        if (!this.doesGameExistLocally(gametxmsg.game_id)) {
          console.info(`Game does not exist locally. Not processing HPR message (${message.request}): waiting for on-chain`);
          return;
        }

        //
        // we appear to have two types of inbound message formats, so have a sanity
        // check on the loading mechanism.
        //
        if (this.name === gametxmsg.module) {
          //          console.log("Game Peer Request",JSON.parse(JSON.stringify(gametxmsg)));

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
          if (!this.game?.id || gametxmsg.game_id != this.game.id) {
            console.warn("ERROR SKIPPING HPT IN GAME: " + this.game.id);
            return;
          }

          if (message?.request === "game relay gamemove") {
            if (this.initialize_game_run == 0 || this.isFutureMove(gametx.transaction.from[0].add, gametxmsg)) {
              //console.info("OFFCHAIN: is future move " + gametxmsg.step.game);
              this.addFutureMove(gametx);
            } else if (this.isUnprocessedMove(gametx.transaction.from[0].add, gametxmsg)) {
              //console.info("OFFCHAIN: is next move " + gametxmsg.step.game);
              this.addNextMove(gametx);

              if (document[this.hiddenTab]) {
                this.startNotification();
              }
            } else {
              //console.log("OFFCHAIN: is old move " + gametxmsg.step.game);
              //console.log("Receive Move Offchain but neither future nor unprocessed: " + gametx.transaction.from[0].add + " -- " + JSON.stringify(gametxmsg.step));
            }
          } else if (message.request === "game relay gameover") {
            this.receiveGameoverRequest(null, gametx, 0, app);
          } else if (message.request === "game relay stopgame") {
            this.processResignation(gametx.transaction.from[0].add, gametxmsg);
          } else if (message.request == "game relay update") {
            if (gametxmsg.request == "follow game") {
              console.info("Adding Follower: " + gametxmsg.my_key);
              this.addFollower(gametxmsg.my_key);
            }
          }
        }
      }
    }
  }


  startNotification() {
    if (!this.browser_active) {
      return;
    }
    //If we haven't already started flashing the tab
    this.notifications++;
    if (!this.tabInterval) {
      this.tabInterval = setInterval(() => {
        let modName = this.gamename || this.name;
        if (document.title === modName) {
          document.title =
            this.notifications == 1 ? "New move" : `(${this.notifications}) new moves`;
        } else {
          document.title = modName;
        }
      }, 650);
    }
  }


  // called from Arcade to kick off game initialization
  async processAcceptRequest(tx) {
    let txmsg = tx.returnMessage();
    let game_id = txmsg.game_id;

    //
    // accepted games should have all the players. If they do not, drop out
    //
    if (txmsg.players_needed > txmsg.players.length) {
      console.info(
        "ACCEPT REQUEST RECEIVED -- but not enough players in accepted transaction.... aborting"
      );
      return false;
    }

    //
    // ignore games not containing us
    //
    if (!txmsg.players.includes(this.app.wallet.returnPublicKey())) {
      console.info("ACCEPT REQUEST RECEIVED -- but not for a game with us in it!");
      return false;
    }

    //
    // NOTE: re-loading the game might throw out some data
    // But this should create the game
    if (!this.game || this.game.id != game_id) {
      this.loadGame(game_id);
    }

    //
    // do not re-accept
    if (this.game.step.game > 2) {
      return false;
    }

    //
    // validate all accept-sigs are proper
    let msg_to_verify = "invite_game_" + txmsg.ts;

    if (txmsg.players.length == txmsg.players_sigs.length) {
      for (let i = 0; i < txmsg.players.length; i++) {
        if (!this.app.crypto.verifyMessage(msg_to_verify, txmsg.players_sigs[i], txmsg.players[i])) {
          console.warn("PLAYER SIGS do not verify for all players, aborting game acceptance");
          this.game.halted = 0;
          return false;
        }
      }
    } else {
      console.warn("Players and player_sigs different lengths!");
      return false;
    }

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
    this.game.module = txmsg.game;
    this.game.originator = txmsg.originator; //Keep track of who initiated the game
    this.game.players_needed = txmsg.players.length; //So arcade renders correctly

    //
    // enable save game state if observer mode is an advanced option
    //
    if (this.game.options.observer === "enable") {
      this.game.observer_mode = 1;
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

      this.gaming_active = 1; //Prevent any moves processing while sorting players

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

      for (let i = 0; i < this.game.players.length; i++) {

        //Figure out which seat is mine
        if (this.game.players[i] === this.app.wallet.returnPublicKey()) {
          this.game.player = i + 1;
        }

        // defaults to SAITO keys
        // I guess this is useful for something...
        this.game.keys.push(this.game.players[i]);

        //
        //This should automatically add all game opponents to my "contacts"
        //
        this.app.keychain.addWatchedPublicKey(this.game.players[i]);
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
      this.saveGamePreference(game_id + "_sharekey", this.app.crypto.generateRandomNumber());

      console.log("!!!!!!!!!!!!!!!!!!!!");
      console.log("!!! GAME CREATED !!!");
      console.log("!!!!!!!!!!!!!!!!!!!!");
      console.log("Game Id: " + game_id);
      console.log("My PublicKey: " + this.app.wallet.returnPublicKey());
      console.log("My Player Number: " + this.game.player);
      console.log("ALL KEYS: " + JSON.stringify(this.game.players));
      console.log("My Share Key: " + this.loadGamePreference(game_id + "_sharekey"));
      console.log("!!!!!!!!!!!!!!!!!!!!");
      console.log("!!!!!!!!!!!!!!!!!!!!");
      console.log("!!!!!!!!!!!!!!!!!!!!");

      this.game.players_set = 1;

      //this.gaming_active = 0;
      this.saveGame(game_id);

      /*
      No observer for now....
      if (this.game.player == 1 && txmsg.status == "open") {
        this.sendGameObserverTx(this.game);
      }*/

      //
      // players are set and game is accepted, so move into handleGame
      //
      this.initializeGameFeeder(game_id);

    }

    return game_id;
  }

  //
  // screen ratio (for determining scaling)
  //
  calculateBoardRatio() {
    try {
      if (document.querySelector(".gameboard")) {
        let gameWidth = document.querySelector(".gameboard").getBoundingClientRect().width;
        //Only needed for gameTemplate.scale, for putting game pieces on a game board
        this.boardRatio = gameWidth / this.boardWidth;
        console.info("BOARD RATIO:", this.boardRatio)
      }
    } catch (err) {
      console.error(err);
    }
  }

  /*
  Called by Saito on browser load
  */
  async initialize(app) {
    this.initializeQueueCommands(); // Define standard queue commands

    if (!this.browser_active) {
      return;
    }

    this.calculateBoardRatio();

    //
    // we grab the game with the most current timestamp (ts)
    // since no ID is provided
    this.loadGame();

    //Just make sure I am in the accepted, so if I send a message, I also receive it
    //edge case with table games/observer
    this.addFollower(this.app.wallet.returnPublicKey());

    //
    // sanity checks on winnable / losable / cooperative
    //
    if (this.game.players.length == 1) {
      this.cooperative = 0;
    }
    if (this.game.players.length == 1) {
      this.winnable = 0;
    }
    if (this.game.players.length == 1) {
      this.losable = 0;
    }
    if (this.losable == 0) {
      this.winnable = 0;
    }
    if (this.winnable == 0) {
      this.losable = 0;
    }
    if (this.cooperative == 1) {
      this.winnable = 0;
      this.losable = 0;
    }

    //
    // initialize the clock
    //
    this.time.last_received = new Date().getTime();
    this.time.last_sent = new Date().getTime();

    console.info("INITIALIZE GAME FEEDER!: " + this.name);

    console.info(JSON.parse(JSON.stringify(this.game)));

    console.info("PRE INITIALIZE GAME FEEDER!: " + this.name);

    this.initializeGameFeeder(this.game.id);

    console.info("DONE INITIALIZE GAME FEEDER!: " + this.name);

    //
    // track if winnable
    //
    if (this.game.players.length > 1) {
      this.winnable = 1;
    }
  }

  removeEventsFromBoard() { }

  removeGameFromOptions(game_id = "") {
    if (game_id === "") {
      return;
    }
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

  exitGame() {
    let homeModule = this.app.options.homeModule || "Arcade";
    let mod = this.app.modules.returnModuleByName(homeModule);
    let slug = mod?.returnSlug() || "arcade";
    window.location.href = "/" + slug;
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
    if (!this.game || this.game.id !== game_id) {
      console.info("Loading game in GameFeeder!");
      this.loadGame(game_id);
    }

    //
    // proactively initialize HTML so that the HUD
    // and other graphical elements exist for the game
    // queue to handle. We must specify not to do this
    // twice, ergo initializeHTML doing the init check
    //
    this.initializeHTML(this.app);
    this.attachEvents(this.app);

    if (this.game.status != "") {
      this.updateStatus(this.game.status);
    }

    //
    // quit if already initialized, or not first time initialized
    //
    if (this.game.initialize_game_run == 1 && this.initialize_game_run == 1) {
      return 0;
    } else {
      this.game.initialize_game_run = 1;
      this.initialize_game_run = 1;
    }

    this.initializeDice(); // Make sure we have dice before initializing the game

    //Implicit crypto staking for all games (if included in the options)
    if (this.game.options?.crypto) {
      this.game.stake = this.game.options.stake ? parseFloat(this.game.options.stake) : 0;
      this.game.crypto = this.game.options.crypto || "";
    }

    this.initializeGame(game_id);

    //Quit if reloading a game that is already finished.
    if (this.game.over == 1) {
      return 0;
    }

    // FEB 12 - disabling causes init on receiver so reduce to earliest step
    if (this.game.step.game < 2) {
      this.saveGame(this.game.id);
    }


    //console.info("/////////////////");
    //console.info("// START QUEUE //");
    //console.info("/////////////////");

    this.startQueue();

    //console.info("started queue done");

    return 1;
  }

  startQueue() {
    if (this.hasGameMovePending() && this.game?.initializing == 0) {
      this.updateStatus('<div class="status_message">Rebroadcasting Last Move...</div>');
      console.info("Should not start processing QUEUE because we have pending TXs");
      this.gaming_active = 0;
      return 0;
    }

    if (this.runQueue() == 0) {

      if (this.game.player == 0 && this.observer) {
        if (this.observer?.is_paused) {
          console.info("Step wise");
          this.game.halted = 1;
        } else {
          setTimeout(() => {
            if (this.processFutureMoves() == 0) {
              //Try to download new moves
              console.info("Checking DB for missed future moves");
              this.observer.controls.next();
            }
          }, this.observer.step_speed);
          return;
        }
      }

      this.processFutureMoves();
    }
  }

  /*
  To restart the queue after it was paused for UI display
  */
  restartQueue() {
    if (this.gaming_active) {
      console.warn("Queue Already active, not restarting...");
      return;
    }

    // save so we continue from AFTER this point...
    console.info(`Restarting queue (${this.game.halted}): ` + JSON.stringify(this.game.queue));
    this.game.halted = 0;
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


    // I want to experiment with moving this to game-defined commands
    // So the UI can "pause" the screen but allow game engine commands to execute in the background
    // i.e. it only halts the game for UI updates
    if (this.game.halted === 1) {
      console.info("Don't start process queue while halted");
      return -1;
    }

    this.gaming_active = 1; // prevents future moves from getting added to the queue while it is processing

    //stash a copy of state before doing anything
    this.game_state_pre_move = JSON.parse(JSON.stringify(game_self.game));

    //
    // loop through the QUEUE (game stack)
    //
    //console.info("START QUEUE: " + JSON.stringify(game_self.game.queue));

    while (game_self.game.queue.length > 0 && cont == 1) {

      //console.info("LATEST: " + game_self.game.queue[game_self.game.queue.length - 1]);

      if (loops_through_queue >= 100 && queue_length == game_self.game.queue.length && last_instruction === game_self.game.queue[queue_length - 1]) {
        console.warn("ENDLESS QUEUE LOOPING");
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
          //console.info("GAME ENGINE STOPS FOR " + JSON.stringify(gmv));
          //console.info("OUTSTANDING QUEUE: " + JSON.stringify(game_self.game.queue));
          return 0;
        }
      }
      //if (this.game.player == 0) {
      //  if (this.game.deck?.length > 0) console.log(JSON.parse(JSON.stringify(this.game.deck[0])));
      //  if (this.game.pool?.length > 0) console.log(JSON.parse(JSON.stringify(this.game.pool[0])));
      //}

      //
      // we have not removed anything, so throw it to the game module to process the move
      //
      if (
        queue_length == game_self.game.queue.length &&
        cont == 1 &&
        last_instruction === game_self.game.queue[queue_length - 1]
      ) {
        cont = this.handleGameLoop();
      }

    }

    //console.log("PAUSING QUEUE: " + JSON.stringify(game_self.game.queue));
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

    if (tx_step == this.game.step.game) {
      return 1;
    }

    if (this.game.step.players[player]) {
      if (tx_step == this.game.step.players[player]) {
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
    let gametxmsg = gametx.returnMessage();

    ////////////
    // HALTED  -- a safety catch for future moves
    ////////////
    if (this.game.halted == 1 || this.gaming_active == 1 || this.initialize_game_run == 0) {
      console.info(`Save as future move because halted (${this.game.halted}) or active (${this.gaming_active})`);
      this.addFutureMove(gametx);
      return;
    }

    //Update player's step value
    this.game.step.players[gametx.transaction.from[0].add] = gametxmsg.step.game;

    //And master game step value (if actually incremented)
    if (gametxmsg.step.game > this.game.step.game) {
      this.game.step.game = gametxmsg.step.game;
    }


    //console.info(`Add Next Move (${gametxmsg.step.game}) to QUEUE: ${JSON.stringify(gametxmsg.turn)}`);
    //console.log(JSON.parse(JSON.stringify(gametxmsg)));

    //
    // OBSERVER MODE -
    //
    if (this.game.player == 0) {
      if (this.observer?.controls) {
        this.observer.controls.showLastMoveButton();
        this.observer.controls.updateStep(this.game.step.game);
      }
      if (this.observer) {
        this.observer.game_states.push(this.game_state_pre_move);
        this.observer.game_moves.push(gametx);
        //To avoid memory overflow for long games
        if (this.observer.game_states.length > 100) {
          this.observer.game_states.shift();
        }
        if (this.observer.game_moves.length > 100) {
          this.observer.game_moves.shift();
        }
      }

      //We may need to add a GOD mode in the future where observer can see the secret info of each player
      //but best to turn off for now

      /*if the game_state includes a deck
      if (gametxmsg.game_state?.deck.length > 0) {

        //Observer might keep a super deck
        if (!this.game.player_decks){
          this.game.player_decks = [];
          //Each element of which is the deck(s) corresponding to one player
          for (let i = 0; i < this.game.players.length; i++){
            this.game.player_decks.push([]);
          }
        }

        let player_idx = 0;
        for (let i = 0; i < this.game.players.length; i++) {
          if (this.game.players[i] === gametx.transaction.from[0].add) {
            player_idx = i;
          }
        }
        console.log(`Player ${player_idx+1} sent deck:`, JSON.parse(JSON.stringify(gametxmsg.game_state.deck)));

        for (let i = 0; i < gametxmsg.game_state.deck.length; i++) {
          while (this.game.player_decks[player_idx].length < i + 1){
            this.game.player_decks[player_idx].push({});
          }
          //Copy player deck
          this.game.player_decks[player_idx][i] = gametxmsg.game_state.deck[i];

          if (gametxmsg.sharekey) {
            console.log("Sharekey: "+ gametxmsg.sharekey);
            this.game.player_decks[player_idx][i].hand = JSON.parse(this.app.crypto.hexToString(this.app.crypto.decodeXOR(gametxmsg.game_state.deck[i].hand, gametxmsg.sharekey)));
            this.game.player_decks[player_idx][i].keys = JSON.parse(this.app.crypto.hexToString(this.app.crypto.decodeXOR(gametxmsg.game_state.deck[i].keys, gametxmsg.sharekey)));
          }
        }
      }*/
    }

    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue) {
      for (let i = 0; i < gametxmsg.turn.length; i++) {
        this.game.queue.push(gametxmsg.turn[i]);
      }

      this.saveFutureMoves(this.game.id);
      this.saveGame(this.game.id);
      this.startQueue();
    } else {
      console.error("No queue in game engine");
    }
  }

  /*
   Stash incoming transaction (a set of game moves) into an array of to be processed later
   */
  addFutureMove(gametx) {
    if (!this.game.future) {
      this.game.future = [];
    }

    if (!this.game.future.includes(JSON.stringify(gametx.transaction))) {
      this.game.future.push(JSON.stringify(gametx.transaction));
      this.saveFutureMoves(this.game.id);

      if (this.game.player == 0 && this.observer?.controls) {
        try {
          if (this.observer?.is_paused) {
            this.observer.controls.showNextMoveButton();
            this.updateObserverStatus("New pending move");
          } else {
            this.processFutureMoves();
          }
        } catch (err) { }
      }
    }
  }

  /*
  The goal of this function is not to process all the future moves, but to search
  the archived future moves for JUST the NEXT one, so we can continue processing the game steps
  */
  processFutureMoves() {
    this.gaming_active = 0;

    if (this.game.halted == 1 || this.initialize_game_run == 0) {
      //console.info(`Unable to process future moves now because halted (${this.game.halted}) or gamefeeder not initialized (${this.initialize_game_run})`);
      return -1;
    }

    //console.info(this.game.future.length + " FUTURE MOVES at step --> " + this.game.step.game);

    //Search all future moves for the next one
    for (let i = 0; i < this.game.future.length; i++) {
      let ftx = new saito.default.transaction(JSON.parse(this.game.future[i]));
      let ftxmsg = ftx.returnMessage();
      //console.info(`FTMSG (${ftxmsg.step.game}): ` + JSON.stringify(ftxmsg.turn));

      if (this.isUnprocessedMove(ftx.transaction.from[0].add, ftxmsg)) {
        //This move (future[i]) is the next one, move it to the queue
        this.game.future.splice(i, 1);
        this.updateObserverStatus("Advanced one move");

        this.addNextMove(ftx);
        return 1;
      } else if (this.isFutureMove(ftx.transaction.from[0].add, ftxmsg)) {
        //console.info("Is future move, leave on future queue");
        //This move (future[i]) is still for the future, so leave it alone
      } else { //Old move, can ignore
        //console.info("Is old move, prune from future queue");
        this.game.future.splice(i, 1);
        i--; // reduce index as deleted
      }
    }

    if (this.game.player == 0 && this.game.future.length == 0) {
      this.updateObserverStatus("No pending moves, click again to check the database");
      //salert("Caught up to current game state");
    }

    return 0; //No moves in future
  }

  handleGameLoop() {
    //console.log("handle game loop returning 0...");
    return 0;
  }

  removePlayer(address) {
    if (address === "") {
      return;
    }
    for (let i = this.game.players.length - 1; i >= 0; i--) {
      if (this.game.players[i] === address) {
        this.game.players.splice(i, 1);
        this.game.keys.splice(i, 1);
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
        this.game.player = i + 1;
      }
    }

    console.log("PLAYER ID: " + this.game.player);

    if (this.game.player === 0) {
      this.game.live = 1;
    }
    //Keep track of players removed from the game
    if (!this.game.eliminated) {
      this.game.eliminated = [];
    }
    if (!this.game.eliminated.includes(address)) {
      this.game.eliminated.push(address);
    }
  }

  getShortNames(publicKey, max = 10) {
    let name = this.app.keychain.returnUsername(publicKey);
    if (name.indexOf("@") > 0) {
      name = name.substring(0, name.indexOf("@"));
    }
    if (name === publicKey) {
      name = publicKey.substring(0, max) + "...";
    }
    return name;
  }

  addPlayer(address) {
    if (address === "") {
      return 0;
    }
    for (let i = 0; i < this.game.players.length; i++) {
      if (this.game.players[i] === address) {
        return 0;
      }
    }

    this.game.players.push(address);

    if (!this.game.accepted.includes(address)) {
      this.game.accepted.push(address);
    }

    if (this.app.wallet.returnPublicKey() !== address) {
      this.game.opponents.push(address);
    }
    return 1;
  }

  addFollower(address) {
    if (address === "") {
      return;
    }
    if (!this.game.accepted.includes(address)) {
      this.game.accepted.push(address);
      this.saveGame(this.game.id);
    }
  }

  resetPlayerNames() {
    this.game.playerNames = [];
    this.game.players.forEach((playerKey, i) => {

      let name = this.app.keychain.returnUsername(playerKey);
      if (name.includes("...")) {
        name = `Player ${i + 1}`;
      }
      if (name.includes("@")) {
        name = name.substring(0, name.indexOf("@"));
      }
      console.log(playerKey, i, name);
      this.game.playerNames.push(name);
    });


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

    if (this.game.id !== game_id) {
      this.loadGame(game_id);
    }

    console.info("Received Gameover Request from " + tx.transaction.from[0].add);

    //
    // sender must be in game to end it (removed players no problem)
    // Make sure this is only processed once
    //
    if (this.game.players.includes(tx.transaction.from[0].add) && this.game.over !== 1) {

      this.game.winner = winner;
      this.game.over = 1;
      this.game.last_block = this.app.blockchain.last_bid;


      if (this.browser_active) {
        this.removeEvents();
        this.endGameCleanUp();

        //Check if multiple winners, or none
        let readable = "";

        if (winner.includes(this.app.wallet.returnPublicKey())) {
          readable = "You win";
        } else {
          if (Array.isArray(winner)) {
            for (let w of winner) {
              readable += this.identifyPlayerByPublicKey(w) + ", ";
            }
            readable = readable.substring(0, readable.length - 2) + " win";
            if (winner.length == 1) {
              readable += "s";
            }
          } else {
            readable = this.identifyPlayerByPublicKey(winner) + " wins";
          }
        }

        //Include reason if given
        if (txmsg.reason != "") {
          readable += " by " + txmsg.reason;
        } else {
          readable += "!";
        }

        //Just state reason if no winners
        if (winner.length == 0 || txmsg.reason == "cancellation") {
          readable = txmsg.reason;
        }

        try {

          this.unlockInterface(); //Override any player input interface
          this.updateLog(`Game Over: ${readable}`);

          this.endGameInterface(`Game Over: ${readable}`, txmsg.reason !== "cancellation");

          document.getElementById("rematch").onclick = (e) => {
            this.app.connection.emit("arcade-issue-challenge", {
              game: this.name,
              players: this.game.players,
              options: this.game.options,
            });
          };

          //Listeners for rematch actions
          app.connection.on("arcade-reject-challenge", (game_id) => {
            this.endGameInterface(`Game Over: ${readable}`, false);
          });

          app.connection.on("arcade-game-loading", () => {
            this.updateStatus("Resetting game...");
            this.browser_active = 0; //Hack to simulate not being in the game mod
          });

          app.connection.on("arcade-game-ready-play", (game) => {
            window.location = "/" + this.returnSlug();
          });
        } catch (err) { }
      } else {
        siteMessage(txmsg.module + ": Game Over", 5000);
      }

      //Crypto settlement???
      if (this.game.crypto && this.game?.stake > 0 && this.game.step.game > this.grace_window) {
        this.payWinners(winner);
      }

      this.saveGame(this.game.id);

      //Delete local copy
      //this.removeGameFromOptions(game_id);            //remove from options.games[]

    }

    return;
  }

  // Called on game over, let's the game module clean up the DOM
  endGameCleanUp() {

  }

  endGameInterface(status, allowRematch) {
    let target = this.app.options.homeModule || "Arcade";
    allowRematch = allowRematch && this.game.player !== 0;

    let options = `<ul>
                      <li class="textchoice" id="confirmit">Return to ${target}</li>${allowRematch ? '<!--li class="textchoice" id="rematch">Rematch</li-->' : ""
      }
                   </ul>`;

    this.updateStatusWithOptions(status, options);

    document.getElementById("confirmit").onclick = (e) => {
      document.getElementById("confirmit").onclick = null; //If player clicks multiple times, don't want callback executed multiple times
      this.exitGame();
    };
  }

  //
  // call this to end game as tie
  //
  tieGame() {
    this.endGame(this.game.players, "tie");
  }

  /*
  Typically run by all the players, so we filter to make sure just one player sends to transaction
  Can also be used by a player (A) to announce to opponents that A is the winner.
  Function selects a winner to generate the game ending transaction, which is processed above
  in receiveGameOverRequest
  */
  endGame(winner = [], reason = "") {

    console.log("End Game! Winner:", winner);

    let player_to_send = Array.isArray(winner) ? winner[0] : winner;
    player_to_send = player_to_send || this.game.players[0];

    //Only one player needs to generate the transaction
    if (player_to_send == this.app.wallet.returnPublicKey()) {
      var newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
      newtx.transaction.to = this.game.accepted.map((player) => new saito.default.slip(player));
      newtx.msg = {
        request: "gameover",
        game_id: this.game.id,
        winner,
        players: this.game.players.join("_"),
        module: this.game.module,
        reason: reason,
        ts: new Date().getTime(),
      };

      if (this.game.options?.league_id) {
        newtx.msg.league_id = this.game?.options?.league_id;
      }

      newtx = this.app.wallet.signTransaction(newtx);

      console.log("I send gameover tx");

      //Send message
      this.app.network.propagateTransaction(newtx);

      //Send message to other players (or observers) so they can process the gameover code
      this.app.connection.emit("relay-send-message", { recipient: this.game.accepted, request: "game relay gameover", data: newtx.transaction });
      //Send message into the ether so that the arcade service can update the game status to "over"
      this.app.connection.emit("relay-send-message", { recipient: "PEERS", request: "arcade spv update", data: newtx.transaction });
    }
  }

  /*
  When my game logic shows that I have reached a losing condition and need to notify the opponents
  */
  resignGame(game_id = null, reason = "forfeit") {
    //May be called from Arcade and have to load the game to send out the message to correct players
    if (game_id && this.game.id != game_id) {
      console.warn("Have to load game in order to resign");
      this.loadGame(game_id);
    }

    var newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    newtx.transaction.to = this.game.accepted.map((player) => new saito.default.slip(player));
    newtx.msg = {
      request: "stopgame",
      game_id: this.game.id,
      module: this.game.module,
      reason,
    };

    newtx = this.app.wallet.signTransaction(newtx);

    //Send message
    this.app.network.propagateTransaction(newtx);
    this.app.connection.emit("relay-send-message", { recipient: this.game.accepted, request: "game relay stopgame", data: newtx.transaction });

  }


  /*
    Games should have a function to turn off all game-specific dom events
  */
  removeEvents() { }

  /*
  We receive a transaction (on/off chain) saying that a player hit the quit button
  We figure out who the other players are and if the game has gone beyond its grace period,
  call another function to push us into end game state (which requires another transaction)
  Resigning a game does still lead to a default game cancellation
  */
  processResignation(resigning_player, txmsg) {

    this.game.queue = [];
    this.moves = [];

    //Prevents double processing (from on/off chain)
    if (this.game.over > 0) {
      return;
    }

    console.info(resigning_player, JSON.parse(JSON.stringify(txmsg)));
    console.info(this.game.players);

    //Cancelling a game in the arcade to which you are not a player --> unsubscribe from the game
    if (this.game?.players) {
      if (!this.game.players.includes(resigning_player)) {
        //Player already not an active player, make sure they are also removed from accepted to stop receiving messages
        for (let i = this.game.accepted.length; i >= 0; i--) {
          if (this.game.accepted[i] == resigning_player) {
            this.game.accepted.splice(i, 1);
          }
        }
        return;
      }
    }

    this.game.over = 2;
    this.saveGame(this.game.id);
    if (this.game.players.length == 1) { return; }

    if (txmsg.reason == "cancellation") {
      this.updateLog(`${resigning_player} cancels the game`);
      this.endGame([], "cancellation"); //No one is marked as a winner
      //This is a fallback in case the end game doesn't come through
    } else {
      let winners = [];
      for (let p of this.game.players) {
        if (p !== resigning_player) {
          winners.push(p);
        }
      }
      this.endGame(winners, txmsg.reason);
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

  saveGame(game_id) {

    //console.log("---------------------");
    //console.log("===== SAVING GAME ID: "+game_id);
    //console.log("---------------------");

    if (this.game == undefined) {
      console.warn("Saving Game Error: safety catch 1");
      return;
    }

    // make sure options file has structure to save your game
    if (!this.app.options) {
      this.app.options = {};
    }
    if (!this.app.options.games) {
      this.app.options = Object.assign(
        {
          games: [],
          gameprefs: { random: this.app.crypto.generateKeys() },
        },
        this.app.options
      );
    }

    //console.log("saveGame version: "+this.app.crypto.hash(Math.random()));
    if (!game_id || game_id !== this.game.id) {
      //game_id = this.app.crypto.hash(Math.random().toString(32));
      console.warn("ERR? Save game with wrong id");
      console.warn("Parameter: " + game_id, "this game.id = " + this.game.id);
      return;
    }

    if (game_id != null) {
      if (this.app.options?.games) {
        for (let i = 0; i < this.app.options.games.length; i++) {
          if (this.app.options.games[i].id === game_id) {
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
          }
        }
      }

    }

    //
    // If we didn't find the game (by id) in our wallet
    // add it and save the options

    this.app.options.games.push(JSON.parse(JSON.stringify(this.game)));
    this.app.storage.saveOptions();

  }

  loadGame(game_id = null) {
    //
    // try to load most recent game
    //
    if (game_id == null) {
      let game_to_open = -1;
      let timeStamp = 0;

      if (this.app.options?.games?.length > 0) {
        for (let i = 0; i < this.app.options.games.length; i++) {
          //It's not enough to just pull the most recent game,
          //Need to make sure it is the right game module!!
          if (
            this.name == this.app.options.games[i].module &&
            this.app.options.games[i].ts > timeStamp
          ) {
            game_to_open = i;
            timeStamp = this.app.options.games[i].ts;
          }
        }
        if (game_to_open > -1) {
          game_id = this.app.options.games[game_to_open].id;
        }
      }
    }

    //If we were given the game_id or found the most recent valid game, then load it
    if (game_id != null) {
      for (let i = 0; i < this.app.options?.games?.length; i++) {
        if (this.app.options.games[i].id === game_id) {
          this.game = JSON.parse(JSON.stringify(this.app.options.games[i]));
          return this.game;
        }
      }
    }

    //No game to load, must create one
    console.info(`Load failed (${game_id} not found), so creating new game`);
    console.info(JSON.parse(JSON.stringify(this.app.options.games)));

    //we don't have a game with game_id stored in app.options.games
    this.game = this.newGame(game_id);
    this.saveGame(this.game.id);

    return this.game;
  }

  newGame(game_id = null) {
    console.log("=====CREATING NEW GAME ID: " + game_id);
    if (!game_id) {
      game_id = this.app.crypto.hash(Math.random().toString(32)); //Returns 0.19235734589 format. We never want this to happen!
      //game_id = this.app.crypto.hash(Math.random());
      //console.log("new id -- " + game_id);
    }
    //console.trace("Creating New Game","ID = "+game_id);
    let game = {};
    game.id = game_id;
    game.confirms_needed = [];
    game.crypto = "";
    game.crypto_auto_settle = 0;
    game.player = 1;
    game.players = [];
    game.opponents = []; //Is this not redundanct?
    game.keys = [];
    game.players_needed = 1; //For when the Arcade (createGameTXfromOptionsGame)
    game.accepted = []; //Not clear what this was originally for, but is now a master list of players to receive game moves
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
    game.observer_mode = 1;
    game.saveGameState = 1;

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
      if (!this.game.id) {
        this.game.id = this.app.crypto.hash(new Date().getTime());
      }
      this.game.dice = this.app.crypto.hash(this.game.id);
    }
    console.info("Initialize Dice 2:" + this.game.dice);
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

  returnGameType() {
    let key_words = this.categories.replace("Games ", "").split(" ");
    return key_words.reverse().join(" ");
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
    var suits = ["S", "C", "H", "D"];
    let indexCt = 1;
    for (let i = 0; i < 4; i++) {
      for (let j = 1; j <= 13; j++) {
        let cardImg = `${suits[i]}${j}`;
        deck[indexCt.toString()] = { name: cardImg }; /*need to make this shit consistent*/
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
  newDeck() {
    let deck = {};
    deck.cards = {};
    deck.crypt = [];
    deck.keys = [];
    deck.hand = [];
    deck.xor = "";
    deck.discards = {};
    deck.removed = {};
    return deck;
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

    this.game.status = str;

    if (!this.browser_active) {
      return;
    }

    try {
      if (this.useHUD) {
        this.hud.updateStatus(str);
      } else {
        document.querySelectorAll(".status").forEach((el) => {
          el.innerHTML = str;
        });
        if (document.getElementById("status")) {
          document.getElementById("status").innerHTML = str;
        }
      }
    } catch (err) {
      console.warn("Error Updating Status: ignoring: " + err);
    }
  }

  updateObserverStatus(str) {
    if (!this.observer) {
      return;
    }

    try {
      let statusBox = document.getElementById("obstatus");
      if (statusBox) {
        statusBox.innerHTML = sanitize(str);
        setTimeout(() => {
          statusBox.innerHTML = "";
        }, 1500);
      }
    } catch (err) {
      console.error(err);
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
    } catch (err) { }
  }

  //
  // OBSERVER MODE - return keystate prior to move (hand, etc.)
  //
  // JSON.parse(JSON.stringify(this.game));
  // JSON.parse(JSON.stringify(this.game_state_pre_move));
  returnGameState(game_clone) {
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

  returnPlayerSelectHTML() {
    let html = "";
    if (this.minPlayers === this.maxPlayers) {
      html = `<input type="hidden" class="game-wizard-players-select" name="game-wizard-players-select" value="${this.minPlayers}">`;
      html += this.returnSingularGameOption();
    } else {
      html += `<div class="overlay-input"><select class="game-wizard-players-select" name="game-wizard-players-select">`;
      for (let p = this.minPlayers; p <= this.maxPlayers; p++) {
        html += `<option value="${p}" ${p === this.minPlayers ? "selected default" : ""
          }>${p} player</option>`;
      }
      html += `</select></div>`;

      if (this.opengame) {
        html += `
          <input type="hidden" name="game-wizard-players-select-max" value="${this.maxPlayers}">
          <div class="saito-labeled-input">
            <label for="open_table">Allow additional players</label>
            <input type="checkbox" name="open_table" checked/>          
          </div>`;

        /*html += `<select class="game-wizard-players-select" name="game-wizard-players-select-max">`;
        for (let p = this.minPlayers; p <= this.maxPlayers; p++) {
          html += `<option value="${p}" ${(p===this.maxPlayers)?"selected default":""}>${p} max</option>`;
        }
        html += `</select>`;
        */
      }
    }

    return html;
  }

  /**
   * Advanced options interface in Arcade creates an overlay with the returned html
   * Can use <div class="overlay-input"></div> to neatly group options
   */
  returnGameOptionsHTML() {
    return "";
  }

  returnDefaultGameOptions() {
    let playerOptions = this.returnPlayerSelectHTML();
    let advancedOptions = this.returnGameOptionsHTML();

    //Create (hidden) the advanced options window
    let metaOverlay = new SaitoOverlay(this.app, this, false, false);
    metaOverlay.show(`<form>${playerOptions}${advancedOptions}</form>`);
    metaOverlay.hide();

    let options = { game: this.name };
    document.querySelectorAll("form input, form select").forEach((element) => {
      if (element.type == "checkbox") {
        if (element.checked) {
          options[element.name] = 1;
        }
      } else if (element.type == "radio") {
        if (element.checked) {
          options[element.name] = element.value;
        }
      } else {
        options[element.name] = element.value;
      }
    });

    metaOverlay.remove();
    return options;
  }

  returnCryptoOptionsHTML(values = null) {
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

    for (let i = 1; i < values.length; i++) {
      html += `<option value="${values[i]}" >${values[i]}</option>`;
    }
    html += `</select></div>`;

    return html;
  }

  /**
   * Semi-Advanced options interface in Arcade allows 2 player games to elevate a separate option in lieu of # players
   * Should be a <select>
   */
  returnSingularGameOption() {
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

    for (let i in options) {
      if (options[i] != "") {
        let output_me = 1;
        if (i == "clock" && options[i] == 0) {
          output_me = 0;
        }
        if (i == "observer" && options[i] != "enable") {
          output_me = 0;
        }
        if (i == "league_id") {
          output_me = 0;
        }
        if (i == "league_name") {
          output_me = 0;
          sgo["league"] = `<span class="saito-league">${options[i]}</span>`;
        }
        if (i == "open_table") {
          if (options[i]) {
            sgo["max players"] = options["game-wizard-players-select-max"];
          }
          output_me = 0;
        }
        if (i.includes("game-wizard-players")) {
          output_me = 0;
        }
        if (i == "game") {
          output_me = 0;
        }
        if (i == "crypto") {
          output_me = 0;
          crypto = options[i]; //Don't display but save this info
        }
        if (i == "stake") {
          output_me = 0;
          if (crypto && parseFloat(options["stake"]) > 0) {
            sgo["stake"] = options["stake"] + " " + crypto;
          }
        }

        if (i == "desired_opponent_publickey") {
          output_me = 0;
          sgo["invited player"] = this.app.browser.returnAddressHTML(options[i]);
        }

        if (output_me == 1) {
          sgo[i] = options[i];
        }
      }
    }

    return sgo;
  }

  /*
   * DEPRECATED -- It was a way to reorganize the options read from HTML and better package it,
   * However, the few game modules that implemented it didn't make any meaningful difference, but introduced errors
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
  attachAdvancedOptionsEventListeners() {
    let crypto = document.getElementById("crypto");
    let stakeInput = document.getElementById("stake_input");
    if (crypto && stakeInput) {
      crypto.onchange = () => {
        if (crypto.value) {
          stakeInput.style.display = "block";
        } else {
          stakeInput.style.display = "none";
        }
      };
    }
    return;
  }

  prependMove(mv) {
    if (mv) {
      this.moves.unshift(mv);
    }
  }

  addMove(mv) {
    if (mv) {
      this.moves.push(mv);
    }
  }

  removeMove() {
    return this.moves.pop();
  }

  endTurn(nexttarget = 0) {
    let extra = {};
    this.game.turn = this.moves;
    //this.game.halted = 0;
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

  updateHudCardStatus(message, include_back_button = false) {
    if (document.querySelector(".status-header") && document.querySelector("#status-cardbox")) {
      this.app.browser.replaceElementBySelector(
        `<div class="status-header">
            ${include_back_button ? this.back_button_html : ""}
            <span id="status-content">${message}</span>
         </div>`,
        ".status-header");
    } else {
      this.updateStatusAndListCards(message, [], include_back_button);
    }
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
      this.updateStatus(
        `<div id="status-header" class="status-header"><span id="status-content">${message}</span></div>`
      );
      return;
    }

    //console.log("UPDATE STATUS AND LIST CARDS");
    html = `<div class="status-header">
              ${include_back_button ? this.back_button_html : ""}
            <span id="status-content">${message}</span>
            </div>`;

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

  async updateStatusWithNewDeal(message, deckid = 0) {
    // OBSERVER MODE
    if (this.game.player == 0) {
      this.updateStatus(`<div id="status-header" class="status-header"><span id="status-content">${message}</span></div>`);
      return;
    }

    //console.log("UPDATE STATUS AND ANIMATE CARDS");

    html = `<div class="status-header"><span id="status-content">${message}</span></div>`;
    html += `<div class="status-cardbox freshdeal" id="status-cardbox">${this.returnDoubleSidedCardList([], deckid)}</div>`;

    this.updateStatus(html);

    const timeout = ms => new Promise(res => setTimeout(res, ms));


    let hudCards = document.querySelectorAll(".freshdeal .flippable-card");
    /*for (card of hudCards) {
      card.style.opacity = 1;
      await timeout(150);
    }*/

    for (card of hudCards) {
      $(card).addClass("flipped");
      await timeout(300);
    }


  }

  /**
   *  Update Status (in HUD) and include a graphical display/textual description of cards (either provided or in one's hand)
   *  @param message - text (non-HTML formatted message) to insert in the (HUD) status
   *  @param optionHTML - an html list of actions a user can take
   *
   */
  updateStatusWithOptions(message = "", optionHTML = "", include_back_button = false) {
    //if (this.game.player == 0){
    // this.updateStatus(`<div id="status-header" class="status-header"><span id="status-content">${message}</span></div>`);
    // return;
    // }

    let html = `<div class="status-header">`;
    if (include_back_button) {
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
    if (this.useCardbox) {
      this.changeable_callback = mycallback;
      this.cardbox.hide(1);
      this.cardbox.attachCardEvents();
    }
  }

  returnCardList(cardarray = [], deckid = 0) {
    if (cardarray.length === 0) {
      cardarray = this.game.deck[deckid].hand; //Keys to the deck object
    }

    if (cardarray.length === 0) {
      console.warn("No cards to render...");
      return "";
    }

    //console.log("cardarray length in returnCardList: " + cardarray.length);

    let html = "";
    if (this.interface === 2) {
      //text
      for (i = 0; i < cardarray.length; i++) {
        html += this.returnCardItem(cardarray[i], deckid);
      }
      return html;
    } else {
      for (i = 0; i < cardarray.length; i++) {
        //
        // TODO : change id to unique identifier (indexed on card array / which might be hand)
        // move deck's card id into data-id slot and then update ALL the games!
        //
        html += `<div id="${cardarray[i]}" class="card hud-card ${cardarray[i]}">${this.returnCardImage(
          cardarray[i],
          deckid
        )}</div>`;
      }
      return html;
    }
  }


  returnCardItem(card, deckid = 0) {
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

    //console.log("STILL IN RETURNCARDIMAGE OLD");
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

  timeout(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  /*
  Timer = delay between animation steps (not before or after)
  */
  async runAnimationQueue(timer = 50) {

    if (this.animationSequence.length == 0) {
      //console.log("Animation queue already empty");
      return;
    }
    //console.log(`Sequencing ${this.animationSequence.length} Animations`);

    this.game.halted = 1;

    while (this.animationSequence.length > 0) {
      let nextStep = this.animationSequence.shift();
      let { callback, params } = nextStep
      //console.log("Animation: ", JSON.stringify(params));
      if (callback) {
        callback.apply(this, params);
      } else {
        if (nextStep.delay) {
          await this.timeout(nextStep.delay);
        }
      }

      if (this.animationSequence.length > 0) {
        await this.timeout(timer);
      } else {
        //console.log("Animation Sequence Finished");
        return;
      }
    }
  }




  copyGameElement(target) {
    let target_obj = (typeof target === "string") ? document.querySelector(target) : target;

    if (!target_obj) {
      console.warn("Objects not found! ", target);
      return null;
    }

    let source_stats = target_obj.getBoundingClientRect();

    //Find a unique ID for our container
    let i = 0;
    for (let helper of document.querySelectorAll(".animated_elem")) {
      let temp_id = helper.id.replace("ae", "");
      if (parseInt(temp_id) >= i) {
        i = parseInt(temp_id) + 1;
      }
    }

    let divid = "ae" + i;

    //Create temporary container
    this.app.browser.addElementToDom(`<div id="${divid}" class="animated_elem"></div>`);

    //Set properties
    let this_helper = document.getElementById(`${divid}`);
    this_helper.style.top = `${source_stats.top}px`;
    this_helper.style.left = `${source_stats.left}px`;
    this_helper.style.height = `${source_stats.height}px`;
    this_helper.style.width = `${source_stats.width}px`;
    this_helper.style.zIndex = 100 + i;

    let as = `${this.animationSpeed / 1000}s`;
    this_helper.style.transition = `left ${as}, top ${as}, width ${as}, height ${as}`;

    //Fall back if we haven't defined the hidden class 
    target_obj.style.visibility = "hidden";

    //Copy the element we want to move
    let clone = target_obj.cloneNode(true);
    clone.id = "";

    //Hide the original (We make the copy so that any flex/grid layouts don't suddenly snap out of place)
    //target_obj.classList.add("invisible");
    target_obj.classList.add("copied_elem");

    //Insert copy in the element that moves
    this_helper.append(clone);
    clone.style.visibility = null;

    return divid;
  }

  /**
  *  @param HTML the html for the object to create
  *  @param origin_reference a selector for an element in the DOM that will be there reference for the initial top/left of the created element
  *  @param dimension_reference (optional) a selector for an element to serve as the initial reference for height/width of the created element
  */
  createGameElement(html, origin_reference, dimension_reference = null) {

    if (!document.querySelector(origin_reference) || (dimension_reference && !document.querySelector(dimension_reference))) {
      return null;
    }

    let source_stats = document.querySelector(origin_reference).getBoundingClientRect();
    let destination_stats = (dimension_reference) ? document.querySelector(dimension_reference).getBoundingClientRect() : source_stats;

    //Find a unique ID for our container
    let i = 0;
    for (let helper of document.querySelectorAll(".animated_elem")) {
      let temp_id = helper.id.replace("ae", "");
      if (parseInt(temp_id) >= i) {
        i = parseInt(temp_id) + 1;
      }
    }

    let divid = "ae" + i;

    this.app.browser.addElementToDom(`<div id="${divid}" class="animated_elem">${html}</div>`);

    let this_helper = document.getElementById(`${divid}`);
    this_helper.style.top = `${source_stats.top}px`;
    this_helper.style.left = `${source_stats.left}px`;
    this_helper.style.height = `${destination_stats.height}px`;
    this_helper.style.width = `${destination_stats.width}px`;
    this_helper.style.zIndex = 100 + i;

    let as = `${this.animationSpeed / 1000}s`;
    this_helper.style.transition = `left ${as}, top ${as}, width ${as}, height ${as}`;

    return divid;
  }

  /*
  Useful Options: 
      1) callback -- function to run on moving object at beginning of motion
      2) resize -- resize object to that of it's destination
      3) insert -- append object in destination at end of animation

  */
  moveGameElement(animatedObjId, destination, options, callback = null) {
    let game_self = this;

    let destination_obj = (typeof destination === "string") ? document.querySelector(destination) : destination;

    if (!destination_obj) {
      console.warn("Object not found: destination", destination);
      return null;
    }

    this.animation_queue.push(animatedObjId);

    let destination_stats = destination_obj.getBoundingClientRect();

    $(`#${animatedObjId}`).delay(10).queue(function () {
      //Flexible callback to add effect during move
      if (options?.resize) {
        $(this).children().css("width", "100%");
        $(this).css({
          width: `${destination_stats.width}px`,
          height: `${destination_stats.height}px`,
        });
      }

      $(this).children().css("visibility", "");
      if (options?.callback) {
        options.callback(animatedObjId);
      }

      $(this).css({
        top: `${destination_stats.top}px`,
        left: `${destination_stats.left}px`,
      }).dequeue();
    }).delay(game_self.animationSpeed).queue(function () {
      let item = this;
      if (options?.insert) {
        item = $(this).children()[0]
        //console.log("Appending element:", JSON.stringify(item));
        document.querySelector(destination).append(item);
      }

      $(this).addClass("done"); //Still used???
      game_self.animation_queue.shift();

      if (game_self.animation_queue.length == 0 && game_self.animationSequence.length == 0) {

        $(".copied_elem").remove();

        if (callback) {
          //console.log("MoveGameElement finished, running callback");  
          callback(item);
        } else {
          //console.log("MoveGameElement finished, but no callback");  
        }
      } else {
        //console.log("MoveGameElement finished, but more animation");
      }

      $(this).dequeue();
    });

  }


  /**
   * Get the player name from the this.game.player
   */
  identifyPlayer(player) {
    let name = this.game.players[player - 1];
    name = this.app.keychain.returnUsername(name);

    if (!name) {
      name = this.app.keychain.returnIdentifierByPublicKey(this.game.players[player - 1]);
    }
    if (name != "") {
      if (name.indexOf("@") > 0) {
        name = name.substring(0, name.indexOf("@"));
      } else {
        name = name.substring(0, 10) + "...";
      }
    } else {
      name = "Player " + player;
    }
    return name;
  }

  identifyPlayerByPublicKey(pkey) {
    let name = this.app.keychain.returnUsername(pkey);

    if (!name) {
      name = this.app.keychain.returnIdentifierByPublicKey(pkey);
    }
    if (name != "") {
      if (name.indexOf("@") > 0) {
        name = name.substring(0, name.indexOf("@"));
      } else {
        name = name.substring(0, 10) + "...";
      }
    } else {
      name = `Player ${this.game.players.indexOf(pkey) + 1}`;
    }
    return name;
  }

  /**
   *
   */
  removeCardFromHand(card, moveToDiscard = false) {
    for (let z = 0; z < this.game.deck.length; z++) {
      for (i = 0; i < this.game.deck[z].hand.length; i++) {
        if (this.game.deck[z].hand[i] === card) {
          if (moveToDiscard) {
            this.game.deck[z].discards[card] = this.game.deck[z].cards[card];
          }
          this.game.deck[z].hand.splice(i, 1);
          return;
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
    let html = `<ul><li class="textchoice acknowledge" id="confirmit">I understand...</li></ul>`;

    try {
      this.updateStatusWithOptions(msg, html);
      this.attachCardboxEvents();
      document.querySelectorAll(".acknowledge").forEach((el) => {
        el.onclick = (e) => {
          // if player clicks multiple times, don't want callback executed multiple times
          document.querySelectorAll(".acknowledge").forEach((el) => { el.onclick = null; });
          mycallback();
        };
      });
    } catch (err) {
      console.error("Error with ACKWNOLEDGE notice!: " + err);
    }

    return 0;
  }

  nonPlayerTurn() {
    //console.log("it is not my turn!");
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

  /**
   * Check what moves are pending in my wallet and if any of them are future moves
   * (I sent, but haven't received and processed) return 1
   */
  hasGameMovePending() {
    for (let i = 0; i < this.app.wallet.wallet.pending.length; i++) {
      let tx = new saito.default.transaction();
      tx.deserialize_from_web(this.app, this.app.wallet.wallet.pending[i]);
      let txmsg = tx.returnMessage();
      if (txmsg && txmsg.module == this.name) {
        if (txmsg.game_id === this.game?.id) {
          if (txmsg?.step?.game) {
            if (txmsg.step.game > this.game.step.players[tx.transaction.from[0].add]) {
              return 1;
            } else {
              //console.log("OLD MOVE in PENDING TXS:",JSON.parse(JSON.stringify(txmsg)));
            }
          }
        }
      }
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
    if (!this.useClock) {
      return;
    }

    clearInterval(this.clock_timer); //Just in case
    //console.log("Clock Limit: " + this.game.clock_limit);
    //console.log("Time spent so far: " + this.game.clock_spent);

    //Refresh the clock every second
    this.clock_timer = setInterval(() => {
      let t = new Date().getTime();
      let time_on_clock =
        this.game.clock_limit - (t - this.time.last_received) - this.game.clock_spent;
      if (time_on_clock <= 0) {
        clearInterval(this.clock_timer);
        this.clock.displayTime(0);
        this.resignGame(this.game.id, "time out");
      }
      this.clock.displayTime(time_on_clock);
    }, 1000);
  }

  stopClock() {
    if (!this.useClock) {
      return;
    }
    clearInterval(this.clock_timer);

    //
    // game timer
    //
    this.time.last_sent = new Date().getTime();
    if (this.time.last_sent > this.time.last_received + 1000) {
      this.game.clock_spent += this.time.last_sent - this.time.last_received;
      let time_left = this.game.clock_limit - this.game.clock_spent;
      //console.log("TIME LEFT: " + time_left);
      this.clock.displayTime(time_left);
    }

  }

  reshuffleNotification(deckidx = 1) {
    this.updateLog("Shuffling discards back into the deck...");
    return 1;
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
    this.commands = [];
    //
    // add stuff to queue
    //
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "SETVAR") {
        if (gmv[1]) {
          if (gmv[3]) {
            if (gmv[4]) {
              if (gmv[5]) {
                game_self.game[gmv[1]][gmv[2]][gmv[3]][gmv[4]] = gmv[5];
              } else {
                game_self.game[gmv[1]][gmv[2]][gmv[3]] = gmv[4];
              }
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
        //console.log("LOAD not supported in game engine - see saveload module");
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
            i = this.app.options.games.length + 1;
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
        game_self.updateLog(
          `<p></p>This game has been saved. To restore from this point, all players should visit the following URL:<p></p>&nbsp;<p></p>${loadurl}/load?game_id=${game_self.game.id}<p></p>&nbsp;<p></p>`
        );

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

        game_self.saveGame(game_self.game.id);

        if (game_self.game.player == 0) {
          game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
          game_self.updateStatusAndListCards(notice);
          return 1;
        }

        game_self.game.halted = 1;
        let my_specific_game_id = game_self.game.id;

        game_self.playerAcknowledgeNotice(notice, function () {
          if (game_self.game.id != my_specific_game_id) {
            game_self.game = game_self.loadGame(my_specific_game_id);
          }
          game_self.acknowledge_overlay.hide();
          game_self.updateStatus(" acknowledged...");
          game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
          game_self.restartQueue();

          return 1;
        });

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
      if (gmv[0] === "ROUNDOVER") {
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
        let winner = JSON.parse(gmv[1]);
        let losers = gmv[2] ? JSON.parse(gmv[2]) : null;
        let players = [];
        if (losers) {
          for (let p of winner.concat(losers)) {
            if (!players.includes(p)) {
              players.push(p);
            }
          }
        } else {
          players = game_self.game.players;
        }

        console.info("ROUNDOVER : " + players);
        console.info(JSON.parse(JSON.stringify(game_self.game.options)));
        if (game_self.game.players[0] == game_self.app.wallet.returnPublicKey()) {
          let newtx = game_self.app.wallet.createUnsignedTransactionWithDefaultFee();
          newtx.transaction.to.push(
            new saito.default.slip(game_self.app.wallet.returnPublicKey(), 0.0)
          );
          newtx.msg = {
            request: "roundover",
            game_id: game_self.game.id,
            winner,
            players: players.join("_"),
            module: game_self.game.module,
          };

          if (game_self.game.options?.league_id) {
            newtx.msg.league_id = game_self.game?.options?.league_id;
          }
          console.info(newtx.msg);

          newtx = game_self.app.wallet.signTransaction(newtx);

          //Send message
          game_self.app.network.propagateTransaction(newtx);
        }
        return 1;
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
        } catch (err) { }
        game_self.game.observer_mode = 1;
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

        console.info("ready to resolve queue: " + resolve_queue);
        console.info(JSON.stringify(game_self.game.confirms_needed));

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
          console.info("is anyone left to move: " + anyone_left_to_move);
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

    //
    // [PRERESOLVE \t cmd]
    //
    // inserts cmd in queue for execution after resolve clears
    //
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "PRERESOLVE") {
        //
        // resolve coming from specific player
        //
        if (gmv[1]) {
          for (let i = game_self.game.queue.length - 1; i >= 0; i--) {
            let lmv = game_self.game.queue[i].split("\t");
            if (lmv[0] === "RESOLVE") {
              game_self.game.queue.splice(i - 1, 0, gmv[1]);
              break;
            }
          }
        }
        return 1;
      }
      return 1;
    });

    /*
    READY is the signal that the game is ready to play, i.e. all the shuffling and stuff is done and
    players can move from the Arcade to the game page. Therefore, we want it to emit a 0 and stop queue
    execution so that players don't get out of sync by clicking "start game" while stuff is still happening.
    However, there are situations where we are in the game and run into a READY (observer, for one),
    so we don't want to stop queue execution in that case.
    */
    this.commands.push((game_self, gmv) => {
      if (gmv[0] == "READY") {
        game_self.game.initializing = 0;
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
        game_self.saveGame(game_self.game.id);
        //Just cut, save, and move on if in the game page
        if (game_self.browser_active) {
          return 1;
        } else {
          //Otherwise we want to pause game processing
          game_self.initialize_game_run = 0; //Prevent processing of any incoming moves (until we navigate to the game page)
          console.info("GAME READY, emit signal");
          game_self.app.connection.emit("arcade-game-ready-render-request", { name: game_self.name, slug: game_self.returnSlug(), id: game_self.game.id });

          return 0;
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
      if (gmv[0] === "SHUFFLEDISCARDS") {
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
        game_self.updateLog(
          `Contents of Deck: ${JSON.stringify(game_self.game.deck[deckidx - 1].crypt)}`
        );
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
              if (!game_self.game.deck[deckidx - 1].cards[newcard]) {
                console.warn("Card decryption error!");
                console.warn("Card: " + newcard, "deck:", JSON.parse(JSON.stringify(game_self.game.deck[deckidx - 1])));
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
        // everyone purges their spent keys
        //
        if (game_self.game.issued_keys_deleted == 0) {
          // observer mode -- has crypt, but not keys
          if (game_self.game.player == 0) {
            game_self.game.deck[deckidx - 1].crypt.splice(0, cards);
            game_self.game.issued_keys_deleted = 1;
            return 1;
          }

          if (game_self.game.deck[deckidx - 1].keys.length <= cards) {
            game_self.game.deck[deckidx - 1].keys = [];
            game_self.game.deck[deckidx - 1].crypt = [];
          } else {
            //Isn't this backwards????
            //game_self.game.deck[deckidx - 1].keys = game_self.game.deck[deckidx - 1].keys.splice(cards,game_self.game.deck[deckidx - 1].keys.length - cards);
            //game_self.game.deck[deckidx - 1].crypt = game_self.game.deck[deckidx - 1].crypt.splice(cards,game_self.game.deck[deckidx - 1].crypt.length - cards);
            game_self.game.deck[deckidx - 1].keys.splice(0, cards);
            game_self.game.deck[deckidx - 1].crypt.splice(0, cards);
            if (game_self.game.deck[deckidx - 1].keys.length !== game_self.game.deck[deckidx - 1].crypt.length) {
              console.warn("Key-Crypt mismatch:", JSON.parse(JSON.stringify(game_self.game.deck[deckidx - 1])));
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


        console.info(`Dealing ${cards} cards to ${recipient}. Deck has ${game_self.game.deck[deckidx - 1].crypt.length} cards`);

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
        if (this.game.player > 0) {
          if (game_self.game.deck[deckidx - 1].keys.length < cards) {
            cards = game_self.game.deck[deckidx - 1].keys.length;
          }
        }

        // if the total players is 1 -- solo game
        if (total_players == 1) {
          game_self.game.queue.push("RESOLVEDEAL\t" + deckidx + "\t" + recipient + "\t" + cards);
        } else {
          game_self.game.queue.push("RESOLVEDEAL\t" + deckidx + "\t" + recipient + "\t" + cards);
          for (let i = 1; i <= total_players; i++) {
            if (i != recipient) {
              //The recipient decodes last (without broadcasting their keys so other players cannot snoop)
              game_self.game.queue.push(
                "REQUESTKEYS\t" + deckidx + "\t" + i + "\t" + recipient + "\t" + cards
              );
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
            game_self.updateLog(
              "skipping deal - no cards available and no discards for reshuffling"
            );
          } else {
            game_self.game.queue.push(
              "DEAL\t" + deckidx + "\t" + recipient + "\t" + cards_to_deal_after
            );
            //
            // shuffle in discarded cards
            //
            game_self.game.queue.push("MARKRESHUFFLE\t" + deckidx + "\t" + JSON.stringify(discarded_cards));
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

            if (cards_to_deal_first > 0) {
              game_self.game.queue.push(
                "DEAL\t" + deckidx + "\t" + recipient + "\t" + cards_to_deal_first
              );
            }
          }
        }
      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "MARKRESHUFFLE") {
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
        return game_self.reshuffleNotification(parseInt(gmv[1]), gmv[2]);
      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "PUSHONDECK") {
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
        game_self.game.turn.push(
          `ISSUEKEYS\t${deckidx}\t${sender}\t${recipient}\t${cards}\t${game_self.game.deck[deckidx - 1].keys.length
          }`
        );
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

        if (game_self.game.player == recipient) {
          if (my_deck_length == opponent_deck_length) {
            for (let i = 0; i < cards; i++) {
              if (game_self.game.queue[keyidx + i] != null) {
                game_self.game.deck[deckidx - 1].crypt[i] = game_self.app.crypto.decodeXOR(
                  game_self.game.deck[deckidx - 1].crypt[i],
                  game_self.game.queue[keyidx + i]
                );
              }
            }
          } else {
            console.warn("ISSUEKEYS issue: deck lengths mismatch");
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
              console.warn(
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
            if (
              game_self.app.crypto.verifyMessage(sr[2], sr[3], game_self.game.players[sr[1] - 1]) ==
              true
            ) {
              players.push(sr[1]);
              hashes.push(sr[2]);
            } else {
              console.warn(`SIG DOES NOT VERIFY  ${sr[2]} / ${sr[3]} / ${game_self.game.players[sr[1] - 1]}`);
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
              if (z == game_self.game.player - 1) {
                //should be tested against y, no?
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
          let card_sig = game_self.app.crypto.signMessage(
            game_self.game.spick_card,
            game_self.app.wallet.returnPrivateKey()
          );
          let hash2 = game_self.game.spick_hash;
          let hash2_sig = game_self.app.crypto.signMessage(
            hash2,
            game_self.app.wallet.returnPrivateKey()
          );
          game_self.addMove(
            "SIMULTANEOUS_PICK\t" + game_self.game.player + "\t" + hash2 + "\t" + hash2_sig
          );
          game_self.addMove(
            `SIMULTANEOUS_PICK\t${game_self.game.player}\t${game_self.game.spick_card}\t${card_sig}`
          );
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

        console.info("SIMULTANEOUS_PICK finished..., pruning queue");
        //
        // we have updated so we can remove the SIMULTANEOUS_PICK instructions
        //
        for (let i = game_self.game.queue.length - 1; i >= 0; i--) {
          console.info(game_self.game.queue[i]);
          let sr = game_self.game.queue[i].split("\t");
          if (sr[0] === "SIMULTANEOUS_PICK") {
            game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
          } else {
            break;
          }
        }
        console.info(JSON.parse(JSON.stringify(game_self.game.queue)));
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

        console.info(JSON.parse(JSON.stringify(game_self.game.deck[deckidx - 1])));
        game_self.old_discards = game_self.game.deck[deckidx - 1].discards;
        game_self.old_removed = game_self.game.deck[deckidx - 1].removed;
        game_self.old_cards = {};
        game_self.old_crypt = [];
        game_self.old_keys = [];
        game_self.old_hand = [];

        //What is fhand?
        if (game_self.game.deck[deckidx - 1].fhand) {
          game_self.old_fhand = game_self.game.deck[deckidx - 1].fhand;
        }

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

        while (game_self.game.deck.length < deckidx) {
          game_self.addDeck();
        }

        if (gmv[2] == "push") {
          for (let i = 0; i < game_self.old_hand.length; i++) {
            game_self.game.deck[deckidx - 1].hand.push(game_self.old_hand[i]);
          }
          for (let i = 0; i < game_self.old_crypt.length; i++) {
            game_self.game.deck[deckidx - 1].crypt.push(game_self.old_crypt[i]);
            game_self.game.deck[deckidx - 1].keys.push(game_self.old_keys[i]);
          }
        } else {
          for (let i = game_self.old_hand.length - 1; i >= 0; i--) {
            game_self.game.deck[deckidx - 1].hand.unshift(game_self.old_hand[i]);
          }
          for (let i = game_self.old_crypt.length - 1; i >= 0; i--) {
            game_self.game.deck[deckidx - 1].crypt.unshift(game_self.old_crypt[i]);
            game_self.game.deck[deckidx - 1].keys.unshift(game_self.old_keys[i]);
          }
        }

        for (var b in game_self.old_cards) {
          game_self.game.deck[deckidx - 1].cards[b] = game_self.old_cards[b];
        }

        game_self.game.deck[deckidx - 1].removed = game_self.old_removed;
        game_self.game.deck[deckidx - 1].discards = game_self.old_discards;

        console.info(JSON.parse(JSON.stringify(game_self.game.deck[deckidx - 1])));

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
        //console.info("CARDS START: " + JSON.stringify(game_self.game.queue));
        let deckidx = parseInt(gmv[1]);
        let cryptLength = parseInt(gmv[2]);

        //console.info(deckidx + " --- " + gmv[2]);

        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);

        for (let i = 1; i <= cryptLength; i++) {
          //Adding one to i here so don't have to insert additional -1 term
          let card = game_self.game.queue.pop();
          //if (game_self.game.player != 0) {
          game_self.game.deck[deckidx - 1].crypt[cryptLength - i] = card;

          //}
        }
        //console.info("CARDS END: " + JSON.stringify(game_self.game.queue));
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

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "SAFEPOOLDEAL") {
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
        let deckidx = parseInt(gmv[1]);
        let cards_to_flip = parseInt(gmv[2]);
        let poolidx = parseInt(gmv[3]);

        game_self.game.issued_keys_deleted = 0;
        if (cards_to_flip <= game_self.game.deck[deckidx - 1].crypt.length) {
          game_self.game.queue.push(`POOLDEAL\t${gmv[1]}\t${gmv[2]}\t${gmv[3]}`);
        } else {
          let cards_in_deck = game_self.game.deck[deckidx - 1].crypt.length;
          game_self.game.queue.push(
            `POOLDEAL\t${gmv[1]}\t${cards_to_flip - cards_in_deck}\t${gmv[3]}`
          );
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
          //console.info("First pool resolution");
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
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1); //Remove "ISSUEKEYS"
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
            console.info("Card doesn't need decoding");
          }

          // store card in pool
          game_self.game.pool[poolidx - 1].crypt[i] = nc;
        }
        // processed one set of keys
        game_self.game.pool[poolidx - 1].decrypted++;

        if (cardnum > 0) {
          game_self.game.queue.splice(keyidx, cardnum);
        }

        //
        // if everything is handled, purge old deck data
        //
        if (game_self.game.pool[poolidx - 1].decrypted == decryption_keys_needed) {
          for (let i = 0; i < cardnum; i++) {
            let newcard = game_self.game.pool[poolidx - 1].crypt[i];
            newcard = game_self.app.crypto.hexToString(newcard);
            if (!game_self.game.pool[poolidx - 1].hand.includes(newcard)) {
              game_self.game.pool[poolidx - 1].hand.push(newcard);
            }
            if (!game_self.game.pool[poolidx - 1].cards[newcard]) {
              console.warn("Card decryption error!");
              console.warn("Card: " + newcard, "pool:", JSON.parse(JSON.stringify(game_self.game.pool[poolidx - 1])));
            }
          }
          game_self.game.pool[poolidx - 1].crypt.splice(0, cardnum);
          game_self.game.deck[deckidx - 1].keys.splice(0, cardnum);
          game_self.game.deck[deckidx - 1].crypt.splice(0, cardnum);
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

        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "DECKXOR") {

        let deckidx = parseInt(gmv[1]);
        let playerid = parseInt(gmv[2]);

        if (playerid != game_self.game.player) {
          return 0;
        }
        if (game_self.game.deck[deckidx - 1].xor == "") {
          game_self.game.deck[deckidx - 1].xor = game_self.app.crypto.hash(Math.random());
        }

        for (let i = 0; i < game_self.game.deck[deckidx - 1].crypt.length; i++) {
          game_self.game.deck[deckidx - 1].crypt[i] = game_self.app.crypto.encodeXOR(
            game_self.game.deck[deckidx - 1].crypt[i],
            game_self.game.deck[deckidx - 1].xor
          );
          game_self.game.deck[deckidx - 1].keys[i] = game_self.app.crypto.generateKeys();
        }

        //
        // shuffle the encrypted deck
        //
        game_self.game.deck[deckidx - 1].crypt = game_self.shuffleArray(
          game_self.game.deck[deckidx - 1].crypt
        );

        game_self.game.turn = [];
        game_self.game.turn.push("RESOLVE");
        for (let i = 0; i < game_self.game.deck[deckidx - 1].crypt.length; i++) {
          game_self.game.turn.push(game_self.game.deck[deckidx - 1].crypt[i]);
        }
        game_self.game.turn.push(
          `CARDS\t${deckidx}\t${game_self.game.deck[deckidx - 1].crypt.length}`
        );

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

        game_self.game.turn.push(
          `CARDS\t${deckidx}\t${game_self.game.deck[deckidx - 1].crypt.length}`
        );

        let extra = {};
        game_self.sendMessage("game", extra);

        return 0;
      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === null || gmv[0] == "null") {
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
      }
    });

    /////////////////
    // web3 crypto //
    /////////////////
    // supporting arbitrary third-party crypto modules -- specify receiving address
    //
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "CRYPTOKEY") {
        let playerkey = gmv[1];
        let cryptokey = gmv[2];
        let confsig = gmv[3];

        console.log("~~~~~~~~~~~~~~~~~~");
        console.log("RECEIVED CRYPTOKEY");
        console.log("~~~~~~~~~~~~~~~~~~");
        console.log(playerkey + " - " + cryptokey + " - " + confsig);
        console.log("~~~~~~~~~~~~~~~~~~");

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

        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);

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
        if (gmv[6]) {
          ticker = gmv[6];
        }

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

        //
        // permit users to opt-out of sanity checks
        //
        if (game_self.game.crypto_auto_settle == 1) {
          game_self.app.wallet.sendPayment(
            [sender_crypto_address],
            [receiver_crypto_address],
            [amount],
            ts,
            unique_hash,
            function (robj) {
              if (game_self.game.id != my_specific_game_id) {
                game_self.game = game_self.loadGame(my_specific_game_id);
              }
              game_self.updateLog("payments issued...");
              game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
              game_self.restartQueue();
              return 0;
            },
            ticker
          );
          return 0;

          //
          // by default we want users to approve any wallet-interactions
          //
        } else {

          game_self.crypto_transfer_manager.sendPayment(
            this.app,
            this,
            [sender_crypto_address.split("|")[0]],
            [receiver_crypto_address.split("|")[0]],
            [amount],
            ts,
            ticker,
            function () {
              game_self.app.wallet.sendPayment(
                [sender_crypto_address],
                [receiver_crypto_address],
                [amount],
                ts,
                unique_hash,
                function (robj) {
                  if (game_self.game.id != my_specific_game_id) {
                    game_self.game = game_self.loadGame(my_specific_game_id);
                  }
                  game_self.updateLog("payments issued...");
                  game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
                  game_self.restartQueue();
                  return 0;
                },
                ticker
              );
              return 0;
            }
          );
        }
        return 0;
      }
      return 1;
    });

    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "RECEIVE") {
        let sender = gmv[1];
        let receiver = gmv[2];
        let amount = gmv[3];
        let ts = gmv[4];
        let unique_hash = gmv[5];
        let ticker = game_self.game.crypto;
        if (gmv[6]) {
          ticker = gmv[6];
        }

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

        //
        // we don't need to wait for confirmation if we've already indicated
        // we just want to move ahead. the game engine should not be biased
        // towards forcing a halt in game if people do not want that.
        //
        if (game_self.game_crypto_auto_settle == 1) {
          game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
          return 1;
        } else {
          game_self.crypto_transfer_manager.receivePayment(
            this.app,
            this,
            [sender_crypto_address.split("|")[0]],
            [receiver_crypto_address.split("|")[0]],
            [amount],
            ts,
            ticker,
            function (divname) {
              game_self.app.wallet.receivePayment(
                [sender_crypto_address],
                [receiver_crypto_address],
                [amount],
                ts,
                unique_hash,
                function (robj) {
                  if (document.querySelector(".spinner")) {
                    document.querySelector(".spinner").remove();
                  }
                  $(".game-crypto-transfer-manager-container .hidden").removeClass("hidden");
                  if (divname) {
                    if (robj) {
                      //==1, success
                      divname.textContent = "Success";
                    } else {
                      //==0, failure
                      divname.textContent = "Failed";
                    }
                  }
                  if (game_self.game.id != my_specific_game_id) {
                    game_self.game = game_self.loadGame(my_specific_game_id);
                  }
                  game_self.updateLog("payments received...");
                  game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
                  game_self.restartQueue();
                  return 0;
                },
                ticker,
                -1
              );
              return 0;
            }
          );
          return 0;
        }
      }
      return 1;
    });

    //
    // provides a way for games to enable in-game crypto
    //
    // if i receive this, a player in the game is proposing a crypto-game
    // and i should respond in some capacty.
    //
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "STAKE") {
        let ticker = gmv[1];
        let stake = gmv[2];
        let ts = parseInt(gmv[3]);
        let sigs = JSON.parse(gmv[4]);
        let auths = 0;
        let first_non_verifier_idx = -1;

        //
        // players can update the timestamp to NOSTAKE to unequivocably reject
        // the request to switch to a staked game.
        //
        if (ts == "NOSTAKE") {
          game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
          return 1;
        }

        //
        // otherwise, we check to see if all of the sigs exist and if they don't
        // we ask the players to authorize or reject one-by-one.
        //
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);

        try {
          for (let i = 0; i < game_self.game.players.length; i++) {
            let msg_to_verify = `${ts} ${ticker} ${stake} ${game_self.game.id}`;
            if (sigs[i] !== "") {
              if (
                game_self.app.crypto.verifyMessage(
                  msg_to_verify,
                  sigs[i],
                  game_self.game.players[i]
                ) === true
              ) {
                auths++;
              } else {
                if (first_non_verifier_idx == -1) {
                  first_non_verifier_idx = i;
                }
              }
            } else {
              first_non_verifier_idx = i;
            }
          }
        } catch (err) {
          console.log("err: " + err);
        }

        if (auths == game_self.game.players.length) {
          game_self.updateLog("Crypto Activated: " + stake + " " + ticker);
          game_self.decimal_precision = 8;
          game_self.game.options.crypto = ticker;
          game_self.game.options.stake = stake;
          game_self.game.crypto = ticker;
          game_self.game.stake = stake;
          // the game can initialize anything it needs
          game_self.initializeGameStake(ticker, stake);
        } else {
          if (game_self.game.player - 1 == first_non_verifier_idx) {
            //
            // auto-accept
            //
            game_self.crypto_transfer_manager.approveGameStake(
              this.app,
              this,
              ticker,
              stake,
              sigs,
              ts,
              function () { }
            );
          } else {
            this.updateStatus("Waiting for Others to Accept");
          }
          return 0;
        }
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

  payWinners(winner) {
    if (Array.isArray(winner)) {
      let num_winners = winner.length;
      let amount_to_send = (this.game.stake / num_winners).toFixed(8);
      for (let i = 0; i < this.game.players.length; i++) {
        if (!winner.includes(this.game.players[i])) {
          for (let w of winner) {
            this.payWinner(this.game.players[i], w, amount_to_send);
          }
        }
      }
    } else {
      for (let i = 0; i < this.game.players.length; i++) {
        if (this.game.players[i] !== winner) {
          this.payWinner(this.game.players[i], winner, this.game.stake.toString());
        }
      }
    }
  }

  payWinner(sender, receiver, amount) {
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

    if (this.app.wallet.returnPublicKey() === sender) {
      this.crypto_transfer_manager.sendPayment(
        this.app,
        this,
        [sender_crypto_address.split("|")[0]],
        [receiver_crypto_address.split("|")[0]],
        [amount],
        ts,
        ticker,
        function () {
          game_self.app.wallet.sendPayment(
            [sender_crypto_address],
            [receiver_crypto_address],
            [amount],
            ts,
            unique_hash,
            function (robj) {
              siteMessage(game_self.name + ": payment issued", 5000);
            },
            ticker
          );

          return 0;
        }
      );
    } else if (this.app.wallet.returnPublicKey() === receiver) {
      game_self.crypto_transfer_manager.receivePayment(
        this.app,
        this,
        [sender_crypto_address.split("|")[0]],
        [receiver_crypto_address.split("|")[0]],
        [amount],
        ts,
        ticker,
        function (divname) {
          game_self.app.wallet.receivePayment(
            [sender_crypto_address],
            [receiver_crypto_address],
            [amount],
            ts,
            unique_hash,
            function (robj) {
              //Update crypto-transfer-manager
              if (document.querySelector(".spinner")) {
                document.querySelector(".spinner").remove();
              }
              $(".game-crypto-transfer-manager-container .hidden").removeClass("hidden");
              if (divname) {
                if (robj) {
                  //==1, success
                  divname.textContent = "Success";
                } else {
                  //==0, failure
                  divname.textContent = "Failed";
                }
              }
              return 0;
            },
            ticker,
            -1
          );

          return 0;
        }
      );
    }
  }

  //
  // games can override this function if they want to support crypto integration and
  // have any module-specific initialization work to do.
  //
  initializeGameStake(crypto, stake) { }

  //
  // this allows players to propose a crypto/web3 stake for the game. it will trigger
  // the STAKE command among players who have not INIT'd or APPROVED the shift allowing
  // them to accept / reject the idea.
  //
  proposeGameStake(ticker = "", stake = "", sigs = [], ts = new Date().getTime()) {
    while (sigs.length < this.game.players.length) {
      sigs.push("");
    }
    sigs[this.game.player - 1] = this.app.wallet.signMessage(
      `${ts} ${ticker} ${stake} ${this.game.id}`
    );

    this.game = this.game_state_pre_move;
    this.game.turn = [];
    this.moves = [];

    //
    // remove STAKE instruction
    //
    if (this.game.queue.length) {
      let pmv = this.game.queue[this.game.queue.length - 1];
      let pm = pmv.split("\t");
      if (pm[0] === "STAKE") {
        this.game.queue.splice(this.game.queue.length - 1, 1);
      }
    }

    this.addMove("STAKE\t" + ticker + "\t" + stake + "\t" + ts + "\t" + JSON.stringify(sigs));
    this.endTurn();

    //
    // need to reload to avoid issues / save-state errors
    //
    setTimeout(function () {
      location.reload();
    }, 500);
  }
  displayDice() {
    //Should move to general gametools at some point

    try {
      //$('#diceroll').fadeIn();

      let obj = document.querySelector("#diceroll");
      if (obj) {
        let html = "";

        for (let d of this.game.state.lastroll) {
          html += `<div class="die">`;
          switch (d) {
            case 1:
              html += `<svg viewbox="0 0 200 200"><rect fill="red" width="200" height="200" rx="25"/>
                    <circle fill="white" cx="100" cy="100" r="25"/></svg>`;
              break;
            case 2:
              html += `<svg viewbox="0 0 200 200"><rect fill="red" width="200" height="200" rx="25"/>
                    <circle fill="white" cx="66" cy="66" r="25"/>
                    <circle fill="white" cx="133" cy="133" r="25"/></svg>`;
              break;
            case 3:
              html += `<svg viewbox="0 0 200 200"><rect fill="red" width="200" height="200" rx="25"/>
                    <circle fill="white" cx="50" cy="50" r="25"/>
                    <circle fill="white" cx="100" cy="100" r="25"/>
                    <circle fill="white" cx="150" cy="150" r="25"/></svg>`;
              break;
            case 4:
              html += `<svg viewbox="0 0 200 200"><rect fill="red" width="200" height="200" rx="25"/>
                    <circle fill="white" cx="55" cy="55" r="25"/>
                    <circle fill="white" cx="55" cy="145" r="25"/>
                    <circle fill="white" cx="145" cy="55" r="25"/>
                    <circle fill="white" cx="145" cy="145" r="25"/></svg>`;
              break;
            case 5:
              html += `<svg viewbox="0 0 200 200"><rect fill="red" width="200" height="200" rx="25"/>
                    <circle fill="white" cx="50" cy="50" r="25"/>
                    <circle fill="white" cx="50" cy="150" r="25"/>
                    <circle fill="white" cx="100" cy="100" r="25"/>
                    <circle fill="white" cx="150" cy="50" r="25"/>
                    <circle fill="white" cx="150" cy="150" r="25"/></svg>`;
              break;
            case 6:
              html += `<svg viewbox="0 0 200 200"><rect fill="red" width="200" height="200" rx="25"/>
                  <circle fill="white" cx="55" cy="40" r="25"/>
                  <circle fill="white" cx="55" cy="100" r="25"/>
                  <circle fill="white" cx="55" cy="160" r="25"/>
                  <circle fill="white" cx="145" cy="40" r="25"/>
                  <circle fill="white" cx="145" cy="100" r="25"/>
                  <circle fill="white" cx="145" cy="160" r="25"/></svg>`;
              break;
            default:
              html += `<svg viewbox="0 0 200 200"><rect fill="red" width="200" height="200" rx="25"/></svg>`;
          }
          html += `</div>`;
        }
        obj.innerHTML = html;
      }
    } catch (err) { }
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
