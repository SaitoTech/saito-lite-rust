const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const ArcadeMain = require("./lib/main/main");
const SaitoHeader = require("./../../lib/saito/ui/saito-header/saito-header");
const InviteManager = require("./lib/invite-manager");
const GameWizard = require("./lib/overlays/game-wizard");
const GameSelector = require("./lib/overlays/game-selector");
const GameScheduler = require("./lib/overlays/game-scheduler");
const GameInvitationLink = require("./lib/overlays/game-invitation-link");

const GameCryptoTransferManager = require("./../../lib/saito/ui/game-crypto-transfer-manager/game-crypto-transfer-manager");

class Arcade extends ModTemplate {

  constructor(app) {
    super(app);

    this.name = "Arcade";

    this.description = "Interface for creating and joining games coded for the Saito Open Source Game Engine.";
    this.categories = "Games Entertainment Utilities";

    // We store reference to all the installed modules which are arcade compatible
    // Useful for rendering the sidebar menu, or any list of games for game-selector (prior to game-wizard)
    this.arcade_games = []; 

    /*  
      We store the original transactions (from createOpenTransaction/joinOpenTransaction) in this.games,
      but because it is an object in memory, we will update the player list as players join.
      When the game kicks off, we update the server side sql so that anyone else joining the network won't get confused
      the tx.transaction.sig becomes the game_id.  
    */
    this.games = {};

    this.is_game_initializing = false;

    this.icon_fa = "fas fa-gamepad";

    this.styles = ['/arcade/style.css'];

    this.affix_callbacks_to = [];
    this.old_game_removal_delay = 2000000;
    this.services = [{ service: "arcade", domain: "saito" }];

    this.theme_options = {
      'lite': 'fa-solid fa-sun',
      'dark': 'fa-solid fa-moon',
      'arcade': 'fa-solid fa-gamepad'
    };

    this.debug = false;
  }


  /////////////////////////////
  // INITIALIZATION FUNTIONS //
  /////////////////////////////
  //
  // runs when the module initializes, note that at this point the network
  // may not be up. use onPeerHandshakeCompete() to make requests over the 
  // network and process the results.
  //
  initialize(app) {

    super.initialize(app);

    //
    // compile list of arcade games
    //
    app.modules.returnModulesRespondingTo("arcade-games").forEach(game_mod => {
        this.arcade_games.push(game_mod);
        //
        // and listen to their transactions
        //
        this.affix_callbacks_to.push(game_mod.name);
    });

    //
    // If we have a browser (are a user)
    // initialize some UI components and query the list of games to display 
    //
    if (this.app.BROWSER == 1) {

      // These are three overlays with event listeners that can function outside of the Arcade
      this.wizard = new GameWizard(app, this, null, {});
      this.game_selector = new GameSelector(app, this, {});
      this.game_scheduler = new GameScheduler(app, this, {});

      // Necessary?
      this.game_crypto_transfer_manager = new GameCryptoTransferManager(app, this);


      //
      // my games stored in local wallet
      //
      if (this.app.options.games) {
        
        this.purgeBadGamesFromWallet();
        
        //
        // We create a dummy tx from the saved game state so that the arcade can render the 
        // active game like a new open invite
        //
        for (let game of this.app.options.games) {
          if (game.over == 0 && (game.players_set != 1 || game.players.includes(this.app.wallet.returnPublicKey()) || game.accepted.includes(this.app.wallet.returnPublicKey()))) {

            let game_tx = new saito.default.transaction();
            if (game.over) { if (game.last_block > 0) { return; } }
            if (game.players) {
              game_tx.transaction.to = game.players.map(player => new saito.default.slip(player));
              game_tx.transaction.from = game.players.map(player => new saito.default.slip(player));
            } else {
              game_tx.transaction.from.push(new saito.default.slip(this.app.wallet.returnPublicKey()));
              game_tx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey()));
            }

            let msg = {
              //ts
              module: "Arcade",
              request: "loaded", //will be overwritten as "active" when added
              game: game.module,
              options: game.options,
              players_needed: game.players_needed,
              players: game.players,
              players_sigs: [], //Only used to verify cryptology when initializing the game
              originator: game.originator,
              //desired_opponent_publickey: desired_opponent_publickey

            }

            game_tx.transaction.sig = game.id;
            game_tx.msg = msg;

            console.log("Processing games from app.options:");

            //
            // and add to list of my games
            //
            this.addGame(game_tx, "active");
          }
        }
      }

      this.app.connection.emit('arcade-invite-manager-render-request');

    }

  }



  //
  // runs when we connect to a network client
  // The key thing that happens is we want to query the service node for current state of the arcade
  // Since no open transactions are addressed to us, we can't just read them off the blockchain
  //
  onPeerHandshakeComplete(app, peer) {

    if (!app.BROWSER) { return; }
    let arcade_self = this;

    let cutoff = new Date().getTime() - this.old_game_removal_delay;

    //
    // load open games from server
    //  ( status = "open" OR status = "private" ) AND
    let sql = `SELECT * FROM games WHERE created_at > ${cutoff}`;
    this.sendPeerDatabaseRequestWithFilter("Arcade", sql,
      (res) => {
        if (res.rows) {
          for (let record of res.rows){
            //This is the save openTX
            let game_tx = new saito.default.transaction(JSON.parse(record.tx));

            //But we update the player list
            let player_info = record.players_array.split("_");
            for (let pi of player_info) {
              let pair = pi.split("/");
              let pkey = pair[0];
              let sig = pair[1];
              if (!game_tx.msg.players.includes(pkey)) {
                game_tx.msg.players.push(pkey);
                game_tx.msg.players_sigs.push(sig);
              }
            }

            if (arcade_self.debug){
              console.log("Load DB Game: " + record.status, game_tx.returnMessage());
            }
            //
            //record.status will overwrite the open/private msg.request from the original game invite creation
            //
            arcade_self.addGame(game_tx, record.status);
          }
        }

        arcade_self.app.connection.emit('arcade-invite-manager-render-request');

        //
        // For processing direct link to game invite
        //
        if (arcade_self.app.browser.returnURLParameter("game_id")) {
        
          let game_id = arcade_self.app.browser.returnURLParameter("game_id");    
          
          if (arcade_self.debug) { console.log("attempting to join game... " + game_id); }
          
          let game = arcade_self.returnGame(game_id);

          if (!game || !this.isAvailableGame(game)){
            salert("Sorry, the game is no longer available");
            return;
          }

          this.app.browser.logMatomoEvent("PrivateInvite", "JoinGame", game.game);

          let newtx = arcade_self.createJoinTransaction(game);

          arcade_self.app.network.propagateTransaction(newtx);

          arcade_self.app.connection.emit("relay-send-message", {recipient: game.msg.players, request: "arcade spv update", data: newtx.transaction });
          arcade_self.app.connection.emit("relay-send-message", {recipient: "PEERS", request: "arcade spv update", data: newtx.transaction });

          arcade_self.overlay.remove();

        }

      }
    );
  }





  ////////////
  // RENDER //
  ////////////
  //
  // this function renders the main application (if called). it will be 
  // run by browser if the user attempts to visit /arcade in their browser
  // while the application is loaded.
  //
  render() {

    if (this.app.BROWSER == 1) {
      
      if (this.app.options.theme) {
        let theme = this.app.options.theme[this.slug];

        if (theme != null) {
          this.app.browser.switchTheme(theme);
        }
      }
    }

    if (this.main == null) {
      this.main = new ArcadeMain(this.app, this);
      this.header = new SaitoHeader(this.app, this);
      this.addComponent(this.header);
      this.addComponent(this.main);
    }

    this.app.modules.returnModulesRespondingTo("chat-manager").forEach((mod) => {
      let cm = mod.respondTo("chat-manager");
      cm.container = ".saito-sidebar.left";
      this.addComponent(cm);
    });

    super.render();

  }

  //
  // let other modules know if we can render into any components
  //
  canRenderInto(qs) {
    if (qs === ".redsquare-sidebar") { return true; }
    if (qs == ".league-overlay-league-body-games-list") { return true; }
    return false;
  }

  //
  // render components into other modules on-request
  //
  renderInto(qs) {

    if (qs == ".redsquare-sidebar") {
      if (!this.renderIntos[qs]) {
        this.styles = ['/arcade/css/arcade-overlays.css', '/arcade/css/arcade-game-selector-overlay.css', '/arcade/css/arcade-invites.css'];
        this.renderIntos[qs] = [];
        let obj = new InviteManager(this.app, this, ".redsquare-sidebar");
        obj.type = "short";
        this.renderIntos[qs].push(obj);
        this.attachStyleSheets();
      }
    }

    if (qs == ".arcade-invites-box") {
      if (!this.renderIntos[qs]) {
        this.styles = ['/arcade/css/arcade-overlays.css', '/arcade/css/arcade-invites.css'];
        this.renderIntos[qs] = [];
        let obj = new InviteManager(this.app, this, ".arcade-invites-box");
        obj.type = "long";
        this.renderIntos[qs].push(obj);
        this.attachStyleSheets();
      }
    }

    if (qs == ".league-overlay-league-body-games-list") {
      if (!this.renderIntos[qs]) {
        this.styles = ['/arcade/css/arcade-overlays.css', '/arcade/css/arcade-invites.css'];
        this.renderIntos[qs] = [];
        let obj = new InviteManager(this.app, this, ".league-overlay-league-body-games-list");
        obj.type = "long";
        obj.lists = ["open", "active", "over"];
        this.renderIntos[qs].push(obj);
        this.attachStyleSheets();
      }
    }


    if (this.renderIntos[qs] != null && this.renderIntos[qs].length > 0) {
      this.renderIntos[qs].forEach((comp) => { comp.render(); });
    }

  }



  //
  // flexible inter-module-communications
  //
  respondTo(type = "") {
    if (type == "header-dropdown") {
      return {
        name: this.appname ? this.appname : this.name,
        icon_fa: this.icon_fa,
        browser_active: this.browser_active,
        slug: this.returnSlug()
      };
    }
    if (type === 'user-menu') {
      return {
        text: "Challenge to Game",
        icon: "fas fa-gamepad",
        callback: function (app, publickey) {
          let obj = { publickey: publickey };
          app.connection.emit("arcade-launch-game-selector", (obj));
        }
      }
    }
    if (type === 'saito-header') {
      return [
        {
          text: "Games",
          icon: this.icon || "fas fa-gamepad",
	  rank: 10,
          callback: function (app, id) {
            app.connection.emit("arcade-launch-game-selector", {});
          }
        }
      ]
    }

    return null;
  }



  ////////////////////////////////////////////////////
  // NETWORK FUNCTIONS -- sending and receiving TXS //
  ////////////////////////////////////////////////////
  //
  ////////////////////////////////////////////////////
  // ON CONFIRMATION === process on-chain transactions
  ////////////////////////////////////////////////////

  async onConfirmation(blk, tx, conf, app) {

    let txmsg = tx.returnMessage();
    let arcade_self = app.modules.returnModule("Arcade");

    try {
      if (conf == 0) {

        if (this.debug) {
          console.log("ON CONFIRMATION:", JSON.parse(JSON.stringify(txmsg)));
        }

        if (txmsg.module === "ArcadeInvite") {
         
          //
          // Not sure why we have this, legacy of original invite system
          // and multiple attempts for general invites
          //

          arcade_self.receiveOpenTransaction(tx, blk);
        
        } else if (txmsg.module === "Arcade") {

          //
          // public & private invites processed the same way
          //
          if (txmsg.request === "open" || txmsg.request === "private") {
            arcade_self.receiveOpenTransaction(tx, blk);  
          }

          //
          // Allow the game originator to change mind about game being open or private
          //
          /*
          if (txmsg.request.includes("change")) {
            arcade_self.receiveChangeTransaction(tx);
          }
          */

          //
          // Add a player to the game invite
          //
          if (txmsg.request == "join") {
            arcade_self.receiveJoinTransaction(tx);
          }

          //
          // cancel a join transaction / Remove a player from the game invite
          //
          if (txmsg.request == "cancel") {
            arcade_self.receiveCancelTransaction(tx);
          }

          //
          // kick off game initialization
          //
          if (txmsg.request === "accept") {
            arcade_self.receiveAcceptTransaction(tx);
          }

        }else{
          if (txmsg.request === "stopgame"){
            arcade_self.receiveCloseTransaction(tx);
          }

          if (txmsg.request === "gameover"){
            arcade_self.receiveGameoverTransaction(tx);
          }
        } 

      }

    } catch (err) {
      console.log("ERROR in arcade: " + err);
    }
  }





  /////////////////////////////
  // HANDLE PEER TRANSACTION //
  /////////////////////////////
  //
  // handles off-chain transactions
  //
  async handlePeerTransaction(app, newtx=null, peer, mycallback = null) {
  
    if (newtx == null) { return; }
    let message = newtx.returnMessage();

    if (!message?.data) { return; }

    //
    // this code doubles onConfirmation
    //
    if (message?.request === "arcade spv update") {

      let tx = new saito.default.transaction(message.data);

      let txmsg = tx.returnMessage();

      if (this.debug){
          console.log("Arcade HPT embedded txmsg:", JSON.parse(JSON.stringify(txmsg)));
      }

      //
      // only servers notify lite-clients
      //

      if (app.BROWSER == 0 && app.SPVMODE == 0) {
        console.log("notify peers?");
        this.notifyPeers(tx);
      }

      if (txmsg.module === "ArcadeInvite") {
       
        //
        // Not sure why we have this, legacy of original invite system
        // and multiple attempts for general invites
        //

        this.receiveOpenTransaction(tx);
      
      } else if (txmsg.module === "Arcade") {

        //
        // public & private invites processed the same way
        //
        if (txmsg.request === "open" || txmsg.request === "private") {
          this.receiveOpenTransaction(tx);  
        }

        //
        // Allow the game originator to change mind about game being open or private
        //
        /*
        if (txmsg.request.includes("change")) {
          this.receiveChangeTransaction(tx);
        }
        */

        //
        // Add a player to the game invite
        //
        if (txmsg.request == "join") {
          this.receiveJoinTransaction(tx);
        }

        //
        // cancel a join transaction / Remove a player from the game invite
        //
        if (txmsg.request == "cancel") {
          this.receiveCancelTransaction(tx);
        }

        //
        // kick off game initialization
        //
        if (txmsg.request === "accept") {
          this.receiveAcceptTransaction(tx);
        }

        /*
        //TODO - reimplement / check
        // This was an idea to completely off-chain send a player a direct/play now game invite
        // Which will pop up a yes/no demand for immediate response
              
        if (txmsg.request == "challenge") {
          this.receiveChallengeTransaction(tx);
        }
        
        if (txmsg.request == "sorry"){
          app.connection.emit("arcade-reject-challenge", txmsg.game_id);
        }
        */


      }else{
        if (txmsg.request === "stopgame"){
          this.receiveCloseTransaction(tx);
        }

        if (txmsg.request === "gameover"){
          this.receiveGameoverTransaction(tx);
        }
      } 

    }

    super.handlePeerTransaction(app, newtx, peer, mycallback);

  }

  //
  // send TX to our SPV peers
  //
  notifyPeers(tx) {

    if (this.app.BROWSER == 1) { return; }
    for (let i = 0; i < this.app.network.peers.length; i++) {
      if (this.app.network.peers[i].peer.synctype == "lite") {
        // 
        // fwd tx to peer
        //  
        let message = {};
        message.request = "arcade spv update";
        message.data = tx.transaction;

        this.app.network.peers[i].sendRequestAsTransaction(message.request, message.data);
      }
    }
  }



  ///////////////////////
  // GAME TRANSACTIONS //
  ///////////////////////
  //
  // open - creating games
  // join - adds player, but does not initialize
  // accept - the final player to join, triggers initialization
  //
  ///////////////
  // OPEN GAME //
  ///////////////
  //
  // an OPEN transaction is the first step in creating a game. It describes the 
  // conditions of the game and triggers browsers to add it to their list of 
  // available games.
  //
  // servers can also index the transaction to notify others that a game is 
  // available if asked.
  //
  createOpenTransaction(gamedata, recipient = "") {

    let sendto = this.app.wallet.returnPublicKey();
    let moduletype = "Arcade";

    //    
    // currently used actively in game invite process
    //    
    if (recipient != "") {
      sendto = recipient;
      moduletype = "ArcadeInvite";
    }

    let { ts, name, options, players_needed, invitation_type, desired_opponent_publickey } = gamedata;

    let accept_sig = this.app.crypto.signMessage(
      `invite_game_${ts}`,
      this.app.wallet.returnPrivateKey()
    );

    let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    if (recipient != "") { newtx.transaction.to.push(new saito.default.slip(sendto, 0.0)); }

    newtx.msg = {
      ts: ts,
      module: moduletype,
      request: invitation_type,
      game: name,
      options: options,
      players_needed: parseInt(players_needed),
      players: [this.app.wallet.returnPublicKey()],
      players_sigs: [accept_sig],
      originator: this.app.wallet.returnPublicKey(),
      desired_opponent_publickey: desired_opponent_publickey
    };

    if (this.debug){
      console.log("Creating Game Invite: ", JSON.parse(JSON.stringify(newtx.msg)));
    }

    newtx = this.app.wallet.signTransaction(newtx);

    return newtx;
  }

  async receiveOpenTransaction(tx, blk = null) {
    
    let txmsg = tx.returnMessage();

    // add to games list == open or private
    this.addGame(tx, txmsg.request);   
    this.app.connection.emit("arcade-invite-manager-render-request");
    

    //
    // Only the arcade service node (non-browser) needs to bother executing SQL
    //

    let options = (txmsg.options != undefined) ? txmsg.options : {};

    let players_array = txmsg.players[0] + "/" + txmsg.players_sigs[0];
    let start_bid = (blk != null) ? blk.block.id : BigInt(1);

    let created_at = parseInt(tx.transaction.ts);
    let expires_at = created_at + 60000 * 60;

    let sql = `INSERT OR IGNORE INTO games (
                game_id ,
                players_needed ,
                players_array ,
                module ,
                status ,
                options ,
                tx ,
                start_bid ,
                created_at ,
                expires_at ,
                winner
              ) VALUES (
                $game_id ,
                $players_needed ,
                $players_array ,
                $module ,
                $status ,
                $options ,
                $tx,
                $start_bid ,
                $created_at ,
                $expires_at ,
                $winner
              )`;
    let params = {
      $game_id: tx.transaction.sig,
      $players_needed: parseInt(txmsg.players_needed),
      $players_array: players_array,
      $module: txmsg.game,
      $status: txmsg.request, //open, private, [direct]
      $options: options,
      $tx: JSON.stringify(tx.transaction),
      $start_bid: start_bid,
      $created_at: created_at,
      $expires_at: expires_at,
      $winner: "",
    };
    await this.app.storage.executeDatabase(sql, params, "arcade");

  }


  ////////////
  // Cancel //
  ////////////

  createCancelTransaction(orig_tx) {
    let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee();

    for (let player of orig_tx.msg.players){
      newtx.transaction.to.push(new saito.default.slip(player, 0.0));  
    }
    newtx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));

    let msg = {
      request: "cancel",
      module: "Arcade",
      game_id: orig_tx.transaction.sig,
    };
    newtx.msg = msg;
    newtx = this.app.wallet.signTransaction(newtx);

    return newtx;
  }

  async receiveCancelTransaction(tx) {
    let txmsg = tx.returnMessage();
    let game = this.returnGame(txmsg.game_id);

    if (!game || !game.msg) { return; }

    if (game.msg.players.includes(tx.transaction.from[0].add)) {

      if (tx.transaction.from[0].add == game.msg.originator){
        if (this.debug){
          console.log(`Player (${tx.transaction.from[0].add}) Canceling Game invite: `, JSON.parse(JSON.stringify(game.msg)));
        }

        await this.changeGameStatus(txmsg.game_id, "close");

      }else{

        if (this.debug){
          console.log(`Removing Player (${tx.transaction.from[0].add}) from Game: `, JSON.parse(JSON.stringify(game.msg)));
        }

        let p_index = game.msg.players.indexOf(tx.transaction.from[0].add);
        game.msg.players.splice(p_index, 1);
        //Make sure player_sigs array exists and add invite_sig
        if (game.msg.players_sigs && game.msg.players_sigs.length > p_index) {
          game.msg.players_sigs.splice(p_index, 1);
        }

        this.updatePlayerListSQL(txmsg.game_id, game.msg.players, game.msg.players_sigs);
        this.app.connection.emit("arcade-invite-manager-render-request");
  
      }
  
    }

  }

  sendCancelTransaction(game_id) {
    let game = this.returnGame(game_id);

    if (!game || !game.msg) { return; }

    let close_tx = this.createCancelTransaction(game);
    this.app.network.propagateTransaction(close_tx);

    this.app.connection.emit("relay-send-message", { recipient: game.msg.players, request: "arcade spv update", data: close_tx.transaction });
    this.app.connection.emit("relay-send-message", { recipient: "PEERS", request: "arcade spv update", data: close_tx.transaction });
 
  }


  ////////////////////////////////////////////////////////////////////
  // Quit 
  // We can send a message from the arcade to kill a game
  // We don't process the tx in the arcade, but rather the game engine
  // and use an internal message to finish the process (because the sequencing matters!)
  /////////////////////////////////////////////////////////////////////

  createQuitTransaction(orig_tx, reason = "cancellation") {

    let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
 
    for (let player of orig_tx.msg.players){
      newtx.transaction.to.push(new saito.default.slip(player, 0.0));  
    }
    newtx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));

    let msg = {
      request: "stopgame",
      module: orig_tx.msg.game,
      game_id: orig_tx.transaction.sig,
      reason: reason,
    };

    newtx.msg = msg;
    newtx = this.app.wallet.signTransaction(newtx);

    console.info(`Send ${(reason == "cancellation")?"close":"quit"} message from Arcade to ${orig_tx.msg.game}: `, JSON.parse(JSON.stringify(newtx.msg)));

    return newtx;

  }

  sendQuitTransaction(game_id, reason = "cancellation") {

    let game = this.returnGame(game_id);

    if (!game) { return; }

    let close_tx = this.createQuitTransaction(game, reason);
    this.app.network.propagateTransaction(close_tx);

    this.app.connection.emit("relay-send-message", { recipient: game.msg.players, request: "game relay stopgame", data: close_tx.transaction });
    this.app.connection.emit("relay-send-message", { recipient: "PEERS", request: "arcade spv update", data: close_tx.transaction });

  }


  async changeGameStatus(game_id, newStatus){
    let game = this.returnGame(game_id);

    if (!game){ return; }

    //Move game to different list
    this.removeGame(game_id);  
    this.addGame(game, newStatus);

    this.app.connection.emit("arcade-invite-manager-render-request");
      
    //Update top level sql table
    let sql = `UPDATE games SET status = $status WHERE game_id = $game_id`;
    let params = { $status: newStatus, $game_id: game_id };
    await this.app.storage.executeDatabase(sql, params, "arcade");
  }

  //////////////
  // GAMEOVER //
  //////////////

  async receiveGameoverTransaction(tx) {
    let txmsg = tx.returnMessage();

    await this.changeGameStatus(txmsg.game_id, "over");

    let sql = `UPDATE games SET winner = $winner WHERE game_id = $game_id`;
    let params = { $winner: txmsg.winner, $game_id: txmsg.game_id };
    await this.app.storage.executeDatabase(sql, params, "arcade");
  }

  async receiveCloseTransaction(tx) {
    let txmsg = tx.returnMessage();
    await this.changeGameStatus(txmsg.game_id, "close");
  }




  ////////////
  // Invite // TODO -- confirm we still use these, instead of challenge
  ////////////
  //
  // unsure
  //
  createInviteTransaction(orig_tx) {

    let txmsg = orig_tx.returnMessage();

    let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    newtx.transaction.to.push(new saito.slip(orig_tx.transaction.from[0].add, 0.0));
    newtx.transaction.to.push(new saito.slip(this.app.wallet.returnPublicKey(), 0.0));
    newtx.msg.ts = "";
    newtx.msg.module = txmsg.game;
    newtx.msg.request = "invite";
    newtx.msg.game_id = orig_tx.transaction.sig;
    newtx.msg.players_needed = parseInt(txmsg.players_needed);
    newtx.msg.options = txmsg.options;
    newtx.msg.accept_sig = "";
    if (orig_tx.msg.accept_sig != "") {
      newtx.msg.accept_sig = orig_tx.msg.accept_sig;
    }
    if (orig_tx.msg.ts != "") {
      newtx.msg.ts = orig_tx.msg.ts;
    }
    newtx.msg.invite_sig = this.app.crypto.signMessage(("invite_game_" + newtx.msg.ts), this.app.wallet.returnPrivateKey());
    newtx = this.app.wallet.signTransaction(newtx);

    return newtx;

  }


  ///////////////
  // JOIN GAME //
  ///////////////
  //
  // join is the act of adding yourself to a game that does not have enough 
  // players. technically, you're providing a signature that -- when returned
  // as part of a valid game, will trigger your browser to start initializing
  // the game.
  //
  createJoinTransaction(orig_tx) {

    if (!orig_tx || !orig_tx.transaction || !orig_tx.transaction.sig) { 
      console.error("Invalid Game Invite TX, cannot Join");
      return; 
    }

    let txmsg = orig_tx.returnMessage();

    let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    for (let player of txmsg.players){
      newtx.transaction.to.push(new saito.default.slip(player, 0.0));  
    }
    newtx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));

    newtx.msg = JSON.parse(JSON.stringify(txmsg));
    newtx.msg.module = "Arcade";
    newtx.msg.request = "join";
    newtx.msg.game_id = orig_tx.transaction.sig;

    newtx.msg.invite_sig = this.app.crypto.signMessage(
      "invite_game_" + orig_tx.msg.ts,
      this.app.wallet.returnPrivateKey()
    );

    newtx = this.app.wallet.signTransaction(newtx);

    return newtx;
  }

  receiveJoinTransaction(tx) {

    if (!tx || !tx.transaction || !tx.transaction.sig) { return; }

    let txmsg = tx.returnMessage();

    //Transaction must be signed
    if (!txmsg.invite_sig){ return; }

    //
    // game is the copy of the original invite creation TX stored in our object of arrays.
    //
    let game = this.returnGame(txmsg.game_id);
    //
    // If we don't find it, or we have already marked the game as active, stop processing
    //
    if (!game || !this.isAvailableGame(game)) { return; }

    //
    // Don't add the same player twice!
    //
    if (!game.msg.players.includes(tx.transaction.from[0].add)) {
      if (this.debug){
        console.log(`Adding Player (${tx.transaction.from[0].add}) to Game: `, JSON.parse(JSON.stringify(game)));
      }

      //
      // add player to game
      //
      game.msg.players.push(tx.transaction.from[0].add);
      game.msg.players_sigs.push(txmsg.invite_sig);
    
      //Update DB
      this.updatePlayerListSQL(txmsg.game_id, game.msg.players, game.msg.players_sigs);

      //Update UI
      this.app.connection.emit("arcade-invite-manager-render-request");  

      //
      // Do we have enough players?
      //
      if (game.msg.players.length >= game.msg.players_needed) {
        //
        // First player (originator) sends the accept message
        //
        if (game.msg.players[0] == this.app.wallet.returnPublicKey()) {
          game.msg.players.splice(0, 1);
          game.msg.players_sigs.splice(0, 1);
          let newtx = this.createAcceptTransaction(game);
          this.app.network.propagateTransaction(newtx);
          this.app.connection.emit("relay-send-message", { recipient: "PEERS", request: "arcade spv update", data: newtx.transaction });
          this.app.connection.emit("relay-send-message", { recipient: game.msg.players, request: "arcade spv update", data: newtx.transaction });
      
          //Start Spinner  
          this.app.connection.emit("arcade-game-initialize-render-request");
          return;
        }
      }
      
    }  
  }


  /////////////////
  // ACCEPT GAME //
  /////////////////
  //
  // this transaction should be a valid game that has signatures from everyone
  // and is capable of initializing a game. if this TX is valid and has our
  // signature we will auto-accept it, kicking off the game.
  //
  createAcceptTransaction(orig_tx) {
  
    if (!orig_tx || !orig_tx.transaction || !orig_tx.transaction.sig) { 
      console.error("Invalid Game Invite TX, cannot Accept");
      return; 
    }

    let txmsg = orig_tx.returnMessage();

    let accept_sig = this.app.crypto.signMessage("invite_game_" + txmsg.ts, this.app.wallet.returnPrivateKey());

    txmsg.players.push(this.app.wallet.returnPublicKey());
    txmsg.players_sigs.push(accept_sig);

    let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    for (let i = 0; i < txmsg.players.length; i++) {
      newtx.transaction.to.push(new saito.default.slip(txmsg.players[i], 0.0));
    }

    newtx.msg = JSON.parse(JSON.stringify(txmsg));
    newtx.msg.module = "Arcade";
    newtx.msg.game_id = orig_tx.transaction.sig;
    newtx.msg.request = "accept";

    newtx = this.app.wallet.signTransaction(newtx);

    return newtx;
  }

  async receiveAcceptTransaction(tx) {

    //Must be valid tx
    if (!tx || !tx.transaction || !tx.transaction.sig) { return; }

    let txmsg = tx.returnMessage();

    // Must have game module installed
    // We call the game-initialization function directly on gamemod further down
    let gamemod = this.app.modules.returnModule(txmsg.game);

    // I guess this safety catch should be further up the processing chain, like we shouldn't even display an invite/join a game we don't have installed
    if (!gamemod) { 
      console.error("Error Initializing! Game Module not Installed -- " + txmsg.game);
      return; 
    }

    let game = this.returnGame(txmsg.game_id);
  
    // Must be an available invite
    if (!game || !this.isAvailableGame(game)){
      return;
    }

    // do not re-accept game already in my local storage (a consequence of game initialization)
    for (let i = 0; i < this.app?.options?.games?.length; i++) {
      if (this.app.options.games[i].id == txmsg.game_id) {
          return;
      }
    }

    //
    // Mark the game as accept, i.e. active
    //
    this.changeGameStatus(txmsg.game_id, "active");

    //
    // If I am a player in the game, let's start it initializing
    //
    if (txmsg.players.includes(this.app.wallet.returnPublicKey())) {
      
      this.app.connection.emit("arcade-game-initialize-render-request");
      
      if (this.app.BROWSER == 1) {
          siteMessage(txmsg.game + ' invite accepted.', 20000);
      }
      /*
      So the game engine does a bunch of checks and returns false if something prevents the game
      from initializing, so... we should wait for feedback and nope out of the spinner if something breaks
      */

      let game_engine_id = await gamemod.processAcceptRequest(tx);

      if (!game_engine_id || game_engine_id !== txmsg.game_id) {
        await sconfirm("Something went wrong with the game initialization: " + game_engine_id);
      }
    }

  }

  /////////////////////////////////////////////////////////////
  // CHANGE == toggle a game invite between private and public
  //////////////////////////////////////////////////////////////
  /*
  createChangeTransaction(gametx, direction) {
      let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
      tx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));
      tx.msg = gametx.returnMessage();
      tx.msg.request = "change_" + direction;
      tx.msg.game_id = gametx.transaction.sig;
      tx = this.app.wallet.signTransaction(tx);

      if (this.debug) {
        console.log("Transaction to change");
        console.log(gametx);
        console.log(`CHANGE TX to ${direction}:`, tx);
      }
      return tx;
    }


  async receiveChangeTransaction(tx) {

    let txmsg = tx.returnMessage();
    let new_status = txmsg.request.split("_")[1];

    let sql = `UPDATE games SET status = '${new_status}' WHERE game_id = '${txmsg.game_id}'`;
    this.sendPeerDatabaseRequestWithFilter("Arcade", sql);

    //
    // update status if stored locally
    //
    let game = this.returnGame(newtx.game_id);
    if (game) { game.msg.request = new_status; }

    //
    // and re-display 
    //
    if (!tx.isFrom(this.app.wallet.returnPublicKey())) {
      if (this.isMyGame(tx)) {
        this.app.connection.emit('arcade-invite-manager-render-request', invites[i]);
      } else {
        if (new_status == "private") {
          this.removeGame(txmsg.game_id);
        } else {
          this.addGame(newtx, "open");
        }
        this.app.connection.emit('arcade-invite-manager-render-request', invites[i]);
      }
    };
  }
  */

  ///////////////
  // CHALLENGE //
  ///////////////
  //
  // a direct invitation from one player to another
  //
  /*
  createChallengeTransaction(gameData) {
    let ts = new Date().getTime();
    let accept_sig = this.app.crypto.signMessage(
      `invite_game_${ts}`,
      this.app.wallet.returnPrivateKey()
    );

    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();

    for (let sendto of gameData.players) {
      tx.transaction.to.push(new saito.default.slip(sendto, 0.0));
    }

    tx.msg = {
      ts: ts,
      module: "Arcade",
      request: "challenge",
      game: gameData.game,
      options: gameData.options,
      players_needed: gameData.players.length,
      players: [this.app.wallet.returnPublicKey()],
      players_sigs: [accept_sig],
      originator: this.app.wallet.returnPublicKey(),
      invitees: gameData.players,
    };

    tx = this.app.wallet.signTransaction(tx);

    return tx;

  }

  receiveChallengeTransaction(tx) {
    if (!tx.transaction || !tx.transaction.sig || !tx.msg) {
      return;
    }

    if (!tx.isTo(this.app.wallet.returnPublicKey())) {
      return;
    }

    this.addGame(tx, "open");

    let challenge = new ChallengeModal(app, this, tx);
    challenge.processChallenge(app, tx);

  }
  */





  /*
  Update the Games Table with a new list of players+signatures for the multiplayer game
  (works for adding or subtracting players and enforces consistent ordering)
  *****
  DO NOT DELETE THIS FUNCTION AGAIN UNLESS WE WANT TO GET RID OF MULTIPLAYER GAMES
  *****
  */
  async updatePlayerListSQL(id, keys, sigs) {

    if (!this.app.BROWSER) { 
    
      //Copy arrays to new data structures
      keys = keys.slice();
      sigs = sigs.slice();
      let players_array = keys.shift() + "/" + sigs.shift();

      if (keys.length !== sigs.length){
        console.error("Length mismatch");
      }

      while (keys.length > 0){
        let minIndex = 0;
        for (let i = 1; i < keys.length; i++){
          if (keys[i] < keys[minIndex]){
            minIndex = i;
          }
        }
        players_array += `_${keys.splice(minIndex,1)[0]}/${sigs.splice(minIndex,1)[0]}`;
      }

      let sql =  "UPDATE games SET players_array = $players_array WHERE game_id = $game_id";
      let params = {
        $players_array: players_array,
        $game_id: id,
      };

      await this.app.storage.executeDatabase(sql, params, "arcade");
    }
  }







  ///////////////////////////////
  // LOADING AND RUNNING GAMES //
  ///////////////////////////////

  //
  // single player game
  //
  async launchSinglePlayerGame(gameobj) {
    try {

      this.app.connection.emit("arcade-game-initialize-render-request");

      console.log(JSON.parse(JSON.stringify(gameobj)));

      let gameMod = this.app.modules.returnModule(gameobj.name);

      for (let i = 0; i < this.app.options?.games.length; i++) {
        if (this.app.options.games[i].module == gameobj.name) {
          this.app.connection.emit("arcade-game-ready-render-request", { name: gameobj.name, slug: gameMod.returnSlug(), id: this.app.options.games[i].id })
          return;
        }
      }

      let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
      tx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));

      tx.msg = {};
      tx.msg.request = "launch singleplayer";
      tx.msg.module = "Arcade";
      tx.msg.game = gameobj.name;
      tx = this.app.wallet.signTransaction(tx);
      this.app.network.propagateTransaction(tx);

      let game_id = await gameMod.initializeSinglePlayerGame(gameobj);

      for (let i = 0; i < this.app.options?.games.length; i++) {
        if (this.app.options.games[i].id == "" && this.app.options.games[i].name === gameMod.name) {
          this.app.options.games[i].id = game_id;
        }
      }

      this.app.connection.emit("arcade-game-ready-render-request", { name: gameobj.name, slug: gameMod.returnSlug(), id: game_id })

    } catch (err) {
      console.log(err);
      return;
    }

  }





  /************************************************************
  // functions to manipulate the local games list
  ************************************************************/

  //
  //Add a game (tx) to a specified list
  //
  addGame(tx, list = "open") {

    //
    // Sanity check the tx and make sure we don't already have it
    //
    if (!tx || !tx.msg || !tx.transaction || !tx.transaction.sig) {
      console.error("Invalid Game TX, won't add to list", tx);
      return false;
    }

    //Always removeGame before calling addGame to successfully reclassify 
    for (let key in this.games) {
      for (let z = 0; z < this.games[key].length; z++) {
        if (tx.transaction.sig === this.games[key][z].transaction.sig) {
           if (this.debug) { console.log("TX is already in Arcade list"); }
	         return;
	      }
      }
    }

    //Update the game status (open/private/active/close/over)
    tx.msg.request = list;

    //
    // Sanity check the target list so my games are grouped together
    //
    if (this.isMyGame(tx) && list !== "over" && list !== "close"){
      list = "mine";
    }

    if (!this.games[list]){
      this.games[list] = [];
    }

    // We want new games to go towards the top

    this.games[list].unshift(tx);

    if (this.debug){
      console.log(`Added game (${tx.transaction.sig}) to ${list}`, JSON.parse(JSON.stringify(this.games)));
    }
    
  }


  removeGame(game_id) {

    for (let key in this.games) {
      this.games[key] = this.games[key].filter(game => {
        if (game.transaction) {
          return game.transaction.sig != game_id;
        } else {
          return true;
        }
      });
    }

  }



  purgeBadGamesFromWallet() {
    if (this.app.options.games) {
      for (let i = this.app.options.games.length - 1; i >= 0; i--) {
        if (this.app.options.games[i].module === "" && this.app.options.games[i].id.length < 25) {
          this.app.options.games.splice(i, 1);
        }
      }
    }
  }


  //
  // Test whether the game_tx (from this.games) is of a game with all the players, 
  // includes me, and has saved a game module instantiation in my local storage
  //
  isAcceptedGame(game_id) {
    if (!game_id) { return false; }

    let game_tx = this.returnGame(game_id);

    if (!game_tx) { return false; }

    if (game_tx.msg.players_needed > game_tx.msg.players.length) { return false; }

    let is_my_game = false;  

    for (let i = 0; i < game_tx.msg.players.length; i++) {
      if (game_tx.msg.players[i] == this.app.wallet.returnPublicKey()) {
            is_my_game = true;
      }
    }

    if (is_my_game){
      for (let i = 0; i < this.app.options?.games?.length; i++){
        if (this.app.options.games[i].id === game_tx.transaction.sig){
          return true;
        }
      }
    }

    return false;
  }

  isAvailableGame(game_tx){
    if (game_tx.msg.request == "open" || game_tx.msg.request == "private" || game_tx.msg.request == "direct"){
      return true;
    }
    if (this.debug){
      console.log("Game cannot be joined or accepted");
    }
    return false;
  }

  //
  // Determines whether the user is in any way associated with the game
  // Either they sent the invite, they have clicked join, or someone specifically invited them by key
  //
  isMyGame(tx) {
    for (let i = 0; i < tx.transaction.to.length; i++) {
      if (tx.transaction.to[i].add == this.app.wallet.returnPublicKey()) { return true; }
    }
    for (let i = 0; i < tx.msg.players.length; i++) {
      if (tx.msg.players[i] == this.app.wallet.returnPublicKey()) { return true; }
    }
    if (tx.msg.options) {
      if (tx.msg.options.desired_opponent_publickey) {
        if (tx.msg.options.desired_opponent_publickey == this.app.wallet.returnPublicKey() || tx.msg.options.desired_opponent_publickey == this.app.keychain.returnIdentifierByPublicKey(this.app.wallet.returnPublicKey())) {
          return true;
        }
      }
    }
    return false;
  }


  
  returnGame(game_id) {

    for (let key in this.games) {

      let game = this.games[key].find((g) => g.transaction.sig == game_id);
      if (game) { 
        console.log(`Game found in ${key} list`);
        return game; 
      }
    }
    return null;
  }







  shouldAffixCallbackToModule(modname) {
    if (modname == "ArcadeInvite") { return 1; }
    if (modname == "Arcade") { return 1; }
    for (let i = 0; i < this.affix_callbacks_to.length; i++) {
      if (this.affix_callbacks_to[i] == modname) {
        //console.info("AFFIXING CALLBACKS TO: " + modname);
        return 1;
      }
    }
    return 0;
  }



  onResetWallet() {
    if (this.app.options?.games) {
      this.app.options.games = [];
    }
  }



  async verifyOptions(gameType, options) {
    if (gameType !== "single") {
      for (let key of ["mine", "open"]) {
        for (let game of this.games[key]) {
          if (this.isMyGame(game) && game.msg.players_needed > 1) {
            let c = await sconfirm(`You already have a ${game.msg.game} game open, are you sure you want to create a new game invite?`);
            if (!c) {
              return false;
            } else {
              return true;
            }
          }
          if (game.msg.game === options.game) {
            let c = await sconfirm(`There is an open invite for ${game.msg.game}, are you sure you want to create a new invite?`);
            if (!c) {
              return false;
            } else {
              return true;
            }
          }
        }
      }
    }

    //
    // if crypto and stake selected, make sure creator has it
    //
    try {
      if (options.crypto && parseFloat(options.stake) > 0) {
        let success = await this.game_crypto_transfer_manager.confirmBalance(this.app, this, options.crypto, options.stake);
        if (!success) {
          return false;
        }
      }
    } catch (err) {
      console.log("ERROR checking crypto: " + err);
      return false;
    }

    return true;
  }

  showShareLink(game_sig) {
    let data = {};
    let accepted_game = null;

    //Add more information about the game
    for (let key in this.games) {
      let x = this.games[key].find((g) => g.transaction.sig === game_sig);
      if (x) { accepted_game = x; }
    }

    if (accepted_game) {
      data.game = accepted_game.msg.game;
    } else {
      return;
    }

    //Create invite link from the game_sig
    let inviteLink = window.location.href;
    if (!inviteLink.includes("#")) {
      inviteLink += "#";
    }
    if (inviteLink.includes("?")) {
      inviteLink = inviteLink.replace("#", "&game_id=" + game_sig);
    } else {
      inviteLink = inviteLink.replace("#", "?game_id=" + game_sig);
    }

    data.invite_link = inviteLink;

    let game_invitation_link = new GameInvitationLink(this.app, this, data);
    game_invitation_link.render();

  }


  makeGameInvite(options, gameType = "open", invite_obj={}) {

    let game = options.game;
    let game_mod = this.app.modules.returnModule(game);
    let players_needed = options["game-wizard-players-select"];
    let desired_opponent_publickey = "";
    if (invite_obj.publickey) { desired_opponent_publickey = invite_obj.publickey; }

    //
    // add league_id to options if this is a league game
    // 
    if (invite_obj.league) {
      options.league_id = invite_obj.league.id;
    }

    if (!players_needed) {
      console.error("ERROR 582342: Create Game Error");
      return;
    }

    if (options["game-wizard-players-select-max"] && options["game-wizard-players-select-max"] < players_needed) {
      options["game-wizard-players-select"] = options["game-wizard-players-select-max"];
      options["game-wizard-players-select-max"] = players_needed;
      players_needed = options["game-wizard-players-select"];
    }

    let gamedata = {
      ts: new Date().getTime(),
      name: game,
      slug: game_mod.returnSlug(),
      options: options,
      players_needed: players_needed,
      invitation_type: gameType,
      desired_opponent_publickey: null
    };

    if (players_needed == 1) {
      this.launchSinglePlayerGame(gamedata); //Game options don't get saved....
    } else {

      if (gameType == "private" || gameType == "direct") {
        gamedata.invitation_type = "private";
      }

      if (gameType == "direct") {
        gamedata.desired_opponent_publickey = desired_opponent_publickey;
        let newtx = this.createOpenTransaction(gamedata, desired_opponent_publickey);

        this.app.connection.emit("arcade-launch-game-scheduler", newtx);
        return;
      }

      let newtx = this.createOpenTransaction(gamedata, desired_opponent_publickey);
      this.app.network.propagateTransaction(newtx);
      this.app.connection.emit("relay-send-message", { recipient: "PEERS", request: "arcade spv update", data: newtx.transaction });

      this.addGame(newtx, gamedata.invitation_type);

      this.app.connection.emit("arcade-invite-manager-render-request");

      if (gameType == "private") {
        this.showShareLink(newtx.transaction.sig);
      }
    }
  }





}

module.exports = Arcade;



