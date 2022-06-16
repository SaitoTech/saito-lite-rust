const ModTemplate = require('../../lib/templates/modtemplate');
const LeagueMain = require('./lib/main/league-main');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');

class League extends ModTemplate {

  constructor(app) {
    super(app);

    this.name = "League";
    this.slug = "league";
    this.description = "Leaderboards and leagues for Saito Games";
    this.categories = "Games Entertainment";

    this.leagues = {};
    this.games = [];
    this.header = new SaitoHeader(app);
    this.main = new LeagueMain(app, this);
  }

  initialize(app) {
    super.initialize(app);

    // get all game modules that responds to arcade
    app.modules.getRespondTos("arcade-games").forEach((mod, i) => {
        this.games.push(mod);
    });
  }

  render(app) {
    this.header.render(app, this);
    this.main.render(app, this);
  }

  createLeagueTransaction(data) {
    try {
      if (this.app.BROWSER === 0) {
          let newtx = this.app.wallet.createUnsignedTransaction();

          newtx.msg = {
              module: "League",
              game: data.game,
              request: "create_league",
              players: data.players,
              type: data.type, // private or public
              timestamp: new Date().getTime()
          };

          newtx = this.app.wallet.signTransaction(newtx);
          this.app.network.propagateTransaction(newtx);

          return true;
      }
    } catch(err){
      console.log('error in create txn', err);
    }
  } 

}

module.exports = League;

