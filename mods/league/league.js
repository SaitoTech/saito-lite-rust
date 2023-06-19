const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const LeagueRankings = require("./lib/rankings");
const LeagueLeaderboard = require("./lib/leaderboard");
const LeagueMain = require("./lib/main");
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");
const SaitoOverlay = require("../../lib/saito/ui/saito-overlay/saito-overlay");
<<<<<<< HEAD
const InvitationLink = require("./lib/overlays/league-invitation-link");
const JoinLeagueOverlay = require("./lib/overlays/join");
const PeerService = require("saito-js/lib/peer_service").default;
=======
const JoinLeagueOverlay = require("./lib/overlays/join");
const localforage = require("localforage");

>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

//Trial -- So that we can display league results in game page
const LeagueOverlay = require("./lib/overlays/league");
const Slip = require("../../lib/saito/slip");

class League extends ModTemplate {
  constructor(app) {
    super(app);

    this.name = "League";
    this.slug = "league";
    this.description = "Leaderboards and leagues for Saito Games";
    this.categories = "Arcade Gaming";
    this.overlay = null;

    this.styles = ["/league/style.css", "/arcade/style.css"];

    this.leagues = [];

    //
    // UI components
    //
    this.main = null;
    this.header = null;

    /* Not fully implemented
    Only keep the last N recent games
    You don't play a game for 30 days, you get dropped from leaderboard
     (should prune data from SQL table or just filter from UI???)
    */
    this.recent_game_cutoff = 10;
    this.inactive_player_cutoff = 30 * 24 * 60 * 60 * 1000;

    this.theme_options = {
      lite: "fa-solid fa-sun",
      dark: "fa-solid fa-moon",
      arcade: "fa-solid fa-gamepad",
    };

    this.icon_fa = "fas fa-user-friends";
    this.debug = false;
  }

  //
  // declare that we support the "league" service, which allows peers to query
  // us for league-related information (leagues, players, leaderboards, etc.)
  //
  returnServices() {
    if (this.app.BROWSER) {
      return [];
    }
<<<<<<< HEAD
    return [new PeerService(null, "league", "", "saito")];
  }

  async initialize(app) {
    this.loadLeagues();
=======
    return [{ service: "league", domain: "saito" }];
  }


  respondTo(type, obj = null){
    if (type == "league_membership"){
      let league_self = this;
      return {
        testMembership: (league_id) => {
          let leag = league_self.returnLeague(league_id);
          if (!leag) { 
            //console.log("No league");
            return false; }
          if (leag.rank < 0) { 
            //console.log("Not a member");
            return false; }
          if (leag?.unverified) { 
            //console.log("Unverified");
            return false;}
          return true;
        }
      };
    }

    return super.respondTo(type, obj);
  }

  initialize(app) {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

    await super.initialize(app);

    //Trial -- So that we can display league results in game page
    this.overlay = new LeagueOverlay(app, this);

    //
    // create initial leagues
    //
<<<<<<< HEAD
    for (let modResponse of await this.app.modules.getRespondTos("default-league")) {
      await this.addLeague({
=======
    this.app.modules.getRespondTos("default-league").forEach((modResponse) => {
      this.addLeague({
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
        id: app.crypto.hash(modResponse.modname), // id
        game: modResponse.game, // game - name of game mod
        name: modResponse.name, // name - name of league
        admin: "", // admin - publickey (if exists)
        status: "public", // status - public or private
        description: modResponse.description, //
        ranking_algorithm: modResponse.ranking_algorithm, //
        default_score: modResponse.default_score, // default ranking for newbies
      });
<<<<<<< HEAD
    }

    this.sortLeagues();
    //Render initial UI based on what we have saved
    app.connection.emit("leagues-render-request");
    app.connection.emit("league-rankings-render-request");

    if (app.browser.returnURLParameter("view_game")) {
      let game = app.browser.returnURLParameter("view_game");
      game = game.substring(0, 1).toUpperCase() + game.substring(1).toLowerCase();
      let leaderboard_id = app.crypto.hash(game);
      console.log("ID: " + leaderboard_id, game);
      app.connection.emit("league-overlay-render-request", leaderboard_id);
    }
=======
    });

    this.loadLeagues();

    //this.pruneOldPlayers();

    if (app.browser.returnURLParameter("view_game")) {
      let game = app.browser.returnURLParameter("view_game").toLowerCase();
      let gm = app.modules.returnModuleBySlug(game);
      if (!gm){ 
        return; 
      }
      //TODO: Reset the default leagues and make the hashes based on game slugs!!!!
      let leaderboard_id = app.crypto.hash(gm.returnName());
      console.log("ID: " + leaderboard_id, game);
      app.connection.emit("league-overlay-render-request", leaderboard_id);
    }

    if (app.browser.returnURLParameter("league")) {
      app.connection.emit("league-overlay-render-request", app.browser.returnURLParameter("league")); 
    }

>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
  }

  //
  // So leagues are displayed in same order as game list for consistency's sake
  //
  sortLeagues() {
    let superArray = [];
    try {
      this.leagues.forEach((l) => {
        let gm = this.app.modules.returnModuleByName(l.game);
        //This will filter out any games we previously deleted
        if (gm) {
          superArray.push([l.admin, gm.categories, l]);
        }
      });

      superArray.sort((a, b) => {
        //Push community leagues to the bottom
        if (a[0] && !b[0]) {
          return 1;
        }
        if (!a[0] && b[0]) {
          return -1;
        }

        //Sort by game categories
        if (a[1] > b[1]) {
          return 1;
        }
        if (a[1] < b[1]) {
          return -1;
        }

        return 0;
      });

      this.leagues = [];
      for (let i = 0; i < superArray.length; i++) {
        this.leagues.push(superArray[i][2]);
      }
    } catch (err) {
      console.warn(err);
    }
  }

  //////////////////////////
  // Rendering Components //
  //////////////////////////
<<<<<<< HEAD
  async render() {
=======
  render() {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    let app = this.app;
    let mod = this.mod;

    this.main = new LeagueMain(app, this);
    this.header = new SaitoHeader(app, this);
    this.addComponent(this.main);
    this.addComponent(this.header);

    await super.render(app, this);
  }

  canRenderInto(qs) {
    if (qs == ".redsquare-sidebar") {
      return true;
    }
<<<<<<< HEAD
    return qs == ".arcade-leagues";
=======
    if (qs == ".arcade-leagues") {
      return true;
    }
    return false;
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
  }

  async renderInto(qs) {
    if (qs == ".redsquare-sidebar" || qs == ".arcade-leagues") {
      if (!this.renderIntos[qs]) {
        this.renderIntos[qs] = [];
        this.renderIntos[qs].push(new LeagueRankings(this.app, this, qs));
      }
      this.styles = ["/league/style.css", "/arcade/style.css"];
      this.attachStyleSheets();
<<<<<<< HEAD
      for (const comp of this.renderIntos[qs]) {
        await comp.render();
      }
=======
      this.renderIntos[qs].forEach((comp) => {
        comp.render();
      });
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    }
  }

  validateID(league_id) {
    if (/^[a-z0-9]*$/.test(league_id)) {
      return league_id;
    }
    return "";
  }

  async onPeerServiceUp(app, peer, service) {
    //
    // add remote leagues
    //
    return;
    let league_self = this;

    if (service.service === "league") {
      if (this.debug) {
        console.log("===  peer server up  ===");
        console.log("Refresh local leagues: ");
      }

      let league_id = this.validateID(app.browser.returnURLParameter("league_id"));

      let sql;

      if (this.browser_active || league_id) {
        if (this.debug) {
          console.log("Load all leagues");
        }
<<<<<<< HEAD
        sql = `SELECT *
               FROM leagues
               WHERE status = 'public'
                  OR id = '${league_id}'`;
      } else {
        if (this.debug) {
          console.log("Load my leagues");
        }
        let league_list = this.leagues.map((x) => `'${x.id}'`).join(", ");
        sql = `SELECT *
               FROM leagues
               WHERE id IN (${league_list})`;
=======
        sql = `SELECT * FROM leagues WHERE ( status = 'public' OR id = '${league_id}' ) AND deleted = 0`;
      } else {
        let league_list = this.app.options.leagues.map((x) => `'${x}'`).join(", ");

        if (this.debug) {
          console.log("Load my leagues: " + league_list);
        }
        
        sql = `SELECT * FROM leagues WHERE id IN (${league_list})`;
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
      }
      //
      // load any requested league we may not have in options file
      // or refresh any league data that has changed
      //
<<<<<<< HEAD
      await this.sendPeerDatabaseRequestWithFilter(
=======
      this.sendPeerDatabaseRequestWithFilter(
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
        "League",
        sql,
        (res) => {
          if (res?.rows) {
            for (let league of res.rows) {
<<<<<<< HEAD
              league_self.updateLeague(league);
=======
              //In case I missed the deletion tx, I can catch that my league has been removed and I should drop it
              if (league.deleted){
                league_self.removeLeague(league.id);
              }else{
                league_self.updateLeague(league);  
              }
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
            }
          }

          app.connection.emit("leagues-render-request");
<<<<<<< HEAD
          //
          // league join league
          //
          if (league_id) {
            console.log("Joining league: ", league_id);
            let jlo = new JoinLeagueOverlay(app, league_self, league_id);
            jlo.render();
          }
        },
        (p) => {
          if (p == peer) {
            return 1;
          }
          return 0;
        }
      );

      //
      // fetch updated rankings
      //

=======
          app.connection.emit("league-rankings-render-request");

          //
          // league join league
          //
          if (league_id) {
            console.log("Joining league: ", league_id);
            let jlo = new JoinLeagueOverlay(app, league_self, league_id);
            jlo.render();
          }
        },
        (p) => {
          if (p == peer) {
            return 1;
          }
          return 0;
        }
      );

      //
      // fetch updated rankings
      //

      //console.log("Will update League rankings in 5sec");
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
      setTimeout(() => {
        let league_list = this.leagues.map((x) => `'${x.id}'`).join(", ");
        //console.log(league_list);

        let league = null;
        let rank, myPlayerStats;
        let cutoff = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
        //console.log("Sending SQL query to update");
        this.sendPeerDatabaseRequestWithFilter(
          "League",
<<<<<<< HEAD
          `SELECT *
           FROM players
           WHERE (ts > ${cutoff} OR games_finished > 0 OR publickey = '${this.publicKey}')
             AND league_id IN (${league_list})
           ORDER BY league_id, score DESC, games_won DESC, games_tied DESC, games_finished DESC`,
          (res) => {
            if (res?.rows) {
              let league_id = 0;

              for (let p of res.rows) {
                //Next League
                if (p.league_id !== league_id) {
                  league_id = p.league_id;

=======
          `SELECT * FROM players WHERE deleted = 0 AND (ts > ${cutoff} OR games_finished > 0 OR publickey = '${this.app.wallet.returnPublicKey()}') AND league_id IN (${league_list}) ORDER BY league_id, score DESC, games_won DESC, games_tied DESC, games_finished DESC`,
          (res) => {
            if (res?.rows) {
              let league_id = 0;

              for (let p of res.rows) {
                //Next League
                if (p.league_id !== league_id) {
                  league_id = p.league_id;

>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
                  //Add me to bottom of list if I haven't played any games
                  if (myPlayerStats) {
                    this.addLeaguePlayer(league_id, myPlayerStats);
                  }

                  league = league_self.returnLeague(league_id);
                  league.players = [];
                  rank = 0;
                  myPlayerStats = null;
<<<<<<< HEAD
                  league.ts = new Date().getTime();
=======
                  //league.ts = new Date().getTime();
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
                }

                //
                // Count how many people are ranked above me in the leaderboard
                //
                rank++;

<<<<<<< HEAD
                if (p.publickey == this.publicKey) {
=======
                if (p.publickey == this.app.wallet.returnPublicKey()) {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
                  if (p.games_finished > 0) {
                    league.rank = rank;
                  } else {
                    league.rank = 0;
                    myPlayerStats = p;
                    continue;
                  }
                }

                //
                // Update player-league data in our live data structure
                //
                this.addLeaguePlayer(league_id, p);
<<<<<<< HEAD
              }

              //Add me to bottom of list if I haven't played any games
              if (myPlayerStats) {
                this.addLeaguePlayer(league_id, myPlayerStats);
              }

              league_self.leagues.forEach((l) => {
                l.numPlayers = l.players.length;
              });
              app.connection.emit("leagues-render-request");
              app.connection.emit("league-rankings-render-request");
=======
              }

              //Add me to bottom of list if I haven't played any games
              if (myPlayerStats) {
                this.addLeaguePlayer(league_id, myPlayerStats);
              }

              league_self.leagues.forEach((l) => {
                l.numPlayers = l.players.length;
              });

              //Refresh UI
              app.connection.emit("leagues-render-request");
              app.connection.emit("league-rankings-render-request");

              //Save locally
              this.saveLeagues();

>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
            }
          },
          (p) => {
            if (p.hasService("league")) {
              return 1;
            }
            return 0;
          }
        );
<<<<<<< HEAD
      }, 2000);
    }
  }

  async onConfirmation(blk, tx, conf) {
=======
      }, 5000);
    }
  }

  async onConfirmation(blk, tx, conf, app) {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    if (conf != 0) {
      return;
    }

    try {
      let txmsg = tx.returnMessage();

      if (this.debug) {
        console.log("LEAGUE onConfirmation: " + txmsg.request);
      }

      if (txmsg.request === "league create") {
<<<<<<< HEAD
        await this.receiveCreateTransaction(blk, tx, conf);
      }

      if (txmsg.request === "league join") {
        await this.receiveJoinTransaction(blk, tx, conf);
      }
      if (txmsg.request === "league quit") {
        await this.receiveQuitTransaction(blk, tx, conf);
      }

      if (txmsg.request === "league remove") {
        await this.receiveRemoveTransaction(blk, tx, conf);
      }

      if (txmsg.request === "league update") {
        await this.receiveUpdateTransaction(blk, tx, conf);
      }

      if (txmsg.request === "league update player") {
        await this.receiveUpdatePlayerTransaction(blk, tx, conf);
      }

      if (txmsg.request === "gameover") {
        await this.receiveGameoverTransaction(txmsg);
      }

      if (txmsg.request === "roundover") {
        await this.receiveRoundoverTransaction(txmsg);
      }

      if (txmsg.request === "accept") {
        await this.receiveAcceptTransaction(blk, tx, conf);
      }

      if (txmsg.request === "launch singleplayer") {
        await this.receiveLaunchSinglePlayerTransaction(blk, tx, conf);
=======
        await this.receiveCreateTransaction(blk, tx, conf, app);
      } else if (txmsg.request === "league join") {
        await this.receiveJoinTransaction(blk, tx, conf, app);
      } else if (txmsg.request === "league quit") {
        await this.receiveQuitTransaction(blk, tx, conf, app);
      } else if (txmsg.request === "league remove") {
        await this.receiveRemoveTransaction(blk, tx, conf, app);
      } else if (txmsg.request === "league update") {
        await this.receiveUpdateTransaction(blk, tx, conf, app);
      } else if (txmsg.request === "league update player") {
        await this.receiveUpdatePlayerTransaction(blk, tx, conf, app);
      } else if (txmsg.request === "gameover") {
        await this.receiveGameoverTransaction(app, txmsg);
      } else if (txmsg.request === "roundover") {
        await this.receiveRoundoverTransaction(app, txmsg);
      } else if (txmsg.request === "accept") {
        await this.receiveAcceptTransaction(blk, tx, conf, app);
      } else if (txmsg.request === "launch singleplayer") {
        await this.receiveLaunchSinglePlayerTransaction(blk, tx, conf, app);
      } else {
        //Don't save or refresh if just a game move!!!
        return;
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
      }

      this.saveLeagues();

      if (this.app.BROWSER) {
        this.app.connection.emit("leagues-render-request");
        this.app.connection.emit("league-rankings-render-request");
      }
    } catch (err) {
      console.log("ERROR in league onConfirmation: " + err);
    }
  }

  shouldAffixCallbackToModule(modname, tx = null) {
    if (modname == "League") {
      return 1;
    }
    if (modname == "Arcade") {
      return 1;
    }
    for (let i = 0; i < this.leagues.length; i++) {
      if (this.leagues[i].game === modname) {
        return 1;
      }
    }
    return 0;
  }

<<<<<<< HEAD
  loadLeagues() {
    if (this.app.options.leagues) {
      if (this.debug) {
        console.log(
          "Locally stored leagues:",
          JSON.parse(JSON.stringify(this.app.options.leagues))
        );
      }

      this.leagues = this.app.options.leagues;

      //Restore the array for players
      for (let league of this.leagues) {
        league.players = [];
=======
  async loadLeagues() {
    let league_self = this;
    if (this.app.BROWSER){
      if (this.app.options.leagues) {
        if (this.debug) {
          console.log(
            "Locally stored leagues:",
            JSON.parse(JSON.stringify(this.app.options.leagues))
          );
        }

        let cnt = this.app.options.leagues.length;

        for (let lid of this.app.options.leagues) {
          localforage.getItem(`league_${lid}`, async function (error, value) {
            //Because this is async, the initialize function may have created an
            //empty default group

            if (value) {
              //console.log(`Loaded League ${lid.substring(0,10)} from IndexedDB`);
              await league_self.updateLeague(value);
              
              let league = league_self.returnLeague(lid);
              
              //Make sure we get these data right!
              league.players = value.players;
              league.rank = value.rank;
              league.numPlayers = value.numPlayers;
            }

            cnt--;

            if (cnt == 0){
              //console.log("All leagues loaded from IndexedDB --> refresh UI");
              league_self.sortLeagues();
              //Render initial UI based on what we have saved
              league_self.app.connection.emit("leagues-render-request");      // league/ main
              league_self.app.connection.emit("league-rankings-render-request"); // sidebar league list
              league_self.app.connection.emit("finished-loading-leagues");
            }
          });
        }

        return;
      }else{
        this.app.options.leagues = [];
      }
    } else {

      //Do we need to make sure the service node has all the data in memory??
      let sqlResults = await this.app.storage.queryDatabase(`SELECT * FROM leagues WHERE deleted = 0`, [], "league");
      for (let league of sqlResults) {
        league_self.updateLeague(league);
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
      }

    }

  }

  /**
   * We only store the leagues we are a member of.
<<<<<<< HEAD
   * And we only store meta data, not full player list.
=======
   * League id -> app.options, full league data in localForage
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
   */
  saveLeagues() {
    if (!this.app.BROWSER) {
      return;
    }

    let league_self = this;
    this.app.options.leagues = [];

    for (let league of this.leagues) {
<<<<<<< HEAD
      if (league.rank >= 0 || league.admin === this.publicKey) {
        let newLeague = JSON.parse(JSON.stringify(league));
        delete newLeague.players;
        this.app.options.leagues.push(newLeague);
=======
      if (league.rank >= 0 || league.admin === this.app.wallet.returnPublicKey()) {
        //let newLeague = JSON.parse(JSON.stringify(league));
        //delete newLeague.players;
        this.app.options.leagues.push(league.id);
        localforage.setItem(`league_${league.id}`, league).then(function () {
          if (league_self.debug) {
            console.log("Saved league data for " + league.id);
            console.log(JSON.parse(JSON.stringify(league)));
          }
        });
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
      }
    }

    if (this.debug) {
      console.info("Save Leagues:");
      console.info(JSON.stringify(this.app.options.leagues));
      console.info(JSON.parse(JSON.stringify(this.leagues)));
    }

    this.app.storage.saveOptions();
  }

  /////////////////////
  // create a league //
  /////////////////////
<<<<<<< HEAD
  async createCreateTransaction(obj = null) {
=======
  createCreateTransaction(obj = null) {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    if (obj == null) {
      return null;
    }

    let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();
    newtx.msg = this.validateLeague(obj);
    newtx.msg.module = "League";
    newtx.msg.request = "league create";

<<<<<<< HEAD
    let slip = new Slip();
    slip.publicKey = this.publicKey;
    newtx.addToSlip(slip);
    await newtx.sign();
    return newtx;
  }

  async receiveCreateTransaction(blk, tx, conf) {
    let txmsg = tx.returnMessage();

    let obj = this.validateLeague(txmsg);
    obj.id = tx.signature;

    await this.addLeague(obj);
  }

  addressToAll(tx, league_id) {
    let slip = new Slip();
    slip.publicKey = this.publicKey;
    tx.addToSlip(slip);
=======
    newtx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));

    return this.app.wallet.signTransaction(newtx);
  }

  async receiveCreateTransaction(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();

    let obj = this.validateLeague(txmsg);
    obj.id = tx.transaction.sig;

    this.addLeague(obj);

    return;
  }

  addressToAll(tx, league_id) {
    tx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

    let league = this.returnLeague(league_id);
    if (!league?.admin) {
      return tx;
    }

    slip = new Slip();
    slip.publicKey = league.admin;
    tx.addToSlip(slip);

    for (let p of league.players) {
<<<<<<< HEAD
      slip = new Slip();
      slip.publicKey = p.publickey;
      tx.addToSlip(slip);
=======
      tx.transaction.to.push(new saito.default.slip(p.publickey, 0.0));
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    }

    return tx;
  }

  ///////////////////
  // join a league //
  ///////////////////
<<<<<<< HEAD
  async createJoinTransaction(league_id = "", email = "") {
    let newtx = await this.app.wallet.createUnsignedTransaction();
=======
  createJoinTransaction(league_id = "", email = "") {
    let newtx = this.app.wallet.createUnsignedTransaction();
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    newtx = this.addressToAll(newtx, league_id);

    newtx.msg = {
      module: "League",
      league_id: league_id,
      request: "league join",
    };

    if (email) {
      newtx.msg.email = email;
    }
<<<<<<< HEAD
    await newtx.sign();
    return newtx;
  }

  async receiveJoinTransaction(blk, tx, conf) {
=======

    return this.app.wallet.signTransaction(newtx);
  }

  async receiveJoinTransaction(blk, tx, conf, app) {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    let txmsg = tx.returnMessage();

    let params = {
      publickey: tx.from[0].publicKey,
      email: txmsg.email || "",
<<<<<<< HEAD
      ts: parseInt(tx.timestamp),
=======
      ts: parseInt(tx.transaction.ts),
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    };

    await this.addLeaguePlayer(txmsg.league_id, params);

    //
    //So, when we get our join message returned to us, we will do a query to figure out our rank
    //save the info locally, and emit an event to update as a success
    //
<<<<<<< HEAD
    if (this.publicKey === tx.from[0].publicKey) {
      await this.fetchLeagueLeaderboard(txmsg.league_id, () => {
=======
    if (this.app.wallet.returnPublicKey() === tx.transaction.from[0].add) {
      this.fetchLeagueLeaderboard(txmsg.league_id, () => {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
        this.app.connection.emit("join-league-success");
      });
    }
  }

<<<<<<< HEAD
  async createUpdateTransaction(league_id, new_data, field = "description") {
    let newtx = await this.app.wallet.createUnsignedTransaction();
=======
  createUpdateTransaction(league_id, new_data, field = "description") {
    let newtx = this.app.wallet.createUnsignedTransaction();
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    newtx = this.addressToAll(newtx, league_id);

    newtx.msg = {
      module: "League",
      request: "league update",
      league_id,
      new_data,
      field,
    };
    await newtx.sign();
    return newtx;
  }

<<<<<<< HEAD
  async receiveUpdateTransaction(blk, tx, conf) {
=======
  async receiveUpdateTransaction(blk, tx, conf, app) {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    let txmsg = tx.returnMessage();

    let league_id = txmsg.league_id;
    let new_data = txmsg.new_data;
    let field = txmsg.field;

    if (field !== "description" && field !== "contact") {
      console.error("League Update Error: Unknown SQL field");
      return;
    }

    let league = this.returnLeague(league_id);
    if (league) {
      league[field] = new_data;
    }

    let sql = `UPDATE OR IGNORE leagues
               SET ${field} = $data
               WHERE id = $id`;
    let params = {
      $id: league_id,
      $data: new_data,
    };

    await this.app.storage.executeDatabase(sql, params, "league");
  }

<<<<<<< HEAD
  async createUpdatePlayerTransaction(league_id, publickey, new_data, field = "email") {
    let newtx = await this.app.wallet.createUnsignedTransaction();

    let slip = new Slip();
    slip.publicKey = this.publicKey;
    newtx.addToSlip(slip);
    slip = new Slip();
    slip.publicKey = publickey;
    newtx.addToSlip(slip);
=======
  createUpdatePlayerTransaction(league_id, publickey, new_data, field = "email") {
    let newtx = this.app.wallet.createUnsignedTransaction();

    newtx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));
    newtx.transaction.to.push(new saito.default.slip(publickey, 0.0));
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

    newtx.msg = {
      module: "League",
      request: "league update player",
      league_id,
      publickey,
      new_data,
      field,
    };
    await newtx.sign();
    return newtx;
  }

<<<<<<< HEAD
  async receiveUpdatePlayerTransaction(blk, tx, conf) {
=======
  async receiveUpdatePlayerTransaction(blk, tx, conf, app) {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    let txmsg = tx.returnMessage();

    let league_id = txmsg.league_id;
    let publickey = txmsg.publickey;
    let new_data = txmsg.new_data;
    let field = txmsg.field;

    if (field !== "email") {
      console.error("League Update Error: Unknown SQL field");
      return;
    }

    let league = this.returnLeague(league_id);
    if (league) {
      league[field] = new_data;
    }

    let sql = `UPDATE OR IGNORE players
               SET ${field} = $data
               WHERE league_id = $league_id
                 AND publickey = $publickey`;
    let params = {
      $data: new_data,
      $league_id: league_id,
      $publickey: publickey,
    };

    await this.app.storage.executeDatabase(sql, params, "league");
  }

  ///////////////////
  // quit a league //
  ///////////////////
<<<<<<< HEAD
  async createQuitTransaction(publickey, league_id) {
    let newtx = await this.app.wallet.createUnsignedTransaction();
    newtx = this.addressToAll(newtx, league_id);

    newtx.msg = {
      module: "League",
      league_id: league_id,
      request: "league quit",
=======
  createQuitTransaction(league_id, publickey = null) {
    let newtx = this.app.wallet.createUnsignedTransaction();
    newtx = this.addressToAll(newtx, league_id);

    publickey = publickey || this.app.wallet.returnPublicKey();

    newtx.msg = {
      module: "League",
      request: "league quit",
      league_id: league_id,
      publickey,
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    };
    await newtx.sign();
    return newtx;
  }

<<<<<<< HEAD
  async receiveQuitTransaction(blk, tx, conf) {
    let txmsg = tx.returnMessage();
    let sql = `DELETE
               FROM players
               WHERE league_id = $league
                 AND publickey = $publickey`;
    let params = {
      $league: txmsg.league_id,
      $publickey: tx.from[0].publicKey,
    };
    await this.app.storage.executeDatabase(sql, params, "league");
  }

  /////////////////////
  // remove a league //
  /////////////////////
  async createRemoveTransaction(league_id) {
    let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();
=======
  async receiveQuitTransaction(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();

    let sql = `UPDATE players SET deleted = 1 WHERE league_id=$league AND publickey=$publickey`;
    let params = {
      $league: txmsg.league_id,
      $publickey: txmsg.publickey,
    };

    //if (tx.transaction.from[0].add !== txmsg.publickey){
    //  let league = this.returnLeague(txmsg.league_id);
    //  if (!league?.admin || league.admin !== tx.transaction.from[0].add){
    //    console.log("Ignore invalid removal request");
    //    return;
    //  }
    //}

    await this.app.storage.executeDatabase(sql, params, "league");

    this.removeLeaguePlayer(txmsg.league_id, txmsg.publickey);
  }

  /////////////////////
  // remove a league //
  /////////////////////
  createRemoveTransaction(league_id) {
    let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    newtx = this.addressToAll(newtx, league_id);

    newtx.msg = {
      module: "League",
      request: "league remove",
<<<<<<< HEAD
      league: league_id,
    };
    await newtx.sign();
    return newtx;
  }
=======
      league_id: league_id,
    };

    return this.app.wallet.signTransaction(newtx);
  }

  async receiveRemoveTransaction(blk, tx, conf, app) {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

  async receiveRemoveTransaction(blk, tx, conf) {
    let txmsg = tx.returnMessage();
<<<<<<< HEAD
    let sql1 = `DELETE
                FROM leagues
                WHERE id = $league_id
                  AND admin = $publickey`;
    let params1 = {
      $league_id: txmsg.league_id,
      $publickey: tx.from[0].publicKey,
    };
    await this.app.storage.executeDatabase(sql1, params1, "league");

    let sql2 = `DELETE
                FROM players
                WHERE league_id = '$league_id'`;
    let params2 = { $league_id: txmsg.league_id };
    await this.app.storage.executeDatabase(sql2, params2, "league");
=======
    
    let sql1 = `UPDATE leagues SET deleted = 1 WHERE id = $id AND admin = $admin`;
    let params1 = {
      $id: txmsg.league_id,
      $admin: tx.transaction.from[0].add,
    };
    
    let result = await this.app.storage.executeDatabase(sql1, params1, "league");

    let sql2 = `UPDATE players SET deleted = 1 WHERE league_id = $league_id`;
    let params2 = { $league_id: txmsg.league_id };
    
    result = await this.app.storage.executeDatabase(sql2, params2, "league");
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

    this.removeLeague(txmsg.league_id);
  }

  ///////////////////////////
  // roundover transaction //
  ///////////////////////////
  async receiveRoundoverTransaction(txmsg) {
    await this.receiveGameoverTransaction(txmsg, false);
  }

  //////////////////////////
  // gameover transaction //
  //////////////////////////
<<<<<<< HEAD
  async receiveGameoverTransaction(txmsg, is_gameover = true) {
=======
  async receiveGameoverTransaction(app, txmsg, is_gameover = true) {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    //if (app.BROWSER == 1) { return; }

    let game = txmsg.module;

    //
    // small grace period
    //
    if (
      is_gameover &&
      (txmsg.reason == "cancellation" ||
        txmsg.reason?.includes("Wins:") ||
        txmsg.reason?.includes("Scores: "))
    ) {
      console.log("Don't process");
      return;
    }

    //
    // fetch players
    //
    let publickeys = txmsg.players.split("_");
    if (Array.isArray(txmsg.winner) && txmsg.winner.length == 1) {
      txmsg.winner = txmsg.winner[0];
    }

    if (this.debug) {
      console.log(`League updating player scores for end of ${is_gameover ? "game" : "round"}`);
<<<<<<< HEAD
=======
      console.log(publickeys);
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    }
    //
    // fetch leagues
    //
    let relevantLeagues = await this.getRelevantLeagues(game, txmsg?.league_id);

    if (!relevantLeagues) {
      console.log("No relevant league");
      return;
    }

    //if (this.debug){console.log(relevantLeagues, publickeys);}

    //
    // update database
    //
    for (let leag of relevantLeagues) {
      //
      // update rankings (ELO)
      //
      if (leag.ranking_algorithm === "ELO") {
        await this.updateELORanking(publickeys, leag, txmsg);
      }
      if (leag.ranking_algorithm === "EXP") {
        await this.updateEXPRanking(publickeys, leag, txmsg);
      }
      if (leag.ranking_algorithm === "HSC") {
        await this.updateHighScore(publickeys, leag, txmsg);
      }

      if (this.app.BROWSER) {
        //console.log("Update league rankings on game over");
        //console.log(JSON.parse(JSON.stringify(leag.players)));
<<<<<<< HEAD
        await this.fetchLeagueLeaderboard(leag.id, () => {
          this.app.connection.emit("league-rankings-render-request");
          //console.log("Records checked");
          this.saveLeagues();
        });
=======
        this.fetchLeagueLeaderboard(leag.id);
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
      }
    }
  }

  ////////////////////////
  // accept transaction //
  ////////////////////////
  //
  // inserts player into public league if one exists
  //
  async receiveLaunchSinglePlayerTransaction(blk, tx, conf) {
    await this.receiveAcceptTransaction(blk, tx, conf);
  }

<<<<<<< HEAD
  async receiveAcceptTransaction(blk, tx, conf) {
=======
  async receiveAcceptTransaction(blk, tx, conf, app) {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    let txmsg = tx.returnMessage();

    if (this.debug) {
      console.log(`League processing game start of ${txmsg.game}!`);
    }

    //if (this.app.BROWSER){ return; }

    const relevantLeagues = await this.getRelevantLeagues(txmsg.game, txmsg?.options?.league_id);
    if (!relevantLeagues) {
      return;
    }

    if (this.debug) {
      console.log("League: AcceptGame");
      console.log(`Specific league? ${(txmsg?.options?.league_id)? txmsg.options.league_id : "no"}`);
      console.log(JSON.parse(JSON.stringify(relevantLeagues)));
    }

    //
    // who are the players ?
    //
    let publickeys = [];
    for (let i = 0; i < tx.to.length; i++) {
      if (!publickeys.includes(tx.to[i].publicKey)) {
        publickeys.push(tx.to[i].publicKey);
      }
    }

    //if (this.debug){console.log(relevantLeagues, publickeys);}

    //
    // and insert if needed
    //
    for (let leag of relevantLeagues) {
<<<<<<< HEAD
      if (leag.admin === "") {
        for (let publickey of publickeys) {
          await this.addLeaguePlayer(leag.id, { publickey });

          //Update Player's game started count
          await this.incrementPlayer(publickey, leag.id, "games_started");
=======
      console.log("Process League " + leag.id);
      for (let publickey of publickeys) {
        //Make sure players are automatically added to the Saito-leaderboards
        if (!leag.admin) {
          await this.addLeaguePlayer(leag.id, { publickey });
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
        }
        //Update Player's game started count
        await this.incrementPlayer(publickey, leag.id, "games_started");
      }
    }
  }

  /////////////////////
  /////////////////////
  async getRelevantLeagues(game, target_league = "") {
<<<<<<< HEAD
    let sql = `SELECT *
               FROM leagues
               WHERE game = $game
                 AND (admin = "" OR id = $target)`;
=======
    let sql = `SELECT * FROM leagues WHERE game = $game AND (admin = "" OR id = $target) AND deleted = 0`;
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

    let params = { $game: game, $target: target_league };

    let sqlResults = await this.app.storage.queryDatabase(sql, params, "league");

    let localLeagues = this.leagues.filter((l) => {
      if (l.game === game) {
        if (!l.admin || l.id == target_league) {
          return true;
        }
      }
      return false;
    });

    return sqlResults || localLeagues;
  }

  async getPlayersFromLeague(league_id, players) {
<<<<<<< HEAD
    let sql2 = `SELECT *
                FROM players
                WHERE league_id = ?
                  AND publickey IN (`;
    for (let pk of players) {
      sql2 += `'${pk}', `;
    }
    sql2 = sql2.substring(0, sql2.length - 2) + `)`;
=======
    let sql2 = `SELECT * FROM players WHERE league_id = ? AND publickey IN (`;
    for (let pk of players) {
      sql2 += `'${pk}', `;
    }
    sql2 = sql2.substring(0, sql2.length - 2) + `) AND deleted = 0`;
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

    let sqlResults = await this.app.storage.queryDatabase(sql2, [league_id], "league");

    let league = this.returnLeague(league_id);

    let localStats = null;

    if (league?.players) {
      localStats = league.players.filter((p) => players.includes(p.publickey));
    }

    //console.log("SQL:", sqlResults);
    //console.log("Local:", localStats);

    // should we look to ts value for which is the newest reault
    // Only matters on server nodes where we would have both
    return sqlResults || localStats;
  }

  /////////////////////
  // update rankings //
  /////////////////////
  async updateEXPRanking(publickeys, league, txmsg) {
    let players = [...publickeys]; //Need to refresh this each loop (since we splice below)

    //
    // winning += 5 points
    // ties    += 3 points
    // losing  += 1 point
    //

    // everyone gets a point for playing
    for (let i = 0; i < players.length; i++) {
      await this.incrementPlayer(players[i], league.id, "score", 1);
      await this.incrementPlayer(players[i], league.id, "games_finished", 1);
    }

    let numPoints = txmsg.reason == "tie" ? 2 : 4;
    let gamekey = txmsg.reason == "tie" ? "games_tied" : "games_won";

    for (let i = 0; i < players.length; i++) {
      if (txmsg.winner === players[i] || txmsg.winner.includes(players[i])) {
        await this.incrementPlayer(players[i], league.id, "score", numPoints);
        await this.incrementPlayer(players[i], league.id, gamekey, 1);
      }
    }
  }

  async updateELORanking(players, league, txmsg) {
    //
    // no change for 1P games
    //
    if (players.length < 2) {
      return;
    }

    let playerStats = await this.getPlayersFromLeague(league.id, players);

    if (!playerStats || playerStats.length !== players.length) {
      // skip out - not all players are league members
<<<<<<< HEAD
=======
      console.log("ELO player mismatch");
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
      return;
    }

    let winner = [],
      loser = [];
    let qsum = 0;
    for (let player of playerStats) {
      //Convert each players ELO rating into a logistic function
      player.q = Math.pow(10, player.score / 400);
      //Sum the denominator so that the Expected values add to 1
      qsum += player.q;

      //
      //Dynamically calculate each player's K-factor
      //
      player.k = 10;
      if (player?.score < 2400) {
        player.k = 20;
      }
      if (player?.games_finished < 30 && player?.score < 2300) {
        player.k = 40;
      }

      await this.incrementPlayer(player.publickey, league.id, "games_finished");

      //
      //Sort into winners and losers
      //
      if (player.publickey == txmsg.winner || txmsg.winner.includes(player.publickey)) {
        winner.push(player);
      } else {
        loser.push(player);
      }
    }

    for (let p of winner) {
      let outcome = winner.length == 1 ? "games_won" : "games_tied";
      await this.incrementPlayer(p.publickey, league.id, outcome);

      p.score += p.k * (1 / winner.length - p.q / qsum);
      await this.updatePlayerScore(p, league.id);
    }
    for (let p of loser) {
      p.score -= (p.k * p.q) / qsum;
      await this.updatePlayerScore(p, league.id);
    }
  }

  async updateHighScore(players, league, txmsg) {
    //
    // it better be a 1P games
    //
    if (players.length > 1) {
      return;
    }

    let playerStats = await this.getPlayersFromLeague(league.id, players);

    if (!playerStats || playerStats.length !== players.length) {
      // skip out - not all players are league members
      return;
    }

    for (let player of playerStats) {
      let newScore = parseInt(txmsg.reason);

      player.score = Math.max(player.score, newScore);
      await this.incrementPlayer(player.publickey, league.id, "games_finished");
      await this.updatePlayerScore(player, league.id);
    }
  }

  async incrementPlayer(publickey, league_id, field, amount = 1) {
    if (this.app.BROWSER) {
      return 1;
    }

    if (
      !(
        field === "score" ||
        field === "games_finished" ||
        field === "games_won" ||
        field === "games_tied" ||
        field === "games_started"
      )
    ) {
<<<<<<< HEAD
=======
      console.warn("Invalid field: " + field);
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
      return 0;
    }

    let success = false;

    //This is more for live data

    let league = this.returnLeague(league_id);
    if (league?.players) {
      for (let i = 0; i < league.players.length; i++) {
        if (league.players[i].publickey === publickey) {
          league.players[i][field]++;
          if (this.debug) {
<<<<<<< HEAD
            console.log(`Incremented ${field}:`);
=======
            console.log(`Incremented ${field}: in ${league.id}`);
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
            console.log(JSON.parse(JSON.stringify(league.players[i])));
          }
          success = true;
        }
      }
    }

<<<<<<< HEAD
    if (!success) {
      return 0;
    }
=======
    //if (!success) {
    //  return 0;
    //}
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

    let sql = `UPDATE OR IGNORE players
               SET ${field} = (${field} + ${amount}), ts = $ts
               WHERE publickey = $publickey
                 AND league_id = $league_id`;
    let params = {
      $ts: new Date().getTime(),
      $publickey: publickey,
      $league_id: league_id,
    };
<<<<<<< HEAD

    //if (this.debug) { console.log(sql); }
=======
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

    await this.app.storage.executeDatabase(sql, params, "league");
    return 1;
  }

  async updatePlayerScore(playerObj, league_id) {
    if (this.app.BROWSER) {
      return 1;
    }

    let league = this.returnLeague(playerObj.league_id);
    if (league?.players) {
      for (let i = 0; i < league.players.length; i++) {
        if (league.players[i].publickey === playerObj.publickey) {
          league.players[i]["score"] = playerObj.score;
          if (this.debug) {
            console.log("New Score: " + playerObj.score);
            console.log(JSON.parse(JSON.stringify(league.players[i])));
          }
        }
      }
    }

    let sql = `UPDATE players
               SET score = $score,
                   ts    = $ts
               WHERE publickey = $publickey
                 AND league_id = $league_id`;
    let params = {
      $score: playerObj.score,
      $ts: new Date().getTime(),
      $publickey: playerObj.publickey,
      $league_id: league_id,
    };

    await this.app.storage.executeDatabase(sql, params, "league");
    return 1;
  }

  ////////////////////////////////////////////////
  // convenience functions for local data inserts //
  ////////////////////////////////////////////////

  /////////////////////////////
  // League Array Management //
  /////////////////////////////
  returnLeague(league_id) {
    for (let i = 0; i < this.leagues.length; i++) {
      if (this.leagues[i].id === league_id) {
        return this.leagues[i];
      }
    }
    return null;
  }

  removeLeague(league_id) {
    for (let i = 0; i < this.leagues.length; i++) {
      if (this.leagues[i].id === league_id) {
        this.leagues.splice(i, 1);
<<<<<<< HEAD
=======
        if (this.app.BROWSER){
          localforage.removeItem(`league_${league_id}`);  
        }
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
        this.saveLeagues();
        return;
      }
    }
  }

  validateLeague(obj) {
    let newObj = {};
    //
    // default values
    //
    newObj.id = obj?.id || "";
    newObj.game = obj?.game || "Unknown";
    newObj.name = obj?.name || "Unknown";
    newObj.admin = obj?.admin || "";
    newObj.contact = obj?.contact || "";
    newObj.status = obj?.status || "public";
    newObj.description = obj?.description || "";
    newObj.ranking_algorithm = obj?.ranking_algorithm || "EXP";
    newObj.default_score = obj?.default_score || 0;
    newObj.welcome = newObj.admin
      ? `Welcome to ${newObj.name}! Please make sure the admin has your email address or social media handle as well as your Saito address so they can contact you with arranged matches. 
            If you do not provide this information, you will be removed from the league. You should also make sure your Saito wallet is backed up so you can login to play games from any device.`
      : "";

    return newObj;
  }

  async addLeague(obj) {
    if (!obj) {
      return;
    }
    if (!obj.id) {
      return;
    }

    if (!this.returnLeague(obj.id)) {
      let newLeague = this.validateLeague(obj);

      //if (this.debug) {
<<<<<<< HEAD
      //console.log(`Add ${newLeague.game} League, ${newLeague.id}`);
=======
      //  console.log(`Add ${newLeague.game} League, ${newLeague.id}`);
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
      //}

      //
      // dynamic data-storage
      //
      newLeague.players = obj?.players || [];
      newLeague.rank = -1; //My rank in the league
      newLeague.numPlayers = obj?.numPlayers || 0;

      if (obj?.rank >= 0){
        newLeague.rank = obj.rank;
      }

      //console.log("Add New League:");
      //console.log(JSON.parse(JSON.stringify(newLeague)));

      this.leagues.push(newLeague);

      await this.leagueInsert(newLeague);
    }
  }

  async updateLeague(obj) {
    if (!obj) {
      return;
    }
    if (!obj.id) {
      return;
    }
    let oldLeague = this.returnLeague(obj.id);

    if (!oldLeague) {
<<<<<<< HEAD
      await this.addLeague(obj);
      return;
    }

    oldLeague = Object.assign(oldLeague, this.validateLeague(obj));
=======
      await this.addLeague(obj);      
      return;
    }

    oldLeague = Object.assign(oldLeague, obj);
    //console.log("Updated League from Storage");
    //console.log(JSON.parse(JSON.stringify(oldLeague)));
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
  }

  validatePlayer(obj) {
    let newObj = {};

    newObj.publickey = obj.publickey || "";
    newObj.score = obj.score || 0;
    newObj.games_started = obj.games_started || 0;
    newObj.games_finished = obj.games_finished || 0;
    newObj.games_won = obj.games_won || 0;
    newObj.games_tied = obj.games_tied || 0;
    newObj.email = obj.email || "";
    newObj.ts = obj.ts || 0;

    return newObj;
  }

  async addLeaguePlayer(league_id, obj) {
    let league = this.returnLeague(league_id);

    if (!league?.players) {
      console.error("League not found");
      return;
    }

    let newPlayer = this.validatePlayer(obj);

    if (!newPlayer.score) {
      newPlayer.score = league.default_score;
    }
<<<<<<< HEAD
=======
    //Make sure it is a number!
    newPlayer.score = parseInt(newPlayer.score);
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

    //If we have the player already, just update the stats
    for (let z = 0; z < league.players.length; z++) {
      if (league.players[z].publickey === newPlayer.publickey) {
        league.players[z].score = newPlayer.score || league.players[z].score;
        league.players[z].games_started =
          newPlayer.games_started || league.players[z].games_started;
        league.players[z].games_won = newPlayer.games_won || league.players[z].games_won;
        league.players[z].games_tied = newPlayer.games_tied || league.players[z].games_tied;
        league.players[z].games_finished =
          newPlayer.games_finished || league.players[z].games_finished;
        return;
      }
    }

    league.players.push(newPlayer);

<<<<<<< HEAD
    if (newPlayer.publickey === this.publicKey) {
=======
    if (newPlayer.publickey === this.app.wallet.returnPublicKey()) {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
      if (league.rank <= 0) {
        league.rank = 0;
        league.numPlayers = league.players.length;
      }

<<<<<<< HEAD
      if (league.admin && league.admin !== this.publicKey) {
=======
      if (league.admin && league.admin !== this.app.wallet.returnPublicKey()) {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
        league.unverified = newPlayer.email == "";
      }
    }

    //
    if (this.app.BROWSER == 0) {
      await this.playerInsert(league_id, newPlayer);
    }
  }

<<<<<<< HEAD
  async fetchLeagueLeaderboard(league_id, mycallback = null) {
=======
  async removeLeaguePlayer(league_id, publickey){
    if (publickey == this.app.wallet.returnPublicKey()){
      this.removeLeague(league_id);
      return;
    }

    let league = this.returnLeague(league_id);

    for (let i = 0; i < league.players.length; i++){
      if (league.players[i].publickey === publickey){
        league.players.splice(i, 1);

        //Force a new ranking calculation on next leaderboard load
        league.ts = 0;
        break;
      }
    }

    this.saveLeagues();
  }

  fetchLeagueLeaderboard(league_id, mycallback = null) {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    let league = this.returnLeague(league_id);
    let rank = 0;
    let myPlayerStats = null;

    if (!league) {
      console.error("League not found");
      return;
    }

    //We need to reset this because this should be an ordered array
    //and if the scores have changed, we need to resort the players
    league.players = [];

<<<<<<< HEAD
    let cutoff = new Date().getTime() - 24 * 60 * 60 * 1000;
    await this.sendPeerDatabaseRequestWithFilter(
      "League",
      `SELECT *
       FROM players
       WHERE league_id = '${league_id}'
         AND (ts > ${cutoff} OR games_finished > 0 OR publickey = '${this.publicKey}')
       ORDER BY score DESC, games_won DESC, games_tied DESC, games_finished DESC`,
      async (res) => {
=======
    let cond = (league.admin) ? `` : ` AND (ts > ${cutoff} OR games_finished > 0 OR publickey = '${this.app.wallet.returnPublicKey()}')`;

    let cutoff = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
    this.sendPeerDatabaseRequestWithFilter(
      "League",
      `SELECT * FROM players WHERE league_id = '${league_id}' AND deleted = 0${cond} ORDER BY score DESC, games_won DESC, games_tied DESC, games_finished DESC`,
      (res) => {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
        if (res?.rows) {
          for (let p of res.rows) {
            //
            // Count how many people are ranked above me in the leaderboard
            //
            rank++;

<<<<<<< HEAD
            if (p.publickey == this.publicKey) {
=======
            if (p.publickey == this.app.wallet.returnPublicKey()) {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
              if (p.games_finished > 0) {
                league.rank = rank;
              } else {
                league.rank = 0;
                myPlayerStats = p;
                continue;
              }
            }

            //
            // Update player-league data in our live data structure
            //
<<<<<<< HEAD
            await this.addLeaguePlayer(league_id, p);
=======
            this.addLeaguePlayer(league_id, p);
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
          }

          league.numPlayers = rank;
          //Add me to bottom of list if I haven't played any games
          if (myPlayerStats) {
<<<<<<< HEAD
            await this.addLeaguePlayer(league_id, myPlayerStats);
=======
            this.addLeaguePlayer(league_id, myPlayerStats);
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
          }
        }

        league.ts = new Date().getTime();

        if (mycallback != null) {
          mycallback(res);
<<<<<<< HEAD
        } else {
          if (this.app.BROWSER) {
            this.saveLeagues();
            this.app.connection.emit("leagues-render-request");
            this.app.connection.emit("league-rankings-render-request");
          }
=======
        } 
        
        if (this.app.BROWSER) {
          this.saveLeagues();
          this.app.connection.emit("leagues-render-request");
          this.app.connection.emit("league-rankings-render-request");
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
        }
        
      },
      (p) => {
        if (p.hasService("league")) {
          return 1;
        }
        return 0;
      }
    );
  }

  ////////////////////////////////////////////////
  // convenience functions for database inserts //
  ////////////////////////////////////////////////
  async leagueInsert(obj) {
<<<<<<< HEAD
    let sql = `INSERT
    OR REPLACE INTO leagues (id, game, name, admin, contact, status, description, ranking_algorithm, default_score) 
                    VALUES (
    $id,
    $game,
    $name,
    $admin,
    $contact,
    $status,
    $description,
    $ranking_algorithm,
    $default_score
    )`;
=======
    let sql = `INSERT OR REPLACE INTO leagues (id, game, name, admin, contact, status, description, ranking_algorithm, default_score) 
                    VALUES ( $id, $game, $name, $admin, $contact, $status, $description, $ranking_algorithm, $default_score )`;
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    let params = {
      $id: obj.id,
      $game: obj.game,
      $name: obj.name,
      $admin: obj.admin,
      $contact: obj.contact,
      $status: obj.status,
      $description: obj.description,
      $ranking_algorithm: obj.ranking_algorithm,
      $default_score: obj.default_score,
    };

    await this.app.storage.executeDatabase(sql, params, "league");
  }

  async playerInsert(league_id, obj) {
<<<<<<< HEAD
    let sql = `INSERT
    OR IGNORE INTO players (league_id, publickey, score, ts) 
                                VALUES (
    $league_id,
    $publickey,
    $score,
    $ts
    )`;
=======
    let sql = `INSERT OR IGNORE INTO players (league_id, publickey, score, ts) 
                                VALUES ( $league_id, $publickey, $score, $ts)`;
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    let params = {
      $league_id: league_id,
      $publickey: obj.publickey,
      $score: obj.score,
      $ts: new Date().getTime(),
    };

    //console.log("Insert player:", params);

    await this.app.storage.executeDatabase(sql, params, "league");
<<<<<<< HEAD
  }

  async pruneOldPlayers() {
    let sql = `DELETE
               FROM players
               WHERE ts < ?`;
=======
    return;
  }

  async pruneOldPlayers() {
    /*
    Need to do an inner join to select for default leaderboards only
    */

    let sql = `UPDATE players SET deleted = 1 WHERE players.ts < ?`;
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    let cutoff = new Date().getTime() - this.inactive_player_cutoff;
    await this.app.storage.executeDatabase(sql, [cutoff], "league");
  }
}

module.exports = League;
