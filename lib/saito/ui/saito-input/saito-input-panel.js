const SaitoInputPanelTemplate = require("./saito-input-panel.template");

class SaitoInputPanel {

	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
	}

	hide() {
		if (document.querySelector(".saito-input-panel")) { document.querySelector(".saito-input-panel").remove(); }
	}

	render(input_self) {

		//
		// remove if exists
		//
		this.hide();

		//
		// values are hardcoded to prevent issues with display
		//
		let position = {};
	        if (input_self.display == 'small' || input_self.display == 'medium') {
                	let si = document.querySelector(`.saito-input .text-input`);
                	let reference = si.getBoundingClientRect();
                	position.top = reference.top;
                	position.left = reference.right - 359;
                	if (input_self.display == 'small') { position.left += 35; }
        	} else {
                	let si = document.querySelector(`.saito-input .saito-input-icons`);
                	let reference = si.getBoundingClientRect();
         	       	position.top = reference.top;
                	position.left = reference.right;
        	}

        	position.bottom = window.innerHeight - position.top;

		//
		// and add
		//
		this.app.browser.addElementToSelector(SaitoInputPanelTemplate(position), this.container);

	}

	attachEvents(input_self) {

	}


}

module.exports = SaitoInputPanel;

