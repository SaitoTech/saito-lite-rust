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
    this.main = new LeagueMainContainer(app, this);

  }

  initialize(app) {

    super.initialize(app);

    //
    // all games that responds to arcade
    //
    app.modules.getRespondTos("arcade-games").forEach((mod, i) => {
        this.games.push(mod);
    });
  }

  render(app) {
    this.header.render(app, this);
    this.main.render(app, this);
  }


  async onConfirmation(blk, tx, conf, app) {

    let txmsg = tx.returnMessage();
    
    try {
      if (conf == 0) {
        if (txmsg.request == "create_league") {
          this.receiveMatchTransaction(blk, tx, conf, app);
        }
        if (txmsg.request == "create_ranked_game") {
          this.receiveMatchTransaction(blk, tx, conf, app);
        }
        if (txmsg.request == "create_player_join") {
          this.receiveMatchTransaction(blk, tx, conf, app);
        }
        if (txmsg.request == "create_league") {
          this.receiveMatchTransaction(blk, tx, conf, app);
        }
        if (txmsg.request == "create_league") {
          this.receiveMatchTransaction(blk, tx, conf, app);
        }
      }
    } catch (err) {
      console.log("ERROR in league onConfirmation: " + err);
    }
  }

  createMatchTransaction(data) {
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

  async receiveMatchTransaction(blk, tx, conf, app) {
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
    return;
  }

}

module.exports = League;

