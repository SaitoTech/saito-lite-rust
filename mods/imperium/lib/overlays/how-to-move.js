const ImperiumHowToMoveOverlayTemplate = require('./how-to-move.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class HowToMoveOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
		this.overlay.clickToClose = true;
	}

	render(available_units = []) {
		this.overlay.show(ImperiumHowToMoveOverlayTemplate());
		this.overlay.setBackground(
			'/imperium/img/backgrounds/movement-background.jpg',
			false
		); // background not dark
	}
}

module.exports = HowToMoveOverlay;
