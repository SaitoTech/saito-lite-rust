const Transaction = require('../../lib/saito/transaction').default;
const PeerService = require('saito-js/lib/peer_service').default;
const ModTemplate = require('../../lib/templates/modtemplate');
const VideoBox = require('./../../lib/saito/ui/saito-videobox/video-box');
const LimboMain = require('./lib/main');
const SaitoHeader = require('./../../lib/saito/ui/saito-header/saito-header');


class Limbo extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.name = "Limbo";
		this.chunks = [];
		this.localStream = null; // My Video or Audio Feed
	    this.description = "Saito Dream Space: emit audio/video stream to arbitrary number of followers";
	    this.categories = "Utilities Communications";

		this.styles = ['/limbo/style.css'];
		this.icon_fa = 'fa-solid fa-satellite';

	    //Server
	    this.dreams = {};

	    //Browsers
	    this.dreamer = null; 
	    this.upstream = null;
	    this.downstream = [];
	    //

	}


	returnServices() {
		let services = [];

		if (this.app.BROWSER == 0) {
			services.push(new PeerService(null, 'inception', ""));
		}
		return services;
	}


	respondTo(type, obj) {
		let mod_self = this;

		if (type === 'call-actions') {
			if (obj?.members){
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
		if (this.app.BROWSER == 1) {
			if (this.app.options.theme) {
				let theme = this.app.options.theme[this.slug];

				if (theme != null) {
					this.app.browser.switchTheme(theme);
				}
			}
		}

		if (this.main == null) {
			this.main = new LimboMain(this.app, this);
			this.header = new SaitoHeader(this.app, this);
			await this.header.initialize(this.app);
			this.addComponent(this.header);
			this.addComponent(this.main);
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
					console.log("********************");
					console.log(oldMap);
					console.log("********************");
					if (oldMap){
						this.dreams = {};
						Object.keys(oldMap).forEach(key => {
							this.dreams[key] = oldMap[key];
						});
					}

					this.app.connection.emit("limbo-populated");
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

					this.videoBox = new VideoBox(this.app, this, 'local');
					this.videoBox.render(this.localStream);
					let videoElement = document.querySelector(
						'.video-box-container-large'
					);
					videoElement.style.position = 'absolute';
					videoElement.style.top = '100px';
					videoElement.style.width = '350px';
					videoElement.style.height = '350px';
					this.app.browser.makeDraggable('stream_local');

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
		const combinedStream = new MediaStream();


		//
		// Attempt to stream of the screen -- user has to select it
		// this should include any displayed video and audio...
		//
		let screenStream = await sconfirm('Share screen?');

		if (screenStream){
			try {
				//const videoElemScreen = document.createElement('video');

				screenStream = await navigator.mediaDevices.getDisplayMedia({
					video: {
						displaySurface: 'browser'
					},
					audio: true,
					preferCurrentTab: true,
					selfBrowserSurface: 'include',
					monitorTypeSurfaces: 'exclude'
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
			screenStream
				.getTracks()
				.forEach((track) => {
					combinedStream.addTrack(track);
					track.onended = () => {
						this.stop();
					}
				});
		}

		if (this.localStream){
			if (this.localStream.getAudioTracks().length > 0) {
				combinedStream.addTrack(this.localStream.getAudioTracks()[0]);
			}
			if (!screenStream && this.localStream.getVideoTracks().length > 0){
				combinedStream.addTrack(this.localStream.getVideoTracks()[0]);	
			}
		} 

		this.sendDreamTransaction();
	}

	async stop() {
		console.log('Stop Dreaming!');
	
		if (this.localStream && !this.externalMediaControl) {
			this.localStream.getTracks().forEach((track) => track.stop());
			this.localStream = null;
		}

		if (this.videoBox) {
			this.videoBox.remove();
			this.videoBox = null;
		}
	}

	joinDream(dreamer){
		this.dreamer = dreamer;
		this.sendJoinTransaction();
	}


	async sendDreamTransaction(){
		let newtx =	await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

		newtx.msg = {
			module: this.name,
			request: 'start dream',
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);

		console.log("sendDreamTransaction");
	}


	receiveDreamTransaction(sender){
		if (this.app.BROWSER){
			if (this.publicKey == sender){
				this.dreamer = this.publicKey;
				this.upstream = null;
				this.downstream = [];
				this.copyInviteLink();
			}
		}
		
		this.dreams[sender] = [sender];
		
	}

	async sendKickTransaction(){
		let newtx =	await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

		newtx.msg = {
			module: this.name,
			request: 'stop dream',
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
	}


	receiveKickTransaction(){

	}

	async sendJoinTransaction(){
		let newtx =	await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

		newtx.msg = {
			module: this.name,
			request: 'join dream',
			dreamer: this.dreamer,
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);

	}

	receiveJoinTransaction(sender, tx){
		let txmsg = tx.returnMessage();

		let dreamer = txmsg.dreamer;

		if (!this.dreams[dreamer]){
			return;
		}

		if (!this.dreams[dreamer].includes(sender)){
			this.dreams[dreamer].push(sender);
		}
	}

	async sendLeaveTransaction(){
		let newtx =	await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

		newtx.msg = {
			module: this.name,
			request: 'leave dream',
			dreamer: this.dreamer,
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);

	}

	receiveLeaveTransaction(sender, tx){
		let txmsg = tx.returnMessage();

		let dreamer = txmsg.dreamer;

		if (!this.dreams[dreamer] || !this.dreams[dreamer].includes(sender)){
			return;
		}

		for (let i = 0; i < this.dreams[dreamer].length; i++){
			if (this.dreams[dreamer][i] == sender){
				this.dreams[dreamer].splice(i, 1);
				break;
			}
		}
	}

	onConfirmation(blk, tx, conf) {
		if (tx == null) {
			return;
		}

		let message = tx.returnMessage();

		if (conf === 0) {
			if (message.module === 'Limbo') {

				if (this.hasSeenTransaction(tx)) return;

				console.log("ON CONFIRMATION: ", message);

				if (tx.isTo(this.publicKey) || this.browser_active || this.app.BROWSER == 0) {
					let sender = tx.from[0].publicKey;

					if (message.request === "start dream"){
						this.receiveDreamTransaction(sender);
					}
					if (message.request === "stop dream"){
						this.receiveKickTransaction(sender);
					}
					if (message.request === "join dream"){
						this.receiveJoinTransaction(sender, tx);
					}
					if (message.request === "leave dream"){
						this.receiveLeaveTransaction(sender, tx);
					}

					this.app.connection.emit("limbo-populated");

					//
					// only servers notify lite-clients
					//
					if (this.app.BROWSER == 0 && this.app.SPVMODE == 0) {
						console.log(" ******** notifyPeers");
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

		if (txmsg.request === "dream list"){

			if (mycallback) {
				mycallback(this.dreams);
				return 1;
			}

			return 0;
		}

		console.log("HANDLE PEER TRANSACTION: ", txmsg);

		if (txmsg.request == "limbo spv update"){
			console.log(" ******8 Extracting forwarded message from server");
			tx = new Transaction(undefined, txmsg.data);
			txmsg = tx.returnMessage();
			console.log(txmsg.request);
		}


		if (this.hasSeenTransaction(tx) || txmsg.module !== this.name) {
			console.log(" ***** Not processing" + txmsg.module);
			return;
		}


		if (tx.isTo(this.publicKey) || this.browser_active || this.app.BROWSER == 0) {
			let sender = tx.from[0].publicKey;

			if (txmsg.request === "start dream"){
				this.receiveDreamTransaction(sender);
			}
			if (txmsg.request === "stop dream"){
				this.receiveKickTransaction(sender);
			}
			if (txmsg.request === "join dream"){
				this.receiveJoinTransaction(sender, tx);
			}
			if (txmsg.request === "leave dream"){
				this.receiveLeaveTransaction(sender, tx);
			}

			this.app.connection.emit("limbo-populated");

		}


		return super.handlePeerTransaction(app, tx, peer, mycallback);
	}


	async notifyPeers(tx) {
		if (this.app.BROWSER == 1) {
			return;
		}
		let peers = await this.app.network.getPeers();
		console.log(" ******* Limbo server forward tx");
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


	exitSpace(){
		this.sendLeaveTransaction();
		this.dreamer = null;

		// Need to notify and close these peer connections
		this.upstream = null;
		this.downstream = null;

	}


	createLink() {
		if (!this.dreamer){
			return null;
		}

		let base64obj = this.app.crypto.stringToBase64(this.dreamer);

		let url1 = window.location.origin + '/limbo/';

		return `${url1}?dream=${base64obj}`;
	}

	copyInviteLink() {
		let link = this.createLink();

		if (link){
			navigator.clipboard.writeText(link);
			siteMessage('Invite link copied to clipboard', 1500);
		}
	}


}

module.exports = Limbo;

