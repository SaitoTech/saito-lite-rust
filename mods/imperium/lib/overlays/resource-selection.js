const ImperiumResourceSelectionOverlayTemplate = require('./resource-selection.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ResourceSelectionOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.resources_needed = 0;
		this.cards = [];
		this.goods = 0;
		this.submitResources = () => {};
		this.resources_needed = 0;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	render(
		resources_needed = 1,
		cards = [],
		goods = 0,
		submitResources = () => {}
	) {
		this.resources_needed = resources_needed;
		this.cards = cards;
		this.goods = goods;
		this.submitResources = submitResources;

		this.overlay.show(
			ImperiumResourceSelectionOverlayTemplate(
				resources_needed,
				cards,
				goods
			)
		);

		//
		// no trade goods
		//
		if (goods <= 0) {
			document.querySelector('.resource-selection-goods').style.display =
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
				'.resource-selection-cards'
			);
		}

		this.attachEvents();
	}

	reset() {}

	attachEvents() {
		document
			.querySelectorAll('.resource-selection-cards .planet-card')
			.forEach((el) => {
				el.onclick = (e) => {
					let id = el.getAttribute('id');
					el.classList.add('exhausted');
					e.currentTarget.onclick = (e) => {};
					this.submitResources('id');
				};
			});

		document.querySelectorAll('.resource-selection-goods').forEach((el) => {
			el.onclick = (e) => {
				let amount = parseInt(
					e.currentTarget.getAttribute('data-amount')
				);
				if (amount > 0) {
					amount--;
					e.currentTarget.setAttribute('data-amount', amount);
					e.currentTarget.innerHTML = amount + ' trade goods';
					this.submitResources('trade_goods');
					//
					// no trade goods
					//
					if (goods <= 0) {
						document.querySelector(
							'.resource-selection-goods'
						).style.display = 'none';
					}
				}
			};
		});
	}
}

module.exports = ResourceSelectionOverlay;
