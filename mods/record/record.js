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
		let record_self = this;
		if (type === 'record-actions') {
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
							if (record_self.recording_status === false) {
								await record_self.startRecording(container, streams, useMicrophone, callbackAfterRecord);
								recordIcon.classList.add('recording', 'pulsate');
							} else {
								record_self.stopRecording();
								recordIcon.classList.remove('recording', 'pulsate');
							}
						}
					}
				}
			];
		}
	}

	async startRecording(container, streams = [], useMicrophone = true, callbackAfterRecord = null) {
		let mediaRecorder;
		let chunks = [];

		const pageStream = await this.captureStream(container);
		const combinedStream = new MediaStream();
		pageStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
		pageStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));


		if (useMicrophone) {
			try {
				const microphoneStream = await navigator.mediaDevices.getUserMedia({
					audio: {
						sampleRate: 48000,
						channelCount: 2,
						noiseSuppression: true,
						echoCancellation: true
					}
				});
				const micAudioTracks = microphoneStream.getAudioTracks();
				micAudioTracks.forEach(track => combinedStream.addTrack(track));
			} catch (error) {
				console.error('Error accessing microphone:', error);
			}
		}



		if (streams.length > 0) {
			const audioTracks = this.getAudioTracksFromStreams(streams);
			audioTracks.forEach(track => combinedStream.addTrack(track));
			console.log(combinedStream.getAudioTracks(tracks => console.log(tracks)), "audio tracks")
		}

		console.log('Combined Stream Tracks:', combinedStream.getTracks());



		mediaRecorder = new MediaRecorder(combinedStream, {
			mimeType: 'video/webm; codecs=vp9', videoBitsPerSecond: 25 * 1024 * 1024,
			audioBitsPerSecond: 320 * 1024,
		})

		this.mediaRecorder = mediaRecorder;
		this.mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) {
				chunks.push(event.data
				);
				if (callbackAfterRecord) {
					callbackAfterRecord(event.data);
				}
			}
		};

		this.mediaRecorder.onstop = () => {
			this.stopHtml2Canvas();
			const blob = new Blob(chunks, { type: 'video/webm' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;
			a.download = 'recording.webm';
			document.body.appendChild(a);
			a.click();
			URL.revokeObjectURL(url);
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
		let element = document.querySelector(container);

		const canvas = document.createElement('canvas');
		canvas.width = element.scrollWidth;
		canvas.height = element.scrollHeight;
		const context = canvas.getContext('2d');
		const stream = canvas.captureStream();

		const draw = async () => {
			try {
				const tempCanvas = await html2canvas(element)
				context.clearRect(0, 0, canvas.width, canvas.height);
				context.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
			} catch (error) {
				console.error('Error capturing stream:', error);
			}
		};

		await draw();
		this.interval = setInterval(draw, 1000 / 30);
		return stream;
	}


	// async captureStream(container) {
	// 	let element = document.querySelector(container);

	// 	const canvas = document.createElement('canvas');
	// 	canvas.width = element.scrollWidth;
	// 	canvas.height = element.scrollHeight;
	// 	const context = canvas.getContext('2d');
	// 	const stream = canvas.captureStream(60); 

	// 	const draw = async () => {
	// 		try {
	// 			const tempCanvas = await html2canvas(element, { scale: 2, useCORS: true });
	// 			context.clearRect(0, 0, canvas.width, canvas.height);
	// 			context.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
	// 			requestAnimationFrame(draw); // Ensure smooth rendering
	// 		} catch (error) {
	// 			console.error('Error capturing stream:', error);
	// 		}
	// 	};

	// 	await draw();
	// 	return stream;
	// }

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
				const tracks = stream.getAudioTracks();
				audioTracks.push(...tracks);
			}
		});

		return audioTracks;
	}
}



module.exports = Record;