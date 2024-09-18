const DreamWizardTemplate = require("./dream-wizard.template");
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');
const HelpOverlayTemplate = require('./overlays/limbo-help-overlay');

class DreamWizard{
	constructor(app, mod, options) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod, false);
		this.options = options;
	}

	render() {
		this.overlay.show(DreamWizardTemplate(this.app, this.mod, this.options));	
		this.attachEvents();
	}

	readOptions(){
		//Read the title & description for profile display
		let title_el = document.getElementById("dream-wizard-identifier");
		let title = document.getElementById("dream-wizard-identifier")?.value || "";
		let mode = document.querySelector(".cast-mode-option.selected");
		if (mode){
			if (mode.getAttribute("id") == "mode-video"){
				this.options.includeCamera = true;
			}
			if (mode.getAttribute("id") == "mode-screen"){
				this.options.screenStream = true;
			}
		}

		if(this.options.externalMediaType === "game"){
			this.options.includeCamera = true;
		}

		let description_el = document.getElementById("dream-wizard-description");
		let description = description_el?.innerText || description_el?.value || "";

		if (title){
			this.options.identifier = title;
		}

		if (description){
			this.options.description = description;
		}
	}

	attachEvents(){
		if (document.getElementById("dream-wizard-btn")){
			document.getElementById("dream-wizard-btn").onclick = (e) => {
				this.readOptions();		
				this.mod.broadcastDream(this.options);
				this.overlay.close();
			}
		}

		if (document.getElementById('dream-schedule-btn')){
			document.getElementById('dream-schedule-btn').onclick = (e) => {
				this.readOptions();
				this.overlay.close();
				this.mod.scheduleCast(this.options);
			}
		}

		Array.from(document.querySelectorAll(".cast-mode-option")).forEach(icon => {
			icon.onclick = (e) => {
				document.querySelectorAll(".cast-mode-option").forEach(i => {
					i.classList.remove("selected");
				})
				e.currentTarget.classList.add("selected");
			}
		});

		if (document.querySelector(".help-hook")){
			document.querySelector(".help-hook").onclick = (e) => {
				let overlay = new SaitoOverlay(this.app, this.mod);
				overlay.show(HelpOverlayTemplate(this.app, this.mod));
			}
		}

		if (document.querySelector(".advanced-options")){
			document.querySelector(".advanced-options").onclick = (e) => {
				this.mod.loadSettings(null, ()=> {
					console.log("3!");
					this.render();
				});
			}
		}
	}


}

module.exports = DreamWizard;
