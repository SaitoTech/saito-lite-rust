const LeagueRankingsTemplate = require("./rankings.template");

class LeagueRankings {
	
  constructor(app, mod, container="") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.listening = 0;
  }

  render(app, mod, selector="") {


    if (this.listening == 0) {
      app.connection.on("league-update", ()=>{
console.log("LEAGUE UPDATE HERE");
    	this.render(app, mod, selector);
      });
      this.listening = 1;
    }
console.log("redering with selector: " + this.selector); 

    app.browser.replaceElementBySelector(LeagueLeaderboardTemplate(app, mod), this.selector);
console.log(" 2 redering with selector: " + this.selector); 
    this.attachEvents(app, mod);
console.log(" 3 redering with selector: " + this.selector); 
 
//   let div = document.querySelector(this.selector);
//    if (div) {
console.log("UPDATE INNERHTML WITH TEMPLATE");
//      div.innerHTML = LeagueLeaderboardTemplate(app, mod);
//    }

  }

  attachEvents(app, mod){
    document.querySelectorAll(`.league-leaderboard-ranking`).forEach((el) =>{
	    el.onclick = function (e) {
alert("CLICK");
//	      let league_id = e.currentTarget.getAttribute("id").replace("league_", "");
//	      app.connection.emit("view-league-details", league_id);
	      }
    });
  }
};

module.exports = LeagueLeaderboard;

