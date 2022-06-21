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
    this.existingLeaguesDb = [];
    this.header = new SaitoHeader(app);
  }

  initialize(app) {

    super.initialize(app);

    //
    // all games that responds to arcade
    //
    app.modules.getRespondTos("arcade-games").forEach((mod, i) => {
        this.games.push(mod);
    });

    // initalizing container here, constructor of container depends on this.games
    this.main = new LeagueMainContainer(app, this)
  }

  render(app) {
    this.header.render(app, this);
    this.main.render(app, this, "container");
  }

  onPeerHandshakeComplete(app, peer) {

    app.modules.returnModule("League").sendPeerDatabaseRequestWithFilter(
      "League" ,
      `SELECT * FROM leagues desc LIMIT 100` ,
      (res) => {
        if (res.rows) {
            res.rows.forEach(row => {

              row.admin = (row.publickey == app.wallet.returnPublicKey()) ? true : false;
              this.existingLeaguesDb.push(row);
            });

            // render the existing league component
            this.main.render(app, this, "existing_leagues");
          } else {
          console.log('No leagues exists');
        }
      }
    );

  }


  async onConfirmation(blk, tx, conf, app) {

    let txmsg = tx.returnMessage();

    try {
      if (conf == 0) {
        if (txmsg.request == "create_league") {
          this.receiveCreateLeagueTransaction(blk, tx, conf, app);
        }

        if (txmsg.request == "join_league") {
          this.receiveJoinLeagueTransaction(blk, tx, conf, app);
        }
      }
    } catch (err) {
      console.log("ERROR in league onConfirmation: " + err);
    }
  }

  createTransaction(data) {
    try {
        let newtx = this.app.wallet.createUnsignedTransaction();
        newtx.msg = data

        newtx = this.app.wallet.signTransaction(newtx);
        let result = this.app.network.propagateTransaction(newtx);

        return true;
    
    } catch(err){
      console.log('error in create txn', err);
    }
  } 

  async receiveCreateLeagueTransaction(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();
    let game  = txmsg.game;
    let type  = txmsg.type;
    let publickey  = app.wallet.returnPublicKey();

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

  async receiveJoinLeagueTransaction(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();
    let league_id  = txmsg.league_id;
    let publickey  = app.wallet.returnPublicKey();

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

