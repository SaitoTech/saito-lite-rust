const MetaLeaderboardTemplate = require("./meta-leaderboard.template");

class MetaLeaderboard {
	
	constructor(app, mod) {
	    app.connection.on("league-update", ()=>{
	    	this.render(app, mod);
	    });

  	}

	render(app, mod) {
	  
 		if (!document.getElementById("arcade-leaderboard")){
			app.browser.addElementToId(`<div id="arcade-leaderboard" class="saito-sidebar-right"></div>`, "saito-container");
		}
		app.browser.replaceElementById(MetaLeaderboardTemplate(app, mod), "arcade-leaderboard");
		this.attachEvents(app, mod);
	}

	attachEvents(app, mod){
	  document.querySelectorAll(`.rs-league-sidebar-ranking`).forEach((el) =>{
	    el.onclick = function (e) {
	      let league_id = e.currentTarget.getAttribute("id").replace("league_", "");
	      app.connection.emit("view-league-details", league_id);
	      }
	  });
	}

};

module.exports = MetaLeaderboard;
