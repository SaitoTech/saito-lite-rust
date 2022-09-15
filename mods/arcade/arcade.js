const saito = require("./../../lib/saito/saito");
const SaitoOverlay = require("../../lib/saito/ui/saito-overlay/saito-overlay");
const ModTemplate = require("../../lib/templates/modtemplate");
const ArcadeMain = require("./lib/arcade-main/arcade-main");
const ArcadeSidebar = require("./lib/arcade-sidebar/arcade-sidebar");
const GameCreateMenu = require("./lib/arcade-main/game-create-menu");
const ArcadeGameSidebar = require("./lib/arcade-sidebar/arcade-game-sidebar");
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");
const ArcadeContainerTemplate = require("./lib/arcade-main/templates/arcade-container.template");
const ArcadeLink = require("./lib/arcade-main/arcade-link");
const ArcadeAppspace = require("./lib/appspace/main");
const JSON = require("json-bigint");
const fetch = require("node-fetch");
const GameInvite = require('./lib/invite/main');


class Arcade extends ModTemplate {

  constructor(app) {
    super(app);
    this.name = "Arcade";
    this.description = "Interface for creating and joining games coded for the Saito Open Source Game Engine.";
    this.categories = "Games Entertainment";

    this.mods = [];
    this.affix_callbacks_to = [];
    this.games = []; //Game Invites
    //this.observer = [];
    this.old_game_removal_delay = 2000000;
    this.initialization_timer = null;
    this.services = [{ service: "arcade", domain: "saito" }];

    this.viewing_arcade_initialization_page = 0;
    this.viewing_game_homepage = ""; //// this.app.browser.returnURLParameter("game");

    this.chat_open = 0;

    this.icon_fa = "fas fa-gamepad";

    this.accepted = [];

    this.description = "A place to find, play and manage games!";
    this.categories = "Games Utilities";

    this.active_tab = "arcade";
    this.manual_ordering = false; // Toggle this to either sort games by their categories or go by the module.config order

    this.header = null;
    this.overlay = null;
    this.debug = true;

    //So we can keep track of games which we want to close but are waiting on game engine to process
    this.game_close_interval_cnt = 0;
    this.game_close_interval_queue = [];
    this.game_close_interval_id = null;



  }


  receiveEvent(type, data) {
    if (type == "chat-render-request") {
      if (this.browser_active) {
        if (this.app.options.auto_open_chat_box == undefined) {
          this.app.options.auto_open_chat_box = 1;
          this.app.storage.saveOptions();
        }
        //this.renderSidebar();
          let chat_mod = this.app.modules.returnModule("Chat");
          if (chat_mod){
            if (chat_mod.groups && 
                chat_mod.groups.length > 0 &&
                this.chat_open == 0 &&
                this.app.options.auto_open_chat_box
             ) {
              this.chat_open = 1;
              chat_mod.openChats();
          }
        }
      }
    }
  }

/*  handleUrlParams(urlParams) {
    let i = urlParams.get("i");
    if (i == "watch") {
      let msg = urlParams.get("msg");
      this.observeGame(msg, 0);
    }
  }
*/

  renderArcadeMain() {
    if (this.browser_active == 1) {
      if (this.viewing_arcade_initialization_page == 0) {
        ArcadeMain.render(this.app, this);
        ArcadeMain.attachEvents(this.app, this);
        if (this.viewing_game_homepage) {
          ArcadeGameSidebar.attachEvents(this.app, this);
        }
      }
    }else{
      //
      // red square wanna render?
      //
      this.app.connection.emit('game-invite-render-request');

    }
  }

  renderSidebar() {
    if (this.viewing_game_homepage) {
      ArcadeGameSidebar.render(this.app, this);
      ArcadeGameSidebar.attachEvents(this.app, this);
    } else {
      ArcadeSidebar.render(this.app, this);
      ArcadeSidebar.attachEvents(this.app, this);
    }
  }

  respondTo(type = "") {
    let arcade_mod = this;
    if (type === "invite") {
      return new GameInvite(this.app, this);
    }
    if (type == "header-menu") {
      if (this.browser_active) {
        return {
          returnMenu: function (app, mod) {
            return `
              <div class="wallet-action-row" id="header-dropdown-create-game">
                <span class="scan-qr-info"><i class="settings-fas-icon fas fa-star"></i> Create Game</span>
              </div>`;
          },
          attachEvents: function (app, mod) {
            document.querySelectorAll("#header-dropdown-create-game").forEach((element) => {
              element.onclick = (e) => {
                GameCreateMenu.render(app, mod);
                GameCreateMenu.attachEvents(app, mod);
              };
            });
          },
        };
      }
    }
    if (type == "header-dropdown") {
      return {
        name: this.appname ? this.appname : this.name,
        icon_fa: this.icon_fa,
        browser_active: this.browser_active,
        slug: this.returnSlug(),
      };
    }

    //    if (type == "appspace") {
    //      this.scripts['/arcade/new-style.css'];
    //      super.render(this.app, this); // for scripts + styles
    //      return new ArcadeAppspace(this.app, this);
    //    }
    return null;
  }

  initialize(app) {
    super.initialize(app);

    //
    // add my own games (as fake txs)
    //
    if (this.app.options.games != null) {
      for (let z = 0; z < this.app.options.games.length; z++) {
        let game = this.app.options.games[z];
        if (game.over == 0 && (game.players_set != 1 || game.players.includes(app.wallet.returnPublicKey()) || game.accepted.includes(app.wallet.returnPublicKey()))) {
          this.addGameToOpenList(this.createGameTXFromOptionsGame(game));
        }
      }
    }

    //
    // hack to force forum to onPeerHandShake
    //
    try {
      let post_mod = this.app.returnModule("Post");
      post_mod.renderMethod = "arcade";
    } catch (err) { }

    //
    // listen for txs from arcade-supporting games
    //
    this.app.modules.respondTo("arcade-games").forEach((mod) => {
      this.affix_callbacks_to.push(mod.name);
    });

    app.connection.on("join-game", (game_id)=>{
      ArcadeMain.joinGame(app, this, game_id);
    });
  }

  initializeHTML(app) {
    this.header = new SaitoHeader(app, this);
  }

  checkGameDatabase(){
    if (!this.app.BROWSER){return;}

    let cutoff = new Date().getTime() - this.old_game_removal_delay;
    let sql = `SELECT * FROM games WHERE created_at > ${cutoff}`;
    this.sendPeerDatabaseRequestWithFilter("Arcade", sql, (res) => {
      if (res.rows) {
        for (let i = 0; i < res.rows.length; i++) {
          console.log(JSON.parse(JSON.stringify(res.rows[i])));
        }
      } else {
        console.log("No games in the database");
      }
    }
    );
  }

  //
  // load transactions into interface when the network is up
  onPeerHandshakeComplete(app, peer) {
    // fetch any usernames needed
    if (this.app.BROWSER) {
      app.browser.addIdentifiersToDom();
    }


    let arcade_self = this;
    let cutoff = new Date().getTime() - this.old_game_removal_delay;

    //If following an invite link, look for the game_id in question

    if (this.browser_active && this.app.browser.returnURLParameter("jid")) {
      let gameId = this.app.browser.returnURLParameter("jid");
      if (this.debug) { console.log("attempting to join game... " + gameId); }

      let sql = `SELECT * FROM games WHERE game_id = "${gameId}" AND created_at > ${cutoff}`;
      this.sendPeerDatabaseRequestWithFilter("Arcade", sql, (res) => {
        if (res.rows) {
          arcade_self.addGamesToOpenList(
            res.rows.map((row) => {
              if (arcade_self.debug) { console.log(JSON.parse(JSON.stringify(row))); };
              if (row.status == "open" || row.status == "private") {
                let newtx = new saito.default.transaction(JSON.parse(row.tx));
                //Update players/players_sigs in TX Message from SQL data
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
                return newtx;
              } else { return null; }
            })
          );
          ArcadeMain.joinGame(arcade_self.app, arcade_self, gameId);
        }
      });
    }

    //
    // load open games from server
    //
    let sql = `SELECT * FROM games WHERE status = "open" AND created_at > ${cutoff}`;
    if (this.viewing_game_homepage) {
      //let gameslug = app.browser.returnURLParameter("game");
      let gamemod = app.modules.returnModuleBySlug(this.viewing_game_homepage);
      sql = `SELECT * FROM games WHERE status = "open" AND created_at > ${cutoff} AND module = "${gamemod.name}"`;
    }

    this.sendPeerDatabaseRequestWithFilter("Arcade", sql,
      (res) => {
        if (res.rows) {
          this.addGamesToOpenList(
            res.rows.map((row) => {
              if (arcade_self.debug) {
                console.log("onPeerHandshakeComplete -> peerDatabaseRequest -> addGamesToOpenList");
                console.log(JSON.parse(JSON.stringify(row)));
                console.log(JSON.parse(row.tx));
              }
              let newtx = new saito.default.transaction(JSON.parse(row.tx));
              //Update players/players_sigs in TX Message from SQL data
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

              return newtx;
            })
          );
        }
      }
    );

    //if (this.debug) {this.checkGameDatabase();}

  }

  //
  //
  // ON CONNECTION STABLE
  //
  // this function runs "connect" event
  onConnectionStable(app, peer) {
    siteMessage("Connection Restored", 1500);
  }

  //
  //
  // ON CONNECTION UNSTABLE
  //
  // this function runs "disconnect" event
  onConnectionUnstable(app, peer) {
    siteMessage("Connection Unstable", 3000);
  }

  async render(app) {
    if (!document.getElementById("arcade-container")) {
      app.browser.addElementToDom(ArcadeContainerTemplate());
    }

    if (this.header == null) {
      this.header = new SaitoHeader(app, this);
    }
    if (this.overlay == null) {
      this.overlay = new SaitoOverlay(app);
    }

    this.header.render(app, this);
    this.header.attachEvents(app, this);

    this.viewing_game_homepage = app.browser.returnURLParameter("game");

    this.renderSidebar();
    this.renderArcadeMain();
  }

  isMyGame(invite, app) {
    for (let i = 0; i < invite.msg.players.length; i++) {
      if (invite.msg.players[i] == app.wallet.returnPublicKey()) {
        return true;
      }
    }
    return false;
  }

  //
  // purge any bad games from options file
  //
  purgeBadGames(app) {
    if (app.options?.games) {
      for (let i = app.options.games.length - 1; i >= 0; i--) {
        if (app.options.games[i].module === "" && app.options.games[i].id.length < 25) {
          app.options.games.splice(i, 1);
        }
        //Possibly a bad idea, but necessary?
        if (app.options.games[i].over === 1) {
          app.options.games.splice(i, 1);
        }
      }
    }
  }

  notifyPeers(app, tx) {
    // lite-clients can skip
    if (app.BROWSER == 1) {
      return;
    }
    for (let i = 0; i < app.network.peers.length; i++) {
      if (app.network.peers[i].peer.synctype == "lite") {
        //
        // fwd tx to peer
        //
        let message = {};
        message.request = "arcade spv update";
        message.data = {};
        message.data.tx = tx;
        app.network.peers[i].sendRequest(message.request, message.data);
      }
    }
  }

  /*
  Process a join request
  */
  joinGame(app, tx) {
    if (!tx.transaction || !tx.transaction.sig || !tx.msg || tx.msg.over == 1) {
      return;
    }

    let txmsg = tx.returnMessage();
    let game_id = txmsg.game_id;

    if (this.debug){ console.log("Received Join Message for game="+game_id,JSON.parse(JSON.stringify(tx)));}

    //Check if game exists
    let accepted_game = null;
    for (let i = 0; i < this.games.length; i++) {
      if (this.games[i].transaction.sig == game_id) {
        accepted_game = this.games[i]; //cache a refence to the game in the module
      }
    }
    if (accepted_game == null){
      console.log("Game not available",this.games);
      return;
    }

    let { players } = (accepted_game) ? accepted_game.returnMessage() : [];

    if (this.debug) { console.log(JSON.parse(JSON.stringify(players))); }

    this.joinGameOnOpenList(tx); //Update Arcade hero to reflect new player
    
    if (this.debug) { 
      console.log(JSON.parse(JSON.stringify(players))); 
      this.checkGameDatabase();
    }

    //We only nope out for service-nodes here because we want those to process joinGameOnOpenList
    if (this.app.BROWSER == 0 || !accepted_game.msg.players.includes(app.wallet.returnPublicKey())){
      return;
    }


    //
    // it is possible that we have multiple joins that bring us up to
    // the required number of players, but that did not arrive in the
    // one-by-one sequence needed for the last player to trigger an
    // "accept" request instead of another "join".
    //
    // in this case the last player sends an accept request which triggers
    // the start of the game automatically.
    
    let number_of_willing_players = accepted_game.msg.players.length;
    let number_of_players_needed = accepted_game.msg.players_needed;

    console.log("NUMBER OF WILLING PLAYERS IN THIS GAME: " + number_of_willing_players);
    console.log("NUMBER OF PLAYERS NEEDED IN THIS GAME: " + number_of_players_needed);

    if (number_of_willing_players >= number_of_players_needed) {
      //
      // first player is the only one with a guaranteed consistent order in all
      // browsers -- cannot use last player to join as players may disagree on
      // their order. so the first player is responsible for processing the "accept"
      //
      console.log(JSON.parse(JSON.stringify(accepted_game.msg.players)));

      if (accepted_game.msg.players[0] == this.app.wallet.returnPublicKey()) {
        // i should send an accept request to kick this all off
        let relay_mod = app.modules.returnModule("Relay");
        let peers = [];
        for (let i = 0; i < app.network.peers.length; i++) {
          peers.push(app.network.peers[i].returnPublicKey());
        }

        
        //Creating an accepttransaction will push these back on the end of the array
        accepted_game.msg.players.splice(0, 1);
        accepted_game.msg.players_sigs.splice(0, 1);

        console.log(this.app.wallet.returnPublicKey()+" sends the accept message from arcade");
        let newtx = this.createAcceptTransaction(accepted_game);
        this.app.network.propagateTransaction(newtx);

        // try fast accept
        if (relay_mod != null) {
          relay_mod.sendRelayMessage(accepted_game.msg.players, "arcade spv update", newtx);
          relay_mod.sendRelayMessage(peers, "arcade spv update", newtx);
        }
      }
      //
      // launch init
      //
      this.launchGame(txmsg.game_id);
      return;
    }

  }


  async acceptGame(app, tx) {
    let txmsg = tx.returnMessage();

    let gamemod = this.app.modules.returnModule(txmsg.game);
    
    if (!gamemod){
      console.error("Game module not found!");
      return;
    }

    // game is over, we don't care
    if (txmsg.over) {
      console.log("Game is already over, cannot accept");
      return;
    }

    //Before we nope out, we need to test the gamemod for whether or not to run stuff
    if (!gamemod.opengame){
      this.receiveAcceptRequest(null, tx, 0, app);
      this.removeGameFromOpenList(txmsg.game_id);
    }

    // do not process if transaction is not for us
    if (!tx.isTo(app.wallet.returnPublicKey()) || this.app.BROWSER == 0) {
      return;
    }


    // do not re-accept if game is really old (sanity check)
    for (let i = 0; i < this.app?.options?.games?.length; i++) {
      if (this.app.options.games[i].id == txmsg.game_id) {
        if (this.app.options.games[i].initializing == 0) { //Is that right, I don't know if this condition can be true
          let currentTime = new Date().getTime();
          if (currentTime - this.app.options.games[i].ts > 5000) {
            return;
          }
        }
        return;
      }
    }


    if (txmsg.players.includes(app.wallet.returnPublicKey())) {

      if (this.debug) { console.log("ALREADY SHOWING LOADER? " + this.viewing_arcade_initialization_page); }

      if (this.browser_active) {
        GameLoader.render(app, this);   
      }else{
        app.connection.emit("arcade-game-loading");
        siteMessage(txmsg.module + ' invite accepted.', 20000);
      }
      
      if (this.debug){
        console.info("MY CREATED GAMES: ", this.app?.options?.games);
        console.log("telling game module to receiveAcceptTx");
      }


      //Kick off game loader
      this.launchGame(txmsg.game_id);
      //Create Game Here
      let game_id = await gamemod.processAcceptRequest(tx, this.app);
      
      if (!game_id) {
        console.log("Game template returned a null game_id"); 
        await sconfirm("Something went wrong with the game initialization, reload?");
        window.location.reload();
      }
    }
  }

  //
  // MESSY -- not deleting immediately
  //
  async onConfirmation(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();

    try {
      if (conf == 0) {
        this.purgeBadGames(app);

        //
        // notify SPV clients of "open", "join" and "close"(, and "accept") messages
        //
        if (
          app.BROWSER == 0 && (txmsg.request == "open" ||
            txmsg.request == "join" ||
            txmsg.request == "accept" ||
            txmsg.request == "close" ||
            txmsg.request == "private" ||
            txmsg.request.includes("change"))
        ) {
          if (this.doesGameExistLocally(tx.transaction.sig)) {
            if (this.debug) { console.log("SERVER NOTIFY PEERS"); }
            this.notifyPeers(app, tx);
          }
        }

        //
        // open msgs -- public invitations
        //
        if (txmsg.module === "Arcade" && txmsg.request == "open") {
          if (this.debug) { console.log("onConfirmation: open invite received"); }
          this.addGameToOpenList(tx);
          this.receiveOpenRequest(blk, tx, conf, app);
        }

        //
        // private invites -- daniel 4/2022
        if (txmsg.module === "Arcade" && txmsg.request == "private") {
          if (this.debug) { console.log("onConfirmation: private invite received"); }
          this.receiveOpenRequest(blk, tx, conf, app);
        }
        if (txmsg.module == "Arcade" && txmsg.request.includes("change")) {
          if (this.debug) { console.log("onConfirmation: change event type"); }
          this.receiveChangeRequest(blk, tx, conf, app);
        }

        //
        // open msgs -- private invitations
        //
        if (txmsg.module === "ArcadeInvite" && txmsg.request == "open" && tx.isTo(app.wallet.returnPublicKey())) {
          this.addGameToOpenList(tx);
        }

        //
        // remove game from server
        //
        if (txmsg.request == "join") {
          if (this.debug) { console.log("onConfirmation: join request received"); }
          this.joinGame(app, tx);
        }

        //
        // cancel open games
        //
        if (txmsg.module == "Arcade" && txmsg.request == "close") {
          if (this.debug) { console.log("onConfirmation: close request received"); }
          this.closeGameInvite(blk, tx, conf, app);
        }

        //
        // acceptances
        //
        if (txmsg.request === "accept") {
          if (this.debug) { console.log("onConfirmation: accept game received"); }
          this.acceptGame(app, tx);
        }
      
      if (txmsg.request === "gameover") {
        //Process Gameovers
        this.viewing_arcade_initialization_page = 0; //Make sure can restore arcade main
        if (txmsg.reason == "cancellation") {
          this.receiveCloseRequest(blk, tx, conf, app); //Update SQL Database  
        } else {
          this.receiveGameoverRequest(blk, tx, conf, app); //Update SQL Database  
        }
        if (this.debug) { console.log("Game over (On Chain), removing game"); }
      }

      }
    } catch (err) {
      console.log("ERROR in arcade: " + err);
    }
  }

  async handlePeerRequest(app, message, peer, mycallback = null) {
    //
    // this code doubles onConfirmation
    //

    if (message.request === "arcade spv update" || message.request === "game relay gameover") {
        let tx = null;

        if (!message.data.tx) {
          if (message.data.transaction) {
            tx = new saito.default.transaction(message.data.transaction);
          }
        }

        if (tx == null) {
          tx = new saito.default.transaction(message.data.tx.transaction);
        }

        let txmsg = tx.returnMessage();
        let conf = 0;
        let blk = null;


      //
      // cancel open games
      //
      if (txmsg.module == "Arcade" && txmsg.request == "close") {
        // try to give game over message
        if (this.debug) {
          console.log("handlePeerRequest: close request received");
          console.log(JSON.parse(JSON.stringify(txmsg)));
        }

        this.closeGameInvite(blk, tx, conf, app);

        if (!tx.isFrom(app.wallet.returnPublicKey())) {
          // NOTIFY MY PEERS -- server notifying clients
          if (!tx.isTo(app.wallet.returnPublicKey())) {
            if (tx.transaction.relayed != 1) {
              tx.transaction.relayed = 1;
              if (app.BROWSER == 0 && app.SPVMODE == 0) {
                this.notifyPeers(app, tx);
              }
            }
          }
        }
        return;
      }


      // only servers notify lite-clients
      if (app.BROWSER == 0 && app.SPVMODE == 0) {
        this.notifyPeers(app, tx);
      }

      //
      // open msgs -- public invitations
      //
      if (txmsg.module === "Arcade" && txmsg.request == "open") {
        if (this.debug) { console.log("handlePeerRequest: open invite received"); }
        if (!this.doesGameExistLocally(tx.transaction.sig)) {
          this.addGameToOpenList(tx);
          this.receiveOpenRequest(blk, tx, conf, app);
        }
      }

      // private invitation - daniel 4/2022
      if (txmsg.module === "Arcade" && txmsg.request == "private") {
        if (this.debug) { console.log("handlePeerRequest: private invite received"); }
        if (!this.doesGameExistLocally(tx.transaction.sig)) {
          this.receiveOpenRequest(blk, tx, conf, app);
        }
      }

      if (txmsg.module == "Arcade" && txmsg.request.includes("change")) {
        if (this.debug) { console.log("handlePeerRequest: change request received"); }
        this.receiveChangeRequest(blk, tx, conf, app);
      }

      // join msgs -- add myself to game list
      if (txmsg.request == "join") {
        if (this.debug) { console.log("handlePeerRequest: join request received"); }
        this.joinGame(app, tx);
      }

      // accept msgs -- remove games from list
      if (txmsg.request == "accept") {
        if (this.debug) { console.log("handlePeerRequest: accept request received"); }
        this.acceptGame(app, tx);
      }

      console.log(txmsg);

      //Process Gameovers
      if (txmsg.request == "gameover"){
        this.viewing_arcade_initialization_page = 0; //Make sure can restore arcade main
        if (txmsg.reason == "cancellation") {
          this.receiveCloseRequest(blk, tx, conf, app); //Update SQL Database  
        } else {
          this.receiveGameoverRequest(blk, tx, conf, app); //Update SQL Database  
        } 
        if (this.debug) { console.log("Game over (RELAY), removing game"); }
      }

    } // end message.request == "arcade spv update"


    /*if (message.request == "rawSQL" && app.BROWSER == 0 && message.data.module == "Arcade") {
      //
      // intercept a very particular query
      //
      if (message.data.sql.indexOf("is_game_already_accepted") > -1) {
        if (this.debug) { console.log("DOING a pseudo SQL query"); }
        let game_id = message.data.game_id;

        let res = {};
        res.rows = [];
        console.log("ACCEPTED PROPERTY:");
        console.log(this.accepted);
        if (this.accepted[game_id] > 0) {
          if (this.accepted[game_id] > 2) {
            //
            // check required of players_needed vs. players_accepted
            //
            let sql3 = `SELECT status FROM games WHERE game_id = $game_id`;
            let params3 = { $game_id: game_id };
            let rows3 = await this.app.storage.queryDatabase(sql3, params3, "arcade");
            if (rows3) {
              if (rows3.length > 0) {
                if (rows3[0].status === "open" || rows3[0].status === "private") {
                  this.accepted[game_id] = 0;
                  res.rows.push({ game_still_open: 1 });
                  mycallback(res);
                  return;
                }
              }
            }
          }

          this.accepted[game_id]++;
          res.rows.push({ game_still_open: 0 });
        } else {
          this.accepted[game_id] = 1;
          res.rows.push({ game_still_open: 1 });
        }

        mycallback(res);
        return;
      }
    }*/

    super.handlePeerRequest(app, message, peer, mycallback);
  }

  doesGameExistLocally(game_id) {
    if (this.app.options) {
      if (this.app.options.games) {
        for (let i = 0; i < this.app.options.games.length; i++) {
          if (this.app.options.games[i].id === game_id) {
            return 1;
          }
        }
      }
    }
    return 0;
  }


  /*
  If the game is generated, it is stored in saito app.options.games, if it is still open for people to join
  it is in arcade_mod.games
  */
  closeGameInvite(blk, tx, conf, app) {
    let found_game = false;
    let game_id = tx.returnMessage().game_id;
    console.log("Arcade receiving close request for " + game_id);

    let accepted_game = this.games.find((g) => g.transaction.sig === game_id);
    if (accepted_game) {
      if (accepted_game.transaction.from[0].add == tx.transaction.from[0].add) {
        if (this.debug) { console.log("Canceling invitation for an uninitialized game"); }
        this.receiveCloseRequest(blk, tx, conf, app); //Update SQL to mark game as closed
      } else {
        if (this.debug) { console.log("Changed mind about joining the game"); }
        this.leaveGameOnOpenList(tx);
      }
    } else {
      if (this.debug) { console.log("Game not found, cannot cancel"); }
      this.receiveCloseRequest(blk, tx, conf, app);
    }

    //Force close in wallet if game was created
    app.options.games.forEach(g => {
      if (g.id === game_id) {
        console.log("Mark game closed in options");
        g.over = 1;
      }
    });

    //Refresh Arcade Main
    if (this.viewing_arcade_initialization_page == 0 && this.browser_active == 1) {
      this.renderArcadeMain();
    }
    if (this.debug) {
      this.checkGameDatabase();
    }
  }

  async receiveOpenRequest(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();
    //
    // add to games table
    //
    let game_id = tx.transaction.sig;

    if (this.debug) {
      console.log(`Arcade: Storing new ${txmsg.request} game: ` + game_id);
    }
    if (this.app.BROWSER){
      return;
    }

    let players_needed = 2;
    if (parseInt(txmsg.players_needed) > 2) {
      players_needed = parseInt(txmsg.players_needed);
    }
    let module = txmsg.game;
    let options = {};
    if (txmsg.options != undefined) {
      options = txmsg.options;
    }
    let game_status = txmsg.request; //"open" or "private"
    let player = tx.transaction.from[0].add;
    let players_array = player;
    let start_bid = 1;
    if (blk != null) {
      start_bid = blk.block.id;
    }
    let valid_for_minutes = 60;
    let created_at = parseInt(tx.transaction.ts);
    let expires_at = created_at + 60000 * parseInt(valid_for_minutes);
    let acceptance_sig = "/";
    if (txmsg.players_sigs.length > 0) {
      acceptance_sig += txmsg.players_sigs[0];
    }
    players_array += acceptance_sig;

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
      $game_id: game_id,
      $players_needed: parseInt(players_needed),
      $players_array: players_array,
      $module: module,
      $status: game_status,
      $options: options,
      $tx: JSON.stringify(tx.transaction),
      $start_bid: start_bid,
      $created_at: created_at,
      $expires_at: expires_at,
      $winner: "",
    };
    await app.storage.executeDatabase(sql, params, "arcade");

    return;
  }


  async receiveAcceptRequest(blk, tx, conf, app) {
    if (app.BROWSER) {return;}
    let txmsg = tx.returnMessage();
    let id = txmsg.sig || txmsg.game_id;
    if (this.debug) { console.log("Mark game as started " + id); }
    let sql = `UPDATE games SET status = $status WHERE game_id = $game_id`;
    let params = { $status: "active", $game_id: id };
    await app.storage.executeDatabase(sql, params, "arcade");
  }

  async receiveCloseRequest(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();
    let id = txmsg.sig || txmsg.game_id;
    this.removeGameFromOpenList(id);            //remove from arcade.games[]
    this.checkCloseQueue(id);

    if (app.BROWSER) {return;}
    if (this.debug) { console.log("Close game " + id); }
    let sql = `UPDATE games SET status = $status WHERE game_id = $game_id`;
    let params = { $status: "close", $game_id: id };
    console.log(sql, params);
    await app.storage.executeDatabase(sql, params, "arcade");
  }

  async receiveGameoverRequest(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();
    let id = txmsg.sig || txmsg.game_id;
    this.removeGameFromOpenList(id);            //remove from arcade.games[]
    this.checkCloseQueue(id);

    if (app.BROWSER) {return;}
    if (this.debug) { console.log("Resign game " + JSON.stringify(id)); }
    let sql = `UPDATE games SET status = $status, winner = $winner WHERE game_id = $game_id`;
    let params = { $status: "over", $winner: txmsg.winner, $game_id: id };
    console.log(sql, params);
    await app.storage.executeDatabase(sql, params, "arcade");
  }

  checkCloseQueue(game_id) {
    if (this.game_close_interval_id) {
      console.log("Are we waiting on " + game_id);
      for (let i = this.game_close_interval_queue.length - 1; i >= 0; i--) {
        if (this.game_close_interval_queue[i] == game_id) {
          this.game_close_interval_queue.splice(i, 1);
        }
      }
      if (this.game_close_interval_queue.length == 0) {
        clearInterval(this.game_close_interval_id);
        this.game_close_interval_id = null;
      }
    }
  }

  async receiveChangeRequest(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();
    let new_status = txmsg.request.split("_")[1];
    if (this.debug) {
      console.log(txmsg);
      console.log("RECEIVING CHANGE REQUEST to " + new_status);
    }

    let sql1 = `SELECT * FROM games WHERE game_id = "${txmsg.game_id}"`;
    let orig_status = "";

    this.sendPeerDatabaseRequestWithFilter("Arcade", sql1, async (res) => {
      if (res.rows && res.rows.length > 0) {
        let orig_status = res.rows[0].status;
        let newtx = new saito.default.transaction(JSON.parse(res.rows[0].tx));

        if (this.debug) {
          console.log(res.rows[0]);
          console.log(`Changing status from ${orig_status} to ${new_status}`);
        }

        let sql2 = `UPDATE games SET status = '${new_status}' WHERE game_id = '${txmsg.game_id}'`;
        this.sendPeerDatabaseRequestWithFilter("Arcade", sql2);

        for (let i = 0; i < this.games.length; i++) {
          if (this.games[i].transaction) {
            if (this.games[i].transaction.sig == newtx.game_id) {
              if (this.games[i].msg) {
                this.games[i].msg.request = new_status;
              }
            }
          }
        }

        if (tx.isFrom(this.app.wallet.returnPublicKey())) {
          if (this.debug) { console.log("I sent the message"); }
        } else {
          if (this.isMyGame(tx, app)) {
            this.renderArcadeMain();
          } else {
            if (this.debug) { console.log("I need to update my browser"); }
            if (new_status == "private") {
              this.removeGameFromOpenList(txmsg.game_id);
            } else {
              this.addGameToOpenList(newtx); //maybe the right transaction
            }
          }
        }
      }
    });
  }

  createOpenTransaction(gamedata, recipient = "") {
    let sendto = this.app.wallet.returnPublicKey();
    let moduletype = "Arcade";

    /* Current deprecated, save for possible future resurrection
    if (recipient != "") {
      sendto = recipient;
      moduletype = "ArcadeInvite";
    }
    */
    let { ts, name, options, players_needed, invitation_type } = gamedata;

    let requestMsg = invitation_type == "private" ? "private" : "open";

    let accept_sig = this.app.crypto.signMessage(
      `invite_game_${ts}`,
      this.app.wallet.returnPrivateKey()
    );

    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    tx.transaction.to.push(new saito.default.slip(sendto, 0.0));
    tx.msg = {
      ts: ts,
      module: moduletype,
      request: requestMsg,
      game: name,
      options: options,
      players_needed: parseInt(players_needed),
      players: [this.app.wallet.returnPublicKey()],
      players_sigs: [accept_sig],
      originator: this.app.wallet.returnPublicKey(),
    };
    tx = this.app.wallet.signTransaction(tx);

    return tx;
  }

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

  createJoinTransaction(gametx) {
    let txmsg = gametx.returnMessage();

    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    tx.transaction.to.push(new saito.default.slip(gametx.transaction.from[0].add, 0.0));
    tx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));
    tx.msg.ts = "";
    tx.msg.module = txmsg.game;
    tx.msg.request = "join";
    tx.msg.game_id = gametx.transaction.sig;
    tx.msg.players_needed = parseInt(txmsg.players_needed);
    tx.msg.options = txmsg.options;
    tx.msg.invite_sig = this.app.crypto.signMessage(
      "invite_game_" + gametx.msg.ts,
      this.app.wallet.returnPrivateKey()
    );
    if (gametx.msg.ts != "") {
      tx.msg.ts = gametx.msg.ts;
    }
    tx = this.app.wallet.signTransaction(tx);

    return tx;
  }

  createAcceptTransaction(gametx) {
    let txmsg = gametx.returnMessage();

    let accept_sig = this.app.crypto.signMessage(
      "invite_game_" + txmsg.ts,
      this.app.wallet.returnPrivateKey()
    );
    txmsg.players.push(this.app.wallet.returnPublicKey());
    txmsg.players_sigs.push(accept_sig);
    txmsg.request = "accept";

    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    for (let i = 0; i < txmsg.players.length; i++) {
      tx.transaction.to.push(new saito.default.slip(txmsg.players[i], 0.0));
    }
    //tx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));

    tx.msg = txmsg;
    tx.msg.game_id = gametx.transaction.sig;
    tx.msg.request = "accept";
    tx.msg.module = txmsg.game;
    tx = this.app.wallet.signTransaction(tx);

    return tx;
  }


  async launchSinglePlayerGame(app, gameobj) {
    try {

      let arcade_self = this;
      GameLoader.render(app, arcade_self);

      let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
      tx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));

      tx.msg = {};
      tx.msg.request = "launch singleplayer";
      tx.msg.module = gameobj.name;
      tx = this.app.wallet.signTransaction(tx);
      this.app.network.propagateTransaction(tx);

      let gameMod = app.modules.returnModule(gameobj.name);
      let game_id = await gameMod.initializeSinglePlayerGame(gameobj);

      GameLoader.render(app, arcade_self, game_id);
      GameLoader.attachEvents(app, arcade_self);

    } catch (err) {
      console.log(err);
      return;
    }

    //window.location = "/" + gameobj.slug;
    //return;
  }

  launchGame(game_id) {

    if (this.browser_active == 0) {
      return;
    }

    let arcade_self = this;
    if (arcade_self.initialization_timer == null) { //In case accepting player runs launchGame twice
      arcade_self.initialization_timer = setInterval(() => {
        console.log("in init timer!");

        let game_idx = -1;
        if (arcade_self.app.options?.games) {
          for (let i = 0; i < arcade_self.app.options.games.length; i++) {
            if (arcade_self.app.options.games[i].id == game_id) {
              game_idx = i;
            }
          }

          //
          // we hit this if we have the sufficient number of joins but
          // are waiting for the original creator to hit the accept tx
          //
          if (game_idx == -1) {
            console.log("keep loading game!");
            GameLoader.render(arcade_self.app, arcade_self, -1);
            return;
          }

          if (arcade_self.app.options?.games[game_idx].initializing == 0) {
            //
            // check we don't have a pending TX for this game...
            //
            let ready_to_go = 1;

            if (arcade_self.app.wallet.wallet.pending.length > 0) {
              for (let i = 0; i < arcade_self.app.wallet.wallet.pending.length; i++) {
                let thistx = new saito.default.transaction(JSON.parse(arcade_self.app.wallet.wallet.pending[i]));
                let thistxmsg = thistx.returnMessage();

                if (thistxmsg.module == arcade_self.app.options.games[game_idx].module && thistxmsg.game_id == arcade_self.app.options.games[game_idx].id) {
                  console.log("message is: " + JSON.stringify(thistxmsg));
                  ready_to_go = 0;
                  if (thistxmsg?.step?.game <= arcade_self.app.options.games[game_idx].step.game) {
                    ready_to_go = 1;
                  }
                }
              }
            }

            if (ready_to_go == 0) {
              console.log("transaction for this game still pending...");
              return;
            } else {
              clearInterval(arcade_self.initialization_timer);
              arcade_self.initialization_timer = null;
              GameLoader.render(arcade_self.app, arcade_self, game_id);
              GameLoader.attachEvents(arcade_self.app, arcade_self);

              let hidden = "hidden";
              if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
                hiddenTab = "hidden";
              } else if (typeof document.msHidden !== "undefined") {
                hiddenTab = "msHidden";
              } else if (typeof document.webkitHidden !== "undefined") {
                hiddenTab = "webkitHidden";
              }

              arcade_self.startNotification("Game ready!", arcade_self.app.options.games[game_idx].module);

              if (document[hidden]) {
                arcade_self.ringTone();
              }
            }
          }
        }
      }, 500);
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


  /**
   * given a game from app.options.games creates the transaction wrapper
   * so that addGameToOpenList works (i.e. inserts into [arcade.]games list and re-renders ArcadeMain so that game displays)
   */
  createGameTXFromOptionsGame(game) {
    let game_tx = new saito.default.transaction();

    //
    // ignore games that are over
    //
    if (this.debug) { console.info("GAME OVER: " + game.over + ", LAST BLOCK: " + game.last_block + ", Game ID: " + game.id); }

    if (game.over) {
      if (game.last_block > 0) {
        return;
      }
    }

    if (game.players) {
      game_tx.transaction.to = game.players.map((player) => new saito.default.slip(player));
      game_tx.transaction.from = game.players.map((player) => new saito.default.slip(player));
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
    };

    game_tx.transaction.sig = game.id;
    game_tx.msg = msg;
    // screws up sig
    //game_tx = this.app.wallet.signTransaction(game_tx);

    return game_tx;
  }

  removeOldGames() {
    let removed_old_games = 0;

    // if the game is very old, remove it
    for (let i = 0; i < this.games.length; i++) {
      let remove_this_game = 0;
      let include_this_game = 0;

      if (this.games[i].msg?.players?.includes(this.app.wallet.returnPublicKey())) {
        include_this_game = 1;
      }

      if (include_this_game == 0) {
        let gamets = parseInt(this.games[i].transaction.ts);
        let timepassed = new Date().getTime() - gamets;
        if (timepassed > this.old_game_removal_delay) {
          remove_this_game = 1;
        }
      }

      if (remove_this_game == 1 && include_this_game == 0) {
        this.games.splice(i, 1);
        removed_old_games = 1;
        i--;
      }
    }
    return removed_old_games;
  }

  // just receive the sig of the game to remove
  removeGameFromOpenList(game_sig) {
    if (this.debug) { console.log("Removing " + game_sig); }
    this.games = this.games.filter((game) => {
      if (game.transaction) {
        return game.transaction.sig != game_sig;
      } else {
        return true;
      }
    });

    this.renderArcadeMain();
  }

  isForUs(tx) {
    if (!tx) {
      return false;
    }

    let txmsg = tx.returnMessage(this.app);
    if (!txmsg) {
      return false;
    }

    let for_us = true;

    if (txmsg.options.players_invited) {
      for_us = false;
      if (tx.transaction.from[0].add == this.app.wallet.returnPublicKey()) {
        for_us = true;
      } else {
        tx.returnMessage().options.players_invited.forEach((player) => {
          if (
            player == this.app.wallet.returnPublicKey() ||
            player == this.app.keys.returnIdentifierByPublicKey(this.app.wallet.returnPublicKey())
          ) {
            for_us = true;
          }
        });
      }
    }
    return for_us;
  }

  validateGame(tx) {
    if (!tx) {
      return false;
    }

    if (!tx.transaction) {
      return false;
    } else {
      if (!tx.transaction.sig) {
        return false;
      }
      if (tx.msg.over == 1) {
        return false;
      }
    }
    for (let i = 0; i < this.games.length; i++) {
      let transaction = Object.assign({ sig: "" }, this.games[i].transaction);

      if (tx.transaction.sig == transaction.sig) {
        return false;
      }
      if (tx.returnMessage().game_id != "" && tx.returnMessage().game_id == transaction.sig) {
        return false;
      }
      if (tx.returnMessage().game_id === this.games[i].transaction.sig) {
        console.log("ERROR 480394: not re-adding existing game to list");
        return false;
      }
    }
    return true;
  }

  /*
    Called both in arcade and arcade-main
    Adds player to list of players for the multiplayer game
  */
  joinGameOnOpenList(tx) {
    if (!tx.transaction || !tx.transaction.sig || !tx.msg || tx.msg.over == 1) {
      return;
    }

    let txmsg = tx.returnMessage();
    if (this.debug) { console.log(`Player ${tx.transaction.from[0].add} wants to join game ${txmsg.game_id} with message signed ${txmsg.invite_sig}`); }

    console.log(this.games);
    for (let i = 0; i < this.games.length; i++) {
      if (this.games[i]?.transaction.sig == txmsg.game_id) {
        if (!this.games[i].msg.players.includes(tx.transaction.from[0].add) && txmsg.invite_sig) {
          //Add sender of join request to player list
          this.games[i].msg.players.push(tx.transaction.from[0].add);
          //Make sure player_sigs array exists and add invite_sig
          this.games[i].msg.players_sigs = this.games[i].msg.players_sigs || [];
          this.games[i].msg.players_sigs.push(txmsg.invite_sig);

          this.updatePlayerList(txmsg.game_id, this.games[i].msg.players, this.games[i].msg.players_sigs);
        }
      }
    }


    try {
      if (this.browser_active) {
        if (this.debug) { console.log("Player should get added to arcade hero"); }
        this.renderArcadeMain(this.app, this);
      }
    } catch (err) {
      console.log("Non-fatal error rendering open game list");
    }
  }

  leaveGameOnOpenList(tx) {
    if (!tx.transaction || !tx.transaction.sig || !tx.msg || tx.msg.over == 1) {
      return;
    }

    let txmsg = tx.returnMessage();
    let game_id = txmsg.sig || txmsg.game_id;
    console.log(`Player ${tx.transaction.from[0].add} wants out of game ${game_id}`);
    for (let i = 0; i < this.games.length; i++) {
      if (this.games[i]?.transaction.sig == game_id) {
        if (this.games[i].msg.players.includes(tx.transaction.from[0].add)) {
          let p_index = this.games[i].msg.players.indexOf(tx.transaction.from[0].add);
          this.games[i].msg.players.splice(p_index, 1);
          //Make sure player_sigs array exists and add invite_sig
          if (this.games[i].msg.players_sigs && this.games[i].msg.players_sigs.length > p_index) {
            this.games[i].msg.players_sigs.splice(p_index, 1);
          }

          this.updatePlayerList(game_id, this.games[i].msg.players, this.games[i].msg.players_sigs);
        }
      }
    }

    try {
      if (this.browser_active) {
        console.log("Player should get removed from arcade hero");
        this.renderArcadeMain(this.app, this);
      }
    } catch (err) {
      console.log("Non-fatal error rendering open game list");
    }
  }


  /*
  Update the Games Table with a new list of players+signatures for the multiplayer game
  (works for adding or subtracting players and enforces consistent ordering)
  */
  async updatePlayerList(id, keys, sigs) {
    if (this.app.BROWSER) { return; }
    //Copy arrays to new data structures
    keys = keys.slice();
    sigs = sigs.slice();
    let players_array = keys.shift() + "/" + sigs.shift();

    if (keys.length !== sigs.length){
      console.log("Length mismatch");
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

    let sql =
      "UPDATE games SET players_array = $players_array WHERE game_id = $game_id";
    let params = {
      $players_array: players_array,
      $game_id: id,
    };

    if (this.debug){
      console.log(sql);
      console.log(params);
    }

    try {
      await this.app.storage.executeDatabase(sql, params, "arcade");
    } catch (err) {
      console.info(err);
    }

  }



  addGameToOpenList(tx) {
    let valid_game = this.validateGame(tx);
    let for_us = this.isForUs(tx);

    if (valid_game) {
      if (for_us) {
        this.games.unshift(tx);
      }
      let removed_game = this.removeOldGames();
      if (for_us || removed_game) {
        this.renderArcadeMain(this.app, this);
      }
    }
    console.log("Add Game:" + valid_game + for_us);

  }
  addGamesToOpenList(txs) {
    let for_us = false;
    console.log("Loaded games:");
    txs.forEach((tx, i) => {
      let valid_game = this.validateGame(tx);
      if (valid_game) {
        let this_game_is_for_us = this.isForUs(tx);
        if (this_game_is_for_us) {
          console.log(JSON.parse(JSON.stringify(tx)));
          this.games.unshift(tx);
        }
        for_us = for_us || this_game_is_for_us;
      }
    });

    //let removed_game = this.removeOldGames();
    //if (for_us || removed_game){
    if (for_us) {
      this.renderArcadeMain(this.app, this);
    }
  }



  shouldAffixCallbackToModule(modname) {
    if (modname == "ArcadeInvite") {
      return 1;
    }
    if (modname == "Arcade") {
      return 1;
    }
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


  updateIdentifier() { }

  onResetWallet() {
    if (this.app.options) {
      this.app.options.games = [];
    }
  }

  showShareLink(game_sig) {
    let data = {};

    //Add more information about the game
    try {
      let accepted_game = null;
      this.games.forEach((g) => {
        if (g.transaction.sig === game_sig) {
          accepted_game = g;
        }
      });
      if (accepted_game) {
        data.game = accepted_game.msg.game;
      }
    } catch (err) { }

    //Create invite link from the game_sig 
    let inviteLink = window.location.href;
    if (!inviteLink.includes("#")) {
      inviteLink += "#";
    }
    if (inviteLink.includes("?")) {
      inviteLink = inviteLink.replace("#", "&jid=" + game_sig);
    } else {
      inviteLink = inviteLink.replace("#", "?jid=" + game_sig);
    }

    data.invite_link = inviteLink;

    console.log(inviteLink);

    ArcadeLink.render(this.app, this, data);
    ArcadeLink.attachEvents(this.app, this);
  }
}

module.exports = Arcade;
