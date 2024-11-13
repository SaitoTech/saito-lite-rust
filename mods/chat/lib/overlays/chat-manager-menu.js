const chatMenuTemplate = require('./chat-manager-menu.template');
const ContactsList = require('./../../../../lib/saito/ui/modals/saito-contacts/saito-contacts');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const ChatList = require('./chat-list');
const ChatUserMenu = require('./chat-user-menu');

class ChatManagerMenu {
	constructor(app, mod, container = null) {
		this.app = app;
		this.mod = mod;

		this.container = container;

		this.contactList = new ContactsList(app, mod, true);

		//only used if no container provided!
		this.overlay = new SaitoOverlay(this.app, this.mod);

		this.chatList = new ChatList(app, mod);
		this.chatList.callback = (gid) => {
			let chatMenu = new ChatUserMenu(
				this.app,
				this.mod,
				this.mod.returnGroup(gid)
			);
			chatMenu.render();
		};
	}

	async render() {
		if (!this.container) {
			this.overlay.show(
				`<div class="module-settings-overlay"><h2>Chat Settings</h2></div>`
			);
			this.container = '.module-settings-overlay';
		}

		if (document.querySelector('.saito-module-settings')) {
			this.app.browser.replaceElementBySelector(
				chatMenuTemplate(this.app, this.mod),
				'.saito-module-settings'
			);
		} else {
			this.app.browser.addElementToSelector(
				chatMenuTemplate(this.app, this.mod),
				this.container
			);
		}

		this.attachEvents();
	}

	attachEvents() {

		if (document.getElementById('add-publickey')) {
			document.getElementById('add-publickey').onclick = async (e) => {
				let add = await sprompt('Enter Address of Contact to Add:');
                                if (add != '' && this.app.wallet.isValidPublicKey(add)) {
					salert(`Adding ${add} as Contact`);
					this.app.keychain.addKey(add);
	                                this.app.connection.emit(
        	                                'encrypt-key-exchange',
                	                        add
                        	        );
				} else {
					salert("Not a Network Address / Public Key");
				}
			};
		}

		if (document.getElementById('add-contacts')) {
			document.getElementById('add-contacts').onclick = (e) => {
				this.contactList.multi_select = false;
				this.contactList.callback = async (person) => {
					if (person) {
						this.app.connection.emit('open-chat-with', {
							key: person
						});
						this.overlay.close();
					}
				};
				this.contactList.render();
			};
		}

		if (document.getElementById('create-group')) {
			document.getElementById('create-group').onclick = async (e) => {
				this.contactList.multi_select = true;
				this.contactList.title = "Invite Contacts";
				
				this.contactList.callback = (person) => {
					person.push(this.mod.publicKey);
					this.mod.sendCreateGroupTransaction(name, person);
				};

				let name = await sprompt('Choose a name for the group');
				if (name){
					let myKeys = this.app.keychain.returnKeys();
					if (myKeys.length > 0){
						this.contactList.render();		
					}else{
						this.mod.sendCreateGroupTransaction(name);		
					}
					this.overlay.close();
				}
			};
		}

		if (document.getElementById('edit-contacts')) {
			document.getElementById('edit-contacts').onclick = (e) => {
				this.chatList.render();
			};
		}

		/*if (document.getElementById('enable-notifications')) {
			document
				.getElementById('enable-notifications')
				.addEventListener('change', (e) => {
					if (e.currentTarget.checked) {
						Notification.requestPermission().then((result) => {
							if (result === 'granted') {
								this.mod.enable_notifications = true;
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
					} else {
						this.mod.enable_notifications = false;
						siteMessage(
							'System Notifications turned off for Chat Messages',
							3000
						);
					}
					this.mod.saveOptions();
				});
		}*/

		const f1 = document.getElementById("sensitivity-fieldset");
		const f2 = document.getElementById("chime-fieldset");

		if (document.getElementById('audio-notifications') && f1 && f2) {
			document
				.getElementById('audio-notifications')
				.addEventListener('change', (e) => {
					if (e.currentTarget.checked) {
						f1.style.display = "grid";
						f2.style.display = "grid";
					} else {
						this.mod.audio_notifications = "";
						f1.style.display = "none";
						f2.style.display = "none";
						this.mod.saveOptions();
					}
				});
		}

		Array.from(
			document.querySelectorAll(`input[name='chime-threshold']`)
		).forEach((radio) => {
			radio.addEventListener('change', (e) => {
				if (e.currentTarget.value !== this.mod.audio_notifications) {
					this.mod.audio_notifications = e.currentTarget.value;
					this.mod.saveOptions();
				}
			});
		});

		Array.from(
			document.querySelectorAll(`input[name='chat-chime']`)
		).forEach((radio) => {
			radio.addEventListener('change', (e) => {
				if (e.currentTarget.value !== this.mod.audio_chime) {
					this.mod.audio_chime = e.currentTarget.value;
					this.mod.chime = new Audio(`/saito/sound/${this.mod.audio_chime}.mp3`);
					this.mod.saveOptions();
				}
			});
		});


		if (document.getElementById('auto-open')) {
			document
				.getElementById('auto-open')
				.addEventListener('change', (e) => {
					if (e.currentTarget.checked) {
						this.mod.auto_open_community = true;
					} else {
						this.mod.auto_open_community = false;
					}
					this.mod.saveOptions();
				});
		}

		if (document.getElementById('chat-link')) {
			document
				.getElementById('chat-link')
				.addEventListener('click', (e) => {
					let link =
						window.location.origin +
						'/chat?chat_id=' +
						this.mod.publicKey;
					navigator.clipboard.writeText(link);
					siteMessage('Link Copied', 2000);
				});
		}

	    if (document.getElementById("blocked-accounts")){
	      document.getElementById("blocked-accounts").onclick = (e) => {
	        this.contactList.title = "Blocked Accounts";
	        this.contactList.multi_button = "Unblock Selected Accounts";
	        this.contactList.callback = (keys) => {
	          for (let key of keys){
	            for (let i = this.mod.black_list.length; i >= 0; i--){
	              if (this.mod.black_list[i] == key){
	                this.mod.black_list.splice(i, 1);
	                break;
	              }
	            }
	          }
	          this.mod.saveOptions();
	          this.render();
	        }

	        this.contactList.render(this.mod.black_list);
	      }
	    }

	    document.querySelectorAll(".sound-preview").forEach(sound => {
	    	sound.onclick = (e) => {
	    		let chime = e.currentTarget.dataset.id;
   				let preview = new Audio(`/saito/sound/${chime}.mp3`);
   				preview.play();
	    	};
	    })

	}
}

module.exports = ChatManagerMenu;
