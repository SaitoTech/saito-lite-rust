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

		// employ non-standard css to spacing in header
		this.header_class = ''; // e.g. game, wide-screen, arcade

		// Header collects notifications to display a count on the hamburger icon
		this.notifications = {};

		// navigation for clicking on Saito logo in header
		this.header_location = '/' + mod.returnSlug();

		// Store the mod functions for when you click icon in the menu, e.g. "RedSquare"
		this.callbacks = {};

		this.balance_check_interval = null;
		this.deposit_check_interval = null;

		this.can_update_header_msg = true;
		this.show_msg = true;

		this.loader = new SaitoLoader(this.app, this.mod, '#qrcode');
		this.saito_backup = new SaitoBackup(app, mod);

		console.log('Create Saito Header for ' + mod.name);
	}

	async initialize(app) {

		await super.initialize(app);

		// Create here because need publicKey defined
		this.userMenu = new UserMenu(app, this.publicKey);

		// Add listeners

		app.connection.on('registry-update-identifier', (publicKey) => {
			if (publicKey === this.publicKey) {
				this.renderUsername();
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
			console.log("$$$$ wallet-updated --> check balance of preferred crypto");
			
			await this.renderCrypto();

			//await this.checkBalanceUpdate();
		});

		app.connection.on('block-fetch-status', (count) => {
			// trigger block sync ui here
			//console.log("blocks currently being fetched : ", count);
		});

		app.connection.on('header-update-crypto', async () => {
			if (!this.installing_crypto){
				//console.log("$$$$ header-update-crypto --> renderCrypto");
				await this.renderCrypto();	
			}else{
				console.log("dont render crypto");
			}
		});

		app.connection.on('header-install-crypto', (ticker) => {
				console.log("install crypto");
				this.installing_crypto = ticker;
				try {
					document.querySelector('#qrcode').innerHTML = '';
					document.querySelector(".balance-amount").innerHTML = "";
					const addressContainer = document.querySelector('#profile-public-key');
					if (addressContainer){
						addressContainer.dataset.add = "";
						addressContainer.innerHTML = '<div>generating keys...</div>';
						addressContainer.classList.add('generate-keys');
					}
					this.loader.show();
					siteMessage(`Installing ${ticker} in Saito Multiwallet...`, 2000);
				} catch (err) {
					console.error(err);
				}
		});

		app.connection.on('crypto-activated', (ticker) => {
			if (this.installing_crypto && this.installing_crypto == ticker) {
				setTimeout(()=> {
					this.installing_crypto = false;
					this.app.options.wallet.backup_required = `Your wallet has added new crypto keys -- ${ticker}. 
					Unless you backup your wallet, you may lose any deposits with those keys. 
					Do you want help backing up your wallet?`;

					this.app.connection.emit('saito-backup-render-request', {
						msg: this.app.options.wallet.backup_required,
						title: 'BACKUP YOUR WALLET'
					});

				}, 1500);
			}

			console.log("$$$$ crypto-activated --> renderCrypto");
			this.renderCrypto(true);

		})

		//
		// This allows us to replace the saito logo with a back arrow and a click event
		// In the future, we may want to parameterize what we replace the logo with
		//
		app.connection.on('saito-header-replace-logo', (callback = null) => {
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

		app.connection.on('saito-header-change-location', (new_path) => {
			this.header_location = new_path;
		});

		app.connection.on('saito-header-reset-logo', () => {
			this.resetHeaderLogo();
		});

		app.connection.on('saito-header-notification', (source_mod, unread) => {
			this.notifications[source_mod] = unread;

			let total = 0;
			for (let m in this.notifications) {
				total += this.notifications[m];
			}

			this.app.browser.addNotificationToId(total, 'saito-header-menu-toggle');
		});


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
		//console.log("$$$$ header.Render --> renderCrypto");
		await this.renderCrypto(true);

		//
		// Nothing happens here
		//
		await this.app.modules.renderInto('.saito-header');

		// 
		// Insert user's name 
		//
		this.renderUsername();

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
			app.connection.emit('saito-crypto-withdraw-render-request');
			this.hideMenu();
		};

		document.querySelector('#wallet-btn-history').onclick = (e) => {
			app.connection.emit('saito-crypto-history-render-request');
			this.hideMenu();
		};

		document.querySelector('.pubkey-containter').onclick = async (e) => {
			let public_key = document.getElementById('profile-public-key').dataset.add;

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

				this.clearBalanceCheck();
				this.clearPendingDepositsCheck();
				await app.wallet.setPreferredCrypto(element.value);
				console.log("Change preferred crypto, restart polls on crypto balance and pending deposits");
				this.initiateBalanceCheck();
				this.initiatePendingDepositsCheck();
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

	toggleMenu() {
		if (
			document.querySelector('.saito-header-hamburger-contents').classList.contains('show-menu')
		) {
			document.querySelector('.saito-header-hamburger-contents').classList.remove('show-menu');
			document.querySelector('.saito-header-backdrop').classList.remove('menu-visible');
			//document.getElementById('saito-header').style.zIndex = 15;

			this.clearBalanceCheck();
			this.clearPendingDepositsCheck();
		} else {
			document.querySelector('.saito-header-hamburger-contents').classList.add('show-menu');
			document.querySelector('.saito-header-backdrop').classList.add('menu-visible');
			//document.getElementById('saito-header').style.zIndex = 20;

			console.log("Menu open, start polls on crypto balance and pending deposits");
			this.initiateBalanceCheck();
			this.initiatePendingDepositsCheck();
		}
	}

	hideMenu() {
		if (
			document.querySelector('.saito-header-hamburger-contents').classList.contains('show-menu')
		) {
			document.querySelector('.saito-header-hamburger-contents').classList.remove('show-menu');
			document.querySelector('.saito-header-backdrop').classList.remove('menu-visible');
			//document.getElementById('saito-header').style.zIndex = 15;
		}

		this.clearBalanceCheck();
	}


	/****************************************************
	 * 
	 * A pair of functions to update the user name field in the header
	 * and attach click functionality. 
	 * 
	 ***************************************************/

	updateHeaderMessage(text = '', flash = false, callback = null, timeout = 0) {
		let this_self = this;

		if (text == '') {
			console.log("updateHeaderMessage->renderUsername");
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
					this_self.updateHeaderMessage();
				}, timeout);
			}

			el.onclick = (e) => {
				return callback();
			};
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
		el.classList.remove('flash');

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
					header_self.app.connection.emit('saito-backup-render-request', );
				};
			}
		}

		if (this.app.options.wallet?.backup_required) {
			// Display the (updated) user name for a few seconds before restoring the flashing warning
			setTimeout(()=> {
				// Make sure still neeeded!
				if (this.app.options.wallet?.backup_required) {
					// Backwards compatibility
					if (this.app.options.wallet.backup_required == 1){
						this.app.options.wallet.backup_required = `Have you backed up your wallet recently? Saito is not responsible for the loss of keys or deposited funds`;
					}

					console.log('Restore flashing reminder from saito-header');
					this.updateHeaderMessage('wallet backup required', true, ()=>{
						this.app.connection.emit('saito-backup-render-request', {
							msg: this.app.options.wallet.backup_required,
							title: 'BACKUP YOUR WALLET'
						});
					});
				}
			}, 4500);
		}

	}

	/********************************************************
	 * ******************************************************
	 *
	 * Integrate Saito MultiWallet
	 *
	 * *******************************************************
	 * *******************************************************/

	async renderCrypto(force = false) {
		let available_cryptos = this.app.wallet.returnInstalledCryptos();
		let preferred_crypto = this.app.wallet.returnPreferredCrypto();
		let add = preferred_crypto.returnAddress();

		const addressContainer = document.querySelector('#profile-public-key');

		try {
			
			if (add && addressContainer) {
				if (addressContainer.dataset?.add != add || force) {
					
					//console.log("$$$$ Rendering crypto in Saito Header");
					if (addressContainer.classList.contains('generate-keys')) {
						addressContainer.classList.remove('generate-keys');
					}

					//Set address
					addressContainer.dataset.add = add;

					addressContainer.innerHTML = `${add.slice(0, 8)}...${add.slice(-8)}`;

					// There is an annoying flicker when a new qr code is added because canvas resizing / img generation
					document.querySelector('#qrcode').style.visibility = "hidden";
					document.querySelector('#qrcode').style.opacity = "0";

					document.querySelector('#qrcode').innerHTML = '';
					this.app.browser.generateQRCode(add, 'qrcode');
					setTimeout(()=>{
						document.querySelector('#qrcode').removeAttribute('style');
					}, 100);
				}	
			}else{
				console.log("$$$ header or crypto not rendered yet", preferred_crypto, add, addressContainer);
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
				this.app.browser.addElementToSelector(html, '.wallet-select-crypto');
			}
		} catch (err) {
			console.error('Error rendering crypto selector: ' + err);
		}

		//Insert crypto balance
		try {
			if (preferred_crypto.isActivated()) {

				let balance_as_string = preferred_crypto.returnBalance();
				
				document.querySelector(".balance-amount").innerHTML = this.app.browser.returnBalanceHTML(balance_as_string);

				// Cache so polling loop will detect changes
				this.current_balance = Number(balance_as_string);
			}
		} catch (err) {
			console.error('Error rendering crypto balance: ' + err);
		}
	}


	initiateBalanceCheck() {

		let intervalTime = 2000;

		let preferred_crypto = this.app.wallet.returnPreferredCrypto();

		const executeBalanceCheck = async () => {
			// dont poll if hamburger menu isnt visible
			if (document.querySelector('.saito-header-backdrop.menu-visible') == null) {
				this.clearBalanceCheck();
				console.log(`Stopped checking ${preferred_crypto.ticker} balance`);
				return;
			}

			// Call function to check
			await this.checkBalanceUpdate();

			//loop on time out
			this.balance_check_interval = setTimeout(executeBalanceCheck, intervalTime);

			//double wait on each loop
			intervalTime *= 2;
		
		};

		executeBalanceCheck(); // Start the loop
	}

	async checkBalanceUpdate() {
		try {
			let this_self = this;
			let preferred_crypto = await this.app.wallet.returnPreferredCrypto();

			await preferred_crypto.checkBalance();

			let new_balance = Number(preferred_crypto.returnBalance());

			if (this.current_balance == null) {
				this.current_balance = new_balance;
			}

			console.log(preferred_crypto.ticker, "new_balance > this.current_balance:", new_balance, this.current_balance);
			
			// No change!
			if (new_balance == this.current_balance){
				return;
			}

			//

			if (new_balance > this.current_balance) {
				let diff = new_balance - this.current_balance;
				let deposit = this.app.browser.formatDecimals(diff);
				let msg = `New ${deposit} ${preferred_crypto.ticker} deposit`;
				siteMessage(msg, 3000);
			}else{
				//new withdrawal
				let diff = this.current_balance - new_balance;
				let deposit = this.app.browser.formatDecimals(diff);
				let msg = `New ${deposit} ${preferred_crypto.ticker} payment`;
				siteMessage(msg, 3000);				
			}

			//console.log("$$$$ checkBalanceUpdate --> renderCrypto");
			this.renderCrypto();

		} catch (err) {
			console.warn('Error in checkBalanceUpdate: ', err);
		}
	}

	clearBalanceCheck() {
		clearTimeout(this.balance_check_interval);
	}

	clearPendingDepositsCheck() {
		clearInterval(this.deposit_check_interval);
	}

	initiatePendingDepositsCheck() {
		let this_self = this;
		let confirmations = 0;
		let intervalTime = 5000; // Start with 5 seconds
		let preferred_crypto = this_self.app.wallet.returnPreferredCrypto();

		const checkDeposits = async () => {
			// dont poll if hamburger menu isnt visible
			if (document.querySelector('.saito-header-backdrop.menu-visible') == null) {
				this.clearPendingDepositsCheck();
				console.log(`Stopped checking ${preferred_crypto.ticker} deposit`);
				return;
			}

			console.log("check pending deposits");

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

						this_self.deposit_pending = true;

						if (this_self.show_msg) {
							siteMessage(`New ${preferred_crypto.ticker} deposit`, 3000);
							this_self.show_msg = false;
						}
					} else {
						this_self.show_msg = true;
					}
				} else {
					if (this_self?.deposit_pending) {
						this_self.deposit_pending = false;
						//this_self.updateHeaderMessage();
					}

					if (this_self.can_update_header_msg) {
						//this_self.updateHeaderMessage();
						this_self.show_msg = true;
					}
				}
			});

			// Double the interval and schedule the next check
			intervalTime *= 2;
			this.deposit_check_interval = setTimeout(checkDeposits, intervalTime);
		};

		console.log(`Started checking ${preferred_crypto.ticker} deposit`);
		checkDeposits();
	}
}

module.exports = SaitoHeader;
