const Invite = require("./invite");
const InviteManagerTemplate = require("./invite-manager.template");
const JSON = require('json-bigint');
const ArcadeInitializer = require("./main/initializer");
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');

class InviteManager {

	constructor(app, mod, container="") {

		this.app = app;
		this.mod = mod;
		this.container = container;
		this.name = "InviteManager";
		this.type = "short";

		//For filtering which games get displayed
		this.list = "all";
		//For categeorizing types of game invites
		this.lists = ["mine","open"];

		this.loader_overlay = new SaitoOverlay(app, mod, false, true);

		//
		// handle requests to re-render invite manager
		//
		this.app.connection.on("arcade-invite-manager-render-request", () => {
		    if (!this.mod.is_game_initializing) {
		  		this.render();
			}
		});

		app.connection.on("arcade-game-initialize-render-request", (game_id) => {
			if (this.mod.browser_active == 1) { // dont add overlay if arcade
			  return; 
			} else {
			  this.loader_overlay.hide();	  	
			  this.loader_overlay.show('<div class="arcade_game_overlay_loader"></div>');
			  let game_loader = new ArcadeInitializer(app, mod, ".arcade_game_overlay_loader");
			  game_loader.render(game_id);	
			}
		});

	}


	render() {

        //
        // replace element or insert into page (deletes invites for a full refresh)
 	    //
		if (document.querySelector(".invite-manager")) {
		  	this.app.browser.replaceElementBySelector(InviteManagerTemplate(this.app, this.mod), ".invite-manager");
		} else {
	 		this.app.browser.addElementToSelectorOrDom(InviteManagerTemplate(this.app, this.mod), this.container);
	 	}

	    for (let list of this.lists) {
	    	if (this.list === "all" || this.list === list) {

            	if (!this.mod.games[list]) { this.mod.games[list] = []; }

		      	if (this.invites[list].length > 0) {
	    	        if (list === "mine") { this.app.browser.addElementToSelector(`<h5>My Games</h5>`, ".invite-manager"); }
	    	        if (list === "open") { this.app.browser.addElementToSelector(`<h5>Open Invites</h5>`, ".invite-manager"); }
		      	}

		        for (let i = 0; i < this.mod.games[list].length; i++) {
		        	let newInvite = new Invite(this.app, this.mod, ".invite-manager", this.mod.games[list][i]);
		        	newInvite.render();
		      	}
		    }
	  	}

	}


}

module.exports = InviteManager;


