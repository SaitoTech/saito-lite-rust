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
const ArcadeEmailAppspace = require("./lib/email-appspace/email-appspace");
const JSON = require("json-bigint");
const fetch = require("node-fetch");

class Arcade extends ModTemplate {
  constructor(app) {
    super(app);

    this.name = "Arcade";
    this.description = "Interface for creating and joining games coded for the Saito Open Source Game Engine.";
    this.categories = "Games Entertainment";

    this.events = ["chat-render-request"];
    this.mods = [];
    this.affix_callbacks_to = [];
    this.games = [];
    this.observer = [];
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

    this.header = null;
    this.overlay = null;
    this.debug = true;

  }

  receiveEvent(type, data) {
    if (type == "chat-render-request") {
      if (this.browser_active) {
        if (this.app.options.auto_open_chat_box == undefined) {
          this.app.options.auto_open_chat_box = 1;
          this.app.storage.saveOptions();
        }
        //this.renderSidebar();
        try {
          let chat_mod = this.app.modules.returnModule("Chat");
          if (
            chat_mod.groups.length > 0 &&
            this.chat_open == 0 &&
            this.app.options.auto_open_chat_box
          ) {
            this.chat_open = 1;
            chat_mod.openChats();
          }
        } catch (err) {
          console.log("Err: " + err);
        }
      }
    }
  }

  handleUrlParams(urlParams) {
    let i = urlParams.get("i");
    if (i == "watch") {
      let msg = urlParams.get("msg");
      this.observeGame(msg, 0);
    }
  }

  renderArcadeMain() {
    if (this.browser_active == 1) {
      if (this.viewing_arcade_initialization_page == 0) {
        ArcadeMain.render(this.app, this);
        ArcadeMain.attachEvents(this.app, this);
        if (this.viewing_game_homepage){
          ArcadeGameSidebar.attachEvents(this.app, this);    
        }
      }      
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
    if (type == "email-appspace") {
      super.render(this.app, this); // for scripts + styles
      return new ArcadeEmailAppspace(this.app, this);
    }
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
    } catch (err) {}

    //
    // listen for txs from arcade-supporting games
    //
    this.app.modules.respondTo("arcade-games").forEach((mod) => {
      this.affix_callbacks_to.push(mod.name);
    });
  }

  initializeHTML(app) {
    this.header = new SaitoHeader(app, this);
  }

  checkGameDatabase(){
    let cutoff = new Date().getTime() - this.old_game_removal_delay;
    let sql = `SELECT * FROM games WHERE created_at > ${cutoff}`;
    this.sendPeerDatabaseRequestWithFilter("Arcade", sql, (res) => {
        if (res.rows) {
          for (let i = 0; i < res.rows.length; i++){
            console.log(JSON.parse(JSON.stringify(res.rows[i])));
          }
        }else{
          console.log("No games in the database");
        }
      }
    ); 
  }

  //
  // load transactions into interface when the network is up

  onPeerHandshakeComplete(app, peer) {
    if (this.browser_active == 0) {
      return;
    }

    // fetch any usernames needed
    if (this.app.BROWSER == 1) {
      app.browser.addIdentifiersToDom();
    }


    let arcade_self = this;
    let cutoff = new Date().getTime() - this.old_game_removal_delay;

    //If following an invite link, look for the game_id in question
    if (this.app.browser.returnURLParameter("jid")) {
      let gameId = this.app.browser.returnURLParameter("jid");
      if (this.debug) {console.log("attempting to join game... " + gameId);}
      
      let sql = `SELECT * FROM games WHERE game_id = "${gameId}" AND created_at > ${cutoff}`;
      this.sendPeerDatabaseRequestWithFilter("Arcade", sql, (res) => {
        if (res.rows) {
          arcade_self.addGamesToOpenList(
            res.rows.map((row) => {
              if (arcade_self.debug) {console.log(JSON.parse(JSON.stringify(row)));};
              if (row.status == "open" || row.status == "private"){
                return new saito.default.transaction(JSON.parse(row.tx));
              }else {return null;}
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
              if (arcade_self.debug){
                console.log("onPeerHandshakeComplete -> peerDatabaseRequest -> addGamesToOpenList");
                console.log(JSON.parse(JSON.stringify(row)));  
              }
              return new saito.default.transaction(JSON.parse(row.tx));
            })
          );
        }
      }
    );

    //if (this.debug) {this.checkGameDatabase();}

    /*
    // load observer games (active) -- ASC
    //
    let current_timestamp = new Date().getTime() - 1200000;
    this.sendPeerDatabaseRequestWithFilter(
      "Arcade",
      `SELECT DISTINCT id, count(id) as count, last_move, game_id, module, player, players_array FROM gamestate WHERE 1 = 1 AND last_move > 10 GROUP BY game_id ORDER BY count DESC, last_move DESC LIMIT 8`,
      (res) => {
        if (res.rows) {
          res.rows.forEach((row) => {
            let { game_id, module, players_array, player } = row;
            this.addGameToObserverList({
              game_id,
              module,
              players_array,
              player,
            });
          });
        }
      }
    );
    */
  }

  //
  //
  // ON CONNECTION STABLE
  //
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
    siteMessage("Connection Unstable", 5000);
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
        if (app.options.games[i].over === 1){
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

  joinGame(app, tx) {
    if (!tx.transaction || !tx.transaction.sig || !tx.msg || tx.msg.over == 1) {
      return;
    }

    let txmsg = tx.returnMessage();
    let game_id = txmsg.game_id;
    //let blk = null;
    //let conf = 0;
    let relay_mod = app.modules.returnModule("Relay");
    let peers = [];
    for (let i = 0; i < app.network.peers.length; i++) {
      peers.push(app.network.peers[i].returnPublicKey());
    }
    let accepted_game = null;

    if (this.debug){ console.log("Received Join Message for game="+game_id,JSON.parse(JSON.stringify(tx)));}

    for (let i = 0; i < this.games.length; i++) {
      if (this.games[i].transaction.sig == game_id){
        accepted_game = this.games[i]; //cache a refence to the game in the module
      }
    }

    if (accepted_game == null){
      console.log("Game not available");
      console.log(this.games);
      return;
    }

    let { players } = (accepted_game)? accepted_game.returnMessage() : [];
    
    if (this.debug) { console.log(JSON.parse(JSON.stringify(players))); }

    this.joinGameOnOpenList(tx); //Update Arcade hero to reflect new player
    
    //this.receiveJoinRequest(blk, tx, conf, app);

    if (this.debug) { console.log(JSON.parse(JSON.stringify(accepted_game.returnMessage().players))); }
    //
    // it is possible that we have multiple joins that bring us up to
    // the required number of players, but that did not arrive in the
    // one-by-one sequence needed for the last player to trigger an
    // "accept" request instead of another "join".
    //
    // in this case the last player sends an accept request which triggers
    // the start of the game automatically.
    

   // for (let i = 0; i < this.games.length; i++) {
   //   if (this.games[i].transaction.sig == txmsg.game_id) {
     
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
            
            accepted_game.msg.players.splice(0, 1);
            accepted_game.msg.players_sigs.splice(0, 1);

            console.log(app.wallet.returnPublicKey()+" sends the accept message from arcade");
            let newtx = this.createAcceptTransaction(accepted_game);
            this.app.network.propagateTransaction(newtx);

            //
            // try fast accept
            //
            if (relay_mod != null) {
              relay_mod.sendRelayMessage(players, "arcade spv update", newtx);
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


  async acceptGame(app, tx){
    // do not process if transaction is not for us
    if (!tx.isTo(app.wallet.returnPublicKey()) || this.app.BROWSER == 0) {
      return;
    }
    let txmsg = tx.returnMessage();

    // make sure game in options file
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
       
    // do not re-accept if game is really old (sanity check)
    for (let i = 0; i < this.app.options.games.length; i++) {
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

    let gamemod = this.app.modules.returnModule(tx.msg.game);
    
    if (!gamemod){
      console.error("Game module not found!");
      return;
    }

    // game is over, we don't care
    if (tx.msg.over) {
      console.log("Game is already over, cannot accept");
      return;
    }
     
    if (txmsg.players.includes(app.wallet.returnPublicKey())) {

      if (this.debug) {console.log("ALREADY INITED? " + this.viewing_arcade_initialization_page);}
     
      if (this.browser_active) {
        GameLoader.render(app, this);   
      }else{
        // alert us someone has accepted our game if elsewhere
        
        // Method 1 
        siteMessage(txmsg.module + ' invite accepted.', 20000);
        // Method 2
          if (txmsg.module === "Arcade" && tx.isTo(app.wallet.returnPublicKey())) {
            this.showAlert(); //Doesn't really do anything... changes a display of something to block
          } 
        //Method 3
        app.browser.sendNotification(
                  "Game Accepted",
                  txmsg.module + " invite accepted.",
                  "game-acceptance-notification"
                ); //This function's code is all commented out
      }
      
      
      //
      // only launch game if it is for us -- observer mode?
      //
    
      if (this.debug){
        console.info("THIS GAMEIS FOR ME: " + tx.isTo(app.wallet.returnPublicKey()));
        console.info("OUR GAMES: ", this.app.options.games);
      }
      
      if (this.debug) {console.log("telling game module to receiveAcceptTx");}

      //Create Game Here
      let game_id = gamemod.receiveAcceptRequest(null, tx, 0, this.app);
      
      if (game_id) {
        if (this.debug) {console.log("... and launching the game");}
      
        //Kick off game loader
        this.launchGame(txmsg.game_id);
      
        if (this.debug) {console.log("... and done launching the game"); }
      }else{
        if (this.debug){console.log("Game template returned a null game_id");}
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
            if (this.debug){console.log("SERVER NOTIFY PEERS");}
            this.notifyPeers(app, tx);
          }
        }

        //
        // open msgs -- public invitations
        //
        if (txmsg.module === "Arcade" && txmsg.request == "open") {
          if (this.debug) {console.log("onConfirmation: open invite received");}
          this.addGameToOpenList(tx);
          this.receiveOpenRequest(blk, tx, conf, app);
        }

        //
        // private invites -- daniel 4/2022
        if (txmsg.module === "Arcade" && txmsg.request == "private") {
          if (this.debug) {console.log("onConfirmation: private invite received");}
          this.receiveOpenRequest(blk, tx, conf, app);
        }
        if (txmsg.module == "Arcade" && txmsg.request.includes("change")) {
          if (this.debug) {console.log("onConfirmation: change event type");}
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
          if (this.debug) {console.log("onConfirmation: join request received");}
          this.joinGame(app, tx);
        }

        //
        // cancel open games
        //
        if (txmsg.module == "Arcade" && txmsg.request == "close") {
          if (this.debug) {console.log("onConfirmation: close request received");}
          this.closeGameInvite(blk, tx, conf, app);
        }

        //
        // save state -- also prolifigate
        //
        if (txmsg.game_state != undefined && txmsg.game_id != "") {
          this.saveGameState(blk, tx, conf, app);
        }

        //
        // acceptances
        //
        if (txmsg.request === "accept") {
          if (this.debug) {console.log("onConfirmation: accept game received");}
          this.receiveAcceptRequest(blk, tx, conf, app);
          this.removeGameFromOpenList(tx.msg.game_id);
          this.acceptGame(app, tx);
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

    if (message.request === "arcade spv update") {
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
      // open msgs -- public invitations
      //
      if (txmsg.module === "Arcade" && txmsg.request == "open") {
        if (this.debug) {console.log("handlePeerRequest: open invite received");}
        if (!this.doesGameExistLocally(tx.transaction.sig)) {
          this.addGameToOpenList(tx);
          this.receiveOpenRequest(blk, tx, conf, app);
          // only servers notify lite-clients
          if (app.BROWSER == 0 && app.SPVMODE == 0) {
            this.notifyPeers(app, tx);
          }
        }
      }

      // private invitation - daniel 4/2022
      if (txmsg.module === "Arcade" && txmsg.request == "private") {
        if (this.debug) {console.log("handlePeerRequest: private invite received");}
        if (!this.doesGameExistLocally(tx.transaction.sig)) {
          //this.addGameToOpenList(tx);
          this.receiveOpenRequest(blk, tx, conf, app);
          // only servers notify lite-clients
          if (app.BROWSER == 0 && app.SPVMODE == 0) {
            this.notifyPeers(app, tx);
          }
        }
      }
      if (txmsg.module == "Arcade" && txmsg.request.includes("change")) {
        if (this.debug) {console.log("handlePeerRequest: change request received");}
        this.receiveChangeRequest(blk, tx, conf, app);
        // only servers notify lite-clients
        if (app.BROWSER == 0 && app.SPVMODE == 0) {
          this.notifyPeers(app, tx);
        }
      }

      
      // open msgs -- private invitations
      //
      //if (txmsg.module === "ArcadeInvite" && txmsg.request == "open" && tx.isTo(app.wallet.returnPublicKey())) {
      //  this.addGameToOpenList(tx);
      //}

      //
      // join msgs -- add myself to game list
      //
      if (txmsg.request == "join") {
        if (this.debug) {console.log("handlePeerRequest: join request received");}
        this.joinGame(app, tx);
        // only servers notify lite-clients
        if (app.BROWSER == 0 && app.SPVMODE == 0) {
          this.notifyPeers(app, tx);
        }
      }

      //
      // accept msgs -- remove games from list
      //
      if (txmsg.request == "accept") {
        if (this.debug) {console.log("handlePeerRequest: accept request received");}
        //
        // notify lite-clients and remove game from list available
        //
        this.receiveAcceptRequest(blk, tx, conf, app);
      	this.removeGameFromOpenList(txmsg.game_id);

        if (this.app.BROWSER == 0 && app.SPVMODE == 0) {
          this.notifyPeers(this.app, tx);
        }else{
          this.acceptGame(app, tx);
        }
      }
       
      //
      // cancel open games
      //
      if (txmsg.module == "Arcade" && txmsg.request == "close") {
        // try to give game over message
        if (this.debug) {console.log("handlePeerRequest: close request received");}
        this.closeGameInvite(blk, tx, conf, app);
        
        if (!tx.isFrom(this.app.wallet.returnPublicKey())) {
          // NOTIFY MY PEERS -- server notifying clients
          if (!tx.isTo(this.app.wallet.returnPublicKey())) {
            if (tx.transaction.relayed != 1) {
              tx.transaction.relayed = 1;
              if (app.BROWSER == 0 && app.SPVMODE == 0) {
                this.notifyPeers(app, tx);
              }
            }
          }
        }
        
      }
      
    } // end message.request == "arcade spv update"

    if (message.request == "rawSQL" && app.BROWSER == 0 && message.data.module == "Arcade") {
      //
      // intercept a very particular query
      //
      if (message.data.sql.indexOf("is_game_already_accepted") > -1) {
        if (this.debug){console.log("DOING a pseudo SQL query");}
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
    }

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


  async receiveOpenRequest(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();
    //
    // add to games table
    //
    let game_id = tx.transaction.sig;
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
    let acceptance_sig = "";
    if (txmsg.players_sigs.length > 0) {
      acceptance_sig = txmsg.players_sigs[0];
    }

    let sql = `INSERT INTO games (
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
    if (this.debug) {
      console.log(`Storing new ${game_status} game: ` + game_id);
      this.checkGameDatabase();
    }

    return;
  }

  /*
  We may want to keep this to update the SQL tables of which players are attached to the game
  */
  async receiveJoinRequest(blk, tx, conf, app) {
    /*let txmsg = tx.returnMessage();

    //
    // add to invite table
    //
    let game_id = tx.msg.game_id;
    let players_needed = 2;
    if (parseInt(txmsg.players_needed) > 2) {
      players_needed = parseInt(txmsg.players_needed);
    }
    let module = txmsg.game;
    let options = {};
    if (txmsg.options != undefined) {
      options = txmsg.options;
    }
    //let game_status = "open";
    let player = tx.transaction.from[0].add;
    let players_array = player;
    let start_bid = 0;
    if (blk != null) {
      start_bid = blk.block.id;
    }
    let valid_for_minutes = 60;
    let created_at = parseInt(tx.transaction.ts);
    let expires_at = created_at + 60000 * parseInt(valid_for_minutes);
    let acceptance_sig = "";
    if (txmsg.invite_sig != "") {
      acceptance_sig = txmsg.invite_sig;
    }

    
    // insert into invites
    //
    let sql2 = `INSERT INTO invites (
                game_id ,
                player ,
                acceptance_sig ,
                module ,
                created_at ,
                expires_at
              ) VALUES (
                $game_id ,
                $player ,
                $acceptance_sig ,
                $module ,
                $created_at ,
                $expires_at
              )`;
    let params2 = {
      $game_id: game_id,
      $player: player,
      $acceptance_sig: acceptance_sig,
      $module: module,
      $created_at: created_at,
      $expires_at: expires_at,
    };
    await app.storage.executeDatabase(sql2, params2, "arcade");
    */
    return;
  }

  //game_id = tx.msg.sig
  /*
  If the game is generated, it is stored in saito app.options.games, if it is still open for people to join
  it is in arcade_mod.games
  */
  closeGameInvite(blk, tx, conf, app){
    let found_game = false;
    let game_id = tx.returnMessage().sig;
    console.log("Arcade receiving close request");

    let accepted_game = this.games.find((g) => g.transaction.sig === game_id);
    if (accepted_game){
      if (accepted_game.transaction.from[0].add == tx.transaction.from[0].add){
        if (this.debug) {console.log("Canceling invitation for an uninitialized game");}
        this.receiveCloseRequest(blk, tx, conf, app); //Update SQL to mark game as closed
        this.removeGameFromOpenList(game_id);
      }else{
        if (this.debug) {console.log("Changed mind about joining the game");}
        this.leaveGameOnOpenList(tx);
      }
    }else{
      if (this.debug) {console.log("Game not found, cannot cancel");}
      //this.receiveCloseRequest(blk, tx, conf, app);
    }

    //Refresh Arcade Main
    if (this.viewing_arcade_initialization_page == 0 && this.browser_active == 1) {
      this.renderArcadeMain();
    }
    if (this.debug) {
      this.checkGameDatabase();
    }
  }


  async receiveCloseRequest(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();
    if (this.debug) {console.log("Close game " + txmsg.sig);}
    let sql = `UPDATE games SET status = $status WHERE game_id = $game_id`;
    let params = { $status: "close", $game_id: txmsg.sig };
    await app.storage.executeDatabase(sql, params, "arcade");
  }

  async receiveGameoverRequest(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();
    if (this.debug) {console.log("Resign game " + JSON.stringify(txmsg));}

    let sql2 = `UPDATE games SET status = 'over', winner = '${txmsg.winner}' WHERE game_id = '${txmsg.sig}'`;
    this.sendPeerDatabaseRequestWithFilter("Arcade", sql2);

  }

  
  async receiveChangeRequest(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();
    let new_status = txmsg.request.split("_")[1];
    if (this.debug){
      console.log(txmsg);
      console.log("RECEIVING CHANGE REQUEST to "+new_status);
    }
      
    let sql1 = `SELECT * FROM games WHERE game_id = "${txmsg.game_id}"`;
    let orig_status = "";
    
    this.sendPeerDatabaseRequestWithFilter("Arcade", sql1, async (res) => {
      if (res.rows && res.rows.length > 0) {
        let orig_status = res.rows[0].status;
        let newtx = new saito.default.transaction(JSON.parse(res.rows[0].tx));
        
        if (this.debug){
          console.log(res.rows[0]);
          console.log(`Changing status from ${orig_status} to ${new_status}`);  
        }
        
        let sql2 = `UPDATE games SET status = '${new_status}' WHERE game_id = '${txmsg.game_id}'`;
        this.sendPeerDatabaseRequestWithFilter("Arcade", sql2);

        for (let i = 0; i < this.games.length; i++){
          if (this.games[i].transaction){
            if (this.games[i].transaction.sig == newtx.game_id){
              if (this.games[i].msg){
                this.games[i].msg.request = new_status;  
              }
            }  
          }
        }

        if (tx.isFrom(this.app.wallet.returnPublicKey())){
          if (this.debug){console.log("I sent the message");}
        }else{
          if (this.isMyGame(tx,app)){
            this.renderArcadeMain();
          }else{
            if (this.debug){console.log("I need to update my browser");}
            if (new_status == "private"){ 
              this.removeGameFromOpenList(txmsg.game_id);
            }else{
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
    tx.msg.request = "change_"+direction;
    tx.msg.game_id = gametx.transaction.sig;
    tx = this.app.wallet.signTransaction(tx);
    
    if (this.debug){
      console.log("Transaction to change");
      console.log(gametx);
      console.log(`CHANGE TX to ${direction}:`,tx);  
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
    tx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));

    //
    // arcade will listen, but we need game engine to receive to start initialization
    //
    tx.msg = txmsg;
    tx.msg.game_id = gametx.transaction.sig;
    tx.msg.request = "accept";
    tx.msg.module = txmsg.game;
    tx = this.app.wallet.signTransaction(tx);

    return tx;
  }

  
  /*
  Everyone who receives the accept request should update their local database to reflect who is playing the game and new game status
  */
  async receiveAcceptRequest(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();
    let publickeys = [];
    for (let i = 0; i < tx.transaction.to.length; i++) {
      if (!publickeys.includes(tx.transaction.to[i].add)) {
        publickeys.push(tx.transaction.to[i].add);
      }
    }
    let unique_keys = publickeys;
    unique_keys.sort();
    let players_array = unique_keys.join("_");

    let sql =
      "UPDATE games SET players_array = $players_array, status = 'active' WHERE game_id = $game_id";
    let params = {
      $players_array: players_array,
      //$status: "open",
      $game_id: txmsg.game_id,
    };

    try {
      await this.app.storage.executeDatabase(sql, params, "arcade");
    } catch (err) {
      console.info(err);
    }
    if (this.debug){ 
      this.checkGameDatabase();
    }
  }

  async launchSinglePlayerGame(app, gameobj) {
    try{
     
      let arcade_self = this;
      GameLoader.render(app, arcade_self);

      let gameMod = app.modules.returnModule(gameobj.name);  
      let game_id = await gameMod.initializeSinglePlayerGame(gameobj);

      GameLoader.render(app, arcade_self, game_id);
      GameLoader.attachEvents(app, arcade_self);  
     
    }catch(err){
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
    if (arcade_self.initialization_timer == null){ //In case accepting player runs launchGame twice
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
            }else{
              clearInterval(arcade_self.initialization_timer);
              arcade_self.initialization_timer = null;
              GameLoader.render(arcade_self.app, arcade_self, game_id);
              GameLoader.attachEvents(arcade_self.app, arcade_self);  
            }
          }
        }
      }, 1000);
    }
  }

  webServer(app, expressapp, express) {
    super.webServer(app, expressapp, express);

    const fs = app.storage.returnFileSystem();
    const path = require("path");

    if (fs != null) {
      expressapp.get("/arcade/observer_multi/:game_id/:bid/:tid/:last_move", async (req, res) => {
        let lm = 0;
        let lbid = 0;
        let ltid = 0;
        let game_id = 0;

        try {
          if (req.params.last_move) {
            lm = req.params.last_move;
          }
          if (req.params.bid) {
            lbid = req.params.bid;
          }
          if (req.params.tid) {
            ltid = req.params.tid;
          }
          if (req.params.game_id) {
            game_id = req.params.game_id;
          }
          if (lbid === "undefined") {
            lbid = 0;
          }
          if (ltid === "undefined") {
            ltid = 0;
          }
        } catch (err) {}

        let sql =
          "SELECT * FROM gamestate WHERE game_id = $game_id AND last_move > $last_move ORDER BY last_move ASC LIMIT 10";
        let params = { $game_id: game_id, $last_move: lm };

        if (ltid != 0) {
          sql =
            "SELECT * FROM gamestate WHERE game_id = $game_id AND (last_move > $last_move OR tid > $last_tid) ORDER BY last_move ASC LIMIT 10";
          params = { $game_id: game_id, $last_move: lm, $last_tid: ltid };
        }

        let games = await app.storage.queryDatabase(sql, params, "arcade");

        if (games.length > 0) {
          res.setHeader("Content-type", "text/html");
          res.charset = "UTF-8";
          res.write(JSON.stringify(games));
          res.end();
          return;
        } else {
          res.setHeader("Content-type", "text/html");
          res.charset = "UTF-8";
          res.write("{}");
          res.end();
          return;
        }
      });

      expressapp.get("/arcade/observer_prev/:game_id/:current_move", async (req, res) => {
        let sql =
          "SELECT * FROM gamestate WHERE game_id = $game_id AND last_move < $last_move ORDER BY last_move DESC LIMIT 2";
        let params = { $game_id: req.params.game_id, $last_move: req.params.current_move };

        if (req.params.current_move == 0 || req.params.current_move === "undefined") {
          sql = "SELECT * FROM gamestate WHERE game_id = $game_id ORDER BY last_move ASC LIMIT 1";
          params = { $game_id: req.params.game_id };
        }

        let games = await app.storage.queryDatabase(sql, params, "arcade");

        if (games.length > 0) {
          res.setHeader("Content-type", "text/html");
          res.charset = "UTF-8";
          res.write(JSON.stringify(games));
          res.end();
          return;
        } else {
          res.setHeader("Content-type", "text/html");
          res.charset = "UTF-8";
          res.write("{}");
          res.end();
          return;
        }
      });

      expressapp.get("/arcade/observer/:game_id", async (req, res) => {
        let sql =
          "SELECT bid, tid, last_move, game_state FROM gamestate WHERE game_id = $game_id ORDER BY id DESC LIMIT 1";
        let params = { $game_id: req.params.game_id };

        let games = await app.storage.queryDatabase(sql, params, "arcade");

        if (games.length > 0) {
          let game = games[0];
          res.setHeader("Content-type", "text/html");
          res.charset = "UTF-8";
          res.write(JSON.stringify(game));
          res.end();
          return;
        }
      });

      expressapp.get("/arcade/keystate/:game_id/:player_pkey", async (req, res) => {
        let sql =
          "SELECT * FROM gamestate WHERE game_id = $game_id AND player = $playerpkey ORDER BY id DESC LIMIT 1";
        let params = {
          $game_id: req.params.game_id,
          $playerpkey: req.params.player_pkey,
        };
        let games = await app.storage.queryDatabase(sql, params, "arcade");

        if (games.length > 0) {
          let game = games[0];
          res.setHeader("Content-type", "text/html");
          res.charset = "UTF-8";
          res.write(game.game_state.toString());
          res.end();
          return;
        }
      });

      expressapp.get("/arcade/restore/:game_id/:player_pkey", async (req, res) => {
        let sql = "SELECT * FROM gamestate WHERE game_id = $game_id ORDER BY id DESC LIMIT 10";
        let params = { $game_id: req.params.game_id };
        let games = await app.storage.queryDatabase(sql, params, "arcade");

        let stop_now = 0;
        let games_to_push = [];
        let recovering_pkey = "";

        try {
          if (req.params.player_pkey != undefined) {
            recovering_pkey = req.params.pkayer_pkey;
          }
        } catch (err) {}

        if (games.length > 0) {
          for (let z = 0; z < games.length; z++) {
            let game = games[z];
            if (game.player_pkey == recovering_pkey) {
              stop_now = 1;
            } else {
              games_to_push.push(game.state);
            }
            if (recovering_pkey == "" || stop_now == 1) {
              z = games.length + 1;
            }
          }
          res.setHeader("Content-type", "text/html");
          res.charset = "UTF-8";
          res.write(JSON.stringify(games_to_push));
          res.end();
          return;
        }
      });

      expressapp.get("/arcade/invite/:gameinvite", async (req, res) => {
        res.setHeader("Content-type", "text/html");
        res.sendFile(path.resolve(__dirname + "/web/invite.html"));
      });
    }
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
    if (this.debug){ console.info("GAME OVER: " + game.over + ", LAST BLOCK: " + game.last_block + ", Game ID: " + game.id);}

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
    if (this.debug) { console.log("Removing " + game_sig);}
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

    let for_us = true;
    let txmsg = tx.returnMessage(this.app);

    if (!txmsg) {
      return false;
    }

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
    if (this.debug){ console.log(`Player ${tx.transaction.from[0].add} wants to join game ${txmsg.game_id} with message signed ${txmsg.invite_sig}`);}
    
    for (let i = 0; i < this.games.length; i++) {
      if (this.games[i]?.transaction.sig == txmsg.game_id) {
        if (!this.games[i].msg.players.includes(tx.transaction.from[0].add) && txmsg.invite_sig) {
          //Add sender of join request to player list
          this.games[i].msg.players.push(tx.transaction.from[0].add);
          //Make sure player_sigs array exists and add invite_sig
          this.games[i].msg.players_sigs = this.games[i].msg.players_sigs || [];
          this.games[i].msg.players_sigs.push(txmsg.invite_sig);
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

  leaveGameOnOpenList(tx){
   if (!tx.transaction || !tx.transaction.sig || !tx.msg || tx.msg.over == 1) {
      return;
    } 

    let txmsg = tx.returnMessage();
    let game_id = txmsg.sig;
    console.log(`Player ${tx.transaction.from[0].add} wants out of game ${game_id}`);
    for (let i = 0; i < this.games.length; i++) {
      if (this.games[i]?.transaction.sig == game_id) {
        if (this.games[i].msg.players.includes(tx.transaction.from[0].add)) {
          let p_index = this.games[i].msg.players.indexOf(tx.transaction.from[0].add);
          this.games[i].msg.players.splice(p_index, 1);
          //Make sure player_sigs array exists and add invite_sig
          if (this.games[i].msg.players_sigs && this.games[i].msg.players_sigs.length > p_index){
            this.games[i].msg.players_sigs.splice(p_index, 1);  
          }
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

  addGameToOpenList(tx) {
    let valid_game = this.validateGame(tx);
    if (valid_game) {
      let for_us = this.isForUs(tx);
      if (for_us) {
        this.games.unshift(tx);
      }
      let removed_game = this.removeOldGames();
      if (for_us || removed_game) {
        this.renderArcadeMain(this.app, this);
      }
    }
  }
  addGamesToOpenList(txs) {
    let for_us = false;
    txs.forEach((tx, i) => {
      //console.log("TX from SQL");
      //console.log(JSON.parse(JSON.stringify(tx)));
      let valid_game = this.validateGame(tx);
      if (valid_game) {
        let this_game_is_for_us = this.isForUs(tx);
        if (this_game_is_for_us) {
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

  addGameToObserverList(msg) {
    for (let i = 0; i < this.observer.length; i++) {
      if (msg.game_id == this.observer[i].game_id) {
        return;
      }
    }
    this.observer.push(msg);

    this.renderArcadeMain(this.app, this);
  }

  async saveGameState(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();

    let game_state = "";

    try {
      if (txmsg.game_state) {
        game_state = txmsg.game_state;
      }
    } catch (err) {
      console.log("error saving game state, so quitting...");
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
      if (!x.includes(txto[z].add)) {
        x.push(txto[z].add);
      }
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
    if (x.length == 1) {
      return;
    }

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
      $last_move: new Date().getTime(),
    };

    await app.storage.executeDatabase(sql, params, "arcade");

    //
    // periodically prune
    //
    if (Math.random() < 0.005) {
      let current_ts = new Date().getTime();
      let one_week_ago = current_ts - 640000000;
      let delete_sql =
        "SELECT game_id FROM gamestate WHERE last_move < $last_move GROUP BY game_id ORDER BY last_move ASC";
      let delete_params = { $last_move: one_week_ago };
      let rows3 = await app.storage.queryDatabase(delete_sql, delete_params, "arcade");

      if (rows3) {
        if (rows3.length > 0) {
          for (let i = 0; i < rows3.length; i++) {
            let game_id = rows3[i].game_id;
            let purge_sql = "DELETE FROM gamestate WHERE game_id = $game_id";
            let purge_params = { $game_id: game_id };
            await app.storage.executeDatabase(purge_sql, purge_params, "arcade");
          }
        }
      }

      //
      // purge old games
      //
      let current_timestamp = new Date().getTime() - 1200000;
      let sql5 = "DELETE FROM games WHERE status = 'open' AND created_at < $adjusted_ts";
      let params5 = { $adjusted_ts: current_timestamp };
      await this.app.storage.executeDatabase(sql5, params5, "arcade");

      /*
      let sql6 = "DELETE FROM invites WHERE created_at < $adjusted_timestamp";
      let params6 = { $adjusted_ts: current_timestamp };
      await this.app.storage.executeDatabase(sql6, params6, "arcade");
      */
    }
  }

  observeGame(msg, watch_live = 0) {
    let arcade_self = this;

    let msgobj = JSON.parse(this.app.crypto.base64ToString(msg));
    let address_to_watch = msgobj.player;
    let game_id = msgobj.game_id;
    let tid = msgobj.tid;
    let bid = msgobj.bid;
    let last_move = msgobj.last_move;

    if (tid === undefined || tid == "") {
      tid = 1;
    }
    if (bid === undefined || bid == "") {
      tid = 1;
    }
    if (last_move === undefined || last_move == "") {
      tid = 1;
    }

    //
    // already watching game... load it
    //
    if (this.app.options.games) {
      let { games } = this.app.options;
      for (let i = 0; i < games.length; i++) {
        if (games[i].id === game_id) {
          games[i].observer_mode = 1;
          games[i].observer_mode_active = 0;
          for (let z = 0; z < games[i].players.length; z++) {
            if (games[i].players[z] == address_to_watch) {
              games[i].observer_mode_player = z + 1;
            }
          }
          if (!games[i].observer_mode_player) {
            games[i].observer_mode_player = 1;
          }
          if (address_to_watch == "") {
            address_to_watch = games[i].players[0];
          }
          games[i].ts = new Date().getTime();
          arcade_self.app.keys.addWatchedPublicKey(address_to_watch);
          arcade_self.app.options.games = games;
          arcade_self.app.storage.saveOptions();
          let slug = arcade_self.app.modules.returnModule(msgobj.module).returnSlug();
          window.location = "/" + slug;
          return;
        }
      }
    }

    /***
    //
    // watch live
    //
    if (watch_live) {
      fetch(`/arcade/observer/${game_id}`).then(response => {
        response.json().then(data => {

          let game = JSON.parse(data.game_state);
          let tid = data.tid;
          let bid = data.bid;
          let lm = data.last_move;

    game.step.ts = lm;
    game.step.tid = tid;
    game.step.bid = bid;

          //
          // tell peers to forward this address transactions
          //
          arcade_self.app.keys.addWatchedPublicKey(address_to_watch);
          let { games } = arcade_self.app.options;

          //
          // specify observer mode only
          //
          if (games == undefined) {
            games = [];
          }

          for (let i = 0; i < games.length; i++) {
            if (games[i].id == game_id) {
              games.splice(i, 1);
            }
          }

          game.observer_mode = 1;
          game.observer_mode_active = 0;
          game.player = 0;

          //
          // and we add this stuff to our queue....
          //
          for (let z = 0; z < game.last_turn.length; z++) {
            game.queue.push(game.last_turn[z]);
          }

    //
    // increment the step by 1, as returnPreGameMove will have unincremented
    // ( i.e. not including the step that broadcast it )
          //
    game.step.game++;

          games.push(game);

          arcade_self.app.options.games = games;
          arcade_self.app.storage.saveOptions();

          //
          // move into game
          //
          let slug = arcade_self.app.modules.returnModule(msgobj.module).returnSlug();
          window.location = '/' + slug;
        })
      }).catch(err => console.info("ERROR 418019: error fetching game for observer mode", err));
    } else {
****/
    //
    // HACK
    // do not listen
    //
    arcade_self.app.keys.addWatchedPublicKey(address_to_watch);
    //
    let { games } = arcade_self.app.options;
    if (games == undefined) {
      games = [];
    }
    for (let i = 0; i < games.length; i++) {
      if (games[i].id == game_id) {
        games.splice(i, 1);
      }
    }

    arcade_self.app.options.games = games;
    arcade_self.initializeObserverMode(game_id, watch_live);

    //    }
  }

  observerDownloadNextMoves(game_mod, mycallback = null) {
    let arcade_self = this;

    // purge old transactions
    for (let i = 0; i < game_mod.game.future.length; i++) {
      let queued_tx = new saito.default.transaction(JSON.parse(game_mod.game.future[i]));
      let queued_txmsg = queued_tx.returnMessage();

      if (
        queued_txmsg.step.game <= game_mod.game.step.game &&
        queued_txmsg.step.game <= game_mod.game.step.players[queued_tx.transaction.from[0].add]
      ) {
        game_mod.game.future.splice(i, 1);
        i--;
      }
    }

    //console.log(` NEXT MOVES: /arcade/observer_multi/${game_mod.game.id}/${game_mod.game.step.bid}/${game_mod.game.step.tid}/${game_mod.game.step.ts}`);

    fetch(
      `/arcade/observer_multi/${game_mod.game.id}/${game_mod.game.step.bid}/${game_mod.game.step.tid}/${game_mod.game.step.ts}`
    )
      .then((response) => {
        response.json().then((data) => {
          //console.log("data length: " + data.length);

          for (let i = 0; i < data.length; i++) {
            //console.log("i: " + i + " --- tx id: " + data[i].id);
            let future_tx = new saito.default.transaction(JSON.parse(data[i].tx));
            future_tx.msg = future_tx.returnMessage();
            future_tx.msg.game_state = {};
            //
            // write this data into the tx
            //
            future_tx.msg.last_move = data[i].last_move;
            future_tx.msg.last_tid = data[i].tid;
            future_tx.msg.last_bid = data[i].bid;
            future_tx = arcade_self.app.wallet.signTransaction(future_tx);

            let already_contains_move = 0;
            for (let z = 0; z < game_mod.game.future.length; z++) {
              let tmptx = new saito.default.transaction(JSON.parse(game_mod.game.future[z]));

              //console.log("steps comparison: " + future_tx.msg.step.game + " -- vs -- " + game_mod.game.step.game);

              if (
                future_tx.msg.step.game <= game_mod.game.step.game &&
                future_tx.msg.step.game <=
                  game_mod.game.step.players[future_tx.transaction.from[0].add]
              ) {
                already_contains_move = 1;
              }
            }

            if (already_contains_move == 0) {
              game_mod.game.future.push(JSON.stringify(future_tx.transaction));
            }
          }

          game_mod.saveGame(game_mod.game.id);
          game_mod.saveFutureMoves(game_mod.game.id);

          if (mycallback != null) {
            mycallback(game_mod);
          }
        });
      })
      .catch((err) => console.info("ERROR 354322: error downloading next moves", err));
  }

  async initializeObserverModePreviousStep(game_id, starting_move) {
    let arcade_self = this;
    let { games } = arcade_self.app.options;

    let first_tx = null;

    //console.log(`FETCHING: /arcade/observer_prev/${game_id}/${starting_move}`);

    fetch(`/arcade/observer_prev/${game_id}/${starting_move}`).then((response) => {
      response.json().then((data) => {
        first_tx = JSON.parse(data[0].game_state);

        //console.log("UPDATED GAME TS to: " + JSON.stringify(first_tx.step));
        //console.log("UPDATED GAME QUEUE to: " + JSON.stringify(first_tx.queue));

        //
        // single transaction
        //
        let future_tx = new saito.default.transaction(JSON.parse(data[0].tx));
        future_tx.msg = future_tx.returnMessage();
        future_tx.msg.game_state = {};
        future_tx.msg.last_move = data[0].last_move;
        future_tx.msg.last_tid = data[0].tid;
        future_tx.msg.last_bid = data[0].bid;
        future_tx = arcade_self.app.wallet.signTransaction(future_tx);
        if (
          first_tx.future == undefined ||
          first_tx.future == "undefined" ||
          first_tx.future == null
        ) {
          first_tx.future = [];
        }
        first_tx.future.push(JSON.stringify(future_tx.transaction));

        //
        // we did not add a move
        //
        let game = first_tx;

        //
        // prevent old turns from persisting
        //
        game.turn = [];

        console.log("reset to step: " + game.step.game);
        console.log("queue at this step: " + game.queue);

        game.observer_mode = 1;
        game.observer_mode_active = 0;
        game.player = 0;

        //
        // set timestamp
        //
        game.step.ts = 0;

        let idx = -1;
        for (let i = 0; i < games.length; i++) {
          if (games[i].id === first_tx.id) {
            idx = i;
          }
        }
        if (idx == -1) {
          games.push(game);
        } else {
          games[idx] = game;
        }

        arcade_self.app.options.games = games;
        arcade_self.app.storage.saveOptions();

        let game_mod = arcade_self.app.modules.returnModule(game.module);

        //
        // move into or reload game
        //
        let slug = arcade_self.app.modules.returnModule(first_tx.module).returnSlug();
        window.location = "/" + slug;
      });
    });
  }

  initializeObserverMode(game_id, starting_move) {
    let arcade_self = this;
    let { games } = arcade_self.app.options;

    let first_tx = null;
    let first_tx_fetched = 0;

    console.log(`FETCHED: /arcade/observer_multi/${game_id}/0/0/${starting_move}`);

    fetch(`/arcade/observer_multi/${game_id}/0/0/${starting_move}`)
      .then((response) => {
        response.json().then((data) => {
          let did_we_add_a_move = 0;

          for (let i = 0; i < data.length; i++) {
            if (first_tx_fetched == 0) {
              first_tx = JSON.parse(data[i].game_state);
              first_tx_fetched = 1;
              let future_tx = new saito.default.transaction(JSON.parse(data[i].tx));
              future_tx.msg = future_tx.returnMessage();
              future_tx.msg.game_state = {};
              future_tx.msg.last_move = data[i].last_move;
              future_tx.msg.last_tid = data[i].last_tid;
              future_tx.msg.last_bid = data[i].bid;
              future_tx = arcade_self.app.wallet.signTransaction(future_tx);
              if (
                first_tx.future == undefined ||
                first_tx.future == "undefined" ||
                first_tx.future == null
              ) {
                first_tx.future = [];
              }
              first_tx.future.push(JSON.stringify(future_tx.transaction));
            } else {
              let future_tx = new saito.default.transaction(JSON.parse(data[i].tx));
              future_tx.msg = future_tx.returnMessage();
              future_tx.msg.game_state = {};
              future_tx.msg.last_move = data[i].last_move;
              future_tx.msg.last_tid = data[i].tid;
              future_tx.msg.last_bid = data[i].bid;
              future_tx = arcade_self.app.wallet.signTransaction(future_tx);
              if (
                first_tx.future == undefined ||
                first_tx.future == "undefined" ||
                first_tx.future == null
              ) {
                first_tx.future = [];
              }
              first_tx.future.push(JSON.stringify(future_tx.transaction));
            }

            did_we_add_a_move = 1;
          }

          //
          // we did not add a move
          //
          let game = first_tx;
          game.observer_mode = 1;
          game.observer_mode_active = 0;
          game.player = 0;

          let idx = -1;
          for (let i = 0; i < games.length; i++) {
            if (games[i].id === first_tx.id) {
              idx = i;
            }
          }
          if (idx == -1) {
            games.push(game);
          } else {
            games[idx] = game;
          }

          arcade_self.app.options.games = games;
          arcade_self.app.storage.saveOptions();

          //
          // move into game
          //
          let slug = arcade_self.app.modules.returnModule(first_tx.module).returnSlug();
          window.location = "/" + slug;
        });
      })
      .catch((err) =>
        console.info("ERROR 351232: error fetching queued games for observer mode", err)
      );
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

  updateIdentifier() {}

  onResetWallet() {
    if (this.app.options) {
      this.app.options.games = [];
    }
  }

  showShareLink(game_sig){
    let data = {};

    //Add more information about the game
    try{
      let accepted_game = null;
      this.games.forEach((g) => {
        if (g.transaction.sig === game_sig) {
          accepted_game = g;
        }
      });
      if (accepted_game){
        data.game = accepted_game.msg.game;
      }
    }catch(err){}

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
