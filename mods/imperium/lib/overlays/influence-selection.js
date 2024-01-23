const ImperiumInfluenceSelectionOverlayTemplate = require('./influence-selection.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class InfluenceSelectionOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.influence_needed = 0;
		this.cards = [];
		this.goods = 0;
		this.submitInfluence = () => {};
		this.influence_needed = 0;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	render(
		Influence_needed = 1,
		cards = [],
		goods = 0,
		submitInfluence = () => {}
	) {
		this.Influence_needed = Influence_needed;
		this.cards = cards;
		this.goods = goods;
		this.submitInfluence = submitInfluence;

		this.overlay.show(
			ImperiumInfluenceSelectionOverlayTemplate(
				Influence_needed,
				cards,
				goods
			)
		);

		//
		// no trade goods
		//
		if (goods <= 0) {
			document.querySelector('.influence-selection-goods').style.display =
				'none';
		}

		//
		// insert cards
		//
		for (let i = 0; i < cards.length; i++) {
			this.app.browser.addElementToSelector(
				'<div class="planet-card planet-card-' +
					cards[i] +
					'" id="' +
					cards[i] +
					'" style="background-image: url(' +
					this.mod.game.planets[cards[i]].img +
					');"></div>',
				'.influence-selection-cards'
			);
		}

		this.attachEvents();
	}

	reset() {}

	attachEvents() {
		document
			.querySelectorAll('.influence-selection-cards .planet-card')
			.forEach((el) => {
				el.onclick = (e) => {
					let id = el.getAttribute('id');
					el.classList.add('exhausted');
					this.submitInfluence('id');
				};
			});

		document
			.querySelectorAll('.influence-selection-goods')
			.forEach((el) => {
				el.onclick = (e) => {
					let amount = parseInt(
						e.currentTarget.getAttribute('data-amount')
					);
					if (amount > 0) {
						amount--;
						e.currentTarget.setAttribute('data-amount', amount);
						e.currentTarget.innerHTML = amount + ' trade goods';
						this.submitInfluence('trade_goods');
						//
						// no trade goods
						//
						if (goods <= 0) {
							document.querySelector(
								'.influence-selection-goods'
							).style.display = 'none';
						}
					}
				};
			});
	}
}

module.exports = InfluenceSelectionOverlay;
