const DreamWizardTemplate = require("./dream-wizard.template");
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');

class DreamWizard{
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod, false);
	}

	render(keylist) {
		this.keylist = keylist;

		this.overlay.show(DreamWizardTemplate(this.app, this.mod));	

		this.attachEvents();
	}

	updateStatus(video, screen){
		let noticeEl = document.getElementById("dream-status");

		let notice = " only";

		video = video || this.mod.localStream;

		if (video){
			if (screen){
				notice = ", webcam and screen share";
			}else{
				notice = " and webcam";
			}
		}else if (screen){
			notice = " and screen share";
		}

		noticeEl.innerHTML = notice;
	}

	attachEvents(){

		let video = false;
		let screen = false;

		this.updateStatus(video, screen);

		if (document.getElementById('enable-screenshare')) {
			document.getElementById('enable-screenshare').addEventListener('change', (e) => {
				screen = e.currentTarget?.checked;
				this.updateStatus(video, screen);
			});
		}

		if (document.getElementById('enable-webcam')) {
			document.getElementById('enable-webcam').addEventListener('change', (e) => {
				video = e.currentTarget?.checked;
				this.updateStatus(video, screen);
			});
		}


		if (document.getElementById("dream-wizard-btn")){
			document.getElementById("dream-wizard-btn").onclick = (e) => {
				let obj = {
					keylist: this.keylist,
					includeCamera: video,
					screenStream: screen
				};
				this.mod.broadcastDream(obj);
				this.overlay.close();
			}
		}

	}


}

module.exports = DreamWizard;
