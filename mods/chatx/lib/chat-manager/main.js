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

		for (let z = 0; z < this.mod.groups.length; z++) {
			this.messages_in_groups[z] = this.mod.groups[z].txs.length;
		}

		app.connection.on("chat-render-request", (emptymsg) => {
			this.render(app, mod);
		});

		app.connection.on("chat-popup-render-request", (group_id) => {
alert("CPRR: " + group_id);
			let chat_popup = new ChatPopup(app, mod, group_id);
			chat_popup.render(app, mod, group_id);
		});

	}

	render(app, mod, selector = "") {

		if (!document.querySelector(".chat-manager")) {
			app.browser.addElementToSelector(ChatManagerTemplate(app, mod), selector);
			app.browser.makeDraggable("#chat-manager");
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
			}

			let html = SaitoUserWithTime(app, mod, group.name, last_msg, "12:00", group.id);

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
			if (group.txs.length > this.messages_in_groups[z]) {
				//  let group_id = group.id;
				//  let chat_popup = new ChatPopup(app, mod, group_id);
				//  chat_popup.render(app, mod, group_id);
			}

		}

		//
		// open community chat if new load
		//
		if (this.rendered == 0) {
			if (mod.groups.length > 0) {
				let gid = mod.groups[0].id;
				let chat_popup = new ChatPopup(app, mod, gid);
				chat_popup.render(app, mod, gid);
			}
		}

		this.rendered = 1;
		this.attachEvents(app, mod);

	}

	attachEvents(app, mod) {
		document.querySelectorAll('.chat-manager-list .saito-user').forEach(item => {
			item.onclick = (e) => {
				let group_id = e.currentTarget.getAttribute("data-id");
				let chat_popup = new ChatPopup(app, mod, group_id);
				chat_popup.render(app, mod, group_id);
			}
		})
	}

}

module.exports = ChatManager;


