const saito = require("./../../lib/saito/saito");
const ModTemplate = require('../../lib/templates/modtemplate');
const LeagueMainContainer = require('./lib/main/container');
const ArcadeLeague = require('./lib/components/arcade-league');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');

class League extends ModTemplate {

  constructor(app) {
    super(app);

    this.name = "League";
    this.slug = "league";
    this.description = "Leaderboards and leagues for Saito Games";
    this.categories = "Arcade Competition";

    this.games = []; //Game Module Respond tos

    //
    // i like simpler names, but /lib contains this.leagues[] as well
    //
    this.leagues = [];

    //
    // used in onPeerHandshakeComplete
    //
    this.services = [{ service : "leagues" , domain : "saito" }];

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

  render(app, mod) {

    super.render(app);

    if (this.header == null) {
      this.header = new SaitoHeader(app);
      this.main = new LeagueMainContainer(app, this)
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
      if (le.myRank > 0 || le.max_players == 0 || le.playerCnt < le.max_players){
        leagues_to_display.push(le);
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

      if (conf == 0) {
        if (txmsg.request === "create league") {
          this.receiveCreateLeagueTransaction(blk, tx, conf, app);
          this.addLeague(tx);
        }

        if (txmsg.request === "join league") {
          this.receiveJoinLeagueTransaction(blk, tx, conf, app);
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
  sendCreateLeagueTransaction(name= "", game="", type="public", ranking, max_players) {

    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    tx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));
    tx.msg = {
      module:  "League",
      request: "create league",
      name:    name,
      game: 	 game,
      type: 	 type,
      ranking: ranking,
      max:     max_players,
    };

    let newtx = this.app.wallet.signTransaction(tx);

    this.app.network.propagateTransaction(newtx);

  }


  async receiveCreateLeagueTransaction(blk, tx, conf, app) {

    console.log("Receive Create Request");
    console.log(tx);
    
    let sender = tx.transaction.from[0].add; 
    console.log("sender: " +sender);
    let txmsg = tx.returnMessage();

    let sql = `INSERT INTO leagues (
                id,
                game,
                type,
                admin,
                league_name,
                description,
                ranking,
                max_players
              ) VALUES (
                $id,
                $game,
                $type,
                $admin,
                $name,
                $description,
                $ranking,
                $max_players
              )`;

    let params = {
      $id: tx.transaction.sig,
      $game: txmsg.game,
      $type: txmsg.type,
      $admin: sender,
      $name: txmsg.name,
      $description: "",
      $ranking: txmsg.ranking,
      $max_players: parseInt(txmsg.max),
    };
    await app.storage.executeDatabase(sql, params, "league");
    return;
  }

  addLeague(tx){
    let sender = tx.transaction.from[0].add; 
    let txmsg = tx.returnMessage();
    let lobj = {
      id: tx.transaction.sig,
      game: txmsg.game,
      type: txmsg.type,
      admin: sender,
      league_name: txmsg.name,
      description: "",
      ranking: txmsg.ranking,
      max_players: parseInt(txmsg.max),
    };
    this.leagues.push(lobj);
    this.renderLeagues(this.app, this);
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

    //Code test
    let f = async() => {
      let x = await this.getLeagueType(league_id);
      console.log(x);
    }
    f();
  }

  /*
   * The tricky thing is we want every player to start with a default number of points depending on the league type 
   */ 
  async receiveJoinLeagueTransaction(blk, tx, conf, app) {

    console.log("Receive Join Request");
    let txmsg = tx.returnMessage();
    let league_id  = txmsg.league_id;
    let publickey  = tx.transaction.from[0].add;
    let base_score = 0; //TODO: getLeagueType and add some logic to change this

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
      $score: 0,
      $timestamp: parseInt(txmsg.timestamp)
    };

    console.log(params);
    await app.storage.executeDatabase(sql, params, "league");
    return;
  }


  /*
  * Some wrapper functions to query individual stats of the league
  */
  async getLeagueType(league_id){
    
    for (let l of this.leagues){
      if (l.league_id == league_id){
        return l.type;
      }
    }
    
    //TODO make fallback code to query the database that actually works

    let row;
    await this.sendPeerDatabaseRequestWithFilter("League", `SELECT * FROM leagues WHERE id = '${league_id}'`, (res) =>{ row = res.rows});

    if (row?.length > 0){
      return row[0].type;
    }
    return null;

  }


  /**
   * 
   */ 
  async updateLeague(league){
    //for (let league of this.leagues){
      let lid = league.id;
      let pid = this.app.wallet.returnPublicKey();
      let now = new Date().getTime();
      league.myRank = -1;
      league.playerCnt = 0;
      if (league.type == "EXP"){
        let cutoff = now - 24*60*60*1000;
        let sql1 = `UPDATE player SET score = (score - 1), ts = ${now} WHERE ts < ${cutoff} AND league_id = '${league.id}'`;
        await app.storage.executeDatabase(sql1, {}, "league");
        let sql2 = `UPDATE player SET score = 0 WHERE score < 0 AND league_id = '${league.id}'`;
        await app.storage.executeDatabase(sql2, {}, "league");
      }

      this.sendPeerDatabaseRequestWithFilter("League" , `SELECT * FROM players WHERE league_id = '${lid}' ORDER BY score DESC` ,

        (res) => {
          if (res.rows) {
            let cnt = 0;
            for (let p of res.rows){
              cnt++; //Count number of players 
              if (p.pkey == pid){
                league.myRank = cnt; //I am the cnt player in the leaderboard
              }
            }
            league.playerCnt = cnt;
          }
        }

      );

   // }
  }

  /**
   * Tell League to also listen to messages from Arcade and every installed game
   * (Overwrites modtemplate function)
   */
  shouldAffixCallbackToModule(modname, tx = null) {

    if (modname == "League") { return 1; }
    //if (modname == "Arcade") { return 1; }

    for (let i = 0; i < this.games.length; i++) {
      if (this.games[i].name == modname) {
        return 1;
      }
    }
    return 0;
  }


}

module.exports = League;

