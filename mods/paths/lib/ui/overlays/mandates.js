const MandatesTemplate = require('./mandates.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class WelcomeOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod, false, true, true);
	}

	hide() {
		this.overlay.hide();
	}

	render(obj) {
		this.overlay.show(MandatesTemplate(obj));
		this.attachEvents();

		let highlight_allied = '.allies .r' + obj.allies;
		let highlight_central = '.central .r' + obj.central;

		document.querySelector(highlight_allied).style.backgroundColor =
			'yellow';
		document.querySelector(highlight_central).style.backgroundColor =
			'yellow';
	}

	attachEvents() {}
}

module.exports = WelcomeOverlay;
