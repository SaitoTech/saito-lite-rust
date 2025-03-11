const SaitoOverlay = require('../../saito-overlay/saito-overlay');
const userMenuTemplate = require('./user-menu.template');

class UserMenu {
	constructor(app, publicKey) {
		this.app = app;
		this.user_publickey = publicKey;
		this.overlay = new SaitoOverlay(app, null, true, true);
		this.callbacks = {};
	}

	async render() {
		let myPublicKey = await this.app.wallet.getPublicKey();
		console.log("My key: ", myPublicKey, "User key: ", this.user_publickey);
		if (!this.app.wallet.isValidPublicKey(this.user_publickey)){
			console.warn("Invalid publicKey for User Menu!");
			return;
		}
		
		let thisobj = this;
		if (!document.querySelector('#saito-user-menu')) {
			this.overlay.show(userMenuTemplate(this.app, this.user_publickey));

			let mods = this.app.modules.mods;

			let index = 0;
			for (const mod of mods) {
				let item = mod.respondTo('user-menu', {
					publicKey: this.user_publickey
				});
				if (item instanceof Array) {
					item.forEach((j) => {
						let id = `user_menu_item_${index}`;
						thisobj.callbacks[id] = j.callback;
						thisobj.addMenuItem(j, id);
						index++;
					});
				} else if (item != null) {
					let id = `user_menu_item_${index}`;
					thisobj.callbacks[id] = item.callback;
					thisobj.addMenuItem(item, id);
				}
				index++;
			}

			/*************************
      commenting out third party send options, because we dont know the receiver 
      has activated third party cryptos & dont have their trx address
      **************************/
			// let ticker = this.app.wallet.returnPreferredCryptoTicker();
			// if (ticker !== "SAITO") {
			//   let id = `user_menu_item_${index}`;
			//   
			//   thisobj.callbacks[id] = function (app, publicKey) {
			//     alert("Send 3rd Party Crypto");
			//   };
			//   thisobj.addMenuItem({ icon: "fas fa-money-check-dollar", text: `Send ${ticker}` }, id);
			//   index++;
			// } else {

			//
		    //This is not in a respondTo????
			//

			if (this.user_publickey !== myPublicKey){
				let id = `user_menu_item_${index}`;
				thisobj.callbacks[id] = function (app, publicKey) {
					thisobj.app.connection.emit(
						'saito-crypto-withdraw-render-request',
						{ address: publicKey, ticker: 'SAITO' }
					);
				};
				thisobj.addMenuItem(
					{ icon: 'fas fa-money-check-dollar', text: 'Send Crypto' },
					id
				);
				index++;
			}

			//}
		}

		this.attachEvents();
	}

	attachEvents() {
		let thisobj = this;
		let pk = this.user_publickey;
		document
			.querySelectorAll('#saito-user-menu .saito-modal-menu-option')
			.forEach((menu) => {
				let id = menu.getAttribute('id');
				let callback = thisobj.callbacks[id];
				menu.addEventListener('click', () => {
					callback(this.app, pk);
					thisobj.overlay.remove();
				});
			});
	}

	addMenuItem(item, id) {
		document.querySelector('#saito-user-menu .saito-modal-content').innerHTML += `
          <div id="${id}" class="saito-modal-menu-option"><i class="${item.icon}"></i><div>${item.text}</div></div>
        `;
	}
}

module.exports = UserMenu;
