const SaitoHeaderTemplate = require('./saito-header.template');
const FloatingMenu = require('./saito-floating-menu.template');
const SaitoOverlay = require('./../../ui/saito-overlay/saito-overlay');
const UIModTemplate = require('./../../../templates/uimodtemplate');
const UserMenu = require('../../ui/modals/user-menu/user-menu');
const SaitoLoader = require('../saito-loader/saito-loader');
const SaitoBackup = require('../saito-backup/saito-backup');
//
// UIModTemplate
//
// The header derives from UIModTemplate -- this allows the component
// to be added to the list of modules that are actively running on Saito
// thus allowing them to receive transactions and update their UI just
// like any other modules.
//

//
// Note: inherits this.publicKey from modtemplate
//
class SaitoHeader extends UIModTemplate {
	constructor(app, mod) {
		super(app);

		//
		// UI components as modules allows them to respond
		// to events individually...
		//
		this.name = 'SaitoHeader UIComponent';
		this.slug = 'SaitoHeader';
		this.app = app;
		this.mod = mod;
		this.header_class = '';

		this.is_open = false;
		this.time_last = new Date().getTime();
		this.time_open = 0;
		this.balance_queries = 0;
		this.query_active = false;
		this.loader = new SaitoLoader(this.app, this.mod, '#qrcode');
		this.notifications = {};
		this.header_location = '/' + mod.returnSlug();

		this.callbacks = {};

		//
		// now initialize, since UI components are created
		// after all other modules have initialized, we need
		// to run any missed functions here in the constructor
		// in this case, initialize, as that is what processes
		// receiveEvent, etc.
		//
		// this.initialize(app); // Always ran immediately after constructor in modules that use it.

		//
		// This allows us to replace the saito logo with a back arrow and a click event
		// In the future, we may want to parameterize what we replace the logo with
		//
		this.app.connection.on('saito-header-replace-logo', (callback = null) => {
			if (!document.querySelector('.saito-back-button')) {
				this.app.browser.addElementToSelector(
					`<i class="saito-back-button fa-solid fa-arrow-left"></i>`,
					'.saito-header-logo-wrapper'
				);

				document.querySelector('.saito-header-logo-wrapper').onclick = (e) => {
					if (callback) {
						callback(e);
					}
				};
			}
		});

		this.app.connection.on('saito-header-change-location', (new_path) => {
			this.header_location = new_path;
		});

		this.app.connection.on('saito-header-reset-logo', () => {
			this.resetHeaderLogo();
		});

		this.app.connection.on('saito-header-notification', (source_mod, unread) => {
			this.notifications[source_mod] = unread;

			let total = 0;
			for (let m in this.notifications) {
				total += this.notifications[m];
			}

			this.app.browser.addNotificationToId(total, 'saito-header-menu-toggle');
		});

		this.balance_check_tries = 200;
		this.balance_check_interval = null;
		this.deposit_check_interval = null;
		this.show_msg = true;
		this.deposit_pending = false;
		this.current_balance = 0;

		this.saito_backup = new SaitoBackup(app, mod);

		this.can_update_header_msg = true;


		this.withdraw = {
			progress: false,
			amount: 0
		};

		console.log('Create Saito Header for ' + mod.name);
	}

	async initialize(app) {
		await super.initialize(app);
		await this.updateCurrentBalance();

		this.userMenu = new UserMenu(app, this.publicKey);

		this.callbacks = {};

		// Load callbacks for iteracting apps / navigation


		// Add listeners

		app.connection.on('update_identifier', (publicKey) => {
			if (publicKey === this.publicKey) {
				this.render();
			}
		});

		app.connection.on('saito-header-update-message', (obj = {}) => {
			console.log('update header obj: ', obj);

			let msg = '';
			this.can_update_header_msg = true;
			if ('msg' in obj) {
				msg = obj.msg;
				this.can_update_header_msg = false;
			}

			let flash = false;
			if ('flash' in obj) {
				flash = obj.flash;
			}

			let callback = null;
			if ('callback' in obj) {
				callback = obj.callback;
			}

			let timeout = null;
			if ('timeout' in obj) {
				timeout = obj.timeout;
			}

			this.updateHeaderMessage(msg, flash, callback, timeout);
		});


		// wallet-updated event is fired from rust to SLR
		// please dont rename/remove this method
		// else we wont get updated slips
		app.connection.on('wallet-updated', async () => {
			await this.renderCrypto();
		});

		app.connection.on('block-fetch-status', (count) => {
			// trigger block sync ui here
			//console.log("blocks currently being fetched : ", count);
		});

		app.connection.on('header-update-balance', async () => {
			await this.renderCrypto();
		});

		app.connection.on('header-install-crypto', (ticker) => {
			try {
				document.querySelector('#qrcode').innerHTML = '';
				document.querySelector('#profile-public-key').innerHTML = 'generating keys...';
				document.querySelector('#profile-public-key').classList.add('generate-keys');
				this.loader.show();
				siteMessage(`Installing ${ticker} in Saito Multiwallet...`, 2000);
			} catch (err) {
				console.error(err);
			}
		});

		app.connection.on('saito-header-withdraw-progress', (obj = {}) => {
			console.log('withdraw obj: ', obj);
			this.withdraw.progress = true;
			if ('amount' in obj) {
				this.withdraw.amount = Number(obj.amount);
			}
			if (document.querySelector('.balance-amount')) {
				document.querySelector('.balance-amount').classList.add('flash');
			}
		});


	}

	async updateCurrentBalance() {
		let preferred_crypto = this.app.wallet.returnPreferredCrypto();
		await preferred_crypto.returnBalance();
		this.current_balance = Number(preferred_crypto.balance);
	}

	resetHeaderLogo() {
		let logo = document.querySelector('.saito-header-logo-wrapper');
		if (logo) {
			logo.innerHTML = `
	      <img class="saito-header-logo" alt="Logo" src="/saito/img/logo.svg" />
	    `;

			logo.onclick = (e) => {
				navigateWindow(this.header_location, 300);
			};
		}
	}

	async render() {
		if (this.mod == null || !document) {
			return;
		}

		//
		// add basic framework to DOM if needed
		//
		if (!document.getElementById('saito-header')) {
			this.app.browser.prependElementToDom(SaitoHeaderTemplate(this.app, this.mod, this.header_class));
		} else {
			this.app.browser.replaceElementById(
				SaitoHeaderTemplate(this.app, this.mod, this.header_class),
				'saito-header'
			);
		}

		//
		// Header Logo
		//
		this.resetHeaderLogo();

		//
		// Add a short cut
		//
		if (this.mod?.use_floating_plus) {
			if (!document.getElementById('saito-floating-menu')) {
				this.app.browser.addElementToDom(FloatingMenu());
				this.addFloatingMenu();
			}
		}

		// 
		// Process the respondTos for apps that install in the Hamburger menu 
		//
		this.addHamburgerMenu();

		//
		// render QR code and cryptos
		//
		await this.renderCrypto();

		//
		// Nothing happens here
		//
		await this.app.modules.renderInto('.saito-header');

		// 
		// Insert user's name or a warning message
		//
		if (this.app.options.wallet?.backup_required_msg) {
			let this_header = this;
				console.log('Restore flashing reminder from saito-header');
				this.app.connection.emit('saito-header-update-message', {
					msg: 'wallet backup required',
					flash: true,
					callback: function () {
						this_header.app.connection.emit('recovery-backup-overlay-render-request');
					}
				});
			}else{
				this.renderUsername();
			}

		this.attachEvents();
	}

	/*******************************************
	 * 
	 * Process and add floating plus menu items
	 * 
	********************************************/
	addFloatingMenu() {
		let this_header = this;

		let index = 0;
		let menu_entries = [];

		//
		// collect menu items from respondTos
		//
		let mods = this.app.modules.respondTo('saito-floating-menu');
		for (const mod of mods) {
			let item = mod.respondTo('saito-floating-menu');

			if (item instanceof Array) {
				item.forEach((j) => {
					if (!j.rank) {
						j.rank = 100;
					}
					menu_entries.push(j);
				});
			}
		}

		// Sort menu items
		//
		let menu_sort = function (a, b) {
			if (a.rank < b.rank) {
				return 1;
			}
			if (a.rank > b.rank) {
				return -1;
			}
			return 0;
		};

		menu_entries = menu_entries.sort(menu_sort);

		// Check filters and add HTML
		//
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
				let id = `saito_floating_menu_item_${index}`;
				this_header.callbacks[index] = j.callback;
				this_header.addFloatingMenuItem(j, id, index);
				index++;
			}
		}
	}

	addFloatingMenuItem(item, id, index) {
		let html = `
		      <div id="${id}" data-id="${index}" class="saito-floating-menu-item">
		        <i class="${item.icon}"></i>
		      </div>
    		`;

		if (item?.is_active) {
			this.app.browser.addElementToSelector(html, '.saito-floating-item-container.main');
		} else {
			this.app.browser.addElementToSelector(html, '.saito-floating-item-container.alt');
		}
	}

	/*******************************************
	 * 
	 * Process and add floating main menu items
	 * 
	********************************************/
	addHamburgerMenu(){
		let mods = this.app.modules.respondTo('saito-header');

		let index = 0;
		let menu_entries = [];
		for (const mod1 of mods) {
			let item = mod1.respondTo('saito-header');
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
				let id = `saito_header_menu_item_${index}`;
				this.callbacks[id] = j.callback;
				this.addMenuItem(j, id);
				index++;

				if (j.event) {
					j.event(id);
				}
			}
		}

	}

	addMenuItem(item, id) {
		let html = `     
      <li id="${id}" data-id="${item.text}" class="saito-header-appspace-option">
        <i class="${item.icon}"></i>
        <span>${item.text}</span>
      </li>
    `;

		if (typeof item.type != 'undefined') {
			document.querySelector('.' + item.type + '  .saito-menu > ul').innerHTML += html;
		} else {
			document.querySelector(
				'.saito-header-menu-section.appspace-menu > .saito-menu > ul'
			).innerHTML += html;
		}
	}

	attachEvents() {
		let app = this.app;
		let mod = this.mod;
		let this_header = this;

		document.querySelectorAll('.saito-header-appspace-option').forEach((menu) => {
			let id = menu.getAttribute('id');
			let data_id = menu.getAttribute('data-id');
			let callback = this_header.callbacks[id];

			menu.addEventListener('click', async (e) => {
				this.toggleMenu();
				e.preventDefault();
				callback(app, data_id);
			});
		});

		if (document.querySelector('#saito-header-menu-toggle')) {
			document.querySelector('#saito-header-menu-toggle').addEventListener('click', () => {
				this.toggleMenu();
			});
		}

		if (document.querySelector('.saito-header-backdrop')) {
			document.querySelector('.saito-header-backdrop').onclick = () => {
				this.toggleMenu();
			};
		}

		//
		// default buttons
		//
		let username = app.keychain.returnIdentifierByPublicKey(this.publicKey, true);
		if (username && username != this.publicKey) {
			console.log('update 4 ////');
			this.updateHeaderMessage(username);
		}

		document.querySelector('#wallet-btn-withdraw').onclick = (e) => {
			let ticker = e.currentTarget.getAttribute('data-ticker');
			let balance = e.currentTarget.getAttribute('data-balance');
			let sender = e.currentTarget.getAttribute('data-sender');

			let obj = {};
			obj.address = '';
			obj.amount = balance;
			obj.balance = balance;
			obj.ticker = ticker;
			app.connection.emit('saito-crypto-withdraw-render-request', obj);
			this.hideMenu();
		};
		document.querySelector('#wallet-btn-history').onclick = (e) => {
			let obj = {};
			obj.ticker = document.querySelector('#wallet-btn-history').getAttribute('data-ticker');
			app.connection.emit('saito-crypto-history-render-request', obj);
			this.hideMenu();
		};

		document.querySelector('.pubkey-containter').onclick = async (e) => {
			let public_key = document.getElementById('profile-public-key').innerHTML;

			console.log('publicKey:', public_key);

			await navigator.clipboard.writeText(public_key);
			let icon_element = document.querySelector('.pubkey-containter i');
			icon_element.classList.toggle('fa-copy');
			icon_element.classList.toggle('fa-check');

			setTimeout(() => {
				icon_element.classList.toggle('fa-copy');
				icon_element.classList.toggle('fa-check');
			}, 800);
		};

		//
		// Change preferred (displayed) crypto currency
		//
		document.querySelectorAll('#wallet-select-crypto').forEach((element, i) => {
			element.onchange = async (value) => {
				//
				// This is a hook for appstore installing additional cryptos
				//
				/*if (element.value === 'add-new') {
						let current_default = app.wallet.returnPreferredCrypto();
						let select_box = document.querySelector(
							'.saito-select-crypto'
						);
						select_box.value = current_default.name;
						let appstore_mod = app.modules.returnModule('AppStore');
						if (appstore_mod) {
							let options = {
								search: '',
								category: 'Cryptocurrency',
								featured: 1
							};
							appstore_mod.openAppstoreOverlay(options);
						} else {
							salert(
								'Cannot install other cryptocurrencies without the appstore!'
							);
						}
						return;
					}*/

				await app.wallet.setPreferredCrypto(element.value);
			};
		});

		if (document.querySelector('.more-options') != null) {
			document.querySelector('.more-options').onclick = (e) => {
				app.connection.emit('settings-overlay-render-request');
			};
			this.hideMenu();
		}

		if (document.querySelector('#saito-floating-plus-btn')) {
			document.getElementById('saito-floating-plus-btn').onclick = (e) => {
				document.getElementById('saito-floating-menu').classList.toggle('activated');
			};
		}

		if (document.getElementById('saito-floating-menu-mask')) {
			document.getElementById('saito-floating-menu-mask').onclick = (e) => {
				let mask = e.currentTarget;

				document.getElementById('saito-floating-menu').classList.toggle('activated');
			};
		}

		document.querySelectorAll('.saito-floating-menu-item').forEach((menu) => {
			let id = menu.getAttribute('id');
			let data_id = menu.getAttribute('data-id');
			let callback = this_header.callbacks[data_id];

			menu.onclick = (e) => {
				e.preventDefault();
				callback(this_header.app, data_id);
				console.log('hi!');
				document.getElementById('saito-floating-menu').classList.toggle('activated');
			};
		});
	}

	async toggleMenu() {
		if (
			document.querySelector('.saito-header-hamburger-contents').classList.contains('show-menu')
		) {
			document.querySelector('.saito-header-hamburger-contents').classList.remove('show-menu');
			document.querySelector('.saito-header-backdrop').classList.remove('menu-visible');
			//document.getElementById('saito-header').style.zIndex = 15;
			this.is_open = false;

			this.clearBalanceCheck();
			this.clearPendingDepositsCheck();
		} else {
			document.querySelector('.saito-header-hamburger-contents').classList.add('show-menu');
			document.querySelector('.saito-header-backdrop').classList.add('menu-visible');
			//document.getElementById('saito-header').style.zIndex = 20;
			this.is_open = true;

			await this.checkBalanceUpdate();
			await this.initiateBalanceCheck();
			await this.initiatePendingDepositsCheck();
		}
	}

	updateHeaderMessage(text = '', flash = false, callback = null, timeout = 0) {
		let this_self = this;
		//if (this.can_update_header_msg) {
		if (text == '') {
			this.renderUsername();
		} else {
			document.querySelector('#header-msg').innerHTML = text;
		}

		if (flash) {
			document.querySelector('#header-msg').classList.add('flash');
		} else {
			document.querySelector('#header-msg').classList.remove('flash');
		}

		if (callback != null) {
			let el = document.getElementById('header-msg');

			console.log('timeout: //////////', timeout);

			if (timeout) {
				setTimeout(function () {
					console.log('Clear flashing reminder from saito-header/updateHeaderMessage');
					this_self.app.connection.emit('saito-header-update-message');
				}, timeout);
			}

			el.onclick = (e) => {
				return callback();
			};
		}
		//}
	}

	hideMenu() {
		if (
			document.querySelector('.saito-header-hamburger-contents').classList.contains('show-menu')
		) {
			document.querySelector('.saito-header-hamburger-contents').classList.remove('show-menu');
			document.querySelector('.saito-header-backdrop').classList.remove('menu-visible');
			//document.getElementById('saito-header').style.zIndex = 15;
			this.is_open = false;
		}

		clearInterval(this.balance_check_interval);
		this.balance_check_tries = 200;
	}

	setAttributes(el, attrs) {
		if (el) {
			for (let key in attrs) {
				el.setAttribute(key, attrs[key]);
			}
		}
	}

	renderUsername() {
		let header_self = this;

		let key = this.app.keychain.returnKey(this.publicKey);
		let username = key?.identifier ? key.identifier : '';

		if (username == '' || username == this.publicKey) {
			if (this.app.browser.isMobileBrowser()) {
				username = 'Anonymous';
			} else {
				username = 'Anonymous Account';
			}
			if (key?.has_registered_username) {
				username = 'registering...';
			}
		}

		let el = document.getElementById('header-msg');
		if (!el) {
			return;
		}

		//Update name
		el.innerHTML = sanitize(username);

		//Differential behavior
		if (username === 'Anonymous Account' || username === 'Anonymous') {
			el.onclick = (e) => {
				header_self.app.connection.emit('register-username-or-login', {
					success_callback: (desired_identifier) => {
						header_self.app.connection.emit('recovery-backup-overlay-render-request', {
							desired_identifier
						});
					}
				});
			};
		} else if (username == 'Registering...') {
			el.onclick = null;
		} else {
			if (key?.email) {
				//Launch profile
				el.onclick = (e) => {
					header_self.userMenu.render();
				};
			} else {
				//Prompt email registration
				el.onclick = (e) => {
					header_self.app.connection.emit('recovery-backup-overlay-render-request');
				};
			}
		}
	}

	/*******************************************************
	 *
	 * Integrate Saito MultiWallet
	 *
	 *******************************************************/

	async renderCrypto() {
		let available_cryptos = this.app.wallet.returnInstalledCryptos();
		let preferred_crypto = this.app.wallet.returnPreferredCrypto();
		let add = preferred_crypto.returnAddress();

		try {
			if (add) {
				if (document.querySelector('#profile-public-key').innerHTML != add) {
					if (document.querySelector('#profile-public-key').classList.contains('generate-keys')) {
						document.querySelector('#profile-public-key').classList.remove('generate-keys');
					}

					document.querySelector('#profile-public-key').innerHTML = add;
					document.querySelector('#qrcode').innerHTML = '';
					this.app.browser.generateQRCode(add, 'qrcode');
				}
			}

			if (document.querySelector('#wallet-btn-history')) {
				document
					.querySelector('#wallet-btn-history')
					.setAttribute('data-asset-id', preferred_crypto.asset_id);
				document
					.querySelector('#wallet-btn-history')
					.setAttribute('data-ticker', preferred_crypto.ticker);
			}

			document.querySelector('.wallet-select-crypto').innerHTML = '';

			//
			// add crypto options
			//
			let html = '';
			for (let i = 0; i < available_cryptos.length; i++) {
				let crypto_mod = available_cryptos[i];
				html = `<option ${crypto_mod.name == preferred_crypto.name ? 'selected' : ``} 
        id="crypto-option-${crypto_mod.name}" value="${crypto_mod.ticker}">${
					crypto_mod.ticker
				}</option>`;
				this.app.browser.addElementToElement(html, document.querySelector('.wallet-select-crypto'));
			}
		} catch (err) {
			console.error('Error rendering crypto selector: ' + err);
		}

		//Insert crypto balance
		try {
			if (preferred_crypto.isActivated()) {
				let balance = await preferred_crypto.formatBalance();
				this.showBalance(balance);

				let profile_pub_key = document.querySelector('#profile-public-key');
				let withdraw = document.querySelector('#wallet-btn-withdraw');

				let address = preferred_crypto.returnAddress();
				this.setAttributes(profile_pub_key, {
					'data-assetid': preferred_crypto.asset_id,
					'data-ticker': preferred_crypto.ticker,
					'data-balance': balance,
					'data-address': address
				});

				this.setAttributes(withdraw, {
					'data-assetid': preferred_crypto.asset_id,
					'data-ticker': preferred_crypto.ticker,
					'data-balance': balance,
					'data-sender': address
				});
			}
		} catch (err) {
			console.error('Error rendering crypto balance: ' + err);
		}
	}

	showBalance(balance = '0.00') {
		let separator = this.app.browser.getDecimalSeparator();
		let split = balance.split(`${separator}`);
		let whole_amt = split[0];
		let decimal_amt = typeof split[1] != 'undefined' ? split[1] : '00';

		//	console.log("whole_amt, separator, decimal_amt", whole_amt, separator, decimal_amt);

		document.querySelector(`.balance-amount-whole`).innerHTML = whole_amt;
		document.querySelector(`.balance-amount-separator`).innerHTML = separator;
		document.querySelector(`.balance-amount-decimal`).innerHTML = decimal_amt;
	}

	async initiateBalanceCheck() {
		let this_self = this;
		let intervalTime = 10000;

		let preferred_crypto = this.app.wallet.returnPreferredCrypto();

		const executeBalanceCheck = async () => {
			// dont poll if hamburger menu isnt visible
			if (document.querySelector('.saito-header-backdrop.menu-visible') == null) {
				console.log(`Stopped checking ${preferred_crypto.ticker} balance`);
				return;
			}

			if (this_self.balance_check_tries > 0) {
				console.log('Balance check request:', this_self.balance_check_tries);
				await this_self.checkBalanceUpdate();
				this_self.balance_check_tries--;

				setTimeout(executeBalanceCheck, intervalTime);
				intervalTime *= 2;
			} else {
				this_self.hideMenu();
			}
		};

		console.log(`Started checking ${preferred_crypto.ticker} balance`);
		executeBalanceCheck(); // Start the loop
	}

	async checkBalanceUpdate() {
		try {
			let this_self = this;
			let preferred_crypto = await this.app.wallet.returnPreferredCrypto();
			await preferred_crypto.returnBalance();
			let new_balance = Number(preferred_crypto.balance);

			if (this.current_balance == null) {
				this.current_balance = new_balance;
			}

			//console.log("new_balance > this.current_balance:", new_balance, this.current_balance);

			if (new_balance > this.current_balance) {
				let diff = new_balance - this.current_balance;
				let deposit = this.app.browser.formatDecimals(diff);
				let msg = `New ${deposit} ${preferred_crypto.ticker} deposit`;
				siteMessage(msg, 3000);
			}

			if (new_balance != this.current_balance) {
				this.current_balance = new_balance;
				this.renderCrypto();
			}
		} catch (err) {
			console.warn('Error in checkBalanceUpdate: ', err);
		}
	}

	clearBalanceCheck() {
		clearInterval(this.balance_check_interval);
		this.balance_check_tries = 200;
	}

	clearPendingDepositsCheck() {
		clearInterval(this.deposit_check_interval);
	}

	async initiatePendingDepositsCheck() {
		let this_self = this;
		let confirmations = 0;
		let intervalTime = 10000; // Start with 10 seconds
		let preferred_crypto = this_self.app.wallet.returnPreferredCrypto();

		const checkDeposits = async () => {
			// dont poll if hamburger menu isnt visible
			if (document.querySelector('.saito-header-backdrop.menu-visible') == null) {
				console.log(`Stopped checking ${preferred_crypto.ticker} deposit`);
				return;
			}

			if (this_self.app.options.crypto != null) {
				if (this_self.app.options.crypto[preferred_crypto.ticker]) {
					if (this_self.app.options.crypto[preferred_crypto.ticker].confirmations) {
						confirmations = this_self.app.options.crypto[preferred_crypto.ticker].confirmations;
					} else {
						let network_info = await preferred_crypto.returnNetworkInfo(preferred_crypto.asset_id);
						if (typeof network_info.confirmations != 'undefined') {
							confirmations = network_info.confirmations;
							this_self.app.options.crypto[preferred_crypto.ticker].confirmations = confirmations;
							await this_self.app.wallet.saveWallet();
						}
					}
				}
			}

			await preferred_crypto.fetchPendingDeposits(function (res) {
				if (res.length > 0) {
					let pending_transfer = res[res.length - 1];

					console.log('pending_transfer: ', pending_transfer);

					let amount = Number(pending_transfer.amount);

					console.log(`${amount} ${preferred_crypto.ticker} deposit pending 
                    (${pending_transfer.confirmations}/${confirmations})`);

					if (amount > 0) {
						this_self.updateHeaderMessage(
							`${amount} ${preferred_crypto.ticker} deposit pending 
                        (${pending_transfer.confirmations}/${confirmations})`,
							true,
							function () {
								this_self.app.connection.emit('saito-crypto-history-render-request', {});
							}
						);

						if (this_self.deposit_pending == false) {
							this_self.deposit_pending = true;
						}

						if (this_self.show_msg) {
							siteMessage(`New ${preferred_crypto.ticker} deposit`, 3000);
							this_self.show_msg = false;
						}
					} else {
						this_self.show_msg = true;
					}
				} else {
					if (this_self.deposit_pending == true) {
						this_self.deposit_pending = false;
						this_self.updateHeaderMessage();
					}

					if (this_self.can_update_header_msg) {
						this_self.updateHeaderMessage();
						this_self.show_msg = true;
					}
				}
			});

			// Double the interval and schedule the next check
			intervalTime *= 2;
			setTimeout(checkDeposits, intervalTime);
		};

		console.log(`Started checking ${preferred_crypto.ticker} deposit`);
		checkDeposits();
	}
}

module.exports = SaitoHeader;
