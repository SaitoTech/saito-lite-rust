const saito = require("./../../lib/saito/saito");
const SaitoOverlay = require("../../lib/saito/new-ui/saito-overlay/saito-overlay");
const ModTemplate = require("../../lib/templates/modtemplate");
const ArcadeMain = require("./lib/main/main");
const GameLoader = require("./../../lib/saito/new-ui/game-loader/game-loader");
const ArcadeSidebar = require("./lib/sidebar/main");
const GameCreateMenu = require("./lib/overlay/game-create-menu");
const ArcadeGameDetails = require("./lib/overlay/game-wizard");
const ChallengeModal = require("./../../lib/saito/new-ui/modals/game-challenge/game-challenge");
const ArcadeGameSidebar = require("./lib/sidebar/arcade-game-sidebar");
const GameCryptoTransferManager = require("./../../lib/saito/new-ui/game-crypto-transfer-manager/game-crypto-transfer-manager");
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");
const ArcadeContainerTemplate = require("./lib/templates/arcade-container.template");
const InvitationLink = require("../../lib/saito/new-ui/modals/invitation-link/invitation-link");

const JSON = require("json-bigint");

const GameWizard = require('./lib/overlay/game-wizard');
const GameSelector = require('./lib/overlay/game-selector');
const ScheduleInvite = require('./lib/modals/schedule-invite/schedule-invite');


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
    this.services = [{ service: "arcade", domain: "saito" }];
    this.request_no_interrupts = false; // ask other modules not to insert content

    this.viewing_arcade_initialization_page = 0;
    this.viewing_game_homepage = ""; //// this.app.browser.returnURLParameter("game");

    this.icon_fa = "fas fa-gamepad";

    this.accepted = [];

    this.description = "A place to find, play and manage games!";
    this.categories = "Games Utilities";

    this.active_tab = "arcade";
    this.manual_ordering = false; // Toggle this to either sort games by their categories or go by the module.config order

    this.header = null;
    this.overlay = null;
    this.debug = false;

  }


  createGameSelector(obj = {}) {
    let x = new GameSelector(this.app, this, obj);
    x.render(this.app, this);
  }

  createGameWizard(gamename = "" , obj = {}) {
    let game_mod = this.app.modules.returnModule(gamename);
    if (game_mod) {
      let x = new GameWizard(this.app, this, game_mod, obj);
      x.render(this.app, this);
    }
  }

  renderArcadeMain() {
    if (this.browser_active == 1) {
      if (this.viewing_arcade_initialization_page == 0) {
        ArcadeMain.render(this.app, this);
        if (this.viewing_game_homepage) {
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

  returnGameById(game_id){
    let game = this.games.find((g) => g.transaction.sig == game_id);
    let gameObj = {
      id: game_id,
      game: game.msg.game,
      options: game.msg.options,
      players: game.msg.players,
      players_needed: game.msg.players_needed
    };
    return gameObj;
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
                GameCreateMenu.render(app, arcade_mod);
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
    if (type === 'user-menu') {
      return {
        text: "Challenge to Arcade Game",
        icon: "fas fa-gamepad",
        callback: function (app, publickey) {
    	  let obj = { publickey : publickey };
    	  let arcade_mod = app.modules.returnModule("Arcade");
    	  arcade_mod.createGameSelector(obj);
        }
      }
    }

    return null;
  }

  initialize(app) {
    super.initialize(app);

    //Load my locally saved games
    this.addMyGamesToOpenList();

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

    if (!app.BROWSER){return;}

    if (this.browser_active){
      //Add Chat-Manager to my components
      app.modules.respondTo("chat-manager").forEach(m => {
        this.addComponent(m.respondTo("chat-manager"));
      });


      //Leave a cookie trail to return to Arcade when you enter a game
      if (app.options.homeModule !== this.returnSlug()){
        app.options.homeModule = this.returnSlug();
        app.storage.saveOptions();
      }
    }

    app.connection.on("launch-game-selector", (graphical = false) => {
      if (graphical){
        this.createGameSelector();
      }else{
        GameCreateMenu.render(app, this);
      }
    });

    app.connection.on("arcade-close-game", (game_id)=>{
      this.removeGameFromOpenList(game_id);
    });



    app.connection.on("launch-game-wizard", (obj)=>{
      if (obj.game){
        this.createGameWizard(obj.game, obj);
      }
    });

    app.connection.on("join-game", (game_id)=>{
      ArcadeMain.joinGame(app, this, game_id);
    });

    app.connection.on("observer-add-game-render-request",(observerable_games)=>{
      if (this.browser_active && !this.viewing_arcade_initialization_page){
        let observer = app.modules.returnModule("Observer");
        if (observer){
          observer.renderArcadeTab(app, this);
        }
      }
    });

    app.connection.on("league-update", ()=>{
      if (this.browser_active && !this.viewing_arcade_initialization_page){
        let league = app.modules.returnModule("League");
        if (league){
          league.renderArcadeTab(app, this);
        }

      }
    });
    app.connection.on("game-ready", (gameid)=>{
      this.launchGame(gameid);
    });

    app.connection.on("arcade-gametable-addplayer", (game_id)=>{

      let accepted_game = this.games.find((g) => g.transaction.sig === game_id);
      if (accepted_game){
        let peers = [];
        for (let i = 0; i < app.network.peers.length; i++) {
          peers.push(app.network.peers[i].returnPublicKey());
        }

        let newtx = this.createJoinTransaction(accepted_game);
        app.network.propagateTransaction(newtx);

        let relay_mod = app.modules.returnModule("Relay");
        if (relay_mod != null) {
          relay_mod.sendRelayMessage(peers, "arcade spv update", newtx);
        }
      }

    });

    app.connection.on("arcade-gametable-removeplayer", (game_id)=>{
      let accepted_game = this.games.find((g) => g.transaction.sig === game_id);
      if (accepted_game){

        let newtx = app.wallet.createUnsignedTransactionWithDefaultFee();
        let msg = {
          request: "close",
          module: "Arcade",
        };

        newtx.msg = msg;
        newtx.msg.game_id = game_id;
        newtx = app.wallet.signTransaction(newtx);

        app.network.propagateTransaction(newtx);

        let peers = [];
        for (let i = 0; i < app.network.peers.length; i++) {
          peers.push(app.network.peers[i].returnPublicKey());
        }

        let relay_mod = app.modules.returnModule("Relay");
        if (relay_mod != null) {
          relay_mod.sendRelayMessage(peers, "arcade spv update", newtx);
        }
      }

    });

    app.connection.on("arcade-issue-challenge", (gameDetails) =>{
      let tx = this.createChallengeTransaction(gameDetails);
      app.connection.emit("send-relay-message", {recipient: gameDetails.players, request: "arcade spv update", data: tx});
    });

    app.connection.on("arcade-close-game", (gameid)=>{
      ArcadeMain.cancelGame(app, this, gameid);
    });
  }


  checkGameDatabase(){
    if (!this.app.BROWSER){return;}

    /*let cutoff = new Date().getTime() - this.old_game_removal_delay;
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
    );*/
  }

  //
  // load transactions into interface when the network is up
  onPeerHandshakeComplete(app, peer) {
    if (!app.BROWSER) {
      return;
    }
    // fetch any usernames needed
    app.browser.addIdentifiersToDom();

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
          ArcadeMain.joinGame(arcade_self.app, arcade_self, gameId, false);
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
    super.render(app, this, "#arcade-sidebar");
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
    let accepted_game = this.games.find((g) => g.transaction.sig === game_id);

    if (accepted_game == null){
      console.log("Game not available",this.games);
      return;
    }

    let { players } = (accepted_game) ? accepted_game.returnMessage() : [];

    if (this.debug) { console.log(JSON.parse(JSON.stringify(players))); }

    //Update Arcade hero to reflect new player
    this.joinGameOnOpenList(tx)

    if (this.debug) {
      console.log(JSON.parse(JSON.stringify(players)));
      this.checkGameDatabase();
    }

    //We only nope out for service-nodes here because we want those to process joinGameOnOpenList
    if (this.app.BROWSER == 0 || !accepted_game.msg.players.includes(app.wallet.returnPublicKey())){
      return;
    }


    //If this game already exists in our wallet
    //We don't need to continue processing for an accept
    if (this.app?.options?.games) {
      for (let i = 0; i < this.app.options.games.length; i++) {
        if (this.app.options.games[i].id === game_id) {
          return;
        }
      }
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

        console.log(JSON.parse(JSON.stringify(newtx)));
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
      this.launchGame(/*txmsg.game_id*/);
      return;
    }

  }


  async acceptGame(app, tx) {
    let txmsg = tx.returnMessage();

    let gamemod = this.app.modules.returnModule(txmsg.game);
    console.log(JSON.parse(JSON.stringify(txmsg)));

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
    }else{
      this.markGameAsOpen(tx);
    }

    // do not process if transaction is not for us
    if (!tx.isTo(app.wallet.returnPublicKey()) || app.BROWSER == 0) {
      //console.log("TX not for me");
      return;
    }

    this.addMyGamesToOpenList();

    // do not re-accept if game is really old (sanity check)
    for (let i = 0; i < this.app?.options?.games?.length; i++) {
      if (this.app.options.games[i].id == txmsg.game_id) {
        if (this.app.options.games[i].initializing == 0) { //Is that right, I don't know if this condition can be true
          let currentTime = new Date().getTime();
          if (currentTime - this.app.options.games[i].ts > 5000) {
            console.log("nope out of old game");
            return;
          }
        }
        if (this.debug){
          console.log(`game (${txmsg.game_id}) already exists`);
          console.info("MY CREATED GAMES: ", this.app?.options?.games);
        }
        return;
      }
    }


    if (txmsg.players.includes(app.wallet.returnPublicKey())) {
      console.log("Accept game for real");

      if (this.browser_active) {
        if (!this.viewing_arcade_initialization_page){
          this.launchGame(null);
        }
      }else{
        app.connection.emit("arcade-game-loading");
        siteMessage(txmsg.module + ' invite accepted.', 20000);
      }

      if (this.debug){
        console.info("MY CREATED GAMES: ", this.app?.options?.games);
        console.log("telling game module to receiveAcceptTx");
      }

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

      if (txmsg.request == "challenge"){
        if (this.debug) { console.log("handlePeerRequest: challenge request received"); }
        this.receiveChallenge(app, tx);
      }

      if (txmsg.request == "sorry"){
        if (this.debug) { console.log("handlePeerRequest: sorry request received"); }
        app.connection.emit("arcade-reject-challenge", txmsg.game_id);
      }

      //console.log(txmsg);

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
      if (this.debug){ console.log(accepted_game) };
      if (accepted_game.transaction.from[0].add == tx.transaction.from[0].add && !accepted_game?.open) {
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
      if (g.id === game_id && g.over !== 1) {
        console.log("Mark game closed in options");
        g.over = 1;
      }
    });

    //Refresh Arcade Main
    ArcadeMain.renderArcadeTab(app, this);
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
    let start_bid = BigInt(1);
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

    if (app.BROWSER) {return;}
    if (this.debug) { console.log("Close game " + id); }
    let sql = `UPDATE games SET status = $status WHERE game_id = $game_id AND status != 'over'`;
    let params = { $status: "close", $game_id: id };
    //console.log(sql, params);
    await app.storage.executeDatabase(sql, params, "arcade");
  }

  async receiveGameoverRequest(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();
    let id = txmsg.sig || txmsg.game_id;
    this.removeGameFromOpenList(id);            //remove from arcade.games[]

    if (app.BROWSER) {return;}
    if (this.debug) { console.log("Resign game " + JSON.stringify(id)); }
    let sql = `UPDATE games SET status = $status, winner = $winner WHERE game_id = $game_id`;
    let params = { $status: "over", $winner: txmsg.winner, $game_id: id };
    //console.log(sql, params);
    await app.storage.executeDatabase(sql, params, "arcade");
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
            ArcadeMain.renderArcadeTab(app, this);
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

  createChallengeTransaction(gameData){

    let ts = new Date().getTime();
    let accept_sig = this.app.crypto.signMessage(
      `invite_game_${ts}`,
      this.app.wallet.returnPrivateKey()
    );

    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();

    for (let sendto of gameData.players){
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


  receiveChallenge(app, tx){
    if (!tx.transaction || !tx.transaction.sig || !tx.msg) {
      return;
    }

    if (!tx.isTo(this.app.wallet.returnPublicKey())){
      return;
    }

    this.addGameToOpenList(tx);

    let challenge = new ChallengeModal(app, this, tx);
    challenge.processChallenge(app, tx);

  }



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

    let { ts, name, options, players_needed, invitation_type } = gamedata;

    let requestMsg = invitation_type == "private" ? "private" : "open";

    let accept_sig = this.app.crypto.signMessage(
      `invite_game_${ts}`,
      this.app.wallet.returnPrivateKey()
    );

    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    if (recipient != "") { tx.transaction.to.push(new saito.default.slip(sendto, 0.0)); }

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
    //tx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));

    tx.msg = JSON.parse(JSON.stringify(txmsg));;
    tx.msg.module = txmsg.game;
    tx.msg.status = txmsg.request;
    tx.msg.game_id = gametx.transaction.sig;
    tx.msg.request = "accept";

    tx = this.app.wallet.signTransaction(tx);

    return tx;
  }


  async launchSinglePlayerGame(app, gameobj) {
    try {

      this.launchGame();

      if (app.options.games){
        for (let i = 0; i < app.options.games.length; i++){
          if (app.options.games[i].module == gameobj.name){
            console.log("We already have an open copy of this single player game");
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

      this.addMyGamesToOpenList();
      this.launchGame(game_id);

    } catch (err) {
      console.log(err);
      return;
    }

  }

  async launchGame(game_id) {

    if (this.debug) { console.log("ALREADY SHOWING LOADER? " + this.viewing_arcade_initialization_page); }

    if (!game_id && !this.viewing_arcade_initialization_page){
      if (this.browser_active){
        let gameLoader = new GameLoader(this.app, this);
        gameLoader.render(this.app, this, "#arcade-main");
      }
      this.viewing_arcade_initialization_page = 1;
      console.log("Set up spinner and stop");
      return;
    }

    if (this.app.options?.games) {
      for (let i = 0; i < this.app.options.games.length; i++) {
        if (this.app.options.games[i].id == game_id) {
          console.log("Game exists, and " + this.app.options.games[i].initializing)
         if (this.app.options.games[i].initializing == 0) {

            let ready_to_go = 1;

            if (this.app.wallet.wallet.pending.length > 0) {
              console.log("Pending Messages!?!");
              for (let j = 0; j < this.app.wallet.wallet.pending.length; j++) {
                let thistx = new saito.default.transaction(JSON.parse(this.app.wallet.wallet.pending[j]));
                let thistxmsg = thistx.returnMessage();

                if (thistxmsg.module == this.app.options.games[i].module && thistxmsg.game_id == game_id && thistxmsg?.step?.game) {
                  console.log("message is: " + JSON.stringify(thistxmsg));
                  ready_to_go = 0;
                  if (thistxmsg?.step?.game <= this.app.options.games[i].step.game) {
                    console.log("never mind, old move");
                    ready_to_go = 1;
                  }
                }
              }
            }

            if (ready_to_go){

              if (this.browser_active){
                let gameLoader = new GameLoader(this.app, this, game_id);
                gameLoader.render(this.app, this, "#arcade-main", "Your game is ready to start!");
              }else{
                let gm = this.app.modules.returnModule(this.app.options.games[i].module);
                if (gm){
                  let game_name = gm.gamename || gm.name;
                  this.app.connection.emit("arcade-game-ready-play", {game_id, game_name});
                  let go = await sconfirm(`${game_name} is ready. Join now?`);
                  if (go){
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

    ArcadeMain.renderArcadeTab(this.app, this);
  }

  markGameAsOpen(tx){
    let txmsg = tx.returnMessage();
    for (let game of this.games){
      if (game.transaction.sig == txmsg.game_id){
        game.open = true;
      }
    }
  }

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

  /*
    Adds player to list of players for the multiplayer game
  */
  joinGameOnOpenList(tx) {
    if (!tx.transaction || !tx.transaction.sig || !tx.msg || tx.msg.over == 1) {
      return false;
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

          if (this.debug) { console.log("Player should get added to arcade hero"); }
          ArcadeMain.renderArcadeTab(this.app, this);
          return true;
        }
      }
    }

    return false;

  }

  leaveGameOnOpenList(tx) {
    if (!tx.transaction || !tx.transaction.sig || !tx.msg || tx.msg.over == 1) {
      return;
    }

    let txmsg = tx.returnMessage();
    let game_id = txmsg.sig || txmsg.game_id;
    console.log(`Player ${tx.transaction.from[0].add} wants out of game ${game_id}`);
    for (let i = 0; i < this.games.length; i++) {
      if (this.games[i]?.transaction.sig === game_id) {
        if (this.games[i].msg.players.includes(tx.transaction.from[0].add)) {
          let p_index = this.games[i].msg.players.indexOf(tx.transaction.from[0].add);
          this.games[i].msg.players.splice(p_index, 1);
          //Make sure player_sigs array exists and add invite_sig
          if (this.games[i].msg.players_sigs && this.games[i].msg.players_sigs.length > p_index) {
            this.games[i].msg.players_sigs.splice(p_index, 1);
          }

          this.updatePlayerList(game_id, this.games[i].msg.players, this.games[i].msg.players_sigs);
          break;
        }
      }
    }

    try {
      if (this.debug){ console.log("Player should get removed from arcade hero"); }
      ArcadeMain.renderArcadeTab(this.app, this);
    } catch (err) {
      console.log("Non-fatal error rendering open game list");
    }
  }


  /*
  Update the Games Table with a new list of players+signatures for the multiplayer game
  (works for adding or subtracting players and enforces consistent ordering)
  */
  async updatePlayerList(id, keys, sigs) {
    this.app.connection.emit("Arcade-Observer-Update-Player", {id, keys});

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
    if (this.validateGame(tx)) {
      this.games.unshift(tx);
      ArcadeMain.renderArcadeTab(this.app, this);
    }
  }


  /*
    Process games we read from Arcade SQL table
    First validate the games (make sure they are game invite txs)
    and filter any old games (for which we aren't a member...)
    TODO: if I see my old invite, but no one else does, what is the point?
  */
  addGamesToOpenList(txs) {
    console.log("Loaded games:");
    txs.forEach((tx, i) => {
      if (this.validateGame(tx)) {
          console.log(JSON.parse(JSON.stringify(tx)));
          this.games.unshift(tx);
      }
    });

    this.removeOldGames();
    ArcadeMain.renderArcadeTab(this.app, this);

  }


  //
  // add my own games (as fake txs)
  //
  addMyGamesToOpenList(){
    if (this.app?.options?.games != null) {
      for (let game of this.app.options.games) {
        if (game.over == 0 && (game.players_set != 1 || game.players.includes(this.app.wallet.returnPublicKey()) || game.accepted.includes(this.app.wallet.returnPublicKey()))) {
          this.addGameToOpenList(this.createGameTXFromOptionsGame(game));
        }
      }
    }

  }

  removeOldGames() {
    let removed_old_games = false;

    for (let i = this.games.length-1; i >= 0; i--) {
      if (!this.games[i].msg?.players?.includes(this.app.wallet.returnPublicKey())) {
        let timepassed = new Date().getTime() - parseInt(this.games[i].transaction.ts);
        if (timepassed > this.old_game_removal_delay) {
          this.games.splice(i, 1);
          removed_old_games = true;
        }
      }
    }

    return removed_old_games;
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
    let accepted_game = this.games.find((g) => g.transaction.sig === game_sig);

    if (accepted_game) {
      data.game = accepted_game.msg.game;
    }else{
      console.log("Game invitation not found");
      return;
    }

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

    console.log(JSON.stringify(data));

    let invitationModal = new InvitationLink(this.app, this);
    invitationModal.render(this.app, this, data);
  }


  async verifyOptions(gameType, options){
    if (gameType !== "single"){
      for (let game of this.games){
        if (this.isMyGame(game, this.app) && game.msg.players_needed>1){
          let c = await sconfirm(`You already have a ${game.msg.game} game open, are you sure you want to create a new game invite?`);
          if (!c){
            return false;
          }
        }
        if (game.msg.game === options.game){
          let c = await sconfirm(`There is an open invite for ${game.msg.game}, are you sure you want to create a new invite?`);
          if (!c){
            return false;
          }
        }
      }
    }

    //
    // if crypto and stake selected, make sure creator has it
    //
    try{
      if (options.crypto && parseFloat(options.stake) > 0) {
        let crypto_transfer_manager = new GameCryptoTransferManager(this.app);
        let success = await crypto_transfer_manager.confirmBalance(this.app, this, options.crypto, options.stake);
        if (!success){
          return false;
        }
      }
    }catch(err){
       console.log("ERROR checking crypto: " + err);
      return false;
    }

    return true;
  }

  makeGameInvite(options, gameType = "public"){
    console.log(JSON.parse(JSON.stringify(options)));

    let game = options.game;
    let game_mod = this.app.modules.returnModule(game);
    let players_needed = options["game-wizard-players-select"];

    if (!players_needed) {
      console.error("Create Game Error");
      console.log(options);
      return;
    }

    if (options["game-wizard-players-select-max"] && options["game-wizard-players-select-max"] < players_needed){
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
    };

    if (players_needed == 1) {
      this.launchSinglePlayerGame(this.app, gamedata); //Game options don't get saved....
    } else {

      if (gameType == "private" || gameType == "direct") {
        gamedata.invitation_type = "private";
      }

      if (gameType == "direct") {
        let newtx = this.createOpenTransaction(gamedata, options.publickey);
        let w = new ScheduleInvite(this.app, this, newtx);
        w.render(this.app, this);
        return;
      }

      let newtx = this.createOpenTransaction(gamedata);
      this.app.network.propagateTransaction(newtx);

      //
      // and relay open if exists
      //
      let peers = [];
      for (let i = 0; i < this.app.network.peers.length; i++) {
        peers.push(this.app.network.peers[i].returnPublicKey());
      }

      this.app.connection.emit("send-relay-message", {recipient: peers, request: "arcade spv update", data: newtx});

      this.addGameToOpenList(newtx);

      this.active_tab = "arcade"; //So it refreshes to show the new game invite

      this.renderArcadeMain(this.app, this.mod);

      if (gameType == "private") {
        console.log(newtx);
        //Create invite link from the game_sig
        this.showShareLink(newtx.transaction.sig);
      }
    }
  }

}

module.exports = Arcade;
