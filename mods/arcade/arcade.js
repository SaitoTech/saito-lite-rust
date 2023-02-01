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
    this.games['open'] = [];
    this.games['mine'] = [];

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

    /*
     This should not be here...
    */
    this.postScripts = [
      '/saito/lib/emoji-picker/emoji-picker.js'
    ];

    this.debug = true;
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
              request: "loaded",
              game: game.module,
              game_id: game.id,
              options: game.options,
              players: game.players,
              players_needed: game.players_needed,
              over: game.over,
              last_block: game.last_block,
            }

            game_tx.transaction.sig = game.id;
            game_tx.msg = msg;

            //
            // and add to list of my games
            //
            this.addGame(game_tx, "mine");
          }
        }
      }

      this.app.connection.emit('arcade-invite-manager-render-request');

    }
  }

  //
  // runs when we connect to a network client
  //
  onPeerHandshakeComplete(app, peer) {

    if (!app.BROWSER) { return; }
    let arcade_self = this;

    let cutoff = new Date().getTime() - this.old_game_removal_delay;

    //
    // For processing direct link to game invite
    //
    if (this.app.browser.returnURLParameter("game_id")) {
    
      let game_id = this.app.browser.returnURLParameter("game_id");    
      
      if (this.debug) { console.log("attempting to join game... " + game_id); }
      
      let invite_tx = null;

      let game = this.returnGame(game_id);
      if (game != null) {
/*
        if (this.isMyGame(game)) {
          if (this.isAccepted(game, this.app.wallet.returnPublicKey())) {
  	        let txmsg = game.returnMessage();
	          if (txmsg.players_needed > txmsg.players) {
	            this.waiting_game_overlay.invite_tx = game;
	            this.waiting_game_overlay.render();
	          } else {
	            this.continue_game_overlay.invite_tx = game;
	            this.continue_game_overlay.render();
	          }
	        } else {
	          this.continue_game_overlay.invite_tx = game;
	          this.continue_game_overlay.render();
	        }
	      }
*/
      } else {

        let sql = `SELECT * FROM games WHERE game_id = "${game_id}" AND created_at > ${cutoff}`;
console.log("SEND SQL: " + sql);
        this.sendPeerDatabaseRequestWithFilter("Arcade", sql, (res) => {

console.log("RECEIVE RES:");
console.log(JSON.stringify(res));

          if (res.rows) {

console.log("and passing into games");


            arcade_self.addGames(
              res.rows.map((row) => {
                if (row.status == "open" || row.status == "private") {
                  let newtx = new saito.default.transaction(JSON.parse(row.tx));
                  let player_info = row.players_array.split("_");
                  for (let pi of player_info){
                    let pair = pi.split("/");
                    let pkey = pair[0];
                    let sig = pair[1];
                    if (!newtx.msg.players.includes(pkey)){
                      newtx.msg.players.push(pkey);
                      newtx.msg.players_sigs.push(sig);
                    }
                  }
		              invite_tx = newtx;
                  return newtx;
                } else { return null; }
              })
            );

  	        if (invite_tx != null) {
  	          if (this.isMyGame(invite_tx)) {
  	            /*if (this.isAccepted(invite_tx, this.app.wallet.returnPublicKey())) {
  		            let txmsg = invite_tx.returnMessage();
  		            if (txmsg.players_needed > txmsg.players) {
  	                this.waiting_game_overlay.invite_tx = invite_tx;
  	                this.waiting_game_overlay.render();
  		            } else {
  	                this.continue_game_overlay.invite_tx = invite_tx;
  	                this.continue_game_overlay.render();
  		            }
  	            } else {
  	              this.continue_game_overlay.invite_tx = invite_tx;
  	              this.continue_game_overlay.render();
  	            }*/
  	          }
  	        } else {
              alert("Observer Overlay for URL Games not yet implemented");
  	        }
  	      }
        });
      }
    }

    //
    // load open games from server
    //
    let sql = `SELECT * FROM games WHERE status = "open" AND created_at > ${cutoff}`;
console.log(">>>");
console.log(">>>");
console.log(">>>");
console.log(sql);
    this.sendPeerDatabaseRequestWithFilter("Arcade", sql,
      (res) => {
console.log(" <<< ");
console.log(" <<< " + JSON.stringify(res));
        if (res.rows) {
          this.addGames(
            res.rows.map((row) => {
              let newtx = new saito.default.transaction(JSON.parse(row.tx));
              let player_info = row.players_array.split("_");
              for (let pi of player_info) {
                let pair = pi.split("/");
                let pkey = pair[0];
                let sig = pair[1];
                if (!newtx.msg.players.includes(pkey)) {
                  newtx.msg.players.push(pkey);
                  newtx.msg.players_sigs.push(sig);
                }
              }
              return newtx;
            }),
            "open"
          );

console.log("AND NOW WE CAN RENDER THE INVITE MANAGER!");

          this.app.connection.emit('arcade-invite-manager-render-request');
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
          icon: "fas fa-gamepad",
          allowed_mods: ["redsquare"],
          callback: function (app, id) {
            window.location = "/arcade";
          }
        },
        {
          text: "Create Game",
          icon: this.icon || "fas fa-gamepad",
          allowed_mods: ["arcade"],
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

        if (this.debug){
          console.log("ON CONFIRMATION:", JSON.parse(JSON.stringify(txmsg)));
        }

        //
        // public invites
        //
        if (txmsg.module === "Arcade" && txmsg.request == "open") {
          arcade_self.receiveOpenTransaction(tx, blk);
        }

        //
        // private invites
        //
        if (txmsg.module === "Arcade" && txmsg.request == "private") {
          arcade_self.receiveOpenTransaction(tx, blk);
        }

        //
        // private invites
        //
        if (txmsg.module === "ArcadeInvite" && txmsg.request == "private") {
          arcade_self.receiveOpenTransaction(tx, blk);
        }

        //
        // change status requests
        //
        if (txmsg.module == "Arcade" && txmsg.request.includes("change")) {
          arcade_self.receiveChangeTransaction(tx);
        }

        //
        // open msgs -- but private invitations
        //
        if (txmsg.module === "ArcadeInvite" && txmsg.request == "open" && tx.isTo(app.wallet.returnPublicKey())) {
          arcade_self.addGame(tx, "mine");
        }

        //
        // remove game from server
        //
        if (txmsg.request == "join") {
          arcade_self.receiveJoinTransaction(tx, blk);
        }

        //
        // cancel open invites
        //
        if (txmsg.module == "Arcade" && txmsg.request == "cancel") {
          arcade_self.receiveCancelTransaction(tx);
        }

        //
        // cancel games in-process
        //
        if (txmsg.module == "Arcade" && txmsg.request == "close") {
          arcade_self.receiveCloseTransaction(tx);
        }

        //
        // acceptances
        //
        if (txmsg.request === "accept") {
          arcade_self.receiveAcceptTransaction(tx);
        }

        //
        // game over
        //
        if (txmsg.request === "gameover") {
          if (txmsg.reason == "cancellation") {
            arcade_self.receiveCloseTransaction(tx);
          } else {
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
    let tx = null;

    //
    // this code doubles onConfirmation
    //
    if (message.request === "arcade spv update" || message.request === "game relay gameover") {

console.log("Arcade HPT: " + JSON.stringify(message));

      if (!message.data) {
        if (message.data) {
          tx = new saito.default.transaction(message.data);
        }
      }
      if (tx == null) {
        tx = new saito.default.transaction(message.data);
      }

      let txmsg = tx.returnMessage();

      if (this.debug){
          console.log("HANDLE PEER REQUEST:", JSON.parse(JSON.stringify(txmsg)));
      }


      //
      // TODO - review - unsure of when this triggers (david, xmas '22)
      //
      // cancel open games
      //
      if (txmsg.module == "Arcade" && txmsg.request == "close") {
        this.receiveCloseTransaction(tx);
        if (!tx.isFrom(app.wallet.returnPublicKey())) {
          if (!tx.isTo(app.wallet.returnPublicKey())) {
            if (tx.transaction.relayed != 1) {
              tx.transaction.relayed = 1;
              if (app.BROWSER == 0 && app.SPVMODE == 0) {
                this.notifyPeers(tx);
              }
            }
          }
        }
        return;
      }

      //
      // only servers notify lite-clients
      //
      if (app.BROWSER == 0 && app.SPVMODE == 0) {
        this.notifyPeers(tx);
      }

      //
      // open msgs -- public invitations
      //
      if (txmsg.module === "Arcade" && txmsg.request == "open") {
        this.receiveOpenTransaction(tx);
      }

      // private invitation - daniel 4/2022
      if (txmsg.module === "Arcade" && txmsg.request == "private") {
        this.receiveOpenTransaction(tx); // blk = null
      }

      if (txmsg.module == "Arcade" && txmsg.request.includes("change")) {
        this.receiveChangeTransaction(tx);
      }

      if (txmsg.request == "join") {
        this.receiveJoinTransaction(tx);
      }

      if (txmsg.request == "accept") {
        this.receiveAcceptTransaction(tx);
      }

      if (txmsg.request == "challenge") {
        this.receiveChallengeTransaction(tx);
      }

      //
      // TODO - reimplement / check
      //
      //      if (txmsg.request == "sorry"){
      //        app.connection.emit("arcade-reject-challenge", txmsg.game_id);
      //      }

      //
      // process gameovers
      //
      if (txmsg.request == "gameover") {
        if (txmsg.reason == "cancellation") {
          this.receiveCloseTransaction(tx);
        } else {
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

    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    if (recipient != "") { tx.transaction.to.push(new saito.default.slip(sendto, 0.0)); }

    tx.msg = {
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
      console.log("Creating Game Invite: ", JSON.parse(JSON.stringify(tx.msg)));
    }

    tx = this.app.wallet.signTransaction(tx);

    return tx;
  }

  async receiveOpenTransaction(tx, blk = null) {
    
    //
    // add to games list
    //
    if (this.isMyGame(tx)) {
      this.addGame(tx, "mine");
    } else {
      this.addGame(tx, "open");
    }

    if (this.app.BROWSER){
      this.app.connection.emit("arcade-invite-manager-render-request");
      return;      
    }

    //
    // Only the arcade service node (non-browser) needs to bother executing SQL
    //

    let txmsg = tx.returnMessage();
   
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

    if (!game) { return; }
    if (!game.msg) { return; }

    if (this.debug){
      console.log(`Removing Player (${tx.transaction.from[0].add}) from Game: `, JSON.parse(JSON.stringify(game.msg)));
    }

    if (game.msg.players.includes(tx.transaction.from[0].add)) {
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

  sendCancelTransaction(game_id) {

    let game = this.returnGame(game_id);

    let close_tx = this.createCancelTransaction(game);
    this.app.network.propagateTransaction(close_tx);

    this.app.connection.emit("send-relay-message", { recipient: game.msg.players, request: "arcade spv update", data: close_tx.transaction });
    this.app.connection.emit("send-relay-message", { recipient: "PEERS", request: "arcade spv update", data: close_tx.transaction });
 
  }


  ////////////////////////////////////////////////////////////////////
  // Close -- a signal to kill the game with no winner/loser recorded
  /////////////////////////////////////////////////////////////////////

  createCloseTransaction(orig_tx) {

    let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
 
    for (let player of orig_tx.msg.players){
      newtx.transaction.to.push(new saito.default.slip(player, 0.0));  
    }
    newtx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));

    let msg = {
      request: "close",
      module: "Arcade",
      game_id: orig_tx.transaction.sig,
    };

    newtx.msg = msg;
    newtx = this.app.wallet.signTransaction(newtx);

    return newtx;

  }

  async receiveCloseTransaction(tx) {
    
    let txmsg = tx.returnMessage();
    let id = txmsg.game_id;
    
    this.removeGame(id);  

    if (this.app.BROWSER){
      return;  
    }
    
    let sql = `UPDATE games SET status = $status WHERE game_id = $game_id AND status != 'over'`;
    let params = { $status: "close", $game_id: id };
    await this.app.storage.executeDatabase(sql, params, "arcade");
  
  
  }


  sendCloseTransaction(game_id) {

    let game = this.returnGame(game_id);

    let close_tx = this.createCloseTransaction(game);
    this.app.network.propagateTransaction(close_tx);

    this.app.connection.emit("send-relay-message", { recipient: game.msg.players, request: "arcade spv update", data: close_tx.transaction });
    this.app.connection.emit("send-relay-message", { recipient: "PEERS", request: "arcade spv update", data: close_tx.transaction });

  }









  ////////////
  // Invite // TODO -- confirm we still use these, instead of challenge
  ////////////
  //
  // unsure
  //
  createInviteTransaction(gametx) {

    let txmsg = gametx.returnMessage();

    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    tx.transaction.to.push(new saito.slip(gametx.transaction.from[0].add, 0.0));
    tx.transaction.to.push(new saito.slip(this.app.wallet.returnPublicKey(), 0.0));
    tx.msg.ts = "";
    tx.msg.module = txmsg.game;
    tx.msg.request = "invite";
    tx.msg.game_id = gametx.transaction.sig;
    tx.msg.players_needed = parseInt(txmsg.players_needed);
    tx.msg.options = txmsg.options;
    tx.msg.accept_sig = "";
    if (gametx.msg.accept_sig != "") {
      tx.msg.accept_sig = gametx.msg.accept_sig;
    }
    if (gametx.msg.ts != "") {
      tx.msg.ts = gametx.msg.ts;
    }
    tx.msg.invite_sig = this.app.crypto.signMessage(("invite_game_" + tx.msg.ts), this.app.wallet.returnPrivateKey());
    tx = this.app.wallet.signTransaction(tx);

    return tx;

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
  createJoinTransaction(gametx) {
    let txmsg = gametx.returnMessage();

    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    for (let player of txmsg.players){
      tx.transaction.to.push(new saito.default.slip(player, 0.0));  
    }
    tx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));

    tx.msg = JSON.parse(JSON.stringify(txmsg));
    tx.msg.request = "join";
    tx.msg.module = txmsg.game;
    tx.msg.status = txmsg.request;
    tx.msg.game_id = gametx.transaction.sig;

    tx.msg.invite_sig = this.app.crypto.signMessage(
      "invite_game_" + gametx.msg.ts,
      this.app.wallet.returnPrivateKey()
    );

    tx = this.app.wallet.signTransaction(tx);

    return tx;
  }

  receiveJoinTransaction(tx = null, blk = null, conf = 0) {

    let txmsg = tx.returnMessage();
    let game_id = txmsg.game_id;
    let game = this.returnGame(game_id);

    if (this.debug){
      console.log(`Adding Player (${tx.transaction.from[0].add}) to Game: `, JSON.parse(JSON.stringify(game)));
    }

    if (!tx.transaction) { return; }
    if (!tx.transaction.sig) { return; }
    if (txmsg.over == 1) { return; }
    if (!game) { return; }

    //
    // add player to game
    //

    if (!game.msg.players.includes(tx.transaction.from[0].add)) {
      if (txmsg.invite_sig != "") {
        game.msg.players.push(tx.transaction.from[0].add);
        if (!game.msg.players_sigs) { this.games[i].msg.players_sigs = []; }
        game.msg.players_sigs.push(txmsg.invite_sig);
      }
    }

    //
    // in this case the first player sends a transaction to trigger the
    // start of the game.
    //

    let number_of_willing_players = game.msg.players.length;
    let number_of_players_needed = game.msg.players_needed;

    if (this.debug){
      console.log(JSON.stringify(game.msg.players));
      console.log("NUMBER OF WILLING PLAYERS IN THIS GAME: " + number_of_willing_players);
      console.log("NUMBER OF PLAYERS NEEDED IN THIS GAME: " + number_of_players_needed);
    }

    if (number_of_willing_players >= number_of_players_needed) {
      if (game.msg.players[0] == this.app.wallet.returnPublicKey()) {
        game.msg.players.splice(0, 1);
        game.msg.players_sigs.splice(0, 1);
        let newtx = this.createAcceptTransaction(game);
        this.app.network.propagateTransaction(newtx);
        this.app.connection.emit("send-relay-message", { recipient: "PEERS", request: "arcade spv update", data: newtx.transaction });
        this.app.connection.emit("send-relay-message", { recipient: game.msg.players, request: "arcade spv update", data: newtx.transaction });
      }
    }


    this.app.connection.emit("arcade-invite-manager-render-request");
  }


  /////////////////
  // ACCEPT GAME //
  /////////////////
  //
  // this transaction should be a valid game that has signatures from everyone
  // and is capable of initializing a game. if this TX is valid and has our
  // signature we will auto-accept it, kicking off the game.
  //
  createAcceptTransaction(gametx) {
    let txmsg = gametx.returnMessage();

    let accept_sig = this.app.crypto.signMessage(
      "invite_game_" + txmsg.ts,
      this.app.wallet.returnPrivateKey()
    );

    txmsg.players.push(this.app.wallet.returnPublicKey());
    txmsg.players_sigs.push(accept_sig);

    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    for (let i = 0; i < txmsg.players.length; i++) {
      tx.transaction.to.push(new saito.default.slip(txmsg.players[i], 0.0));
    }

    tx.msg = JSON.parse(JSON.stringify(txmsg));
    tx.msg.module = txmsg.game;
    tx.msg.status = txmsg.request;
    tx.msg.game_id = gametx.transaction.sig;
    tx.msg.request = "accept";

    tx = this.app.wallet.signTransaction(tx);

    return tx;
  }

  async receiveAcceptTransaction(tx) {

    let txmsg = tx.returnMessage();
    if (txmsg.over) { return; }

    let game_id = txmsg.sig || txmsg.game_id;

    let gamemod = this.app.modules.returnModule(txmsg.game);
    if (!gamemod) { return; }

    //
    // browsers
    //
    if (this.app.BROWSER == 1) {

      //
      // only process transactions for us
      //
      if (!tx.isTo(this.app.wallet.returnPublicKey())) { return; }

      //
      // do not re-accept old games
      //
      for (let i = 0; i < this.app?.options?.games?.length; i++) {
        if (this.app.options.games[i].id == txmsg.game_id) {
          let currentTime = new Date().getTime();
          if (currentTime - this.app.options.games[i].ts > 5000) {
            console.log("ERROR 4132: nope out of old game");
            return;
          }
        }
      }

      //
      // remove from open list
      //
      let game = this.returnGame(txmsg.game_id);
      this.removeGame(txmsg.game_id);
      this.addGame(game, "mine");

    }

    //
    // non-browsers
    //
    if (this.app.BROWSER == 0) {

      let sql = `UPDATE games SET status = $status WHERE game_id = $game_id`;
      let params = { $status: "active", $game_id: game_id };
      await this.app.storage.executeDatabase(sql, params, "arcade");

    }


    //
    // kick-off game
    //
    if (txmsg.players.includes(this.app.wallet.returnPublicKey())) {
      this.app.connection.emit("arcade-game-initialize-render-request", (txmsg.game_id));
      siteMessage(txmsg.module + ' invite accepted.', 20000);
      let game_id = await gamemod.processAcceptRequest(tx, this.app);
      //if (!game_id) {
      //  await sconfirm("Something went wrong with the game initialization, reload: " + game_id);
      //}
    }

  }

  ////////////
  // CHANGE //
  ////////////
  //
  // requesting that this.app.network.peers update the state of the game in any
  // index of available games that they maintain.
  //
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


  ///////////////
  // CHALLENGE //
  ///////////////
  //
  // a direct invitation from one player to another
  //
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

  //////////////
  // GAMEOVER //
  //////////////
  //
  // remove the game from our list of active games and mark the game
  // as closed in any index.
  //
  async receiveGameoverTransaction(tx) {
    let txmsg = tx.returnMessage();
    let id = txmsg.sig || txmsg.game_id;
    this.removeGame(id);
    let sql = `UPDATE games SET status = $status, winner = $winner WHERE game_id = $game_id`;
    let params = { $status: "over", $winner: txmsg.winner, $game_id: id };
    await this.app.storage.executeDatabase(sql, params, "arcade");
  }





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
  // launch multiplayer games
  //
  async launchGame(game_id) {

    if (!game_id && !this.viewing_arcade_initialization_page) {
      if (this.browser_active) {
        this.app.connection.emit("arcade-game-initialize-render-request");
      }
      this.viewing_arcade_initialization_page = 1;
      return;
    }

    if (this.app.options?.games) {
      for (let i = 0; i < this.app.options.games.length; i++) {
        if (this.app.options.games[i].id == game_id) {
          if (this.app.options.games[i].initializing == 0) {

            let ready_to_go = 1;

            if (this.app.wallet.wallet.pending.length > 0) {
              for (let j = 0; j < this.app.wallet.wallet.pending.length; j++) {
                let thistx = new saito.default.transaction(JSON.parse(this.app.wallet.wallet.pending[j]));
                let thistxmsg = thistx.returnMessage();

                if (thistxmsg.module == this.app.options.games[i].module && thistxmsg.game_id == game_id && thistxmsg?.step?.game) {
                  ready_to_go = 0;
                  if (thistxmsg?.step?.game <= this.app.options.games[i].step.game) {
                    ready_to_go = 1;
                  }
                }
              }
            }

            if (ready_to_go) {
              if (this.browser_active) {
                this.app.connection.emit("arcade-game-initialized", (game_id));
              } else {
                let gm = this.app.modules.returnModule(this.app.options.games[i].module);
                if (gm) {
                  let game_name = gm.gamename || gm.name;
                  this.app.connection.emit("arcade-game-initialized", (game_id));
                  let go = await sconfirm(`${game_name} is ready. Join now?`);
                  if (go) {
                    this.app.browser.logMatomoEvent("Arcade", "SaitoConfirmStartGame", this.app.options.games[i].module);
                    window.location = "/" + gm.returnSlug();
                  }
                }
              }

              let hidden = "hidden";
              if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
                hiddenTab = "hidden";
              } else if (typeof document.msHidden !== "undefined") {
                hiddenTab = "msHidden";
              } else if (typeof document.webkitHidden !== "undefined") {
                hiddenTab = "webkitHidden";
              }

              this.startNotification("Game ready!", this.app.options.games[i].module);

              if (document[hidden]) {
                this.ringTone();
              }
            }
          }
        }
      }
    }
  }

  //
  // single player game
  //
  async launchSinglePlayerGame(app, gameobj) {
    try {

      if (app.options.games) {
        for (let i = 0; i < app.options.games.length; i++) {
          if (app.options.games[i].module == gameobj.name) {
            this.launchGame(app.options.games[i].id);
            return;
          }
        }
      }

      let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
      tx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));

      tx.msg = {};
      tx.msg.request = "launch singleplayer";
      tx.msg.module = gameobj.name;
      tx = this.app.wallet.signTransaction(tx);
      this.app.network.propagateTransaction(tx);

      let gameMod = app.modules.returnModule(gameobj.name);
      let game_id = await gameMod.initializeSinglePlayerGame(gameobj);

      if (this.app.options.games != undefined) {
        for (let i = 0; i < this.app.options.games.length; i++) {
          if (this.app.options.games[i].id == "" && this.app.options.games[i].name === gameMod.name) {
            this.app.options.games[i].id = game_id;
          }
        }
      }

      this.launchGame(game_id);

    } catch (err) {
      console.log(err);
      return;
    }

  }








  ///////////////
  // WEBSERVER //
  ///////////////
  //
  // creates some optional routes that are useful for fetching saved information
  //
  webServer(app, expressapp, express) {

    super.webServer(app, expressapp, express);

    const fs = app.storage.returnFileSystem();
    const path = require('path');

    if (fs != null) {

      expressapp.get('/arcade/keystate/:game_id/:player_pkey', async (req, res) => {

        let sql = "SELECT * FROM gamestate WHERE game_id = $game_id AND player = $playerpkey ORDER BY id DESC LIMIT 1";
        let params = {
          $game_id: req.params.game_id,
          $playerpkey: req.params.player_pkey
        }
        let games = await app.storage.queryDatabase(sql, params, "arcade");

        if (games.length > 0) {
          console.info('### Write @ arcade line 1337;');
          let game = games[0];
          res.setHeader('Content-type', 'text/html');
          res.charset = 'UTF-8';
          res.write(game.game_state.toString());
          res.end();
          return;
        }
      });

      expressapp.get('/arcade/restore/:game_id/:player_pkey', async (req, res) => {

        let sql = "SELECT * FROM gamestate WHERE game_id = $game_id ORDER BY id DESC LIMIT 10";
        let params = { $game_id: req.params.game_id }
        let games = await app.storage.queryDatabase(sql, params, "arcade");

        let stop_now = 0;
        let games_to_push = [];
        let recovering_pkey = "";

        try {
          if (req.params.player_pkey != undefined) { recovering_pkey = req.params.pkayer_pkey; }
        } catch (err) { }

        if (games.length > 0) {
          for (let z = 0; z < games.length; z++) {
            let game = games[z];
            if (game.player_pkey == recovering_pkey) { stop_now = 1; } else { games_to_push.push(game.state); }
            if (recovering_pkey == "" || stop_now == 1) { z = games.length + 1; }
          }
          console.info('### Write @ arcade line 1367;');
          res.setHeader('Content-type', 'text/html');
          res.charset = 'UTF-8';
          res.write(JSON.stringify(games_to_push));
          res.end();
          return;
        }

      });

      expressapp.get('/arcade/invite/:gameinvite', async (req, res) => {
        res.setHeader('Content-type', 'text/html');
        res.sendFile(path.resolve(__dirname + '/web/invite.html'));
      });

    }
  }










  /************************************************************
  // functions to manipulate the local games list
  ************************************************************/

  validateGame(tx) {
    if (!tx || !tx.msg || !tx.transaction || !tx.transaction.sig) {
      return false;
    }

    if (tx.msg.over == 1) {
      return false;
    }

    for (let i = 0; i < this.games.length; i++) {
      if (tx.transaction.sig === this.games[i].transaction.sig) {
        console.log("TX is already in Arcade list");
        return false;
      }
    }

    return true;
  }



  //
  //Add a game (tx) to a specified list
  //
  addGame(tx, list = "open") {

    if (!this.games[list])   { this.games[list] = []; }
    if (!this.games["open"]) { this.games["open"] = []; }
    if (!this.games["mine"]) { this.games["mine"] = []; }

    for (let key in this.games) {
      for (let z = 0; z < this.games[key].length; z++) {
        if (tx.transaction.sig === this.games[key][z].transaction.sig) {
	         return;
	      }
      }
    }

    if (this.validateGame(tx)) {
      this.games[list].push(tx);
    }
  }


  addGames(txs, list = "open") {
    if (!this.games[list]) { this.games[list] = []; }
    if (!this.games["open"]) { this.games["open"] = []; }
    if (!this.games["mine"]) { this.games["mine"] = []; }
    txs.forEach((tx, i) => {
      let for_us = false;
      let valid_game = this.validateGame(tx);
      if (valid_game) {
        if (list == "mine") {
          if (this.isMyGame(tx)) {
	    let already_exists = 0;
	    for (let i = 0; i < this.games["mine"].length; i++) {
	      if (tx.transaction.sig === this.games["mine"][i].transaction.sig) {
		already_exists = 1;
	      }
	    }
	    if (already_exists == 0) {
              this.games["mine"].unshift(tx);
            }
          }
        } else {
	  let already_exists = 0;
	  for (let i = 0; i < this.games["mine"].length; i++) {
	    if (tx.transaction.sig === this.games["mine"][i].transaction.sig) {
	      already_exists = 1;
	    }
	  }
	  if (already_exists == 0) {
            this.games[list].unshift(tx);
          }
        }
      }
    });
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

    if (game_tx.msg.players.length > game_tx.msg.players_sigs.length) { return false; }
    if (game_tx.msg.players_needed > game_tx.msg.players.length) { return false; }

    let is_my_game = false;  

    for (let i = 0; i < game_tx.msg.players.length; i++) {
      if (game_tx.msg.players[i] == publickey) {
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
      if (tx.msg.options.players_invited) {
        tx.msg.options.players_invited.forEach(player => {
          if (player == this.app.wallet.returnPublicKey() || player == this.app.keys.returnIdentifierByPublicKey(this.app.wallet.returnPublicKey())) {
            return true;
          }
        });
      }
    }
    return false;
  }

  removeGame(game_sig, list) {
console.log("START: " + JSON.stringify(this.games));
    if (!this.games[list]) { this.games[list] = []; }
    for (let key in this.games) {
      this.games[key] = this.games[key].filter(game => {
        if (game.transaction) {
          return game.transaction.sig != game_sig;
        } else {
          return true;
        }
      });
    }
console.log("FINISH: " + JSON.stringify(this.games));
    // save local game references

    // and let us know we can redraw
    this.app.connection.emit('arcade-invite-manager-render-request');
  }


  
  returnGame(game_id) {
    for (let key in this.games) {
      let game = this.games[key].find((g) => g.transaction.sig == game_id);
      if (game) { return game; }
    }
    return null;
  }





  async saveGameState(blk, tx, conf, app) {

    let txmsg = tx.returnMessage();
    let game_state = "";

    try {
      if (txmsg.game_state) { game_state = txmsg.game_state; }
    } catch (err) {
      console.log("ERROR 4131232: error saving game state");
      return;
    }

    let sql = `INSERT INTO gamestate (
                game_id ,
                player ,
                players_array ,
                module ,
                bid ,
                tid ,
                lc ,
                sharekey ,
                game_state ,
                tx ,
                last_move
       ) VALUES (
                $game_id,
                $player,
                $players_array,
                $module,
                $bid,
                $tid,
                $lc,
                "",
                $game_state,
                $tx ,
                $last_move
        )`;
    let x = [];
    let txto = tx.transaction.to;
    for (let z = 0; z < txto.length; z++) {
      if (!x.includes(txto[z].add)) { x.push(txto[z].add); }
    }

    //
    // add any move associated with this tx to the
    // gamestate so that it can be executed to pull
    // us up-to-date on what happened in preparation
    // for the next turn / broadcast
    //
    game_state.last_turn = txmsg.turn;


    //
    // do not save 1-player games
    //
    if (x.length == 1) { return; }

    let players_array = x.join("_");

    let params = {
      $game_id: txmsg.game_id,
      $player: tx.transaction.from[0].add,
      $players_array: players_array,
      $module: txmsg.module,
      $bid: blk.block.id,
      $tid: tx.transaction.id,
      $lc: 1,
      $game_state: JSON.stringify(game_state),
      $tx: JSON.stringify(tx.transaction),
      $last_move: (new Date().getTime())
    };

    await this.app.storage.executeDatabase(sql, params, "arcade");



    //
    // periodically prune
    //
    if (Math.random() < 0.005) {
      let current_ts = new Date().getTime();
      let one_week_ago = current_ts - 640000000;
      let delete_sql = "SELECT game_id FROM gamestate WHERE last_move < $last_move GROUP BY game_id ORDER BY last_move ASC";
      let delete_params = { $last_move: one_week_ago };
      let rows3 = await this.app.storage.queryDatabase(delete_sql, delete_params, "arcade");

      if (rows3) {
        if (rows3.length > 0) {
          for (let i = 0; i < rows3.length; i++) {
            let game_id = rows3[i].game_id;
            let purge_sql = "DELETE FROM gamestate WHERE game_id = $game_id";
            let purge_params = { $game_id: game_id };
            await this.app.storage.executeDatabase(purge_sql, purge_params, "arcade");
          }
        }
      }

      //
      // purge old games
      //
      let current_timestamp = new Date().getTime() - 1200000;
      let sql5 = "DELETE FROM games WHERE status = 'open' AND created_at < $adjusted_ts";
      let params5 = { $adjusted_ts: current_timestamp }
      await this.app.storage.executeDatabase(sql5, params5, 'arcade');

      let sql6 = "DELETE FROM invites WHERE created_at < $adjusted_timestamp";
      let params6 = { $adjusted_ts: current_timestamp }
      await this.app.storage.executeDatabase(sql6, params6, 'arcade');

    }

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


  startNotification(msg, game) {
    //If we haven't already started flashing the tab
    if (!this.tabInterval) {
      this.tabInterval = setInterval(() => {
        if (document.title === game) {
          document.title = msg;
        } else {
          document.title = game;
        }
      }, 575);
    }
  }


  updateIdentifier() {
  }

  onResetWallet() {
    if (this.app.options) {
      this.app.options.games = [];
    }
  }



  async verifyOptions(gameType, options) {
    if (gameType !== "single") {
      for (let key in this.games) {
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

    let game_invitation_link = new GameInvitationLink(app, this, data);
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
      this.launchSinglePlayerGame(this.app, gamedata); //Game options don't get saved....
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
      this.app.connection.emit("send-relay-message", { recipient: "PEERS", request: "arcade spv update", data: newtx.transaction });

      this.addGame(newtx, "mine");

      this.app.connection.emit("arcade-invite-manager-render-request");

      if (gameType == "private") {
        this.showShareLink(newtx.transaction.sig);
      }
    }
  }




  ringTone() {
    var context = new AudioContext(),
      gainNode = context.createGain(),
      start = document.querySelector('#start'),
      stop = document.querySelector("#stop"),
      oscillator = null,
      harmony = null;

    var volume = context.createGain();
    volume.connect(context.destination);
    gainNode.connect(context.destination);

    //Play first note
    oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setTargetAtTime(523.25, context.currentTime, 0.001);
    gainNode.gain.setTargetAtTime(0.5, context.currentTime, 0.001);
    oscillator.connect(gainNode);
    oscillator.start(context.currentTime);

    harmony = context.createOscillator();
    //harmony.type = "sawtooth";
    harmony.frequency.value = 440;
    volume.gain.setTargetAtTime(0.6, context.currentTime, 0.001);
    harmony.start();
    harmony.connect(volume);

    //Play Second note
    setTimeout(() => {
      oscillator.frequency.setTargetAtTime(659.25, context.currentTime, 0.001);
    }, 350);
    //Play Third note
    setTimeout(() => {
      oscillator.frequency.setTargetAtTime(329.63, context.currentTime, 0.001);
      gainNode.gain.setTargetAtTime(0.8, context.currentTime, 0.01);
    }, 750);
    //Play fourth note
    setTimeout(() => {
      oscillator.frequency.setTargetAtTime(415.3, context.currentTime, 0.001);
      harmony.frequency.setTargetAtTime(554.37, context.currentTime, 0.001);
    }, 1100);
    //Fade out
    setTimeout(() => {
      volume.gain.setTargetAtTime(0, context.currentTime, 0.25);
      gainNode.gain.setTargetAtTime(0, context.currentTime, 0.25);
    }, 1300);
    //To silence
    setTimeout(() => {
      oscillator.stop(context.currentTime);
      oscillator.disconnect();
      harmony.stop(context.currentTime);
      harmony.disconnect();
    }, 3000);

  }


}

module.exports = Arcade;



