const ImperiumActionCardsOverlayTemplate = require('./action-cards.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ActionCardsOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
		this.overlay.clickToClose = true;
	}

	render(cards = []) {
		//
		// show overlay
		//
		this.overlay.show(ImperiumActionCardsOverlayTemplate());
		this.overlay.setBackground(
			'/imperium/img/backgrounds/action-cards-background.jpg',
			false
		); // background not dark

		for (let i in cards) {
			this.app.browser.addElementToSelector(
				cards[i].returnCardImage(),
				'.action-cards-overlay-content'
			);
		}
	}
}

module.exports = ActionCardsOverlay;
