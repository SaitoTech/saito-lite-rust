const Transaction = require('../../lib/saito/transaction').default;
const PeerService = require('saito-js/lib/peer_service').default;
const ModTemplate = require('../../lib/templates/modtemplate');
const DreamControls = require('./lib/dream-controls');
const LiteDreamControls = require('./lib/lite-dream-controls');
const DreamSpace = require('./lib/dream-space');
const DreamWizard = require('./lib/dream-wizard');
const LimboMain = require('./lib/main');
const SaitoOverlay = require('./../../lib/saito/ui//saito-overlay/saito-overlay');
const InvitationLink = require('./../../lib/saito/ui/modals/saito-link/saito-link');
const SaitoHeader = require('./../../lib/saito/ui/saito-header/saito-header');
const SaitoProfile = require('./../../lib/saito/ui/saito-profile/saito-profile');
const HomePage = require('./index');

class Limbo extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.name = 'Swarmcast';
		this.localStream = null; // My Video or Audio Feed
		this.combinedStream = null;
		this.screenStream = null;

		this.description =
			'a shared dream space allowing you to "swarmcast" voice or video with no middleman software';

		this.categories = 'Utilities Communications Broadcast';

		this.styles = ['/videocall/style.css'];

		this.icon_fa = 'fa-solid fa-tower-broadcast';

		this.screen_icon = 'fa-tv';
		this.camera_icon = 'fa-video';
		this.audio_icon = 'fa-microphone-lines';

		this.stun = null;
		this.rendered = false;

		this.terminationEvent = 'unload';

		this.social = {
			twitter: '@SaitoOfficial',
			title: `🟥 ${this.returnName()}`,
			url: `https://saito.io/${this.returnSlug()}/`,
			description: 'Voice and video "swarmcasting" with no middleman',
			image: 'https://saito.tech/wp-content/uploads/2023/11/videocall-300x300.png'
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
		muted: 
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
			if (this.externalMediaControl) {
				if (this.combinedStream) {
					this.combinedStream.getAudioTracks().forEach((track) => {
						track.enabled = !track.enabled;
					});
				}
			} else {
				if (this.audioStream?.stream) {
					this.audioStream.stream.getTracks().forEach((track) => {
						track.enabled = !track.enabled;
					});
				}
			}
		});

		app.connection.on('limbo-toggle-screen', () => {
			if (this.screenStream) {
				this.screenStream.getTracks().forEach((track) => {
					track.enabled = !track.enabled;
				});
			}
		});

		app.connection.on('limbo-update-status', () => {
			if (!this.dreamer || !this.dreams[this.dreamer]) {
				return;
			}

			let muted = this.dreams[this.dreamer]?.muted;
			this.dreams[this.dreamer].muted = !muted;
			this.sendStatusTransaction();
		});

		app.connection.on('stun-track-event', (peerId, event) => {
			if (!this.dreamer || !this.upstream.has(peerId) || this.dreamer === this.publicKey) {
				return;
			}

			console.log('LIMBO: another remote stream added from my upstream', event.track);

			if (event.streams.length === 0 && event?.track) {
				this.processTrack(event.track);
			} else {
				event.streams[0].getTracks().forEach((track) => {
					this.processTrack(track);
				});
			}

			this.controls.startTime = this.dreams[this.dreamer].ts;
			this.controls.render(this.combinedStream);
		});

		app.connection.on('stun-new-peer-connection', async (publicKey, peerConnection) => {
			if (!this.dreamer) {
				return;
			}

			console.log('New Stun/LIMBO peer connection');

			if (this.downstream.has(publicKey)) {
				console.log('Forward audio/video to receiver:' + publicKey);
				this.combinedStream.getTracks().forEach((track) => {
					console.log('Track: ', track);
					peerConnection.addTrack(track, this.combinedStream);
				});
				//Save peerConnection in downstream
				this.downstream.set(publicKey, peerConnection);
			} else if (this.upstream.has(publicKey)) {
				console.log('Prepare to receive media from upstream peer: ' + publicKey);
				this.upstream.set(publicKey, peerConnection);
			} else {
				console.warn('Stun connection established in Limbo, but not sure why...', publicKey);
			}

			this.app.connection.emit('limbo-dream-render', this.dreamer);
		});
	}

	isSlug(slug) {
		if (slug == this.returnSlug() || slug == 'limbo') {
			return true;
		}
		return false;
	}

	async initialize(app) {
		await super.initialize(app);

		if (app.BROWSER) {
			try {
				this.stun = app.modules.returnFirstRespondTo('peer-manager');
			} catch (err) {
				console.warn('No Stun available');
			}

			this.styles.push(`/${this.returnSlug()}/style.css`);
		}
	}

	processTrack(track) {
		//Add to my stream
		this.combinedStream.addTrack(track);

		//Forward to my peers
		this.downstream.forEach((pc, key) => {
			if (pc) {
				console.log('Forward downstream to: ', key);
				pc.addTrack(track);
			}
		});
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

		if (type === 'saito-header') {
			let x = [];
			if (!this.browser_active) {
				x.push({
					text: 'Swarmcast',
					icon: this.icon_fa,
					callback: function (app, id) {
						window.location = '/' + mod_self.returnSlug();
					}
				});

				return x;
			}
		}

		if (type === 'call-actions') {
			if (obj?.members) {
				if (this.browser_active) {
					return null;
				}

				this.attachStyleSheets();
				return [
					{
						text: 'Cast',
						icon: this.icon_fa + ' podcast-icon',
						hook: `onair limbo`,
						callback: async function (app) {
							if (mod_self.dreamer) {
								if (mod_self.dreamer == mod_self.publicKey) {
									await mod_self.sendKickTransaction(obj.members);
									mod_self.exitSpace();
									mod_self.toggleNotification(false, mod_self.publicKey);
								} else {
									//need a flow for others in call to seed the swarm...
									//
									salert('Only the host can end the Swarmcast');
								}
							} else {
								mod_self.startDream({
									alt_id: obj?.call_id,
									keylist: obj.members,
									externalMediaType: 'videocall'
								});
							}
						},
						event: function (id) {
							mod_self.toggleNotification(mod_self?.dreamer, mod_self?.dreamer);
						}
					}
				];
			}
			return null;
		}

		//
		//Game-Menu passes the game_mod as the obj, so we can test if we even want to add the option
		//
		if (type === 'game-menu') {
			if (!obj.recordOptions) return;
			let menu = {
				//id: 'game-share',
				//text: 'Share',
				submenus: []
			};

			if (this.browser_active) {
				return null;
			}

			this.attachStyleSheets();

			menu.submenus.push({
				parent: 'game-share',
				text: 'Cast game',
				id: 'cast-stream',
				class: 'cast-stream',
				callback: async function (app, game_mod) {
					let recordButton = document.getElementById('cast-stream');
					let { container, callbackAfterRecord, players } = game_mod.recordOptions;
					console.log(game_mod.game.players, 'gamemod.game.players');
					if (mod_self.dreamer) {
						if (mod_self.dreamer == mod_self.publicKey) {
							await mod_self.sendKickTransaction(obj.members);
							mod_self.exitSpace();
						} else {
							salert('Only the host can end the Swarmcast');
						}
					} else {
						mod_self.startDream({
							externalMediaType: 'game',
							container,
							keylist: [],
							game_name: game_mod.name,
							players: game_mod.game.players
						});
					}
					game_mod.menu.hideSubMenus();
				}.bind(this)
			});

			return menu;
		}

		return super.respondTo(type, obj);
	}

	async render() {
		if (!this.app.BROWSER) {
			return;
		}

		if (this.main == null) {
			this.main = new LimboMain(this.app, this);
			this.header = new SaitoHeader(this.app, this);
			await this.header.initialize(this.app);
			this.header.header_class = 'wide-screen';
			this.addComponent(this.header);
			this.addComponent(this.main);
		}

		this.app.modules.returnModulesRespondingTo('chat-manager');

		await super.render();

		if (this.app.browser.returnURLParameter('dream')) {
			let dreamer = this.app.crypto.base64ToString(this.app.browser.returnURLParameter('dream'));
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
					if (oldMap) {
						this.dreams = {};
						Object.keys(oldMap).forEach((key) => {
							this.dreams[key] = oldMap[key];
						});
					}

					this.main.render();

					if (this.dreamer) {
						let prompt = `${this.app.keychain.returnUsername(this.dreamer)}'s Swarmcast`;

						if (this.dreams[this.dreamer]) {
							const dream = this.dreams[this.dreamer];

							const overlay = new SaitoOverlay(this.app, this);

							const btn_prompt = dream.mode == 'audio' ? 'Listen' : 'Watch';

							overlay.show(
								`<div class="saito-join-space-overlay"><div id="join-btn" class="button saito-button-primary">${btn_prompt} Now</div></div>`,
								() => {
									window.history.pushState('', '', `/${this.returnSlug()}/`);
									this.dreamer = null;
								}
							);

							overlay.blockClose();

							this.createProfileCard(this.dreamer, dream, '.saito-join-space-overlay');

							let btn = document.getElementById('join-btn');
							if (btn) {
								btn.onclick = (e) => {
									this.joinDream(this.dreamer);
									overlay.remove();
								};
							}
						} else {
							if (this.dreamer !== this.publicKey) {
								salert(`${prompt} no longer available`);
							}
							window.history.pushState('', '', `/${this.returnSlug()}/`);
							this.exitSpace();
						}
					}
				},
				peer.peerIndex
			);
		}
	}

	createProfileCard(key, dream, container) {
		let profileCard = new SaitoProfile(this.app, this, container);

		let altKey = dream?.alt_id || key;

		profileCard.reset(altKey, '', ['attendees', 'speakers']);

		if (dream?.identifier) {
			profileCard.name = dream.identifier;
		}

		if (dream?.description) {
			profileCard.description = dream.description;
		}

		if (dream?.alt_id) {
			profileCard.mask_key = true;
		}

		if (dream?.mode && this[`${dream.mode}_icon`]) {
			profileCard.icon = `<i class="saito-overlaid-icon fa-solid ${
				this[`${dream.mode}_icon`]
			}"></i>`;
		}

		//We won't process this array other than checking length... i hope!
		profileCard.menu.attendees = dream.members.filter((k) => k !== key);

		profileCard.menu.speakers.push(0);
		if (dream.speakers) {
			for (let i of dream.speakers) {
				profileCard.menu.speakers.push(0);
			}
		}

		profileCard.render();
	}

	startDream(options) {
		this.localStream = null;

		//default mode is audio (only)
		options.mode = 'audio';

		if (options.externalMediaType === 'videocall') {
			//
			// First check if any other modules are fetching media
			//
			const otherParties = this.app.modules.getRespondTos('media-request');
			if (otherParties.length > 0) {
				console.log('Include other media!');
				// We hope there is only 1 respondTo!
				this.localStream = otherParties[0].localStream;
				this.additionalSources = otherParties[0].remoteStreams;

				// This serves as a flag to prevent you from shutting off the localStream when ending a cast
				this.externalMediaControl = true;

				options['screenStream'] = false;
				options['audio'] = true;
			}
		}

		if (!this.wizard) {
			this.wizard = new DreamWizard(this.app, this, options);
		} else {
			this.wizard.options = options;
		}

		this.wizard.render();
	}

	async getStream(options) {
		// Set up the media recorder with the canvas stream
		// Create a new stream for the combined video and audio
		this.audioContext = new AudioContext();
		this.audioStream = new MediaStreamAudioDestinationNode(this.audioContext);
		//this.audioContext.createMediaStreamDestination();
		this.audioMixer = this.audioContext.createGain();
		this.audioMixer.connect(this.audioStream);

		this.combinedStream = new MediaStream();

		//
		// Attempt to stream of the screen -- user has to select it
		// this should include any displayed video and audio...
		//
		let { includeCamera, screenStream } = options;

		if (screenStream) {
			options.mode = 'screen';

			try {
				this.screenStream = await navigator.mediaDevices.getDisplayMedia({
					video: true,
					audio: true,
					selfBrowserSurface: 'include',
					monitorTypeSurfaces: 'include',
					systemAudio: 'include'
				});

				// Add the audio tracks from the screen and camera to the combined stream
				this.screenStream.getTracks().forEach((track) => {
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
			if (options.externalMediaType === 'videocall') {
				if (this.additionalSources || this.localStream) {
					if (includeCamera) {
						//
						// Another module has gathered some media streams and we want the video
						//

						const recorders = this.app.modules.getRespondTos('screenrecord-videocall-limbo');
						if (recorders.length > 0) {
							options.mode = 'camera';
							this.externalMediaControl = recorders[0];
							this.combinedStream = await this.externalMediaControl.startStreamingVideoCall();
							return;
						}
					}
				}
			}

			if (options.externalMediaType === 'game') {
				const recorders = this.app.modules.getRespondTos('screenrecord-game-limbo');
				if (recorders.length > 0) {
					options.mode = 'camera';
					this.externalMediaControl = recorders[0];
					this.externalMediaControl.type = "game"
					this.combinedStream = await this.externalMediaControl.startStreamingGame(options);
					// this.toggleNotification(false, this.publicKey);
					console.log('this.combinedStream', this.combinedStream);
					return;
				}
			}
		}

		if (!this.localStream) {
			try {
				//
				// Get webcam video
				//
				if (includeCamera) {
					options.mode = 'camera';
					this.localStream = await navigator.mediaDevices.getUserMedia({
						video: true,
						audio: true // Capture microphone audio
					});
				} else {
					//
					// Get microphone input only
					//
					this.localStream = await navigator.mediaDevices.getUserMedia({
						audio: true // Capture microphone audio
					});
				}
			} catch (error) {
				console.error('Access to user media denied: ', error);
			}
		}

		if (this.localStream) {
			if (this.localStream.getAudioTracks().length > 0) {
				console.log('Add my audio:', this.localStream.getAudioTracks()[0]);
				let localAudio = this.audioContext.createMediaStreamSource(this.localStream);
				localAudio.connect(this.audioMixer);

				//this.combinedStream.addTrack(this.localStream.getAudioTracks()[0].clone());
			}

			//
			// Just make sure we don't add video if coming from video call or screen sharing...
			//
			if (
				!screenStream &&
				!this.additionalSources &&
				this.localStream.getVideoTracks().length > 0
			) {
				console.log('Add my video');
				this.combinedStream.addTrack(this.localStream.getVideoTracks()[0]);
			}
		}

		if (this.additionalSources) {
			console.log('Add other sources... ?');
			this.additionalSources.forEach((values, keys) => {
				console.log(keys, values.remoteStream.getAudioTracks());
				let otherAudio = this.audioContext.createMediaStreamSource(values.remoteStream);
				otherAudio.connect(this.audioMixer);

				/*values.remoteStream.getAudioTracks().forEach(track => {
					this.combinedStream.addTrack(track.clone());
				});*/
			});
			console.log('... done');
		}

		console.log('Move tracks from AudioContext into Combined Stream...');
		this.audioStream.stream.getTracks().forEach((track) => {
			console.log(track);
			this.combinedStream.addTrack(track);
		});
		console.log('... done');
	}

	async broadcastDream(options) {
		if (this.dreamer) {
			console.warn('Already participating in a dream');
			return;
		}
		await this.getStream(options);
		//Set up controls for user...
		if (this.browser_active) {
			this.controls = new DreamControls(this.app, this, '#limbo-main');
		} else {
			this.controls = new LiteDreamControls(this.app, this, options);
		}

		if (!this.combinedStream?.getTracks()?.length) {
			console.error('Limbo: No media to share');
			salert('Please check browser permissions, cannot start a stream without any media');
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

		console.log('Join dream:', this.dreams);
	}

	attachMetaEvents() {
		if ('onpagehide' in self) {
			this.terminationEvent = 'pagehide';
		}

		this.saveMe = () => {
			this.visibilityChange();
		};

		window.addEventListener(this.terminationEvent, this.saveMe);
		window.addEventListener('beforeunload', this.beforeUnloadHandler);
		if (this.app.browser.isMobileBrowser()) {
			document.addEventListener('visibilitychange', this.saveMe);
		}
	}

	detachMetaEvents() {
		console.log('Safe to navigate!');

		window.removeEventListener('beforeunload', this.beforeUnloadHandler);
		window.removeEventListener(this.terminationEvent, this.saveMe);
		if (this.app.browser.isMobileBrowser()) {
			document.removeEventListener('visibilitychange', this.saveMe);
		}
	}

	async sendDreamTransaction(options = {}) {
		console.log(options, 'limbo options');
		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

		newtx.msg = {
			module: this.name,
			request: 'start dream',
			speakers: options.keylist,
			mode: options.mode
		};

		if (options?.alt_id) {
			newtx.msg.alt_id = options.alt_id;
		}
		if (options?.identifier) {
			newtx.msg.identifier = options.identifier;
		}
		if (options?.description) {
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
			mode: txmsg.mode
		};

		if (txmsg?.alt_id) {
			this.dreams[sender].alt_id = txmsg.alt_id;
		}
		if (txmsg?.identifier) {
			this.dreams[sender].identifier = txmsg.identifier;
		}
		if (txmsg?.description) {
			this.dreams[sender].description = txmsg.description;
		}

		if (this.app.BROWSER) {
			if (this.publicKey == sender) {
				this.dreamer = this.publicKey;
				this.upstream = new Map();
				this.downstream = new Map();

				let enabled = true;
				if (this.combinedStream) {
					this.combinedStream.getTracks().forEach((track) => {
						enabled = enabled && track.enabled;
					});
				}
				if (!enabled) {
					this.dreams[sender].muted = true;
				}
			}

			if (tx.isTo(this.publicKey)) {
				this.toggleNotification(true, sender);

				if (sender !== this.publicKey) {
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
		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

		newtx.msg = {
			module: this.name,
			request: 'stop dream'
		};

		console.log(JSON.parse(JSON.stringify(this.dreams)));

		for (let key of this.dreams[this.publicKey].members) {
			if (key !== this.publicKey) {
				newtx.addTo(key);
			}
		}

		if (keylist) {
			for (let key of keylist) {
				if (!newtx.isTo(key)) {
					newtx.addTo(key);
				}
			}
		}

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
	}

	receiveKickTransaction(sender, tx) {
		if (this.app.BROWSER) {
			if (this.dreamer == sender) {
				if (
					this.dreamer !== this.publicKey &&
					this.dreams[this.dreamer]?.members.includes(this.publicKey)
				) {
					siteMessage(`${this.app.keychain.returnUsername(this.dreamer)} woke up...`, 3000);
				}
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

		if (this.app.BROWSER) {
			this.exitSpace();
		}
	}

	async sendAddSpeakerTransaction(speaker) {
		if (!this.dreamer || !this.dreams[this.dreamer]) {
			console.warn('No dream?');
			console.log(this.dreamer, this.dreams);
			return;
		}

		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

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

	receiveAddSpeakerTransaction(sender, tx) {
		let txmsg = tx.returnMessage();

		let dreamer = txmsg.dreamer;
		let speaker = txmsg.speaker;

		if (this.publicKey === speaker) {
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

	async sendRemoveSpeakerTransaction(speaker) {
		if (!this.dreamer || !this.dreams[this.dreamer]) {
			return;
		}

		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

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

	receiveRemoveSpeakerTransaction(sender, tx) {
		let txmsg = tx.returnMessage();

		let dreamer = txmsg.dreamer;
		let speaker = txmsg.speaker;

		if (!this.dreams[dreamer] || !this.dreams[dreamer].speakers.includes(speaker)) {
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

		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

		newtx.msg = {
			module: this.name,
			request: 'join dream',
			dreamer: this.dreamer
		};

		for (let speaker of this.dreams[this.dreamer].speakers) {
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

		if (this.dreams[dreamer].speakers.includes(this.publicKey)) {
			//Secondary speakers opt out of hosting duties...
			return;
		}

		if (tx.isFrom(this.publicKey)) {
			return;
		}

		if (this.app.BROWSER) {
			// So if someone joins, and we have a stream, we send them an offer to share
			// We impose a hard limit of 10 (to be adjusted downward) stun connections,
			// and we set a delay proportional to the number of connections so that the
			// swarm has balance loading. I.e. no one downstream will biased to add someone

			if (dreamer !== this.dreamer) {
				return;
			}

			let source = false;

			let peerCt = this.downstream.size;
			if (this.publicKey === this.dreamer) {
				peerCt += this.stun.peers.size;
				source = true;
			} else {
				if (this.upstream.size > 0) {
					this.upstream.forEach((pc, key) => {
						if (pc.connectionState == 'connected') {
							source = true;
						}
					});
				}
			}

			if (!source) {
				console.warn("Ignoring Join Transaction because I don't have a stable source yet");
				return;
			}

			if (this.publicKey !== sender && this.combinedStream && peerCt < 3) {
				setTimeout(() => {
					this.sendOfferTransaction(sender);
					this.downstream.set(sender, null);
					setTimeout(() => {
						//
						// Because many people are sending an offer in a race,
						// we rescind offer after 90 seconds if not taken up
						//
						if (this.downstream.has(sender) && !this.downstream.get(sender)) {
							this.downstream.delete(sender);
							//Drop them from peer list
							this.app.connection.emit('limbo-dream-render', this.dreamer);
						}
					}, 30000);
				}, 200 * peerCt);
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

		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

		newtx.msg = {
			module: this.name,
			request: 'leave dream',
			dreamer: this.dreamer
		};

		newtx.addTo(this.dreamer);

		for (let speaker of this.dreams[this.dreamer].speakers) {
			newtx.addTo(speaker);
		}

		this.downstream.forEach((pc, key) => {
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

		if (!this.dreams[dreamer] || !this.dreams[dreamer].members.includes(sender)) {
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
					console.log(`Close my peerconnection with ${sender} who left`);
					this.stun.removePeerConnection(sender);
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

		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(target);

		newtx.msg = {
			module: this.name,
			request: 'offer dream',
			dreamer: this.dreamer,
			muted: this.dreams[this.dreamer]?.muted
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);

		console.log('Offer stream to ' + target);
		console.log(this.dreams[this.dreamer]);
	}

	receiveOfferTransaction(sender, tx) {
		if (!this.app.BROWSER) {
			return;
		}
		if (!this.dreamer || this.upstream.size > 0 || sender == this.publicKey) {
			console.log('ignore offer transaction');
			return;
		}

		console.log('Confirm upstream from ' + sender);
		this.upstream.set(sender, 0);

		let txmsg = tx.returnMessage();
		this.dreams[this.dreamer].muted = txmsg.muted;

		//Attempt to get connection
		this.stun.createPeerConnection(sender);
	}

	async sendStatusTransaction() {
		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();

		newtx.msg = {
			module: this.name,
			request: 'update status',
			dreamer: this.dreamer,
			muted: this.dreams[this.dreamer]?.muted
		};

		this.downstream.forEach((pc, key) => {
			console.log('Send to downstream key: ', key);
			newtx.addTo(key);
		});

		await newtx.sign();

		//This should be Stun-channel only...
		this.app.connection.emit('relay-transaction', newtx);
	}

	receiveStatusTransaction(sender, tx) {
		if (!this.app.BROWSER) {
			return;
		}

		if (this.publicKey == sender) {
			return;
		}

		if (!this.dreamer || !this.dreams[this.dreamer]) {
			return;
		}

		let txmsg = tx.returnMessage();

		this.dreams[this.dreamer].muted = txmsg.muted;

		this.sendStatusTransaction();
	}

	async sendFailSafe(action, key) {
		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();

		let dreamer;

		for (let dream in this.dreams) {
			dreamer = dream;

			if (dream == key || this.dreams[dream].members.includes[key]) {
				break;
			}
		}

		newtx.msg = {
			module: this.name,
			request: 'revoke dream',
			type: action,
			dreamer,
			member: key
		};

		if (!dreamer) {
			console.log('No dreamer found... just ignore');
			return;
		}

		//Address to fellow speakers...
		for (let s of this.dreams[dreamer].speakers) {
			newtx.addTo(s);
		}

		//
		// Process it for me
		//
		if (action == 'kick') {
			delete this.dreams[dreamer];
		} else {
			let members = this.dreams[dreamer].members;
			for (let i = 0; i < members.length; i++) {
				if (members[i] == key) {
					members.splice(i, 1);
					i--;
				} else {
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
			if (message.module === this.name) {
				if (this.hasSeenTransaction(tx)) return;

				console.log('ON CONFIRMATION: ', message);

				if (tx.isTo(this.publicKey) || this.browser_active || this.app.BROWSER == 0) {
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
					if (message.request === 'add speaker') {
						this.receiveAddSpeakerTransaction(sender, tx);
					}
					if (message.request === 'remove speaker') {
						this.receiveRemoveSpeakerTransaction(sender, tx);
					}
					if (message.request === 'offer dream') {
						this.receiveOfferTransaction(sender, tx);
						//Important, we don't need server rebroadcasting this or standard UI updates
						return;
					}

					this.app.connection.emit('limbo-spaces-update');

					if (message?.dreamer === this.dreamer) {
						this.app.connection.emit('limbo-dream-render', this.dreamer);
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
			// Add a safety check to filter bad dreams
			if (!this.app.BROWSER) {
				let peerkeys = [];
				let peers = await this.app.network.getPeers();
				peers.forEach((p) => {
					peerkeys.push(p.publicKey);
				});

				let dreamer_list = Object.keys(this.dreams);
				for (let d of dreamer_list) {
					if (!peerkeys.includes(d)) {
						delete this.dreams[d];
					}
				}
			}

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

		if (tx.isTo(this.publicKey) || this.browser_active || this.app.BROWSER == 0) {
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
			if (txmsg.request === 'add speaker') {
				this.receiveAddSpeakerTransaction(sender, tx);
			}
			if (txmsg.request === 'remove speaker') {
				this.receiveRemoveSpeakerTransaction(sender, tx);
			}
			if (txmsg.request === 'offer dream') {
				this.receiveOfferTransaction(sender, tx);
				return;
			}
			if (txmsg.request === 'update status') {
				this.receiveStatusTransaction(sender, tx);
			}

			if (txmsg.request === 'revoke dream') {
				if (txmsg.type == 'kick') {
					this.receiveKickTransaction(txmsg.member, tx);
				} else {
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

		if (this.screenStream) {
			this.screenStream.getTracks().forEach((track) => {
				track.onended = null;
				track.stop();
			});
		}

		if (!this?.externalMediaControl) {
			if (this.localStream) {
				this.localStream.getTracks().forEach((track) => track.stop());
			}

			if (this.combinedStream) {
				this.combinedStream.getTracks().forEach((track) => {
					track.onended = null;
					track.stop();
				});
			}
		} else {
			if (this.externalMediaControl?.stopStreamingVideoCall) {
				this.externalMediaControl.stopStreamingVideoCall();
				this.externalMediaControl = null;
			}
			if (this.externalMediaControl?.stopStreamingGame) {
				this.externalMediaControl.stopStreamingGame();
				this.externalMediaControl = null;
			}
		}

		this.localStream = null;
		this.combinedStream = null;
		this.additionalSources = null;
		this.screenStream = null;
	}

	exitSpace() {
		this.dreamer = null;

		this.downstream.forEach((value, key) => {
			if (value) {
				try {
					this.stun.removePeerConnection(key);
				} catch (err) {
					console.error(err);
				}
			}
		});

		this.upstream.forEach((value, key) => {
			if (value) {
				try {
					this.stun.removePeerConnection(key);
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
			window.history.pushState('', '', `/${this.returnSlug()}/`);
		}

		this.app.connection.emit('limbo-dream-render');
		this.app.connection.emit('saito-yt-stop-stream');
		this.controls = null;
		this.detachMetaEvents();
		console.log('Space exited!');
	}

	copyInviteLink(truthy = false) {
		let data = {
			name: this.returnName(),
			path: `/${this.returnSlug()}/`,
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

	//									container.querySelector("label").innerText = "Stop";

	toggleNotification(value = true, sender) {
		let vinyl = document.querySelector('.podcast-icon');
		if (vinyl) {
			let full_icon = vinyl.parentElement;

			if (value) {
				vinyl.classList.add('recording');
				full_icon.classList.add('recording');
				if (sender != this.publicKey) {
					full_icon.classList.add('not-clickable');
					full_icon.title = `${this.app.keychain.returnUsername(sender)} is swarmcasting the call`;
					full_icon.querySelector('label').innerText = 'Casting';
				} else {
					full_icon.title = 'Stop Swarmcast';
					full_icon.querySelector('label').innerText = 'Stop';
				}
			} else {
				full_icon.classList.remove('not-clickable');
				vinyl.classList.remove('recording');
				full_icon.classList.remove('recording');
				full_icon.title = 'Start a Limbo Broadcast';
				full_icon.querySelector('label').innerText = 'Cast';
			}
		}

		const castButtonGame = document.getElementById('cast-stream');

		if (!castButtonGame) {
			console.warn('Cast button not found in the DOM');
			return;
		}

		const isCasting = castButtonGame.textContent.trim().toLowerCase() === 'stop cast';

		console.log('isCasting', isCasting);
		castButtonGame.textContent = isCasting ? 'Cast game' : 'Stop cast';
	}

	beforeUnloadHandler(event) {
		event.preventDefault();
		event.returnValue = true;
	}

	visibilityChange() {
		console.log('visibilitychange triggered');

		if (!navigator?.sendBeacon) {
			return;
		}

		if (this.dreamer === this.publicKey) {
			navigator.sendBeacon(`/limbo?action=kick&key=${this.publicKey}`);
		} else {
			navigator.sendBeacon(`/limbo?action=leave&key=${this.publicKey}`);
		}

		this.exitSpace();
	}

	webServer(app, expressapp, express) {
		let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
		let mod_self = this;

		const serverFn = async (req, res) => {
			let reqBaseURL = req.protocol + '://' + req.headers.host + '/';

			mod_self.social.url = reqBaseURL + encodeURI(mod_self.returnSlug());

			res.setHeader('Content-type', 'text/html');
			res.charset = 'UTF-8';

			let dream = req.query?.dream;
			let updated_social = mod_self.social;

			if (dream) {
				let dreamer = mod_self.app.crypto.base64ToString(dream);

				updated_social.title =
					mod_self.app.keychain.returnUsername(dreamer) + ' is swarmcasting on Saito 🟥';

				if (mod_self.dreams[dreamer]) {
					if (mod_self.dreams[dreamer]?.identifier) {
						updated_social.title = mod_self.dreams[dreamer].identifier;
					}
					if (mod_self.dreams[dreamer]?.description) {
						updated_social.description = mod_self.dreams[dreamer].description;
					}
				}
			}

			res.send(HomePage(app, mod_self, app.build_number, updated_social));
			return;
		};

		expressapp.get('/' + encodeURI(this.returnSlug()), serverFn);
		expressapp.get('/' + encodeURI('limbo'), serverFn);

		expressapp.post('/' + encodeURI('limbo'), async function (req, res) {
			let reqBaseURL = req.protocol + '://' + req.headers.host + '/';

			if (req.query?.action && req.query?.key) {
				mod_self.sendFailSafe(req.query.action, req.query.key);
			}
		});

		expressapp.use('/' + encodeURI(this.returnSlug()), express.static(webdir));
	}
}

module.exports = Limbo;
