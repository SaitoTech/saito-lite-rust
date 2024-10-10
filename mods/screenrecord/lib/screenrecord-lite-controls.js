
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');
const ScreenrecordLiteControlsTemplate = require('./screenrecord-lite-controls-template');


class ScreenRecordControls {

    constructor(app, mod, options = {}) {
		this.app = app;
		this.mod = mod;
		// this.options = options;
		this.timer_interval = null;
		this.overlay = new SaitoOverlay(app, mod);
		this.startTime = new Date().getTime();

		this.callbacks = {};

	}


    render() {
		if (!document.getElementById("screenrecord-controls")){
			this.app.browser.addElementToDom(ScreenrecordLiteControlsTemplate(this.app, this.mod));
			this.app.browser.makeDraggable("screenrecord-controls");

		}

        this.startTimer()
		this.attachEvents();

		
	}

    attachEvents(){
        if (document.querySelector(".screenrecord-controls .record-disconnect-control")){
			document.querySelector(".screenrecord-controls .record-disconnect-control").onclick = async () => {	
				this.mod.stopRecording()
			}
		}
    }

    startTimer() {

		if (this.timer_interval) {
			return;
		}
		let seconds = new Date().getTime();
		seconds -= this.startTime;
		seconds = seconds / 1000;

		const timer = () => {
			let timerElement = document.querySelector('.screenrecord-controls .counter');
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

    remove(){
		this.stopTimer();
		if (document.getElementById("screenrecord-controls")){
			document.getElementById("screenrecord-controls").remove();
		}
	}
}

module.exports = ScreenRecordControls