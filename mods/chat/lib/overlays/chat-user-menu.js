const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const chatMenuTemplate = require('./chat-user-menu.template');
const ContactsList = require('./../../../../lib/saito/ui/modals/saito-contacts/saito-contacts');
const MemberList = require("./member-list.template");

class ChatUserMenu {
	constructor(app, mod, chat_group) {
		this.app = app;
		this.mod = mod;
		this.chat_group = chat_group;
		this.overlay = new SaitoOverlay(app, null, true, true);
	}

	render() {
		let thisobj = this;
		if (!this.chat_group) {
			return;
		}
		if (!document.querySelector('#saito-chat-menu')) {
			this.overlay.show(
				chatMenuTemplate(this.app, this.mod, this.chat_group), ()=> {
					this.app.connection.emit('chat-manager-render-request');
					this.app.connection.emit("chat-popup-refresh-request", this.chat_group);
				}
			);
			this.attachEvents();
		}

	}

	attachEvents() {
		let thisobj = this;

		let suggestedName = this.chat_group.name;

		if (this.chat_group.members.length == 2 && !this.chat_group?.member_ids) {
			for (let m of this.chat_group.members) {
				if (m !== this.mod.publicKey) {
					suggestedName = m;
				}
			}
		}

		if (document.getElementById('rename')) {
			document.getElementById('rename').onclick = async (e) => {
				let name = await sprompt(
					'What do you want to call the chat group?',
					suggestedName
				);
				if (name) {
					thisobj.chat_group.name = sanitize(name);

					if (thisobj.chat_group?.member_ids && thisobj.chat_group.member_ids[thisobj.mod.publicKey] == 'admin' ) {
						console.log('Send new name as group tx');
						thisobj.mod.sendUpdateGroupTransaction(thisobj.chat_group);
					}
					thisobj.mod.saveChatGroup(thisobj.chat_group);
					this.app.connection.emit('chat-manager-render-request');
				}
				thisobj.overlay.remove();
			};
		}

		if (document.getElementById('mute')){
			document.getElementById('mute').onclick = (e) => {
				this.chat_group.muted = true;
				this.mod.saveChatGroup(this.chat_group);
				this.app.connection.emit('chat-manager-render-request');
				this.overlay.remove();
			}
		}

		if (document.getElementById('unmute')){
			document.getElementById('unmute').onclick = (e) => {
				this.chat_group.muted = false;
				this.mod.saveChatGroup(this.chat_group);
				this.app.connection.emit('chat-manager-render-request');
				this.overlay.remove();
			}
		}


		if (document.getElementById('block')){
			document.getElementById('block').onclick = (e) => {
				for (let pkey of this.chat_group.members){
					if (pkey !== this.mod.publicKey){
						if (!this.mod.black_list.includes(pkey)){
							this.mod.black_list.push(pkey);			
						}
					}
				}
				this.mod.deleteChatGroup(this.chat_group);
				this.overlay.remove();
				this.app.connection.emit('chat-popup-remove-request', this.chat_group);
			}
		}

		if (document.getElementById('unblock')){
			document.getElementById('unblock').onclick = (e) => {
	            for (let i = this.mod.black_list.length; i >= 0; i--){
	              if (this.mod.black_list[i] == e.currentTarget.dataset.id){
	                this.mod.black_list.splice(i, 1);
	                break;
	              }
	            }
	          this.mod.saveOptions();
	          this.overlay.remove();
			}
		}

		if (document.getElementById("invite")){
			document.getElementById('invite').onclick = (e) => {
				this.mod.generateChatGroupLink(this.chat_group);
			}
		}


		if (document.getElementById('delete')) {
			document.getElementById('delete').onclick = async (e) => {
				thisobj.mod.deleteChatGroup(thisobj.chat_group);
				thisobj.overlay.remove();
				this.app.connection.emit('chat-popup-remove-request', this.chat_group);
			};
		}

		if (document.getElementById('admin')) {
			document.getElementById('admin').onclick = (e) => {
				const contactList = new ContactsList(this.app, this.mod, false);
				contactList.title = "Promote to Admin";
				contactList.callback = async (person) => {
					if (person) {

						if (!thisobj.chat_group.members.includes(person)) {
							thisobj.chat_group.members.push(person);
						}

						thisobj.chat_group.member_ids[person] = "admin";

						thisobj.mod.sendUpdateGroupTransaction(thisobj.chat_group);

						this.mod.saveChatGroup(thisobj.chat_group);
						thisobj.overlay.remove();
						thisobj.render();
					}
				};
				contactList.render(thisobj.chat_group.members.filter(x => thisobj.chat_group.member_ids[x] == 1));
			};
		}

		if (document.getElementById('leave')){
			document.getElementById('leave').onclick = async (e) => {
				await this.mod.sendRemoveMemberTransaction(
						thisobj.chat_group,
						this.mod.publicKey
					);

				this.mod.deleteChatGroup(thisobj.chat_group);
				siteMessage('You left the chat group', 2000);
				this.overlay.remove();
				this.app.connection.emit('chat-popup-remove-request', this.chat_group);

			}
		}

		if (document.getElementById("remove")){
			document.getElementById("remove").onclick = async (e) => {
				const contactList = new ContactsList(this.app, this.mod, false);
				contactList.title = "Remove Member";
				contactList.callback = async (person) => {

					await this.mod.sendRemoveMemberTransaction(
						thisobj.chat_group,
						person
					);

					for (let i = 0; i < thisobj.chat_group.members.length; i++) {
						if (thisobj.chat_group.members[i] == person) {
							thisobj.chat_group.members.splice(i, 1);
							break;
						}
					}

					thisobj.chat_group.member_ids[person] = -1;
				};
				contactList.render(thisobj.chat_group.members.filter(x => thisobj.chat_group.member_ids[x] == 1));
				console.log(thisobj.chat_group.members, thisobj.chat_group.member_ids);
			}
			
		}

		if (document.getElementById("view")){
			document.getElementById("view").onclick = async (e) => {
				let overlay = new SaitoOverlay(this.app, this.mod);

// >>>>>>> Use a component here!

				overlay.show(`<div class="chat-member-list-overlay saito-modal"><div class="saito-modal-title">${thisobj.chat_group.name}</div>${MemberList(this.app, this.mod, thisobj.chat_group)}</div>`);
				console.log(JSON.parse(JSON.stringify(thisobj.chat_group.members)), JSON.parse(JSON.stringify(thisobj.chat_group.member_ids)));

			    // Add .remove_user functionality
			    Array.from(document.querySelectorAll(".remove_user")).forEach((member) => {
			      member.onclick = async (e) => {
			        let person = e.currentTarget.dataset.id;
			        if (person){
			            await thisobj.mod.sendRemoveMemberTransaction(
			            chat,
			            person
			          );

			          for (let i = 0; i < chat.members.length; i++) {
			            if (chat.members[i] == person) {
			              chat.members.splice(i, 1);
			              break;
			            }
			          }

			          chat.member_ids[person] = -1;
			        }
			      }
			    });

			}
		}

		if (document.getElementById('debug')){
			document.getElementById('debug').onclick = (e) => {
				console.log(JSON.parse(JSON.stringify(thisobj.chat_group)));
				let message = thisobj.mod.createMessageBlocks(thisobj.chat_group);
				console.log(JSON.parse(JSON.stringify(message)));
			}
		}

	}
}

module.exports = ChatUserMenu;
