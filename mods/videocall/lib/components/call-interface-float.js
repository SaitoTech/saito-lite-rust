const CallInterfaceFloatTemplate = require('./call-interface-float.template');
const AudioBox = require('./audio-box');

class CallInterfaceFloat {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.localStream = null;
		this.audio_boxes = {};

		this.app.connection.on(
			'show-call-interface',
			(videoEnabled, audioEnabled) => {
				console.log('STUN: Render Audio Interface');

				this.render();
				this.attachEvents();
			}
		);

		this.app.connection.on('add-local-stream-request', (localStream) => {
			this.localStream = localStream;
			this.addStream('local', localStream);
		});

		this.app.connection.on(
			'add-remote-stream-request',
			(peer, remoteStream) => {
				this.addStream(peer, remoteStream);
				if (remoteStream){
					this.startTimer();
				}
			}
		);


		this.app.connection.on('stun-disconnect', this.hide.bind(this));

		this.app.connection.on('remove-peer-box', (peer_id) => {
			if (this.audio_boxes[peer_id]?.audio_box) {
				if (this.audio_boxes[peer_id].audio_box.remove) {
					this.audio_boxes[peer_id].audio_box.remove();
					delete this.audio_boxes[peer_id];
				}
			}
		});

		app.connection.on('stun-new-speaker', (peer) => {
			console.log('New Speaker: ' + peer);
			document.querySelectorAll('.audio-box').forEach((item) => {
				if (item.id === `audiostream${peer}`) {
					item.classList.add('speaker');
				} else {
					item.classList.remove('speaker');
				}
			});
		});
	}

	destroy() {
		this.app.connection.removeAllListeners('show-call-interface');
		this.app.connection.removeAllListeners('add-local-stream-request');
		this.app.connection.removeAllListeners('add-remote-stream-request');
		this.app.connection.off('stun-disconnect', this.hide);
		this.app.connection.removeAllListeners('remove-peer-box');
		this.app.connection.removeAllListeners('stun-new-speaker');
	}

	render() {
		console.log('Stun UI', this.mod.room_obj);

		if (!document.getElementById('small-audio-chatbox')) {
			this.app.browser.addElementToDom(CallInterfaceFloatTemplate());
		} else {
			this.app.browser.replaceElementById(
				CallInterfaceFloatTemplate(),
				'small-audio-chatbox'
			);
		}
	}

	attachEvents() {
		console.log('attaching events');

		document.querySelectorAll('.disconnect-control').forEach((item) => {
			item.onclick = () => {
				this.app.connection.emit('stun-disconnect');
			};
		});

		document.querySelectorAll('.audio-control').forEach((item) => {
			item.onclick = () => {
				this.toggleAudio();
			};
		});

		this.app.browser.makeDraggable('small-audio-chatbox', '', true);
	}

	hide() {
		this.audio_boxes = {};

		if (document.getElementById('small-audio-chatbox')) {
			document.getElementById('small-audio-chatbox').remove();
		}

	}

	addStream(peer, remoteStream) {
		this.createAudioBox(peer, remoteStream);
	}

	createAudioBox(peer, remoteStream, container = '.stun-identicon-list') {
		if (!this.audio_boxes[peer]) {
			const audioBox = new AudioBox(this.app, this.mod, peer, container);
			this.audio_boxes[peer] = {
				audio_box: audioBox,
				remote_stream: remoteStream
			};
		}

		this.audio_boxes[peer].audio_box.render(remoteStream);
	}

	toggleAudio() {
		console.log('toggling audio');

		this.app.connection.emit('stun-toggle-audio');

		//Update UI
		try {
			document
				.querySelector('.audio-control')
				.classList.toggle('disabled');
			document
				.querySelector('.audio-control i')
				.classList.toggle('fa-microphone-slash');
			document
				.querySelector('.audio-control i')
				.classList.toggle('fa-microphone');
		} catch (err) {
			console.warn('Stun UI error', err);
		}
	}

	startTimer() {
		if (this.timer_interval) {
			clearInterval(this.timer_interval);
		}
		let timerElement = document.querySelector('.timer .counter');

		timerElement.classList.remove('paused-timer');

		let seconds = 0;

		const timer = () => {
			seconds++;

			// Get hours
			let hours = Math.floor(seconds / 3600);
			// Get minutes
			let minutes = Math.floor((seconds - hours * 3600) / 60);
			// Get seconds
			let secs = Math.floor(seconds % 60);

			if (hours > 0) {
				hours = `0${hours}:`;
			} else {
				hours = '';
			}
			if (minutes < 10) {
				minutes = `0${minutes}`;
			}
			if (secs < 10) {
				secs = `0${secs}`;
			}

			timerElement.innerHTML = `${hours}${minutes}:${secs}`;
		};

		this.timer_interval = setInterval(timer, 1000);
		console.log('Start Call Timer');
	}

	pauseTimer() {
		if (this.timer_interval) {
			clearInterval(this.timer_interval);
		}

		let timerElement = document.querySelector('.timer .counter');

		this.timer_interval = setInterval(() => {
			timerElement.classList.toggle('paused-timer');
		}, 600);
	}
}

module.exports = CallInterfaceFloat;
