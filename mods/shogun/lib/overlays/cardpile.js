const CardpileOverlayTemplate = require('./cardpile.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class CardpileOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	render() {
		this.overlay.show(CardpileOverlayTemplate());
		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = CardpileOverlay;
