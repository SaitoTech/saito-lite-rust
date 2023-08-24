const Transaction = require("../../lib/saito/transaction").default;

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

//
// CORE Game Engine file are broken across several
// classes to compartmentalize related functionality
// these are all dynamically included in the main
// game-template.
//
const GameAcknowledge = require("./gametemplate-acknowledge");
const GameCards = require("./gametemplate-cards");
const GameDisplay = require("./gametemplate-display");
const GameMoves = require("./gametemplate-moves");
const GameNetwork = require("./gametemplate-network");
const GamePlayers = require("./gametemplate-players");
const GameQueue = require("./gametemplate-queue");
const GameSave = require("./gametemplate-save");
const GameStatus = require("./gametemplate-status");
const GameWeb3 = require("./gametemplate-web3");

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
const GameScoreboard = require("./../saito/ui/game-scoreboard/game-scoreboard");
const GameHammerMobile = require("./../saito/ui/game-hammer-mobile/game-hammer-mobile");
const JSON = require("json-bigint");
let GameRaceTrack = require("./../saito/ui/game-racetrack/game-racetrack");

class GameTemplate extends ModTemplate {
  constructor(app) {
    super(app);

    this.name = "Game";
    this.game_length = 30; //Estimated number of minutes to complete a game
    this.game = {};
    this.moves = [];
    this.commands = [];
    this.game_state_pre_move = "";

    this.acknowledge_text = "acknowledge"; // text shown in ACKNOWLEDGE

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
    this.observerControls = new GameObserverControls(app, this);
    this.racetrack = new GameRaceTrack(app, this);

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
    this.changeable_callback = function (card) {};
    this.cardbox_callback = async function (card) {
      if (temp_self.changeable_callback !== null) {
        await temp_self.changeable_callback(card);
      }
    };
    this.menu_backup_callback = null;
    this.back_button_html = `<i class="fa fa-arrow-left" id="back_button"></i>`;

    this.hiddenTab = "hidden";
    this.notifications = 0;
    this.statistical_unit = "game";

    this.enable_observer = true;

    app.connection.on("update-username-in-game", () => {
      if (this.browser_active) {
        this.resetPlayerNames();
        for (let i = 0; i < this.game.players.length; i++) {
          try {
            Array.from(
              document.querySelectorAll(`.saito-playername[data-id='${this.game.players[i]}']`)
            ).forEach((add) => (add.innerHTML = this.game.playerNames[i]));
          } catch (err) {
            console.error(err);
          }
        }
      }
    });

    return this;
  }

  //Since games are still on initializeHTML, we don't want default mod behavior to
  //add a bunch of random html to our games
  render(app) {
    app.connection.emit("set-relay-status-to-busy", {});
    this.initializeHTML(app);
  }

  async initializeHTML(app) {
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
          let msg = {
            game_id: results.gid,
            last_move: results.step,
            module: this.name,
          };

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
        `#gid=${this.game.id}&step=${this.game.step.game}`,
        oldHash,
        {}
      );
    } catch (err) {
      console.error(err);
    }

    //
    // check options for clock
    //
    //console.log("Game Options: ", JSON.parse(JSON.stringify(this.game.options)));
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
      await this.clock.render();
    }

    if (this.game.player == 0) {
      this.observerControls.render();
      document.body.classList.add("observer-mode");
      if (this.game.live) {
        this.observerControls.step_speed = 3;
        this.observerControls.play(); //Just update the controls so they match our altered state
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
  }

  //
  // deprecated but included for convenience
  //
  attachCardboxEvents(fn = null) {
    this.hud.attachControlCallback(fn);
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

  async onPeerHandshakeComplete(app, peer) {
    //
    // if we have pending moves in this game in our wallet, relay again
    // Probably only need to check on startQueue (when reconnecting to network)

    if ((await this.hasGameMovePending()) && this.game?.initializing == 0) {
      let pending = await this.app.wallet.getPendingTxs();
      // rebroadcast game move out of paranoia
      for (let i = 0; i < pending.length; i++) {
        let tx = pending[i];
        let txmsg = tx.returnMessage();
        if (txmsg.module === this.name) {
          if (txmsg.game_id === this.game?.id) {
            if (txmsg?.step?.game) {
              if (this.game.step.players[tx.from[0].publicKey] < txmsg.step.game) {
                await this.app.network.propagateTransaction(tx);
                this.app.connection.emit("relay-send-message", {
                  recipient: this.game.accepted,
                  request: "game relay gamemove",
                  data: tx.toJson(),
                });
              }
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

  initializeObserverMode(tx) {
    let game_id = tx.signature;
    let txmsg = tx.returnMessage();

    console.log("!!!!!OBSERVER MODE!!!!!");
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
        // defaults to SAITO keys
        // I guess this is useful for something...
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
        console.info("BOARD RATIO:", this.boardRatio);
      }
    } catch (err) {
      console.error(err);
    }
  }

  /*
  Called by Saito on browser load
  */
  async initialize(app) {
    //We don't inherit (run super.initialize) from modTemplate so need to do this!
    this.publicKey = await this.app.wallet.getPublicKey();

    this.initializeQueueCommands(); // Define standard queue commands

    if (!this.browser_active) {
      //
      // We need the queuecommands defined so that game invites 
      // can be initialized from outside the game
      //
      return;
    }

    this.calculateBoardRatio();

    //
    // we grab the game with the most current timestamp (ts)
    // since no ID is provided
    this.loadGame();

    //Just make sure I am in the accepted, so if I send a message, I also receive it
    //edge case with table games/observer
    this.addFollower(this.publicKey);

    //
    // initialize the clock
    //
    this.time.last_received = new Date().getTime();
    this.time.last_sent = new Date().getTime();

    await this.initializeGameQueue(this.game.id);
  }

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
  async initializeGame() {
    if (this.game.dice == "") {
      this.initializeDice();
      this.queue.push("READY");
      this.saveGame(this.game.id);
    }
  }

  //
  // Deleted in refactor, readded with WASM
  // TODO -- standardize a human readable player name array
  //
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

  async preloadImages() {
    // Dummy function that games can implement if they have a lot of
    // image assets to load
    // TODO: add to render function by default and improve the games that use it
  }

  endGameCleanUp() {
    // Called on game over, let's the game module clean up the DOM  
    // Must be implemented by each game individually
    // Dummy function here so game engine doesn't crash
  }

  async endGameInterface(status, allowRematch) {
    let target = this.app.options.homeModule || "Arcade";
    allowRematch = allowRematch && this.game.player !== 0;

    let options = `<ul>
                      <li class="textchoice" id="confirmit">Return to ${target}</li>
                      ${allowRematch ? '<!--li class="textchoice" id="rematch">Rematch</li-->' : ""}
                   </ul>`;

    this.hud.back_button = false;

    //if (document.querySelector(".status") && document.querySelector(".controls")){
    await this.updateStatusWithOptions(status, options);
    //}else{
    //  this.overlay.show(`<div class="status-overlay"><div class="status-header">${status}</div><div class="status-text-menu">${options}</div></div>`);
    //this.overlay.blockClose();
    //}

    document.getElementById("confirmit").onclick = (e) => {
      document.getElementById("confirmit").onclick = null; //If player clicks multiple times, don't want callback executed multiple times
      this.exitGame();
    };
  }

  //
  // call this to end game as tie
  //
  async tieGame() {
    await this.endGame(this.game.players, "tie");
  }

  /*
  Typically run by all the players, so we filter to make sure just one player sends to transaction
  Can also be used by a player (A) to announce to opponents that A is the winner.
  Function selects a winner to generate the game ending transaction, which is processed above
  in receiveGameOverRequest
  */
  async endGame(winner = [], reason = "") {
    console.log("End Game! Winner:", winner);

    let player_to_send = Array.isArray(winner) ? winner[0] : winner;
    player_to_send = player_to_send || this.game.players[0];

    //Only one player needs to generate the transaction
    if (player_to_send == this.publicKey) {
      let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();
      this.game.accepted.forEach((player) => {
        newtx.addTo(player);
      });

      newtx.msg = {
        request: "gameover",
        game_id: this.game.id,
        winner,
        players: this.game.players.join("_"),
        module: this.game.module,
        reason: reason,
        timestamp: new Date().getTime(),
      };

      if (this.game.options?.league_id) {
        newtx.msg.league_id = this.game?.options?.league_id;
      }

      await newtx.sign();

      console.log("I send gameover tx");

      //Send message
      await this.app.network.propagateTransaction(newtx);

      //Send message to other players (or observers) so they can process the gameover code
      this.app.connection.emit("relay-send-message", {
        recipient: this.game.accepted,
        request: "game relay gameover",
        data: newtx.toJson(),
      });
      //Send message into the ether so that the arcade service can update the game status to "over"
      this.app.connection.emit("relay-send-message", {
        recipient: "PEERS",
        request: "arcade spv update",
        data: newtx.toJson(),
      });
    }
  }

  /*
  When my game logic shows that I have reached a losing condition and need to notify the opponents
  */
  async resignGame(game_id = null, reason = "forfeit") {
    //May be called from Arcade and have to load the game to send out the message to correct players
    if (game_id && this.game.id != game_id) {
      console.warn("Have to load game in order to resign");
      this.loadGame(game_id);
    }

    let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();
    this.game.accepted.forEach((player) => {
      newtx.addTo(player);
    });
    newtx.msg = {
      request: "stopgame",
      game_id: this.game.id,
      module: this.game.module,
      reason,
    };

    await newtx.sign();

    //Send message
    await this.app.network.propagateTransaction(newtx);
    this.app.connection.emit("relay-send-message", {
      recipient: this.game.accepted,
      request: "game relay stopgame",
      data: newtx.toJson(),
    });
    //Send message into the ether so that the arcade service can update the game status to "over"
    this.app.connection.emit("relay-send-message", {
      recipient: "PEERS",
      request: "arcade spv update",
      data: newtx.toJson(),
    });
  }

  /*
    Games should have a function to turn off all game-specific dom events
  */
  removeEvents() {}

  /*
  We receive a transaction (on/off chain) saying that a player hit the quit button
  We figure out who the other players are and if the game has gone beyond its grace period,
  call another function to push us into end game state (which requires another transaction)
  Resigning a game does still lead to a default game cancellation
  */
  async processResignation(resigning_player, txmsg) {
    console.log("processing resignation : " + resigning_player, txmsg);
    this.game.queue = [];
    this.moves = [];

    console.log("this.game = ", this.game);
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
    if (this.game.players.length == 1) {
      return;
    }

    if (txmsg.reason == "cancellation") {
      this.updateLog(`${resigning_player} cancels the game`);
      await this.endGame([], "cancellation"); //No one is marked as a winner
      //This is a fallback in case the end game doesn't come through
    } else {
      let winners = [];
      for (let p of this.game.players) {
        if (p !== resigning_player) {
          winners.push(p);
        }
      }
      await this.endGame(winners, txmsg.reason);
    }
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
        this.game.id = this.app.crypto.hash(new Date().getTime() + "");
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
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  }

  // --> TODO: FIX THIS
  /* standard 52 card deck */
  returnPokerDeck() {
    const deck = {};
    const suits = ["S", "C", "H", "D"];
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

  bindBackButtonFunction(mycallback) {
    // for HUD
    this.hud.back_button = true;
    this.hud.back_button_callback = mycallback;
    // for independent button
    try {
      document.getElementById("back_button").onclick = (e) => {
        mycallback();
      };
    } catch (err) {}
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


  setPlayReminder() {
    //We can assume anyone holding their phone is going to be paying attention!
    if (this.app.browser.isMobileBrowser(navigator.userAgent)) {
      return;
    }

    let newOverlay = new SaitoOverlay(this.app, this, false, true);
    let timer = setTimeout(() => {
      //console.log("Player inactive");
      newOverlay.show(`<div class="message_box">the move is yours</div>`);
      window.removeEventListener("mousemove", clearTimer);
    }, 15000);

    const clearTimer = () => {
      //console.log("Player active");
      clearTimeout(timer);
    };

    window.addEventListener("mousemove", clearTimer, { once: true });
  }


  timeout(ms) {
    return new Promise((res) => setTimeout(res, ms));
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
      let { callback, params } = nextStep;
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
    let target_obj = typeof target === "string" ? document.querySelector(target) : target;

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
    clone.style.top = "";
    clone.style.bottom = "";
    clone.style.left = "";
    clone.style.right = ""

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
    if (
      !document.querySelector(origin_reference) ||
      (dimension_reference && !document.querySelector(dimension_reference))
    ) {
      return null;
    }

    let source_stats = document.querySelector(origin_reference).getBoundingClientRect();
    let destination_stats = dimension_reference
      ? document.querySelector(dimension_reference).getBoundingClientRect()
      : source_stats;

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
      4) run_all_callbacks -- a flag to run each animations callback up completion

  */
  moveGameElement(animatedObjId, destination, options, callback = null) {
    let game_self = this;

    let destination_obj =
      typeof destination === "string" ? document.querySelector(destination) : destination;

    if (!destination_obj) {
      console.warn("Object not found: destination", destination);
      return null;
    }

    this.animation_queue.push(animatedObjId);

    let destination_stats = destination_obj.getBoundingClientRect();

    $(`#${animatedObjId}`)
      .delay(10)
      .queue(function () {
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

        $(this)
          .css({
            top: `${destination_stats.top}px`,
            left: `${destination_stats.left}px`,
          })
          .dequeue();
      })
      .delay(game_self.animationSpeed)
      .queue(function () {
        let item = this;
        if (options?.insert) {
          item = $(this).children()[0];
          //console.log("Appending element:", JSON.stringify(item));
          document.querySelector(destination).append(item);
        }

        $(this).addClass("done"); //Still used???
        game_self.animation_queue.shift();

        if (game_self.animation_queue.length == 0 && game_self.animationSequence.length == 0) {
          $(".copied_elem").remove();

          if (callback) {
            console.log("MoveGameElement finished, running callback");
            callback(item);
          } else {
            //console.log("MoveGameElement finished, but no callback");
          }
        } else if (options.run_all_callbacks) {
          console.log("Running callback even though more items in queue");
          if (callback) {
            callback(item);
          }
        }

        $(this).dequeue();
      });
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
        this.resignGame(this.game.id, "time out").then(() => {});
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


  ///
  // These three functions are used by Blackjack and Imperium ...
  // but were delete in refactor / readded by WASM
  // TODO: fix this
  ///
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


  // this function runs "connect" event
  onConnectionStable(app, peer) {
    if (this.app.BROWSER === 1) {
      siteMessage("Connection Restored", 1000);
    }
  }

  //
  //
  // ON CONNECTION UNSTABLE
  //
  // this function runs "disconnect" event
  onConnectionUnstable(app, peer) {
    if (this.app.BROWSER === 1) {
      siteMessage("Connection Unstable", 1000);
    }
  }
}

GameTemplate.importFunctions(GameQueue, GameWeb3, GameSave, GameNetwork, GameMoves, GameAcknowledge, GamePlayers, GameStatus, GameDisplay, GameCards);

module.exports = GameTemplate;
