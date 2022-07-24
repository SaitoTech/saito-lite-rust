const ModTemplate = require('../../lib/templates/modtemplate');
const LeagueMainContainer = require('./lib/main/container');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');

class League extends ModTemplate {

  constructor(app) {
    super(app);

    this.name = "League";
    this.slug = "league";
    this.description = "Leaderboards and leagues for Saito Games";
    this.categories = "Games Entertainment";

    this.games = [];

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


  onPeerHandshakeComplete(app, peer) {

    //
    // TODO -- services -- so we only message peers supporting LeagueDB
    //
    app.modules.returnModule("League").sendPeerDatabaseRequestWithFilter(

      "League" ,

      `SELECT * FROM leagues DESC LIMIT 100` ,

      (res) => {
console.log("RECEIVED LEAGUES!");
	    this.app.connection.emit('league-update', {});

        if (res.rows) {
          res.rows.forEach(row => {

            row.admin = (row.publickey == app.wallet.returnPublicKey()) ? true : false;

	    //
	    // update components
	    //
	    this.app.connection.emit('league-update', row);

            this.leagues.push(row);
          });

          //this.render(app, this);

        } else {
	}
      }

    );

  }



  async onConfirmation(blk, tx, conf, app) {

    let txmsg = tx.returnMessage();

    try {
      if (conf == 0) {
        if (txmsg.request === "create league") {
          this.receiveCreateLeagueTransaction(blk, tx, conf, app);
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
  sendCreateLeagueTransaction(game_id="", type="public") {

    let newtx = this.app.wallet.createUnsignedTransaction();

    newtx.msg = {
      module: 	 "League",
      game: 	 game_id,
      request: 	 "create league",
      type: 	 type,
      timestamp: new Date().getTime()
    };

    this.app.network.propagateTransaction(newtx);

  }
  async receiveCreateLeagueTransaction(blk, tx, conf, app) {

    let txmsg = tx.returnMessage();
    let game  = txmsg.game;
    let type  = txmsg.type;
    let publickey = tx.transaction.from[0].add;

    let sql = `INSERT INTO leagues (
                game,
                type,
                publickey
              ) VALUES (
                $game,
                $type,
                $publickey
              )`;

    let params = {
      $game: game,
      $type: type,
      $publickey: publickey
    };
    await app.storage.executeDatabase(sql, params, "league");
    return;
  }



  sendJoinLeagueTransaction(league_id="") {

    let newtx = this.app.wallet.createUnsignedTransaction();

    newtx.msg = {
      module:    "League",
      league_id: league_id,
      request:   "join league",
      timestamp: new Date().getTime()
    };

    this.app.network.propagateTransaction(newtx);

  }
  async receiveJoinLeagueTransaction(blk, tx, conf, app) {

    let txmsg = tx.returnMessage();
    let league_id  = txmsg.league_id;
    let publickey  = tx.transaction.from[0].add;

    let sql = `INSERT INTO players (
                league_id,
                publickey
              ) VALUES (
                $league_id,
                $publickey
              )`;

    let params = {
      $league_id: league_id,
      $publickey: publickey
    };

    await app.storage.executeDatabase(sql, params, "league");
    return;
  }

}

module.exports = League;

