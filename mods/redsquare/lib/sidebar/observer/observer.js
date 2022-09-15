const RedSquareObserverTemplate = require("./observer.template");
const GameLoader = require("../../../../../lib/saito/new-ui/game-loader/game-loader");

class RedSquareObserver {
	
	constructor(app, mod, selector="") {
	    this.mod = mod;
	    this.selector = selector;
	    this.games = [];   
	    observer_self = this;

	    app.connection.on("observer-add-game-render-request", (games)=>{   
	      observer_self.games = games;
	      observer_self.render(app, mod, ".redsquare-sidebar-observer");
	    });
	    app.connection.on("arcade-game-ready", (slug)=>{
	    	let spinner = new GameLoader(app, mod);
	    	spinner.render(app, mod, "#rs_sidebar_observer", "Game Moves Loaded", slug, "Watch Game");
	    });
  	}

	render(app, mod, selector=""){
		if (this.blockRender) { return; }

		let observer_mod = app.modules.returnModule("Observer");


		if (selector != "") {
			this.selector = selector;  
		}
    
    let div = document.querySelector(this.selector);
    if (div){
      div.innerHTML = RedSquareObserverTemplate(app, mod, observer_mod, this.games);
      this.attachEvents(app, mod);
    }
	
  	//app.browser.replaceElementBySelector(RedSquareObserverTemplate(app, mod, observer_mod, this.games), this.selector);
	    
   // this.attachEvents(app, mod);
	}

	attachEvents(app, mod){
		let widget = this;
        document.querySelectorAll(`.observe-game-btn`)
          .forEach((el, i) => {
            el.onclick = function (e) {
              let game_sig = e.currentTarget.getAttribute("data-sig");
              let spinner = new GameLoader(app, mod);
              widget.blockRender = true;
              spinner.render(app, mod, "#rs_sidebar_observer", "Loading Game Moves");
            
              app.connection.emit("arcade-observer-join-table",game_sig);
            }
        });
	}

};

module.exports = RedSquareObserver;


