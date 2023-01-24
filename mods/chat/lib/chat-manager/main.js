const ChatPopup = require("./popup");
const ChatManagerTemplate = require("./main.template");
const ChatTeaser = require('./teaser.template');
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
	  app.connection.on("chat-popup-render-request", (group=null) => {
	    if (group == null) {
	      let group = this.mod.returnCommunityChat();
	      if (group != null) { this.app.connection.emit("chat-popup-render-request", (group)); }
	    } else {
	      if (this.render_popups_to_screen) {
	        if (!this.popups[group.id]) {
		  this.popups[group.id] = new ChatPopup(this.app, this.mod, "");
		  this.popups[group.id].group = group;
	        }
	        this.popups[group.id].render();
	      }
	    }
          });

          app.connection.on("open-chat-with", (data=null) => {

            if (!data) {
	        let group = this.mod.returnCommunityChat();
		if (this.popups[group.id]) { this.popups[group.id].manually_closed = false; }
                this.app.connection.emit('chat-popup-render-request', this.mod.returnCommunityChat());
                return;
            }

            let group;

            if (Array.isArray(data.key)) {
                group = this.mod.createChatGroup(data.key, data.name);
            } else {
                let name = data.name || app.keys.returnUsername(data.key);
                group = this.mod.createChatGroup([app.wallet.returnPublicKey(), data.key], name);
            }

	    //
	    // permit re-open
	    //
	    if (this.popups[group.id]) { this.popups[group.id].manually_closed = false; }

            app.connection.emit('chat-popup-render-request', group);
          });

	}


	render() {

	  //
	  // some applications do not want chat-manager appearing (games!)
	  //
	  if (this.render_manager_to_screen == 0) { 
	    return; 
	  }

          //
          // replace element or insert into page
     	  //
    	  if (document.querySelector(".chat-manager")) {
    	    this.app.browser.replaceElementBySelector(ChatManagerTemplate(this.app, this.mod), ".chat-manager");
    	  } else {
   	    this.app.browser.addElementToSelectorOrDom(ChatManagerTemplate(this.app, this.mod), this.container);
   	  }

	  //
	  // render chat groups
	  //
	  for (let group of this.mod.groups) {

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
            let html = ChatTeaser(this.app, group.name, last_msg, last_ts, group.id, group.unread);
            let divid = "saito-user-" + group.id;

            let obj = document.getElementById(divid);
            if (obj) {
              this.app.browser.replaceElementById(html, divid);
            } else {
              if (document.querySelector(".chat-manager-list")){
                this.app.browser.addElementToSelector(html, ".chat-manager-list");
              }
            }
	  }

	  this.rendered = 1;
	  this.attachEvents();

	}


	attachEvents() {

	  let cm = this;

	  //
	  // clicks on the element itself (background)
	  //
	  document.querySelectorAll('.chat-manager-list .saito-user').forEach(item => {
	    item.onclick = (e) => {
	      let gid = e.currentTarget.getAttribute("data-id");
	      let group = cm.mod.returnGroup(gid);
	      // unset manually closed to permit re-opening
	      if (this.popups[gid]) { this.popups[gid].manually_closed = false; }
	      cm.app.connection.emit("chat-popup-render-request", group);
	    }
	  });

	}

}

module.exports = ChatManager;


