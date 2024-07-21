const ScreenRecordWizardTemplate = require("./screenrecord-wizard.template");
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');
// const HelpOverlayTemplate = require('./overlays/limbo-help-overlay');

class ScreenRecordWizard{
	constructor(app, mod, options) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod, false);
		this.options = options;
	}

	render() {

		this.overlay.show(ScreenRecordWizardTemplate(this.app, this.mod, this.options));	

		this.attachEvents();
	}

	attachEvents(){

		if (document.getElementById("screenrecord-wizard-btn")){
			document.getElementById("screenrecord-wizard-btn").onclick = (e) => {
				let title_el = document.getElementById("screenrecord-wizard-identifier");
				let title = document.getElementById("screenrecord-wizard-identifier")?.value || "";
				let mode = document.querySelector(".record-mode-option.selected");

                this.options.includeCamera = false;
				if (mode){
					if (mode.getAttribute("id") == "mode-video"){
						this.options.includeCamera = true;
					}

				}

				let description_el = document.getElementById("screenrecord-wizard-description");
				let description = description_el?.innerText || description_el?.value || "";

				
				this.mod.startRecording(this.options);
				this.overlay.close();
			}
		}

		Array.from(document.querySelectorAll(".record-mode-option")).forEach(icon => {
			icon.onclick = (e) => {
				document.querySelectorAll(".record-mode-option").forEach(i => {
					i.classList.remove("selected");
				})
				e.currentTarget.classList.add("selected");
			}
		});

	}


}

module.exports = ScreenRecordWizard;
