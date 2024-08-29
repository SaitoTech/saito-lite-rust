// @ts-nocheck

import screenfull, { element } from 'screenfull';
import { getDiffieHellman } from 'crypto';

let marked = require('marked');
let sanitizeHtml = require('sanitize-html');
const sanitizer = require('sanitizer');
const linkifyHtml = require('markdown-linkify');
const emoji = require('node-emoji');
const UserMenu = require('./ui/modals/user-menu/user-menu');
const Deposit = require('./ui/saito-crypto/overlays/deposit');
const Withdraw = require('./ui/saito-crypto/overlays/withdraw');
const History = require('./ui/saito-crypto/overlays/history');
const debounce = require('lodash/debounce');
const SaitoMentions = require('./ui/saito-mentions/saito-mentions');

class Browser {
	public app: any;
	public browser_active: any;
	public drag_callback: any;
	public urlParams: any;
	public active_tab: any;
	public files: any;
	public returnIdentifier: any;
	public host: any;
	public port: any;
	public protocol: any;
	public identifiers_added_to_dom: any;

	constructor(app) {
		this.app = app || {};

		this.browser_active = 0;
		this.drag_callback = null;
		this.urlParams = {};
		this.host = '';
		this.port = '';
		this.protocol = '';

		this.identifiers_added_to_dom = false;

		//
		// tells us the browser window is visible, as opposed to
		// browser_active which is used to figure out which applications
		// users are interacting with in the browser.
		//
		this.active_tab = 0;

		//
		//Expand browser support for hidden tabs
		// Opera 12.10 and Firefox 18 and later support
		//
		this.hidden_tab_property = "hidden";
		this.tab_event_name = "visibilitychange";
		this.title_interval = null;
	}

	async initialize(app) {
		if (this.app.BROWSER != 1) {
			return 0;
		}

		this.app.connection.on('new-version-detected', (version) => {
			console.log('New wallet version detected: ' + version);
			localStorage.setItem('wallet_version', JSON.stringify(version));
			let shouldReload = false;
			const scripts = document.querySelectorAll('script');
			scripts.forEach((script) => {
				const url = new URL(script.src, window.location.origin);
				const params = new URLSearchParams(url.search);
				if (params.has('build')) {
					shouldReload = true
				}
			});
			if (shouldReload) {
				setTimeout(() => {
					window.location.reload();
				}, 300);
			}
		});

		try {

			if (screenfull.isEnabled){
				screenfull.on('change', () => {
					this.app.connection.emit("browser-fullscreen-toggle", screenfull.isFullscreen);
				});
			}

			if (typeof document.hidden === 'undefined') {
				//
				// Polyfill for other browsers...
				//
			 	if (typeof document.msHidden !== 'undefined') {
					this.hidden_tab_property = 'msHidden';
					this.tab_event_name = 'msvisibilitychange';
				} else if (typeof document.webkitHidden !== 'undefined') {
					this.hidden_tab_property = 'webkitHidden';
					this.tab_event_name = 'webkitvisibilitychange';
				}
			}



			if (!document[this.hidden_tab_property]) {
				await this.setActiveTab(1);
			}

			let publicKey = await this.app.wallet.getPublicKey();

			//
			// Ralph took the conch from where it lay on the polished seat and held it
			// to his lips; but then he hesitated and did not blow. He held the shell
			// up instead and showed it to them and they understood.
			//
			try {
				this.attachWindowFunctions();

				this.channel = new BroadcastChannel('saito');
				if (!document[this.hidden_tab_property]) {
					//channel.postMessage({ active: 1, publicKey: publicKey });
				}

				this.channel.onmessage = async (e) => {
					if (e.data.msg) {
						if (e.data.msg == 'new_tab') {
							window.focus();
							//alert("moving to: " + e.data.location);
//							if (window.confirm('You have followed a Saito link, do you want to open it here?')) {
//								window.location = e.data.location;
//							}
  	
                            setTimeout(() => {
                            	window.location = '/tabs.html';
                            }, 300)
						}
					}
				};


/* channel.onmessage = async (e) => {
				  console.log("document onmessage change");
				  if (!document[this.hidden_tab_property]) {
					channel.postMessage({active: 1, publicKey: publicKey});
					this.setActiveTab(1);
				  } else {
					//
					// only disable if someone else active w/ same key
					//
					if (e.data) {
					  if (e.data.active == 1) {
						if (e.data.active == 1 && e.data.publicKey === publicKey) {
						  this.setActiveTab(0);
						  salert("Saito is already open in another tab");
						}
					  }
					}
				  }
				};
*/

				document.addEventListener(
					this.tab_event_name,
					() => {
						if (document[this.hidden_tab_property]) {
							this.setActiveTab(0);
							this.channel.postMessage({
								active: 0,
								publicKey: publicKey
							});
						} else {
							this.setActiveTab(1);
							this.channel.postMessage({
								active: 1,
								publicKey: publicKey
							});

							//
							// We are standardizing a utility for mods to set a "flashing"
							// browser tab title for background notifications
							//
							if (this.title_interval) {
								clearInterval(this.title_interval);
								this.title_interval = null;
								if (this.original_title){
									document.title = this.original_title;	
								}
							}
						}
					},
					false
				);

				window.addEventListener('storage', async (e) => {
					if (this.active_tab == 0) {
						console.log('LOAD OPTIONS IN BROWSER');
						await this.app.storage.loadOptions();
					}
				});
			} catch (err) {
				console.error(err);
			}

			//
			// try and figure out what module is running
			// This code will error in a node.js environment - that's ok.
			// Abercrombie's rule.
			//
			if (typeof window == 'undefined') {
				return;
			} else {
			}
			const current_url = window.location.toString();
			const myurl = new URL(current_url);
			this.host = myurl.host;
			this.port = myurl.port;
			this.protocol = myurl.protocol;
			const myurlpath = myurl.pathname.split('/');
			let active_module = myurlpath[1] ? myurlpath[1].toLowerCase() : '';
			if (active_module == '') {
				active_module = 'website';
			}

			//
			// query strings
			//
			this.urlParams = new URLSearchParams(window.location.search);
			const entries = this.urlParams.entries();
			for (const pair of entries) {
				//
				// if crypto is provided switch over
				//
				if (pair[0] === 'crypto') {
					let preferred_crypto_found = 0;
					const available_cryptos =
						this.app.wallet.returnInstalledCryptos();
					for (let i = 0; i < available_cryptos.length; i++) {
						if (available_cryptos[i].ticker) {
							if (
								available_cryptos[i].ticker.toLowerCase() ===
								pair[1].toLowerCase()
							) {
								preferred_crypto_found = 1;
								await this.app.wallet.setPreferredCrypto(
									available_cryptos[i].ticker
								);
							}
						}
					}

					if (preferred_crypto_found == 0) {
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						salert(
							`Your compile does not contain a ${pair[1].toUpperCase()} module. Visit the AppStore or contact us about getting one built!`
						);
					}
				}
			}

			//
			// tell that module it is active
			//
			for (let i = 0; i < this.app.modules.mods.length; i++) {
				if (this.app.modules.mods[i].isSlug(active_module)) {
					this.app.modules.mods[i].browser_active = 1;
					this.app.modules.mods[i].alerts = 0;

					//
					// if urlParams exist, hand them to the module
					//
					const urlParams = new URLSearchParams(location.search);

					this.app.modules.mods[i].handleUrlParams(urlParams);
					break;
				}
			}

			//
			// crypto overlays, add so events will listen. this assumes
			// games do not have saito-header installed.
			//
			this.deposit_overlay = new Deposit(
				this.app,
				this.app.modules.returnActiveModule()
			);
			this.withdrawal_overlay = new Withdraw(
				this.app,
				this.app.modules.returnActiveModule()
			);
			this.history_overlay = new History(
				this.app,
				this.app.modules.returnActiveModule()
			);

			//
			// check if we are already open in another tab -
			// gracefully return out after warning user.
			//
			this.checkForMultipleWindows();
			//this.isFirstVisit();

			//if ('serviceWorker' in navigator) {
			//    await navigator.serviceWorker
			//        .register('/sw.js');
			//}

			this.browser_active = 1;

			let theme = document.documentElement.getAttribute('data-theme') || "lite";
			console.log("HTML provided theme: " + theme);

		    if (this.app.options?.theme) {
		      if (this.app.options.theme[active_module]){
		      	theme = this.app.options.theme[active_module];
		      	this.switchTheme(theme);
		      }
		    }
		    console.log("New theme: " + theme);
		    this.updateThemeInHeader(theme);

			const updateViewHeight = () => {
				let vh = window.innerHeight * 0.01;
				document.documentElement.style.setProperty(
					'--saito-vh',
					`${vh}px`
				);
				//siteMessage(`Update: ${vh}px`);
			};

			window.addEventListener('resize', debounce(updateViewHeight, 200));
			setTimeout(() => {
				updateViewHeight();
			}, 200);
		} catch (err) {
			if (err == 'ReferenceError: document is not defined') {
				console.log('non-browser detected: ' + err);
			} else {
				throw err;
			}
		}

		//
		// Add Connection Monitors
		//
		this.app.connection.on(
			'peer_connect',
			function (peerIndex: bigint) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				siteMessage('Websocket Connection Established', 1000);
			}
		);
		this.app.connection.on(
			'peer_disconnect',
			function (peerIndex: bigint) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				siteMessage('Websocket Connection Lost');
			}
		);

		// attach listening events
		document.querySelector('body').addEventListener(
			'click',
			(e) => {
				if (
					e.target?.classList?.contains('saito-identicon') ||
					e.target?.classList?.contains('saito-address') ||
					e.target?.classList?.contains('saito-add-user-menu')
				) {
					let disable_click = e.target.getAttribute('data-disable');
					let publicKey = e.target.getAttribute('data-id');
					if (
						!publicKey ||
						!app.wallet.isValidPublicKey(publicKey) ||
						disable_click === 'true' ||
						disable_click == true
					) {
						return;
					}

					e.preventDefault();
					e.stopImmediatePropagation();

					let userMenu = new UserMenu(app, publicKey);
					userMenu.render();
				}
			},
			{
				capture: true
			}
		);

		window.setHash = function (hash) {
			window.history.pushState('', '', `/redsquare/#${hash}`);
		};

		//hide pace-js if its still active
		setTimeout(function () {
			if (document.querySelector('.pace')) {
				let elem = document.querySelector('.pace');

				elem.classList.remove('pace-active');
				elem.classList.add('pace-inactive');
			}
		}, 1000);
	}

	extractIdentifiers(text = '') {
		let identifiers = [];

		let w = text.split(/(\s+)/);

		for (let i = 0; i < w.length; i++) {
			if (w[i].length > 0) {
				if (w[i][0] === '@') {
					if (w.length > 1) {
						let cleaner = w[i].substring(1);
						identifiers.push(cleaner);
					}
				}
			}
		}

		return identifiers;
	}

	extractKeys(text = '') {
		let keys = [];
		let add = '';
		let w = text.split(/(\s+)/);

		for (let i = 0; i < w.length; i++) {
			if (w[i].length > 0) {
				if (w[i][0] === '@') {
					if (w.length > 1) {
						let cleaner = w[i].substring(1);
						let key = this.app.keychain.returnKey({
							identifier: cleaner
						});
						if (key) {
							add = key.publicKey;
						}
						if (
							this.app.wallet.isValidPublicKey(cleaner) &&
							(add == '' || add == null)
						) {
							add = cleaner;
						}
						if (!keys.includes(add) && add != '' && add != null) {
							keys.push(add);
						}
					}
				}
			}
		}

		let identifiers = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]*)/gi);
		let adds = text.match(/([a-zA-Z0-9._-]{44}|[a-zA-Z0-9._-]{45})/gi);

		if (adds) {
			adds.forEach((add) => {
				if (this.app.wallet.isValidPublicKey(add) && !keys.includes(add)) {
					keys.push(add);
				}
			});
		}
		if (identifiers) {
			identifiers.forEach((id) => {
				let key = this.app.keychain.returnKey({ identifier: id });
				if (key.publicKey) {
					let add = key.publicKey;
					if (this.app.wallet.isValidPublicKey(add)) {
						if (!keys.includes(add)) {
							keys.push(add);
						}
					}
				}
			});
		}
		return keys;
	}

	async returnInviteLink(email = '') {
		let { protocol, host, port } = this.app.options.peers[0];
		let url_payload = encodeURIComponent(
			this.app.crypto.stringToBase64(
				JSON.stringify(await this.returnInviteObject(email))
			)
		);
		return `${protocol}://${host}:${port}/r?i=${url_payload}`;
	}

	returnHashAndParameters() {
		let hash = new URL(document.URL).hash.split('#')[1];
		let component = '';
		let params = '';
		if (hash) {
			if (hash?.split('').includes('?')) {
				component = hash.split('?')[0];
				params = hash.split('?')[1];
			} else {
				component = hash;
			}
		}
		return { hash: component, params: params };
	}

	returnURLParameter(name) {
		try {
			this.urlParams = new URLSearchParams(window.location.search);
			const entries = this.urlParams.entries();
			for (const pair of entries) {
				if (pair[0] == name) {
					return pair[1];
				}
			}
		} catch (err) { }
		return '';
	}

	returnPreferredLanguage() {
		try {
			let x = navigator.language;
			if (x.length > 2) {
				return x.substring(0, 2);
			}
			return x;
		} catch (err) { }
		return 'en';
	}

	isMobileBrowser(user_agent = navigator.userAgent) {
		let check = false;
		(function (user_agent) {
			if (
				/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
					user_agent
				) ||
				/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
					user_agent.substr(0, 4)
				)
			) {
				check = true;
			}
		})(user_agent);
		return check;
	}

	isSupportedBrowser(userAgent) {
		//
		// no to Safari
		//
		if (userAgent.toLowerCase().indexOf('safari/') > -1) {
			if (
				userAgent.toLowerCase().indexOf('chrome') == -1 &&
				userAgent.toLowerCase().indexOf('firefox') == -1
			) {
				return 0;
			}
		}

		//
		// require ES6
		//
		try {
			Function('() => {};');
		} catch (err) {
			return 0;
		}

		return 1;
	}

	async sendNotification(title, message, event) {
		if (this.app.BROWSER == 0) {
			return;
		}

		if (!this.isMobileBrowser(navigator.userAgent)) {
			if (Notification.permission === 'default') {
				Notification.requestPermission().then((result) => {
					if (result === 'granted') {
						this.sendNotification(title, message, event);
						return;
					}
				});
			}
			if (Notification.permission === 'granted') {
				const notify = new Notification(title, {
					body: message,
					iconURL: '/saito/img/touch/pwa-192x192.png',
					icon: '/saito/img/touch/pwa-192x192.png',
					tag: event
				});
			}
		} else {
			Notification.requestPermission().then(function (result) {
				if (result === 'granted' || result === 'default') {
					navigator.serviceWorker.ready.then(function (registration) {
						registration.showNotification(title, {
							body: message,
							icon: '/saito/img/touch/pwa-192x192.png',
							vibrate: [200, 100, 200, 100, 200, 100, 200],
							tag: event
						});
					});
				}
			});
		}
	}

	createTabNotification(message1, message2){
		if (this.app.BROWSER == 0 || this.active_tab){
			return;
		}

		if (!this.title_interval) {
			this.original_title = document.title;
			this.title_interval = setInterval(() => {
				if (document.title === message1) {
					document.title = message2;
				} else {
					document.title = message1;
				}
			}, 850);
		}
	}

	checkForMultipleWindows() {
		//Add a check to local storage that we are open in a tab.
		localStorage.openpages = Date.now();

		const onLocalStorageEvent = async (e) => {
			if (e.key == 'openpages') {
				// Listen if anybody else opening the same page!
				localStorage.page_available = Date.now();
			}
			if (
				e.key == 'page_available' &&
				!this.isMobileBrowser(navigator.userAgent)
			) {
				console.log(e.key);
				console.log(navigator.userAgent);
				//alert("Saito already open in another tab!");

				//alert("i am the new tab");
				//alert("message sent");
				let c = await sconfirm(
					'Your wallet appears to be connected in another Saito tab.\n\nWould you like to connect it here and close the other tab?'
				);
				if (c) {
					this.channel.postMessage({msg: 'new_tab', location: window.location.href});
					return;
				} else {
					  setTimeout(() => {
						window.location = '/tabs.html';
					}, 300)
				}

			}
		};
		window.addEventListener('storage', onLocalStorageEvent, false);
	}

	async returnInviteObject(email = '') {
		//
		// this informaton is in the email link provided by the user
		// to their friends.
		//
		const obj = {};
		obj.publicKey = await this.app.wallet.getPublicKey();
		obj.bundle = '';
		obj.email = email;
		if (this.app.options.bundle != '') {
			obj.bundle = this.app.options.bundle;
		}

		return obj;
	}

	//
	// toggle active tab and disable / enable core blockchain
	// functionality as needed.
	//
	async setActiveTab(active) {
		console.log('SET ACTIVE TAB');
		this.active_tab = active;
		this.app.blockchain.process_blocks = active;
		this.app.storage.save_options = active;
		for (let peer of await this.app.network.getPeers()) {
			peer.handle_peer_requests = active;
		}
	}

	//////////////////////////////////
	// Browser and Helper Functions //
	//////////////////////////////////
	generateQRCode(data, qrid = 'qrcode') {
		const QRCode = require('./../helpers/qrcode');
		let obj = document.getElementById(qrid);
		return new QRCode(obj, data);
	}

	// https://github.com/sindresorhus/screenfull.js
	async requestFullscreen() {
		if (screenfull.isEnabled) {
			await screenfull.toggle();
		}
	}

	addNotificationToId(count, id){
	  let elem = document.getElementById(id);

	  if (elem) {
	    if (count) {
	      if (elem.querySelector(".saito-notification-dot")) {
	        elem.querySelector(".saito-notification-dot").innerHTML = count;
	      } else {
	        this.addElementToId(
	          `<div class="saito-notification-dot">${count}</div>`,
	          id
	        );
	      }
	    } else {
	      if (elem.querySelector(".saito-notification-dot")) {
	        elem.querySelector(".saito-notification-dot").remove();
	      }
	    }
	  }

	}


	addElementToDom(html, elemWhere = null) {
		const el = document.createElement('div');
		if (elemWhere == null || elemWhere === '') {
			document.body.appendChild(el);
			el.outerHTML = html;
		} else {
			elemWhere.insertAdjacentElement('beforeend', el);
			el.outerHTML = html;
		}
	}

	prependElementToDom(html, elemWhere = document.body) {
		try {
			const elem = document.createElement('div');
			elemWhere.insertAdjacentElement('afterbegin', elem);
			elem.outerHTML = html;
		} catch (err) {
			console.log('ERROR 582341: error in prependElementToDom');
		}
	}

	replaceElementById(html, id = null) {
		if (id == null) {
			console.warn(
				'no id provided to replaceElementById, so adding direct to DOM'
			);
			this.app.browser.addElementToDom(html);
		} else {
			let obj = document.getElementById(id);
			if (obj) {
				obj.outerHTML = html;
			}
		}
	}

	replaceElementByIdOrAddToDom(html, id = null) {
		if (id == null) {
			console.warn('no id provided to replaceElementById, so ignoring');
		} else {
			let obj = document.getElementById(id);
			if (obj) {
				obj.outerHTML = html;
			} else {
				this.app.browser.addElementToDom(html);
			}
		}
	}

	addElementToId(html, id = null) {
		if (id == null) {
			console.warn(`no id provided to addElementToId, so adding to DOM`);
			this.app.browser.addElementToDom(html);
		} else {
			let obj = document.getElementById(id);
			if (obj) {
				this.app.browser.addElementToDom(html, obj);
			}else{
				console.warn("id not found");
			}
		}
	}

	addElementAfterId(html, id = null) {
		if (id == null) {
			console.warn(
				`no id provided to addElementAfterId, so adding to DOM`
			);
			this.app.browser.addElementToDom(html);
		} else {
			let obj = document.getElementById(id);
			if (obj) {
				this.app.browser.addElementToDom(html, obj);
			}else{
				console.warn("ID not found (addelementafterid)");
			}
		}
	}

	prependElementToId(html, id = null) {
		if (id == null) {
			console.warn(
				`no id provided to prependElementToId, so adding to DOM`
			);
			this.app.browser.prependElementToDom(html);
		} else {
			let obj = document.getElementById(id);
			if (obj) {
				this.app.browser.prependElementToDom(html, obj);
			}
		}
	}

	removeElementBySelector(selector = '') {
		let obj = document.querySelector(selector);
		if (obj) {
			obj.remove();
		}
	}

	replaceElementBySelector(html, selector = '') {
		if (selector === '') {
			console.warn(
				'no selector provided to replaceElementBySelector, so adding direct to DOM'
			);
			this.app.browser.addElementToDom(html);
		} else {
			let obj = document.querySelector(selector);
			if (obj) {
				obj.outerHTML = html;
			}
		}
	}

	replaceElementContentBySelector(html, selector = '') {
		if (selector === '') {
			console.warn(
				'no selector provided to replaceElementContentBySelector, so adding direct to DOM'
			);
			this.app.browser.addElementToDom(html);
		} else {
			let obj = document.querySelector(selector);
			if (obj) {
				obj.innerHTML = html;
			}
		}
	}

	addElementToSelectorOrDom(html, selector = '') {
		if (selector === '') {
			console.warn(
				'no selector provided to addElementToSelectorOrDom, so adding direct to DOM'
			);
			this.app.browser.addElementToDom(html);
		} else {
			let container = document.querySelector(selector);
			if (container) {
				this.app.browser.addElementToElement(html, container);
			} else {
				console.info(`${selector} not found, adding direct to DOM`);
				this.app.browser.addElementToDom(html);
			}
		}
	}

	addElementToSelector(html, selector = '') {
		if (selector === '') {
			console.warn(
				'no selector provided to addElementToSelector, so adding direct to DOM'
			);
			console.log(html);
			this.app.browser.addElementToDom(html);
		} else {
			let container = document.querySelector(selector);
			if (container) {
				this.app.browser.addElementToElement(html, container);
			} else {
				console.info('Container not found: ' + selector);
			}
		}
	}

	addElementAfterSelector(html, selector = '') {
		if (selector === '') {
			console.warn(
				'no selector provided to addElementAfterSelector, so adding direct to DOM'
			);
			console.log(html);
			this.app.browser.addElementToDom(html);
		} else {
			let container = document.querySelector(selector);
			if (container) {
				this.app.browser.addElementAfterElement(html, container);
			}
		}
	}

	prependElementToSelector(html, selector = '') {
		if (selector === '') {
			console.warn(
				'no selector provided to prependElementToSelector, so adding direct to DOM'
			);
			this.app.browser.prependElementToDom(html);
		} else {
			let container = document.querySelector(selector);
			if (container) {
				this.app.browser.prependElementToDom(html, container);
			}
		}
	}

	replaceElementByClass(html, classname = '') {
		if (classname === '') {
			console.warn(
				'no classname provided to replaceElementByClass, so adding direct to DOM'
			);
			this.app.browser.addElementToDom(html);
		} else {
			let classname = '.' + classname;
			let obj = document.querySelector(classname);
			if (obj) {
				obj.outerHTML = html;
			}
		}
	}

	addElementToClass(html, classname = '') {
		if (classname === '') {
			console.warn(
				'no classname provided to addElementToClass, so adding direct to DOM'
			);
			this.app.browser.addElementToDom(html);
		} else {
			classname = '.' + classname;
			let container = document.querySelector(classname);
			if (container) {
				this.app.browser.addElementToElement(html, container);
			} else {
				console.warn('Classname not found: ' + classname);
			}
		}
	}

	prependElementToClass(html, classname = '') {
		if (classname === '') {
			console.warn(
				'no classname provided to prependElementToClass, so adding direct to DOM'
			);
			this.app.browser.prependElementToDom(html);
		} else {
			classname = '.' + classname;
			let container = document.querySelector(classname);
			if (container) {
				this.app.browser.prependElementToDom(html, container);
			}
		}
	}

	addElementToElement(html, elem = document.body) {
		try {
			const el = document.createElement('div');
			elem.appendChild(el);
			el.outerHTML = html;
		} catch (err) {
			console.log(
				'ERROR 582342: error in addElementToElement. Does ' +
				elem +
				' exist?'
			);
			console.log(html);
		}
	}

	addElementAfterElement(html, elem = document.body) {
		try {
			const el = document.createElement('div');
			if (elem.nextSibling) {
				elem.parentNode.insertBefore(el, elem.nextSibling);
			} else {
				elem.parentNode.appendChild(el);
			}
			el.outerHTML = html;
		} catch (err) {
			console.log(
				'ERROR 582346: error in addElementToElement. Does ' +
				elem +
				' exist? : ' +
				err
			);
			console.log(html);
		}
	}

	makeElement(elemType, elemId, elemClass) {
		const headerDiv = document.createElement(elemType);
		headerDiv.id = elemId;
		headerDiv.classList.add(elemClass);
		return headerDiv;
	}

	htmlToElement(domstring) {
		const html = new DOMParser().parseFromString(domstring, 'text/html');
		return html.body.firstChild;
	}

	addToolTip(elem, text) {
		const wrapper = document.createElement('div');
		wrapper.classList.add('tip');
		elem.replaceWith(wrapper);
		const tip = document.createElement('div');
		tip.classList.add('tiptext');
		tip.innerHTML = text;
		wrapper.append(elem);
		wrapper.append(tip);
	}

	formatTime(milliseconds = 0) {
		let hours = parseInt(milliseconds / 3600000);
		milliseconds = milliseconds % 3600000;

		let minutes = parseInt(milliseconds / 60000);
		milliseconds = milliseconds % 60000;

		let seconds = parseInt(milliseconds / 1000);

		return { hours: hours, minutes: minutes, seconds: seconds };
	}

	returnTime(timestamp) {
		let d = this.formatDate(timestamp);
		let h = d.hours;
		let m = d.minutes;
		let x = '';
		if (h < 10) {
			x = `0${h}`;
		} else {
			x = `${h}`;
		}
		x += `:${m}`;

		return x;
	}

	formatDate(timestamp) {
		const datetime = new Date(timestamp);

		const hours = datetime.getHours();
		let minutes = datetime.getMinutes();
		const months = [12];
		months[0] = 'January';
		months[1] = 'February';
		months[2] = 'March';
		months[3] = 'April';
		months[4] = 'May';
		months[5] = 'June';
		months[6] = 'July';
		months[7] = 'August';
		months[8] = 'September';
		months[9] = 'October';
		months[10] = 'November';
		months[11] = 'December';
		const month = months[datetime.getMonth()];
		//getDay = Day of the Week, getDate = day of the month
		const day = datetime.getDate();
		const year = datetime.getFullYear();

		minutes = minutes.toString().length == 1 ? `0${minutes}` : `${minutes}`;

		return { year, month, day, hours, minutes };
	}

	prettifyTimeStamp(timestamp, short_month = false) {
		let object = this.formatDate(timestamp);

		let timeString = short_month ? object.month.substr(0, 3) : object.month;
		timeString += ` ${object.day}, ${object.hours}:${object.minutes}`;
		return timeString;
	}

	saneDateFromTimestamp(timestamp) {
		var date = new Date(timestamp);
		var year = date.getFullYear();
		var month = date.getMonth() + 1; // getMonth() returns month from 0-11
		var day = date.getDate();

		// Adding leading zeros for day and month if they are less than 10
		month = month < 10 ? '0' + month : month;
		day = day < 10 ? '0' + day : day;

		return year + '-' + month + '-' + day;
	}

	saneTimeFromTimestamp(timestamp) {
		var date = new Date(timestamp);
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var seconds = date.getSeconds();

		// Adding leading zeros for hours, minutes, and seconds if they are less than 10
		hours = hours < 10 ? '0' + hours : hours;
		minutes = minutes < 10 ? '0' + minutes : minutes;
		seconds = seconds < 10 ? '0' + seconds : seconds;

		return hours + ':' + minutes + ':' + seconds;
	}

	saneDateTimeFromTimestamp(timestamp) {
		return (
			this.saneDateFromTimestamp(timestamp) +
			':' +
			this.saneTimeFromTimestamp(timestamp)
		);
	}

	formatNumberWithCommas(number) {
		// Split the number into integer and decimal parts
		var parts = number.toString().split('.');

		// Format the integer part with commas
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

		// Return the combined formatted number
		return parts.join('.');
	}

	addDragAndDropFileUploadToElement(
		id,
		handleFileDrop = null,
		click_to_upload = true,
		read_as_array_buffer = false
	) {
		const hidden_upload_form = `
      <form id="uploader_${id}" class="saito-file-uploader" style="display:none">
        <p>Upload multiple files with the file dialog or by dragging and dropping images onto the dashed region</p>
        <input type="file" id="hidden_file_element_${id}" multiple accept="*" class="treated hidden_file_element_${id}">
        <label class="button" class="hidden_file_element_button" id="hidden_file_element_button_${id}" for="hidden_file_element_${id}">Select some files</label>
      </form>
    `;

		if (!document.getElementById(`uploader_${id}`)) {
			this.addElementToId(hidden_upload_form, id);
			const dropArea = document.getElementById(id);
			if (!dropArea) {
				console.error('Undefined id in browser', id);
				return null;
			}
			['dragenter', 'dragover', 'dragleave', 'drop'].forEach(
				(eventName) => {
					dropArea.addEventListener(
						eventName,
						this.preventDefaults,
						false
					);
				}
			);
			['dragenter', 'dragover'].forEach((eventName) => {
				dropArea.addEventListener(eventName, this.highlight, false);
			});
			['dragleave', 'drop'].forEach((eventName) => {
				dropArea.addEventListener(eventName, this.unhighlight, false);
			});
			dropArea.addEventListener(
				'drop',
				function (e) {
					const dt = e.dataTransfer;
					const files = dt.files;
					[...files].forEach(function (file) {
						const reader = new FileReader();
						reader.addEventListener('load', (event) => {
							handleFileDrop(event.target.result);
						});
						if (read_as_array_buffer) {
							reader.readAsArrayBuffer(file);
						} else {
							reader.readAsDataURL(file);
						}
					});
				},
				false
			);
			if (!dropArea.classList.contains('paste_event')) {
				dropArea.addEventListener(
					'paste',
					(e) => {
						console.log('Pasting into area where we accept files');

						let drag_and_drop = false;
						const files = e.clipboardData.files;
						[...files].forEach(function (file) {
							drag_and_drop = true;
							const reader = new FileReader();
							reader.addEventListener('load', (event) => {
								handleFileDrop(event.target.result);
							});
							if (read_as_array_buffer) {
								reader.readAsArrayBuffer(file);
							} else {
								reader.readAsDataURL(file);
							}
						});

						if (drag_and_drop) {
							this.preventDefaults(e);
						}

						/*if (!drag_and_drop) {
			  let paste = (e.clipboardData || window.clipboardData).getData("text");
			  const selection = window.getSelection();
			  if (!selection.rangeCount) return;
			  selection.deleteFromDocument();
			  selection.getRangeAt(0).insertNode(document.createTextNode(paste));
			  selection.collapseToEnd();
			}*/
					},
					false
				);

				dropArea.classList.add('paste_event');
			}
			const input = document.getElementById(`hidden_file_element_${id}`);
			if (click_to_upload == true) {
				dropArea.addEventListener('click', function (e) {
					input.click();
				});
			}

			input.addEventListener(
				'change',
				function (e) {
					const fileName = '';
					if (this.files && this.files.length > 0) {
						const files = this.files;
						[...files].forEach(function (file) {
							const reader = new FileReader();
							reader.addEventListener('load', (event) => {
								handleFileDrop(event.target.result);
							});
							if (read_as_array_buffer) {
								reader.readAsArrayBuffer(file);
							} else {
								reader.readAsDataURL(file);
							}
						});
					}
				},
				false
			);
			dropArea.focus();
		}
	}

	highlight(e) {
		document.getElementById(e.currentTarget.id).style.opacity = 0.8;
	}

	unhighlight(e) {
		document.getElementById(e.currentTarget.id).style.opacity = 1;
	}

	preventDefaults(e) {
		console.log('preventing the defaults');
		e.preventDefault();
		e.stopPropagation();
	}

	makeRefreshable(selector, mycallback = null) {
		let touchStartY = 0;
		let triggerRefresh = false;

		let element = document.querySelector(selector);

		if (!element) {
			console.error("browser/makeRefreshable: Element doesn't exist!");
			return;
		}

		if (!mycallback){
			console.error("no callback!");
			return;
		}

		element.addEventListener('touchstart', (e) => {
			touchStartY = e.touches[0].clientY;
			triggerRefresh = false;
		});

		element.addEventListener('touchmove', (e) => {
			const touchY = e.touches[0].clientY;
			const touchDiff = touchY - touchStartY;
			if (touchDiff > 100 && window.scrollY === 0) {
				triggerRefresh = true;
			}
		});

		element.addEventListener('touchend', (e) => {
			if (triggerRefresh) {
				mycallback();
			}
		});
	}

	makeDraggable(
		id_to_move,
		id_to_drag = '',
		dockable = false,
		mycallback = null
	) {
		//console.log("make draggable: " + id_to_drag);
		//console.log(" and move? " + id_to_move);

		try {
			const element_to_move = document.getElementById(id_to_move);
			let timeout = null;
			let element_to_drag = element_to_move;
			if (id_to_drag) {
				element_to_drag = document.getElementById(id_to_drag);
			}

			let element_moved = 0;

			let mouse_down_left = 0;
			let mouse_down_top = 0;
			let mouse_current_left = 0;
			let mouse_current_top = 0;
			let element_start_left = 0;
			let element_start_top = 0;

			element_to_drag.onmousedown = function (e) {
				if (timeout) {
					clearTimeout(timeout);
				}
				let resizeable = ['both', 'vertical', 'horizontal'];
				//nope out if the elemtn or it's parent are css resizable - and the click is within 20px of the bottom right corner.

				if (
					resizeable.indexOf(getComputedStyle(e.target).resize) >
					-1 ||
					resizeable.indexOf(
						getComputedStyle(e.target.parentElement).resize
					) > -1
				) {
					if (
						e.offsetX > e.target.offsetWidth - 20 &&
						e.offsetY > e.target.offsetHeight - 20
					) {
						return;
					}
				}

				e = e || window.event;

				//console.log("DRAG MOUSEDOWN");
				//console.log(e.clientX);
				//console.log(e.offsetX);

				if (
					!e.currentTarget.id ||
					(e.currentTarget.id != id_to_move &&
						e.currentTarget.id != id_to_drag)
				) {
					document.onmouseup = null;
					document.onmousemove = null;
					return;
				}

				element_to_move.style.transition = 'unset';

				const rect = element_to_move.getBoundingClientRect();
				element_start_left = rect.left;
				element_start_top = rect.top;

				mouse_down_left = e.clientX;
				mouse_down_top = e.clientY;

				element_moved = false;

				document.onmouseup = async function (e) {
					if (dockable) {
						if (element_to_move.classList.contains('dockedLeft')) {
							element_to_move.style.left = 0;
						}

						if (element_to_move.classList.contains('dockedTop')) {
							element_to_move.style.top = 0;
						}

						if (element_to_move.classList.contains('dockedRight')) {
							element_to_move.style.left =
								window.innerWidth -
								element_to_move.getBoundingClientRect().width +
								'px';
						}

						if (
							element_to_move.classList.contains('dockedBottom')
						) {
							element_to_move.style.top =
								window.innerHeight -
								element_to_move.getBoundingClientRect().height +
								'px';
						}

						if (element_to_move.classList.contains('dragging')) {
							element_to_move.classList.remove('dragging');
						}

						timeout = setTimeout(() => {
							element_to_move.classList.remove('dockedBottom');
							element_to_move.classList.remove('dockedTop');
							element_to_move.classList.remove('dockedRight');
							element_to_move.classList.remove('dockedLeft');
						}, 1200);
					}

					document.onmouseup = null;
					document.onmousemove = null;

					element_to_move.style.transition = '';
					if (mycallback && element_moved) {
						await mycallback();
					}
				};

				document.onmousemove = function (e) {
					e = e || window.event;
					e.preventDefault();
					const threshold = 25;

					mouse_current_left = e.clientX;
					mouse_current_top = e.clientY;
					const adjustmentX = mouse_current_left - mouse_down_left;
					const adjustmentY = mouse_current_top - mouse_down_top;

					if (adjustmentX !== 0 || adjustmentY !== 0) {
						element_moved = true;
					}

					element_to_move.classList.add('dragging');

					let newPosX = element_start_left + adjustmentX;
					let newPosY = element_start_top + adjustmentY;

					//if dockable show docking edge
					if (dockable) {
						if (
							Math.abs(
								element_to_move.getBoundingClientRect().x
							) < threshold
						) {
							element_to_move.classList.add('dockedLeft');
						} else {
							element_to_move.classList.remove('dockedLeft');
						}

						if (
							Math.abs(
								element_to_move.getBoundingClientRect().y <
								threshold
							)
						) {
							element_to_move.classList.add('dockedTop');
						} else {
							element_to_move.classList.remove('dockedTop');
						}

						if (
							Math.abs(
								element_to_move.getBoundingClientRect().x +
								element_to_move.getBoundingClientRect()
									.width -
								window.innerWidth
							) < threshold
						) {
							element_to_move.classList.add('dockedRight');
						} else {
							element_to_move.classList.remove('dockedRight');
						}

						if (
							Math.abs(
								element_to_move.getBoundingClientRect().y +
								element_to_move.getBoundingClientRect()
									.height -
								window.innerHeight
							) < threshold
						) {
							element_to_move.classList.add('dockedBottom');
						} else {
							element_to_move.classList.remove('dockedBottom');
						}

						// set the element's new position:

						if (Math.abs(newPosX) < threshold) {
							newPosX = 0;
						}
						if (
							Math.abs(
								newPosX +
								element_to_move.getBoundingClientRect()
									.width -
								window.innerWidth
							) < threshold
						) {
							newPosX =
								window.innerWidth -
								element_to_move.getBoundingClientRect().width;
						}

						if (Math.abs(newPosY) < threshold) {
							newPosY = 0;
						}
						if (
							Math.abs(
								newPosY +
								element_to_move.getBoundingClientRect()
									.height -
								window.innerHeight
							) < threshold
						) {
							newPosY =
								window.innerHeight -
								element_to_move.getBoundingClientRect().height;
						}
					}

					element_to_move.style.left = newPosX + 'px';
					element_to_move.style.top = newPosY + 'px';

					//We are changing to Top/Left so get rid of bottom/right
					element_to_move.style.bottom = 'unset';
					element_to_move.style.right = 'unset';
					//Styles that adjust where the element goes, need to go away!
					element_to_move.style.transform = 'unset';
					element_to_move.style.marginTop = 'unset';
					element_to_move.style.marginLeft = 'unset';
				};

				return false;
			};

			element_to_drag.ontouchstart = function (e) {
				e = e || window.event;

				if (
					!e.currentTarget.id ||
					(e.currentTarget.id != id_to_move &&
						e.currentTarget.id != id_to_drag)
				) {
					document.ontouchend = null;
					document.ontouchmove = null;
					return;
				}

				element_to_move.style.transition = 'unset';

				//e.preventDefault();
				//if (e.stopPropagation) { e.stopPropagation(); }
				//if (e.preventDefault) { e.preventDefault(); }
				//e.cancelBubble = true;
				//e.returnValue = false;

				const rect = element_to_move.getBoundingClientRect();
				element_start_left = rect.left;
				element_start_top = rect.top;
				mouse_down_left = e.targetTouches[0]
					? e.targetTouches[0].pageX
					: e.changedTouches[e.changedTouches.length - 1].pageX;
				mouse_down_top = e.targetTouches[0]
					? event.targetTouches[0].pageY
					: e.changedTouches[e.changedTouches.length - 1].pageY;
				mouse_current_left = mouse_down_left;
				mouse_current_top = mouse_down_top;

				document.ontouchend = async function (e) {
					document.ontouchend = null;
					document.ontouchmove = null;
					if (mycallback && element_moved) {
						await mycallback();
					}
				};

				document.ontouchmove = function (e) {
					e = e || window.event;
					//e.preventDefault();

					mouse_current_left = e.targetTouches[0]
						? e.targetTouches[0].pageX
						: e.changedTouches[e.changedTouches.length - 1].pageX;
					mouse_current_top = e.targetTouches[0]
						? event.targetTouches[0].pageY
						: e.changedTouches[e.changedTouches.length - 1].pageY;
					const adjustmentX = mouse_current_left - mouse_down_left;
					const adjustmentY = mouse_current_top - mouse_down_top;

					if (adjustmentX !== 0 || adjustmentY !== 0) {
						element_moved = true;
					}

					// set the element's new position:
					element_to_move.style.left =
						element_start_left + adjustmentX + 'px';
					element_to_move.style.top =
						element_start_top + adjustmentY + 'px';
					element_to_move.style.bottom = 'unset';
					element_to_move.style.right = 'unset';
					element_to_move.style.transform = 'unset';
					element_to_move.style.marginTop = 'unset';
					element_to_move.style.marginLeft = 'unset';
				};
			};
		} catch (err) {
			console.error('error: ' + err);
		}
	}

	cancelDraggable(id_to_drag) {
		try {
			let element_to_drag = document.getElementById(id_to_drag);
			element_to_drag.onmousedown = null;
			element_to_drag.ontouchstart = null;
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * Callback is called on mousedown
	 */
	makeResizeable(target_div, icon_div = null, unique_id = null, direction = 'diagonal', callback = null) {
		let d = document;
		let target = d.querySelector(target_div);
		let pullTab = null;

		this.addElementToSelector(
			`<div class="resize-icon ${direction}" id="resize-icon-${unique_id}"></div>`,
			icon_div
		);
		pullTab = d.getElementById(`resize-icon-${unique_id}`);

		let ht, wd, x, y, dx, dy;

		const prepareToResize = () => {
			let dimensions = target.getBoundingClientRect();
			ht = dimensions.height;
			wd = dimensions.width;

			//
			// Draggable elements may have top/left set, but we want the bottom/right to be fixed
			//
			target.style.top = '';
			target.style.left = '';
			target.style.bottom = window.innerHeight - dimensions.bottom + 'px';
			target.style.right = window.innerWidth - dimensions.right + 'px';
		};

		pullTab.onmousedown = (evt) => {
			x = evt.screenX;
			y = evt.screenY;

			evt.stopImmediatePropagation();
			evt.preventDefault();

			prepareToResize();

			//Get rid of any animation delays
			target.style.transition = 'unset';

			d.body.onmousemove = (evt) => {
				dx = evt.screenX - x;
				dy = evt.screenY - y;
				x = evt.screenX;
				y = evt.screenY;
				
				if (direction == 'horizontal') {
					wd += dx;
					target.style.width = wd + 'px';
				}
				if (direction == 'vertical') {
					ht += dy;
					target.style.height = ht + 'px';
				}

				if (direction == 'diagonal') {
					wd -= dx;
					ht -= dy;
					target.style.width = wd + 'px';
					target.style.height = ht + 'px';
				}
			};

			d.body.onmouseup = () => {
				d.body.onmousemove = null;
				target.style.transition = '';
			};

			if (callback) {
				callback();
			}
		};
	}
	
	returnAddressHTML(key) {
		return `<div class="saito-address" data-id="${key}">${this.app.keychain.returnIdentifierByPublicKey(
			key,
			true
		)}</div>`;
	}

	updateAddressHTML(key, id) {
		if (!id) {
			return;
		}
		if (key === id) {
			return;
		}
		try {
			Array.from(
				document.querySelectorAll(`.saito-address[data-id='${key}']`)
			).forEach((add) => (add.innerHTML = id));
		} catch (err) {
			console.error(err);
		}

		this.app.connection.emit('update-username-in-game');
	}

	logMatomoEvent(category, action, name, value) {
		try {
			let m = this.app.modules.returnFirstRespondTo('matomo_event_push');
			if (m) {
				m.push(category, action, name, value);
			}
		} catch (err) {
			console.error(err);
		}
	}

	//////////////////////////////////////////////////////////////////////////////
	/////////////////////// url-hash helper functions ////////////////////////////
	//////////////////////////////////////////////////////////////////////////////
	// TODO: Add a function which alphabetizes keys so that noop url changes will
	// always act correctly... .e.g. someFunction("#bar=1&foo=2") should never
	// return "#foo=1&bar=2". Some other way of preserving order may be better...
	//////////////////////////////////////////////////////////////////////////////
	//
	// Parse a url-hash string into an object.
	// usage: parseHash("#foo=1&bar=2") --> {foo: 1, bar: 2}
	parseHash(hash) {
		if (hash === '') {
			return {};
		}
		return hash
			.substr(1)
			.split('&')
			.reduce(function (result, item) {
				const parts = item.split('=');
				result[parts[0]] = parts[1];
				return result;
			}, {});
	}

	// Build a url-hash string from an object.
	// usage: buildHash({foo: 1, bar: 2}) --> "#foo=1&bar=2"
	buildHash(hashObj) {
		const hashString = Object.keys(hashObj).reduce((output, key) => {
			const val = hashObj[key];
			return output + `&${key}=${hashObj[key]}`;
		}, '');
		return '#' + hashString.substr(1);
	}

	// Remove a subset of key-value pairs from a url-hash string.
	// usage: removeFromHash("#foo=1&bar=2","bar") --> "#foo=1"
	removeFromHash(hash, ...keys) {
		const hashObj = this.parseHash(hash);
		keys.forEach((key, i) => {
			delete hashObj[key];
		});
		return this.buildHash(hashObj);
	}

	// Add new key-value pairs to the hash.
	// usage: modifyHash("#foo=1",{bar: 2}) --> "#foo=1&bar=2"
	modifyHash(oldHash, newHashValues) {
		return this.buildHash(
			Object.assign(this.parseHash(oldHash), newHashValues)
		);
	}

	// Override defaults with other values. Useful to initialize a page.
	// usage: modifyHash("#foo=1&bar=2","#foo=3") --> "#foo=3&bar=2"
	defaultHashTo(defaultHash, newHash) {
		return this.buildHash(
			Object.assign(this.parseHash(defaultHash), this.parseHash(newHash))
		);
	}

	// Initialize a hash on page load.
	// Typically some values need a setting but can be overridden by a "deep link".
	// Other values must take certain values on page load, e.g. ready=false these
	// go in the forcedHashValues
	//
	// usage:
	// let currentHash = window.location.hash; // (e.g."#page=2&ready=1")
	initializeHash(defaultHash, deepLinkHash, forcedHashValues) {
		return this.modifyHash(
			this.defaultHashTo(defaultHash, deepLinkHash),
			forcedHashValues
		);
	}

	//////////////////////////////////////////////////////////////////////////////
	/////////////////////// end url-hash helper functions ////////////////////////
	//////////////////////////////////////////////////////////////////////////////

	async screenshotCanvasElementById(id = '', callback = null) {
		let canvas = document.getElementById(id);
		if (canvas) {
			let img = canvas.toDataURL('image/jpeg', 0.35);
			if (callback != null) {
				callback(img);
				d;
			}
		}
	}

	//
	// neither of these is quite right and the internet is full of wrong answers
	//
	urlRegexp() {
        // from tweet.js 
		// let expression = /\b(?:https?:\/\/)?[\w.]{2,}\.[a-zA-Z]{1,}(\/[\w\/.-]*)?(\?[^<\s]*)?(?![^<]*>)/gi;

        // from sanitize let urlPattern = /\b(?:https?:\/\/)?[\w]+(\.[\w]+)+\.[a-zA-Z]{2,}(\/[\w\/.-]*)?(\?[^<\s]*)?(?![^<]*>)/gi;
        // The sanitizeHtml converts & into `&amp;` so we should match on ;
        // let daniels_regex = /(?<!>)\b(?:https?:\/\/|www\.|https?:\/\/www\.)?(?:\w{2,}\.)+\w{2,}(?:\/[a-zA-Z0-9_\?=#&;@\-\.]*)*\b(?!<\/)/gi;
        // this pointlessly looks for www, but does not identify the majority of valid urls or any url without http/https in front of it.

		// Re-added this code as urls don't work without it. Did chance the var names for safety.

        //this should identify patterns like x.com and staging.saito.io which the others do not.
		let urlIndentifierRegexp = /\b(?:https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\/.-]*)?(\?[^<\s]*)?(?![^<]*>)/gi;
        return urlIndentifierRegexp;
	}

	sanitize(text, createLinks = false) {
		//console.log("Sanitize: ", text);
		try {
			if (text !== '') {
				text = marked.parseInline(text);
				//trim trailing line breaks -
				// commenting it out because no need for this now
				// because of above marked parsing
				//text = text.replace(/[\r<br>]+$/, "");
			}

			text = sanitizeHtml(text, {
				allowedTags: [
					'h1',
					'h2',
					'h3',
					'h4',
					'h5',
					'h6',
					'blockquote',
					'p',
					'ul',
					'ol',
					'nl',
					'li',
					'b',
					'i',
					'strong',
					'em',
					'strike',
					'code',
					'hr',
					'br',
					'div',
					'table',
					'thead',
					'caption',
					'tbody',
					'tr',
					'th',
					'td',
					'pre',
					'marquee',
					'pre',
					'span'
				],
				allowedAttributes: {
					div: ['class', 'id'],
					span: ['class', 'id', 'data-id'],
					img: ['src', 'class'],
					blockquote: ['href'],
					i: ['class']
				},
				selfClosing: [
					'img',
					'br',
					'hr',
					'area',
					'base',
					'basefont',
					'input',
					'link',
					'meta'
				],
				allowedSchemes: ['http', 'https', 'ftp', 'mailto'],
				allowedSchemesByTag: {},
				allowedSchemesAppliedToAttributes: ['href', 'cite'],
				allowProtocolRelative: true
			});

			/* wrap link in <a> tag */

			if (createLinks) {
				text = text.replace(this.urlRegexp(), function (url) {
					let url1 = url.trim();
					let url2 = url1;
					if (url2.length > 42) {
						if (url2.indexOf('http') == 0 && url2.includes('://')) {
							let temp = url2.split('://');
							url2 = temp[1];
						}
						if (url2.indexOf('www.') == 0) {
							url2 = url2.substr(4);
						}
						if (url2.length > 40) {
							url2 = url2.substr(0, 37) + '...';
						}
					}

					return `<a ${url.includes(window.location.host)
						? ''
						: "target='_blank' rel='noopener noreferrer' "
						} class="saito-treated-link" href="${!url.includes('http') ? `http://${url1}` : url1}">${url2}</a>`;
				});
			}

			//trim lines at start and end
			text = text.replace(/^\s+|\s+$/g, '');

			text = emoji.emojify(text);

			return text;
		} catch (err) {
			console.log('Err in sanitizing: ' + err);
			return text;
		}
	}

	async resizeImg(
		img,
		targetSize = 512,
		maxDimensions = { w: 1920, h: 1024 }
	) {
		let self = this;
		let dimensions = await this.getImageDimensions(img);
		let new_img = '';
		let canvas = document.createElement('canvas');
		let oImg = document.createElement('img');

		let w = dimensions.w;
		let h = dimensions.h;
		let aspect = w / h;

		if (w > maxDimensions.w) {
			w = maxDimensions.w;
			h = maxDimensions.w / aspect;
		}
		if (h > maxDimensions.h) {
			h = maxDimensions.h;
			w = maxDimensions.h * aspect;
		}

		canvas.width = w;
		canvas.height = h;

		let last_img_size = 1000000000000;

		function resizeLoop(img, quality = 1) {
			oImg.setAttribute('src', img);
			canvas.getContext('2d').drawImage(oImg, 0, 0, w, h);
			new_img = canvas.toDataURL('image/jpeg', quality);
			let imgSize = new_img.length / 1024; // in KB
			console.log('resizing: ' + imgSize);

			//Prevent infinite loops by seeing if the size is still going down
			if (imgSize > targetSize && imgSize < last_img_size) {
				last_img_size = imgSize;
				resizeLoop(new_img, quality * 0.9);
			} else {
				return;
			}
		}

		resizeLoop(img);

		oImg.remove();
		canvas.remove();

		console.log('Resized to: ' + new_img.length / 1024);

		return new_img;
	}

	getImageDimensions(file) {
		return new Promise(function (resolved, rejected) {
			let i = new Image();
			i.onload = function () {
				resolved({ w: i.width, h: i.height });
			};
			i.src = file;
		});
	}

	stripHtml(html) {
		if (this.app.BROWSER) {
			let tmp = document.createElement('DIV');
			tmp.innerHTML = html;
			return tmp.textContent || tmp.innerText || '';
		}

		return html.replace(/(<([^>]+)>)/gi, '');
	}

	//
	// This function should make strings friendly to put INSIDE an html tag
	// escaping special characters like & < > "
	//
	escapeHTML(text){
		return sanitizer.escapeAttrib(text);
	}


	//////////////////////
	// helper functions //
	//////////////////////
	filterText(text = '') {
		text = text.replace(/^\s+$/gm, '');
		text = text.replace(/^\n+$/gm, '');
		text = text.replace(
			/<div>\s*<br>\s*<\/div>\s*<div>\s*<br>\s*<\/div>/gm,
			'<div><br></div>'
		);
		text = text.replace(/<div>\s*<br>\s*<\/div>$/gm, '');

		return text;
	}

	attachWindowFunctions() {
		if (typeof window !== 'undefined') {
			let browser_self = this;

			let mutationObserver = new MutationObserver(function (mutations) {
				mutations.forEach(function (mutation) {
					if (mutation.addedNodes.length > 0) {
						browser_self.treatElements(mutation.addedNodes);
						browser_self.treatIdentifiers(mutation.addedNodes);
					}
				});
			});

			mutationObserver.observe(document.documentElement, {
				attributes: true,
				characterData: true,
				childList: true,
				subtree: true,
				attributeOldValue: true
			});

			window.sanitize = function (msg) {
				let result = browser_self.sanitize(msg);
				return result;
			};

			window.salert = function (message) {
				if (document.getElementById('saito-alert')) {
					return;
				}
				let wrapper = document.createElement('div');
				wrapper.id = 'saito-alert';
				let html = `<div id="saito-alert-shim">
                      <div id="saito-alert-box">
                        <div class="saito-alert-message">${browser_self.sanitize(
					message
				)}</div>
                        <div id="saito-alert-buttons">
                          <button id="alert-ok">OK</button>
                        </div>
                      </div>
                    </div>`;
				wrapper.innerHTML = html;
				document.body.appendChild(wrapper);
				//        setTimeout(() => {
				//          document.querySelector("#saito-alert-box").style.top = "0";
				//        }, 100);
				document.querySelector('#alert-ok').focus();
				document
					.querySelector('#saito-alert-shim')
					.addEventListener('keyup', function (event) {
						if (event.keyCode === 13) {
							event.preventDefault();
							document.querySelector('#alert-ok').click();
						}
					});
				document.querySelector('#alert-ok').addEventListener(
					'click',
					function () {
						wrapper.remove();
					},
					false
				);
			};

			window.sconfirm = function (message) {
				if (document.getElementById('saito-alert')) {
					return;
				}
				return new Promise((resolve, reject) => {
					let wrapper = document.createElement('div');
					wrapper.id = 'saito-alert';
					let html = `<div id="saito-alert-shim">
                        <div id="saito-alert-box">
                          <div class="saito-alert-message">${browser_self.sanitize(
						message
					)}</div>
                          <div id="saito-alert-buttons">
                            <button id="alert-cancel">Cancel</button>
                            <button id="alert-ok">OK</button>
                          </div>
                        </div>
                      </div>`;
					wrapper.innerHTML = html;
					document.body.appendChild(wrapper);
					//          setTimeout(() => {
					//            document.getElementById("saito-alert-box").style.top = "0";
					//          }, 100);
					document.getElementById('alert-ok').focus();
					//document.getElementById('alert-ok').select();
					document.getElementById('saito-alert-shim').onclick = (
						event
					) => {
						if (event.keyCode === 13) {
							event.preventDefault();
							document.getElementById('alert-ok').click();
						}
					};
					document.getElementById('alert-ok').onclick = () => {
						wrapper.remove();
						resolve(true);
						// }, false;
					};
					document.getElementById('alert-cancel').onclick = () => {
						wrapper.remove();
						resolve(false);
						// }, false);
					};
				});
			};

			window.sprompt = function (message, suggestion = '') {
				if (document.getElementById('saito-alert')) {
					return;
				}
				return new Promise((resolve, reject) => {
					let wrapper = document.createElement('div');
					wrapper.id = 'saito-alert';
					let html = `<div id="saito-alert-shim">
                        <div id="saito-alert-box">
                          <div class="saito-alert-message">${browser_self.sanitize(
						message
					)}</div>
                          <div class="alert-prompt"><input type="text" id="promptval" class="promptval" placeholder="${suggestion}" /></div>
                          <div id="alert-buttons">
                            <button id="alert-cancel">Cancel</button>
                            <button id="alert-ok">OK</button>
                          </div>
                        </div>
                      </div>`;
					wrapper.innerHTML = html;
					document.body.appendChild(wrapper);
					document.querySelector('#promptval').focus();
					document.querySelector('#promptval').select();
					//          setTimeout(() => {
					//            document.querySelector("#saito-alert-box").style.top = "0";
					//          }, 100);
					document
						.querySelector('#saito-alert-shim')
						.addEventListener('keyup', function (event) {
							if (event.keyCode === 13) {
								event.preventDefault();
								document.querySelector('#alert-ok').click();
							}
						});
					document.querySelector('#alert-ok').addEventListener(
						'click',
						function () {
							let val =
								document.querySelector('#promptval').value ||
								suggestion;
							wrapper.remove();
							resolve(val);
						},
						false
					);
					document.querySelector('#alert-cancel').addEventListener(
						'click',
						function () {
							wrapper.remove();
							resolve(false);
						},
						false
					);
				});
			};

			window.siteMessage = function (
				message,
				killtime = 9999999,
				callback = null
			) {
				if (document.getElementById('message-wrapper')) {
					document.getElementById('message-wrapper').remove();
				}
				let wrapper = document.createElement('div');
				wrapper.id = 'message-wrapper';
				if (callback) {
					wrapper.classList.add('message-clickable');
				}
				wrapper.innerHTML = `<div class="message-message">${browser_self.sanitize(
					message
				)}</div>`;

				document.body.appendChild(wrapper);

				let timeout = setTimeout(() => {
					wrapper.remove();
				}, killtime);

				document.querySelector('#message-wrapper').addEventListener(
					'click',
					() => {
						if (callback) {
							callback();
						}
						wrapper.remove();
						clearTimeout(timeout);
					},
					false
				);
			};

			window.ntfy = function (
				to,
				content
			) {
				content.topic = to;
				fetch('https://ntfy.hda0.net/', {
					method: 'POST',
					body: JSON.stringify(content)
				  });
			};

			HTMLElement.prototype.destroy = function destroy() {
				try {
					this.parentNode.removeChild(this);
				} catch (err) {
					console.err(err);
				}
			};

			window.setHash = function (hash) {
				window.history.pushState('', '', `/redsquare/#${hash}`);
			};
		}
	}

	treatElements(nodeList) {
		for (let i = 0; i < nodeList.length; i++) {
			if (nodeList[i].files) {
				this.treatFiles(nodeList[i]);
			}
		}
	}

	treatIdentifiers(nodeList) {
		let unknown_keys = [];
		let saito_app = this.app;

		function treat(nodes) {
			nodes.forEach((el) => {
				if (el.classList) {
					if (
						el.classList.contains('saito-address') &&
						!el.classList.contains('treated')
					) {
						el.classList.add('treated');
						let key = el.dataset?.id;
						if (key && saito_app.wallet.isValidPublicKey(key)) {
							let identifier =
								saito_app.keychain.returnIdentifierByPublicKey(
									key,
									true
								);
							if (identifier !== key) {
								el.innerText = identifier;
							} else {
								if (!unknown_keys.includes(key)) {
									unknown_keys.push(key);
								}
							}
						}
					}
				}
				if (el.childNodes.length >= 1) {
					treat(el.childNodes);
				}
			});
		}

		treat(nodeList);
		if (unknown_keys.length > 0) {
			this.app.connection.emit(
				'registry-fetch-identifiers-and-update-dom',
				unknown_keys
			);
		}
	}

	treatFiles(input) {
		if (input.classList.contains('treated')) {
			return;
		} else {
			input.addEventListener('change', function (e) {
				let fileName = '';
				if (this.files && this.files.length > 1) {
					fileName = this.files.length + ' files selected.';
				} else {
					fileName = e.target.value.split('\\').pop();
				}
				if (fileName) {
					filelabel.style.border = 'none';
					filelabel.innerHTML = sanitize(fileName);
				} else {
					//
					// What is labelVal supposed to be???
					//
					//filelabel.innerHTML = sanitize(labelVal);
				}
			});
			input.classList.add('treated');
			let filelabel = document.createElement('label');
			filelabel.classList.add('treated');
			filelabel.innerHTML = 'Choose File';
			filelabel.htmlFor = input.id;
			filelabel.id = input.id + '-label';
			let parent = input.parentNode;
			parent.appendChild(filelabel);
		}
	}

	switchTheme(theme) {
		document.documentElement.setAttribute('data-theme', theme);

		if (this.app.BROWSER == 1) {

			let mod_obj = this.app.modules.returnActiveModule();

			if (!this.app.options.theme) {
				this.app.options.theme = {};
			}

			if (mod_obj != null) {
				if (mod_obj.slug != null) {
					this.app.options.theme[mod_obj.slug] = theme;
					this.app.storage.saveOptions();
				}
			}

			this.updateThemeInHeader(theme);
		}
	}

	updateThemeInHeader(theme){
		//Update header
		setTimeout(()=> {
			let theme_icon_obj = document.querySelector(".saito-theme-icon");
			let am = this.app.modules.returnActiveModule();

			if (theme_icon_obj && am){
				let classes = theme_icon_obj.classList;
				for (let c of classes){
					theme_icon_obj.classList.remove(c);
				}

				theme_icon_obj.classList.add("saito-theme-icon");

				let theme_classes = am.theme_options[theme].split(" ");
				for (let t of theme_classes){
					theme_icon_obj.classList.add(t);
				}
			}
		}, 500);
	}

	isValidUrl(urlString) {
		try {
			let inputElement = document.createElement('input');
			inputElement.type = 'url';
			inputElement.value = urlString;

			if (!inputElement.checkValidity()) {
				return false;
			} else {
				return true;
			}
		} catch (err) { }
		return false;
	}

	updateSoftwareVersion(receivedBuildNumber: number) {
		console.log(
			`Received build number: ${Number(
				receivedBuildNumber
			)}, Current build number: ${this.app.build_number}`
		);
		if (receivedBuildNumber > this.app.build_number) {
			if (
				confirm(
					`Saito Upgrade: Upgrading to new version ${receivedBuildNumber}`
				)
			) {
				console.log(
					`New software update found: ${receivedBuildNumber}. Updating...`
				);
				siteMessage(
					`New software update found: ${receivedBuildNumber}. Updating...`
				);
				setTimeout(function () {
					window.location.reload();
				}, 3000);
			}
		}
	}

	getDecimalSeparator() {
		let locale = (window.navigator?.language)
			? window.navigator?.language : 'en-US';
		const numberWithDecimalSeparator = 1.1;
		return Intl.NumberFormat(locale)
			.formatToParts(numberWithDecimalSeparator)
			.find(part => part.type === 'decimal')
			.value;
	}

	getThousandSeparator() {
		let decimal_separator = this.getDecimalSeparator();
		return (decimal_separator == '.') ? ',' : '.';
	}

	/**
	 * Format a number to locale string
	 * @returns String
	 * @param number
	 */

	formatNumberToLocale(number) {
		try {
			const locale = (window.navigator?.language) ? window.navigator?.language : 'en-US';
			const numberFormatter = new Intl.NumberFormat(locale, {
				minimumFractionDigits: 1,
				// maximumFractionDigits: 4,
				minimumSignificantDigits: 1,
				// maximumSignificantDigits: 4
			});
			return numberFormatter.format(number);
		} catch (error) {
			console.log(error);
			return number;
		}
	}

	addSaitoMentions(textarea, listDiv, inputType) {

		new SaitoMentions(
			this.app,
			textarea,
			listDiv,
			inputType
		)
	}

	extractMentions(text){
		let potential_keys = text.matchAll(/(?<=^|(?<=[^a-zA-Z0-9-_\.]))@([^\s]+)/g);
		let keys = [];

        for (let k of potential_keys){
            let split = k[0].split('@');
            let username = '';
            let key = '';

            if (split.length > 2) {
              username = split[1] + '@' + split[2];
              key =
                this.app.keychain.returnPublicKeyByIdentifier(
                  username
                );
            } else {
              username = this.app.keychain.returnUsername(split[1]);
              key = split[1];
            }

            console.log("Key: ", key);
            if (this.app.wallet.isValidPublicKey(key)) {
            	if (!keys.includes(key)){
            		keys.push(key);
            	}
            }
        }

	    return keys;
	}

	markupMentions(text){
        return text.replaceAll(
          /(?<=^|(?<=[^a-zA-Z0-9-_\.]))@([^\s]+)/g,
          (k) => {
            let split = k.split('@');
            let username = '';
            let key = '';

            if (split.length > 2) {
              username = split[1] + '@' + split[2];
              key =
                this.app.keychain.returnPublicKeyByIdentifier(
                  username
                );
            } else {
              username = this.app.keychain.returnUsername(split[1]);
              key = split[1];
            }

            if (this.app.wallet.isValidPublicKey(key)) {
            	return 	`<span class="saito-mention saito-address" data-id="${key}">${username}</span>`;
            }else{
            	return k;
            }

          }
        );
	}



	validateAmountLimit(amount, event){
		// allow only numbers, dot, backspace
		// 95 to 106 corresponds to Numpad 0 through 9;
		// 47 to 58 corresponds to 0 through 9 on the Number Row; 
		// 8 is Backspace
		// 190, 110, 46 are for dot (.)
		if(!((event.keyCode > 95 && event.keyCode < 106)
	      || (event.keyCode > 47 && event.keyCode < 58) 
	      || event.keyCode == 8 || event.keyCode==190 || event.keyCode==110 || event.keyCode==46) 
		  ) {
	      	event.preventDefault();
	        return false;
	    }

      // prevent user for adding number gretaer than 10^9 to input
      if (amount > 1000000000) {
        if (!isNaN(event.key)) {
          event.preventDefault();
          return false;
        }
      }

      // prevent user for adding more than 8 decimal point precision
      let amount_string = amount.toString();
      let decimal_separator =  this.app.browser.getDecimalSeparator();
     
      if (amount_string.indexOf(decimal_separator)) {
        let myArray = amount.split(decimal_separator);
        if (typeof myArray[1] != 'undefined') {
	       let decimal_value = myArray[1];
	       if (decimal_value.length > 8) {
	         if (!isNaN(event.key)) {
	           event.preventDefault();
	           return false;
	         }
	       }
	      }
      } 
	}

	formatDecimals(num, string = false){
		let pos = Math.abs((Math.log10(num))); 
		let number = Number(num);
	  	number = number.toFixed(pos+2);
	  	number = (number);
	  	return (string) ? number.toString(): number;  
	}
}

export default Browser;
