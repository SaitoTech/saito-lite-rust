const saito = require("./../../lib/saito/saito");
const ModTemplate = require('../../lib/templates/modtemplate');
const LeagueRankings = require("./lib/rankings");
const LeagueLeaderboard = require("./lib/leaderboard");
const LeagueMain = require('./lib/main');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');
const SaitoOverlay = require('../../lib/saito/ui/saito-overlay/saito-overlay');
const InvitationLink = require("./lib/overlays/league-invitation-link");
const JoinLeagueOverlay = require('./lib/overlays/join-league');

class League extends ModTemplate {

  constructor(app) {
    super(app);

    this.name = "League";
    this.slug = "league";
    this.description = "Leaderboards and leagues for Saito Games";
    this.categories = "Arcade Gaming";
    this.overlay = null;

    this.styles = ['/league/style.css'];

    this.leagues = [];
    this.league_idx = -1; // if a league is active, this will be idx
    this.leagueCount = 0;

    //
    // used in onPeerHandshakeComplete
    //
    this.services = [{ service : "league" , domain : "saito" }];

    //
    // UI components
    //
    this.main = null;
    this.header = null;

    this.icon_fa = "fas fa-user-friends";

  }


  initialize(app) {

    this.loadLeagues();

    super.initialize(app);

    //
    // create initial leagues
    //
    // id TEXT PRIMARY KEY,
    // game TEXT,
    // name TEXT,
    // admin TEXT,
    // status TEXT,
    // description TEXT,
    // ranking_algorithm TEXT,
    // default_score INTEGER,
    //
    this.app.modules.returnModulesRespondingTo("arcade-games").forEach((mod) => {
       this.addLeague({
        	id     			: 	app.crypto.hash(mod.returnName()) ,	// id
    	   	game   			: 	mod.returnName() , 			// game - name of game mod
    	   	name   			: 	mod.returnName() , 			// name - name of league
    	   	admin  			: 	"" ,					// admin - publickey (if exists)
		status 			: 	"public" ,				// status - public or private
		description 		: 	mod.description ,			// 
		ranking_algorithm 	: 	"ELO" ,					//
		default_score 		:	1500 					// default ranking for newbies
       });
    });

  }


  render(app, mod) {

    this.main = new LeagueMain(app, this)
    this.header = new SaitoHeader(app, this);
    this.addComponent(this.main);
    this.addComponent(this.header);

    //
    // league join league
    //
    if (this.app.browser.returnURLParameter("league_join_league")) {
      let so = new SaitoOverlay(app, this);
      let backdrop_image = `/saito/img/dreamscape.png`;
      let game = this.app.browser.returnURLParameter("game");
      let game_mod = this.app.modules.returnModuleByName(game);
      if (game_mod != null) { backdrop_image = game_mod.returnArcadeImg(); }
      so.setBackground(backdrop_image);
      so.render(' ');
    }

    super.render(app, this);
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

  renderInto(qs) {
    if (qs == ".redsquare-sidebar") {
      if (!this.renderIntos[qs]) {
        this.renderIntos[qs] = [];
        this.renderIntos[qs].push(new LeagueRankings(this.app, this, qs));
      }
      this.styles = ['/league/css/league-leaderboard.css', '/league/css/league-overlay.css', '/arcade/css/arcade-wizard.css'];
      this.attachStyleSheets();
      this.renderIntos[qs].forEach((comp) => { comp.render(); });
    }
    if (qs == ".arcade-leagues") {
      if (!this.renderIntos[qs]) {
        this.renderIntos[qs] = [];
        this.renderIntos[qs].push(new LeagueRankings(this.app, this, qs));
      }
      this.styles = ['/league/css/league-leaderboard.css', '/league/css/league-overlay.css', '/arcade/css/arcade-wizard.css'];
      this.attachStyleSheets();
      this.renderIntos[qs].forEach((comp) => { comp.render(); });
    }
  }






  addLeague(obj) {

    //
    // default values
    //
    if (!obj)                   { return; }
    if (!obj.game)              { obj.game = "Unknown"; }
    if (!obj.name)              { obj.name = "Unknown"; }
    if (!obj.admin)             { obj.admin = ""; }
    if (!obj.status)	 	{ obj.status = ""; }
    if (!obj.description)	{ obj.description = ""; }
    if (!obj.ranking_algorithm)	{ obj.ranking_algorithm = "ELO"; }
    if (!obj.default_score)	{ obj.default_score = 1500; }

    //
    // dynamic data-storage
    //
    if (!obj.mod)               { obj.mod = this.app.modules.returnModuleByName(obj.name); }
    if (!obj.players)           { obj.players = []; }
    if (!obj.games)             { obj.games = []; }

    if (!this.returnLeague(obj.id)) {
      this.leagues.push(obj);
      this.app.connection.emit("league-add-league", (this.leagues[(this.leagues.length-1)]));
    }

  }

  returnLeague(league_id) {
    for (let i = 0; i < this.leagues.length; i++) {
      if (this.leagues[i].id === league_id) { return this.leagues[i]; }
    }
    return null;
  }

  async onServiceUp(peer, service) {

    //
    // add remote leagues
    //

    if (service === "league") {

      //    
      // fetch remote leagues
      //    
      this.sendPeerDatabaseRequestWithFilter(
        "League" , 
        `SELECT * FROM league` ,
        (res) => {
          let rows = res.rows || [];
          if (rows.length > 0) {
            rows.forEach(function(league, key) {
              league_self.addLeague(league);
            }); 

	    //
	    // league join league
	    //
            if (this.app.browser.returnURLParameter("league_join_league")) {
              let league_id = this.app.browser.returnURLParameter("league_join_league");
              let jlo = new JoinLeagueOverlay(app, this, league_id);
              jlo.render();
            }
          }
        },
        (p) => {
	  if (p == peer) { return 1; }
	  return 0;
	}
      );

    }

  }


  async onConfirmation(blk, tx, conf, app) {

    try {

      let txmsg = tx.returnMessage();

      if (txmsg.request === "league create") {
        this.receiveCreateTransaction(blk, tx, conf, app);
      }

      if (txmsg.request === "league join") {
        this.receiveJoinTransaction(blk, tx, conf, app);
      }
      if (txmsg.request === "league quit") {
        this.receiveQuitTransaction(blk, tx, conf, app);
      }

      if (txmsg.request === "league remove") {
        this.receiveRemoveTransaction(blk, tx, conf, app);
      }

      if (txmsg.request === "gameover"){
        this.receiveGameoverTransaction(app, txmsg, true);
      }

      if (txmsg.request === "roundover"){
        this.receiveRoundoverTransaction(app, txmsg, false);
      }
/****

      if (txmsg.request === "accept") {
        this.receiveAcceptTransaction(blk, tx, conf, app);
      }

      if (txmsg.request === "launch singleplayer") {
        this.receiveAcceptTransaction(blk, tx, conf, app);
      }
***/
    } catch (err) {
      console.log("ERROR in league onConfirmation: " + err);
    }
  }


  shouldAffixCallbackToModule(modname, tx = null) {
    if (modname == "League") { return 1; }
    if (modname == "Arcade") { return 1; }
    for (let i = 0; i < this.leagues.length; i++) {
      if (this.leagues[i].module == modname) {
        return 1;
      }
    }
    return 0;
  }


  loadLeagues() {
    if (this.app.options.leagues) {
      this.leagues = this.app.options.leagues;
      return;
    }
    this.leagues = [];
  }

  saveLeagues() {
    this.app.options.leagues = this.leagues;
    this.app.options.saveOptions();
  }



  /////////////////////
  // create a league //
  /////////////////////
  createCreateTransaction(obj = null) {

    if (obj == null) { return; }

    //
    // id TEXT PRIMARY KEY,
    // game TEXT,
    // name TEXT,
    // admin TEXT,
    // status TEXT,
    // description TEXT,
    // ranking_algorithm TEXT,
    // default_score INTEGER,
    //
    let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    newtx.msg = {
      module			:		"League" ,
      request			:		"league create" ,
      game			:		obj.game || "" ,
      name			:		obj.name || "" ,
      admin			:		obj.admin || "" ,
      status			:		obj.status || "" ,
      description		:		obj.description || "" ,
      ranking_algorithm		:		obj.ranking_algorithm || "" ,
      default_score		:		obj.default_score || 1500 ,
    };
    newtx = this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);

  }
  async receiveCreateTransaction(blk, tx, conf, app) {

    //
    // id TEXT PRIMARY KEY,
    // game TEXT,
    // name TEXT,
    // admin TEXT,
    // status TEXT,
    // description TEXT,
    // ranking_algorithm TEXT,
    // default_score INTEGER,
    //
    let sql = `INSERT INTO league (id, game, name, admin, status, description, ranking_algorithm, default_score) VALUES ($id, $game, $name, $admin, $status, $description, $ranking_algorithm, $default_score)`;
    let params = {
	id			:		tx.transaction.sig ,
	game			:		txmsg.game || "" ,
	name			:		txmsg.name || "" ,
	admin			:		txmsg.admin || "" ,
	status			:		txmsg.status || "" ,
	description		:		txmsg.description || "" ,
	ranking_algorithm	:		txmsg.ranking_algorithm || "" ,
	default_score		:		1500 ,
    };
    await app.storage.executeDatabase(sql, params, "league");
    this.addLeague(params);
    return;

  }


  ///////////////////
  // join a league //
  ///////////////////
  createJoinTransaction(league_id="", data = null) {

    let newtx = this.app.wallet.createUnsignedTransaction();

    //
    // id INTEGER PRIMARY KEY AUTOINCREMENT,
    // league_id TEXT,
    // publickey TEXT,
    // email TEXT,
    // score INTEGER,
    // games_started INTEGER DEFAULT 0,
    // games_finished INTEGER DEFAULT 0,
    // games_won INTEGER DEFAULT 0,
    // games_tied INTEGER DEFAULT 0,
    // ts INTEGER,
    //
    newtx.msg = {
      module:    "League",
      league_id: league_id,
      request:   "league join",
    };

    if (data != null && typeof data == "object"){
      if (data.email) {
	newtx.msg.email = data.email;
      }
    }

    return this.app.wallet.signTransaction(newtx);

  }
  async receiveJoinTransaction(blk, tx, conf, app) {

    let txmsg = tx.returnMessage();
    let league_id  = txmsg.league_id;
    let email = txmsg.email;
    let publickey  = tx.transaction.from[0].add;
    let base_score = 0;
    if (this.returnLeague(league_id)) { base_score = returnLeague(league_id).default_score; }

    let sql = `INSERT INTO players (
                league_id,
                publickey,
                score,
		email,
                timestamp
              ) VALUES (
                $league_id,
                $publickey,
                $score,
                $email,
                $timestamp
              )`;

    let params = {
      $league_id: league_id,
      $publickey: publickey,
      $score: base_score,
      $email: email,
      $timestamp: parseInt(txmsg.timestamp)
    };
    app.storage.executeDatabase(sql, params, "league");
    return;
  }

  ///////////////////
  // quit a league //
  ///////////////////
  createQuitTransaction(publickey, league_id){
    let newtx = this.app.wallet.createUnsignedTransaction();

    newtx.msg = {
      module:    "League",
      league_id: league_id,
      request:   "league quit",
    };
    return this.app.wallet.signTransaction(newtx);
  }
  async receiveQuitTransaction(blk, tx, conf, app){

    let txmsg = tx.returnMessage();

    let sql = `DELETE FROM players WHERE league_id=$league AND publickey=$publickey`;
    let params = {
      $league : txmsg.league_id,
      $publickey: tx.transaction.from[0].add,
    }
    this.app.storage.executeDatabase(sql, params, "league");

  }



  /////////////////////
  // remove a league //
  /////////////////////
  createRemoveTransaction(league_id){

    let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    newtx.msg = {
      module:  "League",
      request: "league remove",
      league:   league_id,
    };

    return this.app.wallet.signTransaction(newtx);

  }
  async receiveRemoveTransaction(blk, tx, conf, app){

    let txmsg = tx.returnMessage();

    let sql1 = `DELETE FROM league WHERE id=$league_id AND admin=$publickey`;
    let params1 = {
      $league_id : txmsg.league_id ,
      $publickey : tx.transaction.from[0].add ,
    }
    this.app.storage.executeDatabase(sql1, params1, "league");

    let sql2 = `DELETE FROM players WHERE league_id='$league_id'`;
    let params2 = { $league_id : txmsg.league_id };
    this.app.storage.executeDatabase(sql2, params2, "league");

  }


  ///////////////////////////
  // roundover transaction //
  ///////////////////////////
  async receiveRoundoverTransaction(app, txmsg, gameover) {
    this.receiveGameoverTransaction(app, txmsg, gameover);
  }

  //////////////////////////
  // gameover transaction //
  //////////////////////////
  async receiveGameoverTransaction(app, txmsg, gameover){

    if (app.BROWSER == 1) { return; }

    let game = txmsg.module;

    //
    // small grace period
    //
    if ((txmsg.reason == "cancellation" || txmsg.reason == "arcadeclose") && gameover) { return; }

    //
    // fetch leagues
    //
    let sql = `SELECT * FROM league WHERE game = $game OR id='SAITOLICIOUS'`:''}`;
    let params = { $gamename : game };   
    const relevantLeagues = await app.storage.queryDatabase(sql, params, "league");

    //
    // fetch players
    //
    let publickeys = txmsg.players.split("_");

    if (Array.isArray(txmsg.winner) && txmsg.winner.length == 1){
      txmsg.winner = txmsg.winner[0];
    }

    //
    // update database
    //
    for (let leag of relevantLeagues){

      //
      // update games table if game is over 
      //
      if (gameover) {

        sql = `INSERT INTO games (league_id, game_id, module, winner, players_array, time_started, time_finished, method) VALUES ($league_id, $game_id, $module, $winner, $players_array, $time_started, $time_finished, $method)`;
        params = {
          $league_id: leag.id,
          $game_id: txmsg.game_id,
          $module: game,
          $winner: (Array.isArray(txmsg.winner))? txmsg.winner.join("_") : txmsg.winner,
          $players_array: txmsg.players,
          $time_started: 0,
          $time_finished: new Date().getTime(),
          $method: txmsg.reason,
        };
        await this.app.storage.executeDatabase(sql, params, "league");

        sql = `UPDATE games SET rank=rank+1 WHERE league_id = $league_id`;
        params = { $league_id : leag.id };
        await this.app.storage.executeDatabase(sql, params, "league");

      }

      //
      // update rankings (ELO)
      //
      if (leag.ranking == "elo"){
	this.updateELORanking(publickeys, leag);


      } else if (leag.ranking == "exp"){
        let players = [...publickeys]; //Need to refresh this each loop (since we splice below)

        //Winner(s) get 5 points, true ties get 3 pts, losers get 1 pt
        //as long as player is in the league

        if (Array.isArray(txmsg.winner)){
          let numPoints = (txmsg.reason == "tie") ? 3: 4;
          let gamekey = (txmsg.reason == "tie") ? "games_tied" : "games_won";

          for (let i = players.length-1; i>=0; i--){
            if (txmsg.winner.includes(players[i])){
              await this.incrementPlayer(players[i], leag.id, numPoints, gamekey);
              players.splice(i,1);
            }
          }
        }else{
          for (let i = players.length-1; i>=0; i--){
            if (txmsg.winner == players[i]){
              await this.incrementPlayer(players[i], leag.id, 5, "games_won");
              players.splice(i,1);
            }
          }
        }
        // everyone left gets a point for playing
        for (let i = 0; i < players.length; i++){
          await this.incrementPlayer(players[i], leag.id, 1);
        }
      }else{
        //No idea what to do here, but should call a function of the game module/game engine
      }
    }

  }

  async isELOeligible(players, league){
  async updateELORanking(players, league){

    //
    // no change for 1P games
    //
    if (players.length < 2) { return; }

    let sql2 = `SELECT * FROM players WHERE league_id = ? AND pkey IN (`;
    for (let pk of players) { sql2 += `'${pk}', `; }
    sql2 = sql2.substr(0, sql2.length - 2) + `)`;

    let playerStats = await this.app.storage.queryDatabase(sql2, [league.id], "league");
    if (playerStats.length !== players.length){
      // skip out - not all players are league members
      return; 
    }


    let winner = [], loser = [];
    let qsum = 0;
    for (let player of playerStats){
      //Convert each players ELO rating into a logistic function
      player.q = Math.pow(10, (player.score/400));
      //Sum the denominator so that the Expected values add to 1
      qsum += player.q;

      //
      //Dynamically calculate each player's K-factor
      //
      player.k = 10;
      if (playerObj?.score < 2400){
        player.k = 20;
      }
      if (player?.games_finished < 30 && player?.score < 2300){
        player.k = 40;
      }

      //
      //Sort into winners and losers
      //
      if (player.pkey == txmsg.winner || txmsg.winner.includes(player.pkey)){
        winner.push(player);
      }else{
        loser.push(player);
      }
    }

    console.log(winner, loser);
    for (let p of winner){
      let outcome = (winner.length == 1) ? "games_won" : "games_tied";
      p.score += p.k * ( (1/winner.length) - (p.q / qsum));
      await this.updatePlayerScore(p, outcome);
    }
    for (let p of loser){
      p.score -= (p.k * p.q / qsum);
      await this.updatePlayerScore(p);
    }

  }



















  async receiveAcceptTransaction(blk, tx, conf, app){

    if (this.app.BROWSER) { return; }

    let txmsg = tx.returnMessage();
    let game = txmsg.module;

    //Which leagues may this gameover affect?
    let sql = `SELECT * FROM league WHERE game = ? OR id='SAITOLICIOUS'`;
    const relevantLeagues = await this.app.storage.queryDatabase(sql, [game], "league");

    //Who are all the players in the game?
    let publickeys = [];
    for (let i = 0; i < tx.transaction.to.length; i++) {
      if (!publickeys.includes(tx.transaction.to[i].add)) {
        publickeys.push(tx.transaction.to[i].add);
      }
    }

    let today = new Date().getTime();

    //CHECK EVERY LEAGUE TO SEE IF WE WANT TO UPDATE START_GAME STATS
    for (let leag of relevantLeagues){
      //console.log(leag);

      if (leag.options){
       if (!txmsg?.options?.league || leag.id !== txmsg.options.league){
        //console.log("Exclusive league, skip");
        continue;
        }
      }
      if (leag.startdate){
        let sd = Date.parse(leag.startdate);
        if (today < sd){
          //console.log("League hasn't begun yet.");
          continue;
        }
      }
      if (leag.enddate){
        let ed = Date.parse(leag.enddate);
        if (today > ed){
          //console.log("League already finished.");
          continue;
        }
      }


      if (leag.admin !== "saito"){
        if (leag.ranking == "elo"){
          //Is this a game we can rank?
          if (!await this.isELOeligible(publickeys, leag)){
            //console.log("Not ELO Eligible");
            continue;
          }
        }
      } else {
        for (let player of publickeys){
          await this.autoJoinPublicLeague(player, leag);
        }
      }
      //this.countGameStart(publickeys, leag);

    }
  }

  async autoJoinPublicLeague(player_key, league){
    let sql = `SELECT * from players WHERE pkey="${player_key}" AND league_id="${league.id}"`;
    let rows = await this.app.storage.queryDatabase(sql, {}, "league");
    //Add player if not found
    if (!rows || !rows.length || rows.length == 0){
      sql = `INSERT INTO players (
                league_id,
                pkey,
                score,
                ts
              ) VALUES (
                $league_id,
                $publickey,
                $score,
                $timestamp
              )`;

      let params = {
        $league_id: league.id,
        $publickey: player_key,
        $score: league.starting_score,
        $timestamp: new Date().getTime(),
      };
      await this.app.storage.executeDatabase(sql, params, "league");
    }
    return 1;
  }

  async receiveRoundOverTransaction(blk, tx, conf, app){
    if (app.BROWSER == 1) { return; }

    let txmsg = tx.returnMessage();
    let game = txmsg.module;

  }



  /* Let's try this function as a service node only */
  async processUpdateTransaction(app, txmsg, gameover){
    if (app.BROWSER == 1) { return; }

    //All games have a grace window where if a player "quits" within X moves
    //it won't count as a win or loss for anyone
    if ((txmsg.reason == "cancellation" || txmsg.reason == "arcadeclose")
      && gameover){
      return;
    }

    let game = txmsg.module;

    //Which leagues may this gameover affect?
    let sql = `SELECT * FROM league WHERE game = ?${(gameover)? ` OR id='SAITOLICIOUS'`:''}`;
    const relevantLeagues = await app.storage.queryDatabase(sql, [game], "league");

    //Who are all the players in the game?
    let publickeys = txmsg.players.split("_");

    if (Array.isArray(txmsg.winner) && txmsg.winner.length == 1){
      txmsg.winner = txmsg.winner[0];
    }

    let today = new Date().getTime();
    //Let's check each league
    for (let leag of relevantLeagues){
      if (leag.options && leag.id !== txmsg.league){
        console.log("Specified League ID:",txmsg.league);
        console.log(leag);
        continue;
      }
      if (leag.startdate){
        let sd = Date.parse(leag.startdate);
        if (today < sd){
          console.log("League hasn't begun yet.");
          continue;
        }
      }
      if (leag.enddate){
        let ed = Date.parse(leag.enddate);
        if (today > ed){
          console.log("League already finished.");
          continue;
        }
      }

      if (gameover){
        //Make a record of the game
        sql = `INSERT INTO games (league_id, game_id, module, winner, players_array, time_started, time_finished, method) VALUES ($league_id, $game_id, $module, $winner, $players_array, $time_started, $time_finished, $method)`;

        let params = {
          $league_id: leag.id,
          $game_id: txmsg.game_id,
          $module: game,
          $winner: (Array.isArray(txmsg.winner))? txmsg.winner.join("_") : txmsg.winner,
          $players_array: txmsg.players,
          $time_started: 0,
          $time_finished: new Date().getTime(),
          $method: txmsg.reason,
        };

        console.log(sql, params);
        await this.app.storage.executeDatabase(sql, params, "league");
        sql = `UPDATE games SET rank=rank+1 WHERE league_id = "${leag.id}"`;
        await this.app.storage.executeDatabase(sql, {}, "league");
      }

      //Update players in the league based on results
      if (leag.ranking == "elo"){
        //All players must belong to ELO league for points to change

        let playerStats = await this.isELOeligible(publickeys, leag);

        if (!playerStats){
          continue;
        }

        let winner = [], loser = [];
        let qsum = 0;
        for (let player of playerStats){
          //Convert each players ELO rating into a logistic function
          player.q = Math.pow(10, (player.score/400));
          //Sum the denominator so that the Expected values add to 1
          qsum += player.q;
          //Dynamically calculate each player's K-factor
          player.k = this.calculateK(player);

          //Sort into winners and losers
          if (player.pkey == txmsg.winner || txmsg.winner.includes(player.pkey)){
            winner.push(player);
          }else{
            loser.push(player);
          }
        }

        console.log(winner, loser);
        for (let p of winner){
          let outcome = (winner.length == 1) ? "games_won" : "games_tied";
          p.score += p.k * ( (1/winner.length) - (p.q / qsum));
          await this.updatePlayerScore(p, outcome);
        }
        for (let p of loser){
          p.score -= (p.k * p.q / qsum);
          await this.updatePlayerScore(p);
        }

      }else if (leag.ranking == "exp"){
        let players = [...publickeys]; //Need to refresh this each loop (since we splice below)

        //Winner(s) get 5 points, true ties get 3 pts, losers get 1 pt
        //as long as player is in the league

        if (Array.isArray(txmsg.winner)){
          let numPoints = (txmsg.reason == "tie") ? 3: 4;
          let gamekey = (txmsg.reason == "tie") ? "games_tied" : "games_won";

          for (let i = players.length-1; i>=0; i--){
            if (txmsg.winner.includes(players[i])){
              await this.incrementPlayer(players[i], leag.id, numPoints, gamekey);
              players.splice(i,1);
            }
          }
        }else{
          for (let i = players.length-1; i>=0; i--){
            if (txmsg.winner == players[i]){
              await this.incrementPlayer(players[i], leag.id, 5, "games_won");
              players.splice(i,1);
            }
          }
        }
        //Everyone left gets a point for playing
        for (let i = 0; i < players.length; i++){
          await this.incrementPlayer(players[i], leag.id, 1);
        }
      }else{
        //No idea what to do here, but should call a function of the game module/game engine
      }
    }

  }


  async incrementPlayer(pkey, lid, amount, game_status = null){
    //if (this.app.wallet.returnPublicKey() !== pkey){ return; }
    let now = new Date().getTime();
    let sql = `UPDATE players SET score = (score + ${amount}), games_finished = (games_finished + 1), ts = $ts`;
    if (game_status){
      sql += `, ${game_status} = (${game_status} + 1)`;
    }
    sql+= ` WHERE pkey = $pkey AND league_id = $lid`;
    console.log(sql);
    let params = {
      $ts: now,
      $pkey: pkey,
      $lid: lid
    }
    console.log(params);
    await this.app.storage.executeDatabase(sql, params, "league");
    this.app.connection.emit("league-rankings-render-request");
    return 1;
  }

  async updatePlayerScore(playerObj, game_status = null){
    let now = new Date().getTime();
    let sql = `UPDATE players SET score = $score, games_finished = ${playerObj.games_finished + 1}, ts = $ts`;
    if (game_status){
      sql += `, ${game_status} = ${playerObj[game_status] + 1}`;
    }
    sql+= ` WHERE pkey = $pkey AND league_id = $lid`;
    console.log(sql);
    let params = {
      $score: playerObj.score,
      $ts: now,
      $pkey: playerObj.pkey,
      $lid: playerObj.league_id
    }
    console.log(params);
    await this.app.storage.executeDatabase(sql, params, "league");
    this.app.connection.emit("league-rankings-render-request");
    return 1;
  }



}

module.exports = League;

