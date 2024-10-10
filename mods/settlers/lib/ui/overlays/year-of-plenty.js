const YearOfPlentyOverlayTemplate = require('./year-of-plenty.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class YearOfPlentyOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
		this.cardname = null;
		this.player = null;
		this.cardsToGain = [];
		this.remaining = 2;
	}

	render(card) {
		this.overlay.show(
			YearOfPlentyOverlayTemplate(this.app, this.mod, this),
			() => {
				//Allow to cancel by clicking out of overlay
				this.mod.game.state.players[this.mod.game.player-1].devcards.push(card);
				this_dev_card.mod.game.state.canPlayCard = true;
			}
		);
		this.attachEvents();
	}

	attachEvents() {
		this_self = this;
		document
			.querySelectorAll('.settlers-select-options img')
			.forEach((card) => {
				card.onclick = (e) => {
					let target = e.currentTarget;
					let card = target.getAttribute('id');

					this_self.cardsToGain.push(card);
					this_self.remaining--;

					if (this_self.remaining <= 0) {
						this_self.mod.addMove(
							`year_of_plenty\t${this_self.player}\t${
								this_self.cardname
							}\t${JSON.stringify(this_self.cardsToGain)}`
						);
						this_self.mod.endTurn();
						this_self.overlay.remove();
						return 0;
					} else {
						this_self.updateCards();
					}
				};
			});

		document
			.querySelectorAll('.settlers-selected-resources img')
			.forEach((card) => {
				card.onclick = (e) => {
					let target = e.currentTarget;
					let card = target.getAttribute('id');

					const index = this_self.cardsToGain.indexOf(
						this_self.cardsToGain[card]
					);
					if (index > -1) {
						// only splice array when item is found
						this_self.cardsToGain.splice(index, 1); // 2nd parameter means remove one item only
						this_self.remaining++;
					}

					this_self.updateCards();
				};
			});
	}

	updateCards() {
		let html = ``;
		for (let i = 0; i < this.cardsToGain.length; i++) {
			html += `<img id="${i}" src="${this.mod.returnCardImage(
				this.cardsToGain[i]
			)}" >`;
		}

		document.querySelector('.settlers-selected-resources').innerHTML = html;
		this.attachEvents();
	}
}

module.exports = YearOfPlentyOverlay;
