const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const CallLauncher = require('./lib/components/call-launch');
const CallInterfaceVideo = require('./lib/components/call-interface-video');
const CallInterfaceFloat = require('./lib/components/call-interface-float');
const DialingInterface = require('./lib/components/dialer');
const SaitoOverlay = require('../../lib/saito/ui/saito-overlay/saito-overlay');

const StreamManager = require('./lib/StreamManager');
const AppSettings = require('./lib/stun-settings');
const HomePage = require("./index");

class Videocall extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.appname = 'Saito Talk';
		this.name = 'Videocall';
		this.slug = 'videocall';

		this.description = 'P2P Video & Audio Connection Module';
		this.categories = 'Utilities Communications';
		this.icon = 'fa-solid fa-mobile-screen-button';  
		this.request_no_interrupts = true; // Don't let chat popup inset into /videocall
		this.isRelayConnected = false;

		this.screen_share = false;

		this.styles = ['/saito/saito.css', '/videocall/style.css'];

		this.stun = null; //The stun API
		this.streams = null;
		this.dialer = new DialingInterface(app, this);

		this.layout = "focus";

		this.social = {
			twitter: '@SaitoOfficial',
			title: '🟥 Saito Talk',
			url: 'https://saito.io/videocall/',
			description: 'Peer to peer voice and video calling with no middleman',
			image: "/videocall/img/video-call-og.png",
			//image: 'https://saito.tech/wp-content/uploads/2023/11/videocall-300x300.png',
		};


		//When CallLauncher is rendered or game-menu triggers it
		app.connection.on('stun-init-call-interface', (settings) => {
			if (this.CallInterface) {
				console.warn('Already instatiated a video/audio call manager');
				return;
			}

			if (!this.streams) {
				this.streams = new StreamManager(this.app, this, settings);
			} else {
				this.streams.updateSettings(settings);
				this.streams.active = true;
			}

			console.log('STUN UI: ', settings);

			if (settings.ui === 'large') {
				this.CallInterface = new CallInterfaceVideo(app, this, true);
			} else if (settings.ui === 'video') {
				this.CallInterface = new CallInterfaceVideo(app, this, false);
			} else {
				this.CallInterface = new CallInterfaceFloat(app, this);
			}
		});

		app.connection.on('reset-stun', () => {
			this.room_obj = null;
			if (this.CallInterface) {
				this.CallInterface.destroy();
				this.CallInterface = null;
			}

			this.streams = null;

			this.app.storage.saveOptions();
		});
	}

	/**
	 * rendered on:
	 *  - /videocall
	 *  - Saito-header menu
	 *  - Saito-user-menu
	 *  - game-menu options
	 *
	 */

	async initialize(app) {
		await super.initialize(app);

		if (app.BROWSER) {
			if (!this.app.options?.stun?.settings) {
				this.app.options.stun = {
					settings: { privacy: 'all' },
				};
			}

			if (this.app.options.stun.settings?.layout) {
				this.layout = this.app.options.stun.settings?.layout;
			}

			console.log("************* LAYOUT" , this.layout);

			if (app.browser.returnURLParameter('stun_video_chat')) {
				this.room_obj = JSON.parse(
					app.crypto.base64ToString(
						app.browser.returnURLParameter('stun_video_chat')
					)
				);

				// JOIN THE ROOM
				if (!this.browser_active) {
					this.renderInto('.saito-overlay');
				}
			} 

			try {
				this.stun = app.modules.returnFirstRespondTo('peer-manager');
			} catch (err) {
				console.warn(
					'Videocall unavailable without Stun module installed!'
				);
			}
		}
	}

	async onPeerServiceUp(app, peer, service) {
		if (app.BROWSER !== 1) {
			return;
		}

		if (service.service === 'relay') {
			this.isRelayConnected = true;
		}
	}

	render() {
		this.renderInto('body');
	}

	renderInto(qs) {
		if (qs == '.saito-overlay' || qs == 'body') {
			if (!this.renderIntos[qs]) {
				this.renderIntos[qs] = [];
				this.renderIntos[qs].push(new CallLauncher(this.app, this, qs));
			}
			this.attachStyleSheets();
			this.renderIntos[qs].forEach((comp) => {
				comp.render();
			});
			this.renderedInto = qs;
		}
	}

	respondTo(type, obj) {
		let call_self = this;

		if (type === 'user-menu') {
			//Don't provide a calling hook if in the video call app!
			if (call_self.browser_active) {
				return null;
			}
			if (obj?.publicKey) {
				if (obj.publicKey !== this.app.wallet.publicKey) {
					this.attachStyleSheets();
					super.render(this.app, this);
					return [
						{
							text: 'Video/Audio Call',
							icon: 'fas fa-video',
							callback: function (app, public_key) {
								if (call_self?.room_obj) {
									salert('Already in or establishing a call');
									console.log(call_self.room_obj);
								} else {
									call_self.dialer.establishStunCallWithPeers(
										[public_key]
									);
								}
							}
						}
					];
				}
			}
		}

		if (type === 'saito-header') {
			if (!this.browser_active) {
				this.attachStyleSheets();
				super.render(this.app, this);

				return [
					{
						text: 'Saito Talk',
						icon: this.icon,

						callback: function (app, id) {
							call_self.renderInto('.saito-overlay');
						}
					}
				];
			}
		}
		//
		//Game-Menu passes the game_mod as the obj, so we can test if we even want to add the option
		//
		if (type == 'game-menu') {
			this.attachStyleSheets();
			super.render(this.app, this);

			//Set listeners for stun events
			this.app.connection.on('show-call-interface', () => {
				document.getElementById(
					'start-group-video-chat'
				).classList.add("disable-menu");
			});
			this.app.connection.on('reset-stun', () => {
				document.getElementById('start-group-video-chat').classList.remove("disable-menu");
			});

			if (obj?.game?.players?.length > 1) {
				let menu_items = {
					id: 'game-social',
					text: 'Chat',
					submenus: [
						{
							parent: 'game-social',
							text: 'Start Call',
							id: 'start-group-video-chat',
							class: 'start-group-video-chat',
							callback: function (app, game_mod) {
								//Start Call
								game_mod.menu.hideSubMenus();

								if (call_self?.room_obj) {
									salert('Already in or establishing a call');
									console.log(call_self.room_obj);
								} else {
									call_self.dialer.establishStunCallWithPeers(
										[...game_mod.game.players]
									);
								}
							}
						}
					]
				};

				return menu_items;
			}
		}

		if (type === 'chat-actions') {
			if (obj?.publicKey) {
				if (obj.publicKey !== this.app.wallet.publicKey) {
					this.attachStyleSheets();
					super.render(this.app, this);
					return [
						{
							text: 'Video/Audio Call',
							icon: 'fas fa-phone',
							callback: function (app, public_key, id) {
								console.log('Chat Action call');
								if (call_self?.room_obj) {
									salert('Already in or establishing a call');
									console.log(call_self.room_obj);
								} else {
									call_self.dialer.establishStunCallWithPeers(
										[public_key]
									);
								}
							}
						}
					];
				}
			}
		}

		if (type === 'call-actions') {
			return [
				{
					text: 'Present',
					icon: 'fa-solid fa-display',
					hook: 'screen_share onair',
					prepend: true,
					callback: function (app) {

						if (call_self.screen_share) {
							call_self.app.connection.emit('stop-share-screen');
						} else {
							call_self.app.connection.emit('begin-share-screen');
						}
					},
					event: function(id){
					    call_self.app.connection.on('toggle-screen-share-label', (state = false) => {
					    	let container = document.getElementById(id);
							if (container){
								if (state){
									container.classList.add("recording");
									container.querySelector("label").innerText = "Stop";
									container.querySelector("i")?.classList.add("recording");
								}else{
									container.classList.remove("recording");
									container.querySelector("label").innerText = "Present";
									container.querySelector("i")?.classList.remove("recording");
								}
							}
  					    });
					}
				},
				{
					text: 'Settings',
					icon: 'fa-solid fa-cog',
					prepend: true,
					callback: function (app) {
						app.connection.emit('videocall-show-settings');
					}
				},
			];
		}

		if (type === 'media-request') {
			if (this?.streams?.active) {
				return {
					localStream: this.streams.localStream.clone(),
					remoteStreams: this.streams.remoteStreams
				};
			} else {
				return null;
			}
		}

		return super.respondTo(type, obj);
	}

	hasSettings() {
		return true;
	}

	loadSettings(container = null) {
		let as = new AppSettings(this.app, this, container);
		as.render();
	}

	onConfirmation(blk, tx, conf) {
		if (tx == null) {
			return;
		}

		let message = tx.returnMessage();

		if (conf === 0) {
			if (message.module === 'Videocall') {
				if (this.app.BROWSER === 1) {
					if (this.hasSeenTransaction(tx)) return;

					if (
						!this?.room_obj?.call_id ||
						this.room_obj.call_id !== message.call_id
					) {
						console.log('OC: Tab is not active');
						return;
					}

					if (tx.isTo(this.publicKey) && !tx.isFrom(this.publicKey)) {
						console.log('OnConfirmation: ' + message.request);

						if (message.request === 'call-list-request') {
							this.receiveCallListRequestTransaction(
								this.app,
								tx
							);
						}
						if (message.request === 'call-list-response') {
							this.receiveCallListResponseTransaction(
								this.app,
								tx
							);
						}
					}
				}
			}
		}
	}

	async handlePeerTransaction(app, tx = null, peer, mycallback) {
		if (tx == null) {
			return;
		}
		let txmsg = tx.returnMessage();

		if (this.app.BROWSER === 1) {
			if (tx.isTo(this.publicKey) && !tx.isFrom(this.publicKey)) {
				//
				// These messages are sent exclusively through Relay -- so unsigned
				// and not belonging to a module
				//
				if (txmsg.request.includes('stun-connection')) {
					console.log("Stun-connection", txmsg.data);
					this.dialer.receiveStunCallMessageFromPeers(tx);
					return;
				}

				if (this.hasSeenTransaction(tx)) return;

				if (txmsg.module == 'Videocall' || txmsg.module == 'Stun') {
					if (
						!this?.room_obj?.call_id ||
						this.room_obj.call_id !== txmsg.call_id
					) {
						return;
					}

					console.log('HPT: ' + txmsg.request);

					if (txmsg.request === 'call-list-request') {
						this.receiveCallListRequestTransaction(this.app, tx);
						return;
					}
					if (txmsg.request === 'call-list-response') {
						this.receiveCallListResponseTransaction(this.app, tx);
						return;
					}

					if (txmsg.request === 'peer-joined') {
						let from = tx.from[0].publicKey;

						this.app.connection.emit(
							'add-remote-stream-request',
							from,
							null
						);

						if (!this.room_obj.call_peers.includes(from)) {
							this.room_obj.call_peers.push(from);
							this.app.connection.emit('stun-update-link');
						}

						//Limbo Hook
						this.app.connection.emit("videocall-add-party", from);
						console.log("STUN: VIDEOCALL PEER JOINED");
						this.stun.createPeerConnection(from, false);

						return;
					}

					if (txmsg.request === 'peer-left') {
						let from = tx.from[0].publicKey;

						for (
							let i = 0;
							i < this.room_obj.call_peers.length;
							i++
						) {
							if (this.room_obj.call_peers[i] == from) {
								this.room_obj.call_peers.splice(i, 1);
								if (from !== this.publicKey){
									this.app.connection.emit('stun-update-link');			
								}
								break;
							}
						}
						this.app.connection.emit('remove-peer-box', from);

						//Limbo Hook
						this.app.connection.emit("videocall-remove-party", from);

						//See if we need to also hang up on our end
						this.streams.removePeer(from);
					}

					if (
						txmsg.request === 'toggle-audio' ||
						txmsg.request == 'toggle-video'
					) {
						this.app.connection.emit(
							`peer-${txmsg.request}-status`,
							txmsg.data
						);
					}

					if (txmsg.request === 'screen-share-start') {
						this.screen_share = tx.from[0].publicKey;
						this.app.connection.emit(
							'add-remote-stream-request',
							'presentation',
							null
						);
					}

					if (txmsg.request === 'screen-share-stop') {
						this.app.connection.emit(
							'remove-peer-box',
							'presentation'
						);
						this.app.connection.emit('stun-switch-view', this.app.options.stun.settings?.layout || this.layout);
						this.screen_share = null;
					}
					if (txmsg.request === 'broadcast-call-list') {
						this.receiveBroadcastListTransaction(this.app, tx);
					}
				}
			}
		}

		return super.handlePeerTransaction(app, tx, peer, mycallback);
	}

	// A convenience function to send metadata through the stun channel (if established) or over relay otherwise
	// but
	async sendOffChainMessage(request, data) {
		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee();

		for (let peer of this.room_obj.call_peers) {
			if (peer != this.publicKey) {
				newtx.addTo(peer);
			}
		}

		newtx.msg = {
			module: 'Videocall',
			request,
			call_id: this.room_obj.call_id,
			data
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
	}

	createRoomCode() {
		return this.app.crypto.generateRandomNumber().substring(0, 12);
	}

	async sendCallEntryTransaction(public_key = '') {
		if (!this.room_obj) {
			console.error('No room object');
			return;
		}

		if (!public_key) {
			public_key = this.room_obj?.host_public_key;
		}

		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee(
				public_key
			);

		newtx.msg.module = 'Videocall';
		newtx.msg.request = 'call-list-request';
		newtx.msg.call_id = this.room_obj.call_id;

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
	}

	receiveCallListRequestTransaction(app, tx) {
		let txmsg = tx.returnMessage();

		let from = tx.from[0].publicKey;


		let call_list = [];

		if (this.room_obj.call_peers){
			this.room_obj.call_peers.forEach((key) => {
				if (!call_list.includes(key)) {
					call_list.push(key);
				}
			});
		}

		if (!call_list.includes(this.publicKey)) {
			call_list.push(this.publicKey);
		}

		console.log('STUN: peer list request from ', from, call_list);

		this.sendCallListResponseTransaction(from, call_list);

	}

	async sendCallListResponseTransaction(public_key, call_list) {
		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee(
				public_key
			);

		newtx.msg = {
			module: 'Videocall',
			request: 'call-list-response',
			call_list,
			call_id: this.room_obj.call_id
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);

		this.app.network.propagateTransaction(newtx);
	}

	receiveCallListResponseTransaction(app, tx) {
		let txmsg = tx.returnMessage();

		let call_list = txmsg.call_list;
		// remove my own key
		call_list = call_list.filter((key) => this.publicKey !== key);

		//
		// Create a connection with everyone
		//
		console.log(
			'STUN: My peer list: ',
			this.room_obj.call_peers,
			'Received list: ',
			call_list
		);

		for (let peer of call_list) {
			if (peer !== this.publicKey) {
				if (!this.room_obj?.call_peers.includes(peer)) {
					this.room_obj?.call_peers.push(peer);
				}

				console.log("STUN (VIDEOCALL): peer list member, create connection with ", peer);
				this.stun.createPeerConnection(peer, (peerId) => {
					this.sendCallJoinTransaction(peerId);
				});
			}
		}

		this.app.storage.saveOptions();
	}

	//
	// Videocall and stun both need a join connection, but we need videocall to process first so that the
	// key is added to the white list and the stun connection can be treated as a call entry (as opposed to 
	// someone else establising a stun connection for other purposes)
	//
	async sendCallJoinTransaction(publicKey) {
		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee(
				publicKey
			);

		newtx.msg = {
			module: 'Videocall',
			request: 'peer-joined',
			call_id: this.room_obj.call_id
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);

		this.app.network.propagateTransaction(newtx);

		this.app.connection.emit('add-remote-stream-request', publicKey, null);
	}

	async sendCallDisconnectTransaction() {
		if (!this?.room_obj) {
			console.log('No room object!');
			return;
		}

		console.log(
			'STUN: Send disconnect message:',
			this.room_obj,
		);

		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee();

		for (let peer of this.room_obj.call_peers) {
			if (peer != this.publicKey) {
				newtx.addTo(peer);
			}
		}

		newtx.msg = {
			module: 'Stun',
			request: 'peer-left',
			call_id: this.room_obj.call_id
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);

		//
		// Allow us to use stun connection to send tx before disconnecting!
		//
		for (let peer of this.room_obj.call_peers) {
			if (peer != this.publicKey) {
				//Disconnect stun on our end
				// the send tx will tell (former) peers to do the same
				this.stun.removePeerConnection(peer);
			}
		}
	}

	async receiveBroadcastListTransaction(app, tx) {
		const txmsg = tx.returnMessage();
		let sender = tx.from[0].publicKey;

		// Need code here to process keys that aren't otherwise in our call list 
		// retrigger stun connections

		let call_list = [];

		for (let peer in txmsg.data){
			console.log(peer, txmsg.data[peer]);
			if (txmsg.data[peer] == "connected"){
				if (peer !== this.publicKey) {
					if (!this.room_obj.call_peers.includes(peer)) {
						this.room_obj.call_peers.push(peer);

						console.log("STUN (VIDEOCALL): post hoc peer list member, attempt connection with ", peer);
						this.stun.createPeerConnection(peer, (peerId) => {
							this.sendCallJoinTransaction(peerId);
						});
					}
				}
			}
		}

		//Update display of videoboxes
		this.app.connection.emit('peer-list', sender, txmsg.data);
	}

	webServer(app, expressapp, express) {
		let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
		let mod_self = this;

		expressapp.get(
			'/' + encodeURI(this.returnSlug()),
			async function (req, res) {
				let reqBaseURL = req.protocol + '://' + req.headers.host + '/';

				mod_self.social.url = reqBaseURL + encodeURI(mod_self.returnSlug());

				res.setHeader('Content-type', 'text/html');
				res.charset = 'UTF-8';

				res.send(HomePage(app, mod_self, app.build_number, mod_self.social));
				return;
			}
		);

		expressapp.use(
			'/' + encodeURI(this.returnSlug()),
			express.static(webdir)
		);
	}

}

module.exports = Videocall;
