/*********************************************************************************
 GAME NETWORK

 Functions that abstract the sending and receiving of game commands over the network
 and between players.

 This class inherits independently from ModTemplate as handlePeerTransaction requires
 calls to "super" which assumes the existence of a parent class with this function.

**********************************************************************************/
let ModTemplate = require("./modtemplate");
let saito = require("./../saito/saito");

class GameNetwork extends ModTemplate {

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
              this.addFutureMove(gametx);
            } else if (this.isUnprocessedMove(gametx.transaction.from[0].add, gametxmsg)) {
              this.addNextMove(gametx);

              if (document[this.hiddenTab]) {
                this.startNotification();
              }
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
              readable += this.app.keychain.returnUsername(w) + ", ";
            }
            readable = readable.substring(0, readable.length - 2) + " win";
            if (winner.length == 1) {
              readable += "s";
            }
          } else {
            readable = this.app.keychain.returnUsername(winner) + " wins";
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
}

module.exports = GameNetwork;

