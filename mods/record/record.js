const ModTemplate = require('../../lib/templates/modtemplate');
const html2canvas = require('html2canvas');

class Record extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.name = 'Record';
		this.description = 'Recording Module';
		this.categories = 'Utilities Communications';
		this.class = 'utility';
		this.record_video = false;
		this.recording_status = false;
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
							const recordIcon = document.querySelector('.fa-record-vinyl');
							if (!this.recording_status) {
								await this.startRecording(container, streams, useMicrophone, callbackAfterRecord, members);
								recordIcon.classList.add('recording', 'pulsate');
							} else {
								this.stopRecording();
								recordIcon.classList.remove('recording', 'pulsate');
							}
						}
					}.bind(this)
				}
			];
		}
		if (type === 'game-menu') {
			let menu = {
				id: 'game-record',
				text: 'Record',
				submenus: [],
			};

			menu.submenus.push({
				parent: 'game-record',
				text: "record game",
				id: 'record-game',
				class: 'record-game',
				callback: async function (app, game_mod) {
					let recordButton = document.getElementById('record-game');
					let { container } = game_mod.recordOptions;

					if (!this.recording_status) {

						await this.startRecording(container, null, false, () => "" );
						recordButton.textContent = "stop recording";
						this.recording_status = true;
					} else {
						if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
							this.mediaRecorder.stop();
						}
						recordButton.textContent = "record game";
						this.recording_status = false;
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
						if (message.request === "start recording"){
							siteMessage(`${this.app.keychain.returnUsername(tx.from[0].publicKey)} started recording their screen`, 1500);
						}
						if (message.request === "stop recording"){
							siteMessage(`${this.app.keychain.returnUsername(tx.from[0].publicKey)} stopped recording their screen`, 1500);
						}

						this.toggleNotification();
					}

				}
			}
		}
	}


	async startRecording(container, streams = [], useMicrophone = true, callbackAfterRecord = null, members = []) {
		let chunks = [];
		const targetDiv = document.querySelector(container);

		function updateDimensions() {
			const { top, left, width, height } = targetDiv.getBoundingClientRect();

			return { top, left, width, height };
		}
	
		let { top, left, width, height } = updateDimensions();
	

		console.log(`Div dimensions - Top: ${top}, Left: ${left}, Width: ${width}, Height: ${height}`);

		
		let stream = await navigator.mediaDevices.getDisplayMedia({
			video: {
				displaySurface: 'browser'
			},
			audio: true,
			preferCurrentTab: true,
			selfBrowserSurface: 'include',
			monitorTypeSurfaces: 'exclude'
		});

		stream.getVideoTracks()[0].addEventListener('ended', () => {
			console.log('Screen sharing stopped.');
			this.mediaRecorder.stop(); 
		});

		
		const video = document.createElement('video');
		video.srcObject = stream;
		video.style.position = 'absolute';
		video.style.top = '0';
		video.style.left = '0';
		video.style.zIndex = '-1'; 
		video.play();

		document.body.appendChild(video); 

		// Create a canvas element to draw the wanted portion of the video
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.width = width;
		canvas.height = height;

		video.onloadedmetadata = () => {

			const scaleX = video.videoWidth / window.innerWidth;
			const scaleY = video.videoHeight / window.innerHeight;

			function draw() {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				let {top, left, width, height} = updateDimensions();
				ctx.drawImage(video, left * scaleX, top * scaleY, width * scaleX, height * scaleY - 10, 0, 0, width, height);
				requestAnimationFrame(draw);
			}
			draw();
		};

		window.addEventListener('resize', updateDimensions);
		window.addEventListener('orientationchange', updateDimensions);
		
		let recordedStream = canvas.captureStream();


		const combinedStream = new MediaStream([...recordedStream.getTracks()]);

		if (useMicrophone) {
			try {
				const microphoneStream = await navigator.mediaDevices.getUserMedia({
					audio: true
				});
				microphoneStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
			} catch (error) {
				console.error('Error accessing microphone:', error);
			}
		}

		if (streams && streams.length > 0) {
			const audioTracks = this.getAudioTracksFromStreams(streams);
			audioTracks.forEach(track => combinedStream.addTrack(track));
		}


		const mediaRecorder = new MediaRecorder(combinedStream, {
			mimeType: 'video/webm; codecs=vp9',
			videoBitsPerSecond: 25 * 1024 * 1024,
			audioBitsPerSecond: 320 * 1024
		});

		this.mediaRecorder = mediaRecorder;
		this.mediaRecorder.ondataavailable = event => {
			if (event.data.size > 0) {
				chunks.push(event.data);
				if (callbackAfterRecord) {
					callbackAfterRecord(event.data);
				}
			}
		};

		this.mediaRecorder.onstop = async () => {
			this.stopHtml2Canvas();
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
			if(members.length > 0){
				this.sendStopRecordingTransaction(members);
			}
		
		};

		this.mediaRecorder.start();
		this.recording_status = true;

		if(members.length > 0){
				this.sendStartRecordingTransaction(members);
		}
	
	}




	async stopRecording() {
		if (this.mediaRecorder) {
			this.mediaRecorder.stop();
		}
		this.recording_status = false;
	}

	async captureStream(container) {
		const element = document.querySelector(container);
		const canvas = document.createElement('canvas');
		canvas.width = element.clientWidth;
		canvas.height = element.clientHeight;
		const context = canvas.getContext('2d');
		const stream = canvas.captureStream();

		const draw = async () => {
			try {
				const tempCanvas = await html2canvas(element, {
					logging: false,
					useCORS: true,
				});
				context.clearRect(0, 0, canvas.width, canvas.height);
				context.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
			} catch (error) {
				console.error('Error capturing stream:', error);
			}
		};

		this.interval = setInterval(draw, 1000 / 50);
		return stream;
	}

	stopHtml2Canvas() {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
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

	async sendStartRecordingTransaction(keys){
		let newtx =	await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

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
		let newtx =	await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

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
}

module.exports = Record;


