const SaitoCameraTemplate = require('./saito-camera.template');
const SaitoOverlay = require('../saito-overlay/saito-overlay');

class SaitoCamera {
	constructor(app, mod, callback = null) {
		this.app = app;
		this.mod = mod;
		this.width = 640;
		this.height = null;
		this.video_elem = null;
		this.cameras = [];
		this.cameraIndex = 0;
		this.facingMode = 'environment'; //user
		this.constraints = {
			audio: false,
			video: {
				deviceId: {}
			}
		};

		this.callback = callback;
		this.overlay = new SaitoOverlay(app, mod);

		navigator.mediaDevices.enumerateDevices().then((devices) => {
			devices.forEach((device) => {
				if (device.kind === 'videoinput') {
					this.cameras.push(device.deviceId);
				}
			});
		});
	}

	render() {
		this.overlay.show(SaitoCameraTemplate(), () => {
			this.stopStream();
		});

		this.attachEvents();
	}

	stopStream() {
		const stream = this.video_elem.srcObject;
		if (stream) {
			const tracks = stream.getTracks();

			tracks.forEach((track) => {
				track.stop();
			});
		}

		this.video_elem.srcObject = null;
	}

	startStream() {
		navigator.mediaDevices
			.getUserMedia(this.constraints)
			.then((stream) => {
				if (document.querySelector('.saito-camera .saito-loader')) {
					document
						.querySelector('.saito-camera .saito-loader')
						.remove();
				}
				this.video_elem.srcObject = stream;
				this.video_elem.play();
			})
			.catch((err) => {
				console.error(`An error occurred: ${err}`);
			});
	}

	switchCamera() {
		this.stopStream();
		this.cameraIndex++;
		if (this.cameraIndex >= this.cameras.length) {
			this.cameraIndex = 0;
		}
		if (this.cameras.length > 0) {
			this.constraints.video.deviceId.exact =
				this.cameras[this.cameraIndex];
			this.startStream();
		}
	}

	attachEvents() {
		this.video_elem = document.querySelector('.saito-camera #video');
		const canvas = document.getElementById('canvas');
		let streaming = false;

		this.startStream();

		this.video_elem.addEventListener(
			'canplay',
			(ev) => {
				if (!streaming) {
					this.height =
						(this.video_elem.videoHeight /
							this.video_elem.videoWidth) *
						this.width;

					this.video_elem.setAttribute('width', this.width);
					this.video_elem.setAttribute('height', this.height);
					canvas.setAttribute('width', this.width);
					canvas.setAttribute('height', this.height);
					streaming = true;
				}
				this.clearphoto();
			},
			false
		);

		const startbutton = document.getElementById('startbutton');
		startbutton.onclick = (ev) => {
			this.takepicture();
			ev.preventDefault();
		};

		const resetButton = document.getElementById('retake');
		resetButton.onclick = (e) => {
			e.preventDefault();
			this.clearphoto();
		};

		const acceptButton = document.getElementById('accept');
		acceptButton.onclick = (e) => {
			e.preventDefault();
			this.stopStream();
			this.overlay.remove();
			if (this.callback) {
				this.callback(this.data);
			}
		};

		const flipButton = document.getElementById('flip');
		if (flipButton) {
			flipButton.onclick = (e) => {
				this.switchCamera();
			};
		}
	}

	takepicture() {
		const canvas = document.getElementById('canvas');
		const photo = document.getElementById('photo-preview');
		const context = canvas.getContext('2d');
		if (this.width && this.height) {
			canvas.width = this.width;
			canvas.height = this.height;
			context.drawImage(this.video_elem, 0, 0, this.width, this.height);

			this.data = canvas.toDataURL('image/png');
			photo.setAttribute('src', this.data);
		} else {
			clearphoto();
		}

		photo.style.display = 'block';
		this.video_elem.style.display = 'none';

		document.querySelector('.saito-camera').classList.remove('video');
	}

	clearphoto() {
		const canvas = document.getElementById('canvas');
		const context = canvas.getContext('2d');
		const photo = document.getElementById('photo-preview');
		context.fillStyle = '#AAA';
		context.fillRect(0, 0, canvas.width, canvas.height);

		this.data = canvas.toDataURL('image/png');
		photo.setAttribute('src', this.data);

		photo.style.display = 'none';
		this.video_elem.style.display = 'block';
		document.querySelector('.saito-camera').classList.add('video');
	}
}

module.exports = SaitoCamera;
