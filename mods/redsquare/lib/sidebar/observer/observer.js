const RedSquareObserverTemplate = require("./observer.template");
const SaitoModuleOverlay = require("../../../../../lib/saito/new-ui/saito-module-overlay/saito-module-overlay");
const GameLoader = require("../../../../../lib/saito/new-ui/game-loader/game-loader");

class RedSquareObserver {
	
	constructor(app, mod, selector="") {
		  this.app = app;
	    this.mod = mod;
	    this.selector = selector;

	    app.connection.on("observer-add-game-render-request", (games)=>{   
	      this.render(app, mod, ".redsquare-sidebar-observer");
	    });
	    
  	}

	render(app, mod, selector=""){
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

        let game_id = e.currentTarget.getAttribute("data-id");
        let game_cmd = e.currentTarget.getAttribute("data-cmd");

        let saito_mod_details_overlay = new SaitoModuleOverlay(app, mod);

        saito_mod_details_overlay.render(app, app.modules.returnModule("Observer"), game_id, game_cmd);

      }
    }); 
	}

};

module.exports = RedSquareObserver;


