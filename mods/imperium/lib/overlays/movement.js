const ImperiumMovementOverlayTemplate = require('./movement.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class MovementOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	render() {
		this.overlay.show(ImperiumMovementOverlayTemplate());
		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = MovementOverlay;
