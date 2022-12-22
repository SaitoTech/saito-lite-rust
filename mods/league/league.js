const saito = require("./../../lib/saito/saito");
const ModTemplate = require('../../lib/templates/modtemplate');
const LeagueRankings = require("./lib/rankings");
const LeagueLeaderboard = require("./lib/leaderboard");
const LeagueMain = require('./lib/main');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');

class League extends ModTemplate {

  constructor(app) {
    super(app);

    this.name = "League";
    this.slug = "league";
    this.description = "Leaderboards and leagues for Saito Games";
    this.categories = "Arcade Competition";
    this.overlay = null;

    this.styles = ['/saito/saitox.css','/league/style.css'];

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

  render(app, mod) {

    this.main = new LeagueMain(app, this)
    this.header = new SaitoHeader(app, this);
    this.addComponent(this.main);
    this.addComponent(this.header);

    super.render(app, this);
  }

  canRenderInto(qs) {
    if (qs == ".redsquare-sidebar") {
      return true;
    }
    if (qs == ".arcade-leagues") {
      return true;
    }
    return false;
  }
  
  renderInto(qs) {
    if (qs == ".redsquare-sidebar") {
      if (!this.renderIntos[qs]) {
        this.renderIntos[qs] = [];
        this.renderIntos[qs].push(new LeagueRankings(this.app, this, qs));
      }
      this.attachStyleSheets();
      this.renderIntos[qs].forEach((comp) => { comp.render(); });
    }
    if (qs == ".arcade-leagues") {
      if (!this.renderIntos[qs]) {
        this.renderIntos[qs] = [];
        this.renderIntos[qs].push(new LeagueRankings(this.app, this, qs));
      }
      this.attachStyleSheets();
      this.renderIntos[qs].forEach((comp) => { comp.render(); });
    }
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

  filterLeagues(app, include_default = true){
    let leagues_to_display = [];
    //filter leagues to display
    for (let le of this.leagues){
      if (!include_default && le.admin === "saito"){
        continue;
      }
      if (le.admin == app.wallet.returnPublicKey() || le.myRank > 0){
        leagues_to_display.push(le);
      }else if (le.type == "public"){
        //Only show public leagues if there are available slots or I am a member
        if (le.max_players == 0 || le?.playerCnt < le.max_players){
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
      return a.myRank - b.myRank
    });
    return leagues_to_display;
  }

}

module.exports = League;

