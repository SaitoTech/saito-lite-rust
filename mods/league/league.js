const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const LeagueRankings = require("./lib/rankings");
const LeagueLeaderboard = require("./lib/leaderboard");
const LeagueMain = require("./lib/main");
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");
const SaitoOverlay = require("../../lib/saito/ui/saito-overlay/saito-overlay");
const InvitationLink = require("./lib/overlays/league-invitation-link");
const JoinLeagueOverlay = require("./lib/overlays/join");

//Trial -- So that we can display league results in game page
//const LeagueOverlay = require("./lib/overlays/league");

class League extends ModTemplate {
  constructor(app) {
    super(app);

    this.name = "League";
    this.slug = "league";
    this.description = "Leaderboards and leagues for Saito Games";
    this.categories = "Arcade Gaming";
    this.overlay = null;

    this.styles = ["/league/style.css"];

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
    return [{ service: "league", domain: "saito" }];
  }

  async initialize(app) {
    this.loadLeagues();

    await super.initialize(app);

    //Trial -- So that we can display league results in game page
    //this.overlay = new LeagueOverlay(app, this);

    //
    // create initial leagues
    //
    let res = await this.app.modules.getRespondTos("default-league");
    for (const modResponse of res) {
      await this.addLeague({
        id: app.crypto.hash(modResponse.modname), // id
        game: modResponse.game, // game - name of game mod
        name: modResponse.name, // name - name of league
        admin: "", // admin - publickey (if exists)
        status: "public", // status - public or private
        description: modResponse.description, //
        ranking_algorithm: modResponse.ranking_algorithm, //
        default_score: modResponse.default_score, // default ranking for newbies
      });
    }

    this.sortLeagues();
  }

  //
  // So leagues are displayed in same order as game list for consistency's sake
  //
  sortLeagues() {
    let superArray = [];
    try {
      this.leagues.forEach((l) => {
        let gm = this.app.modules.returnModuleByName(l.game);
        if (!gm) {
          console.warn("module not found for game : " + l.game, l);
        }
        superArray.push([l.admin, gm.categories, l]);
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
  async render() {
    let app = this.app;
    let mod = this.mod;

    this.main = new LeagueMain(app, this);
    this.header = new SaitoHeader(app, this);
    await this.header.initialize(app);
    this.addComponent(this.main);
    this.addComponent(this.header);

    await super.render(app, this);
  }

  canRenderInto(qs) {
    if (qs == ".redsquare-sidebar") {
      return true;
    }
    if (qs == ".arcade-leagues") {
      return true;
    }
    return false;
  }

  async renderInto(qs) {
    if (qs == ".redsquare-sidebar" || qs == ".arcade-leagues") {
      if (!this.renderIntos[qs]) {
        this.renderIntos[qs] = [];
        this.renderIntos[qs].push(new LeagueRankings(this.app, this, qs));
      }
      this.styles = [
        "/league/css/league-leaderboard.css",
        "/league/css/league-overlay.css",
        "/arcade/css/arcade-wizard.css",
      ];
      this.attachStyleSheets();
      for (const comp of this.renderIntos[qs]) {
        await comp.render();
      }
    }
  }

  async onPeerServiceUp(app, peer, service) {
    //
    // add remote leagues
    //
    if (service.service === "league") {
      if (this.debug) {
        console.log("======================================");
        console.log("=======  peer server up  =============");
        console.log("======================================");
      }

      //
      // fetch updated rankings
      //
      let helper_array = [];
      for (let i = 0; i < this.leagues.length; i++) {
        //To avoid calling rending 15 times in a row, we use an array to see when
        //the last async database query finishes and only update the UI then
        helper_array.push(0);

        await this.fetchLeagueLeaderboard(this.leagues[i].id, () => {
          helper_array.pop();
          if (helper_array.length == 0) {
            app.connection.emit("league-rankings-render-request");
          }
        });
      }

      //
      // load any requested league we may not have in options file
      //
      if (this.app.browser.returnURLParameter("league_join_league")) {
        await this.sendPeerDatabaseRequestWithFilter(
          "League",
          `SELECT *
           FROM leagues
           WHERE id = "${this.app.browser.returnURLParameter("league_join_league")}"`,
          async (res) => {
            let rows = res.rows || [];
            if (rows.length > 0) {
              for (const league of rows) {
                const key = rows.indexOf(league);
                await this.addLeague(league);
              }
              //Main module
              app.connection.emit("leagues-render-request");
              //Sidebar component
              app.connection.emit("league-rankings-render-request");
            }

            //
            // league join league
            //
            let league_id = this.app.browser.returnURLParameter("league_join_league");
            let jlo = new JoinLeagueOverlay(app, this, league_id);
            await jlo.render();
          },
          (p) => {
            if (p == peer) {
              return 1;
            }
            return 0;
          }
        );
      }
    }
  }

  async onConfirmation(blk, tx, conf, app) {
    if (conf != 0) {
      return;
    }

    try {
      let txmsg = tx.returnMessage();

      if (this.debug) {
        console.log("LEAGUE onConfirmation: " + txmsg.request);
      }

      if (txmsg.request === "league create") {
        await this.receiveCreateTransaction(blk, tx, conf, app);
      }

      if (txmsg.request === "league join") {
        await this.receiveJoinTransaction(blk, tx, conf, app);
      }
      if (txmsg.request === "league quit") {
        await this.receiveQuitTransaction(blk, tx, conf, app);
      }

      if (txmsg.request === "league remove") {
        await this.receiveRemoveTransaction(blk, tx, conf, app);
      }

      if (txmsg.request === "gameover") {
        await this.receiveGameoverTransaction(app, txmsg);
      }

      if (txmsg.request === "roundover") {
        await this.receiveRoundoverTransaction(app, txmsg);
      }

      if (txmsg.request === "accept") {
        await this.receiveAcceptTransaction(blk, tx, conf, app);
      }

      if (txmsg.request === "launch singleplayer") {
        await this.receiveLaunchSinglePlayerTransaction(blk, tx, conf, app);
      }
    } catch (err) {
      console.log("ERROR in league onConfirmation: " + err);
    }

    return;
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

  loadLeagues() {
    if (this.app.options.leagues) {
      if (this.debug) {
        console.log(
          "Locally stored leagues:",
          JSON.parse(JSON.stringify(this.app.options.leagues))
        );
      }

      this.leagues = this.app.options.leagues;
      return;
    }
    this.leagues = [];
  }

  saveLeagues() {
    this.app.options.leagues = this.leagues;
    this.app.storage.saveOptions();
  }

  /////////////////////
  // create a league //
  /////////////////////
  createCreateTransaction(obj = null) {
    if (obj == null) {
      return null;
    }

    let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    newtx.msg = this.validateLeague(obj);
    newtx.msg.module = "League";
    newtx.msg.request = "league create";

    return this.app.wallet.signTransaction(newtx);
  }

  async receiveCreateTransaction(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();

    let obj = this.validateLeague(txmsg);
    obj.id = tx.signature;

    await this.addLeague(obj);
  }

  ///////////////////
  // join a league //
  ///////////////////
  async createJoinTransaction(league_id = "", data = null) {
    let newtx = await this.app.wallet.createUnsignedTransaction();

    newtx.msg = {
      module: "League",
      league_id: league_id,
      request: "league join",
    };

    if (data != null && typeof data == "object") {
      if (data.email) {
        newtx.msg.email = data.email;
      }
    }

    return this.app.wallet.signTransaction(newtx);
  }

  async receiveJoinTransaction(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();

    let params = {
      league_id: txmsg.league_id,
      publickey: tx.from[0].publicKey,
      email: txmsg.email || "",
      ts: parseInt(tx.timestamp),
    };

    await this.addLeaguePlayer(params);

    return;
  }

  ///////////////////
  // quit a league //
  ///////////////////
  async createQuitTransaction(publickey, league_id) {
    let newtx = await this.app.wallet.createUnsignedTransaction();

    newtx.msg = {
      module: "League",
      league_id: league_id,
      request: "league quit",
    };
    return await this.app.wallet.signTransaction(newtx);
  }

  async receiveQuitTransaction(blk, tx, conf, app) {
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
    newtx.msg = {
      module: "League",
      request: "league remove",
      league: league_id,
    };

    return await this.app.wallet.signTransaction(newtx);
  }

  async receiveRemoveTransaction(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();
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
  }

  ///////////////////////////
  // roundover transaction //
  ///////////////////////////
  async receiveRoundoverTransaction(app, txmsg) {
    await this.receiveGameoverTransaction(app, txmsg, false);
  }

  //////////////////////////
  // gameover transaction //
  //////////////////////////
  async receiveGameoverTransaction(app, txmsg, is_gameover = true) {
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
      console.log(txmsg.reason);
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
    }
    //
    // fetch leagues
    //
    let relevantLeagues = await this.getRelevantLeagues(game);

    //  if (this.debug){console.log(relevantLeagues, publickeys);}

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

      //Main module
      this.app.connection.emit("leagues-render-request");
      //Sidebar component
      this.app.connection.emit("league-rankings-render-request");
    }
  }

  ////////////////////////
  // accept transaction //
  ////////////////////////
  //
  // inserts player into public league if one exists
  //
  async receiveLaunchSinglePlayerTransaction(blk, tx, conf, app) {
    return this.receiveAcceptTransaction(blk, tx, conf, app);
  }

  async receiveAcceptTransaction(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();

    if (this.debug) {
      console.log(`League processing game start of ${txmsg.game}!`);
    }

    //if (this.app.BROWSER){ return; }

    const relevantLeagues = await this.getRelevantLeagues(txmsg.game);

    //
    // who are the players ?
    //
    let publickeys = [];
    for (let i = 0; i < tx.to.length; i++) {
      if (!publickeys.includes(tx.to[i].publicKey)) {
        publickeys.push(tx.to[i].publicKey);
      }
    }

    //    if (this.debug){console.log(relevantLeagues, publickeys);}

    //
    // and insert if needed
    //
    for (let leag of relevantLeagues) {
      if (leag.admin === "") {
        let league_id = leag.id;

        for (let publickey of publickeys) {
          await this.addLeaguePlayer({ league_id, publickey });

          //Update Player's game started count
          await this.incrementPlayer(publickey, leag.id, "games_started");
        }
      }
    }
  }

  /////////////////////
  /////////////////////

  async getRelevantLeagues(game) {
    let sql = `SELECT *
               FROM leagues
               WHERE game = $game`;
    let params = { $game: game };
    let sqlResults = await this.app.storage.queryDatabase(sql, params, "league");

    let localLeagues = this.leagues.filter((l) => l.game === game);

    return sqlResults || localLeagues;
  }

  /////////////////////
  /////////////////////

  async getPlayersFromLeague(league_id, players) {
    let sql2 = `SELECT *
                FROM players
                WHERE league_id = ?
                  AND publickey IN (`;
    for (let pk of players) {
      sql2 += `'${pk}', `;
    }
    sql2 = sql2.substr(0, sql2.length - 2) + `)`;

    let sqlResults = await this.app.storage.queryDatabase(sql2, [league_id], "league");

    let league = this.returnLeague(league_id);
    let localStats = league.players.filter((p) => players.includes(p.publickey));

    return localStats || sqlResults;
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

    if (playerStats.length !== players.length) {
      // skip out - not all players are league members
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
      await this.updatePlayerScore(p);
    }
    for (let p of loser) {
      p.score -= (p.k * p.q) / qsum;
      await this.updatePlayerScore(p);
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

    if (playerStats.length !== players.length) {
      // skip out - not all players are league members
      return;
    }

    for (let player of playerStats) {
      let newScore = parseInt(txmsg.reason);

      player.score = Math.max(player.score, newScore);
      await this.incrementPlayer(player.publickey, league.id, "games_finished");
      await this.updatePlayerScore(player);
    }
  }

  async incrementPlayer(publickey, league_id, field, amount = 1) {
    if (
      !(
        field === "score" ||
        field === "games_finished" ||
        field === "games_won" ||
        field === "games_tied" ||
        field === "games_started"
      )
    ) {
      return 0;
    }

    let success = false;

    let league = this.returnLeague(league_id);
    if (league?.players) {
      for (let i = 0; i < league.players.length; i++) {
        if (league.players[i].publickey === publickey) {
          league.players[i][field]++;
          if (this.debug) {
            console.log(`Incremented ${field}:`);
            console.log(JSON.parse(JSON.stringify(league.players[i])));
          }
          success = true;
        }
      }
    }

    if (!success) {
      return;
    }

    let sql = `UPDATE players
               SET ${field} = (${field} + ${amount}),
                   ts       = $ts
               WHERE publickey = $publickey
                 AND league_id = $league_id`;
    let params = {
      $ts: new Date().getTime(),
      $publickey: publickey,
      $league_id: league_id,
    };

    //if (this.debug) { console.log(sql); }

    await this.app.storage.executeDatabase(sql, params, "league");
    return 1;
  }

  async updatePlayerScore(playerObj) {
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
      $league_id: playerObj.league_id,
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
        return;
      }
    }
    return null;
  }

  validateLeague(obj) {
    let newObj = {};
    //
    // default values
    //
    newObj.id = obj.id || "";
    newObj.game = obj.game || "Unknown";
    newObj.name = obj.name || "Unknown";
    newObj.admin = obj.admin || "";
    newObj.status = obj.status || "public";
    newObj.description = obj.description || "";
    newObj.ranking_algorithm = obj.ranking_algorithm || "EXP";
    newObj.default_score = obj.default_score || 0;

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
      //if (this.debug) { console.log("Add League with ID: " + obj.id); }

      let newLeague = this.validateLeague(obj);

      //
      // dynamic data-storage
      //
      newLeague.players = [];
      newLeague.rank = 0; //My rank in the league

      //if (this.debug) { console.log("New League", JSON.parse(JSON.stringify(newLeague))); }

      this.leagues.push(newLeague);

      //if (!this.app.BROWSER){
      await this.leagueInsert(newLeague);
      //}
    }
  }

  validatePlayer(obj) {
    let newObj = {};

    newObj.league_id = obj.league_id || "";
    newObj.publickey = obj.publickey || "";
    newObj.email = obj.email || "";
    newObj.score = obj.score || 0;
    newObj.games_started = obj.games_started || 0;
    newObj.games_finished = obj.games_finished || 0;
    newObj.games_won = obj.games_won || 0;
    newObj.games_tied = obj.games_tied || 0;

    return newObj;
  }

  async addLeaguePlayer(obj) {
    let league = this.returnLeague(obj.league_id);

    if (!league) {
      console.error("League not found");
      return;
    }

    let newPlayer = this.validatePlayer(obj);
    if (!newPlayer.score) {
      newPlayer.score = league.default_score;
    }

    //If we have the player already, just update the stats
    for (let z = 0; z < league.players.length; z++) {
      if (league.players[z].publickey === newPlayer.publickey) {
        console.log("BEFORE:");
        console.log(JSON.parse(JSON.stringify(league.players[z])));
        league.players[z].score = newPlayer.score || league.players[z].score;
        league.players[z].games_started =
          newPlayer.games_started || league.players[z].games_started;
        league.players[z].games_won = newPlayer.games_won || league.players[z].games_won;
        league.players[z].games_tied = newPlayer.games_tied || league.players[z].games_tied;
        league.players[z].games_finished =
          newPlayer.games_finished || league.players[z].games_finished;
        console.log("AFTER:");
        console.log(JSON.parse(JSON.stringify(league.players[z])));
        return;
      }
    }

    league.players.push(newPlayer);

    await this.playerInsert(newPlayer);
  }

  async fetchLeagueLeaderboard(league_id, mycallback = null) {
    let league = this.returnLeague(league_id);
    let rank = 0;

    //We need to reset this because this should be an ordered array
    //and if the scores have changed, we need to resort the players
    league.players = [];

    await this.sendPeerDatabaseRequestWithFilter(
      "League",
      `SELECT *
       FROM players
       WHERE league_id = '${league_id}'
       ORDER BY score DESC, games_won DESC, games_tied DESC, games_finished DESC`,
      (res) => {
        if (res?.rows) {
          for (let p of res.rows) {
            //
            // Count how many people are ranked above me in the leaderboard
            //
            rank++;

            if (p.publickey == this.app.wallet.returnPublicKey()) {
              league.rank = rank;
            }

            //
            // Update player-league data in our live data structure
            //
            this.addLeaguePlayer(p);
          }
        }

        if (mycallback != null) {
          mycallback(res);
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
    let sql = `INSERT
    OR REPLACE INTO leagues (id, game, name, admin, status, description, ranking_algorithm, default_score) 
                    VALUES (
    $id,
    $game,
    $name,
    $admin,
    $status,
    $description,
    $ranking_algorithm,
    $default_score
    )`;
    let params = {
      $id: obj.id,
      $game: obj.game,
      $name: obj.name,
      $admin: obj.admin,
      $status: obj.status,
      $description: obj.description,
      $ranking_algorithm: obj.ranking_algorithm,
      $default_score: obj.default_score,
    };

    await this.app.storage.executeDatabase(sql, params, "league");

    return;
  }

  async playerInsert(obj) {
    let sql = `INSERT
    OR IGNORE INTO players (league_id, publickey, score, ts) 
                                VALUES (
    $league_id,
    $publickey,
    $score,
    $ts
    )`;
    let params = {
      $league_id: obj.league_id,
      $publickey: obj.publickey,
      $score: obj.score,
      $ts: obj.timestamp,
    };
    await this.app.storage.executeDatabase(sql, params, "league");
    return;
  }

  async pruneOldPlayers() {
    let sql = `DELETE
               FROM players
               WHERE ts < ?`;
    let cutoff = new Date().getTime() - this.inactive_player_cutoff;
    await this.app.storage.executeDatabase(sql, [cutoff], "league");
  }
}

module.exports = League;
