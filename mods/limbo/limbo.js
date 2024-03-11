const ModTemplate = require('../../lib/templates/modtemplate');
const VideoBox = require('./../../lib/saito/ui/saito-videobox/video-box');

class Limbo extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.name = "Limbo";
		this.chunks = [];
		this.localStream = null; // My Video or Audio Feed
	    this.description = "Saito Dream Space: emit audio/video stream to arbitrary number of followers";
	    this.categories = "Utilities Communications";

	    //Server
	    this.dreams = new Map();

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



	async onPeerServiceUp(app, peer, service = {}) {

		if (!app.BROWSER) {
			return;
		}

		if (service.service === 'inception') {

			this.app.network.sendRequestAsTransaction(
				'dream list',
				{},
				(oldMap) => {
					oldMap.forEach((value, key) => {
						this.dreams.set(key, value);
					});

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

					this.videoBox = new VideoBox(this.app, this.mod, 'local');
					this.videoBox.render(this.localStream);
					let videoElement = document.querySelector(
						'.video-box-container-large'
					);
					videoElement.style.position = 'absolute';
					videoElement.style.top = '100px';
					videoElement.style.width = '350px';
					videoElement.style.height = '350px';
					this.app.browser.makeDraggable('stream_local');

					/*
					const videoElemCamera = document.createElement('video');
					//"Play" the webcam output somewhere so it can be captured
					videoElemCamera.srcObject = this.localStream;
					videoElemCamera.muted = true;
					videoElemCamera.play();
					await new Promise(
						(resolve) =>
							(videoElemCamera.onloadedmetadata = resolve)
					);*/
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


	async sendDreamTransaction(){
		let newtx =	await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

		newtx.msg = {
			module: 'Limbo',
			request: 'start dream',
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
	}


	receiveDreamTransaction(sender){
		if (this.app.BROWSER){
			if (this.publicKey == sender){
				this.dreamer = this.publicKey;
				this.upstream = null;
				this.downstream = [];
				this.copyInviteLink();
			}
		}else{
			this.dreams.set(sender, [sender]);
		}
	}

	async sendKickTransaction(){
		let newtx =	await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

		newtx.msg = {
			module: 'Limbo',
			request: 'stop dream',
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
	}


	async sendJoinTransaction(){
		let newtx =	await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

		newtx.msg = {
			module: 'Limbo',
			request: 'join dream',
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);

	}

	async sendLeaveTransaction(){
		let newtx =	await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

		newtx.msg = {
			module: 'Limbo',
			request: 'leave dream',
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);

	}


	onConfirmation(blk, tx, conf) {
		if (tx == null) {
			return;
		}

		let message = tx.returnMessage();

		if (conf === 0) {
			if (message.module === 'Limbo') {

				if (this.hasSeenTransaction(tx)) return;

				if (tx.isTo(this.publicKey) || this.browser_active || this.app.BROWSER == 0) {
					let sender = tx.from[0].publicKey;

					if (message.request === "start dream"){
						this.receiveDreamTransaction(sender);
					}
					if (message.request === "stop dream"){
						
					}
					if (message.request === "join dream"){

					}
					if (message.request === "leave dream"){

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

		if (this.hasSeenTransaction(tx) || txmsg.module !== this.name) {
			return;
		}

		if (tx.isTo(this.publicKey) || this.browser_active || this.app.BROWSER == 0) {
			let sender = tx.from[0].publicKey;

			if (txmsg.request === "start dream"){
				this.receiveDreamTransaction(sender);
			}
			if (txmsg.request === "stop dream"){
				
			}
			if (txmsg.request === "join dream"){

			}
			if (txmsg.request === "leave dream"){

			}


			if (txmsg.request === "dream list"){

				if (mycallback) {
					mycallback(this.dreams);
					return 1;
				}

				return 0;

			}
		}


		return super.handlePeerTransaction(app, tx, peer, mycallback);
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

