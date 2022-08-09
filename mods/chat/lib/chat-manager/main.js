const ChatManagerTemplate = require("./main.template");
const ChatPopup = require("./popup");
const SaitoUserWithTime = require('./../../../../lib/saito/new-ui/templates/saito-user-with-time.template');

class ChatManager {

    constructor(app, mod) {
        this.name = "ChatManager";
	this.rendered = 0;

        app.connection.on("chat-render-request", (tx) => {
          this.render(app, mod);
        });
        app.connection.on("encrypt-key-exchange-confirm", (tx) => {
          this.render(app, mod);
        });

    }

    render(app, mod, selector = "") {

        if (!document.querySelector(".chat-manager")) {
            app.browser.addElementToSelector(ChatManagerTemplate(app, mod), selector);
        }

	if (this.rendered === 0) {
	  let divid = "Saito Community Chat";
	  if (document.getElementById(divid)) {
            let html = SaitoUserWithTime(app, mod, "Saito Community Chat", "last msg", "3.45");
	    app.browser.replaceElementById(html, divid);
	  } else {
            let html = SaitoUserWithTime(app, mod, "Saito Community Chat", "last msg", "3.45");
	    app.browser.addElementToSelector(html, ".chat-manager-list");
	  }
	  this.rendered = 1;
	}
	
        for (let i = 0; i < app.keys.keys.length; i++) {
	  if (app.keys.keys[i].publickey != app.wallet.returnPublicKey()) {
	    let divid = `saito-user-${app.keys.keys[i].publickey}`;
	    if (document.getElementById(divid)) {
              let html = SaitoUserWithTime(app, mod, app.keys.keys[i].publickey, "", "3.45");
	      app.browser.replaceElementById(html, divid);
	    } else {
              let html = SaitoUserWithTime(app, mod, app.keys.keys[i].publickey, "", "3.45");
	      app.browser.addElementToSelector(html, ".chat-manager-list");
	    }
	  }
	}

        this.attachEvents(app, mod);
    }

    attachEvents(app, mod) {

        document.querySelectorAll('.chat-manager-list .saito-user').forEach(item => {
            item.onclick = (e) => {
	        alert("clicked to create!");
		let chat_popup = new ChatPopup(app, mod);
		chat_popup.render(app, mod);
            }
        })
    }

}

module.exports = ChatManager;


