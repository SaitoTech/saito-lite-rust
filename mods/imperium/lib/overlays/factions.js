const ImperiumFactionsOverlayTemplate = require('./factions.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class FactionsOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	render() {
		this.overlay.show(ImperiumFactionsOverlayTemplate());
		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = FactionsOverlay;
