const RedSquareObserverTemplate = require("./observer.template");

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
  	}

	render(app, mod, selector=""){
		let observer_mod = app.modules.returnModule("Observer");

		if (selector != "") {
		  document.querySelector(selector).innerHTML = "";
	      app.browser.addElementToSelector(RedSquareObserverTemplate(app, mod, observer_mod, this.games), selector);
	    } else {
	      document.querySelector(this.selector).innerHTML = "";
	      app.browser.addElementToSelector(RedSquareObserverTemplate(app, mod, observer_mod, this.games), this.selector);
	    }

	    this.attachEvents(app, mod);
	}

	attachEvents(app, mod){
	    
	}

};

module.exports = RedSquareObserver;


