const CombatTemplate = require('./combat.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class CombatOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);
	}

	render(obj = {}) {
		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = CombatOverlay;
