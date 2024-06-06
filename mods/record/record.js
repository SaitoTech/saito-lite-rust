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
		this.interval = null; // Store the interval reference here
	}

	respondTo(type, obj) {
		if (type === 'video-call-actions') {
			this.attachStyleSheets();
			super.render(this.app, this);

			return [
				{
					text: 'Record',
					icon: 'fas fa-record-vinyl record-icon',
					callback: async function (app) {
						let { container, streams, useMicrophone, callbackAfterRecord } = obj;

						if (container) {
							const recordIcon = document.querySelector('.fa-record-vinyl');
							if (!this.recording_status) {
								await this.startRecording(container, streams, useMicrophone, callbackAfterRecord);
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

						await this.startRecording(container, null, false, () => "");
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

	async startRecording(container, streams = [], useMicrophone = true, callbackAfterRecord = null) {
		let chunks = [];
		const targetDiv = document.querySelector(container);
		const { top, left, width, height } = targetDiv.getBoundingClientRect();

		console.log(`Div dimensions - Top: ${top}, Left: ${left}, Width: ${width}, Height: ${height}`);

		// Capture the screen
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
			this.mediaRecorder.stop(); // Stop the recording
		});

		// Create a video element to play the captured stream
		const video = document.createElement('video');
		video.srcObject = stream;
		video.style.position = 'absolute';
		video.style.top = '0';
		video.style.left = '0';
		video.style.zIndex = '-1'; // Ensure the video does not cover other elements
		video.play();

		document.body.appendChild(video); // Append the video to the body for correct positioning

		// Create a canvas element to draw the specific portion of the video
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.width = width;
		canvas.height = height;

		video.onloadedmetadata = () => {

			const scaleX = video.videoWidth / window.innerWidth;
			const scaleY = video.videoHeight / window.innerHeight;

			function draw() {
				ctx.clearRect(0, 0, canvas.width, canvas.height);

				ctx.drawImage(video, left * scaleX, top * scaleY, width * scaleX, height * scaleY - 10, 0, 0, width, height);
				requestAnimationFrame(draw);
			}
			draw();
		};

		// Capture the canvas stream
		let recordedStream = canvas.captureStream();

		// Combine the canvas stream with audio streams
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

		// Record the combined stream
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
			document.body.removeChild(video); // Remove the video element after recording
		};

		this.mediaRecorder.start();
		this.recording_status = true;
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

		// await draw();
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
}

module.exports = Record;


// let recorder;
// let chunks = [];
// let stream;
// let recordedStream;

// async function startCapture() {
// 	const targetDiv = document.getElementById('targetDiv');
// 	const { top, left, width, height } = targetDiv.getBoundingClientRect();

// 	// Capture the screen
// 	stream = await navigator.mediaDevices.getDisplayMedia({
// 		video: { cursor: "always" },
// 		audio: false
// 	});

// 	const video = document.createElement('video');
// 	video.srcObject = stream;
// 	video.play();

// 	const canvas = document.createElement('canvas');
// 	const ctx = canvas.getContext('2d');
// 	canvas.width = width;
// 	canvas.height = height;

// 	video.onloadedmetadata = () => {
// 		// Update canvas every frame
// 		function draw() {
// 			// Draw a specific portion of the video (x, y, width, height)
// 			ctx.drawImage(video, left, top, width, height, 0, 0, width, height);
// 			requestAnimationFrame(draw);
// 		}
// 		draw();
// 	};

// 	// Capture canvas content as a stream
// 	recordedStream = canvas.captureStream();
// 	recorder = new MediaRecorder(recordedStream);
// 	recorder.ondataavailable = event => chunks.push(event.data);
// 	recorder.onstop = onRecordingStop;
// 	recorder.start();
// }

// function stopCapture() {
// 	recorder.stop();
// 	stream.getTracks().forEach(track => track.stop());
// }

// function onRecordingStop() {
// 	const blob = new Blob(chunks, { type: 'video/webm' });
// 	const url = URL.createObjectURL(blob);
// 	const recordedVideo = document.getElementById('recordedVideo');
// 	recordedVideo.src = url;
// 	recordedVideo.play();
// }