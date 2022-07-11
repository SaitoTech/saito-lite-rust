const ChatManagerTemplate = require("./manager.template");
const ChatPopup = require("./popup");


class ChatManager {

    constructor(app) {
        this.name = "ChatManager";
    }

    render(app, mod, container = "") {
        if (!document.querySelector(".chat-manager")) {
            app.browser.addElementToClass(ChatManagerTemplate(app, mod), container);
        }
        this.attachEvents(app, mod);
    }

    attachEvents(app, mod) {

        document.querySelectorAll('.saito-list-chatbox').forEach(item => {
            item.onclick = (e) => {
	        alert("clicked to create!");
		let chat_popup = new ChatPopup(app, mod);
		chat_popup.render(app, mod);
            }
        })
    }

}

module.exports = ChatManager;


