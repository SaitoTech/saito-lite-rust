const ImperiumCombatOverlayTemplate = require('./combat.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class CombatOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	render() {
		this.overlay.show(ImperiumCombatOverlayTemplate());
		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = CombatOverlay;
