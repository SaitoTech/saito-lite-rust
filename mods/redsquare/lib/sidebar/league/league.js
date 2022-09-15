const RedSquareLeagueTemplate = require("./league.template");

class RedSquareLeague {
	
	constructor(app, mod, selector="") {
	    this.mod = mod;
	    this.selector = selector;
	    app.connection.on("league-update", ()=>{
	    	this.render(app, mod);
	    });

  	}

	render(app, mod, selector="") {

	  let league_mod = app.modules.returnModule("League");
	  if (selector != "") {
	    app.browser.addElementToSelector(RedSquareLeagueTemplate(app, mod, league_mod), selector);
	  } else {
	    app.browser.addElementToSelector(RedSquareLeagueTemplate(app, mod, league_mod), this.selector);
	  }
	  this.attachEvents(app, mod);

	}

	attachEvents(app, mod){
	  document.querySelectorAll(`.rs-league-sidebar-ranking`).forEach((el) =>{
	    el.onclick = function (e) {
	      let league_id = e.currentTarget.getAttribute("id").replace("league_", "");
	      let league_mod = app.modules.returnModule("League");

	      if (league_mod){
		for (let league of league_mod.leagues){
		  if (league.id == league_id){
		    league_mod.respondTo("view-league-details").render(app, league_mod, league);
		    return;
		  }
		}       	
	      }
	    }
	  });
	}

};

module.exports = RedSquareLeague;

