const SaitoProfileTemplate = require('./saito-profile.template');
const SaitoContacts = require('./../modals/saito-contacts/saito-contacts');
const UserMenu = require('./../modals/user-menu/user-menu');

class SaitoProfile {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.tab = 'posts';
		this.posts = [];
		this.replies = [];
		this.retweets = [];
		this.likes = [];
		this.publicKey = null; //Always set externally...
		this.contactList = new SaitoContacts(app, mod, false);
		this.contactList.callback = (pkey) => {
			let userMenu = new UserMenu(this.app, pkey);
			userMenu.render();
		};

		app.connection.on('update-profile-stats', (key, amount) => {
			let field = document.querySelector(
				`.redsquare-profile-menu-${key} span`
			);
			if (field) {
				field.innerHTML = sanitize(`(${amount})`);
			}
		});
	}

	remove() {
		if (document.querySelector('.saito-profile')) {
			document.querySelector('.saito-profile').remove();
		}
	}

	reset(publicKey) {
		this.tab = 'posts';
		this.posts = [];
		this.replies = [];
		this.likes = [];
		this.retweets = [];
		this.publicKey = publicKey;
	}

	async render() {
		let myqs = '.saito-profile';

		this.keys = this.app.keychain.returnKeys();
		if (!document.querySelector(myqs)) {
			this.app.browser.addElementToSelector(
				SaitoProfileTemplate(this.app, this.mod, this),
				this.container
			);
		} else {
			this.app.browser.replaceElementBySelector(
				SaitoProfileTemplate(this.app, this.mod, this),
				myqs
			);
		}

		this.addProfileMenu();
		this.renderTweets();
		this.attachEvents();
	}

	attachEvents() {
		if (document.querySelector('.saito-profile-add-contact-btn')) {
			document.querySelector('.saito-profile-add-contact-btn').onclick = (
				e
			) => {
				document.querySelector(
					'.saito-profile-add-contact-btn'
				).style.display = 'none';
				this.app.connection.emit(
					'encrypt-key-exchange',
					this.publicKey
				);
			};
		}

		if (document.querySelector('.saito-following')) {
			document.querySelector('.saito-following').onclick = (e) => {
				this.contactList.render();
			};
		}

		document
			.querySelectorAll('.redsquare-profile-menu-tabs')
			.forEach((el) => {
				el.onclick = (e) => {
					if (this.tab != e.currentTarget.dataset.id) {
						this.tab = e.currentTarget.dataset.id;
						this.render();
					}
				};
			});
	}

	addProfileMenu() {
		this_profile = this;
		let mods = this.app.modules.respondTo('saito-profile-menu', {
			publicKey: this.publicKey
		});

		let index = 0;
		let menu_entries = [];
		for (const mod of mods) {
			let item = mod.respondTo('saito-profile-menu');

			if (item instanceof Array) {
				item.forEach((j) => {
					if (!j.rank) {
						j.rank = 100;
					}
					menu_entries.push(j);
				});
			}
		}

		let menu_sort = function (a, b) {
			if (a.rank < b.rank) {
				return -1;
			}
			if (a.rank > b.rank) {
				return 1;
			}
			return 0;
		};
		menu_entries = menu_entries.sort(menu_sort);

		for (let i = 0; i < menu_entries.length; i++) {
			let j = menu_entries[i];
			let show_me = true;
			let active_mod = this.app.modules.returnActiveModule();
			if (typeof j.disallowed_mods != 'undefined') {
				if (j.disallowed_mods.includes(active_mod.slug)) {
					show_me = false;
				}
			}
			if (typeof j.allowed_mods != 'undefined') {
				show_me = false;
				if (j.allowed_mods.includes(active_mod.slug)) {
					show_me = true;
				}
			}
			if (show_me) {
				let id = `saito_profile_menu_item_${index}`;
				this_profile.callbacks[index] = j.callback;
				this_profile.addProfileMenuItem(j, id, index);
				index++;
			}
		}
	}

	insertTweet(tweet, list) {
		let insertion_index = 0;

		for (let i = 0; i < list.length; i++) {
			if (list[i].tx.signature === tweet.tx.signature) {
				return;
			}

			if (tweet.created_at > list[i].created_at) {
				break;
			} else {
				insertion_index++;
			}
		}

		list.splice(insertion_index, 0, tweet);
	}

	addProfileMenuItem(item, id, index) {
		let html = `
          <i class="${item.icon}"></i>
        `;

		document.querySelector('.saito-profile-icons').innerHTML += html;
	}

	renderTweets() {
		if (document.querySelector('.tweet-manager')) {
			document.querySelector('.tweet-manager').innerHTML = '';
		}

		if (this.tab == 'posts') {
			for (let z = 0; z < this.posts.length; z++) {
				this.posts[z].render();
			}
		}
		if (this.tab == 'replies') {
			for (let z = 0; z < this.replies.length; z++) {
				this.replies[z].render();
			}
		}

		if (this.tab == 'retweets') {
			for (let z = 0; z < this.retweets.length; z++) {
				this.retweets[z].render();
			}
		}

		if (this.tab == 'likes') {
			for (let z = 0; z < this.likes.length; z++) {
				this.likes[z].render();
			}
		}
	}
}

module.exports = SaitoProfile;
