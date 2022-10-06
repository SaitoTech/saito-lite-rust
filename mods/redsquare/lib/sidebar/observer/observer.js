const RedSquareObserverTemplate = require("./observer.template");
const SaitoModuleOverlay = require("../../../../../lib/saito/new-ui/saito-module-overlay/saito-module-overlay");
const GameLoader = require("../../../../../lib/saito/new-ui/game-loader/game-loader");

class RedSquareObserver {
	
	constructor(app, mod, selector="") {
		  this.app = app;
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
		let widget = this;
		Array.from(document.querySelectorAll('.saito-module-action.watch')).forEach(game => {
      game.onclick = (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        let game_id = e.currentTarget.getAttribute("data-id");
        let game_cmd = e.currentTarget.getAttribute("data-cmd");

        let arcade_mod = app.modules.returnModule("Arcade");  
        if (arcade_mod) {
          for (let i = 0; i < arcade_mod.games.length; i++) {
            if (arcade_mod.games[i].transaction.sig == game_id){
              let saito_mod_detials_overlay = new SaitoModuleOverlay(this.app, this.mod);
              saito_mod_detials_overlay.action = game_cmd;
              saito_mod_detials_overlay.render(this.app, this.mod, arcade_mod.games[i]);
          	}
          }    
        }
      }
    }); 
	}

};

module.exports = RedSquareObserver;


