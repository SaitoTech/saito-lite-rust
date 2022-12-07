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


  initialize(app) {

    super.initialize(app);

    //
    // create initial leagues
    //
    this.app.modules.returnModulesRespondingTo("arcade-games").forEach((mod) => {
      this.addLeague(
	app.crypto.hash(mod.returnName()) ,	// id
	mod.returnName() , 			// name
	0 					// rank
      );
    });
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
  //   id   	: $LEAGUE_ID ,
  //   name 	: $LEAGUE_NAME ,
  //   rank 	: $MY_RANK_IN_LEAGUE ,
  //   players 	: [player_array] ,
  //   games 	: [games_array] ,
  // }
  //
  addLeague(league_id, name, rank) {
    let league_idx = -1;
    for (let i = 0; i < this.leagues.length; i++) {
      if (this.leagues[i].id === league_id) {
	league_idx = i;
	break;
      }
    }
    if (league_idx == -1) {
      this.leagues.push({
	id	:	league_id ,
	name	:	name ,
	rank	:	rank ,
	players :	[] ,
	games	:	[] ,
      });
    } else {
      this.app.connection.emit("league-add-league", (this.leagues[league_idx]));
    }
  }


  async onPeerHandshakeComplete(app, peer) {

    //    
    // fetch any leagues    
    //    
    this.sendPeerDatabaseRequestWithFilter(
	
	"League" , 

	`SELECT * FROM leagues` ,

	(res) => {
console.log("RECEIVED LEAGUES: ");
console.log(JSON.stringify(res));	  
	}

    );

  }




















}

module.exports = League;

