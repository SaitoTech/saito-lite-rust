const chatMenuTemplate = require('./chat-manager-menu.template');
const ContactsList = require('./../../../../lib/saito/ui/modals/saito-contacts/saito-contacts');

class ChatManagerMenu {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;

		this.contactList = new ContactsList(app, mod, true);
		this.contactList.callback = async (person) => {
			if (Array.isArray(person) && person.length > 1) {
				let name = await sprompt('Choose a name for the group');
				//Make sure I am in the group too!
				person.push(this.mod.publicKey);
				let group = this.mod.returnOrCreateChatGroupFromMembers(
					person,
					name
				);

				if (group.txs.length == 0) {
					await this.mod.sendCreateGroupTransaction(group);
				} else {
					this.app.connection.emit(
						'chat-popup-render-request',
						group
					);
				}
			} else if (Array.isArray(person) && person.length == 1) {
				this.app.keychain.addKey(person[0], { mute: 0 });
				person.push(this.mod.publicKey);
				let group = this.mod.returnOrCreateChatGroupFromMembers(person);
			}
		};
	}

	async render() {
		this.app.browser.addElementToSelector(
			chatMenuTemplate(this.app, this.mod),
			'.chat-manager-list'
		);
		this.active = true;

		this.attachEvents();
	}

	hide() {
		if (document.querySelector('.chat-manager-menu')) {
			document.querySelector('.chat-manager-menu').remove();
		}
		this.active = false;
	}

	attachEvents() {
		if (document.querySelector('.chat-manager-menu')) {
			document.querySelector('.chat-manager-menu').onclick = (e) => {
				this.hide();
			};
		}

		if (document.querySelector('.add-contacts')) {
			document.querySelector('.add-contacts').onclick = (e) => {
				this.contactList.render();
			};
		}

		if (document.querySelector('.refresh-contacts')) {
			document.querySelector('.refresh-contacts').onclick = async (e) => {
				siteMessage('Checking if your contacts are online', 3000);
				for (let group of this.mod.groups) {
					if (group.members.length == 2) {
						//console.log(JSON.parse(JSON.stringify(group.members)));
						for (let member of group.members) {
							if (member != this.mod.publicKey) {
								//console.log("Send Ping to " + member);
								this.app.connection.emit('relay-send-message', {
									recipient: [member],
									request: 'ping',
									data: {}
								});

								this.pinged[group.id] = new Date().getTime();

								if (this.timers[group.id]) {
									clearTimeout(this.timers[group.id]);
								}

								//If you don't hear back in 5 seconds, assume offline
								this.timers[group.id] = setTimeout(() => {
									console.log('Auto change to offline');
									let cm_handle = document.querySelector(
										`.chat-manager #saito-user-${group.id}`
									);
									if (cm_handle) {
										cm_handle.classList.remove('online');
									}
									group.online = false;
									this.timers[group.id] = null;
								}, 1000 * 5);
							}
						}
					}
				}
			};
		}

		if (document.querySelector('.toggle-notifications')) {
			document.querySelector('.toggle-notifications').onclick = (e) => {
				if (this.mod.enable_notifications) {
					this.mod.enable_notifications = false;
					this.app.options.chat.enable_notifications = false;
					this.app.storage.saveOptions();
					siteMessage(
						'System Notifications turned off for Chat Messages',
						3000
					);
				} else {
					Notification.requestPermission().then((result) => {
						if (result === 'granted') {
							this.mod.enable_notifications = true;
							this.app.options.chat.enable_notifications = true;
							this.app.storage.saveOptions();
							siteMessage(
								'System Notifications granted for Chat Messages',
								3000
							);
						} else {
							siteMessage(
								'Error enabling System Notifications',
								3000
							);
						}
					});
				}
			};
		}
	}
}

module.exports = ChatManagerMenu;
