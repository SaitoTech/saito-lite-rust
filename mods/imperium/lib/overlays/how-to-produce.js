const ImperiumHowToProduceOverlayTemplate = require('./how-to-produce.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class HowToProduceOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
		this.overlay.clickToClose = true;
	}

	render() {
		this.overlay.show(ImperiumHowToProduceOverlayTemplate());
		this.overlay.setBackground(
			'/imperium/img/backgrounds/production_background2.png'
		);
		//this.overlay.setBackground("/imperium/img/backgrounds/production_background2.png", false);
	}
}

module.exports = HowToProduceOverlay;
