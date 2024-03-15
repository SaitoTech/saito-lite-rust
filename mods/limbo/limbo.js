const Transaction = require('../../lib/saito/transaction').default;
const PeerService = require('saito-js/lib/peer_service').default;
const ModTemplate = require('../../lib/templates/modtemplate');
const DreamControls = require("./lib/dream-controls");
const DreamSpace = require("./lib/dream-space");
const LimboMain = require('./lib/main');
const SaitoHeader = require('./../../lib/saito/ui/saito-header/saito-header');

class Limbo extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.name = 'Limbo';
		this.chunks = [];
		this.localStream = null; // My Video or Audio Feed
		this.combinedStream = null;

		this.description =
			'Saito Dream Space: emit audio/video stream to arbitrary number of followers';
		this.categories = 'Utilities Communications';

		this.styles = ['/videocall/style.css', '/limbo/style.css'];
		this.icon_fa = 'fa-solid fa-satellite';

		this.stun = null;
		this.rendered = false;

		/*
		Indexed by public key of dreamer
		contains
		ts: (int) start time
		shared: (array) people in the dream including dreamer
		description: (string) 
		*/
		this.dreams = {};

		//Browsers
		this.dreamer = null;
		this.upstream = new Map();
		this.downstream = new Map();
		//

		app.connection.on("limbo-toggle-video", ()=> {
			if (this.combinedStream){
				this.combinedStream.getVideoTracks().forEach(track => {
					track.enabled = !track.enabled;
				});
			}
		});

		app.connection.on("limbo-toggle-audio", ()=> {
			if (this.localStream){
				this.localStream.getAudioTracks().forEach(track => {
					track.enabled = !track.enabled;
				})
			}
		});



		app.connection.on("stun-track-event", (peerId, event) => {
			if (!this.dreamer || !this.upstream.has(peerId) || this.dreamer === this.publicKey) { 
				return; 
			}

			console.log('STUN: another remote stream added', event.track);

			if (event.streams.length === 0) {
				this.combinedStream.addTrack(event.track);
			} else {
				event.streams[0].getTracks().forEach((track) => {
					this.combinedStream.addTrack(track);
				});
			}

			//Forward to peers if peers already established!
			this.downstream.forEach((key, pc)=> {
				if (event.streams.length === 0) {
					pc.addTrack(event.track);
				} else {
					event.streams[0].getTracks().forEach((track) => {
						pc.addTrack(track);
					});
				}

			});

			this.space.render(this.combinedStream);
		});

		app.connection.on("stun-new-peer-connection", async (publicKey, peerConnection) => {
			if (!this.dreamer) { 
				return; 
			}

			console.log("New Stun peer connection");

			if (this.downstream.has(publicKey)){
				console.log("Forwardd audio/video!");
				this.combinedStream.getTracks().forEach((track) => {
					peerConnection.addTrack(track, this.combinedStream);
				})
				//Save peerConnection in downstream
				this.downstream.set(publicKey, peerConnection);
			}

			if (this.upstream.has(publicKey)){
				this.upstream.set(publicKey, peerConnection);
			}
		});


	}

	async initialize(app) {
		await super.initialize(app);

		if (app.BROWSER) {
			try {
				this.stun = app.modules.returnFirstRespondTo('peer-manager');
			} catch (err) {
				console.warn('No Stun available');
			}
		}
	}

	returnServices() {
		let services = [];

		if (this.app.BROWSER == 0) {
			services.push(new PeerService(null, 'inception', ''));
		}
		return services;
	}

	respondTo(type, obj) {
		let mod_self = this;

		if (type === 'call-actions') {
			if (obj?.members) {
				/*return [
					{
						text: 'Record',
						icon: 'fa-solid fa-record-vinyl',
						callback: function (app, public_key, id = '') {
							console.log("Click on record");
							if (mod_self.mediaRecorder){
								mod_self.stop();
							}else{
								mod_self.record(app.options.stun.peers);
							}
						}
					}
				];*/

				return null;
			}
		}

		//
		//Game-Menu passes the game_mod as the obj, so we can test if we even want to add the option
		//
		if (type == 'game-menu') {
			/*return {
				id: 'game-game',
				text: 'Game',
				submenus: [
					{
						parent: 'game-game',
						text: 'Record Game',
						id: 'record-stream',
						class: 'record-stream',
						callback: function (app, game_mod) {
							game_mod.menu.hideSubMenus();
							if (mod_self?.mediaRecorder) {
								mod_self.stop();
								document.getElementById(
									'record-stream'
								).textContent = 'Start Recording';
							} else {
								mod_self.record(game_mod.game.players);
								document.getElementById(
									'record-stream'
								).textContent = 'Stop Recording';
							}
						}
					}
				]
			};*/
			return null;
		}

		return super.respondTo(type, obj);
	}

	async render() {
		if (!this.app.BROWSER){
			return;
		}

		if (this.app.options.theme) {
			let theme = this.app.options.theme[this.slug];

			if (theme != null) {
				this.app.browser.switchTheme(theme);
			}
		}

		if (this.main == null) {
			this.main = new LimboMain(this.app, this);
			this.header = new SaitoHeader(this.app, this);
			await this.header.initialize(this.app);
			this.addComponent(this.header);
			this.addComponent(this.main);

			this.controls = new DreamControls(this.app, this, "#limbo-main");
			this.space = new DreamSpace(this.app, this, "#limbo-main");
		}

		for (const mod of this.app.modules.returnModulesRespondingTo(
			'chat-manager'
		)) {
			let cm = mod.respondTo('chat-manager');
			cm.container = '.saito-sidebar.left';
			cm.render_manager_to_screen = 1;
			this.addComponent(cm);
		}

		console.log('rendering', this.main, this.header);

		await super.render();

		if (this.app.browser.returnURLParameter('dream')) {
			let dreamer = this.app.crypto.base64ToString(this.app.browser.returnURLParameter('dream'));
			this.joinDream(dreamer);
		}

		this.rendered = true;
	}

	async onPeerServiceUp(app, peer, service = {}) {
		//
		// For now, we will only check if moving into the space
		// maybe in the future, will announce if followed keys are hosting
		//
		if (!app.BROWSER || !this.browser_active) {
			return;
		}

		if (service.service === 'inception') {
			console.log('Limbo: onPeerServiceUp', service.service);

			this.app.network.sendRequestAsTransaction(
				'dream list',
				{},
				(oldMap) => {
					console.log('********************');
					console.log(oldMap);
					console.log('********************');
					if (oldMap) {
						this.dreams = {};
						Object.keys(oldMap).forEach((key) => {
							this.dreams[key] = oldMap[key];
						});
					}

					this.app.connection.emit('limbo-populated', "service");
				}
			);
		}
	}

	async broadcastDream() {
		this.localStream = null;
		this.externalMediaControl = false;

		//
		// First check if any other modules are fetching media
		//
		const otherParties = this.app.modules.getRespondTos('media-request');
		if (otherParties.length > 0) {
			// We hope there is only 1!
			this.localStream = otherParties[0].localStream;
			this.additionalSources = otherParties[0].remoteStreams;
			this.externalMediaControl = true;
		} else {
			let includeCamera = await sconfirm('Add webcam to stream?');

			try {
				//
				// Get webcam video
				//
				if (includeCamera) {
					this.localStream =
						await navigator.mediaDevices.getUserMedia({
							video: true,
							audio: true // Capture microphone audio
						});

					/*
					this.videoBox = new VideoBox(this.app, this, 'local');
					this.videoBox.render(this.localStream);
					let videoElement = document.querySelector(
						'.video-box-container-large'
					);
					videoElement.style.position = 'absolute';
					videoElement.style.top = '100px';
					videoElement.style.width = '350px';
					videoElement.style.height = '350px';
					*/
				} else {
					//
					// Get microphone input only
					//
					this.localStream =
						await navigator.mediaDevices.getUserMedia({
							audio: true // Capture microphone audio
						});
				}
			} catch (error) {
				console.error('Access to user media denied: ', error);
				salert(
					'Recording will continue without camera and/or microphone input'
				);
			}
		}

		// Set up the media recorder with the canvas stream
		// Create a new stream for the combined video and audio
		this.combinedStream = new MediaStream();

		//
		// Attempt to stream of the screen -- user has to select it
		// this should include any displayed video and audio...
		//
		let screenStream = await sconfirm('Share screen?');

		if (screenStream) {
			try {
				//const videoElemScreen = document.createElement('video');

				screenStream = await navigator.mediaDevices.getDisplayMedia({
					video: true,
					audio: false,
					selfBrowserSurface: 'exclude',
					monitorTypeSurfaces: 'include'
				});

				/*videoElemScreen.srcObject = screenStream;
				videoElemScreen.muted = true;
				videoElemScreen.play();
				await new Promise(
					(resolve) => (videoElemScreen.onloadedmetadata = resolve)
				);*/
			} catch (error) {
				console.error('Access to screen denied: ', error);
			}

			// Add the audio tracks from the screen and camera to the combined stream
			screenStream.getTracks().forEach((track) => {
				this.combinedStream.addTrack(track);
				track.onended = () => {
					this.stop();
				};
			});
		}

		if (this.localStream) {
			if (this.localStream.getAudioTracks().length > 0) {
				this.combinedStream.addTrack(this.localStream.getAudioTracks()[0]);
			}
			if (!screenStream && this.localStream.getVideoTracks().length > 0) {
				this.combinedStream.addTrack(this.localStream.getVideoTracks()[0]);
			}
		}

		this.controls.render(this.combinedStream);
		this.receiveDreamTransaction(this.publicKey);
		this.app.connection.emit("limbo-open-dream", this.publicKey);
		this.sendDreamTransaction();
	}


	joinDream(dreamer) {
		this.dreamer = dreamer;
		this.sendJoinTransaction();
		this.app.connection.emit("limbo-open-dream", dreamer);
		this.combinedStream = new MediaStream();
	}

	async sendDreamTransaction() {
		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee(
				this.publicKey
			);

		newtx.msg = {
			module: this.name,
			request: 'start dream'
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);

		console.log('sendDreamTransaction');
	}

	receiveDreamTransaction(sender, tx) {
		if (this.app.BROWSER) {
			if (this.publicKey == sender) {
				this.dreamer = this.publicKey;
				this.upstream = new Map();
				this.downstream = new Map();
				this.copyInviteLink();
			}
		}

		this.dreams[sender] = [sender];
	}

	async sendKickTransaction() {
		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee(
				this.publicKey
			);

		newtx.msg = {
			module: this.name,
			request: 'stop dream'
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
	}

	receiveKickTransaction(sender, tx) {

		if (this.dreams[sender]){
			delete this.dreams[sender];
		}

		//
		// Don't process if not our dreamer
		//
		if (this.dreamer !== sender){
			return;
		}

		this.exitSpace();
	}

	async sendJoinTransaction() {
		
		if (!this.dreamer){
			console.error("No dreamer to join");
		}

		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee(
				this.publicKey
			);

		newtx.msg = {
			module: this.name,
			request: 'join dream',
			dreamer: this.dreamer
		};

		newtx.addTo(this.dreamer);	

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
	}

	receiveJoinTransaction(sender, tx) {
		let txmsg = tx.returnMessage();

		let dreamer = txmsg.dreamer;

		if (!this.dreams[dreamer]) {
			return;
		}

		if (!this.dreams[dreamer].includes(sender)) {
			this.dreams[dreamer].push(sender);
		}

		if (this.app.BROWSER){
			if (this.publicKey !== sender && this.combinedStream && this.downstream.size < 10){
				this.sendOfferTransaction(sender);
				this.downstream.set(sender, null);
				setTimeout(()=> {
					//Rescind offer after 90 seconds if not taken up
					if (this.downstream.has(sender) && !this.downstream.get(sender)){
						this.downstream.delete(sender);
					}
				}, 90000);
			}	
		}
		
	}

	async sendLeaveTransaction() {

		if (!this.dreamer){
			console.error("No dreamer to leave!");			
		}

		if (this.dreamer === this.publicKey){
			await this.sendKickTransaction();
			return;
		}

		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee(
				this.publicKey
			);

		newtx.msg = {
			module: this.name,
			request: 'leave dream',
			dreamer: this.dreamer
		};

		newtx.addTo(this.dreamer);

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
	}

	receiveLeaveTransaction(sender, tx) {
		let txmsg = tx.returnMessage();

		let dreamer = txmsg.dreamer;

		console.log(`${sender} is leaving ${dreamer}'s dream`);

		if (!this.dreams[dreamer] || !this.dreams[dreamer].includes(sender)) {
			console.log("nothing to remove");
			return;
		}

		for (let i = 0; i < this.dreams[dreamer].length; i++) {
			if (this.dreams[dreamer][i] == sender) {
				this.dreams[dreamer].splice(i, 1);
				break;
			}
		}

		if (this.downstream.has(sender)){
			let pc = this.downstream.get(sender);
			if (pc){
				try{
					pc.close();	
				}catch(err){
					console.error(err);
				}
			}
			this.downstream.delete(sender);
		}

		if (this.upstream.has(sender)){
			this.upstream.delete(sender);
			this.sendJoinTransaction();
		}
	}


	async sendOfferTransaction(target){
		
		if (!this.dreamer){
			console.error("No dreamer to join");
		}

		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee(
				target
			);

		newtx.msg = {
			module: this.name,
			request: 'offer dream',
			dreamer: this.dreamer
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
	}


	receiveOfferTransaction(sender, tx){
		if (!this.app.BROWSER){
			return;
		}
		if (!this.dreamer || this.upstream.size > 0){
			return;
		}

		this.upstream.set(sender, 1);

		//Attempt to get connection
		this.stun.createPeerConnection(sender);

	}

	onConfirmation(blk, tx, conf) {
		if (tx == null) {
			return;
		}

		let message = tx.returnMessage();

		if (conf === 0) {
			if (message.module === 'Limbo') {
				if (this.hasSeenTransaction(tx)) return;

				console.log('ON CONFIRMATION: ', message);

				if (
					tx.isTo(this.publicKey) ||
					this.browser_active ||
					this.app.BROWSER == 0
				) {
					let sender = tx.from[0].publicKey;

					if (message.request === 'start dream') {
						this.receiveDreamTransaction(sender, tx);
					}
					if (message.request === 'stop dream') {
						this.receiveKickTransaction(sender, tx);
					}
					if (message.request === 'join dream') {
						this.receiveJoinTransaction(sender, tx);
					}
					if (message.request === 'leave dream') {
						this.receiveLeaveTransaction(sender, tx);
					}
					if (message.request === "offer dream"){
						this.receiveOfferTransaction(sender, tx);
						//Important, we don't need server rebroadcasting this or standard UI updates
						return;
					}

					this.app.connection.emit('limbo-populated', "tx");
					if (message?.dreamer === this.dreamer){
						this.app.connection.emit("limbo-open-dream", this.dreamer);
					}


					//
					// only servers notify lite-clients
					//
					if (this.app.BROWSER == 0 && this.app.SPVMODE == 0) {
						console.log(' ******** notifyPeers');
						this.notifyPeers(tx);
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

		if (txmsg.request === 'dream list') {
			if (mycallback) {
				mycallback(this.dreams);
				return 1;
			}

			return 0;
		}

		if (txmsg.request == 'limbo spv update') {
			tx = new Transaction(undefined, txmsg.data);
			txmsg = tx.returnMessage();
		}

		if (this.hasSeenTransaction(tx) || txmsg.module !== this.name) {
			return;
		}

		if (
			tx.isTo(this.publicKey) ||
			this.browser_active ||
			this.app.BROWSER == 0
		) {
			let sender = tx.from[0].publicKey;

			if (txmsg.request === 'start dream') {
				this.receiveDreamTransaction(sender);
			}
			if (txmsg.request === 'stop dream') {
				this.receiveKickTransaction(sender);
			}
			if (txmsg.request === 'join dream') {
				this.receiveJoinTransaction(sender, tx);
			}
			if (txmsg.request === 'leave dream') {
				this.receiveLeaveTransaction(sender, tx);
			}
			if (txmsg.request === "offer dream"){
				this.receiveOfferTransaction(sender, tx);
				//Important, we don't need server rebroadcasting this or standard UI updates
				return;
			}

			this.app.connection.emit('limbo-populated', "tx");
			if (txmsg?.dreamer === this.dreamer){
				this.app.connection.emit("limbo-open-dream", this.dreamer);
			}
		}

		return super.handlePeerTransaction(app, tx, peer, mycallback);
	}

	async notifyPeers(tx) {
		if (this.app.BROWSER == 1) {
			return;
		}
		let peers = await this.app.network.getPeers();
		console.log(' ******* Limbo server forward tx');
		for (let peer of peers) {
			if (peer.synctype == 'lite') {
				this.app.network.sendRequestAsTransaction(
					'limbo spv update',
					tx.toJson(),
					null,
					peer.peerIndex
				);
			}
		}
	}

	stop() {
		console.log('Stop Dreaming!');

		if (!this.externalMediaControl) {
			if (this.localStream){
				this.localStream.getTracks().forEach((track) => track.stop());
				this.localStream = null;
			}
			if (this.combinedStream){
				this.combinedStream.getTracks().forEach((track) => track.stop());
				this.combinedStream = null;
			}
		}

		if (this.controls) {
			this.controls.remove();
		}
	}


	exitSpace() {
		this.dreamer = null;

		this.downstream.forEach((key, value) => {
			console.log(key, value);
			if (value){
				try{
					value.close();
				}catch(err){
					console.error(err);
				}
			}
		});

		// Need to notify and close these peer connections
		this.upstream.clear();
		this.downstream.clear();

		this.stop();

		this.app.connection.emit("limbo-open-dream");
	}

	createLink() {
		if (!this.dreamer) {
			return null;
		}

		let base64obj = this.app.crypto.stringToBase64(this.dreamer);

		let url1 = window.location.origin + '/limbo/';

		return `${url1}?dream=${base64obj}`;
	}

	copyInviteLink() {
		let link = this.createLink();
		try{
			if (link) {
				navigator.clipboard.writeText(link);
				siteMessage('Invite link copied to clipboard', 1500);
			}
		}catch(err){
			console.error(err);
		}
	}
}

module.exports = Limbo;
