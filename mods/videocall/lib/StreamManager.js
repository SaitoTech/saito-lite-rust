/**
 * This appears to hold the core code for connecting to peers over stun
 *
 */

const localforage = require('localforage');

class StreamManager {
	constructor(app, mod, settings) {
		this.app = app;
		this.mod = mod;
		this.localStream = null; //My Video Feed
		this.presentationStream = null;
		this.remoteStreams = new Map(); //The video of the other parties

		this.videoEnabled = true;
		this.audioEnabled = true;
		this.auto_disconnect = false;
		this.active = true;

		this.updateSettings(settings);

		this.recording = false;

		app.connection.on('stun-toggle-video', async () => {
			// Turn off Video
			if (!this.active) { return; }

			if (this.videoEnabled === true) {
				if (!this.localStream.getVideoTracks()[0]) return;
				this.localStream.getVideoTracks()[0].enabled = false;
				this.videoEnabled = false;
			} else {
				// Turn on Video

				this.videoEnabled = true;

				if (!this.localStream.getVideoTracks()?.length) {
					try {
						const newLocalStream =
							await navigator.mediaDevices.getUserMedia({
								video: true
							});

						const videoTrack = newLocalStream.getVideoTracks()[0];
						this.localStream.addTrack(videoTrack);

						// Add new track to the local stream
						this.app.connection.emit(
							'add-local-stream-request',
							this.localStream
						);

						for (let peer of this.app.options.stun.peers){
							let peerConnection = this.mod.stun.peers.get(peer);
							const videoSenders = peerConnection
								.getSenders()
								.filter(
									(sender) =>
										sender.track &&
										sender.track.kind === 'video'
								);
							if (videoSenders.length > 0) {
								videoSenders.forEach((sender) => {
									sender.replaceTrack(videoTrack);
								});
							} else {
								peerConnection.addTrack(videoTrack);
							}
							//this.renegotiate(peer);
						}
					} catch (err) {
						console.error(err);
					}
				} else {
					this.localStream.getVideoTracks()[0].enabled = true;
				}
			}

			let data = {
				enabled: this.videoEnabled,
				public_key: this.mod.publicKey
			};

			this.mod.sendOffChainMessage("toggle-video", data);
		});

		app.connection.on('stun-toggle-audio', async () => {
			if (!this.active) { return; }

			this.audioEnabled = !this.audioEnabled;

			this.localStream.getAudioTracks().forEach((track) => {
				track.enabled = this.audioEnabled;
			});

			let data = {
				public_key: this.mod.publicKey,
				enabled: this.audioEnabled
			};

			this.mod.sendOffChainMessage("toggle-audio", data);
		});

		app.connection.on('begin-share-screen', async () => {
			if (!this.active) { return; }

			try {
				console.log('Start');
				this.presentationStream =
					await navigator.mediaDevices.getDisplayMedia({
						video: {
							displaySurface: 'window'
						},
						preferCurrentTab: false,
						selfBrowserSurface: 'exclude',
						surfaceSwitching: 'include',
						monitorTypeSurfaces: 'exclude'
					});
				let videoTrack = this.presentationStream.getVideoTracks()[0];
				videoTrack.onended = this.endPresentation.bind(this);

				this.mod.screen_share = true;
				await this.mod.sendOffChainMessage("screen-share-start", {});

				/// emit event to make presentation be the large screen and make presentation mode on
				this.app.connection.emit(
					'add-remote-stream-request',
					'presentation',
					this.presentationStream
				);

				console.log("Share screen with friends: ", this.app.options.stun.peers, this.mod.stun.peers);
				this.mod.stun.peers.forEach((pc, key) => {
					console.log(key);
					for (let peer of this.app.options.stun.peers){
						let peerConnection = this.mod.stun.peers.get(peer);
						console.log("Add Track");
						peerConnection.addTrack(videoTrack);	

					}
				});

			} catch (err) {
				console.error('Error accessing media devices.', err);
			}
		});

		app.connection.on('stop-share-screen', () => {
			if (!this.active) { return; }

			console.log('no more');
			this.endPresentation();
		});


		app.connection.on('stun-connection-connected', (peerId)=> {
			if (!this.active) { return; }

			if (!this.mod?.room_obj || !this.app.options.stun.peers.includes(peerId)){
				return;
			}

			console.log('stun-connection-connected');
			if (this.firstConnect){
				let sound = new Audio('/videocall/audio/enter-call.mp3');
				sound.play();
				this.firstConnect = false;
			}

			this.mod.sendOffChainMessage("toggle-audio", {
				public_key: this.mod.publicKey,
				enabled: this.audioEnabled
			});

			this.mod.sendOffChainMessage("toggle-video", {
				public_key: this.mod.publicKey,
				enabled: this.videoEnabled
			});

		});

		app.connection.on("stun-track-event", (peerId, event) => {
			if (!this.active) { return; }

			const remoteStream = new MediaStream();
			console.log('STUN: another remote stream added', event.track);

			if (peerId == this.mod.screen_share) {
				console.log("Expecting presentation stream");
				remoteStream.addTrack(event.track);
				this.app.connection.emit(
					'add-remote-stream-request',
					'presentation',
					remoteStream
				);

			} else {
				if (event.streams.length === 0) {
					remoteStream.addTrack(event.track);
				} else {
					event.streams[0].getTracks().forEach((track) => {
						remoteStream.addTrack(track);
					});
				}

				this.remoteStreams.set(peerId, {
					remoteStream
				});
				this.app.connection.emit(
					'add-remote-stream-request',
					peerId,
					remoteStream
				);

				if (remoteStream.getAudioTracks()?.length) {
					this.analyzeAudio(remoteStream, peerId);
				}
			}
		});

		//Launch the Stun call
		app.connection.on('start-stun-call', async () => {
			if (!this.active) { return; }

			console.log('STUN: start-stun-call', this.mod.room_obj, this.app.options.stun);
			this.firstConnect = true;

			//Render the UI component
			this.app.connection.emit(
				'show-call-interface',
				this.videoEnabled,
				this.audioEnabled
			);

			await this.getLocalMedia();

			//Plug local stream into UI component
			this.app.connection.emit(
				'add-local-stream-request',
				this.localStream
			);

			//
			// The person who set up the call is the "host", and we have to wait for peopel to join us in order to create
			// peer connections, but if we reconnect, or refresh, we have saved in local storage the people in our call
			//
			if (this.mod.room_obj.host_public_key === this.mod.publicKey) {
				if (this.app.options?.stun && !this.mod.room_obj?.ui) {
					console.log('STUN HOST: my peers, ', this.app.options.stun);
					for (peer of this.app.options.stun.peers) {
						if (peer !== this.mod.publicKey) {
							this.mod.sendCallEntryTransaction(peer);
							break;
						}
					}
				}
			} else {
				// send ping transaction
				this.mod.sendCallEntryTransaction();
			}

			let sound = new Audio('/videocall/audio/enter-call.mp3');
			sound.play();

			this.analyzeAudio(this.localStream, 'local');
		});

		app.connection.on("stun-new-peer-connection", (publicKey, peerConnection) => {
			if (!this.active) { return; }

			console.log("New Stun peer connection");
			if (this.app.options.stun.peers.includes(publicKey)){
				console.log("Attach my video!");
				this.localStream.getTracks().forEach((track) => {
					peerConnection.addTrack(track, this.localStream);
				});
			}	
		});

		app.connection.on('stun-disconnect', () => {
			if (!this.active) { return; }

			this.leaveCall();
		});

	}

	updateSettings(settings){
		this.videoEnabled = settings.video;
		this.audioEnabled = settings.audio;
		this.auto_disconnect = settings?.auto_disconnect;
	}

	async getLocalMedia() {
		if (this.localStream) {
			return;
		}

		console.log(this.videoEnabled, this.audioEnabled);

		//Get my local media
		try {
			this.localStream = await navigator.mediaDevices.getUserMedia({
				video: this.videoEnabled,
				audio: true
			});
		} catch (err) {
			console.warn('Problem attempting to get User Media', err);
			console.log('Trying without video');

			this.videoEnabled = false;
			this.localStream = await navigator.mediaDevices.getUserMedia({
				video: false,
				audio: true
			});
		}

		if (this.videoEnabled) {
			this.localStream.getVideoTracks().forEach((track) => {
				track.applyConstraints({
					width: { min: 640, /*ideal: 900,*/ max: 1280 },
					height: { min: 400, max: 720 },
					aspectRatio: { ideal: 1.333333 }
				});
			});
		}

		this.localStream.getAudioTracks().forEach((track) => {
			track.enabled = this.audioEnabled;
		});
	}

	removePeer(peer){

		this.remoteStreams.delete(peer);

		if (this.auto_disconnect){
			siteMessage(`${this.app.keychain.returnUsername(peer)} hung up`, 2500);
			this.app.connection.emit("stun-disconnect");
		}else{
			siteMessage(`${this.app.keychain.returnUsername(peer)} left the meeting`, 2500);
		}
	}

	async leaveCall() {
		console.log("STUN: Hanging up...");

		this.endPresentation();

		await this.mod.sendCallDisconnectTransaction();

		this.localStream.getTracks().forEach((track) => {
			track.stop();
			console.log('STUN: stopping track to leave call');
		});

		this.localStream = null; //My Video Feed

		this.app.connection.emit('reset-stun');

		//
		// Reset parameters
		//
		this.videoEnabled = true;
		this.audioEnabled = true;
		this.recording = false;
		this.auto_disconnect = false;
		this.active = false;
		if (this.audioStreamAnalysis) {
			clearInterval(this.audioStreamAnalysis);
		}

	}

	analyzeAudio(stream, peer) {
		let peer_manager_self = this;

		const audioContext = new AudioContext();
		const source = audioContext.createMediaStreamSource(stream);
		const analyser = audioContext.createAnalyser();
		source.connect(analyser);
		analyser.fftSize = 512;
		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);

		let has_mike = false;
		const threshold = 20;

		function update() {
			analyser.getByteFrequencyData(dataArray);
			const average = dataArray.reduce((a, b) => a + b) / bufferLength;

			if (average > threshold && !has_mike) {
				this.current_speaker = peer;

				setTimeout(() => {
					if (peer === this.current_speaker) {
						peer_manager_self.app.connection.emit(
							'stun-new-speaker',
							peer
						);
						has_mike = true;
					}
				}, 1000);
			} else if (average <= threshold) {
				has_mike = false;
			}
		}
		this.audioStreamAnalysis = setInterval(update, 1000);
	}

	endPresentation() {
		console.log('Screen sharing stopped by user');
		this.app.connection.emit('remove-peer-box', 'presentation');
		this.app.connection.emit('stun-switch-view', 'focus');
		this.mod.screen_share = false;

		this.mod.sendOffChainMessage("screen-share-stop");

		if (this.presentationStream) {
			this.presentationStream.getTracks()
				.forEach((track) => track.stop());
		}

		this.presentationStream = null;
	}

	async recordCall() {
		const start_recording = await sconfirm(
			'Are you sure you want to start recording?'
		);
		if (!start_recording) return false;

		this.recording = true;
		this.chunks = [];

		this.peers.forEach((pc, key) => {
			pc.dc.send('start-recording');
		});

		const audioContext = new AudioContext();
		const audioDestination = audioContext.createMediaStreamDestination();


		[
			this.localStream,
			...Array.from(this.remoteStreams.values()).map(
				(c) => c.remoteStream
			)
		].forEach((stream) => {
			const source = audioContext.createMediaStreamSource(stream);
			source.connect(audioDestination);
		});

		/*const combinedStream = new MediaStream([
      ...audioDestination.stream.getTracks(),
      ...canvas.captureStream(30).getTracks(),
    ]);*/

		let screenStream = await navigator.mediaDevices.getDisplayMedia({
			video: {
				displaySurface: 'browser'
			},
			preferCurrentTab: true,
			selfBrowserSurface: 'include',
			monitorTypeSurfaces: 'exclude'
		});

		const combinedStream = new MediaStream([
			...audioDestination.stream.getTracks(),
			...screenStream.getTracks()
		]);

		this.mediaRecorder = new MediaRecorder(combinedStream);

		this.mediaRecorder.start();
		this.mediaRecorder.ondataavailable = (e) => {
			if (e.data.size > 0) {
				this.chunks.push(e.data);
			}
		};

		this.mediaRecorder.onstop = async () => {
			const blob = new Blob(this.chunks, { type: 'video/webm' });
			const defaultFileName = 'recorded_call.webm';
			const fileName =
				(await sprompt(
					'Please enter a recording name',
					'recorded_call'
				)) || defaultFileName;

			// Create an object URL for the Blob
			const videoUrl = window.URL.createObjectURL(blob);

			const downloadLink = document.createElement('a');
			document.body.appendChild(downloadLink);
			downloadLink.style = 'display: none';
			downloadLink.href = videoUrl;
			downloadLink.download = fileName;
			downloadLink.click();

			window.URL.revokeObjectURL(videoUrl);
			downloadLink.remove();
			// Stop the audio context
			if (audioContext.state !== 'closed') {
				audioContext.close();
			}

			screenStream.getTracks().forEach((track) => track.stop());

			// Reset recording flag
			this.recording = false;
		};

		return true;
	}

	stopRecordCall() {
		this.mediaRecorder.stop();
		this.recording = false;
	}
}

module.exports = StreamManager;
