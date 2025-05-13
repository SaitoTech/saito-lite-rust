const SettingsAppspaceTemplate = require('./main.template.js');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const SaitoModule = require('./../../../../lib/saito/ui/saito-module/saito-module');
const jsonTree = require('json-tree-viewer');

class SettingsAppspace {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.privateKey = null;

		this.overlay = new SaitoOverlay(app, mod);
	}

	async render() {

		this.privateKey = await this.app.wallet.getPrivateKey();
		this.overlay.show(SettingsAppspaceTemplate(this.app, this.mod, this));

		/**
		 *  No modules are implementing this, but it is an idea to let modules render a component
		 *  into the Settings appspace overlay
		 */
		let settings_appspace = document.querySelector('.settings-appspace');
		if (settings_appspace) {
			for (let i = 0; i < this.app.modules.mods.length; i++) {
				if (
					this.app.modules.mods[i].respondTo('settings-appspace') !=
					null
				) {
					let mod_settings_obj =
						this.app.modules.mods[i].respondTo('settings-appspace');
					mod_settings_obj.render(this.app, this.mod);
				}
			}
		}

		this.renderDebugTree();
		this.renderStorageInfo();
		this.renderCryptoGameSettings();

		await this.attachEvents();
	}

	//
	// Todo: Add a param to auto open one branch of the tree
	//
	renderDebugTree() {
		//debug info
		let el = document.querySelector('.settings-appspace-debug-content');
		el.innerHTML = '';

		try {
			let optjson = JSON.parse(
				JSON.stringify(
					this.app.options,
					(key, value) =>
						typeof value === 'bigint' ? value.toString() : value // return everything else unchanged
				)
			);
			var tree = jsonTree.create(optjson, el);
		} catch (err) {
			console.log('error creating jsonTree: ' + err);
		}

		if (document.getElementById("delete_marked")){
			document.getElementById("delete_marked").onclick = async (e) => {
				let updated = false;
				Array.from(document.querySelectorAll(".jsontree_node_marked")).forEach(node => {
					updated = true;
					let path = this.getJSONPath(node).replaceAll(`"]`, "").split("[\"");

					let obj = this.app.options;
					while(path.length > 1){
						let key = path.shift();
						if (key){
							obj = obj[key];
						}
					}

					let final_key = path.shift();
					console.log(obj, final_key);
					if (Array.isArray(obj)){
						obj.splice(parseInt(final_key), 1);
					}else{
						delete obj[final_key];	
					}

				});
				this.renderDebugTree();
				let c = await sconfirm(`Would you like to save your ${updated ? "updated " : ""}options file?`)
				if (c) {
					this.app.storage.saveOptions();
				}
			}
		}
	}

	getJSONPath(node){
		if (node.classList.contains("jsontree_tree")){
			return "";
		}

		let currentPath = '';
		//Find the label
		if (node.classList.contains("jsontree_node")){
			if (node.children[0].classList.contains("jsontree_label-wrapper")){
				//currentPath = node.querySelector(".jsontree_label").textContent;
				currentPath = "[" + node.querySelector(".jsontree_label").textContent + "]";
			}
		}

		return this.getJSONPath(node.parentElement) + currentPath;
	}

	renderCryptoGameSettings(){
		if (this.app.options.gameprefs != null) {
			let gameprefs = this.app.options.gameprefs;
			let html = ``;
			for(var key in gameprefs){
				if (key.includes('inbound_trusted') || key.includes('outbound_trusted')) {
					let option_name = key.split('_');
					html += `<div class="settings-appspace-app">
			              <div class="saito-switch">
			                <input type="checkbox" id="${key}" class="crypto_transfers_checkbox" name="${key}" 
			                ${parseInt(gameprefs[key]) == 1 ? `checked="checked"` : ``}">
			              </div>
			              <div class="settings-appspace-crypto-transfer-name">${option_name[2]} ${option_name[3]}</div>
			          </div>`;
				}
			}
			document.querySelector('#settings-appspace-crypto-transfer').innerHTML = html;
		} else {
			// hide container from settings overlay
			document.querySelector('.settings-appspace-crypto-transfer-container').style.display = 'none';
		}
	}

	renderStorageInfo() {
		navigator.storage.estimate().then(estimate => {
			let percentage = estimate.usage / estimate.quota * 100;
			document.querySelector('.settings-appspace-indexdb-info .quota').innerHTML = this.app.browser.formatNumberToLocale(estimate.quota);
			document.querySelector('.settings-appspace-indexdb-info .usage').innerHTML = this.app.browser.formatNumberToLocale(estimate.usage);
			document.querySelector('.settings-appspace-indexdb-info .percent').innerHTML = this.app.browser.formatNumberToLocale(percentage);
    	});

		function getLocalStorageSize() {
			let total = 0;
			for (let key in localStorage) {
				if (localStorage.hasOwnProperty(key)) {
					total += localStorage[key].length + key.length;
				}
			}
			return total;
		}
		
		function getLocalStorageUsagePercentage() {
			const totalSize = getLocalStorageSize();
			const maxSize = 5 * 1024 * 1024; // Estimated 5MB limit
			const percentageUsed = (totalSize / maxSize) * 100;
			return percentageUsed.toFixed(2); // Returns the percentage with 2 decimal points
		}
		
		document.querySelector('.settings-appspace-localstorage-info .quota').innerHTML = this.app.browser.formatNumberToLocale(5 * 1024 * 1024);
		document.querySelector('.settings-appspace-localstorage-info .usage').innerHTML = this.app.browser.formatNumberToLocale(getLocalStorageSize());
		document.querySelector('.settings-appspace-localstorage-info .percent').innerHTML = this.app.browser.formatNumberToLocale(getLocalStorageUsagePercentage());


		console.log(`LocalStorage is ${getLocalStorageUsagePercentage()}% full.`);
    }

	async attachEvents() {
		let app = this.app;
		let mod = this.mod;

		try {
			// Add this new event handler near the start of attachEvents
			document.getElementById('profile-default-fee-input').onchange = (e) => {
				let newDefaultFee = parseFloat(e.target.value);
				let precision = e.target.value.split('.')[1]?.length || 0;
				
				if (newDefaultFee < 0 || newDefaultFee > 7000000000 || precision > 9) {
					siteMessage('Entry invalid if it is negative, bigger than 7,000,000,000 or has more than nine units of precision.', 1000);
					e.target.value = app.wallet.convertNolanToSaito(Number(app.options.wallet.default_fee));
					return;
				}

				// Convert SAITO to nolan for storage
				app.options.wallet.default_fee = app.wallet.convertSaitoToNolan(newDefaultFee.toString());
				app.wallet.default_fee = BigInt(app.options.wallet.default_fee);
				app.options.wallet = app.options.wallet || {};
				app.storage.saveOptions();
				
				siteMessage(`Default fee updated to: ${app.wallet.convertNolanToSaito(BigInt(app.options.wallet.default_fee)).toString()} SAITO`, 1000);
			};

			let settings_appspace = document.querySelector('.settings-appspace');
			if (settings_appspace) {
				for (let i = 0; i < app.modules.mods.length; i++) {
					if (
						app.modules.mods[i].respondTo('settings-appspace') !=
						null
					) {
						let mod_settings_obj =
							app.modules.mods[i].respondTo('settings-appspace');
						mod_settings_obj.attachEvents(app, mod);
					}
				}
			}

			if (document.getElementById('register-identifier-btn')) {
				document.getElementById('register-identifier-btn').onclick =
					function (e) {
						app.connection.emit('register-username-or-login');
					};
			}

			if (document.getElementById('trigger-appstore-btn')) {
				document.getElementById('trigger-appstore-btn').onclick =
					function (e) {
						let appstore_mod = app.modules.returnModule('AppStore');
						if (appstore_mod) {
							appstore_mod.openAppstoreOverlay(app, appstore_mod);
						}
					};
			}

			//
			// install module (button)
			//
			Array.from(
				document.getElementsByClassName('modules_mods_checkbox')
			).forEach((ckbx) => {
				ckbx.onclick = async (e) => {
					let thisid = parseInt(e.currentTarget.id);
					let currentTarget = e.currentTarget;

					if (currentTarget.checked == true) {
						let sc = await sconfirm(
							'Reactivate this module? (Will take effect on refresh)'
						);
						if (sc) {
							app.options.modules[thisid].active = 1;
							app.storage.saveOptions();
						} else {
							currentTarget.checked = false;
						}
					} else {
						let sc = await sconfirm(
							'Remove this module? (Will take effect on refresh)'
						);
						if (sc) {
							app.options.modules[thisid].active = 0;
							app.storage.saveOptions();
						} else {
							currentTarget.checked = true;
						}
					}
				};
			});

			//
			// in-game crypto transfers
			//
			Array.from(
				document.getElementsByClassName('crypto_transfers_checkbox')
			).forEach((ckbx) => {
				ckbx.onclick = async (e) => {
					let thisid = e.currentTarget.id;
					let currentTarget = e.currentTarget;

					console.log("Checbox id: //////", thisid);

					if (currentTarget.checked == false) {
						let sc = await sconfirm(
							'Turning off this setting will make gameplay slower, are you sure?'
						);
						if (sc) {
							app.options.gameprefs[thisid] = 0;
						} else {
							currentTarget.checked = true;
						}
					} else {
						app.options.gameprefs[thisid] = 1;
					}

					await app.wallet.saveWallet();
				};
			});

			Array.from(
				document.getElementsByClassName('settings-appspace-module')
			).forEach((modlink) => {
				modlink.onclick = async (e) => {
					let modname = e.currentTarget.id;
					let mod = this.app.modules.returnModule(modname);
					if (!mod) {
						console.error('Module not found! ', modname);
						return;
					}

					let mod_overlay = new SaitoModule(this.app, mod, () => {
						this.renderDebugTree();
					});
					mod_overlay.render();
				};
			});

			if (document.getElementById('backup-account-btn')) {
				document.getElementById('backup-account-btn').onclick = (e) => {
					app.wallet.backupWallet();
				};
			}

			if (document.getElementById('restore-account-btn')) {
				document.getElementById('restore-account-btn').onclick = async (
					e
				) => {
					document
						.getElementById('file-input')
						.addEventListener('change', async function (e) {
							var file = e.target.files[0];

							let wallet_reader = new FileReader();
							wallet_reader.readAsBinaryString(file);
							wallet_reader.onloadend = async () => {
								let result = await app.wallet.onUpgrade(
									'import',
									'',
									wallet_reader
								);

								if (result === true) {
									alert(
										'Restoration Complete ... click to reload Saito'
									);
									reloadWindow(300);
								} else {
									let err = result;
									if (err.name == 'SyntaxError') {
										salert(
											'Error reading wallet file. Did you upload the correct file?'
										);
									} else if (false) {
										// put this back when we support encrypting wallet backups again...
										salert(
											'Error decrypting wallet file. Password incorrect'
										);
									} else {
										salert('Unknown error<br/>' + err);
									}
								}
							};
						});
					document.querySelector('#file-input').click();
				};
			}

			if (document.getElementById('backup-seed-btn')) {
				document.getElementById('backup-seed-btn').onclick = async (e) => {
					try {
						const seed = await app.options.wallet.seed.mnemonic;
						await sconfirm(
							"You are about to backup your seed phrase, please note that this is only a backup for your keys and cryptos, it doesn't include other data"
						);

						const egldMnemonic = app?.options?.crypto?.EGLD?.mnemonic_text || "";
						if (egldMnemonic && egldMnemonic !== seed) {
						  salert(
							"Warning: Your EGLD wallet is using a different seed phrase. " +
							"Backing up only the Saito seed does NOT back up your EGLD keys. " 
						  );
						}
				  

						if (seed) {
							setTimeout(async () => {
								let confirmBackup = await sconfirm(
									`${seed}`
								);
							}, 500)

						}
					} catch (err) {
						salert('Error generating seed phrase: ' + err.message);
						console.error('Error in backup seed:', err);
					}
				};
			}

			if (document.getElementById('import-seed-btn')) {
				document.getElementById('import-seed-btn').onclick = async (e) => {
					try {
						let mnemonic = await sprompt('Enter your seed phrase:');
						if (mnemonic) {
							if (mnemonic.trim().split(/\s+/g).length == 24) {
								const privateKey = this.app.crypto.getPrivateKeyFromSeed(mnemonic);
								let result = await app.wallet.onUpgrade(
									'import',
									privateKey
								);
								console.log(privateKey, "private key from seed")
								if (result === true) {
									let c = await sconfirm(
										'Success! Confirm to reload'
									);
									if (c) {
										reloadWindow(300);
									}
								} else {
									let err = result;
									salert('Something went wrong: ' + err.name);
								}

							} else {
								salert('Error importing seed phrase: ' + "Invalid seed phrase");
							}

						} else {

							salert('Error importing seed phrase: ' + "No seed phrase found")

						}
					} catch (err) {
						salert('Error importing seed phrase: ' + err.message);
						console.error('Error in import seed:', err);
					}
				};
			}

			document.getElementById('nuke-account-btn').onclick = async (e) => {
				let confirmation = await sconfirm(
					'This will reset/nuke your account, do you wish to proceed?'
				);
				if (confirmation) {
					await app.wallet.onUpgrade('nuke');
					if (this.app.browser.browser_active == 1) {
						reloadWindow(300);
					}
				}
			};

			if (document.getElementById('clear-storage-btn')) {
				document.getElementById('clear-storage-btn').onclick = async (
					e
				) => {
					let confirmation = await sconfirm(
						"This will clear your browser's DB, proceed cautiously"
					);
					if (confirmation) {

						// Centrally Manage localForage
						await this.app.storage.clearLocalForage();
						// And purge dyn mods
						await this.app.storage.removeAllLocalApplications();

						let archive = this.app.modules.returnModule('Archive');
						if (archive) {
							await archive.onUpgrade('nuke');
						}

                                        	if (this.app.browser.browser_active == 1) {     
                                                	reloadWindow(300);
						}
					}
				};
			}

			Array.from(
				document.querySelectorAll(
					'.settings-appspace .pubkey-grid'
				)
			).forEach((key) => {
				key.onclick = (e) => {
					navigator.clipboard.writeText(e.currentTarget.dataset.id);
					let icon_element = e.currentTarget.querySelector(
						'.pubkey-grid i'
					);
					icon_element.classList.toggle('fa-copy');
					icon_element.classList.toggle('fa-check');

					setTimeout(() => {
						icon_element.classList.toggle('fa-copy');
						icon_element.classList.toggle('fa-check');
					}, 1500);
				};
			});

			document.getElementById('restore-privatekey-btn').onclick = async (
				e
			) => {
				let privatekey = '';
				let publicKey = '';

				try {
					privatekey = await sprompt('Enter Private Key:');
					if (privatekey != '') {
						let result = await app.wallet.onUpgrade(
							'import',
							privatekey
						);

						if (result === true) {
							let c = await sconfirm(
								'Success! Confirm to reload'
							);
							if (c) {
								reloadWindow(300);
							}
						} else {
							let err = result;
							salert('Something went wrong: ' + err.name);
						}
					}
				} catch (e) {
					salert('Restore Private Key ERROR: ' + e);
					console.log('Restore Private Key ERROR: ' + e);
				}
			};
		} catch (err) {
			console.log('Error in Settings Appspace: ', err);
		}

		if(document.querySelector('#settings-add-app')) {
			document.querySelector('#settings-add-app').onclick = () => {
				app.connection.emit('saito-app-app-render-request');
			}
		}

	}
}

module.exports = SettingsAppspace;
