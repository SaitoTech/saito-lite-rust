const ImperiumStrategyCardOverlayTemplate = require('./strategy-card.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class StrategyCardOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	render() {
		//
		// show overlay
		//
		this.overlay.setBackground('/imperium/img/starscape_background3.jpg');
		this.overlay.show(ImperiumStrategyCardOverlayTemplate());

		let cards = this.mod.returnStrategyCards();

		for (let i in cards) {
			// mode 1 = include "picked" and "bonus" info
			this.app.browser.addElementToSelector(
				cards[i].returnCardImage(1),
				'.strategy-card-overlay'
			);
		}
	}
}

module.exports = StrategyCardOverlay;
