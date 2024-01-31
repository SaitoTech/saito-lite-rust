const TreatiseTemplate = require('./treatise.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class TreatiseOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod);
	}

	hide() {
		this.overlay.hide();
	}

	render() {
		this.overlay.show(TreatiseTemplate());
		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = TreatiseOverlay;
