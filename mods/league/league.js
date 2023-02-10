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
    // UI components
    //
    this.main = null;
    this.header = null;

    this.icon_fa = "fas fa-user-friends";

  }


  //
  // declare that we support the "league" service, which allows peers to query
  // us for league-related information (leagues, players, leaderboards, etc.)
  //
  returnServices() {
    if (this.app.BROWSER) { return []; }
    return [{ service : "league" , domain : "saito" }];
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
    	   	game   			: 	mod.name , 				// game - name of game mod
    	   	name   			: 	mod.name , 				// name - name of league
    	   	admin  			: 	"" ,					// admin - publickey (if exists)
		status 			: 	"public" ,				// status - public or private
		description 		: 	mod.description ,			// 
		ranking_algorithm 	: 	"ELO" ,					//
		default_score 		:	1500 					// default ranking for newbies
       });
    });
  }


  //////////////////////////
  // Rendering Components //
  //////////////////////////
  render() {

    let app = this.app;
    let mod = this.mod;

    this.main = new LeagueMain(app, this)
    this.header = new SaitoHeader(app, this);
    this.addComponent(this.main);
    this.addComponent(this.header);

    super.render(app, this);
  }

  canRenderInto(qs) {
    if (qs == ".redsquare-sidebar") { return true; }
    if (qs == ".arcade-leagues") { return true; }
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





  /////////////////////////////
  // League Array Management //
  /////////////////////////////
  returnLeague(league_id) {
    for (let i = 0; i < this.leagues.length; i++) {
      if (this.leagues[i].id === league_id) { return this.leagues[i]; }
    }
    return null;
  }

  removeLeague(league_id) {
    for (let i = 0; i < this.leagues.length; i++) {
      if (this.leagues[i].id === league_id) { this.leagues.splice(i, 1); }
    }
    return null;
  }

  addLeague(obj) {

    //
    // default values
    //
    if (!obj)                   { return; }
    if (!obj.id)                { return; }
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
    if (!obj.players)           { obj.players = []; }
		//
		// {
		//    publickey TEXT ,
		//    score INT ,
		// }
		//
    if (!obj.games)             { obj.games = []; }
    if (!obj.rank)		{ obj.rank = 0; } // my rank in this league

    if (!this.returnLeague(obj.id)) {
      this.leagues.push(obj);
      this.app.connection.emit("league-add-league", (this.leagues[(this.leagues.length-1)]));
    }

  }

  addLeagueGame(league_id, game_id, winner, players_array, rank, time_started, time_finished, method) {

    let game_idx = -1;
    let league_idx = -1;

    for (let i = 0; i < this.leagues.length; i++) {
      if (this.leagues[i].id === league_id) {
	league_idx = i;
        for (let z = 0; z < this.leagues[i].games.length; z++) {
	  if (this.leagues[i].games[z].game_id === game_id) {
	    game_idx = z;
	    z = this.leagues[i].games.length+1;
	    i = this.leagues.length+1;
	    break;
	  }
	}
      }
    }

    if (game_idx == -1) {
      this.leagues[i].games.push({ 
	    game_id : game_id ,
	    winner : winner ,
	    players_array : players_array ,
	    rank : rank ,
	    time_started : time_started ,
	    time_finished : time_finished ,
	    method : method 
      });
console.log("A5");
    } else {
console.log("A6");
      if (league_idx > -1 && game_idx > -1) {
console.log("A7 - " + this.leagues[league_idx].games.length);
        this.leagues[league_idx].games[game_idx].game_id = game_id;
console.log("A8");
        this.leagues[league_idx].games[game_idx].winner = winner;
        this.leagues[league_idx].games[game_idx].players_array = players_array;
        this.leagues[league_idx].games[game_idx].rank = rank;
        this.leagues[league_idx].games[game_idx].time_started = time_started;
        this.leagues[league_idx].games[game_idx].time_finished = time_finished;
        this.leagues[league_idx].games[game_idx].method = method;
      }
    }
  }


  addLeaguePlayer(league_id, publickey, score, games_won, games_tied, games_finished) {

    for (let i = 0; i < this.leagues.length; i++) {
      if (this.leagues[i].id === league_id) {
	let player_idx = -1;
        for (let z = 0; z < this.leagues[i].players.length; z++) {
	  if (this.leagues[i].players[z].publickey === publickey) {
	    player_idx = z;
	    z = this.leagues[i].players.length+1;
	    i = this.leagues.length;
	  }
	}
	if (player_idx == -1) {
	  this.leagues[i].players.push({ 
	    publickey : publickey ,
	    score : score ,
	    games_won : games_won ,
	    games_tied : games_tied ,
	    games_finished : games_finished
	  });
	} else {
	  this.leagues[i].players[player_idx].score = score;
	  this.leagues[i].players[player_idx].games_won = games_won;
	  this.leagues[i].players[player_idx].games_tied = games_tied;
	  this.leagues[i].players[player_idx].games_finished = games_finished;
	}
      }
    }

  }

  fetchLeagueGames(league_id, mycallback=null) {

    this.sendPeerDatabaseRequestWithFilter("League" , `SELECT * FROM games WHERE league_id = '${league_id}' LIMIT 10` ,
      (res) => {
        if (res.rows) {
          for (let g of res.rows) {

  	    let game_id 	= g.game_id;
  	    let winner		= g.winner;
  	    let players_array   = g.players_array;
	    let rank		= g.rank;
	    let time_started	= g.time_started;
	    let time_finished	= g.time_finished;
	    let method		= g.method;

console.log("MOVING IN WITH GAME ID: " + game_id);

            this.addLeagueGame(league_id, game_id, winner, players_array, rank, time_started, time_finished, method);

console.log("DONE ADDING LEAGUE GAME");

          }
        }
      }
    );

  }

  fetchLeagueLeaderboard(league_id, mycallback=null) {

    let league = this.returnLeague(league_id);

    this.sendPeerDatabaseRequestWithFilter(
      "League" ,
      `SELECT * FROM players WHERE league_id = '${league_id}' ORDER BY score DESC, games_won DESC, games_tied DESC, games_finished DESC` ,
      (res) => {
	if (res) {
        if (res.rows) {

          for (let p of res.rows){

	    let publickey 	= p.publickey;
	    let score 		= p.score;
	    let games_won 	= p.games_won;
	    let games_tied 	= p.games_tied;
	    let games_finished 	= p.games_finished;

            if (publickey == this.app.wallet.returnPublicKey()) {
              let league = this.returnLeague(league_id);
	      league.rank = score;
            }

            this.addLeaguePlayer(league.id, publickey, score, games_won, games_tied, games_finished);

          }
	}
	}
	if (mycallback != null) { mycallback(res); }
      },
      (p) => {
	if (p.hasService("league")) { return 1; }
	return 0;
      }
    );
  }


  async onPeerServiceUp(app, peer, service) {

    //
    // add remote leagues
    //
    if (service.service === "league") {

      let league_self = this;

      //
      // fetch updated rankings
      //
      for (let i = 0; i < this.leagues.length; i++) {
        this.sendPeerDatabaseRequestWithFilter(
          "League" ,
	  `SELECT league_id, publickey, score, games_won, games_tied, games_finished FROM players WHERE league_id = "${league_self.leagues[i].id}"` ,
          (res) => {
            let rows = res.rows || [];
            if (rows.length > 0) {
	      for (let z = 0; z < rows.length; z++) {
		league_self.addLeaguePlayer(rows[z].league_id, rows[z].publickey, rows[z].score, rows[z].games_won, rows[z].games_tied, rows[z].games_finished);
	      }
            }
          },
          (p) => {
	    if (p == peer) { return 1; }
	    return 0;
  	  }
        );
      }

      //    
      // load any requested league we may not have in options file
      //    
      if (this.app.browser.returnURLParameter("league_join_league")) {

        this.sendPeerDatabaseRequestWithFilter(
          "League" , 
          `SELECT * FROM leagues WHERE id = "${this.app.browser.returnURLParameter("league_join_league")}"` ,
          (res) => {
            let rows = res.rows || [];
            if (rows.length > 0) {
              rows.forEach(function(league, key) {
                league_self.addLeague(league);
              }); 
	      league_self.app.connection.emit("leagues-render-request");
	      league_self.app.connection.emit("league-rankings-render-request");
            }

            //
            // league join league
            //
            let league_id = this.app.browser.returnURLParameter("league_join_league");
            let jlo = new JoinLeagueOverlay(app, this, league_id);
            jlo.render();

          },
          (p) => {
  	    if (p == peer) { return 1; }
 	    return 0;
	  }
        );
      }

    }

  }


  async onConfirmation(blk, tx, conf, app) {

    if (conf != 0) { return; }

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
        this.receiveRoundoverTransaction(app, txmsg);
      }

      if (txmsg.request === "accept") {
        this.receiveAcceptTransaction(blk, tx, conf, app);
      }

      if (txmsg.request === "launch singleplayer") {
        this.receiveLaunchSinglePlayerTransaction(blk, tx, conf, app);
      }

    } catch (err) {
      console.log("ERROR in league onConfirmation: " + err);
    }

    return;
  }


  shouldAffixCallbackToModule(modname, tx = null) {
    if (modname == "League") { return 1; }
    if (modname == "Arcade") { return 1; }
    for (let i = 0; i < this.leagues.length; i++) {
      if (this.leagues[i].name === modname) {
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
    this.app.storage.saveOptions();
  }



  /////////////////////
  // create a league //
  /////////////////////
  createCreateTransaction(obj = null) {

    if (obj == null) { return null; }

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
    return this.app.wallet.signTransaction(newtx);

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
    let txmsg = tx.returnMessage();
    let sql = `INSERT INTO leagues (
	id, 
	game, 
	name, 
	admin, 
	status, 
	description, 
	ranking_algorithm, 
	default_score
      ) VALUES (
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
	$id			:		tx.transaction.sig ,
	$game			:		txmsg.game || "" ,
	$name			:		txmsg.name || "" ,
	$admin			:		txmsg.admin || "" ,
	$status			:		txmsg.status || "" ,
	$description		:		txmsg.description || "" ,
	$ranking_algorithm	:		txmsg.ranking_algorithm || "" ,
	$default_score		:		1500
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
    if (this.returnLeague(league_id)) { base_score = this.returnLeague(league_id).default_score; }

    let params = {
      league_id: league_id,
      publickey: publickey,
      score: base_score,
      ts: parseInt(tx.transaction.ts)
    };
    await this.playerInsert(params);
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
    let sql1 = `DELETE FROM leagues WHERE id=$league_id AND admin=$publickey`;
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
  async receiveRoundoverTransaction(app, txmsg) {
    this.receiveGameoverTransaction(app, txmsg, false);
  }

  //////////////////////////
  // gameover transaction //
  //////////////////////////
  async receiveGameoverTransaction(app, txmsg, is_gameover=false){

    if (app.BROWSER == 1) { return; }

    let game = txmsg.module;

    //
    // small grace period
    //
    if ((txmsg.reason == "cancellation" || txmsg.reason == "arcadeclose") && is_gameover) { return; }

    //
    // fetch players
    //
    let publickeys = txmsg.players.split("_");
    if (Array.isArray(txmsg.winner) && txmsg.winner.length == 1){
      txmsg.winner = txmsg.winner[0];
    }

    //
    // fetch leagues
    //
    let sql = `SELECT * FROM leagues WHERE game = $game OR id='SAITOLICIOUS'`;
    let params = { $game : game };   
    let relevantLeagues = await app.storage.queryDatabase(sql, params, "league");

    //
    // if there are no relevant leagues, add one
    //
    if (relevantLeagues.length == 0) {
      for (let i = 0; i < this.leagues.length; i++) {
	if (this.leagues[i].name === game) {

	  let league = this.leagues[i];

          //
          // insert into DB if not exists
          //
          let sql = `INSERT INTO leagues (
            id,
            game,
            name,
            admin,
            status,
            description,
            ranking_algorithm,
            default_score
          ) VALUES (
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
            $id                     :               league.id ,
            $game                   :               league.game || "" ,
            $name                   :               league.name || "" ,
            $admin                  :               league.admin || "" ,
            $status                 :               league.status || "" ,
            $description            :               league.description || "" ,
            $ranking_algorithm      :               league.ranking_algorithm || "" ,
            $default_score          :               league.default_score
          };
          await app.storage.executeDatabase(sql, params, "league");
          sql = `SELECT * FROM leagues WHERE game = $game OR id='SAITOLICIOUS'`;
          params = { $game : game };   
          relevantLeagues = await app.storage.queryDatabase(sql, params, "league");
        }
      }

    }

    //
    // update database
    //
    for (let leag of relevantLeagues){

      //
      // update games table if game is over 
      //
      if (is_gameover) {

        obj = {
          league_id: leag.id,
          game_id: txmsg.game_id,
          module: game,
          winner: (Array.isArray(txmsg.winner))? txmsg.winner.join("_") : txmsg.winner,
          players_array: txmsg.players,
          time_started: 0,
          time_finished: new Date().getTime(),
          method: txmsg.reason,
        };
        await this.gameInsert(obj);

      }

      //
      // insert players if not in league
      //
      for (let i = 0; i < publickeys.length; i++) {
        let obj = {
              league_id: leag.id,
              publickey: publickeys[i] ,
              score: leag.default_score ,
              ts: new Date().getTime()
        };
	await this.playerInsert(obj);
      }

      //
      // update rankings (ELO)
      //
      if (leag.ranking === "elo"){
	this.updateELORanking(publickeys, leag);
      }
      if (leag.ranking === "exp"){
        this.updateEXPRanking(publickeys, leag, txmsg);
      }
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
  async receiveAcceptTransaction(blk, tx, conf, app){

    let txmsg = tx.returnMessage();
    let game = txmsg.module;

    let sql = `SELECT * FROM leagues WHERE game = $gamename OR id='SAITOLICIOUS'`;
    let params = { $gamename : game };
    const relevantLeagues = await this.app.storage.queryDatabase(sql, params, "league");

    //
    // who are the players ?
    //
    let publickeys = [];
    for (let i = 0; i < tx.transaction.to.length; i++) {
      if (!publickeys.includes(tx.transaction.to[i].add)) {
        publickeys.push(tx.transaction.to[i].add);
      }
    }

    //
    // and insert if needed
    //
    for (let leag of relevantLeagues){
      if (leag.admin === "saito") {
        for (let player of publickeys){

          let sql2 = `SELECT * from players WHERE publickey="$publickey" AND league_id="$league_id"`;
          let params2 = { $publickey : player , $league_id : leag.id };
          let rows = await this.app.storage.queryDatabase(sql, params, "league");

          if (!rows || !rows.length || rows.length == 0){
            let obj = {
              league_id: leag.id,
              publickey: player,
              score: leag.default_score,
              ts: new Date().getTime(),
            };
	    await this.playerInsert(obj);
	    return;
          }
        }
      }
    }
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
    if (Array.isArray(txmsg.winner)) {

      let numPoints = (txmsg.reason == "tie") ? 3: 4;
      let gamekey = (txmsg.reason == "tie") ? "games_tied" : "games_won";

      for (let i = players.length-1; i>=0; i--){
        if (txmsg.winner.includes(players[i])){
          await this.addEXP(players[i], league.id, numPoints, gamekey);
          players.splice(i,1);
        }
      }

    } else {
      for (let i = players.length-1; i>=0; i--){
        if (txmsg.winner == players[i]){
          await this.addEXP(players[i], league.id, 5, "games_won");
          players.splice(i,1);
        }
      }
    }

    // everyone left gets a point for playing
    for (let i = 0; i < players.length; i++){
      await this.incrementPlayer(players[i], league.id, 1);
    }

  }

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

  async addEXP(publickey, league_id, points, game_status = null){

    let sql = `UPDATE players SET score = (score + $points), games_finished = (games_finished + 1), ts = $ts`;
    if (game_status) { sql += `, ${game_status} = (${game_status} + 1)`; }

    sql += ` WHERE pkey = $pkey AND league_id = $lid`;
    let params = {
      $amount : points ,
      $ts: new Date().getTime() ,
      $publickey: publickey ,
      $league_id: league_id
    }
    await this.app.storage.executeDatabase(sql, params, "league");
    return 1;
  }




  async updatePlayerScore(playerObj, game_status = null) {

    let sql = `UPDATE players SET score = $score, games_finished = ${playerObj.games_finished + 1}, ts = $ts`;
    if (game_status){
      sql += `, ${game_status} = ${playerObj[game_status] + 1}`;
    }
    sql+= ` WHERE pkey = $pkey AND league_id = $league_id`;
    let params = {
      $score: playerObj.score,
      $ts: new Date().getTime() ,
      $publickey: playerObj.publickey,
      $league_id: playerObj.league_id
    }
    await this.app.storage.executeDatabase(sql, params, "league");
    return 1;
  }



  ////////////////////////////////////////////////
  // convenience functions for database inserts //
  ////////////////////////////////////////////////
  async gameInsert(obj) {

        let sql = `INSERT INTO games (league_id, game_id, module, winner, players_array, time_started, time_finished, method) VALUES ($league_id, $game_id, $module, $winner, $players_array, $time_started, $time_finished, $method)`;
        let params = {
          $league_id: obj.league_id,
          $game_id: obj.game_id,
          $module: obj.module,
          $winner: obj.winner ,
          $players_array: obj.players,
          $time_started: obj.time_started,
          $time_finished: obj.time_finished,
          $method: obj.reason,
        };
        await this.app.storage.executeDatabase(sql, params, "league");

        sql = `UPDATE games SET rank=rank+1 WHERE league_id = $league_id`;
        params = { $league_id : obj.league_id };
        await this.app.storage.executeDatabase(sql, params, "league");
	return;
  }

  async playerInsert(obj) {

        let sql = `INSERT INTO players (
                league_id,
                publickey,
                score,
                ts
              ) VALUES (
                $league_id,
                $publickey,
                $score,
                $ts
              )`;
        let params = {
              $league_id: obj.league_id,
              $publickey: obj.publickey,
              $score: obj.default_score,
              $ts: obj.ts
            };
        await this.app.storage.executeDatabase(sql, params, "league");
	return;
  }

}

module.exports = League;

