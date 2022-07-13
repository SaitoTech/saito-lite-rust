const saito = require("./../../lib/saito/saito");
const ModTemplate = require('../../lib/templates/modtemplate');
const LeagueMainContainer = require('./lib/main/container');
const ArcadeLeague = require('./lib/components/arcade-league');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');
const SaitoOverlay = require("../../lib/saito/ui/saito-overlay/saito-overlay");

const Elo = require('elo-rank');

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

    //this.games.push({modname: "Saitolicious", img: "/saito/img/background.png"});

    app.modules.getRespondTos("arcade-games").forEach((mod, i) => {
        this.games.push(mod);
    });

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

  /**
    Create the html for an arcade-style list of my leagues and open leagues,
    inserted into elem
  */
  renderArcade(app, mod, elem){
    console.log("Rendering Leagues for Arcade");
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
      if (a.myRank < 0) {return 1;}
      if (b.myRank < 0) {return -1;}
      return b.myRank - a.myRank
    });

    for (let le of leagues_to_display){
      let al = new ArcadeLeague(app, this, le);
      al.render(app, this, elem);
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
      }
    }
  }

  resetLeagues(){
    this.leagues = [];
  }

  onPeerHandshakeComplete(app, peer) {
    let league_self = this;
    //
    // TODO -- services -- so we only message peers supporting LeagueDB
    //
    this.sendPeerDatabaseRequestWithFilter(

      "League" ,

      `SELECT * FROM leagues DESC LIMIT 100` ,

      (res) => {
      
  	    //app.connection.emit('league-update', {});
        league_self.resetLeagues();

        if (res.rows) {
          res.rows.forEach(row => {

      	    //
      	    // update components
      	    //
      	    //app.connection.emit('league-update', row);

            console.log(row);
            league_self.updateLeague(row);
            league_self.leagues.push(row);
          });
          
          //We need a small delay because we are running async callbacks and can't just use an await...
          setTimeout(()=>{
            league_self.renderLeagues(app, league_self);
          },1000);
        } else {}
      }

    );

  }



  async onConfirmation(blk, tx, conf, app) {

    try {
      let txmsg = tx.returnMessage();
      console.log("LEAGUE ON-chain: "+txmsg.request + ` (${conf})`);

      if (conf == 0) {
      //if (app.BROWSER == 0 && txmsg.module == "League") {
      //  console.log("SERVER NOTIFY PEERS");
      //    this.notifyPeers(app, tx);
      //}

        if (txmsg.request === "create league") {
          //Perform db ops
          this.receiveCreateLeagueTransaction(blk, tx, conf, app);
          //Update saito-lite, refresh UI
          this.addLeague(tx); 
        }

        if (txmsg.request === "join league") {
          //Perform db ops
          this.receiveJoinLeagueTransaction(blk, tx, conf, app);
          //Update saito-lite, refresh UI
          this.addPlayer(tx);
        }
      
        if (txmsg.request === "gameover"){
          this.receiveGameOverTransaction(blk, tx, conf, app);
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

    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    tx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));
    tx.msg = {
      module:  "League",
      request: "create league",
      league:    leagueObj,
    };

    let newtx = this.app.wallet.signTransaction(tx);

    this.app.network.propagateTransaction(newtx);

  }


  async receiveCreateLeagueTransaction(blk, tx, conf, app) {
    if (this.app.BROWSER) { return; }

    console.log("Receive Create Request");
    console.log(tx);
    
    let league = Object.assign({id: tx.transaction.sig}, tx.returnMessage().league);
    let params = {};
    for (let i in league){
      params[`$${i}`] = league[i];
    }
    console.log(league);
    console.log(params);

    let sql = `INSERT INTO leagues (id, game, type, admin, name, description, ranking, starting_score, max_players)
                        VALUES ($id, $game, $type, $admin, $name, $description, $ranking, $starting_score, $max_players)`;

    await app.storage.executeDatabase(sql, params, "league");
    return;
  }

  addLeague(tx){
    let txmsg = tx.returnMessage();
    let lobj = txmsg.league;
    lobj.id = tx.transaction.sig;

    this.updateLeague(lobj);
    this.leagues.push(lobj);
    setTimeout(()=>{
      this.renderLeagues(this.app, this);
    },1000);
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

  }

  /*
   * The tricky thing is we want every player to start with a default number of points depending on the league type 
   */ 
  async receiveJoinLeagueTransaction(blk, tx, conf, app) {
    if (this.app.BROWSER) { return; }

    console.log("Receive Join Request");
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

  /* Let's try this function as a service node only */
  async receiveGameOverTransaction(blk, tx, conf, app){
    if (this.app.BROWSER == 1) { return; }
    console.log("League Receive Gameover");
    let txmsg = tx.returnMessage();
    let game = txmsg.module;

    //Which leagues may this gameover affect?
    let sql = `SELECT * FROM leagues WHERE game = ?`;
    const relevantLeagues = await this.app.storage.queryDatabase(sql, [game], "league");

    console.log(relevantLeagues);

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

    var elo = new Elo(15);

    //Let's check each league
    for (let leag of relevantLeagues){
      if (leag.ranking == "elo"){
        //All players must belong to ELO league for points to change
        if (publickeys.length != 2){
          console.log(`This game will not be ELO rated because there are not 2 players`);
          return;
        }

        if (Array.isArray(txmsg.winner) || txmsg.reason == "tie"){
          console.log("This game will not be rated because we haven't implemented ELO for ties or multiple winners yet");
          return;
        }  

        let sql2 = `SELECT * FROM players WHERE league_id = ? AND pkey IN (`;
        for (let pk of publickeys){
          sql2 += `'${pk}', `;
        }
        sql2 = sql2.substr(0, sql2.length - 2);
        sql2 += `)`;
        console.log(sql2);

        let playerStats = await this.app.storage.queryDatabase(sql2, [leag.id], "league");
        console.log(playerStats);

        if (playerStats.length !== publickeys.length){
          console.log(`This game will not be rated because not all the players are League members: ${leag.id}`);
          return;
        }
        
        let winner, loser;
        for (let player of playerStats){
          if (player.pkey == txmsg.winner){
            winner = player;
          }else{
            loser = player;
          }
        }

        console.log(winner, loser);
        winner.elo = elo.getExpected(winner.score, loser.score);
        loser.elo = elo.getExpected(loser.score, winner.score);
        winner.score = elo.updateRating(winner.elo, 1, winner.score);
        loser.score = elo.updateRating(loser.elo, 0, loser.score);
        await this.updatePlayerScore(winner, "games_won");
        await this.updatePlayerScore(loser);
        
      }else if (leag.ranking == "exp"){
        //Winner(s) get 5 points, true ties get 3 pts, losers get 1 pt
        //as long as player is in the league

        if (Array.isArray(txmsg.winner)){
          let numPoints = (txmsg.reason == "tie") ? 3: 4;
          let gamekey = (txmsg.reason == "tie") ? "games_tied" : "games_won";

          for (let i = publickeys.length-1; i>=0; i--){
            if (txmsg.winner.includes(publickeys[i])){
              await this.incrementPlayer(publickeys[i], leag.id, numPoints, gamekey);
              publickeys.splice(i,1);
            }
          }
        }else{
          for (let i = publickeys.length-1; i>=0; i--){
            if (txmsg.winner == publickeys[i]){
              await this.incrementPlayer(publickeys[i], leag.id, 5, "games_won");
              publickeys.splice(i,1);
            }
          }
        }
        //Everyone left gets a point for playing
        for (let i = 0; i < publickeys.length; i++){
          await this.incrementPlayer(publickeys[i], leag.id, 1);
        }
      }else{
        //No idea what to do here, but should call a function of the game module/game engine
      }
    }
    
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
  async updateLeague(league){
    let lid = league.id;
    let pid = this.app.wallet.returnPublicKey();
    let now = new Date().getTime();
    league.myRank = -1;
    league.playerCnt = 0;
    if (league.ranking == "exp"){
      let cutoff = now - 24*60*60*1000;
      let sql1 = `UPDATE players SET score = (score - 1), ts = ${now} WHERE ts < ${cutoff} AND league_id = '${league.id}'`;
      await this.app.storage.executeDatabase(sql1, {}, "league");
      let sql2 = `UPDATE players SET score = 0 WHERE score < 0 AND league_id = '${league.id}'`;
      await this.app.storage.executeDatabase(sql2, {}, "league");
    }
    league.players = [];
    this.sendPeerDatabaseRequestWithFilter("League" , `SELECT * FROM players WHERE league_id = '${lid}' ORDER BY score DESC` ,

      (res) => {
        if (res.rows) {
          let cnt = 0;
          for (let p of res.rows){
            league.players.push(p.pkey); //Keep a list of who is in each league
            cnt++; //Count number of players 
            if (p.pkey == pid){
              league.myRank = cnt; //I am the cnt player in the leaderboard
            }
          }
          league.playerCnt = cnt;
        }
      }

    );

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


}

module.exports = League;

