const saito = require("./../../lib/saito/saito");
const ModTemplate = require('../../lib/templates/modtemplate');
const LeagueRankings = require("./lib/rankings");
const LeagueLeaderboard = require("./lib/leaderboard");
const LeagueMain = require('./lib/main');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');
const SaitoOverlay = require('../../lib/saito/ui/saito-overlay/saito-overlay');
const InvitationLink = require("./lib/overlays/league-invitation-link");
const LeagueWizard = require('./lib/components/league-wizard');
const JoinLeagueOverlay = require('./lib/overlays/join-league');

class League extends ModTemplate {

  constructor(app) {
    super(app);

    this.name = "League";
    this.slug = "league";
    this.description = "Leaderboards and leagues for Saito Games";
    this.categories = "Arcade Competition";
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
    super.initialize(app);

    //
    // create initial leagues
    //
    this.app.modules.returnModulesRespondingTo("arcade-games").forEach((mod) => {
       this.addLeague({
        	id     : app.crypto.hash(mod.returnName()) ,	// id
		default: 1,					// default league
    	   	name   : mod.returnName() , 			// name - name of league
    	   	game   : mod.returnName() , 			// game - name of game mod
    	 	rank   : 0 					// rank
       });
    });
    league_self = this;
    app.connection.on("league-update", ()=>{
      if (this.browser_active){
        
        league_self.renderArcadeTab(app, league_self);
        
      }
    });

    this.league_wizard = new LeagueWizard(this.app, this, null);
  }

  returnLeague(league_id) {
    for (let i = 0; i < this.leagues.length; i++) {
console.log("comparing: " + this.leagues[i].id + " - " + league_id);
      if (this.leagues[i].id === league_id) { return this.leagues[i]; }
    }
    return null;
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


  /**
    Create the html for an arcade-style list of my leagues and open leagues,
    inserted into elem
  */
  renderArcadeTab(app, mod){
    if (!app.BROWSER) { return; }

    let tab = document.getElementById("league-hero");

    if (tab){
      tab.innerHTML = "";

      let leagues_to_display = this.filterLeagues(app);
      for (let le of leagues_to_display){
        if (le.admin === "saito"){
          let altElm = document.getElementById(`forum-topic-${le.id.toLowerCase()}`);
          let al = new ForumLeague(app, this, le);
          al.render(app, this, altElm);
        }

        if (le.myRank > 0 || le.admin !== "saito"){
          let al = new ArcadeLeague(app, this, le);
          al.render(app, this, tab);
        }
      }
    }else{
      //Probably on initialization screen
      //console.error("League cannot render in Arcade");
    }
  }

  renderLeagues(app, mod){
    if (this.app.BROWSER == 0){return;}

    if (this.browser_active){
      this.main.render(app, this);
    } else {
      app.connection.emit("league-update", {});
    }
  }

  resetLeagues(){
    this.leagues = [];
    this.leagueCount = 0;
  }

  //
  // the league is an array of objects with the following structure
  //
  // {
  //   id   	: $LEAGUE_ID ,
  //   default  : 0 , 
  //   name 	: $LEAGUE_NAME ,
  //   rank 	: $MY_RANK_IN_LEAGUE ,
  //   players 	: [player_array] ,
  //   games 	: [games_array] ,
  // }
  //
  addLeague(obj) {

    //
    // default values
    //
    if (!obj)                   { return; }
    if (!obj.name)              { obj.name = "Unknown"; }
    if (!obj.rank)              { obj.rank = 0; }
    if (!obj.players)           { obj.players = []; }
    if (!obj.games)             { obj.games = []; }
    if (!obj.mod)               { obj.mod = this.app.modules.returnModuleByName(obj.name); }
    if (!obj.default)		{ obj.default = 0; }
    if (!obj.module && obj.mod) { obj.module = obj.mod.name; }


    let league_idx = -1;
    for (let i = 0; i < this.leagues.length; i++) {
      if (this.leagues[i].id === obj.id) {
       	league_idx = i;
       	break;
      }
    }

    if (league_idx == -1) {
      this.leagues.push(obj);
      league_idx = this.leagues.length-1;
      this.app.connection.emit("league-add-league", (this.leagues[league_idx]));
    }

  }


  async onPeerHandshakeComplete(app, peer) {

    let league_self = this;

    //    
    // fetch any leagues    
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
      }
    );

  }

  filterLeagues(app, include_default = true){
    let leagues_to_display = [];
    //filter leagues to display
    for (let le of this.leagues){
      if (!include_default && le.admin === "saito"){
        continue;
      }
      if (le.admin == app.wallet.returnPublicKey() || le.myRank > 0){
        leagues_to_display.push(le);
      }else if (le.type == "public"){
        //Only show public leagues if there are available slots or I am a member
        if (le.max_players == 0 || le?.playerCnt < le.max_players){
          leagues_to_display.push(le);
        }
      }
    }

    //sort leagues
    leagues_to_display.sort((a, b) =>{
      if (a.id === "SAITOLICIOUS") { return -1};
      if (b.id === "SAITOLICIOUS") { return 1};
      if (a.myRank < 0) {return 1;}
      if (b.myRank < 0) {return -1;}
      return a.myRank - b.myRank
    });
    return leagues_to_display;
  }

  async onConfirmation(blk, tx, conf, app) {

    try {
      let txmsg = tx.returnMessage();

      if (conf == 0) {
      //if (app.BROWSER == 0 && txmsg.module == "League") {
      //  console.log("SERVER NOTIFY PEERS");
      //    this.notifyPeers(app, tx);
      //}

        if (txmsg.request === "create league") {
          this.receiveCreateLeagueTransaction(blk, tx, conf, app);
        }

        if (txmsg.request === "join league") {
          //Perform db ops
          this.receiveJoinLeagueTransaction(blk, tx, conf, app);
          //Update saito-lite, refresh UI
          if (app.BROWSER){
            console.log("Receive League Join Request");
            this.addPlayer(tx);
          }

        }

        if (txmsg.request === "remove league") {
          //Perform db ops
          this.receiveDisbandLeagueTransaction(blk, tx, conf, app);
          //Update saito-lite, refresh UI
          if (app.BROWSER){
            console.log("Receive League Removal Request");
            this.removeLeague(txmsg.request.league);
          }

        }

        if (txmsg.request === "quit league") {
          //Perform db ops
          this.receiveQuitLeagueTransaction(blk, tx, conf, app);
          //Update saito-lite, refresh UI
          if (app.BROWSER){
            console.log("Receive Quit Request");
            this.removePlayer(tx);
          }
        }

        //Listen for gameovers
        if (txmsg.request === "gameover"){
          this.processUpdateTransaction(app, txmsg, true);
        }

        if (txmsg.request === "roundover"){
          console.log("On Confirm Receive Round Over TX");
          this.processUpdateTransaction(app, txmsg, false);
        }

        //Keep track of how many games a player starts
        if (txmsg.request === "accept" || txmsg.request === "launch singleplayer"){
          //console.log("On Confirm Receive Game Accept TX");
          this.receiveAcceptTransaction(blk, tx, conf, app);
        }
      }


    } catch (err) {
      console.log("ERROR in league onConfirmation: " + err);
    }
  }


  //
  // TODO -- consistency in variable names -- game_id not game in DB etc.
  // -- game should be game_module, i imagine
  //
  sendCreateLeagueTransaction(leagueObj = null) {
    if (leagueObj == null){
      return;
    }

    console.log(leagueObj);

    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    tx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));
    tx.msg = {
      module:  "League",
      request: "create league",
      league:    leagueObj,
    };

    let newtx = this.app.wallet.signTransaction(tx);

    this.app.network.propagateTransaction(newtx);

    //
    // and immediately process !
    //
    this.addLeague(tx.msg);
  }


  async receiveCreateLeagueTransaction(blk, tx, conf, app) {

    //
    // extract league from tx
    //
    let league = Object.assign({id: tx.transaction.sig}, tx.returnMessage().league);

    //
    // add league
    //
    //this.addLeague(league);

    let sql = `INSERT INTO league (id, game, type, admin, name, description, ranking, starting_score, max_players, options, startdate, enddate, allowlate)
                        VALUES ($id, $game, $type, $admin, $name, $description, $ranking, $starting_score, $max_players, $options, $startdate, $enddate, $allowlate)`;
    let params = {};
    for (let i in league){ params[`$${i}`] = league[i]; }
    await app.storage.executeDatabase(sql, params, "league");
    return;

  }


  removeLeague(league_id){
    if (!league_id){return;}

    for (let i = this.leagues.length-1; i>=0; i--){
      if (this.leagues[i].id === league_id){
        this.leagues.splice(i,1);
      }
    }
    this.renderLeagues(this.app, this);
  }

  addPlayer(tx){
    let txmsg = tx.returnMessage();
    for (let league of this.leagues){
      if (txmsg.league_id == league.id){
        this.updateLeague(league);
      }
    }
   setTimeout(()=>{
     this.renderLeagues(this.app, this);
   },1000);
  }

  removePlayer(tx){
    let txmsg = tx.returnMessage();
    for (let league of this.leagues){
      if (txmsg.league_id == league.id){
        this.updateLeague(league);
      }
    }
   // setTimeout(()=>{
   //   this.renderLeagues(this.app, this);
   // },1000);

  }

  createPingTX(recipients){
    let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    for (let player of recipients){
      newtx.transaction.to.push(new saito.default.slip(player, 0.0));
    }

    newtx.msg = {
      module:    "League",
      request:   "ping",
      ts: new Date().getTime()
    };

    newtx = this.app.wallet.signTransaction(newtx);

    return newtx;
  }


  sendJoinLeagueTransaction(league_id="", data = null) {

    let newtx = this.app.wallet.createUnsignedTransaction();

    let tx_obj = {
      module:    "League",
      league_id: league_id,
      request:   "join league",
      timestamp: new Date().getTime()
    };

    if (data != null && typeof data == "object"){
      tx_obj = Object.assign(tx_obj, data);
    }

    newtx.msg = tx_obj;

    newtx = this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);
    setTimeout(()=>{
      this.addPlayer(newtx);
    },1500);

  }

  async receiveJoinLeagueTransaction(blk, tx, conf, app) {
    if (this.app.BROWSER) { return; }

    let txmsg = tx.returnMessage();
    let league_id  = txmsg.league_id;
    let email = txmsg.email;
    let publickey  = tx.transaction.from[0].add;

    let base_score = await this.getLeagueData(league_id, "starting_score");

    let sql = `INSERT INTO players (
                league_id,
                pkey,
                score,
		email,
                ts
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

    await app.storage.executeDatabase(sql, params, "league");
    
    this.app.connection.emit("league-rankings-render-request");
    return;
  }

  sendQuitLeagueTransaction(pkey, league_id){
    let newtx = this.app.wallet.createUnsignedTransaction();

    newtx.msg = {
      module:    "League",
      league_id: league_id,
      player_key: pkey,
      request:   "quit league",
      timestamp: new Date().getTime()
    };

    newtx = this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);

    setTimeout(()=>{
      this.removePlayer(newtx);
    },2500);

  }

  async receiveQuitLeagueTransaction(blk, tx, conf, app){
    if (this.app.BROWSER) { return; }

    let txmsg = tx.returnMessage();

    let params = {
      $league : txmsg.league_id,
      $player: txmsg.player_key,
    }

    let sql = `DELETE FROM players WHERE league_id=$league AND pkey=$player`;
    await this.app.storage.executeDatabase(sql, params, "league");
    this.app.connection.emit("league-rankings-render-request");
  }

  sendDisbandLeagueTransaction(league_id){
    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    tx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));
    tx.msg = {
      module:  "League",
      request: "remove league",
      league:   league_id,
    };

    let newtx = this.app.wallet.signTransaction(tx);

    this.app.network.propagateTransaction(newtx);

    //Short circuit transaction to immediately process
    this.removeLeague(newtx);
  }


  async receiveDisbandLeagueTransaction(blk, tx, conf, app){
    if (this.app.BROWSER) { return; }

    let txmsg = tx.returnMessage();

    let sql1 = `DELETE FROM league WHERE id='${txmsg.league}'`;
    await this.app.storage.executeDatabase(sql1, {}, "league");
    console.log(sql1);
    let sql2 = `DELETE FROM players WHERE league_id='${txmsg.league}'`;
    await this.app.storage.executeDatabase(sql2, {}, "league");
    console.log(sql2);
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
      }else{
        for (let player of publickeys){
          await this.autoJoinPublicLeague(player, leag);
        }
      }
      this.countGameStart(publickeys, leag);

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

  async isELOeligible(players, league){
    if (players.length < 2){
      console.log(`This game will not be ELO rated because there are not at least 2 players`);
      return false;
    }

    let sql2 = `SELECT * FROM players WHERE league_id = ? AND pkey IN (`;
    for (let pk of players){
       sql2 += `'${pk}', `;
    }
    sql2 = sql2.substr(0, sql2.length - 2);
    sql2 += `)`;

    let playerStats = await this.app.storage.queryDatabase(sql2, [league.id], "league");

    if (playerStats.length !== players.length){
      console.log(`This game will not be rated because not all the players are League members: ${league.id}`);
      console.log(playerStats);
      console.log(players);
      return false;
    }
    return playerStats;
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

  //Our native ELO system
  calculateK(playerObj){
    if (playerObj?.games_finished < 30 && playerObj?.score < 2300){
      return 40;
    }
    if (playerObj?.score < 2400){
      return 20;
    }
    return 10;
  }

  /*
  * Some wrapper functions to query individual stats of the league
  */
  async getLeagueData(league_id, data_field = null){
    if (!data_field){return null;}

    if (this.app.BROWSER == 1){
      for (let l of this.leagues){
        if (l.id == league_id){
          return l[data_field];
        }
      }
    }else{

      let row = await this.app.storage.queryDatabase(`SELECT * FROM league WHERE id = ?`, [league_id], "league");

      if (row?.length > 0){
        return row[0][data_field];
      }
    }
    return null;
  }


  /*
  *  Get league data from league id
  */
  async getAllLeagueData(league_id){

    if (!league_id){ return null;}

    if (this.app.BROWSER == 1){
      for (let l of this.leagues){
        if (l.id == league_id){
          return l;
        }
      }
    } else{

      let row = await this.app.storage.queryDatabase(`SELECT * FROM league WHERE id = ?`, [league_id], "league");
      if (row?.length > 0){
        return row[0];
      }
    }
    return null;
  }


  /**
   *
   */
  updateLeague(league, invitation = false){
    let lid = league.id;
    let pid = this.app.wallet.returnPublicKey();
    league.myRank = -1;
    let league_self = this;
    league.players = [];
    league.top3 = [];
    this.sendPeerDatabaseRequestWithFilter("League" , `SELECT * FROM players WHERE league_id = '${lid}' ORDER BY score DESC, games_won DESC, games_tied DESC, games_finished DESC` ,

      async (res) => {
        //A little trick to use league.playerCnt == undefined to flag that the database query hasn't come back yet
        league.playerCnt = 0;
        //Keep track of the number of updated leagues
        league_self.leagueCount++;

        if (res.rows) {
          let cnt = 0;
          for (let p of res.rows){
            league.players.push(p.pkey); //Keep a list of who is in each league
            cnt++; //Count number of players
            if (p.pkey == pid){
              league.myRank = cnt; //I am the cnt player in the leaderboard
            }
            if (cnt <= 3){
              league.top3.push(p.pkey);
            }
          }
          league.playerCnt = cnt;
        }

        if (invitation){
          let myLocation = window.location.href;
          myLocation = myLocation.substring(0, myLocation.indexOf("?")-1);
          myLocation = myLocation.replace("league","arcade");

          if (league.myRank < 0){
            if (league_self.checkDate(league.startdate) || league.allowlate){
              if (league.playerCnt < league.max_players || league.max_players == 0){
                league_self.sendJoinLeagueTransaction(lid);
                setTimeout(()=>{ window.location = myLocation; },1500);
              }else{
                if (document.getElementById("alert-wrapper")) {
                  document.getElementById("alert-wrapper").remove();
                }
                let c = await sconfirm("League full, cannot join");
                window.location = myLocation;
              }
            }else{
              let c = await sconfirm("We are past the signup phase for the league");
              window.location = myLocation;
            }
          }else{
            let c = await sconfirm("You are already a member of the league");
          }
        }

        //console.log(`League updated: ${league.myRank} / ${league.playerCnt}`);
        if (league_self.leagueCount >= league_self.leagues.length){
          league_self.renderLeagues(league_self.app, league_self);
        }


        this.app.connection.emit("league-rankings-render-request");

      });

  }


  async countGameStart(players, league){
    let now = new Date().getTime();
    let sql = `UPDATE players SET games_started = (games_started + 1), ts = $ts WHERE pkey IN (`;
    for (let pk of players){
       sql += `'${pk}', `;
    }
    sql = sql.substr(0, sql.length - 2);
    sql += `) AND league_id = $lid`;

    let params = {
      $ts: now,
      $lid: league.id
    }
    console.log(sql);
    console.log(params);
    await this.app.storage.executeDatabase(sql, params, "league");
    return 1;
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


  showShareLink(league_id){

    let data = {};

    //Add more information about the game
    let league = this.leagues.find((g) => g.id === league_id);

    if (league){
      data.game = league.name;
    }else{
      console.log("League not found!");
      return;
    }

    //Create invite link from the game_sig
    let inviteLink = window.location.href;
    if (inviteLink.includes("arcade")){
      inviteLink = inviteLink.replace("arcade", "league");
    }
    if (!inviteLink.includes("#")) {
      inviteLink += "#";
    }
    if (inviteLink.includes("?")) {
      inviteLink = inviteLink.replace("#", "&league_join_league=" + league_id);
    } else {
      inviteLink = inviteLink.replace("#", "?league_join_league=" + league_id);
    }

    inviteLink += "&game=";
    inviteLink += league.game;

    let linkModal = new InvitationLink(this.app, this, inviteLink);
    linkModal.render();
  }


  /**
   * Wrapper function to help us launch a League specific game!
   */
  async createLeagueGame(league){

    let arcade_mod = this.app.modules.returnModule("Arcade");
    if (!arcade_mod) { return; }

    console.log(JSON.parse(JSON.stringify(league)));

    //Check League Membership
    if (!this.isLeagueMember(league.id)){
      alert("You need to be a member of the League to create a League-only game invite");
      return;
    }

    let options = (league.options) ? JSON.parse(league.options) : null;

    //Get options if needed through the normal interface
    if (!options){
      let tx = new saito.default.transaction();
      tx.msg.game = league.game;
      if (league.admin !== "saito"){
        tx.msg.league = league.id;
      }
      arcade_mod.createGameWizard(league.game, tx);
      return;
    }

    //Check options
    let c = await arcade_mod.verifyOptions("public", options);
    if (!c){
      return;
    }

    options.league = league.id;
    options.game = league.game;

    //Create invite
    arcade_mod.makeGameInvite(options, "public");

  }


  async createLeagueChallenge(league, player_id){
    /*
    let arcade_mod = this.app.modules.returnModule("Arcade");
    if (!arcade_mod) { return; }
    //Check League Membership
    if (!this.isLeagueMember(league.id)){
      alert("You need to be a member of the League to create a League-only game invite");
      return;
    }
    let options = (league.options) ? JSON.parse(league.options) : null;
    //Get options if needed
    if (!options){
      let selector = new GameOptionsSelect(this.app);
      options = await selector.selectGameOptions(this.app, this.app.modules.returnModule(league.game));
    }
    console.log(JSON.parse(JSON.stringify(options)));
    if (options["game-wizard-players-select"] != 2){
      alert("You can only challenge head-to-head");
      return;
    }
    //Check options
    let c = await arcade_mod.verifyOptions("public", options);
    if (!c){
      return;
    }
    options.league = league.id;
    options.game = league.game;
    //Issue Challenge
    let challenge_overlay = new SaitoOverlay(this.app);
    let players = [this.app.wallet.returnPublicKey(), player_id];
    this.app.connection.emit("arcade-issue-challenge", {
      game: league.game,
      players: players,
      options: options
    });
    challenge_overlay.show(ChallengeIssuedTemplate());
    timeout = setTimeout(async ()=>{
      alert("It seems your opponent isn't available.");
      challenge_overlay.remove();
    }, 30000);
    this.app.connection.on("arcade-reject-challenge", (game_id)=>{
      clearTimeout(timeout);
      challenge_overlay.show(ChallengeRejectedTemplate());
    });
    this.app.connection.on("arcade-game-loading" , () =>{
      clearTimeout(timeout);
      challenge_overlay.show(ChallengeAcceptedTemplate());
    });
  */
  }

  /**
   * Tell League to also listen to messages from Arcade and every installed game
   * (Overwrites modtemplate function)
   */
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

  //API Function
  isLeagueMember(league_id){
    for (let leag of this.leagues){
      if (leag.id == league_id){
        if (leag.myRank > 0){
          return true;
        }else{
          return false;
        }
      }
    }
    return false;
  }


  loadLeagues() {

//    if (this.app.options.leagues) {
//      this.leagues = this.app.options.leagues;
//      return;
//    }

    //
    // set default values
    //
//    this.leagues = {};

  }

  saveLeagues() {
//      this.app.options.leagues = this.leagues;
//      this.app.options.saveOptions();
  }


  checkDate(date_as_string, after = false){
    if (date_as_string == ""){
      return true;
    }

    let now = new Date().getTime();
    let cutoff = Date.parse(date_as_string);
    if (after){
      return cutoff > now;
    }else{
      return now < cutoff;
    }
  }

}

module.exports = League;

