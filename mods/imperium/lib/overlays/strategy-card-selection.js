const ImperiumStrategyCardSelectionOverlayTemplate = require('./strategy-card-selection.template');
const ImperiumStrategyCardOverlayTemplate = require('./strategy-card.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class StrategyCardSelectionOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	render(scards_objs = [], unselect_cards = [], mycallback) {
		let overlay_self = this;

		this.overlay.show(ImperiumStrategyCardSelectionOverlayTemplate());
		this.overlay.setBackgroundColor('#000D');
		this.app.browser.addElementToSelector(
			ImperiumStrategyCardOverlayTemplate(),
			'.strategy-card-selection-content'
		);

		for (let i = 0; i < scards_objs.length; i++) {
			this.app.browser.addElementToSelector(
				scards_objs[i].returnCardImage(1),
				'.strategy-card-selection-controls'
			);
		}
		for (let i = 0; i < unselect_cards.length; i++) {
			let s = '.strategy-card-' + unselect_cards[i].key;
			el = document.querySelector(s);
			el.classList.add('opaque');
		}

		let cards = [];
		document
			.querySelectorAll(
				'.strategy-card-selection-controls .strategy-card'
			)
			.forEach((el) => {
				cards.push(el);
			});
		for (let i = 0; i < cards.length; i++) {
			cards[i].classList.add('strategy-card-popup');
			cards[i].classList.add(`strat_slot_${i + 1}`);
		}

		this.attachEvents(cards, unselect_cards, mycallback);
	}

	attachEvents(cards, unselectable, mycallback) {
		let overlay_self = this;

		for (let i = 0; i < cards.length; i++) {
			cards[i].onclick = (e) => {
				let id = e.currentTarget.id;
				for (let z = 0; z < unselectable.length; z++) {
					if (unselectable[z].key === id) {
						alert('Strategy Card already chosen');
						return;
					}
				}
				overlay_self.overlay.hide();
				overlay_self.mod.hideStrategyCard(e.currentTarget.id);
				mycallback(e.currentTarget.id);
			};
		}
	}
}

module.exports = StrategyCardSelectionOverlay;
