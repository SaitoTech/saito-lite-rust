const ChatManagerTemplate = require("./main.template");
const ChatPopup = require("./popup");
const SaitoUserWithTime = require('./../../../../lib/saito/new-ui/templates/saito-user-with-time.template');
const JSON = require('json-bigint');

class ChatManager {

    constructor(app, mod) {

        this.name = "ChatManager";
	this.rendered = 0;
	this.mod = mod;

        app.connection.on("chat-render-request", (emptymsg) => {
          this.render(app, mod);
        });

    }

    render(app, mod, selector = "") {

        if (!document.querySelector(".chat-manager")) {
            app.browser.addElementToSelector(ChatManagerTemplate(app, mod), selector);
        }

	//
	// make sure chat mod
	//
	mod = this.mod;

        for (let z = 0; z < mod.groups.length; z++) {

	  let group = mod.groups[z];

console.log("GROUP: " + JSON.stringify(group));

          // {
          //   id: id,
          //   members: members,
          //   name: name,
          //   txs: [],
	  // }

	  let last_msg = "new chat";
	  let last_ts = new Date().getTime();
	  if (group.txs.length > 0) {
	     let tx = group.txs[group.txs.length-1];
	     let txmsg = tx.returnMessage();
	     last_msg = txmsg.message;
	  }

console.log("SAITO USER WITH TIME AND GROUP_ID : " + group.id);
          let html = SaitoUserWithTime(app, mod, group.name, last_msg, "3:45", group.id);

	  let divid = "saito-user-"+group.id;
	  let obj = document.getElementById(divid);

	  if (obj) {
	    app.browser.replaceElementById(html, divid);
	  } else {
	    app.browser.addElementToSelector(html, ".chat-manager-list");	
	  }
        }

	this.rendered = 1;
        this.attachEvents(app, mod);

    }

    attachEvents(app, mod) {

        document.querySelectorAll('.chat-manager-list .saito-user').forEach(item => {
            item.onclick = (e) => {
		let group_id = e.currentTarget.getAttribute("data-id");
		
	        alert("clicked to create: " + group_id);
		let chat_popup = new ChatPopup(app, mod, group_id);
		chat_popup.render(app, mod, group_id);
            }
        })
    }

}

module.exports = ChatManager;


