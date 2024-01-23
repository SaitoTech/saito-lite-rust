const ShowCardTemplate = require('./show-card.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ShowCardOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;

		this.cards = null;
		this.title = null;

		this.overlay = new SaitoOverlay(app, mod);
	}

	render() {
		this.overlay.show(ShowCardTemplate(this.game));
		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = ShowCardOverlay;
