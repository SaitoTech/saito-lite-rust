const ArcadeLeagueTemplate = require("./arcade-league.template");

class ArcadeLeague{
	constructor(app, mod) {
		this.app = app;

		app.connection.on("league-update", ()=>{
			this.render(app, mod);
		})
	}

	render(app, mod){
		app.browser.replaceElementById(ArcadeLeagueTemplate(app, mod), "arcade-leagues");
		this.attachEvents(app, mod);
	}

	attachEvents(app, mod){
		let leaguePage = document.getElementById("goto-league-page");
		if (leaguePage){
			leaguePage.onclick = (e) =>{
				window.location = "/league";
			}
		}

		Array.from(document.querySelectorAll(".league-button")).forEach(btn =>{
			btn.onclick = (e) =>{
				e.stopPropagation();
				let cmd = e.currentTarget.getAttribute("data-cmd");
				let league_id = e.currentTarget.getAttribute("data-id");

		        if (cmd == "view"){
    	    	  app.connection.emit("view-league-details", league_id);
        		}
        		if (cmd == "join"){
        		  app.connection.emit("join-league", league_id);
        		  salert('Joining League... it may take a moment to update info');
        		}
        		if (cmd == "play"){
				  app.connection.emit("start-league-game", league_id);
        		}
			}
		});
	}
}

module.exports = ArcadeLeague;
