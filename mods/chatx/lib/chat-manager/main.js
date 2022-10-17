const ChatManagerTemplate = require("./main.template");
const SaitoUserWithTime = require('./../../../../lib/saito/new-ui/templates/saito-user-with-time.template');
const JSON = require('json-bigint');

class ChatManager {

	constructor(app, mod) {
		this.app = app;
		this.chat_mod = mod; // Store a reference to the "parent" module, which also stores a copy of me
		this.rendered = 0;	 // So chat will work without the chat manager rendered on screen, so we may want to know its status
	

		this.name = "ChatManager";
		this.mod = mod;
		this.messages_in_groups = [];
		this.rendered = 0;
		this.inactive_popups = [];

		for (let z = 0; z < this.mod.groups.length; z++) {
			this.messages_in_groups[z] = this.mod.groups[z].txs.length;
		}

		//
		// we listen for events to re-render the Chat Manager,
		// emphasis on "re-" because we want to be on a page which includes
		// it as a component and wait for the page UI to render the manager
		//
		app.connection.on("refresh-chat-groups", (gid)=>{
			if (this.rendered){
				this.render(app, mod);
			}
		});

		app.connection.on("chat-render-request-notify", (gid) => {
			if (this.rendered){
				let group = mod.returnGroup(gid);
				if (group){
					this.makeGroupHeader(group, group.unread);
				}

				this.attachEvents(app, this.chat_mod);

			}
		});

	}


	/*
	If we use our wonderful system of attaching compoments to a module and having them all render, 
	we run into a problem where the mod passed to render and the mod passed to constructor are 
	different modules. We obviously want a reference to the parent module which has some data structures
	we need to search through, so we use a more verbose naming system to keep things straight
	*/
	render(app, container_mod, selector = "") {

		if (!document.querySelector(".chat-manager")) {
			app.browser.addElementToSelector(ChatManagerTemplate(app, container_mod), selector);
		} 

		for (let group of this.chat_mod.groups) {
			this.makeGroupHeader(group, group.unread);
		}

		this.rendered = 1;
		this.attachEvents(app, this.chat_mod);

	}


	makeGroupHeader(group, notifications = 0){
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

		let html = SaitoUserWithTime(this.app, this.chat_mod, group.name, last_msg, last_ts, group.id, notifications);
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

	/*
	Click chat group in manager to open popup chat window
	*/
	attachEvents(app, mod) {
		document.querySelectorAll('.chat-manager-list .saito-user').forEach(item => {
			item.onclick = (e) => {
				mod.openChatBox(e.currentTarget.getAttribute("data-id"));
			}
		})
	}

}

module.exports = ChatManager;


