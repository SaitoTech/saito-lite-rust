const ModTemplate = require('../../lib/templates/modtemplate');
const StreamCapturer = require('../../lib/saito/ui/stream-capturer/stream-capturer');
const screenrecordWizard = require('./lib/screenrecord-wizard');
const ScreenRecordControls = require('./lib/screenrecord-lite-controls')
const lamejs = require('lamejs');
const VideoBox = require('../../lib/saito/ui/saito-videobox/video-box');


class Record extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.name = 'Screenrecord';
		this.slug = 'screenrecord';
		this.description = 'Recording Module';
		this.categories = 'Utilities Communications';
		this.class = 'utility';
		this.record_video = false;

		this.styles = ['/screenrecord/style.css'];
		this.streamData = [];
		this.chunks = [];
		this.mediaRecorder = null;
		this.is_capturing_stream = false;

		this.app.connection.on('screenrecord-update-stream', async (combinedStream) => {
			console.log('combined stream', combinedStream);
			try {
				if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
					this.mediaRecorder.requestData();
					await new Promise((resolve) => {
						this.mediaRecorder.onstop = resolve;
						this.mediaRecorder.stop();
					});
				}

				// Keep existing chunks, don't reset them
				await this.initializeMediaRecorder(this.chunks, combinedStream);
			} catch (error) {
				console.error('Error updating media recorder:', error);
			}
		});

		this.app.connection.on("interrupt-screen-recording", async ()=>{

			// Don't stop until the game ends...
			if (this.type === 'game') return;

			if (this?.mediaRecorder) {
				await this.stopRecording();
			}

		});
	}

	respondTo(type, obj) {
		if (type === 'record-actions') {
			this.attachStyleSheets();
			super.render(this.app, this);
			let is_recording = false;
			if (this.mediaRecorder) {
				is_recording = true;
			}

			return [
				{
					text: 'Record',
					icon: `fas fa-record-vinyl record-icon ${this.mediaRecorder ? 'recording' : ''}`,
					hook: `record-container ${this.mediaRecorder ? 'recording' : ''}`,
					callback: async function (app) {
						let { container, streams, useMicrophone, callbackAfterRecord, members } = obj;
						if (container) {
							if (!this.mediaRecorder) {
								let screenRecordWizard = new screenrecordWizard(this.app, this, {
									container,
									members,
									callbackAfterRecord,
									type: 'videocall'
								});
								screenRecordWizard.render();
							} else {
								this.stopRecording();
							}
						}
					}.bind(this)
				}
			];
		}

		if (type === 'screenrecord-videocall-limbo') {
			this.attachStyleSheets();
			super.render(this.app, this);
			let is_recording = false;
			if (this.mediaRecorder) {
				is_recording = true;
			}

			return {
				startStreamingVideoCall: async () => {
					try {
						this.videoCallStreamCapturer = new StreamCapturer(this.app, this, this.logo);
						let stream = this.videoCallStreamCapturer.captureVideoCallStreams(true);
						return stream;
					} catch (error) {
						console.log('error streaming video call', error);
					}
				},

				stopStreamingVideoCall: async () => {
					if (this.videoCallStreamCapturer) {
						this.videoCallStreamCapturer.stopCaptureVideoCallStreams();
						this.videoCallStreamCapturer = null;
					} else {
						console.log('No stream to stop?');
					}
				}
			};
		}
		if (type === 'screenrecord-game-limbo') {
			this.attachStyleSheets();
			super.render(this.app, this);
			let is_recording = false;
			if (this.mediaRecorder) {
				is_recording = true;
			}

			return {
				startStreamingGame: async (options) => {
					let stream;
					try {
						let { includeCamera, container } = options
						this.gameStreamCapturer = new StreamCapturer(this.app, this, this.logo);
						this.gameStreamCapturer.view_window = container
						stream = await this.gameStreamCapturer.captureGameStream(includeCamera);
						stream;

						this.is_streaming_game = true
						return stream
					} catch (error) {
						console.log('error streaming video call', error);
					}
				},

				stopStreamingGame: async () => {
					this.is_streaming_game = false
					if (this.gameStreamCapturer) {
						this.gameStreamCapturer.stopCaptureGameStream();
						this.gameStreamCapturer = null;
					} else {
						console.log('No stream to stop?');
					}
				},

				isCapturingStream: () => {
					if (this.gameStreamCapturer) {
						return this.gameStreamCapturer.is_capturing_stream
					} else {
						return false
					}

				}
			};
		}

		if (type === 'game-menu') {
			this.attachStyleSheets();
			if (!obj.recordOptions) return;
			if(obj.recordOptions.active === false){
				return;
			}
			let menu = {
				//id: 'game-share',
				//text: 'Share',
				submenus: []
			};

			menu.submenus.push({
				parent: 'game-share',
				text: 'Record game',
				id: 'record-stream',
				class: 'record-stream',
				callback: async function (app, game_mod) {
					let { container, callbackAfterRecord } = game_mod.recordOptions;
					if (!this.mediaRecorder) {
						let screenRecordWizard = new screenrecordWizard(this.app, this, {
							container,
							members: game_mod.game.players,
							callbackAfterRecord,
							type: 'game'
						});
						screenRecordWizard.render();
						game_mod.menu.hideSubMenus();
					} else {
						this.stopRecording();
					}
				}.bind(this)
			});

			return menu;
		}

		// if (type === "dream-controls") {
		// 	let audioEnabled = true;
		// 	let videoIcon = this.videoBox ? "fas fa-video" : "fas fa-video-slash";
		// 	let audioIcon =  audioEnabled ? "fas fa-microphone" : 'fas fa-microphone-slash';
		
		// 	const streams = this.app.modules.getRespondTos('media-request');
		
		// 	let x = [
		// 		{
		// 			text: `Video control`,
		// 			icon: videoIcon,
		// 			callback: (app, id, combined_stream) => {
		// 				const iconElement = document.querySelector(`#dream_controls_menu_item_${id} i`);
		// 				if (this.videoBox) {
		// 					this.removeVideoBox(true);
		// 					iconElement.classList.replace('fa-video', 'fa-video-slash');
		// 				} else {
		// 					this.getOrCreateVideoBox();
		// 					iconElement.classList.replace('fa-video-slash', 'fa-video');
		// 				}
		// 			},
		// 			style: ""
		// 		},
		// 		{
		// 			text: `Audio control`,
		// 			icon: audioIcon,
		// 			callback: (app, id, combined_stream) => {
		// 				const iconElement = document.querySelector(`#dream_controls_menu_item_${id} i`);
		// 				let audioEnabled;	
		// 				if(this.gameStreamCapturer.localStream){
		// 					audioEnabled = true
		// 				}else {
		// 					audioEnabled = false
		// 				}		
		// 				if (audioEnabled) {
		// 					iconElement.classList.replace('fa-microphone', 'fa-microphone-slash');
		// 					this.gameStreamCapturer.stopLocalAudio()
		// 				} else {
		// 					iconElement.classList.replace('fa-microphone-slash', 'fa-microphone');
		// 					this.gameStreamCapturer.getLocalAudio()
		// 				}
		// 			},
		// 			style: ""
		// 		}
		// 	];
		
		// 	// Hide icons if videocall streams exist
		// 	if (streams.length > 0) {
		// 		x.forEach(control => {
		// 			control.style = 'hidden-control';
		// 		});
		// 	}
		
		// 	return x;
		// }
	}

	async handlePeerTransaction(app, tx = null, peer, mycallback) {
		if (tx == null) {
			return;
		}
		let message = tx.returnMessage();

		if (message.module === 'screenrecord') {
			if (this.app.BROWSER === 1) {
				if (this.hasSeenTransaction(tx)) return;
				if (tx.isTo(this.publicKey) && !tx.isFrom(this.publicKey)) {
					if (message.request === 'start recording') {
						siteMessage(
							`${this.app.keychain.returnUsername(
								tx.from[0].publicKey
							)} started recording their screen`,
							1500
						);
						this.updateUIForRecordingStart();
					}
					if (message.request === 'stop recording') {
						siteMessage(
							`${this.app.keychain.returnUsername(
								tx.from[0].publicKey
							)} stopped recording their screen`,
							1500
						);
						this.updateUIForRecordingStop();
					}
				}
			}
		}
	}

	onConfirmation(blk, tx, conf) {
		if (tx == null) {
			return;
		}

		let message = tx.returnMessage();
		console.log(message.module, 'screenrecord');
		if (conf === 0) {
			if (message.module === 'screenrecord') {
				console.log('received information');
				if (this.app.BROWSER === 1) {
					if (this.hasSeenTransaction(tx)) return;

					if (tx.isTo(this.publicKey) && !tx.isFrom(this.publicKey)) {
						if (message.request === 'start recording') {
							siteMessage(
								`${this.app.keychain.returnUsername(
									tx.from[0].publicKey
								)} started recording their screen`,
								1500
							);
							this.updateUIForRecordingStart();
						}
						if (message.request === 'stop recording') {
							siteMessage(
								`${this.app.keychain.returnUsername(
									tx.from[0].publicKey
								)} stopped recording their screen`,
								1500
							);
							this.updateUIForRecordingStop();
						}

						// this.toggleNotification();
					}
				}
			}
		}
	}

	onPeerHandshakeComplete() {
		if (this.app.BROWSER === 1) {
			this.logo = new Image();
			this.logo.src = '/saito/img/logo.svg';
		}
	}

	async getOrCreateVideoBox(stream) {
		if (!this.videoBox) {
			const streams = this.app.modules.getRespondTos('media-request');
			if(streams.length > 0) return;
			
			this.localStream = await navigator.mediaDevices.getUserMedia({
				video: true
			});
			let stream_id = `stream_${this.publicKey}`
			this.videoBox = new VideoBox(this.app, this, this.publicKey);
			this.videoBox.render(this.localStream)
			let videoElement = document.querySelector('.video-box-container-large');
			if (videoElement) {
				videoElement.style.position = 'absolute';
				videoElement.style.top = '100px';
				videoElement.style.width = '350px';
				videoElement.style.height = '350px';
				videoElement.style.resize = "both"
				videoElement.style.overflow= "auto";
				videoElement.classList.add('game-video-box')
				this.app.browser.makeDraggable(stream_id);
			}
		}
		return this.videoBox;
	}

	removeVideoBox(forceRemove = false) {

		if (!forceRemove) {
			if (this.is_recording_game || this.is_streaming_game) {
				return
			}
			if (this.videoBox) {
				this.localStream.getTracks().forEach(track => {
					track.stop()
				})
				this.localStream = null
				this.videoBox.remove();
				this.videoBox = null;
			}
		} else {
			if (this.videoBox) {
				this.localStream.getTracks().forEach(track => {
					track.stop()
				})
				this.localStream = null
				this.videoBox.remove();
				this.videoBox = null;
			}

		}


	}

	async initializeMediaRecorder(existingChunks, stream) {
		this.chunks = [];
		let mimeType =
			stream.getVideoTracks().length > 0
				? 'video/webm; codecs="vp8, opus"'
				: 'audio/webm; codecs="opus"';

		let options = {
			mimeType: mimeType,
			videoBitsPerSecond: stream.getVideoTracks().length > 0 ? 1.5 * 1024 * 1024 : undefined,
			audioBitsPerSecond: 320 * 1024
		};

		try {
			if (MediaRecorder.isTypeSupported(mimeType)) {
				this.mediaRecorder = new MediaRecorder(stream, options);
			} else {
				console.warn(`${mimeType} is not supported, using default codec`);
				this.mediaRecorder = new MediaRecorder(stream);
			}

			this.mediaRecorder.onstart = (event) => {
				console.log('media recorder started');
			};
			this.mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					console.log('new data available', event.data);
					this.chunks.push(event.data);
				}
			};

			this.mediaRecorder.start();
		} catch (error) {
			console.error('Error creating MediaRecorder:', error);
			throw error;
		}
	}

	async startRecording(options) {
		let { container, members, callbackAfterRecord, type, includeCamera } = options;
		console.log(options, "options")

		// initialize variables
		this.type = type;
		this.members = members;

		if (type === 'videocall') {
			this.recorderVideoCallStreamCapture = new StreamCapturer(this.app, this, this.logo);
			this.recorderVideoCallStreamCapture.view_window = '.video-container-large';
			let stream = this.recorderVideoCallStreamCapture.captureVideoCallStreams(includeCamera);
			this.initializeMediaRecorder(this.chunks, stream);
		} else if (type === "game") {
			let stream;
			this.gameRecordCapturer = new StreamCapturer(this.app, this, this.logo);
			this.gameRecordCapturer.view_window = container;
			this.is_recording_game = true;
			stream = await this.gameRecordCapturer.captureGameStream(includeCamera);
			this.initializeMediaRecorder(this.chunks, stream);

			// show controls
			this.screenrecordControls = new ScreenRecordControls(this.app, this)
			this.screenrecordControls.render()
			let recordButton = document.getElementById('record-stream');
			if (recordButton) {
				recordButton.textContent = 'Stop recording';
			}
		}

		this.sendStartRecordingTransaction(members);
		this.updateUIForRecordingStart();
	}

	async downloadMedia(url, type, callbackAfterRecord) {
		let defaultFileName = type === 'video' ? 'saito_video.webm' : 'saitio_audio.mp3';
		let placeholder = type === 'video' ? 'saito_video' : 'saito_audio';
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = url;
		const fileName =
			(await sprompt('Please enter a recording name', placeholder)) || defaultFileName;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		setTimeout(() => {
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}, 100);
		// if (callbackAfterRecord) {
		// 	callbackAfterRecord(blob);
		// }
		// this.callbackAfterStopRecording()
	}

	async processAudio(blob) {
		const audioContext = new (window.AudioContext || window.webkitAudioContext)();
		const arrayBuffer = await blob.arrayBuffer();
		const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
		const mp3Encoder = new lamejs.Mp3Encoder(1, audioBuffer.sampleRate, 128);
		const samples = audioBuffer.getChannelData(0);
		const mp3Data = [];
		const int16Samples = new Int16Array(samples.length);
		for (let i = 0; i < samples.length; i++) {
			int16Samples[i] = samples[i] * 32767; // Convert float to int16
		}
		for (let i = 0; i < int16Samples.length; i += 576) {
			const chunk = int16Samples.subarray(i, i + 576);
			const mp3buf = mp3Encoder.encodeBuffer(chunk);
			if (mp3buf.length > 0) {
				mp3Data.push(new Int8Array(mp3buf));
			}
		}
		const mp3buf = mp3Encoder.flush();
		if (mp3buf.length > 0) {
			mp3Data.push(new Int8Array(mp3buf));
		}
		const mp3Blob = new Blob(mp3Data, { type: 'audio/mp3' });
		const url = URL.createObjectURL(mp3Blob);
		return url;
	}

	async stopRecording() {
		if (this.recorderVideoCallStreamCapture) {
			this.recorderVideoCallStreamCapture.stopCaptureVideoCallStreams();
			this.recorderVideoCallStreamCapture = null;
		}

		console.log(this.gameStreamCapturer, "gameStreamCapturer")
		if (this.gameRecordCapturer) {
			this.is_recording_game = false
			this.gameRecordCapturer.stopCaptureGameStream()
			this.gameRecordCapturer = null
		}

		if (this.screenrecordControls) {
			this.screenrecordControls.remove();
			this.screenrecordControls = null;
		}

		if (this.mediaRecorder) {
			let fn = () => {
				return new Promise((resolve, reject) => {
					try {
						this.mediaRecorder.onstop = async () => {
							const blob = new Blob(this.chunks, { type: 'video/webm' });
							const hasVideo = this.chunks.some(
								(chunk) => chunk.type.includes('video') || chunk.type === 'video/webm'
							);

							if (hasVideo) {
								console.log('chunk has video', this.chunks);
								const url = URL.createObjectURL(blob);
								// const url = await this.processVideo(this.chunks);
								await this.downloadMedia(url, 'video');
								resolve();
							} else {
								let url = await this.processAudio(blob);
								await this.downloadMedia(url, 'audio');
								resolve();
							}
						};
					} catch (error) {
						reject();
					}

					this.mediaRecorder.stop();
				});
			};

			await fn();
			this.mediaRecorder = null;
		}
		// if (this.localStream) {
		// 	this.localStream.getTracks().forEach((track) => track.stop());
		// 	this.localStream = null;
		// }

		// this.removeVideoBox()

		this.updateUIForRecordingStop();
		this.sendStopRecordingTransaction(this.members);

		this.mediaRecorder = null;
		this.members = [];


	}

	async sendStartRecordingTransaction(keys) {
		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);
		try {
			newtx.msg = {
				module: 'screenrecord',
				request: 'start recording'
			};
			for (let peer of keys) {
				if (peer != this.publicKey) {
					newtx.addTo(peer);
				}
			}

			await newtx.sign();

			this.app.connection.emit('relay-transaction', newtx);
			this.app.network.propagateTransaction(newtx);
		} catch (error) {
			console.log('error sending start recording transaction', error);
		}
	}

	async sendStopRecordingTransaction(keys) {
		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

		newtx.msg = {
			module: 'screenrecord',
			request: 'stop recording'
		};

		for (let peer of keys) {
			if (peer != this.publicKey) {
				newtx.addTo(peer);
			}
		}

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
	}

	updateUIForRecordingStart() {
		const recordIcon = document.querySelector('.fa-record-vinyl');
		if (recordIcon) {
			console.log('updating UI for recording start');
			recordIcon.classList.add('recording');
			recordIcon.parentElement.classList.add('recording');
		}
	}

	updateUIForRecordingStop() {
		const recordIcon = document.querySelector('.fa-record-vinyl');
		if (recordIcon) {
			recordIcon.classList.remove('recording');
			recordIcon.parentElement.classList.remove('recording');
		}

		const recordButtonGame = document.getElementById('record-stream');
		if (recordButtonGame) {
			recordButtonGame.textContent = 'Record game';
		}
	}
}

module.exports = Record;
