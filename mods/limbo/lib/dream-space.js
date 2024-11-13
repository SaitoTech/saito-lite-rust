const VideoBox = require('../../../lib/saito/ui/saito-videobox/video-box');
const DreamSpaceTemplate = require("./dream-space.template");

class DreamSpace{
	constructor(app, mod, container = "#limbo-main") {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.video = new VideoBox(app, mod, "presentation", "video-preview");
		this.video.display_wave_form = true;
		this.startTime = new Date().getTime();
		this.timer_interval = null;

		app.connection.on('limbo-spaces-update', () => {
			if (mod.dreamer){
				if (mod.dreams[mod.dreamer]){
					if (mod.dreams[mod.dreamer]?.muted === undefined){
						return;
					}

					let elem = document.querySelector(".dream-controls .default-limbo-image-mask");
					if (mod.dreams[mod.dreamer].muted){
						this.video.hide();
						if (elem){
							elem.classList.remove("hidden");
						}
					}else{
						this.video.show();
						if (elem){
							elem.classList.add("hidden");	
						}
					}
				}
			}
		});
	}

	render(stream = null) {
		if (!document.getElementById("dream-controls")){
			this.app.browser.addElementToSelectorOrDom(DreamSpaceTemplate(), this.container);
			this.video.render();
		}

		if (stream){
			console.log("Render DreamSpace with tracks", stream.getTracks());
			this.startTimer();

			this.video.stream = stream;
			this.video.rerender();

			this.app.connection.emit("limbo-spaces-update");
		}

		this.attachEvents();
	}

	remove(){
		this.video.remove();
		this.stopTimer();
		if (document.getElementById("dream-controls")){
			document.getElementById("dream-controls").remove();
		}
	}

	attachEvents(){

	}

	startTimer() {
		if (this.timer_interval) {
			return;
		}
		let timerElement = document.querySelector('.dream-controls .counter');
		let seconds = new Date().getTime();
		seconds -= this.startTime;
		seconds = seconds / 1000;

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

module.exports = DreamSpace;
