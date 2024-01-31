const StatsTemplate = require('./stats.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class StatsOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);
	}

	render(stats) {
		this.overlay.show(StatsTemplate(this.mod, stats));
		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = StatsOverlay;
