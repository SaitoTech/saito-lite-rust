/**
 * This appears to hold the core code for connecting to peers over stun
 *
 */

const localforage = require('localforage');

class PeerManager {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.localStream = null; //My Video Feed
		this.presentationStream = null;
		this.remoteStreams = new Map(); //The video of the other parties

		this.videoEnabled = true;
		this.audioEnabled = true;
		this.recording = false;

		this.remain_in_call = true;


		app.connection.on('stun-toggle-video', async () => {
			// Turn off Video

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

						this.peers.forEach((peerConnection, key) => {
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
							//this.renegotiate(key);
						});
					} catch (err) {
						console.error(err);
					}
				} else {
					this.localStream.getVideoTracks()[0].enabled = true;
				}
			}

			let data = {
				room_code: this.mod.room_obj.room_code,
				type: 'toggle-video',
				enabled: this.videoEnabled,
				public_key: this.mod.publicKey
			};

			this.mod.sendStunMessageToPeersTransaction(
				data,
				this.app.options.stun.peers
			);
		});

		app.connection.on('stun-toggle-audio', async () => {
			this.audioEnabled = !this.audioEnabled;

			this.localStream.getAudioTracks().forEach((track) => {
				track.enabled = this.audioEnabled;
			});

			let data = {
				room_code: this.mod.room_obj.room_code,
				type: 'toggle-audio',
				public_key: this.mod.publicKey,
				enabled: this.audioEnabled
			};

			this.mod.sendStunMessageToPeersTransaction(
				data,
				this.app.options.stun.peers
			);
		});

		app.connection.on('begin-share-screen', async () => {
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
				videoTrack.onended = this.stopSharing.bind(this);

				this.mod.screen_share = true;

				/// emit event to make presentation be the large screen and make presentation mode on
				this.app.connection.emit(
					'add-remote-stream-request',
					'presentation',
					this.presentationStream
				);
				this.peers.forEach((pc, key) => {
					pc.dc.send('start-presentation');
					pc.addTrack(videoTrack);
				});
			} catch (err) {
				console.error('Error accessing media devices.', err);
			}
		});

		app.connection.on('stop-share-screen', async () => {
			console.log('no more');
			if (this.presentationStream) {
				this.presentationStream
					.getTracks()
					.forEach((track) => track.stop());
				this.stopSharing();
				this.presentationStream = null;
			}
		});

		//Launch the Stun call
		app.connection.on('start-stun-call', async () => {
			console.log('STUN: start-stun-call');

			this.firstConnect = true;

			console.log('STUN: ', this.mod.room_obj, this.app.options.stun);

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
					console.log('STUN: my peers, ', this.app.options.stun);
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

		//Chat-Settings saves whether to enter the room with mic/camera on/off
		app.connection.on('update-media-preference', (kind, state) => {
			if (kind === 'audio') {
				this.audioEnabled = state;
			} else if (kind === 'video') {
				this.videoEnabled = state;
			} else if (kind == 'ondisconnect') {
				this.remain_in_call = state;
			}
		});
	}


	async getLocalMedia() {
		if (this.localStream) {
			return;
		}

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

	updatePeers() {
		let _peers = [];
		this.peers.forEach((value, key) => {
			_peers.push(key);
		});

		this.app.options.stun.peers = _peers;

		console.log('My call list: ', _peers);

		this.app.storage.saveOptions();
	}


	sendSignalingMessage(data) {}

	getPeerConnection(public_key) {
		return this.peers.get(public_key);
	}
	leave() {
		if (this.presentationStream) {
			this.presentationStream.getTracks().forEach((track) => {
				track.stop();
			});
			this.stopSharing();
		}

		this.localStream.getTracks().forEach((track) => {
			track.stop();
			console.log('STUN: stopping track to leave call');
		});
		this.localStream = null; //My Video Feed

		let keys = [];
		this.peers.forEach((peerConnections, key) => {
			keys.push(key);
			peerConnections.close();
		});

		this.peers = new Map();

		this.app.options.stun.peers = [];
		this.app.storage.saveOptions();

		if (this.audioStreamAnalysis) {
			clearInterval(this.audioStreamAnalysis);
		}

		//
		// Reset parameters
		//
		this.videoEnabled = true;
		this.audioEnabled = true;
		this.recording = false;
		this.remain_in_call = true;

		let data = {
			room_code: this.mod.room_obj.room_code,
			type: 'peer-left',
			public_key: this.mod.publicKey
		};

		this.mod.sendStunMessageToPeersTransaction(data, keys);
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

	stopSharing() {
		console.log('Screen sharing stopped by user');
		this.app.connection.emit('remove-peer-box', 'presentation');
		this.app.connection.emit('stun-switch-view', 'focus');
		this.peers.forEach((pc, key) => {
			pc.dc.send('stop-presentation');
		});

		this.mod.screen_share = false;
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

		/*
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 1280;
    canvas.height = 720;

    const localVideo = document.createElement("video");
    localVideo.srcObject = this.localStream;
    localVideo.muted = true;
    localVideo.onloadedmetadata = () => localVideo.play();

    const remoteVideos = [];
    Array.from(this.remoteStreams.values()).forEach((c, index) => {
      const remoteVideo = document.createElement("video");
      remoteVideo.srcObject = c.remoteStream;
      remoteVideo.muted = true;
      remoteVideo.onloadedmetadata = () => remoteVideo.play();
      remoteVideos.push(remoteVideo);
    });

    const draw = () => {
      if (!this.recording) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const totalVideos = 1 + remoteVideos.length;

      const cols = Math.ceil(Math.sqrt(totalVideos));
      const rows = Math.ceil(totalVideos / cols);
      const localVideoRatio = localVideo.videoWidth / localVideo.videoHeight;
      const videoWidth = canvas.width / cols;

      let videoHeight;
      if (totalVideos == 2) {
        videoHeight = videoWidth / localVideoRatio;
      } else {
        videoHeight = canvas.height / rows;
      }

      ctx.drawImage(localVideo, 0, 0, videoWidth, videoHeight);

      if (totalVideos === 2) {
        remoteVideos.forEach((remoteVideo, index) => {
          const remoteVideoRatio = remoteVideo.videoWidth / remoteVideo.videoHeight;
          const x = ((index + 1) % cols) * videoWidth;
          let y = Math.floor((index + 1) / cols) * videoHeight;

          const adjustedHeight = videoWidth / remoteVideoRatio;
          y += (videoHeight - adjustedHeight) / 2;

          ctx.drawImage(remoteVideo, x, y, videoWidth, adjustedHeight);
        });
      } else {
        remoteVideos.forEach((remoteVideo, index) => {
          const x = ((index + 1) % cols) * videoWidth;
          const y = Math.floor((index + 1) / cols) * videoHeight;
          ctx.drawImage(remoteVideo, x, y, videoWidth, videoHeight);
        });
      }

      requestAnimationFrame(draw);
    };

    draw();
    */

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

module.exports = PeerManager;
