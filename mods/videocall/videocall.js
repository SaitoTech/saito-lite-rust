const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const CallLauncher = require('./lib/components/call-launch');
const CallInterfaceVideo = require('./lib/components/call-interface-video');
const CallInterfaceFloat = require('./lib/components/call-interface-float');
const DialingInterface = require('./lib/components/dialer');

const StreamManager = require("./lib/StreamManager");
const AppSettings = require('./lib/stun-settings');

class Videocall extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.appname = 'Saito Talk';
		this.name = 'Videocall';
		this.slug = "videocall";

		this.description = 'P2P Video & Audio Connection Module';
		this.categories = 'Utilities Communications';
		this.icon = 'fas fa-video';
		this.request_no_interrupts = true; // Don't let chat popup inset into /videocall
		this.isRelayConnected = false;

		this.screen_share = false;

		this.styles = ['/saito/saito.css', '/videocall/style.css'];

		this.stun = null;  //The stun API
		this.streams = new StreamManager(app, this);
		this.dialer = new DialingInterface(app, this);

		//When CallLauncher is rendered or game-menu triggers it
		app.connection.on('stun-init-call-interface', (ui_type = 'large') => {
			if (this.CallInterface) {
				console.warn('Already instatiated a video/audio call manager');
				return;
			}

			console.log('STUN UI: ' + ui_type);

			if (ui_type === 'large') {
				this.CallInterface = new CallInterfaceVideo(app, this, true);
			} else if (ui_type === 'video') {
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
					peers: []
				};
			}

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
			} else {
				this.app.options.stun.peers = [];
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
		let stun_self = this;

		if (type === 'user-menu') {
			//Don't provide a calling hook if in the video call app!
			if (stun_self.browser_active) {
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
								if (!stun_self.room_obj) {
									stun_self.dialer.establishStunCallWithPeers(
										[public_key]
									);
								} else {
									salert('Already in or establishing a call');
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
							stun_self.renderInto('.saito-overlay');
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
				).style.display = 'none';
			});
			this.app.connection.on('reset-stun', () => {
				document.getElementById('start-group-video-chat').style = '';
			});

			let menu_items = {
				id: 'game-social',
				text: 'Chat',
				submenus: []
			};

			if (obj?.game?.players?.length > 1) {
				menu_items['submenus'].push({
					parent: 'game-social',
					text: 'Start Call',
					id: 'start-group-video-chat',
					class: 'start-group-video-chat',
					callback: function (app, game_mod) {
						//Start Call
						game_mod.menu.hideSubMenus();

						if (!stun_self.room_obj) {
							stun_self.dialer.establishStunCallWithPeers([
								...game_mod.game.players
							]);
						} else {
							salert('Already in or establishing a call');
						}
					}
				});
			}

			menu_items['submenus'].push({
				parent: 'game-game',
				text: 'Record Game',
				id: 'record-stream',
				class: 'record-stream',
				callback: function (app, game_mod) {
					game_mod.menu.hideSubMenus();
					if (!stun_self.streamManager) {
						stun_self.streamManager = new StreamManager(
							app,
							stun_self
						);
					}
					if (!stun_self?.recording) {
						stun_self.streamManager.recordGameStream();
						stun_self.recording = true;
						document.getElementById('record-stream').textContent =
							'Stop Recording';
					} else {
						stun_self.streamManager.stopRecordGameStream();
						stun_self.recording = false;
						document.getElementById('record-stream').textContent =
							'Start Recording';
					}
				}
			});

			return menu_items;
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
								if (!stun_self.room_obj) {
									stun_self.dialer.establishStunCallWithPeers(
										[public_key]
									);
								} else {
									salert('Already in or establishing a call');
								}
							}
						}
					];
				}
			}
		}

		return null;
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
					// if (document.hidden) {
					//   console.log("tab is not active");
					//   return;
					// }

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
			if (txmsg.module == 'Videocall' || txmsg.module == "Stun") {
				if (tx.isTo(this.publicKey) && !tx.isFrom(this.publicKey)) {
					//console.log(txmsg);

					if (this.hasSeenTransaction(tx)) return;

					if (
						!this?.room_obj?.call_id ||
						this.room_obj.call_id !== txmsg.call_id
					) {
						console.log('HPT: Tab is not active');
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

					if (txmsg.request === "peer-joined"){
						let from = tx.from[0].publicKey;

						if (!this.app.options.stun.peers.includes(from)){
							this.app.options.stun.peers.push(from);
							this.app.storage.saveOptions();
						}
						console.log("Peer-joined!");
						this.app.connection.emit('add-remote-stream-request', from, null);
						let pc = this.stun.peers.get(from);
						if (pc){
							this.streams.localStream.getTracks().forEach((track) => {
								pc.addTrack(track, this.streams.localStream);
							});
						}

						return;
					}

					if (txmsg.request === "peer-left"){
						let from = tx.from[0].publicKey;

						for (let i = 0; i < this.app.options.stun.peers.length; i++){
							if (this.app.options.stun.peers[i] == from){
								this.app.options.stun.peers.splice(i, 1);
								break;
							}					
						}
						this.app.storage.saveOptions();
					}

					if (txmsg.request === 'toggle-audio' || txmsg.request == 'toggle-video') {
						this.app.connection.emit(`peer-${txmsg.request}-status`, txmsg.data);		
					}
				}
			}
		}

		return super.handlePeerTransaction(app, tx, peer, mycallback);
	}


	// A convenience function to send metadata through the stun channel (if established) or over relay otherwise
	// but 
	async sendOffChainMessage(request, data){
		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();

		for (let peer of this.app.options.stun.peers){
			if (peer != this.publicKey){
				newtx.addTo(peer);
			}
		}

		newtx.msg = {
			module: "Videocall",
			request,
			data
		}

		await newtx.sign();

		this.app.connection.emit("relay-transaction", newtx);
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

	async receiveCallListRequestTransaction(app, tx) {
		let txmsg = tx.returnMessage();

		let from = tx.from[0].publicKey;
		let call_list = [];
		let peers = this.app.options?.stun?.peers;

		if (peers) {
			peers.forEach((key) => {
				if (!call_list.includes(key)) {
					call_list.push(key);
				}
			});
		}

		if (!call_list.includes(this.publicKey)) {
			call_list.push(this.publicKey);
		}

		console.log('STUN: call list', call_list);

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

	async receiveCallListResponseTransaction(app, tx) {
		let txmsg = tx.returnMessage();

		let call_list = txmsg.call_list;
		// remove my own key
		call_list = call_list.filter((key) => this.publicKey !== key);

		//
		// Create a connection with everyone
		//

		for (let peer of call_list){
			if (peer !== this.publicKey){
				this.stun.createPeerConnection(peer, (peerId)=> {
					this.sendCallJoinTransaction(peerId);
				});

				let pc = this.stun.peers.get(peer);
				this.streams.localStream.getTracks().forEach((track) => {
					pc.addTrack(track, this.streams.localStream);
				});
			}
		}
	}

	//
	// This "overwrites" the sendJoinTransaction in Stun so that if we are in a video call
	// but create a stun connection to data share with someone not in the call we don't rope
	// them automatically into the call. The key difference is that we include the call_id
	// which we use to filter video call transactions
	//
	async sendCallJoinTransaction(publicKey){
		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee(
				publicKey
			);

		newtx.msg = {
			module: 'Stun',
			request: 'peer-joined',
			call_id: this.room_obj.call_id
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);

		this.app.network.propagateTransaction(newtx);

		this.app.connection.emit('add-remote-stream-request', publicKey, null);

	}

	async sendCallDisconnectTransaction(){

		if (!this?.room_obj){
			return;
		}

		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();

		for (let peer of this.app.options.stun.peers){
			if (peer != this.publicKey){
				newtx.addTo(peer);
			}
		}

		newtx.msg = {
			module: "Stun",
			request: "peer-left",
			call_id: this.room_obj.call_id
		}

		await newtx.sign();

		this.app.connection.emit("relay-transaction", newtx);
		this.app.network.propagateTransaction(newtx);

	}



}



module.exports = Videocall;
