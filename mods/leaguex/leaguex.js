const saito = require("./../../lib/saito/saito");
const ModTemplate = require('../../lib/templates/modtemplate');
const LeagueRankings = require("./lib/rankings");
const LeagueLeaderboard = require("./lib/leaderboard");


class League extends ModTemplate {

  constructor(app) {
    super(app);

    this.name = "League";
    this.slug = "league";
    this.description = "Leaderboards and leagues for Saito Games";
    this.categories = "Arcade Competition";
    this.overlay = null;
    this.games = []; //Game Module Respond tos

    this.styles = ['/league/style.css'];

    //
    // i like simpler names, but /lib contains this.leagues[] as well
    //
    this.leagues = [];
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


  respondTo(type){
    if (type == "rankings") {
      super.render(); // styles and scripts
      let r = new LeagueRankings(this.app, this);
      return r;
    }
    if (type == "leaderboard") {
      super.render(); // styles and scripts
      let r = new LeagueLeaderboard(this.app, this);
      return r;
    }
    return super.respondTo(type);
  }

  //
  // the league is an array of objects with the following structure
  //
  // {
  //   id   : $LEAGUE_ID ,
  //   name : $LEAGUE_NAME ,
  //   rank : $MY_RANK_IN_LEAGUE ,
  // }
  //
  // we auto-create it based on the games that are installed and then
  // modify it based on the contents of our wallet so that it also 
  // reflects private leagues.
  //
  returnLeagues() {
    let leagues = [];
    this.app.modules.returnModulesRespondingTo("arcade-games").forEach((mod) => {
        leagues.push({ 
	  id   : this.app.crypto.hash(mod.returnName()),
	  name : mod.returnName() , 
	  rank : "" 
	});
    });
    return leagues;
  }






























  initialize(app) {

    super.initialize(app);

  }

}

module.exports = League;

