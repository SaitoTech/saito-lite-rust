const EstatesOverlayTemplate = require('./estates.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class EstatesOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	render() {
		this.overlay.show(EstatesOverlayTemplate());
		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = EstatesOverlay;
