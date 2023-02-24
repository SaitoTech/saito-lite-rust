const saito = require("./../../lib/saito/saito");
const ModTemplate = require('../../lib/templates/modtemplate');
const LeagueRankings = require("./lib/rankings");
const LeagueLeaderboard = require("./lib/leaderboard");
const LeagueMain = require('./lib/main');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');
const SaitoOverlay = require('../../lib/saito/ui/saito-overlay/saito-overlay');
const InvitationLink = require("./lib/overlays/league-invitation-link");
const JoinLeagueOverlay = require('./lib/overlays/join');

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

    this.styles = ['/league/style.css'];

    this.leagues = [];
    this.league_idx = -1; // if a league is active, this will be idx

    //
    // UI components
    //
    this.main = null;
    this.header = null;

    this.icon_fa = "fas fa-user-friends";
    this.debug = true;
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

    //Trial -- So that we can display league results in game page
    //this.overlay = new LeagueOverlay(app, this);

    //
    // create initial leagues
    //
    this.app.modules.getRespondTos("default-league").forEach((modResponse) => {
       this.addLeague({
        	id     			: 	  app.crypto.hash(modResponse.modname) ,	// id
    	   	game   			: 	  modResponse.modname , 				// game - name of game mod
    	   	name   			: 	  modResponse.name , 				// name - name of league
    	   	admin  			: 	  "" ,					// admin - publickey (if exists)
      		status 			: 	  "public" ,				// status - public or private
		      description 		: modResponse.description ,			// 
		      ranking_algorithm : 	modResponse.ranking_algorithm ,					//
		      default_score 		:	modResponse.default_score 					// default ranking for newbies
       });
    });

    this.sortLeagues();
  }

  //
  // So leagues are displayed in same order as game list for consistency's sake
  //
  sortLeagues(){
    let superArray = [];
    try{
      this.leagues.forEach(l => {
        let gm = this.app.modules.returnModuleByName(l.game);
        superArray.push([l.admin, gm.categories, l]);
      });

      console.log(JSON.parse(JSON.stringify(superArray)));

      superArray.sort((a,b) => {
        //Push community leagues to the bottom
        if (a[0] && !b[0]){ return 1;}
        if (!a[0] && b[0]){ return -1;}
        
        //Sort by game categories
        if (a[1]>b[1]){ return 1;}
        if (a[1]<b[1]){ return -1;}

        return 0;
      });

      console.log(JSON.parse(JSON.stringify(superArray)));
      
      this.leagues = [];
      for (let i = 0; i < superArray.length; i++){
        this.leagues.push(superArray[i][2]);
      }
    }catch(err){
      console.warn(err);
    }
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
    if (qs == ".redsquare-sidebar" || qs == ".arcade-leagues") {
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
      if (this.leagues[i].id === league_id) { 
        this.leagues.splice(i, 1); 
        return;
      }
    }
    return null;
  }

  addLeague(obj) {
    
    if (!obj)                   { return; }
    if (!obj.id)                { return; }

      if (this.debug) { console.log("Add League with ID: " + obj.id); }
    
    if (!this.returnLeague(obj.id)) {
      let newLeague = this.validateLeague(obj);

      //
      // dynamic data-storage
      //
      newLeague.players = [];
      newLeague.games = [];
      newLeague.rank = 0; //My rank in the league
    

      if (this.debug) { console.log("New League", JSON.parse(JSON.stringify(newLeague))); }

      this.leagues.push(newLeague);

      if (!this.app.BROWSER){
        this.leagueInsert(newLeague);        
      }
    }

  }


  addLeagueGame(league_id, game_id, winner, players_array, rank, time_started, time_finished, method) {

    let game_idx = -1;

    for (let i = 0; i < this.leagues.length; i++) {
      if (this.leagues[i].id === league_id) {
        for (let z = 0; z < this.leagues[i].games.length; z++) {
    	    if (this.leagues[i].games[z].game_id === game_id) {
            this.leagues[i].games[z].game_id = game_id;
            this.leagues[i].games[z].winner = winner;
            this.leagues[i].games[z].players_array = players_array;
            this.leagues[i].games[z].rank = rank;
            this.leagues[i].games[z].time_started = time_started;
            this.leagues[i].games[z].time_finished = time_finished;
            this.leagues[i].games[z].method = method;
    	      return;
          }
    	  }
        
        this.leagues[i].games.push({ 
          game_id : game_id ,
          winner : winner ,
          players_array : players_array ,
          rank : rank ,
          time_started : time_started ,
          time_finished : time_finished ,
          method : method 
        });

        return;
      }
    }
  }

  //
  // Update Player-League data in our live data structure
  //
  addLeaguePlayer(league_id, publickey, score, games_won, games_tied, games_finished) {

    let league = this.returnLeague(league_id);
  
    if (!league) { 
      console.error("League not found"); 
      return; 
    }

    for (let z = 0; z < league.players.length; z++) {
  	  if (league.players[z].publickey === publickey) {
        league.players[z].score = score;
        league.players[z].games_won = games_won;
        league.players[z].games_tied = games_tied;
        league.players[z].games_finished = games_finished;
        return;
  	  }
  	}
      	
    league.players.push({ 
	    publickey : publickey ,
	    score : score ,
	    games_won : games_won ,
	    games_tied : games_tied ,
	    games_finished : games_finished
	  }); 	 
      	
  }

  fetchLeagueGames(league_id, mycallback=null) {

    let league = this.returnLeague(league_id);
    league.games = [];

    this.sendPeerDatabaseRequestWithFilter("League" , `SELECT * FROM games WHERE league_id = '${league_id}' ORDER BY time_finished DESC LIMIT 10` ,
      (res) => {
        if (res?.rows) {
          for (let g of res.rows) {
            this.addLeagueGame(league_id, g.game_id, g.winner, g.players_array, g.rank, g.time_started, g.time_finished, g.method);
          }
        }
        if (mycallback != null) {
      	  mycallback(res);
        }
      }
    );

  }

  fetchLeagueLeaderboard(league_id, mycallback=null) {

    let league = this.returnLeague(league_id);
    let rank = 0;

    //We need to reset this because this should be an ordered array
    //and if the scores have changed, we need to resort the players
    league.players = [];

    this.sendPeerDatabaseRequestWithFilter(
      "League" ,
      `SELECT * FROM players WHERE league_id = '${league_id}' ORDER BY score DESC, games_won DESC, games_tied DESC, games_finished DESC` ,
      (res) => {
      	  if (res?.rows) {

            for (let p of res.rows){
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
              this.addLeaguePlayer(league.id, p.publickey, p.score, p.games_won, p.games_tied, p.games_finished);
            }
      	}
      	
      	if (mycallback != null) { mycallback(res); }
      },
      (p) => {
	        if (p.hasService("league")) { 
            return 1; 
          }
            return 0;
        }
    );
  }


  async onPeerServiceUp(app, peer, service) {

    //
    // add remote leagues
    //
    if (service.service === "league") {

      if (this.debug){
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
        
        this.fetchLeagueLeaderboard(this.leagues[i].id, 
          ()=>{
            helper_array.pop();
            if (helper_array.length == 0){
              app.connection.emit("league-rankings-render-request");   
            } 
          });
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
                this.addLeague(league);
              }); 
    	      app.connection.emit("leagues-render-request");
    	      app.connection.emit("league-rankings-render-request");
            }

            //
            // league join league
            //
            let league_id = this.app.browser.returnURLParameter("league_join_league");
            let jlo = new JoinLeagueOverlay(app, this, league_id);
            jlo.render();

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

    if (conf != 0) { return; }

    try {

      let txmsg = tx.returnMessage();

      if (this.debug){
        console.log("LEAGUE onConfirmation: " + txmsg.request);  
      }
      

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
      if (this.debug){
        console.log("Locally stored leagues:", JSON.parse(JSON.stringify(this.app.options.leagues)));  
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


  validateLeague(obj){
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


  /////////////////////
  // create a league //
  /////////////////////
  createCreateTransaction(obj = null) {

    if (obj == null) { return null; }

    let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    newtx.msg = this.validateLeague(obj);
    newtx.msg.module = "League";
    newtx.msg.request = "league create";

    return this.app.wallet.signTransaction(newtx);

  }

  async receiveCreateTransaction(blk, tx, conf, app) {

    let txmsg = tx.returnMessage();

    let obj = this.validateLeague(txmsg);
    obj.id = tx.transaction.sig;

    this.addLeague(obj);

    return;

  }


  ///////////////////
  // join a league //
  ///////////////////
  createJoinTransaction(league_id="", data = null) {

    let newtx = this.app.wallet.createUnsignedTransaction();

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
    let league = this.returnLeague(league_id);

    if (!league){
      console.warn("Invalid League");
      return;
    }

    let params = {
      league_id: league_id,
      publickey: tx.transaction.from[0].add,
      email: txmsg.email || "",
      score: league.default_score,
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
    let sql = `SELECT * FROM leagues WHERE game = $game`;
    let params = { $game : game };   
    let relevantLeagues = await app.storage.queryDatabase(sql, params, "league");

    //
    // update database
    //
    for (let y = 0; y < relevantLeagues.length; y++){

      let leag = relevantLeagues[y];

      //
      // update games table if game is over 
      //
      if (is_gameover) {

        obj = {
          league_id: leag.id,
          game_id: txmsg.game_id,
          game: game,
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
      if (leag.ranking_algorithm === "ELO"){
	      this.updateELORanking(publickeys, leag, txmsg);
      }
      if (leag.ranking_algorithm === "EXP"){
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

    if (this.debug){console.log(`League processing game start of ${txmsg.game}!`);}

    let sql = `SELECT * FROM leagues WHERE game = ?`;
    const relevantLeagues = await this.app.storage.queryDatabase(sql, [txmsg.game], "league");

    //
    // who are the players ?
    //
    let publickeys = [];
    for (let i = 0; i < tx.transaction.to.length; i++) {
      if (!publickeys.includes(tx.transaction.to[i].add)) {
        publickeys.push(tx.transaction.to[i].add);
      }
    }

    if (this.debug){console.log(relevantLeagues, publickeys);}

    //
    // and insert if needed
    //
    for (let leag of relevantLeagues){
      if (leag.admin === "") {
        for (let player of publickeys){

          let sql2 = `SELECT * from players WHERE publickey = ? AND league_id = ?`;
          let rows = await this.app.storage.queryDatabase(sql2, [player, leag.id], "league");

          if (!rows || !rows.length || rows.length == 0){
            let obj = {
              league_id: leag.id,
              publickey: player,
              score: leag.default_score,
              ts: new Date().getTime(),
            };
      	    await this.playerInsert(obj);
          }

          //Update Player's game started count
          await this.incrementPlayer(player, leag.id, "games_started");
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
      this.addEXP(players[i], league.id, 1);
    }

  }

  async updateELORanking(players, league, txmsg){

    //
    // no change for 1P games
    //
    if (players.length < 2) { return; }


    let sql2 = `SELECT * FROM players WHERE league_id = ? AND publickey IN (`;
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
      if (player?.score < 2400){
        player.k = 20;
      }
      if (player?.games_finished < 30 && player?.score < 2300){
        player.k = 40;
      }

      //
      //Sort into winners and losers
      //
      if (player.publickey == txmsg.winner || txmsg.winner.includes(player.publickey)){
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


  async incrementPlayer(publickey, league_id, field){
    if (!(field === "games_finished" || field === "games_won" || field === "games_tied" || field === "games_started")){
      return 0;
    }

    let sql = `UPDATE players SET ${field} = (${field} + 1), ts = $ts WHERE publickey = $publickey AND league_id = $league_id`;
    let params = {
      $ts: new Date().getTime() ,
      $publickey: publickey ,
      $league_id: league_id
    }
    await this.app.storage.executeDatabase(sql, params, "league");
    return 1;
  }

  async addEXP(publickey, league_id, points, game_status = null) {

    let sql = `UPDATE players SET score = (score + $points), games_finished = (games_finished + 1), ts = $ts`;
    if (game_status) { sql += `, ${game_status} = (${game_status} + 1)`; }

    sql += ` WHERE publickey = $publickey AND league_id = $league_id`;
    let params = {
      $points : points ,
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
    sql+= ` WHERE publickey = $publickey AND league_id = $league_id`;
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
  async leagueInsert(obj) {

    let sql = `INSERT OR REPLACE INTO leagues (id, game, name, admin, status, description, ranking_algorithm, default_score) 
                    VALUES ( $id, $game, $name, $admin, $status, $description, $ranking_algorithm, $default_score )`;
    let params = {
      $id         :   obj.id ,
      $game       :   obj.game,
      $name       :   obj.name,
      $admin      :   obj.admin,
      $status     :   obj.status,
      $description        :   obj.description,
      $ranking_algorithm  :   obj.ranking_algorithm,
      $default_score      :   obj.default_score,
    };

    await this.app.storage.executeDatabase(sql, params, "league");

    return;
  }


  async gameInsert(obj) {

        let sql = `INSERT OR IGNORE INTO games (league_id, game_id, game, winner, players_array, time_started, time_finished, method) 
                                VALUES ($league_id, $game_id, $game, $winner, $players_array, $time_started, $time_finished, $method)`;
        let params = {
          $league_id: obj.league_id,
          $game_id: obj.game_id,
          $game: obj.game,
          $winner: obj.winner ,
          $players_array: obj.players_array,
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

    let sql = `INSERT OR IGNORE INTO players (league_id, publickey, score, ts) 
                                VALUES ( $league_id, $publickey, $score, $ts)`;
    let params = {
          $league_id: obj.league_id,
          $publickey: obj.publickey,
          $score: obj.score,
          $ts: obj.ts
        };
    await this.app.storage.executeDatabase(sql, params, "league");
	  return;
  }

}

module.exports = League;






