const DreamWizardTemplate = require("./dream-wizard.template");
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');

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

	attachEvents(){


		if (document.getElementById("dream-wizard-btn")){
			document.getElementById("dream-wizard-btn").onclick = (e) => {
				//Read the title & description for profile display
				let title_el = document.getElementById("dream-wizard-identifier");
				let title = document.getElementById("dream-wizard-identifier")?.value || "";

				let description_el = document.getElementById("dream-wizard-description");
				let description = description_el?.innerText || description_el?.value || "";

				if (title){
					this.options.identifier = title;
				}

				if (description){
					this.options.description = description;
				}
				
				this.mod.broadcastDream(this.options);
				this.overlay.close();
			}
		}

	}


}

module.exports = DreamWizard;
