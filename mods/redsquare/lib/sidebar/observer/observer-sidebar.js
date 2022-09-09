const RedSquareObserverSidebarTemplate = require("./observer-sidebar.template");

class RedSquareObserverSidebar {
	
	constructor(app, mod, selector="") {
	    this.mod = mod;
	    this.selector = selector;
	    this.games = [];   
  	}

	render(app, mod, selector=""){
		let observer_mod = app.modules.returnModule("Observer");

		if (selector != "") {
	      app.browser.addElementToSelector(RedSquareObserverSidebarTemplate(app, mod, observer_mod, this.games), selector);
	    } else {
	      app.browser.addElementToSelector(RedSquareObserverSidebarTemplate(app, mod, observer_mod, this.games), this.selector);
	    }

	    this.attachEvents(app, mod);
	}

	attachEvents(app, mod){
	    
	}

};

module.exports = RedSquareObserverSidebar;


