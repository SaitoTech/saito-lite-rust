const ArcadeLeagueView = require("../../../league/lib/overlays/arcade-league-view");


module.exports = RedSquareLeagueSidebar = {
	
	render(app, mod){
		/*
			The associated html template is directly called by the sidebar/game-sidebar components
			but we need this file so we can attach events and not have to write the code in both places.
		*/
	},

	attachEvents(app, mod){
	    document.querySelectorAll(`.rs-league-sidebar-ranking`).forEach((el) =>{
	        el.onclick = function (e) {
	        let league_id = e.currentTarget.getAttribute("id").replace("league_", "");
	        let league_mod = app.modules.returnModule("League");

	        if (league_mod){
				for (let league of league_mod.leagues){
			        if (league.id == league_id){
			          ArcadeLeagueView.render(app, league_mod, league);
			          return;
			        }
				}        	
	        }
	      }
	    });
	},

};
