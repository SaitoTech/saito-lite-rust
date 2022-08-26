const saito = require("./../../lib/saito/saito");
const ModTemplate = require('../../lib/templates/modtemplate');
const LeagueMainContainer = require('./lib/main/container');
const ArcadeLeague = require('./lib/components/arcade-league');
const ForumLeague = require('./lib/components/forum-league');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');
const SaitoOverlay = require("../../lib/saito/ui/saito-overlay/saito-overlay");
const LeagueInvite = require("./lib/overlays/league-invite");
const GameCryptoTransferManager = require("./../../lib/saito/ui/game-crypto-transfer-manager/game-crypto-transfer-manager");


class League extends ModTemplate {

  constructor(app) {
    super(app);

    this.name = "League";
    this.slug = "league";
    this.description = "Leaderboards and leagues for Saito Games";
    this.categories = "Arcade Competition";
    this.overlay = null;
    this.games = []; //Game Module Respond tos

    //
    // i like simpler names, but /lib contains this.leagues[] as well
    //
    this.leagues = [];


    //
    // used in onPeerHandshakeComplete
    //
    this.services = [{ service : "league" , domain : "saito" }];

    //
    // UI components
    //
    this.main = null;
    this.header = null;

  }


  initialize(app) {

    super.initialize(app);

    this.loadLeagues();

    app.modules.getRespondTos("arcade-games").forEach((mod, i) => {
        this.games.push(mod);
    });

    if (app.BROWSER == 0){
      app.modules.getRespondTos("default-league").forEach((mod, i) =>{
        this.createLeague(mod);
      });

      this.insertSaitolicious();
      setInterval(this.collectRent, 12*60*60*1000, app);
    }


  }

  /*notifyPeers(app, tx) {
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
        message.request = "league spv update";
        message.data = {};
        message.data.tx = tx;
        app.network.peers[i].sendRequest(message.request, message.data);
      }
    }
  }*/

  //Create Default Leagues
  async createLeague(modObj){

   let sql = `INSERT OR REPLACE INTO leagues (id, game, type, admin, name, description, ranking, starting_score, max_players)
                  VALUES ($id, $game, "public", "saito", $name, $desc, $rank, $start, 0)`;
   
   let params = {
    $id: modObj.module.toUpperCase(),
    $game: modObj.module,
    $name: modObj.name,
    $desc: modObj.desc,
    $rank: modObj.type,
    $start: (modObj.type == "exp") ? 0 : 1500,
   };

   await this.app.storage.executeDatabase(sql, params, "league");

  }

  async insertSaitolicious(){
    let sql = `SELECT * from leagues WHERE id="SAITOLICIOUS"`;
    let rows = await this.app.storage.queryDatabase(sql, {}, "league");
    if (!rows || !rows.length || rows.length == 0){
       let sql2 = `INSERT OR REPLACE INTO leagues (id, game, type, admin, name, description, ranking, starting_score, max_players)
                        VALUES ("SAITOLICIOUS", NULL, "public", "saito", "Saitolicious", "Who is the most Saitolicious Saitozen out there? Earn points for playing games on the Arcade and climb the rankings, but your score will drop if you don't come by regularly.", "exp", 0, 0)`;
       await this.app.storage.executeDatabase(sql2, {}, "league");
    }
  }

  async collectRent(app){

    let now = new Date().getTime();
    let cutoff = now - 24*60*60*1000;
    let params = {
      $now: now,
      $cutoff: cutoff,
    }
    let sql = `UPDATE players SET score = (score - 1), ts = $now WHERE score > 0 AND ts < $cutoff AND league_id = 'SAITOLICIOUS'`;
    await app.storage.executeDatabase(sql, params, "league");

  }


  render(app, mod) {

    super.render(app);

    if (this.header == null) {
      this.header = new SaitoHeader(app);
      this.main = new LeagueMainContainer(app, this)
    }

    if (this.overlay == null) {
      this.overlay = new SaitoOverlay(app);
    }

    this.header.render(app, this);
    this.main.render(app, this);

  }

  filterLeagues(app){
    let leagues_to_display = [];
    //filter leagues to display
    for (let le of this.leagues){
      if (le.type == "public"){
        //Only show public leagues if there are available slots or I am a member
        if (le.myRank > 0 || le.max_players == 0 || le.playerCnt < le.max_players){
          leagues_to_display.push(le);
        }
      }else{
        //Only show private leagues if I am a member or I am the admin
        if (le.myRank > 0 || le.admin == app.wallet.returnPublicKey()){
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
      return b.myRank - a.myRank
    });
    return leagues_to_display;
  }

  /**
    Create the html for an arcade-style list of my leagues and open leagues,
    inserted into elem
  */
  renderArcade(app, mod, elem){
    if (!this.doICare()) { return; }
    //console.log("Rendering Leagues for Arcade");
    let leagues_to_display = this.filterLeagues(app);

    for (let le of leagues_to_display){
      if (le.admin === "saito"){
        let altElm = document.getElementById(`forum-topic-${le.id.toLowerCase()}`);
        let al = new ForumLeague(app, this, le);
        al.render(app, this, altElm);
      }

      if (le.myRank > 0 || le.admin !== "saito"){
        let al = new ArcadeLeague(app, this, le);
        al.render(app, this, elem);
      }
    }
  }

  renderLeagues(app, mod){
    if (this.app.BROWSER == 0){return;}

    if (this.browser_active){
      this.main.render(app, this);
    }else{
      let arcade = app.modules.returnModule("Arcade");
      if (arcade && arcade.browser_active){
        let elem = document.querySelector("#league-hero");
        if (elem){
          elem.innerHTML = "";
          this.renderArcade(app, arcade, elem);  
        }
      }else{
        let redsquare = app.modules.returnModule("RedSquare");
        if (redsquare && redsquare.browser_active){
          console.log("Leagues telling Redsquare to Render");
          redsquare.render(app);
        }
      }
    }
  }

  resetLeagues(){
    this.leagues = [];
  }

  doICare(){
    if (this.app.BROWSER == 0){
      return false;
    }
    if (this.browser_active){
      return true;
    }
    let am = this.app.modules.returnActiveModule().name;

    if (am == "Arcade" || am == "RedSquare"){
      return true;
    }
    return false;
  }

  //Lite clients only
  onPeerHandshakeComplete(app, peer) {
    if (app.BROWSER == 0){ return; }
    
    let league_self = this;

    //If following an invite link, look for the game_id in question
    let invitation = this.browser_active && this.app.browser.returnURLParameter("jid");
    if (invitation) {
      salert("Trying to join league...");
    }


    //Only query the leagues if we are in an active module that will need them
    if (!this.doICare()){
      return;
    }

    this.sendPeerDatabaseRequestWithFilter(
      "League" ,
      `SELECT * FROM leagues DESC LIMIT 100` ,
      (res) => {

        league_self.resetLeagues();

        if (res.rows) {
          res.rows.forEach(row => {
            let stopHere = invitation && row.id === league_self.app.browser.returnURLParameter("jid");
            league_self.updateLeague(row, stopHere);
            league_self.leagues.push(row);
          });

        } 
      }
    );
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
          //Perform db ops
          this.receiveCreateLeagueTransaction(blk, tx, conf, app);
          //Update saito-lite, refresh UI
          if (this.doICare()){
            console.log("Receive League Create Request");
            this.addLeague(tx);
          } 
        }

        if (txmsg.request === "join league") {
          //Perform db ops
          this.receiveJoinLeagueTransaction(blk, tx, conf, app);
          //Update saito-lite, refresh UI
          if (this.doICare()){
            console.log("Receive League Join Request");
            this.addPlayer(tx);  
          }
          
        }

        if (txmsg.request === "remove league") {
          //Perform db ops
          this.receiveDisbandLeagueTransaction(blk, tx, conf, app);
          //Update saito-lite, refresh UI
          if (this.doICare()){
            console.log("Receive League Removal Request");
            this.removeLeague(txmsg.request.league);  
          }
          
        }

        if (txmsg.request === "quit league") {
          //Perform db ops
          this.receiveQuitLeagueTransaction(blk, tx, conf, app);
          //Update saito-lite, refresh UI
          if (this.doICare()){
            console.log("Receive Quit Request");
            this.removePlayer(tx);  
          }
        }        

        //Listen for gameovers
        if (txmsg.request === "gameover"){
          this.receiveGameOverTransaction(blk, tx, conf, app);
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

  /*async handlePeerRequest(app, message, peer, mycallback = null) {
    //
    // this code doubles onConfirmation
    //

    if (message.request === "league spv update") {
      let tx = null;

      if (!message.data.tx) {
        if (message.data.transaction) {
          tx = new saito.default.transaction(message.data.transaction);
        }
      }

      if (tx == null) {
        tx = new saito.default.transaction(message.data.tx.transaction);
      }

      if (app.BROWSER){
        console.log("Handling Peer Request");
        this.onConfirmation(null, tx, 0, app);
      }
    }
  }*/


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

    //Short circuit transaction to immediately process
    this.addLeague(newtx);
  }


  async receiveCreateLeagueTransaction(blk, tx, conf, app) {
    if (this.app.BROWSER) { return; }

    let league = Object.assign({id: tx.transaction.sig}, tx.returnMessage().league);
    let params = {};
    for (let i in league){
      params[`$${i}`] = league[i];
    }
    //console.log(league);
    //console.log(params);

    let sql = `INSERT INTO leagues (id, game, type, admin, name, description, ranking, starting_score, max_players, options, startdate, enddate, allowlate)
                        VALUES ($id, $game, $type, $admin, $name, $description, $ranking, $starting_score, $max_players, $options, $startdate, $enddate, $allowlate)`;

    await app.storage.executeDatabase(sql, params, "league");
    return;
  }

  addLeague(tx){
    let txmsg = tx.returnMessage();
    let lobj = txmsg.league;
    lobj.id = tx.transaction.sig;

    this.updateLeague(lobj);
    let newLeague = true;

    for (let i = 0; i < this.leagues.length; i++){
      if (lobj.id == this.leagues[i].id){
        newLeague = false;
      }
    }
    if (newLeague){
      this.leagues.push(lobj);      
    }

    //setTimeout(()=>{
    //  this.renderLeagues(this.app, this);
    //},1000);
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
   // setTimeout(()=>{
   //   this.renderLeagues(this.app, this);
   // },1000); 
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

  sendJoinLeagueTransaction(league_id="") {

    let newtx = this.app.wallet.createUnsignedTransaction();

    newtx.msg = {
      module:    "League",
      league_id: league_id,
      request:   "join league",
      timestamp: new Date().getTime()
    };

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
    let publickey  = tx.transaction.from[0].add;

    let base_score = await this.getLeagueData(league_id, "starting_score");
    
    let sql = `INSERT INTO players (
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
      $league_id: league_id,
      $publickey: publickey,
      $score: base_score,
      $timestamp: parseInt(txmsg.timestamp)
    };

    await app.storage.executeDatabase(sql, params, "league");
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
  }

  sendDisbandLeagueTransaction(league_id){
    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    tx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));
    tx.msg = {
      module:  "League",
      request: "remove league",
      league:    league_id,
    };

    let newtx = this.app.wallet.signTransaction(tx);

    this.app.network.propagateTransaction(newtx);

    //Short circuit transaction to immediately process
    this.removeLeague(newtx);
  }


  async receiveDisbandLeagueTransaction(blk, tx, conf, app){
    if (this.app.BROWSER) { return; }

    let txmsg = tx.returnMessage();

    let params = {
      $league : txmsg.league
    }

    let sql1 = `DELETE FROM leagues WHERE id=$league`;
    await this.app.storage.executeDatabase(sql1, params, "league");

    let sql2 = `DELETE FROM players WHERE id=$league`;
    await this.app.storage.executeDatabase(sql2, params, "league");
  }


  async receiveAcceptTransaction(blk, tx, conf, app){
    if (this.app.BROWSER) { return; }

    let txmsg = tx.returnMessage();
    let game = txmsg.module;

    //Which leagues may this gameover affect?
    let sql = `SELECT * FROM leagues WHERE game = ? OR id='SAITOLICIOUS'`;
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

  /* Let's try this function as a service node only */
  async receiveGameOverTransaction(blk, tx, conf, app){
    if (app.BROWSER == 1) { return; }
    
    //console.log("League Receive Gameover");
    
    let txmsg = tx.returnMessage();
    let game = txmsg.module;

    //All games have a grace window where if a player "quits" within X moves
    //it won't count as a win or loss for anyone
    if (txmsg.reason == "cancellation" || txmsg.reason == "arcadeclose"){
      return;
    }

    //Which leagues may this gameover affect?
    let sql = `SELECT * FROM leagues WHERE game = ? OR id='SAITOLICIOUS'`;
    const relevantLeagues = await app.storage.queryDatabase(sql, [game], "league");


    //Who are all the players in the game?
    let publickeys = [];
    for (let i = 0; i < tx.transaction.to.length; i++) {
      if (!publickeys.includes(tx.transaction.to[i].add)) {
        publickeys.push(tx.transaction.to[i].add);
      }
    }

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

      let row = await this.app.storage.queryDatabase(`SELECT * FROM leagues WHERE id = ?`, [league_id], "league");

      if (row?.length > 0){
        return row[0][data_field];
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
    league.playerCnt = 0;
    let league_self = this;
    league.players = [];
    league.top3 = [];
    this.sendPeerDatabaseRequestWithFilter("League" , `SELECT * FROM players WHERE league_id = '${lid}' ORDER BY score DESC, games_won DESC, games_tied DESC, games_finished DESC` ,

      async (res) => {
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
        league_self.renderLeagues(league_self.app, league_self);
      }

    );

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
    return 1;
  }


  showShareLink(league_id, mod){
    let data = {};

    //Add more information about the game
    let league = null;
    this.leagues.forEach((g) => {
      if (g.id === league_id) {
        league = g;
      }
    });

    if (!league){
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
      inviteLink = inviteLink.replace("#", "&jid=" + league_id);
    } else {
      inviteLink = inviteLink.replace("#", "?jid=" + league_id);
    }
      
    LeagueInvite.render(this.app, mod, league, inviteLink);
  }


  /**
   * Wrapper function to help us launch a League specific game!
   */ 
  async launchGame(league){

    let arcade_mod = this.app.modules.returnModule("Arcade");


    //We automatically create a game invite with the league's pre-determined options
    if (league.options){
      let options = JSON.parse(league.options);

      //Check Crypto
      try{
        if (options.crypto && parseFloat(options.stake) > 0) {
          let crypto_transfer_manager = new GameCryptoTransferManager(this.app);
          let success = await crypto_transfer_manager.confirmBalance(this.app, this, options.crypto, options.stake);
          if (!success){ return; }
        }
      }catch(err){
         console.log("ERROR checking crypto: " + err);
        return;
      }

      //Check League Membership
      if (!this.isLeagueMember(league.id)){
        salert("You need to be a member of the League to create a League-only game invite");
        return;
      }

      let gamemod = this.app.modules.returnModule(league.game);
      let players_needed = 0;
      if (options["game-wizard-players-select"]) {
        players_needed = options["game-wizard-players-select"];
      } else {
        //players_needed = document.querySelector(".game-wizard-players-no-select").dataset.player;
      }

      options.league = league.id;

      let gamedata = {
        ts: new Date().getTime(),
        name: gamemod.name,
        slug: gamemod.returnSlug(),
        options: options,
        players_needed: players_needed,
        invitation_type: "public",
      };

      let newtx = arcade_mod.createOpenTransaction(gamedata);
      this.app.network.propagateTransaction(newtx);
  
      //
      // and relay open if exists
      //
      let peers = [];
      for (let i = 0; i < this.app.network.peers.length; i++) {
        peers.push(this.app.network.peers[i].returnPublicKey());
      }
      let relay_mod = this.app.modules.returnModule("Relay");
      if (relay_mod != null) {
        relay_mod.sendRelayMessage(peers, "arcade spv update", newtx);
      }
  
      arcade_mod.addGameToOpenList(newtx);

      arcade_mod.active_tab = "arcade";
      arcade_mod.renderArcadeMain(this.app, arcade_mod);


    }else{  //Or we let the player select the options

      let tx = new saito.default.transaction();
      tx.msg.game = league.game;
      if (league.admin !== "saito"){
        tx.msg.league = league.id;
      }
      ArcadeGameDetails.render(this.app, arcade_mod, tx);
      ArcadeGameDetails.attachEvents(this.app, arcade_mod, tx);
    }
  }


  /**
   * Tell League to also listen to messages from Arcade and every installed game
   * (Overwrites modtemplate function)
   */
  shouldAffixCallbackToModule(modname, tx = null) {

    if (modname == "League") { return 1; }
    if (modname == "Arcade") { return 1; }

    for (let i = 0; i < this.games.length; i++) {
      if (this.games[i].modname == modname) {
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

