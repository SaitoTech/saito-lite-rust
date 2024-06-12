
const ModTemplate = require('../../lib/templates/modtemplate');
const VideoBox = require('../../lib/saito/ui/saito-videobox/video-box');

class Record extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.name = 'Record';
		this.description = 'Recording Module';
		this.categories = 'Utilities Communications';
		this.class = 'utility';
		this.record_video = false;

		this.styles = ['/saito/saito.css', '/record/style.css'];
		this.interval = null;
	}

	respondTo(type, obj) {
		if (type === 'record-actions') {
			this.attachStyleSheets();
			super.render(this.app, this);

			return [
				{
					text: 'Record',
					icon: 'fas fa-record-vinyl record-icon',
					callback: async function (app) {
						let { container, streams, useMicrophone, callbackAfterRecord, members } = obj;

						if (container) {
							if (!this.mediaRecorder) {
								await this.startRecording(container, members, callbackAfterRecord);
							} else {
								this.stopRecording();
							}
						}
					}.bind(this)
				}
			];
		}
		if (type === 'game-menu') {
			if (!obj.recordOptions) return;
			let menu = {
				id: 'game-game',
				text: 'Game',
				submenus: [],
			};

			menu.submenus.push({
				parent: 'game-game',
				text: "Record game",
				id: 'record-stream',
				class: 'record-stream',
				callback: async function (app, game_mod) {
					let recordButton = document.getElementById('record-stream');
					let { container, callbackAfterRecord } = game_mod.recordOptions;
					if (!this.mediaRecorder) {
						await this.startRecording(container, [], callbackAfterRecord);
						recordButton.textContent = "Stop recording";
					} else {
						this.mediaRecorder.stop();
						this.stopRecording()
					}
				}.bind(this)
			});

			return menu;
		}

	}

	onConfirmation(blk, tx, conf) {
		if (tx == null) {
			return;
		}

		let message = tx.returnMessage();

		if (conf === 0) {
			if (message.module === 'record') {
				if (this.app.BROWSER === 1) {
					if (this.hasSeenTransaction(tx)) return;

					if (tx.isTo(this.publicKey) && !tx.isFrom(this.publicKey)) {
						if (message.request === "start recording") {
							siteMessage(`${this.app.keychain.returnUsername(tx.from[0].publicKey)} started recording their screen`, 1500);
						}
						if (message.request === "stop recording") {
							siteMessage(`${this.app.keychain.returnUsername(tx.from[0].publicKey)} stopped recording their screen`, 1500);
						}

						this.toggleNotification();
					}

				}
			}
		}
	}


	async startRecording(container, members = [], callbackAfterRecord = null,) {

		this.localStream = null;
		this.externalMediaControl = false;

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

					try {
						// document.documentElement.requestFullscreen();
						this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
					} catch (error) {
						console.error("Failed to get user media:", error);
						alert("Failed to access camera and microphone.");
						return;
					}
	

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


		let chunks = [];
		const targetDiv = document.querySelector(container);
		console.log(container, targetDiv, "containers")

		function updateDimensions() {
			const { top, left, width, height } = targetDiv.getBoundingClientRect();

			return { top, left, width, height };
		}

		let { top, left, width, height } = updateDimensions();
		console.log(`Div dimensions - Top: ${top}, Left: ${left}, Width: ${width}, Height: ${height}`);
		this.screenStream = null;
		try {
			this.screenStream = await navigator.mediaDevices.getDisplayMedia({
				video: {
					displaySurface: 'browser',
					mediaSource: "window"
				},
				audio: true,
				preferCurrentTab: true,
				selfBrowserSurface: 'include',
				monitorTypeSurfaces: 'include'
			});
		}

		catch (error) {
			console.error('Error fetching display media:', error);
			this.showAlert("Error fetching display media")
			return;
		}


		// this.screenStream.getVideoTracks()[0].addEventListener('ended', () => {
		// 	console.log('Screen sharing stopped.');
		// 	this.stopRecording()
		// });

		this.screenStream
			.getTracks().forEach((track) => {
				track.onended = () => {
					console.log('onended', this,)
					this.stopRecording();
				}
			});

			const video = document.createElement('video');
			video.srcObject = this.screenStream;
			video.style.display = 'none'; // Hide the video element
			video.play();
			
			document.body.appendChild(video);

		document.body.appendChild(video);

		// Create a canvas element to draw the wanted portion of the video
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.width = width;
		canvas.height = height;
		const self = this

		video.onloadedmetadata = () => {
			function draw() {
				let { top, left, width, height } = updateDimensions();
				const titleBarHeight = self.getTitleBarHeight(); 
			
				const canvasWidth = width;
				const canvasHeight = height - titleBarHeight;
				canvas.width = canvasWidth;
				canvas.height = canvasHeight;
			
				const scaleX = video.videoWidth / window.innerWidth;
				const scaleY = video.videoHeight / window.innerHeight;
			
				const scaledWidth = canvasWidth * scaleX;
				const scaledHeight = canvasHeight * scaleY;
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			
				const srcX = left * scaleX;
				const srcY = (top + titleBarHeight) * scaleY;
			
				const clipWidth = Math.min(scaledWidth, video.videoWidth - srcX);
				const clipHeight = Math.min(scaledHeight, video.videoHeight - srcY);
			
				ctx.drawImage(video, srcX, srcY, clipWidth, clipHeight, 0, 0, canvas.width, canvas.height);
				self.animation_id = requestAnimationFrame(draw);
			}
			draw();


		};
		targetDiv.addEventListener('dragstart', (event) => {
			event.dataTransfer.setData('text/plain', null);
		});

		targetDiv.addEventListener('drag', (event) => {
			if (event.clientX > 0 && event.clientY > 0) {
				let { top, left, width, height } = updateDimensions();
				canvas.width = width;
				canvas.height = height;
			}
		});

		targetDiv.addEventListener('dragend', (event) => {
			let { top, left, width, height } = updateDimensions();
			canvas.width = width;
			canvas.height = height;
		});


		window.addEventListener('resize', updateDimensions);
		window.addEventListener('orientationchange', updateDimensions);
		let recordedStream = canvas.captureStream();



		const combinedStream = new MediaStream([...recordedStream.getTracks()]);

		if (this.localStream) {
			let streams = [this.localStream]
			console.log(this.localStream, this.additionalSources, "local and addtional sources")
			if (this.additionalSources) {
				this.additionalSources.forEach(stream => streams.push(stream))
			}
			const audioTracks = this.getAudioTracksFromStreams(streams);
			audioTracks.forEach(track => combinedStream.addTrack(track));
		}



		try {
			const mimeType = this.getSupportedMimeType();
			if (!mimeType) {
				throw new Error('No supported MIME type found for MediaRecorder');
			}
			this.mediaRecorder = new MediaRecorder(combinedStream, {
				mimeType: mimeType,
				videoBitsPerSecond: 25 * 1024 * 1024,
				audioBitsPerSecond: 320 * 1024
			});
		} catch (error) {
			console.log("Error creating media recorder", error);
		}

		this.mediaRecorder.ondataavailable = event => {
			if (event.data.size > 0) {
				chunks.push(event.data);
				if (callbackAfterRecord) {
					callbackAfterRecord(event.data);
				}
			}
		};

		this.mediaRecorder.onstop = async () => {
			const blob = new Blob(chunks, { type: 'video/webm' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			const defaultFileName = 'saito_video.webm';
			const fileName =
				(await sprompt(
					'Please enter a recording name',
					'saito_video'
				)) || defaultFileName;
			a.style.display = 'none';
			a.href = url;
			a.download = fileName
			document.body.appendChild(a);
			a.click();
			URL.revokeObjectURL(url);
			document.body.removeChild(video);
			if (members.length > 0) {
				this.sendStopRecordingTransaction(members);
			}

		};

		this.mediaRecorder.start();

		this.updateUIForRecordingStart()


		if (members.length > 0) {
			this.sendStartRecordingTransaction(members);
		}



	}


	// async startRecording(container, members = [], callbackAfterRecord = null) {
	// 	this.localStream = null;
	// 	this.externalMediaControl = false;
	
	// 	const otherParties = this.app.modules.getRespondTos('media-request');
	// 	if (otherParties.length > 0) {
	// 		this.localStream = otherParties[0].localStream;
	// 		this.additionalSources = otherParties[0].remoteStreams;
	// 		this.externalMediaControl = true;
	// 	} else {
	// 		let includeCamera = await sconfirm('Add webcam to stream?');
	
	// 		try {
	// 			if (includeCamera) {
	// 				try {
	// 					this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
	// 				} catch (error) {
	// 					console.error("Failed to get user media:", error);
	// 					alert("Failed to access camera and microphone.");
	// 					return;
	// 				}
	
	// 				this.videoBox = new VideoBox(this.app, this, 'local');
	// 				this.videoBox.render(this.localStream);
	// 				let videoElement = document.querySelector('.video-box-container-large');
	// 				videoElement.style.position = 'absolute';
	// 				videoElement.style.top = '100px';
	// 				videoElement.style.width = '350px';
	// 				videoElement.style.height = '350px';
	// 				this.app.browser.makeDraggable('stream_local');
	// 			} else {
	// 				this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
	// 			}
	// 		} catch (error) {
	// 			console.error('Access to user media denied: ', error);
	// 			salert('Recording will continue without camera and/or microphone input');
	// 		}
	// 	}
	
	// 	let chunks = [];
	// 	const targetDiv = document.querySelector(container);
	// 	console.log(container, targetDiv, "containers");
	
	// 	function updateDimensions() {
	// 		const { top, left, width, height } = targetDiv.getBoundingClientRect();
	// 		return { top, left, width, height };
	// 	}
	
	// 	let { top, left, width, height } = updateDimensions();
	// 	console.log(`Div dimensions - Top: ${top}, Left: ${left}, Width: ${width}, Height: ${height}`);
	// 	this.screenStream = null;
	// 	try {
	// 		this.screenStream = await navigator.mediaDevices.getDisplayMedia({
	// 			video: { displaySurface: 'browser', mediaSource: "window" },
	// 			audio: true,
	// 			preferCurrentTab: true,
	// 			selfBrowserSurface: 'include',
	// 			monitorTypeSurfaces: 'include'
	// 		});
	// 	} catch (error) {
	// 		console.error('Error fetching display media:', error);
	// 		this.showAlert("Error fetching display media");
	// 		return;
	// 	}
	
	// 	this.screenStream.getTracks().forEach((track) => {
	// 		track.onended = () => {
	// 			console.log('onended', this);
	// 			this.stopRecording();
	// 		};
	// 	});
	
	// 	const video = document.createElement('video');
	// 	video.srcObject = this.screenStream;
	// 	video.style.display = 'none'; // Hide the video element
	// 	video.play();
	// 	document.body.appendChild(video);
	
	// 	const canvas = document.createElement('canvas');
	// 	const ctx = canvas.getContext('2d');
	// 	canvas.width = width;
	// 	canvas.height = height;
	// 	const self = this;
	
	// 	video.onloadedmetadata = () => {
	// 		function draw() {
	// 			let { top, left, width, height } = updateDimensions();
	// 			const titleBarHeight = self.getTitleBarHeight(); 
	// 			const canvasWidth = width;
	// 			const canvasHeight = height - titleBarHeight;
	// 			canvas.width = canvasWidth;
	// 			canvas.height = canvasHeight;
	
	// 			const scaleX = video.videoWidth / window.innerWidth;
	// 			const scaleY = video.videoHeight / window.innerHeight;
	
	// 			const scaledWidth = canvasWidth * scaleX;
	// 			const scaledHeight = canvasHeight * scaleY;
	// 			ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	// 			const srcX = left * scaleX;
	// 			const srcY = (top + titleBarHeight) * scaleY;
	
	// 			const clipWidth = Math.min(scaledWidth, video.videoWidth - srcX);
	// 			const clipHeight = Math.min(scaledHeight, video.videoHeight - srcY);
	
	// 			ctx.drawImage(video, srcX, srcY, clipWidth, clipHeight, 0, 0, canvas.width, canvas.height);
	// 			self.animation_id = requestAnimationFrame(draw);
	// 		}
	// 		draw();
	// 	};
	
	// 	targetDiv.addEventListener('dragstart', (event) => {
	// 		event.dataTransfer.setData('text/plain', null);
	// 	});
	
	// 	targetDiv.addEventListener('drag', (event) => {
	// 		if (event.clientX > 0 && event.clientY > 0) {
	// 			let { top, left, width, height } = updateDimensions();
	// 			canvas.width = width;
	// 			canvas.height = height;
	// 		}
	// 	});
	
	// 	targetDiv.addEventListener('dragend', (event) => {
	// 		let { top, left, width, height } = updateDimensions();
	// 		canvas.width = width;
	// 		canvas.height = height;
	// 	});
	
	// 	window.addEventListener('resize', updateDimensions);
	// 	window.addEventListener('orientationchange', updateDimensions);
	// 	let recordedStream = canvas.captureStream();
	
	// 	const combinedStream = new MediaStream([...recordedStream.getTracks()]);
	
	// 	if (this.localStream) {
	// 		let streams = [this.localStream];
	// 		console.log(this.localStream, this.additionalSources, "local and additional sources");
	// 		if (this.additionalSources) {
	// 			this.additionalSources.forEach(stream => streams.push(stream));
	// 		}
	// 		const audioTracks = this.getAudioTracksFromStreams(streams);
	// 		audioTracks.forEach(track => combinedStream.addTrack(track));
	// 	}
	
	// 	try {
	// 		const mimeType = this.getSupportedMimeType();
	// 		if (!mimeType) {
	// 			throw new Error('No supported MIME type found for MediaRecorder');
	// 		}
	// 		this.mediaRecorder = new MediaRecorder(combinedStream, {
	// 			mimeType: mimeType,
	// 			videoBitsPerSecond: 25 * 1024 * 1024,
	// 			audioBitsPerSecond: 320 * 1024
	// 		});
	// 	} catch (error) {
	// 		console.log("Error creating media recorder", error);
	// 	}
	
	// 	this.mediaRecorder.ondataavailable = event => {
	// 		if (event.data.size > 0) {
	// 			chunks.push(event.data);
	// 			if (callbackAfterRecord) {
	// 				callbackAfterRecord(event.data);
	// 			}
	// 		}
	// 	};
	
	// 	this.mediaRecorder.onstop = async () => {
	// 		const blob = new Blob(chunks, { type: 'video/webm' });
	// 		const url = URL.createObjectURL(blob);
	// 		const a = document.createElement('a');
	// 		const defaultFileName = 'saito_video.webm';
	// 		const fileName = (await sprompt('Please enter a recording name', 'saito_video')) || defaultFileName;
	// 		a.style.display = 'none';
	// 		a.href = url;
	// 		a.download = fileName;
	// 		document.body.appendChild(a);
	// 		a.click();
	// 		URL.revokeObjectURL(url);
	// 		document.body.removeChild(video);
	// 		if (members.length > 0) {
	// 			this.sendStopRecordingTransaction(members);
	// 		}
	// 	};
	
	// 	this.mediaRecorder.start();
	// 	this.updateUIForRecordingStart();
	
	// 	if (members.length > 0) {
	// 		this.sendStartRecordingTransaction(members);
	// 	}
	// }
	

	 getSupportedMimeType() {
		const mimeTypes = [
			'video/webm; codecs=vp9',
			'video/webm; codecs=vp8',
			'video/webm; codecs=vp8,opus',
			'video/mp4',
			'video/x-matroska;codecs=avc1'
		];

		if(navigator.userAgent.includes("Firefox")){
			return 'video/webm; codecs=vp8,opus'
		}
	
		for (const mimeType of mimeTypes) {
			if (MediaRecorder.isTypeSupported(mimeType)) {
				return mimeType;
			}
		}
	
		return 'video/webm; codecs=vp8,opus'
	}
	getTitleBarHeight() {
		const userAgent = navigator.userAgent;
		if (userAgent.includes("Firefox")) {
			return this.isToolbarVisible() ? 105 : 0; 
		} 
		if (userAgent.includes("Safari") && !userAgent.includes("Chrome") && !userAgent.includes("CriOS")) {
			return this.isToolbarVisible() ? 90 : 0; 
		} else {
			return 0; 
		}
	}
	

	 isToolbarVisible() {

		const toolbarVisible = window.outerHeight - window.innerHeight > 50;
		console.log(window.outerHeight, window.innerHeight, "Is titlebar")
		return toolbarVisible;
	}
	



	async stopRecording() {

		if (this.mediaRecorder) {
			this.mediaRecorder.stop();
			this.mediaRecorder = null;
		}

		if (this.screenStream) {
			this.screenStream.getTracks().forEach(track => track.stop());
		}
		cancelAnimationFrame(this.animation_id);

		if (this.localStream && !this.externalMediaControl) {
			this.localStream.getTracks().forEach((track) => track.stop());
			this.localStream = null;
		}



		if (this.videoBox) {
			this.videoBox.remove();
			this.videoBox = null;
		}

		this.updateUIForRecordingStop()

		const recordButtonGame = document.getElementById('record-stream');
		if (recordButtonGame) {
			recordButtonGame.textContent = "record game";
		}

		// window.removeEventListener('resize', updateDimensions);
		// window.removeEventListener('orientationchange', updateDimensions);



	}





	getAudioTracksFromStreams(streams) {
		const audioTracks = [];
		streams.forEach(stream => {
			if (stream instanceof MediaStream) {
				audioTracks.push(...stream.getAudioTracks());
			}
		});
		return audioTracks;
	}

	async sendStartRecordingTransaction(keys) {
		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

		newtx.msg = {
			module: 'Screenrecord',
			request: 'start recording',
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

	async sendStopRecordingTransaction(keys) {
		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

		newtx.msg = {
			module: 'Screenrecord',
			request: 'stop recording',
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
			recordIcon.classList.add('recording', 'pulsate');
		}
	}

	updateUIForRecordingStop() {
		const recordIcon = document.querySelector('.fa-record-vinyl');
		if (recordIcon) {
			recordIcon.classList.remove('recording', 'pulsate');
		}
	}
}

module.exports = Record;


