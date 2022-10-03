const RedSquareObserverTemplate = require("./observer.template");
const GameLoader = require("../../../../../lib/saito/new-ui/game-loader/game-loader");

class RedSquareObserver {
	
	constructor(app, mod, selector="") {
	    this.mod = mod;
	    this.selector = selector;
	    this.blockRender = false;

	    app.connection.on("observer-add-game-render-request", (games)=>{   
	      this.render(app, mod, ".redsquare-sidebar-observer");
	    });
	    app.connection.on("arcade-game-ready-observer", (game_id)=>{
	    	let spinner = new GameLoader(app, mod, game_id);
	    	spinner.render(app, mod, "#rs-sidebar-observer", "Game Moves Loaded", "Watch Game");
	    });
  	}

	render(app, mod, selector=""){
		if (this.blockRender) { return; }

		if (selector != "") {
			this.selector = selector;  
		}
    
    let div = document.querySelector(this.selector);
    
    if (div){
      div.innerHTML = RedSquareObserverTemplate(app, mod);
      this.attachEvents(app, mod);
    }
	
	}

	attachEvents(app, mod){
	}

};

module.exports = RedSquareObserver;


