const RedSquareLeagueTemplate = require("./league.template");

class RedSquareLeague {
	
	constructor(app, mod, selector="") {
	    this.mod = mod;
	    this.selector = selector;
	    app.connection.on("league-update", ()=>{
	    	console.log("Receive League Update");
	    	this.render(app, mod);
	    });

  	}

	render(app, mod, selector="") {

	  if (selector) {
	  	this.selector = selector;
	  }
	  
      let div = document.querySelector(this.selector);
      if (div){
        div.innerHTML = RedSquareLeagueTemplate(app, mod);
        this.attachEvents(app, mod);
      }

	  //app.browser.replaceElementBySelector(RedSquareLeagueTemplate(app, mod, league_mod), this.selector);
	  //this.attachEvents(app, mod);

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

