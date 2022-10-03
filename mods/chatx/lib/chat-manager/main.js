const ChatManagerTemplate = require("./main.template");
const ChatPopup = require("./popup");
const SaitoUserWithTime = require('./../../../../lib/saito/new-ui/templates/saito-user-with-time.template');
const JSON = require('json-bigint');

class ChatManager {

	constructor(app, mod) {

		this.name = "ChatManager";
		this.mod = mod;
		this.messages_in_groups = [];
		this.rendered = 0;
		this.inactive_popups = [];

		for (let z = 0; z < this.mod.groups.length; z++) {
			this.messages_in_groups[z] = this.mod.groups[z].txs.length;
		}

		app.connection.on("chat-render-request", (group_id = "") => {
			if (app.BROWSER) {
				if ((app.browser.isMobileBrowser(navigator.userAgent) == true || window.innerWidth < 600) && !mod.mobile_chat_active) {
					//send chat notification event
					app.connection.emit("chat-render-request-notify");
					return;
				} else {
					if (group_id != "") {
						let psq = "#chat-container-" + group_id;
						let obj = document.querySelector(psq);
						if (!obj) {
							let chat_popup = new ChatPopup(app, mod, group_id);
							chat_popup.render(app, mod, group_id);
						} else {
							console.log("Chat Popup Exists");
						}
					}
				}
			}
		});
	}

	render(app, mod, selector = "") {

		if (!document.querySelector(".chat-manager")) {
			app.browser.addElementToSelector(ChatManagerTemplate(app, mod), selector);
		} else {
			app.browser.replaceElementBySelector(ChatManagerTemplate(app, mod), selector);
		}

		//
		// make sure chat mod
		//
		mod = this.mod;

		for (let z = 0; z < mod.groups.length; z++) {

			let group = mod.groups[z];

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
				last_msg = txmsg.message;
				last_ts = txmsg.timestamp;
			}

			//
			// 
			//
			let x = app.browser.formatDate(last_ts);
			let last_update = x.hours + ":" + x.minutes;

			let html = SaitoUserWithTime(app, mod, group.name, last_msg, last_update, group.id);
			let divid = "saito-user-" + group.id;
			let obj = document.getElementById(divid);

			if (obj) {
				app.browser.replaceElementById(html, divid);
			} else {
				app.browser.addElementToSelector(html, ".chat-manager-list");
			}

			//
			// if new message, open chat box
			//
			if (z > this.messages_in_groups.length) {
				this.messages_in_groups[z] = 0;
			}

		}


		//
		// open community chat if new load
		//
		if (this.rendered == 0) {
			if (mod.groups.length > 0) {
				let gid = mod.groups[0].id;
				let psq = "#chat-container-" + gid;
				if (!document.querySelector(psq)) {
					let chat_popup = new ChatPopup(app, mod, gid);
					//						if(app.browser.isMobileBrowser(navigator.userAgent) === false && window.innerWidth > 600) {
					chat_popup.render(app, mod, gid);
					//						}
				}
			}
		}

		// TODO - possibly remove
		//this.rendered = 1;
		this.attachEvents(app, mod);

	}

	attachEvents(app, mod) {
		document.querySelectorAll('.chat-manager-list .saito-user').forEach(item => {
			item.onclick = (e) => {
				let group_id = e.currentTarget.getAttribute("data-id");
				mod.activatePopup(group_id);
				let chat_popup = new ChatPopup(app, mod, group_id);
				app.connection.emit('chat-render-request', group_id);
			}
		})
	}

}

module.exports = ChatManager;


