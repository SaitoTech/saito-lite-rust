const VideoBox = require('../../../lib/saito/ui/saito-videobox/video-box');
const DreamControlTemplate = require("./dream-controls.template");

class DreamControls{
	constructor(app, mod, container = "") {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.video = new VideoBox(app, mod, "local", "video-preview");
		this.video.display_wave_form = true;
		this.timer_interval = null;
		this.callbacks = {};
	}

	render(stream, is_presentation = false) {
		if (!document.getElementById("dream-controls")){
			console.log("Render Dream controls in " + this.container);
			this.app.browser.addElementToSelectorOrDom(DreamControlTemplate(this.mod), this.container);
			if (!document.querySelector(this.container)){
				this.app.browser.makeDraggable('dream-controls');
			}
		}
		if (stream){
			if (is_presentation){
				this.video.video_class = "noflip";
			}
			this.video.render(stream);
			this.startTimer();
		}

		this.attachEvents();
	}


	remove(){
		this.stopTimer();
		this.video.remove();
		if (document.getElementById("dream-controls")){
			document.getElementById("dream-controls").remove();
		}
	}

	attachEvents(){

		if (document.querySelector(".dream-controls .video-control")){
			document.querySelector(".dream-controls .video-control").onclick = () => {
				this.toggleVideo();
				this.app.connection.emit('limbo-update-status');
			}
		}

		if (document.querySelector(".dream-controls .audio-control")){
			document.querySelector(".dream-controls .audio-control").onclick = () => {
				this.toggleAudio();
			}
		}

		if (document.querySelector(".dream-controls .screen-control")){
			document.querySelector(".dream-controls .screen-control").onclick = () => {
				this.toggleScreen();
				this.app.connection.emit('limbo-update-status');
			}
		}

		if (document.querySelector(".dream-controls .disconnect-control")){
			document.querySelector(".dream-controls .disconnect-control").onclick = async () => {
				await this.mod.sendKickTransaction();
				this.mod.exitSpace();
			}
		}
	}

	toggleAudio() {
		//Tell PeerManager to adjust streams
		this.app.connection.emit('limbo-toggle-audio');

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

	toggleVideo() {
		this.app.connection.emit('limbo-toggle-video');

		//Update UI
		try {
			document
				.querySelector('.video-control')
				.classList.toggle('disabled');
			document
				.querySelector('.video-control i')
				.classList.toggle('fa-video-slash');
			document
				.querySelector('.video-control i')
				.classList.toggle('fa-video');
		} catch (err) {
			console.warn('Stun UI error', err);
		}
	}

	toggleScreen() {
		this.app.connection.emit('limbo-toggle-screen');

		//Update UI
		try {
			document
				.querySelector('.screen-control')
				.classList.toggle('disabled');
			document
				.querySelector('.screen-control i')
				.classList.toggle('fa-tablet-screen-button');
			document
				.querySelector('.screen-control i')
				.classList.toggle('fa-tablet-button');
		} catch (err) {
			console.warn('Stun UI error', err);
		}
	}



	startTimer() {
		if (this.timer_interval) {
			return;
		}
		let timerElement = document.querySelector('.dream-controls .counter');
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
	}

	stopTimer() {
		clearInterval(this.timer_interval);
		this.timer_interval = null;
	}


}

module.exports = DreamControls;
