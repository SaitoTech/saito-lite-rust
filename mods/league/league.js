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
    this.main.render(app, this);
  }

  onPeerHandshakeComplete(app, peer) {

    app.modules.returnModule("League").sendPeerDatabaseRequestWithFilter(
      "League" ,
      `SELECT * FROM leagues desc LIMIT 100` ,
      (res) => {
        if (res.rows) {
            res.rows.forEach(row => {

              console.log('row from database');
              console.log(row);

              // let player = "other";
              // if (row.publickey == app.wallet.returnPublicKey()) { player = "me"; }
              // let player_identifier = app.keys.returnIdentifierByPublicKey(row.publickey, true);
              // if (app.crypto.isPublicKey(player_identifier)) { this.identifiers_to_fetch.push(player_identifier); }

              // leaderboard_self.rankings[row.module].push({
              //   "address": row.publickey ,
              //   "publickey": app.keys.returnIdentifierByPublicKey(row.publickey, true),
              //   "player": player,
              //   "games": row.games,
              //   "ranking": row.ranking,
              // });

            });
          } else {
          console.log('No leagues exists');
        }
      }
    );

  }


  async onConfirmation(blk, tx, conf, app) {

    let txmsg = tx.returnMessage();
    
    console.log('inside onConfirmation');
    console.log(txmsg);

    try {
      if (conf == 0) {
        if (txmsg.request == "create_league") {
          this.receiveTransaction(blk, tx, conf, app);
        }
        if (txmsg.request == "create_ranked_game") {
          this.receiveTransaction(blk, tx, conf, app);
        }
        if (txmsg.request == "create_player_join") {
          this.receiveTransaction(blk, tx, conf, app);
        }
      }
    } catch (err) {
      console.log("ERROR in league onConfirmation: " + err);
    }
  }

  createTransaction(data) {
    try {
        let newtx = this.app.wallet.createUnsignedTransaction();

        newtx.msg = {
            module: "League",
            game: data.game,
            request: "create_league",
            type: data.type, // private or public
            timestamp: new Date().getTime()
        };

        newtx = this.app.wallet.signTransaction(newtx);
        let result = this.app.network.propagateTransaction(newtx);

        return true;
    
    } catch(err){
      console.log('error in create txn', err);
    }
  } 

  async receiveTransaction(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();
    let game  = txmsg.game;
    let type  = txmsg.type;

    let sql = `INSERT INTO leagues (
                game,
                type
              ) VALUES (
                $game,
                $type
              )`;

    let params = {
      $game: game,
      $type: type
    };
    await app.storage.executeDatabase(sql, params, "league");
    console.log('league created');
    return;
  }

}

module.exports = League;

