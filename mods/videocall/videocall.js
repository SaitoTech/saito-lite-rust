const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const CallLauncher = require('./lib/components/call-launch');
const CallInterfaceVideo = require('./lib/components/call-interface-video');
const CallInterfaceFloat = require('./lib/components/call-interface-float');
const DialingInterface = require('./lib/components/dialer');
const SaitoOverlay = require('../../lib/saito/ui/saito-overlay/saito-overlay');
const StreamManager = require('./lib/StreamManager');
const AppSettings = require('./lib/stun-settings');
const HomePage = require('./index');
const SaitoHeader = require('./../../lib/saito/ui/saito-header/saito-header');
const SaitoScheduleWizard = require('../../lib/saito/ui/saito-calendar/saito-schedule-wizard');

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

		this.styles = ['/videocall/style.css'];

		this.stun = null; //The stun API
		this.streams = null;
		this.dialer = new DialingInterface(app, this);

		this.layout = 'focus';

		this.social = {
			twitter: '@SaitoOfficial',
			title: '🟥 Saito Talk',
			url: 'https://saito.io/videocall/',
			description: 'Peer to peer voice and video calling with no middleman',
			image: '/videocall/img/video-call-og.png'
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
				this.streams.parseSettings(settings);
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

			this.saveCallToKeychain();
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


		app.connection.on('stun-connection-close', (peerId)=> {
			if (this?.streams?.active) {
				this.disconnect(peerId, " has no connection");	
			}
			
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
					settings: { privacy: 'all' }
				};
			}

			if (this.app.options.stun.settings?.layout) {
				this.layout = this.app.options.stun.settings?.layout;
			}

			if (app.browser.returnURLParameter('stun_video_chat')) {
				this.room_obj = JSON.parse(
					app.crypto.base64ToString(app.browser.returnURLParameter('stun_video_chat'))
				);

				// JOIN THE ROOM
				if (!this.browser_active) {
					this.renderInto('.saito-overlay');
				}
			}

			try {
				this.stun = app.modules.returnFirstRespondTo('peer-manager');
			} catch (err) {
				console.warn('Videocall unavailable without Stun module installed!');
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

	async render() {
		if (this.browser_active) {
			this.header = new SaitoHeader(this.app, this);
			await this.header.initialize(this.app);
			this.addComponent(this.header);
			this.addComponent(new CallLauncher(this.app, this, 'body'));
			await super.render();
		}
	}

	// renderInto(qs) {
	// 	if (qs == '.saito-overlay' || qs == 'body') {
	// 		if (!this.renderIntos[qs]) {
	// 			this.renderIntos[qs] = [];
	// 			this.renderIntos[qs].push(new CallLauncher(this.app, this, qs));
	// 		}
	// 		this.attachStyleSheets();
	// 		this.renderIntos[qs].forEach((comp) => {
	// 			comp.render();
	// 		});
	// 	}
	// }

	async renderInto(qs) {
		if (qs == '.saito-overlay') {
			if (!this.renderIntos[qs]) {
				this.renderIntos[qs] = [];
				this.renderIntos[qs].push(new CallLauncher(this.app, this, qs));
			}
			this.attachStyleSheets();
			this.renderIntos[qs].forEach((comp) => {
				comp.render();
			});
		}
	}

	respondTo(type, obj) {
		let call_self = this;

		let app = this.app;
		if (type === 'user-menu') {
			//Don't provide a calling hook if in the video call app!
			// if (call_self.browser_active) {
			// 	return null;
			// }
			if (obj?.publicKey !== this.publicKey && this.streams?.active === true) {
				return [
					{
						text: 'Kick User From Call',
						icon: 'fa-solid fa-user-slash',
						callback: async (app, public_key) => {
							console.log('kicking user: ', public_key);
							app.connection.emit('remove-peer-box', public_key);
							await this.sendKickTransaction(public_key);
							this.streams.removePeer(public_key, 'was kicked out');
						}
					}
				];
			} else {
				if (obj?.publicKey !== this.publicKey) {
					this.attachStyleSheets();
					return [
						{
							text: 'Video/Audio Call',
							icon: 'fas fa-video',
							callback: function (app, public_key) {
								if (call_self?.room_obj) {
									salert('Already in or establishing a call');
									console.log(call_self.room_obj);
								} else {
									call_self.dialer.establishStunCallWithPeers([public_key]);
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

		if (type === 'saito-scheduler') {
			this.attachStyleSheets();

			return [
				{
					text: 'Schedule a call',
					icon: this.icon,
					callback: function (app, day, month, year) {
						let schedule_wizard = new SaitoScheduleWizard(app, call_self);

						schedule_wizard.defaultDate = { day, month, year };

						schedule_wizard.callbackAfterSubmit = async function (
							utcStartTime,
							duration,
							description = '',
							title = ''
						) {
							//Creates public key for clal
							const call_id = await call_self.generateRoomId();

							const room_obj = {
								call_id,
								scheduled: true,
								call_peers: [],
								startTime: utcStartTime,
								duration,
								description
							};

							let call_link = call_self.generateCallLink(room_obj);

							app.keychain.addKey(call_id, {
								identifier: title || 'Video Call',
								startTime: utcStartTime,
								duration,
								profile: {description},
								link: call_link
							});
							app.connection.emit('calendar-refresh-request');

							let event_link = app.browser.createEventInviteLink(app.keychain.returnKey(call_id));

							await navigator.clipboard.writeText(event_link);
							siteMessage('Invitation link copied to clipboard', 3500);
						};
						schedule_wizard.render();
					}
				}
			];
		}
		//
		//Game-Menu passes the game_mod as the obj, so we can test if we even want to add the option
		//
		if (type == 'game-menu') {
			this.attachStyleSheets();

			//Set listeners for stun events
			this.app.connection.on('show-call-interface', () => {
				document.getElementById('start-group-video-chat').classList.add('disable-menu');
			});
			this.app.connection.on('reset-stun', () => {
				document.getElementById('start-group-video-chat').classList.remove('disable-menu');
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
									call_self.dialer.establishStunCallWithPeers([...game_mod.game.players]);
								}
							}
						}
					]
				};

				return menu_items;
			}
		}

		if (type === 'saito-link') {
			const urlParams = new URL(obj?.link).searchParams;
			const entries = urlParams.entries();
			for (const pair of entries) {
				if (pair[0] == 'stun_video_chat') {
					return { processLink: (link) => { 
						this.room_obj = JSON.parse(this.app.crypto.base64ToString(pair[1]));
						this.renderInto('.saito-overlay');
					}}
				}
			}
		}

		if (type === 'chat-actions') {
			if (obj?.publicKey) {
				if (obj.publicKey !== this.publicKey) {
					this.attachStyleSheets();
					return [
						{
							text: 'Video/Audio Call',
							icon: 'fas fa-phone',
							callback: function (app, id) {
								if (call_self?.room_obj) {
									salert('Already in or establishing a call');
									console.log(call_self.room_obj);
								} else {
									call_self.dialer.establishStunCallWithPeers([obj.publicKey]);
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
					event: function (id) {
						call_self.app.connection.on('toggle-screen-share-label', (state = false) => {
							let container = document.getElementById(id);
							if (container) {
								if (state) {
									container.classList.add('recording');
									container.querySelector('label').innerText = 'Stop';
									container.querySelector('i')?.classList.add('recording');
								} else {
									container.classList.remove('recording');
									container.querySelector('label').innerText = 'Present';
									container.querySelector('i')?.classList.remove('recording');
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
				}
			];
		}

		if (type === 'media-request') {
			if (this?.streams?.active) {
				return {
					localStream: this.streams.localStream,
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
					let from = tx.from[0].publicKey;

					if (this.hasSeenTransaction(tx)) return;

					console.log('New TX OnConfirmation: ', message);

					if (!tx.isFrom(this.publicKey)) {
						//Someone joined call room
						if (message.request === 'call-list-request') {
							this.receiveCallListRequestTransaction(this.app, tx);
						}
						//Someone in the room responds
						if (message.request === 'call-list-response') {
							this.receiveCallListResponseTransaction(this.app, tx);
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
					console.log('Stun-connection', txmsg.data);
					this.dialer.receiveStunCallMessageFromPeers(tx);
					return;
				}

				if (this.hasSeenTransaction(tx)) return;

				if (txmsg.module == 'Videocall' || txmsg.module == 'Stun') {

					// Allow processing from outside of room
					//
					if (txmsg.request === 'call-list-request') {
						this.receiveCallListRequestTransaction(this.app, tx);
						return;
					}

					// Only respond if this is a pertinent call
					if (!this?.room_obj?.call_id || this.room_obj.call_id !== txmsg.call_id) {
						return;
					}

					console.log('HPT: ' + txmsg.request);

					if (txmsg.request === 'call-list-response') {
						this.receiveCallListResponseTransaction(this.app, tx);
						return;
					}

					if (txmsg.request === 'peer-joined') {
						let from = tx.from[0].publicKey;
						this.app.connection.emit('remove-waiting-video-box');
						this.app.connection.emit('add-remote-stream-request', from, null);

						if (!this.room_obj.call_peers.includes(from)) {
							this.room_obj.call_peers.push(from);
							this.app.connection.emit('stun-update-link');
						}

						//Limbo Hook
						this.app.connection.emit('videocall-add-party', from);
						console.log('STUN: VIDEOCALL PEER JOINED');
						this.stun.createPeerConnection(from, false);

						return;
					}

					if (txmsg.request === 'peer-left') {
						if (!tx.isFrom(this.publicKey)){
							this.disconnect(tx.from[0].publicKey);	
						}
					}

					if (txmsg.request === 'peer-kicked') {
						console.log("kicked out of video call...");
						this.app.connection.emit('stun-disconnect');
						siteMessage(`${this.app.keychain.returnUsername(tx.from[0].publicKey)} kicked you out of the call`);
					}

					if (txmsg.request === 'peer-kick-broadcast') {
						this.disconnect(txmsg.kicked_peer, "was kicked out of the call");
					}

					if (txmsg.request === 'toggle-audio' || txmsg.request == 'toggle-video') {
						this.app.connection.emit(`peer-${txmsg.request}-status`, txmsg.data);
					}

					if (txmsg.request === 'screen-share-start') {
						if (this.screen_share !== tx.from[0].publicKey){
							this.screen_share = tx.from[0].publicKey;
							this.app.connection.emit('add-remote-stream-request', 'presentation', null);
						}
					}

					if (txmsg.request === 'screen-share-stop') {
						this.app.connection.emit('remove-peer-box', 'presentation');
						this.app.connection.emit(
							'stun-switch-view',
							this.app.options.stun.settings?.layout || this.layout
						);

						this.streams.remoteStreams.delete("presentation");
						this.screen_share = null;
					}

					// Peer sharing connection state with people in the call...
					if (txmsg.request === 'broadcast-call-list') {
						this.receiveBroadcastListTransaction(this.app, tx);
					}
				}
			}
		}

		return super.handlePeerTransaction(app, tx, peer, mycallback);
	}

	disconnect(peer, msg = "left the meeting") {
		for (let i = 0; i < this.room_obj.call_peers.length; i++) {
			if (this.room_obj.call_peers[i] == peer) {
				this.room_obj.call_peers.splice(i, 1);
				this.app.connection.emit('stun-update-link');
				break;
			}
		}

		this.app.connection.emit('remove-peer-box', peer);

		//Limbo Hook
		this.app.connection.emit('videocall-remove-party', peer);
		//See if we need to also hang up on our end
		this.streams.removePeer(peer, msg);
	}

	// A convenience function to send metadata through the stun channel (if established) or over relay otherwise
	// but
	async sendOffChainMessage(request, data) {
		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();

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

	async sendCallEntryTransaction() {
		if (!this.room_obj) {
			console.error('No room object');
			return;
		}

		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.room_obj.call_id);

		if (this.room_obj?.host_public_key) {
			newtx.addTo(this.room_obj.host_public_key);
		}

		// Fallback for saved calls when blocks aren't forming correctly
		let event = this.app.keychain.returnKey(this.room_obj.call_id, true);
		if (event?.profile?.participants){
			for (let participant of event.profile.participants){
				newtx.addTo(participant);
			}
		}

		newtx.msg.module = 'Videocall';
		newtx.msg.request = 'call-list-request';
		newtx.msg.call_id = this.room_obj.call_id;

		await newtx.sign();

		console.log("Sending call entry: ", newtx.msg);

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
		this.addCallParticipant(this.room_obj.call_id, this.publicKey);
	}

	async receiveCallListRequestTransaction(app, tx) {
		let txmsg = tx.returnMessage();

		let from = tx.from[0].publicKey;

		//Update calendar event
		this.addCallParticipant(txmsg.call_id, from);

		//Check if we have a broken stun connection
		if (!this.stun.hasConnection(from)) {
			console.log("Videocall: reset stun peer connection for new join");
			this.stun.removePeerConnection(from);
		}

		//We are getting a tx for the call we are in
		if (this?.room_obj?.call_id === txmsg.call_id) {

			let call_list = [];

			if (this.room_obj.call_peers) {
				this.room_obj.call_peers.forEach((key) => {
					if (!call_list.includes(key)) {
						call_list.push(key);
					}
				});
			}

			if (!call_list.includes(this.publicKey)) {
				call_list.push(this.publicKey);
			}


			if (!tx.isFrom(this.publicKey)){
				console.log('STUN: peer list request from ', from, call_list);
				await this.sendCallListResponseTransaction(from, call_list);
			}

			return;
		}

		// Process if we saved event but are not in the call!
		let event = this.app.keychain.returnKey(txmsg.call_id, true);
		
		if (event){
			console.log("EVENT!!!", event);
			// I am in a different call
			if (this.room_obj?.call_id){
				siteMessage(`${this.app.keychain.returnUsername(from)} joined ${event.identifier}`);
				console.log(event);
			}else{
				let c = await sconfirm(`${this.app.keychain.returnUsername(from)} ready for ${event.identifier}, join now?`);
				if (c) {
					if (event?.link){
						navigateWindow(event.link);	
					}else{
						salert("No saved link");
					}
				}
			}

		}

	}

	async sendCallListResponseTransaction(public_key, call_list) {
		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(public_key);

		newtx.msg = {
			module: 'Videocall',
			request: 'call-list-response',
			call_list,
			call_id: this.room_obj.call_id
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);

	}

	receiveCallListResponseTransaction(app, tx) {
		let txmsg = tx.returnMessage();

		let call_list = txmsg.call_list;
		// remove my own key
		call_list = call_list.filter((key) => this.publicKey !== key);

		//
		// Create a connection with everyone
		//
		console.log('STUN: My peer list: ', this.room_obj.call_peers, 'Received list: ', call_list);

		for (let peer of call_list) {
			this.addCallParticipant(txmsg.call_id, peer);
			if (peer !== this.publicKey) {
				if (!this.room_obj?.call_peers.includes(peer)) {
					this.room_obj?.call_peers.push(peer);
				}

				console.log('STUN (VIDEOCALL): peer list member, create connection with ', peer);
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
		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(publicKey);

		newtx.msg = {
			module: 'Videocall',
			request: 'peer-joined',
			call_id: this.room_obj.call_id
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);

		this.app.connection.emit('add-remote-stream-request', publicKey, null);
	}

	async sendCallDisconnectTransaction() {
		if (!this?.room_obj) {
			console.log('No room object!');
			return;
		}

		console.log('STUN: Send disconnect message (hang up):', this.room_obj);

		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();

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
	async sendKickTransaction(peer) {
		if (!this?.room_obj) {
			console.log('No room object!');
			return;
		}

		console.log('STUN: Send kick message:', this.room_obj);

		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(peer);

		newtx.msg = {
			module: 'Stun',
			request: 'peer-kicked',
			call_id: this.room_obj.call_id
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);

		//
		// Allow us to use stun connection to send tx before disconnecting!
		//
		this.stun.removePeerConnection(peer);
		this.sendKickBroadcastMessageTransaction(peer);
	}

	async sendKickBroadcastMessageTransaction(peer_id) {
		if (!this?.room_obj) {
			console.log('No room object!');
			return;
		}

		console.log('Videocall: Send kick broadcast message:', this.room_obj);

		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();

		for (let peer of this.room_obj.call_peers) {
			if (peer != this.publicKey && peer !== peer_id) {
				newtx.addTo(peer);
			}
		}

		newtx.msg = {
			module: 'Stun',
			request: 'peer-kick-broadcast',
			data: {
				kicked_peer: peer_id
			},
			call_id: this.room_obj.call_id
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
	}

	async receiveBroadcastListTransaction(app, tx) {
		const txmsg = tx.returnMessage();
		let sender = tx.from[0].publicKey;

		// Need code here to process keys that aren't otherwise in our call list
		// retrigger stun connections

		let call_list = [];

		for (let peer in txmsg.data) {
			if (txmsg.data[peer] == 'connected') {
				if (peer !== this.publicKey) {
					if (!this.room_obj.call_peers.includes(peer)) {
						this.room_obj.call_peers.push(peer);

						console.log(
							'STUN (VIDEOCALL): post hoc peer list member, attempt connection with ',
							peer
						);
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

	addCallParticipant(call_id, publicKey){
		let event = this.app.keychain.returnKey(call_id, true);
		// We will add this key as a call participant...
		if (event){
			if (!event?.profile){
				event.profile = {};
			}
			if (!event.profile?.participants){
				event.profile.participants = [];
			}

			if (!event.profile.participants.includes(publicKey)){
				event.profile.participants.push(publicKey);	
				this.app.keychain.saveKeys();
			}
		}
	}

	saveCallToKeychain(){

		console.log("Saving call as event in keychain");
		let call_link = this.generateCallLink();
		let name = "Video Call";

		if (this.room_obj?.ui){
			name = "Private Call";
		}

		if (this.room_obj?.host_public_key){
			name += " " + this.app.keychain.returnUsername(this.room_obj.host_public_key);
		}
		if (!this.app.keychain.returnKey(this.room_obj.call_id), true){
			this.app.keychain.addKey(this.room_obj.call_id, {
				identifier: name,
				type: "event",
				mod: 'videocall',
				startTime: Date.now(),
				link: call_link,
			});
		}

		this.app.keychain.addWatchedPublicKey(this.room_obj.call_id);
	}

	createRoom(identifier = "my video call"){
		let call_id = this.generateRoomId();
		this.room_obj = {
			call_id,
			host_public_key: this.publicKey,
			call_peers: [],
		};

        let link =  this.generateCallLink(this.room_obj);
		this.app.keychain.addKey(call_id, {
			identifier,
			link,
		});

		return link;
	}

	generateRoomId() {
		let pk = this.app.crypto.generateKeys();
		let id = this.app.crypto.generatePublicKey(pk);
		this.app.keychain.addKey(id, {
			identifier: id,
			privateKey: pk,
			type: 'event',
			mod: 'videocall',
			startTime: Date.now(),
			watched: true,
		});
		return id;
	}

	generateCallLink(room_obj = this.room_obj) {
		let base64obj = this.app.crypto.stringToBase64(JSON.stringify(room_obj));

		let call_link = window.location.origin + '/videocall/';
		call_link = `${call_link}?stun_video_chat=${base64obj}`;

		return call_link;
	}

	copyInviteLink() {
		navigator.clipboard.writeText(this.generateCallLink());
		siteMessage('Invite link copied to clipboard', 1500);
	}


	webServer(app, expressapp, express) {
		let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
		let mod_self = this;

		expressapp.get('/' + encodeURI(this.returnSlug()), async function (req, res) {
			let reqBaseURL = req.protocol + '://' + req.headers.host + '/';

			mod_self.social.url = reqBaseURL + encodeURI(mod_self.returnSlug());

			if (!res.finished) {
				res.setHeader('Content-type', 'text/html');
				res.charset = 'UTF-8';
				return res.send(HomePage(app, mod_self, app.build_number, mod_self.social));
			}
			return;
		});

		expressapp.use('/' + encodeURI(this.returnSlug()), express.static(webdir));
	}
}

module.exports = Videocall;
