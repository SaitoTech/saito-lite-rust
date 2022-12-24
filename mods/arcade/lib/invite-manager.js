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
	  //this.list = "open";
	  this.list = "mine";

	  this.invites = {};

	  //
	  // handle requests to re-render invite manager
	  //
	  app.connection.on("arcade-invite-manager-render-request", () => {
console.log("arcade -- invite manager render");
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

          if (!this.mod.games[this.list]) { this.mod.games[this.list] = {}; }
          if (!this.invites[this.list]) {
	    this.invites[this.list] = [];
	  } else {
	    for (let i = 0; i < this.invites[this.list].length; i++) {
	      delete this.invites[this.list][i];
	    }
	    this.invites[this.list] = [];
	  }

console.log("About to render invites...");

	  for (let i = 0; i < this.mod.games[this.list].length; i++) {
console.log("pushing number: " + (i+1));
	    this.invites[this.list].push(new Invite(this.app, this.mod, ".invite-manager", this.mod.games[this.list][i]));
	  }

	  for (let i = 0; i < this.invites[this.list].length; i++) {
console.log("render invite number: " + (i+1));
	    this.invites[this.list][i].render();
	  }

	  this.attachEvents();

	}


	attachEvents() {
	}

}

module.exports = InviteManager;


