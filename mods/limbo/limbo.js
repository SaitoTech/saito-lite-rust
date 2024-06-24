const Transaction = require('../../lib/saito/transaction').default;
const PeerService = require('saito-js/lib/peer_service').default;
const ModTemplate = require('../../lib/templates/modtemplate');
const DreamControls = require('./lib/dream-controls');
const LiteDreamControls = require('./lib/lite-dream-controls');
const DreamSpace = require('./lib/dream-space');
const DreamWizard = require("./lib/dream-wizard");
const LimboMain = require('./lib/main');
const SaitoOverlay = require('./../../lib/saito/ui//saito-overlay/saito-overlay')
const InvitationLink = require('./../../lib/saito/ui/modals/saito-link/saito-link');
const SaitoHeader = require('./../../lib/saito/ui/saito-header/saito-header');
const SaitoProfile = require('./../../lib/saito/ui/saito-profile/saito-profile');
const HomePage = require("./index");

class Limbo extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.slug = "limbo";
		this.name = 'Limbo';
		this.appname = "Saito Space";
		this.localStream = null; // My Video or Audio Feed
		this.combinedStream = null;

		this.description =
			'a shared dream space allowing you to "swarmcast" voice or video with no middleman software';
		this.categories = 'Utilities Communications';

		this.styles = ['/videocall/style.css', '/limbo/style.css'];
		this.icon_fa = 'fa-solid fa-satellite';

		this.screen_icon = "fa-tv";
		this.camera_icon = "fa-video";
		this.audio_icon = "fa-microphone-lines";

		this.stun = null;
		this.rendered = false;

		this.terminationEvent = 'unload';

		this.social = {
			twitter: '@SaitoOfficial',
			title: `🟥 ${this.returnName()}`,
			url: 'https://saito.io/limbo/',
			description: 'Voice and video "swarmcasting" with no middleman',
			image: 'https://saito.tech/wp-content/uploads/2023/11/videocall-300x300.png',
		};


		/*
		Indexed by public key of dreamer
		contains
		ts: (int) start time
		speakers: (optional) array of other voices on the call
		members: (array) people in the dream including dreamer
		alt_id: (optional)
		dreamer: public key of dreamer
		identifier: (string)
		description: (string)
		*/
		this.dreams = {};

		//Browsers
		this.dreamer = null;
		this.upstream = new Map();
		this.downstream = new Map();
		//

		app.connection.on('limbo-toggle-video', () => {
			if (this.combinedStream) {
				this.combinedStream.getVideoTracks().forEach((track) => {
					track.enabled = !track.enabled;
				});
			}
		});

		app.connection.on('limbo-toggle-audio', () => {
			if (this.combinedStream) {
				this.combinedStream.getAudioTracks().forEach((track) => {
					track.enabled = !track.enabled;
				});
			}
		});

		app.connection.on('stun-track-event', (peerId, event) => {
			if (
				!this.dreamer ||
				!this.upstream.has(peerId) ||
				this.dreamer === this.publicKey
			) {
				return;
			}

			console.log('LIMBO: another remote stream added', event.track);

			if (event.streams.length === 0) {
				this.combinedStream.addTrack(event.track);
			} else {
				event.streams[0].getTracks().forEach((track) => {
					this.combinedStream.addTrack(track);
				});
			}

			//Forward to peers if peers already established!
			this.downstream.forEach((key, pc) => {
				if (event.streams.length === 0) {
					pc.addTrack(event.track);
				} else {
					event.streams[0].getTracks().forEach((track) => {
						pc.addTrack(track);
					});
				}
			});

			this.controls.startTime = this.dreams[this.dreamer].ts;
			this.controls.render(this.combinedStream);
		});

		app.connection.on(
			'stun-new-peer-connection',
			async (publicKey, peerConnection) => {
				if (!this.dreamer) {
					return;
				}

				console.log('New Stun/LIMBO peer connection');

				if (this.downstream.has(publicKey)) {
					console.log('Forward audio/video to receiver!');
					this.combinedStream.getTracks().forEach((track) => {
						peerConnection.addTrack(track, this.combinedStream);
					});
					//Save peerConnection in downstream
					this.downstream.set(publicKey, peerConnection);
				}

				if (this.upstream.has(publicKey)) {
					console.log('Set sender');
					this.upstream.set(publicKey, peerConnection);
				}

				this.app.connection.emit('limbo-dream-render', this.dreamer);
			}
		);
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

				if (this.browser_active){
					return null;
				}



				this.attachStyleSheets();
				return [
					{
						text: 'Cast',
						icon: `fa-solid fa-tower-broadcast podcast-icon ${this.dreamer ? "recording": ""}`,
						hook: `onair limbo ${this.dreamer ? "recording": ""}`,
						callback: async function (app) {
							if (mod_self.dreamer) {
								if (mod_self.dreamer == mod_self.publicKey){
									await mod_self.sendKickTransaction(obj.members);
									mod_self.exitSpace();
									mod_self.toggleNotification(false, mod_self.publicKey);
								}else{
									//need a flow for others in call to seed the swarm...
									//
								}
							} else {
								mod_self.startDream({ alt_id: obj?.call_id, keylist: obj.members});
							}
						}
					}
				];
			}
			return null;
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
		if (!this.app.BROWSER) {
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
			this.header.header_class= "wide-screen";
			this.addComponent(this.header);
			this.addComponent(this.main);
		}

		this.app.modules.returnModulesRespondingTo('chat-manager');

		await super.render();

		if (this.app.browser.returnURLParameter('dream')) {
			let dreamer = this.app.crypto.base64ToString(
				this.app.browser.returnURLParameter('dream')
			);
			this.dreamer = dreamer;
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
				async (oldMap) => {
					console.log('********************');
					console.log(oldMap);
					console.log('********************');
					if (oldMap) {
						this.dreams = {};
						Object.keys(oldMap).forEach((key) => {
							this.dreams[key] = oldMap[key];
						});
					}

					console.log("Limbo DREAMS:", this.dreams);
					
					this.main.render();
					
					if (this.dreamer){

						let prompt = `${this.app.keychain.returnUsername(this.dreamer)}'s Saito Space`;

						if (this.dreams[this.dreamer]) {

							const dream = this.dreams[this.dreamer];

							const overlay = new SaitoOverlay(this.app, this);

							const btn_prompt = (dream.mode == "audio") ? "Listen" : "Watch";

							overlay.show(`<div class="saito-join-space-overlay"><div id="join-btn" class="button saito-button-primary">${btn_prompt} Now</div></div>`, ()=>{
								window.history.pushState('', '', `/limbo/`);
								this.dreamer = null;
							});

							overlay.blockClose();

							this.createProfileCard(this.dreamer, dream, ".saito-join-space-overlay");

							let btn = document.getElementById("join-btn");
							if (btn){
								btn.onclick = (e) => {
									this.joinDream(this.dreamer);
									overlay.remove();
								}
							}
							
						} else {
							salert(`${prompt} no longer available`);
							window.history.pushState('', '', `/limbo/`);
							this.exitSpace();
						}
					}
				},
				peer.peerIndex
			);
		}
	}

	createProfileCard(key, dream, container){
		
		let profileCard = new SaitoProfile(this.app, this, container);
		
		let altKey = dream?.alt_id || key;

		profileCard.reset(altKey, "", ["attendees", "speakers"]);

	    if (dream?.identifier) {
	      profileCard.name = dream.identifier;
	    }

	    if (dream?.description) {
	      profileCard.description = dream.description;
	    }

	    if (dream?.alt_id) {
	    	profileCard.mask_key = true;
	    }

	    if (dream?.mode && this[`${dream.mode}_icon`]){
	    	profileCard.icon = `<i class="saito-overlaid-icon fa-solid ${this[`${dream.mode}_icon`]}"></i>`;	
	    }

		//We won't process this array other than checking length... i hope!
		profileCard.menu.attendees = dream.members.filter( k => k !== key );

		profileCard.menu.speakers.push(0);
		if (dream.speakers){
			for (let i of dream.speakers){
				profileCard.menu.speakers.push(0);
			}
		}

		profileCard.render();

	}




	startDream(options){
		this.localStream = null;
		this.externalMediaControl = false;

		//default mode is audio (only)
		options.mode = "audio";

		//
		// First check if any other modules are fetching media
		//
		const otherParties = this.app.modules.getRespondTos('media-request');
		if (otherParties.length > 0) {
			console.log('Include other media!');
			// We hope there is only 1 respondTo!
			this.localStream = otherParties[0].localStream;
			this.additionalSources = otherParties[0].remoteStreams;
			this.externalMediaControl = true;

			options["screenStream"] = false;
			options["audio"] = true;
		} 

		if (!this.wizard){
			this.wizard = new DreamWizard(this.app, this, options);
		}else{
			this.wizard.options = options;
		}

		this.wizard.render();

	}


	async getStream(options){

		// Set up the media recorder with the canvas stream
		// Create a new stream for the combined video and audio
		this.combinedStream = new MediaStream();

		//
		// Attempt to stream of the screen -- user has to select it
		// this should include any displayed video and audio...
		//
		let { includeCamera, screenStream } = options;

		if (screenStream) {

			options.mode = "screen";

			try {
				let constraint = this.browser_active ? 'exclude' : 'include';

				screenStream = await navigator.mediaDevices.getDisplayMedia({
					video: true,
					audio: false,
					selfBrowserSurface: constraint,
					monitorTypeSurfaces: 'include'
				});

				// Add the audio tracks from the screen and camera to the combined stream
				screenStream.getTracks().forEach((track) => {
					this.combinedStream.addTrack(track);
					track.onended = async () => {
						console.log('Stopping screen share');
						await this.sendKickTransaction();
						this.exitSpace();
						this.toggleNotification(false, this.publicKey);
					};
				});
			} catch (error) {
				console.error('Access to screen denied: ', error);
				return;
			}
		} else {

			if (this.additionalSources || this.localStream){
				if (includeCamera){
					//
					// Another module has gathered some media streams and we want the video
					//

					const recorders = this.app.modules.getRespondTos('screenrecord-limbo');
					if (recorders.length > 0) {
						options.mode = "camera";

						this.externalMediaControl = recorders[0];
						this.combinedStream = await this.externalMediaControl.startStreamingVideoCall();
						return;
					}
				}
			}
		}




		if (!this.localStream){
			try {
				//
				// Get webcam video
				//
				if (includeCamera) {

					options.mode = "camera";
					this.localStream =
						await navigator.mediaDevices.getUserMedia({
							video: true,
							audio: true // Capture microphone audio
						});
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
			}
		}


		if (this.localStream) {
			if (this.localStream.getAudioTracks().length > 0) {
				console.log("Add my audio:" , this.localStream.getAudioTracks()[0]);
				this.combinedStream.addTrack(
					this.localStream.getAudioTracks()[0]
				);
			}

			//
			// Just make sure we don't add video if coming from video call or screen sharing...
			//
			if (!screenStream && !this.additionalSources && this.localStream.getVideoTracks().length > 0) {
				console.log("Add my video");
				this.combinedStream.addTrack(
					this.localStream.getVideoTracks()[0]
				);
			}
		}

		if (this.additionalSources) {
			console.log("Add other sources...");
			this.additionalSources.forEach((values, keys) => { 
				console.log(keys, values.remoteStream.getAudioTracks());
				values.remoteStream.getAudioTracks().forEach(track => {
					this.combinedStream.addTrack(track.clone());
				});
			});
		}

	}


	async broadcastDream(options) {
		if (this.dreamer){
			console.warn("Already participating in a dream");
			return;
		}
		await this.getStream(options);

		//Set up controls for user...
		if (this.browser_active) {
			this.controls = new DreamControls(this.app, this, '#limbo-main');
		} else {
			this.controls = new LiteDreamControls(this.app, this, options);
		}

		if (!this.combinedStream?.getTracks()?.length){
			console.error("Limbo: No media to share");
			salert("Please check browser permissions, cannot start a stream without any media");
			return;
		}

		await this.sendDreamTransaction(options);

		if (this.controls) {
			this.controls.render(this.combinedStream, options?.screenStream);
		}

		this.toggleNotification(true, this.publicKey);
		this.attachMetaEvents();

	}

	joinDream(dreamer) {
		this.controls = new DreamSpace(this.app, this, '#limbo-main');
		this.controls.render(null);
		this.dreamer = dreamer;
		this.sendJoinTransaction();
		this.app.connection.emit('limbo-dream-render', dreamer);
		this.combinedStream = new MediaStream();
		this.attachMetaEvents();

		console.log("Join dream:", this.dreams);
	}

	attachMetaEvents(){

		if ('onpagehide' in self){
			this.terminationEvent = 'pagehide';
		}

		this.saveMe = () => {
			this.visibilityChange();
		}

		window.addEventListener(this.terminationEvent, this.saveMe);
		window.addEventListener("beforeunload", this.beforeUnloadHandler);
		if (this.app.browser.isMobileBrowser()){
			document.addEventListener("visibilitychange", this.saveMe);	
		}

	}

	detachMetaEvents(){
		console.log("Safe to navigate!");

		window.removeEventListener("beforeunload", this.beforeUnloadHandler);
		window.removeEventListener(this.terminationEvent, this.saveMe);
		if (this.app.browser.isMobileBrowser()){
			document.removeEventListener("visibilitychange", this.saveMe);	
		}
	}

	async sendDreamTransaction(options = {}) {
		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee(
				this.publicKey
			);

		newtx.msg = {
			module: this.name,
			request: 'start dream',
			speakers: options.keylist,
			mode: options.mode,
		};

		if (options?.alt_id){
			newtx.msg.alt_id = options.alt_id;
		}
		if (options?.identifier){
			newtx.msg.identifier = options.identifier;
		}
		if (options?.description){
			newtx.msg.description = options.description;
		}

		if (options?.keylist) {
			for (let key of options.keylist) {
				newtx.addTo(key);
			}
		}

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);

		this.receiveDreamTransaction(this.publicKey, newtx);
		this.app.connection.emit('limbo-dream-render', this.publicKey);
	}

	receiveDreamTransaction(sender, tx) {

		let txmsg = tx.returnMessage();

		//
		// Services remembers who is dreaming... for browsing
		//
		this.dreams[sender] = {
			members: [sender],
			speakers: txmsg.speakers,
			ts: tx.timestamp,
			dreamer: sender,
			mode: txmsg.mode,
		};

		if (txmsg?.alt_id){
			this.dreams[sender].alt_id = txmsg.alt_id;
		}
		if (txmsg?.identifier){
			this.dreams[sender].identifier = txmsg.identifier;
		}
		if (txmsg?.description){
			this.dreams[sender].description = txmsg.description;
		}

		if (this.app.BROWSER) {
			if (this.publicKey == sender) {
				this.dreamer = this.publicKey;
				this.upstream = new Map();
				this.downstream = new Map();
			}

			if (tx.isTo(this.publicKey)) {
				this.toggleNotification(true, sender);
				
				if (sender !== this.publicKey){
					this.dreamer = sender;
					this.controls = new LiteDreamControls(this.app, this, txmsg);
					this.controls.render();
					this.controls.startTime = tx.timestamp;
					this.controls.startTimer();
				}
			}
		}
	}



	async sendKickTransaction(keylist) {
		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee(
				this.publicKey
			);

		newtx.msg = {
			module: this.name,
			request: 'stop dream'
		};

		console.log(JSON.parse(JSON.stringify(this.dreams)));
		
		for (let key of this.dreams[this.publicKey].members){
			if (key !== this.publicKey){
				newtx.addTo(key);					
			}
		}

		if (keylist) {
			for (let key of keylist) {
				if (!newtx.isTo(key)){
					newtx.addTo(key);					
				}
			}
		}

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
	}

	receiveKickTransaction(sender, tx) {
		
		if (this.app.BROWSER){
			if (this.dreamer !== this.publicKey && this.dreams[this.dreamer]?.members.includes(this.publicKey)) {
				siteMessage(
					`${this.app.keychain.returnUsername(this.dreamer)} woke up...`
				);
			}
		}

		if (this.dreams[sender]) {
			delete this.dreams[sender];
		} else {
			console.log('Sender not found...');
			console.log(sender, this.dreams, tx);
		}

		console.log(this.dreams, this.dreamer);

		if (tx.isTo(this.publicKey)) {
			this.toggleNotification(false, sender);
		}

		//
		// Don't process if not our dreamer
		//
		if (this.dreamer !== sender) {
			return;
		}

		this.exitSpace();
	}

	async sendAddSpeakerTransaction(speaker){
		if (!this.dreamer || !this.dreams[this.dreamer]) {
			console.warn("No dream?");
			console.log(this.dreamer, this.dreams);
			return;
		}

		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee(
				this.publicKey
			);

		newtx.msg = {
			module: this.name,
			request: 'add speaker',
			dreamer: this.dreamer,
			speaker,
			dream: this.dreams[this.dreamer]
		};

		newtx.addTo(speaker);

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
	}

	receiveAddSpeakerTransaction(sender, tx){
		let txmsg = tx.returnMessage();

		let dreamer = txmsg.dreamer;
		let speaker = txmsg.speaker;

		if (this.publicKey === speaker){
			//C'est moi!
			this.dreams[dreamer] = txmsg.dream;
			this.dreamer = dreamer;
			this.toggleNotification(true, sender);
			this.controls = new LiteDreamControls(this.app, this, txmsg.dream);
			this.controls.render();
			this.controls.startTime = this.dreams[dreamer].ts;
			this.controls.startTimer();
		}

		if (!this.dreams[dreamer]) {
			return;
		}

		//Add new speaker to everyone's speaker list
		if (!this.dreams[dreamer].speakers.includes(speaker)) {
			this.dreams[dreamer].speakers.push(speaker);
		}

	}


	async sendRemoveSpeakerTransaction(speaker){
		if (!this.dreamer || !this.dreams[this.dreamer]) {
			return;
		}

		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee(
				this.publicKey
			);

		newtx.msg = {
			module: this.name,
			request: 'remove speaker',
			dreamer: this.dreamer,
			speaker
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
	}

	receiveRemoveSpeakerTransaction(sender, tx){
		let txmsg = tx.returnMessage();

		let dreamer = txmsg.dreamer;
		let speaker = txmsg.speaker;

		if (
			!this.dreams[dreamer] ||
			!this.dreams[dreamer].speakers.includes(speaker)
		) {
			return;
		}

		let members = this.dreams[dreamer].speakers;
		for (let i = 0; i < members.length; i++) {
			if (members[i] == speaker) {
				members.splice(i, 1);
				break;
			}
		}
	}

	async sendJoinTransaction() {
		if (!this.dreamer || !this.dreams[this.dreamer]) {
			console.error('No dreamer to join');
			return;
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

		for (let speaker of this.dreams[this.dreamer].speakers){
			newtx.addTo(speaker);
		}

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

		if (!this.dreams[dreamer].members.includes(sender)) {
			this.dreams[dreamer].members.push(sender);
		}

		if (this.app.BROWSER) {

		// So if someone joins, and we have a stream, we send them an offer to share
		// We impose a hard limit of 10 (to be adjusted downward) stun connections,
		// and we set a delay proportional to the number of connections so that the 
		// swarm has balance loading. I.e. no one downstream will biased to add someone

			let peerCt = this.downstream.size;
			if (this.publicKey === this.dreamer) {
				peerCt += this.stun.peers.size;
			}
			if (
				this.publicKey !== sender &&
				this.combinedStream &&
				peerCt < 10
			) {

				setTimeout(()=> {
					this.sendOfferTransaction(sender);
					this.downstream.set(sender, null);
					setTimeout(() => {

						//
						// Because many people are sending an offer in a race,
						// we rescind offer after 90 seconds if not taken up
						//
						if (
							this.downstream.has(sender) &&
							!this.downstream.get(sender)
						) {
							this.downstream.delete(sender);
						}
					}, 90000);

				}, 100*peerCt);
			}
		}
	}

	async sendLeaveTransaction() {
		if (!this.dreamer) {
			console.error('No dreamer to leave!');
		}

		if (this.dreamer === this.publicKey) {
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

		for (let speaker of this.dreams[this.dreamer].speakers){
			newtx.addTo(speaker);
		}

		this.downstream.forEach((key, pc) => {
			newtx.addTo(key);
		});

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
	}

	receiveLeaveTransaction(sender, tx) {
		let txmsg = tx.returnMessage();

		let dreamer = txmsg.dreamer;

		console.log(`${sender} is leaving ${dreamer}'s dream`);

		if (
			!this.dreams[dreamer] ||
			!this.dreams[dreamer].members.includes(sender)
		) {
			console.log('nothing to remove');
			return;
		}

		let members = this.dreams[dreamer].members;
		for (let i = 0; i < members.length; i++) {
			if (members[i] == sender) {
				members.splice(i, 1);
				break;
			}
		}

		if (this.downstream.has(sender)) {
			let pc = this.downstream.get(sender);
			if (pc) {
				try {
					pc.close();
				} catch (err) {
					console.error(err);
				}
			}
			this.downstream.delete(sender);
		}

		//
		// If your upstream leaves, send a new join transaction to pick up a new stream
		//
		if (this.upstream.has(sender)) {
			this.upstream.delete(sender);
			this.sendJoinTransaction();
		}
	}


	//
	// "Offer" Transactions are for figuring out the tree structure of the swarm
	//

	async sendOfferTransaction(target) {
		if (!this.dreamer) {
			console.error('No dreamer to join');
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

		console.log('Offer stream to ' + target);
	}

	receiveOfferTransaction(sender, tx) {
		if (!this.app.BROWSER) {
			return;
		}
		if (
			!this.dreamer ||
			this.upstream.size > 0 ||
			sender == this.publicKey
		) {
			return;
		}

		console.log('Confirm upstream from ' + sender);
		this.upstream.set(sender, 0);

		//Attempt to get connection
		this.stun.createPeerConnection(sender);
	}

	async sendFailSafe(action, key){
		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();

		let dreamer;

		for (let dream in this.dreams){
			dreamer = dream;

			if (dream == key || this.dreams[dream].members.includes[key]){
				break;	
			}
		}

		newtx.msg = {
			module: this.name,
			request: 'revoke dream',
			type: action,
			dreamer,
			member: key,
		};

		if (!dreamer){
			console.log("No dreamer found... just ignore");
			return;
		}

		//Address to fellow speakers...
		for (let s of this.dreams[dreamer].speakers){
			newtx.addTo(s);
		}

		//
		// Process it for me
		//
		if (action == "kick"){
			delete this.dreams[dreamer];
		} else {
			let members = this.dreams[dreamer].members;
			for (let i = 0; i < members.length; i++) {
				if (members[i] == key) {
					members.splice(i, 1);
					i--;
				}else{
					newtx.addTo(members[i]);
				}
			}
		}

		await newtx.sign();

		if (this.app.BROWSER == 0 && this.app.SPVMODE == 0) {
			this.notifyPeers(newtx);
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
					if (message.request === "add speaker"){
						this.receiveAddSpeakerTransaction(sender, tx);
					}
					if (message.request === "remove speaker"){
						this.receiveRemoveSpeakerTransaction(sender, tx);
					}
					if (message.request === 'offer dream') {
						this.receiveOfferTransaction(sender, tx);
						//Important, we don't need server rebroadcasting this or standard UI updates
						return;
					}

					this.app.connection.emit('limbo-spaces-update');
					
					if (message?.dreamer === this.dreamer) {
						this.app.connection.emit(
							'limbo-dream-render',
							this.dreamer
						);
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

			console.log('HANDLE PEER TRANSACTION: ', txmsg);

			if (txmsg.request === 'start dream') {
				this.receiveDreamTransaction(sender, tx);
			}
			if (txmsg.request === 'stop dream') {
				this.receiveKickTransaction(sender, tx);
			}
			if (txmsg.request === 'join dream') {
				this.receiveJoinTransaction(sender, tx);
			}
			if (txmsg.request === 'leave dream') {
				this.receiveLeaveTransaction(sender, tx);
			}
			if (txmsg.request === "add speaker"){
				this.receiveAddSpeakerTransaction(sender, tx);
			}
			if (txmsg.request === "remove speaker"){
				this.receiveRemoveSpeakerTransaction(sender, tx);
			}
			if (txmsg.request === 'offer dream') {
				this.receiveOfferTransaction(sender, tx);
				//Important, we don't need server rebroadcasting this or standard UI updates
				return;
			}
			if (txmsg.request === "revoke dream"){
				if (txmsg.type == "kick"){
					this.receiveKickTransaction(txmsg.member, tx);
				}else{
					this.receiveLeaveTransaction(txmsg.member, tx);
				}
			}

			this.app.connection.emit('limbo-spaces-update');

			if (txmsg?.dreamer === this.dreamer) {
				this.app.connection.emit('limbo-dream-render', this.dreamer);
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
			if (this.localStream) {
				this.localStream.getTracks().forEach((track) => track.stop());
			}
			if (this.combinedStream) {
				this.combinedStream.getTracks().forEach((track) => {
					track.onended = null;
					track.stop();
				});
			}
		}else{
			if (this.externalMediaControl?.stopStreamingVideoCall){
				this.externalMediaControl.stopStreamingVideoCall();
				this.externalMediaControl = false;
			}
		}

		this.localStream = null;
		this.combinedStream = null;
		this.additionalSources = null;

	}

	exitSpace() {
		this.dreamer = null;

		this.downstream.forEach((value, key) => {
			console.log(key, value);
			if (value) {
				try {
					value.close();
				} catch (err) {
					console.error(err);
				}
			}
		});

		this.upstream.forEach((value, key) => {
			console.log(key, value);
			if (value) {
				try {
					value.close();
				} catch (err) {
					console.error(err);
				}
			}
		});

		// Need to notify and close these peer connections
		this.upstream.clear();
		this.downstream.clear();

		this.stop();

		if (this.controls) {
			this.controls.remove();
		}

		if (this.browser_active) {
			window.history.pushState('', '', `/limbo/`);
		}

		this.app.connection.emit('limbo-dream-render');
		this.controls = null;
		this.detachMetaEvents();
		console.log("Space exited!");
	}


	copyInviteLink(truthy = false) {

		let data = {
			name: this.appname,
			path: '/limbo/',
			dream: this.app.crypto.stringToBase64(this.dreamer)
		};

		let invite = new InvitationLink(this.app, this, data);
		invite.render();

		/*if (truthy) {
			if (!this.browser_active){
				//Since there is a button in the UI now, no need to bother with this...
				let data = {
					name: 'Limbo',
					path: '/limbo/',
					dream: this.app.crypto.stringToBase64(this.dreamer)
				};

				let invite = new InvitationLink(this.app, this, data);
				invite.render();
			}
		} else {
			try {

				let base64obj = this.app.crypto.stringToBase64(this.dreamer);
				let url1 = window.location.origin + '/limbo/';
				let link = `${url1}?dream=${base64obj}`;

				navigator.clipboard.writeText(link);
				siteMessage('Invite link copied to clipboard', 1500);
			} catch (err) {
				console.warn(err);
			}
		}*/
	}

	toggleNotification(value = true, sender) {
		let vinyl = document.querySelector('.podcast-icon');
		if (vinyl) {
			let full_icon = vinyl.parentElement;
			if (value) {
				vinyl.classList.add('recording');
				full_icon.classList.add('recording');
				if (sender != this.publicKey){
					full_icon.title = `${this.app.keychain.returnUsername(sender)} is peercasting the call`;
				}else{
					full_icon.title = "Stop Limbo Broadcast";
				}

			} else {
				vinyl.classList.remove('recording');
				full_icon.classList.remove('recording');
				full_icon.title = "Start a Limbo Broadcast";
			}
		}
	}

	beforeUnloadHandler(event) {
		event.preventDefault();
		event.returnValue = true;
	}

	visibilityChange(){
		console.log("visibilitychange triggered")

		if (!navigator?.sendBeacon){
			return;
		}

		if (this.dreamer === this.publicKey){
			navigator.sendBeacon(`/limbo?action=kick&key=${this.publicKey}`);
		}else{
			navigator.sendBeacon(`/limbo?action=leave&key=${this.publicKey}`);
		}
		
        this.exitSpace();
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

				let dream = req.query?.dream;
				let updated_social = mod_self.social;
				
				if (dream) {

					let dreamer = mod_self.app.crypto.base64ToString(dream);

					updated_social.title = mod_self.app.keychain.returnUsername(dreamer) + " is live streaming on Saito 🟥"; 

					if (mod_self.dreams[dreamer]) {
						if (mod_self.dreams[dreamer]?.identifier){
							updated_social.title = mod_self.dreams[dreamer].identifier;
						}
						if (mod_self.dreams[dreamer]?.description){
							updated_social.description = mod_self.dreams[dreamer].description;
						}
					}					
				}

				res.send(HomePage(app, mod_self, app.build_number, updated_social));
				return;
			}
		);

		expressapp.post(
			'/' + encodeURI(this.returnSlug()),
			async function (req, res) {
				let reqBaseURL = req.protocol + '://' + req.headers.host + '/';

				if (req.query?.action && req.query?.key){
					mod_self.sendFailSafe(req.query.action, req.query.key);
				}
			}
		);

		expressapp.use(
			'/' + encodeURI(this.returnSlug()),
			express.static(webdir)
		);
	}



}

module.exports = Limbo;
