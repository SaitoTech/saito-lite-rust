const Invite = require("./invite");
const InviteManagerTemplate = require("./invite-manager.template");
const JSON = require('json-bigint');

class InviteManager {

	constructor(app, mod, container="") {

	  this.app = app;
	  this.mod = mod;
	  this.container = container;
	  this.name = "InviteManager";
	  this.type = "short";
	  this.list = "all";

	  this.lists = ["mine","open"];

	  this.invites = {};

	  //
	  // handle requests to re-render invite manager
	  //
	  app.connection.on("arcade-invite-manager-render-request", () => {
	    this.render();
	  });

	}


	render() {

          //
          // replace element or insert into page
 	  //
	  if (document.querySelector(".invite-manager")) {
	    this.app.browser.replaceElementBySelector(InviteManagerTemplate(this.app, this.mod), ".invite-manager");
	  } else {
 	    this.app.browser.addElementToSelectorOrDom(InviteManagerTemplate(this.app, this.mod), this.container);
 	  }

	  for (let z = 0; z < this.lists.length; z++) {
	    if (this.list === "all" || this.list === this.lists[z]) {

	      let list = this.lists[z];

              if (!this.mod.games[list]) { this.mod.games[list] = {}; }
              if (!this.invites[list]) {
	        this.invites[list] = [];
	      } else {
	        for (let i = 0; i < this.invites[list].length; i++) {
	          delete this.invites[list][i];
	        }
	        this.invites[list] = [];
	      }

	      for (let i = 0; i < this.mod.games[list].length; i++) {
	        this.invites[list].push(new Invite(this.app, this.mod, ".invite-manager", this.mod.games[list][i]));
	      }

	      if (this.invites[list].length > 0) {
    	        if (list === "mine") { this.app.browser.addElementToSelector(`<h6 class="arcade-players-needed">My Games:</h6>`, ".invite-manager"); }
    	        if (list === "open") { this.app.browser.addElementToSelector(`<h6 class="arcade-players-needed">Open Invites:</h6>`, ".invite-manager"); }
	      }

	      for (let i = 0; i < this.invites[list].length; i++) {
	        this.invites[list][i].render();
	      }
	    }
	  }


	  this.attachEvents();

	}


	attachEvents() {
	}

}

module.exports = InviteManager;


