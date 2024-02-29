const VideoBox = require('./../../lib/saito/ui/saito-videobox/video-box');
const ModTemplate = require('../../lib/templates/modtemplate');

class Screenrecord extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.name = "Screenrecord";
		this.chunks = [];
		this.localStream = null; // My Video Feed
		this.mediaRecorder = null;
		this.canvasStream = null; // The stream from the canvas
	}

	respondTo(type, obj) {
		let mod_self = this;

		if (type === 'call-actions') {
			return [
				{
					text: 'Record',
					icon: 'fa-solid fa-record-vinyl',
					callback: function (app, public_key, id = '') {}
				}
			];
		}

		//
		//Game-Menu passes the game_mod as the obj, so we can test if we even want to add the option
		//
		if (type == 'game-menu') {
			return {
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
								mod_self.streamManager.stop();
								document.getElementById(
									'record-stream'
								).textContent = 'Start Recording';
							} else {
								mod_self.streamManager.record(game_mod.game.players);
								document.getElementById(
									'record-stream'
								).textContent = 'Stop Recording';
							}
						}
					}
				]
			};
		}

		return super.respondTo(type, obj);
	}

	async record(keylist) {
		
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

		//
		// Attempt to stream of the screen -- user has to select it
		// this should include any displayed video and audio...
		//

		let screenStream = null;

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
			salert('Screen recording permission is required.');
			this.stop();
			return;
		}


		// Set up the media recorder with the canvas stream
		// Create a new stream for the combined video and audio
		const combinedStream = new MediaStream();

		// Add the audio tracks from the screen and camera to the combined stream
		screenStream
			.getTracks()
			.forEach((track) => combinedStream.addTrack(track));

		if (this.localStream && this.localStream.getAudioTracks().length > 0) {
			combinedStream.addTrack(this.localStream.getAudioTracks()[0]);
		}

		this.mediaRecorder = new MediaRecorder(combinedStream, {
			mimeType: 'video/webm'
		});

		// When data is available, push it to the chunks array
		this.mediaRecorder.ondataavailable = (e) => {
			if (e.data.size > 0) {
				this.chunks.push(e.data);
			}
		};

		// When the recording stops, create a video file
		this.mediaRecorder.onstop = async () => {
			screenStream.getTracks().forEach((track) => track.stop());

			const completeBlob = new Blob(this.chunks, { type: 'video/webm' });
			const defaultFileName = 'saito_video.webm';
			const fileName =
				(await sprompt(
					'Please enter a recording name',
					'saito_video'
				)) || defaultFileName;

			const videoURL = window.URL.createObjectURL(completeBlob);

			const downloadLink = document.createElement('a');
			document.body.appendChild(downloadLink);
			downloadLink.style = 'display: none';
			downloadLink.href = videoURL;
			downloadLink.download = fileName;
			downloadLink.click();

			downloadLink.remove();
			window.URL.revokeObjectURL(videoURL);

			this.sendStopRecordingTransaction(keylist);
			this.chunks = [];
		};

		this.sendStartRecordingTransaction(keylist);


		// Start recording
		this.mediaRecorder.start();

	}

	async stop() {
		console.log('Stop recording!');

		if (this.mediaRecorder) {
			this.mediaRecorder.stop();
			this.mediaRecorder = null;
		}

		if (this.localStream && !this.externalMediaControl) {
			this.localStream.getTracks().forEach((track) => track.stop());
			this.localStream = null;
		}
		if (this.canvasStream) {
			this.canvasStream.getTracks().forEach((track) => track.stop());
			this.canvasStream = null;
		}
		if (this.videoBox) {
			this.videoBox.remove();
			this.videoBox = null;
		}
	}

	async sendStartRecordingTransaction(keys){
		let newtx =	await this.app.wallet.createUnsignedTransactionWithDefaultFee();

		newtx.msg = {
			module: 'Screenrecord',
			request: 'start recording',
		};

		for (let peer of keys){
			if (peer != this.publicKey){
				newtx.addTo(peer);
			}
		}

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
	}

	async sendStopRecordingTransaction(keys){
		let newtx =	await this.app.wallet.createUnsignedTransactionWithDefaultFee();

		newtx.msg = {
			module: 'Screenrecord',
			request: 'stop recording',
		};

		for (let peer of keys){
			if (peer != this.publicKey){
				newtx.addTo(peer);
			}
		}

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
			if (message.module === 'Screenrecord') {
				if (this.app.BROWSER === 1) {
					if (this.hasSeenTransaction(tx)) return;

					if (tx.isTo(this.publicKey) && !tx.isFrom(this.publicKey)) {
						if (message.request === "start recording"){
							siteMessage(`${this.app.keychain.returnUsername(tx.from[0].publicKey)} started recording their screen`, 1500);
						}
						if (message.request === "stop recording"){
							siteMessage(`${this.app.keychain.returnUsername(tx.from[0].publicKey)} stopped recording their screen`, 1500);
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
				if (this.hasSeenTransaction(tx)) return;

				if (txmsg.module !== this.name) {
					return;
				}

				if (txmsg.request === "start recording"){
					siteMessage(`${this.app.keychain.returnUsername(tx.from[0].publicKey)} started recording their screen`, 1500);
				}
				if (txmsg.request === "stop recording"){
					siteMessage(`${this.app.keychain.returnUsername(tx.from[0].publicKey)} stopped recording their screen`, 1500);
				}

			}
		}

		return super.handlePeerTransaction(app, tx, peer, mycallback);
	}


}

module.exports = Screenrecord;

