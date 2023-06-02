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

const GameQueue = require("./gametemplate-queue");

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
let GameObserverControls = require("./../saito/ui/game-observer/game-observer");
let GameRaceTrack = require("./../saito/ui/game-racetrack/game-racetrack");
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
    // UI components
    //
    this.ui_rules = "";
    this.ui_options = "";
    this.ui_advanced_options = "";

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
    this.can_bet = 1; // if it is possible to win this game

    this.request_no_interrupts = true;
    this.acknowledge_text = "I understand...";

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
    this.observerControls = new GameObserverControls(app, this);
    this.racetrack = new GameRaceTrack(app, this);

    this.enable_observer = true;

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
    this.statistical_unit = "game";

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

  returnCardHeight(card_width = 1) {
    return card_width * this.card_height_ratio;
  }

  render(app) {

    //
    // sets relay to notify others we are busy playing a game
    //
    app.connection.emit("set-relay-status-to-busy", {});

    if (this.browser_active == 0) { return 0; }
    if (this.initialize_game_run == 1) { return 0; }

    //
    // fetch info for other players
    //
    this.app.connection.emit("registry-fetch-identifiers-and-update-dom", this.game.players);

    //
    // hash reflects game position
    //
    try {
      let oldHash = window.location.hash;
      if (oldHash != "") {
        let results = app.browser.parseHash(oldHash);
        let arcade_mod = app.modules.returnModule("Arcade");
        if (arcade_mod && this.game.id !== results.gid) {
          console.log("THIS IS NOT MY GAME, TRY OBSERVER MODE");
          return;
        }
      }

      window.location.hash = `#`;
      window.location.hash = app.browser.initializeHash(
        `#gid=${this.game.id}`,
        oldHash,
        {step: this.game.step.game}
      );
    } catch (err) {
      console.error(err);
    }

    //
    // check options for clock
    //
    console.log(JSON.parse(JSON.stringify(this.game.options)));
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
      console.log("Set clock limit to ", this.game.clock_limit);
    }

    if (this.useClock == 1) {
      this.clock.render();
    }

    if (this.game.player == 0) {
      this.observerControls.render();
      document.body.classList.add("observer-mode");
      if (this.game.live) {
        this.observerControls.step_speed = 0;
        this.observerControls.play(); //Just update the controls so they match our altered state
      }
    } else {
      this.observerControls.remove();
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

    if (type == "arcade-games") {
      let obj = {};
      obj.image = `/${this.returnSlug()}/img/arcade/arcade.jpg`;
      obj.banner = `/${this.returnSlug()}/img/arcade/arcade.jpg`;
      return obj;
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

  onPeerHandshakeComplete(app, peer) {
    //
    // if we have pending moves in this game in our wallet, relay again
    // Probably only need to check on startQueue (when reconnecting to network)

    if (this.hasGameMovePending() && this.game?.initializing == 0) {
      console.log("Have pending tx to rebroadcast");
      //
      // rebroadcast game move out of paranoia
      //
      for (let i = 0; i < this.app.wallet.wallet.pending.length; i++) {
        let tx = new saito.default.transaction();
        tx.deserialize_from_web(this.app, this.app.wallet.wallet.pending[i]);
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
          game_self.observerControls.next();
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
      // share web3 balances
      //
      if (!this.game.cryptos) { this.game.cryptos = {}; }
      if (!this.game.cryptos[this.app.wallet.returnPublicKey]) {
        // share live balance for web3 crypto usability
        let mycryptos = [];
        let cryptomods = this.app.wallet.returnInstalledCryptos();
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

      //if (ns.game % 50 === 1) {
      //  mymsg.game_state = JSON.stringify(this.game);
      //}

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
        if ((newtx.msg.request === "game" && this.game.initializing == 0) || this.initialize_game_offchain_if_possible == 1) {
          this.app.connection.emit("relay-send-message", { recipient: this.game.accepted, request: "game relay gamemove", data: newtx.transaction });
          
          //An experiment to have game steps/ts update in arcade
          this.app.connection.emit("relay-send-message", { recipient: "PEERS", request: "arcade spv update", data: newtx.transaction });
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
          if (!this.game?.id || gametxmsg.game_id != this.game.id) {
            console.warn("ERROR SKIPPING HPT IN GAME: " + this.game.id);
            return;
          }

          if (message.request === "game relay gamemove") {
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
        if (this.app.BROWSER){
          this.app.keychain.addWatchedPublicKey(this.game.players[i]);  
        }
        
      }
      //
      // game step
      //
      for (let i = 0; i < this.game.players.length; i++) {
        this.game.step.players[this.game.players[i]] = 0;
      }

      //
      // special key for keystate encryption --> store in game
      //
      this.game.sharekey = this.app.crypto.generateRandomNumber();

      console.log("!!!!!!!!!!!!!!!!!!!!");
      console.log("!!! GAME CREATED !!!");
      console.log("!!!!!!!!!!!!!!!!!!!!");
      console.log("Game Id: " + game_id);
      console.log("My PublicKey: " + this.app.wallet.returnPublicKey());
      console.log("My Player Number: " + this.game.player);
      console.log("ALL KEYS: " + JSON.stringify(this.game.players));
      console.log("My Share Key: " + this.game.sharekey);
      console.log("!!!!!!!!!!!!!!!!!!!!");
      console.log("!!!!!!!!!!!!!!!!!!!!");
      console.log("!!!!!!!!!!!!!!!!!!!!");

      this.game.players_set = 1;

      this.gaming_active = 0;
      this.saveGame(game_id);

      //
      // players are set and game is accepted, so move into handleGame
      //
      this.initializeGameQueue(game_id);

    }

    return game_id;
  }

  initializeObserverMode(tx) {
    
    let game_id = tx.transaction.sig
    let txmsg = tx.returnMessage();

    console.log(game_id, JSON.parse(JSON.stringify(txmsg)));

    this.loadGame(game_id);

    //
    // otherwise setup the game
    //
    this.game.options = txmsg.options;
    this.game.module = txmsg.game;
    this.game.originator = txmsg.originator; //Keep track of who initiated the game
    this.game.players_needed = txmsg.players.length; //So arcade renders correctly

    for (let i = 0; i < txmsg.players.length; i++) {
      this.addPlayer(txmsg.players[i]);
    }

    this.saveGame(game_id);
    if (this.game.players_set == 0) {

      this.gaming_active = 1; //Prevent any moves processing while sorting players

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

        // defaults to SAITO keys - will contain KEYS for 3rd party crypto if enabled
        this.game.keys.push(this.game.players[i]);

      }

      //
      // game step
      //
      for (let i = 0; i < this.game.players.length; i++) {
        this.game.step.players[this.game.players[i]] = 0;
      }

      this.game.players_set = 1;

      this.gaming_active = 0;

    }

    this.saveGame(game_id);
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
    // initialize the clock
    //
    this.time.last_received = new Date().getTime();
    this.time.last_sent = new Date().getTime();

    this.initializeGameQueue(this.game.id);

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

    window.location.hash = this.app.browser.modifyHash(window.location.hash, {step: gametxmsg.step.game});

    //console.info(`Add Next Move (${gametxmsg.step.game}) to QUEUE: ${JSON.stringify(gametxmsg.turn)}`);
    //console.log(JSON.parse(JSON.stringify(gametxmsg)));

    //
    // OBSERVER MODE -
    //
    if (this.game.player == 0) {
      if (this.browser_active) {
        this.observerControls.showLastMoveButton();
        this.observerControls.updateStep(this.game.step.game);
      }
      
      this.observerControls.game_states.push(this.game_state_pre_move);
      this.observerControls.game_moves.push(gametx);
      //To avoid memory overflow for long games
      if (this.observerControls.game_states.length > 100) {
        this.observerControls.game_states.shift();
      }
      if (this.observerControls.game_moves.length > 100) {
        this.observerControls.game_moves.shift();
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
      
      console.log("Future TX:" , JSON.parse(JSON.stringify(gametx.returnMessage())));
      this.game.future.push(JSON.stringify(gametx.transaction));
      this.saveFutureMoves(this.game.id);

      if (this.game.player == 0 && this.browser_active) {
        try {
          if (this.observerControls.is_paused) {
            this.observerControls.showNextMoveButton();
            this.observerControls.updateStatus("New pending move");
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
      console.info(`Unable to process future moves now because halted (${this.game.halted}) or gamefeeder not initialized (${this.initialize_game_run})`);
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
        this.observerControls.updateStatus("Advanced one move");
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
      this.observerControls.updateStatus("No pending moves, click again to check the database");
      //salert("Caught up to current game state");
    }

    this.saveFutureMoves(this.game.id);
    if (this.game.future?.length > 0){
      console.info(JSON.parse(JSON.stringify(this.game.future)));
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
    console.log("Adding follower: " + address);
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
    console.log(JSON.stringify(this.game.players));
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
            this.updateStatusHeader("Resetting game...");
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

    if (!Array.isArray(winner)) {
      winner = [winner];
    }

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
    //Send message into the ether so that the arcade service can update the game status to "over"
    this.app.connection.emit("relay-send-message", { recipient: "PEERS", request: "arcade spv update", data: newtx.transaction });
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

      if (this.browser_active && this.log.rendered) {
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
    let sharekey = this.game.sharekey;
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
            <label for="open-table">Allow additional players to join</label>
            <input type="checkbox" name="open-table" />          
          </div>`;
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
    metaOverlay.show(`<form class="default_game_options">${playerOptions}${advancedOptions}</form>`);
    metaOverlay.hide();

    let options = { game: this.name };
    document.querySelectorAll("form.default_game_options input, form.default_game_options select").forEach((element) => {
      if (element.name){
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
        if (i == "clock"){
          output_me = 0;
          if (options[i] == 0) {
            sgo[i] = "unlimited";
          }else{
            sgo[i] += " minutes";
          }
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
        if (i == "open-table") {
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



  //
  // there are four ways of writing to the status-box:
  //
  // updateStatus(msg) <--- write raw HTML to .status
  // updateStatusHeader(msg); <--- formats msg
  // updateStatusAndListCards(msg, include_back_button) <--- formats msg + adds cards
  // updateStatusWithOptions(msg, html) <--- formats msg, adds html (ul/li)
  //
  // if you're using the HUD in most cases you want updateStatusHeader() to
  // leave a short note and either updateStatusAndListCards() for image 
  // display or updateStatusWithOptions() if you have a vertical list of 
  // tech choices.
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

  //
  // formats the message so it looks nice instead of performing a raw
  // HTML write to the .status object, which requires a lot more effort
  // to make consistent.
  //
  updateStatusHeader(message, include_back_button = false) {

    if (!this.useHUD) { this.updateStatus(message); }

    html = `<div class="status-header">
              ${include_back_button ? this.back_button_html : ""}
            <span id="status-content">${message}</span>
            </div>`;

    this.updateStatus(html);

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
      this.updateStatusHeader(`${message}`);
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


  /**
   *  Update Status (in HUD) and include a graphical display/textual description of cards (either provided or in one's hand)
   *  @param message - text (non-HTML formatted message) to insert in the (HUD) status
   *  @param optionHTML - an html list of actions a user can take
   *
   */
  updateStatusWithOptions(message = "", optionHTML = "", include_back_button = false) {

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
        //console.log(cardarray[i] + " --- " + deckid);

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

    if (typeof c === "string") {
      cardname = c;
      c = this.card_library[cardname];
    }

    let suggested_img = this.returnSlug() + "/img/";
    if (c.img?.indexOf(suggested_img) != -1) {
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
    let html = `<ul><li class="textchoice acknowledge" id="confirmit">${this.acknowledge_text}</li></ul>`;

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
              console.log("PENDING TXS:",JSON.parse(JSON.stringify(txmsg)));
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

  setPlayReminder(){

    //We can assume anyone holding their phone is going to be paying attention!
    if (this.app.browser.isMobileBrowser(navigator.userAgent)){
      return;
    }

    let newOverlay = new SaitoOverlay(this.app, this, false, true);
    let timer = setTimeout(()=> {
      //console.log("Player inactive");
      newOverlay.show(`<div class="message_box">the move is yours</div>`);
      window.removeEventListener("mousemove", clearTimer);

    }, 15000);

    const clearTimer = () => {
      //console.log("Player active");
      clearTimeout(timer);
    };

    window.addEventListener("mousemove", clearTimer, {once: true});

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
  initializeGameStake(crypto, stake) { 

    for (let i = 0; i < this.game.players.length; i++) {
      this.game.queue.push("BALANCE\t"+stake+"\t"+this.game.keys[i]+"\t"+crypto);
    }

  }

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
  depositGameStake(ticker = "", stake = "", sigs = [], ts = new Date().getTime()) {
    this.addMove("ACKNOWLEDGE\tppponent considering...");
    this.endTurn();
  }
  refuseGameStake(ticker = "", stake = "", sigs = [], ts = new Date().getTime()) {
    this.addMove("ACKNOWLEDGE\tCrypto Game Rejected");
    this.endTurn();
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

GameTemplate.importFunctions(GameQueue);

module.exports = GameTemplate;
