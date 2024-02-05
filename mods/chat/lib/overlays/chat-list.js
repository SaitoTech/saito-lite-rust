const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const ChatListTemplate = require('./chat-list.template');

class ChatList {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, null, true, true);
		this.callback = null;
	}

	render(){
		if (!document.getElementById('saito-chats-modal')) {
			this.overlay.show(ChatListTemplate(this.app, this.mod));
		} else {
			this.app.browser.replaceElementById(ChatListTemplate(this.app, this.mod),'saito-chats-modal');
		}

		this.attachEvents();

	}

	attachEvents(){
		document.querySelectorAll('#saito-chats-modal .saito-contact').forEach((contact) => {
			contact.onclick = (e) => {
				this.overlay.remove();
				if (this.callback) {
					this.callback(e.currentTarget.dataset.id);
				}
			};
		});
	}

}

module.exports = ChatList;

