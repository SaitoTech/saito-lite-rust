const ArcadeLeaderboardTemplate = require("./arcade-leaderboard.template");

class ArcadeLeaderboard{
	constructor(app, mod) {

	    app.connection.on("league-update", ()=>{
	    	this.render(app, mod);
	    });

  	}

	render(app, mod) {

		if (!document.getElementById("arcade-leaderboard")){
			app.browser.addElementToId(`<div id="arcade-leaderboard" class="saito-sidebar-right"></div>`, "saito-container");
		}
		app.browser.replaceElementById(ArcadeLeaderboardTemplate(app, mod), "arcade-leaderboard");
  		this.attachEvents(app, mod);
	}

	attachEvents(app, mod){
	  if (document.querySelector(".leaderboard-header")){
		  document.querySelector(".leaderboard-header").onclick = function (e) {
		  	e.stopPropagation();
		    let league_id = (mod.viewing_game_homepage == mod.name)? "SAITOLICIOUS" : mod.viewing_game_homepage.toUpperCase(); 
		   	app.connection.emit("view-league-details", league_id);
		  }	
	  }
	  
	}

}

module.exports = ArcadeLeaderboard;