const ArcadeLeagueTemplate = require("./league.template");

class ArcadeLeague {
	
	constructor(app, mod, selector="") {
	    this.mod = mod;
	    this.selector = selector;

	    app.connection.on("league-update", ()=>{
	    	this.render(app, mod);
	    });

  	}

	render(app, mod, selector="") {

	  if (selector) {
	  	this.selector = selector;
	  }
	  
    let div = document.querySelector(this.selector);
    if (div){
      div.innerHTML = ArcadeLeagueTemplate(app, mod);
      this.attachEvents(app, mod);
    }
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

module.exports = ArcadeLeague;
