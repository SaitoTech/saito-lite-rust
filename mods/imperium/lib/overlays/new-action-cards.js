const ImperiumNewActionCardsOverlayTemplate = require('./new-action-cards.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class NewActionCardsOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
		this.overlay.clickToClose = true;
	}

	render(cards = []) {
		this.overlay.show(ImperiumNewActionCardsOverlayTemplate());
		this.overlay.setBackground(
			'/imperium/img/backgrounds/action-cards-background.jpg',
			false
		); // background not dark

		for (let i = 0; i < cards.length; i++) {
			let ac = this.mod.action_cards[cards[i]];
			this.app.browser.addElementToSelector(
				ac.returnCardImage(),
				'.new-action-cards'
			);
		}
	}
}

module.exports = NewActionCardsOverlay;
