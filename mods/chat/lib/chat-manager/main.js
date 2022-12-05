const ChatPopup = require("./popup");
const ChatManagerTemplate = require("./main.template");
const SaitoUserGroup = require('./../../../../lib/saito/new-ui/templates/saito-user-group.template');
const JSON = require('json-bigint');

class ChatManager {

	constructor(app, mod, container="") {

	  this.app = app;
	  this.mod = mod;
	  this.container = container;
	  this.name = "ChatManager";

	  //
	  // some apps may want chat manager quietly in background
	  //
	  this.rendered = 0;
	  this.render_manager_to_screen = 1;
	  this.render_popups_to_screen = 1;

	  //
	  // track popups
	  //
	  this.popups = {};

	  //
	  // handle requests to re-render chat manager
	  //
	  app.connection.on("chat-manager-render-request", () => {
	    if (this.render_manager_to_screen) {
	      this.render();
	    }
	  });

	  //
	  // handle requests to re-render chat popups
	  //
	  app.connection.on("chat-popup-render-request", (group) => {
	    if (this.render_popups_to_screen) {
	      if (!this.popups[group.id]) {
console.log("CREATING CHAT POPUP and SETTING GROUP");
		this.popups[group.id] = new ChatPopup(this.app, this.mod, "");
		this.popups[group.id].group = group;
console.log("DONE INTO RENDER");
	      }
	      this.popups[group.id].render();
console.log("DONE RENDER");
	    }
          });

	}


	render() {

console.log("we are being asked to render CHAT MANAGER!");

	  //
	  // some applications do not want chat-manager appearing (games!)
	  //
	  if (this.render_manager_to_screen == 0) { return; }

console.log("WHAT ARE OUR GROUPS: " + JSON.stringify(this.mod.groups));

          //
          // replace element or insert into page
     	  //
    	  if (document.querySelector(".chat-manager")) {
    	    this.app.browser.replaceElementBySelector(ChatManagerTemplate(this.app, this.mod), ".chat-manager");
    	  } else {
   	    this.app.browser.addElementToSelectorOrDom(ChatManagerTemplate(this.app, this.mod), this.container);
   	  }

	  //
	  // render community chat
	  //


	  //
	  // render chat groups
	  //
	  for (let group of this.mod.groups) {

console.log("WE HAVE GROUP: " + JSON.stringify(group));
	    if (!group.unread) { group.unread = 0; }

            // {
            //   id: id,
            //   members: members,
            //   name: name,
            //   txs: [],
            // }

            let last_msg = "new chat";
            let last_ts = new Date().getTime();

            if (group.txs.length > 0) {
              let tx = group.txs[group.txs.length - 1];
              let txmsg = tx.returnMessage();
              last_msg = this.app.browser.stripHtml(txmsg.message);
              last_ts = txmsg.timestamp;
            }

            //
            // TODO -- lets turn this into a CHAT COMPONENT
            //
console.log("PRE SUG!");
            let html = SaitoUserGroup(this.app, group.name, last_msg, last_ts, group.id, group.unread);
console.log("HTML is: " + html);
            let divid = "saito-user-" + group.id;

            let obj = document.getElementById(divid);
            if (obj) {
console.log("1");
              this.app.browser.replaceElementById(html, divid);
            } else {
              if (document.querySelector(".chat-manager-list")){
console.log("2");
                this.app.browser.addElementToSelector(html, ".chat-manager-list");
              }
            }
	  }

	  this.rendered = 1;
	  this.attachEvents();

	}


	attachEvents() {

	  let cm = this;

	  document.querySelectorAll('.chat-manager-list .saito-user').forEach(item => {
	    item.onclick = (e) => {
console.log("A 1");
	      let gid = e.currentTarget.getAttribute("data-id");
console.log("A 2: " + gid);
	      cm.app.connection.emit("chat-popup-render-request", cm.mod.returnGroup(gid));  
console.log("A 3: " + gid);
	    }
	  });
	}

}

module.exports = ChatManager;


