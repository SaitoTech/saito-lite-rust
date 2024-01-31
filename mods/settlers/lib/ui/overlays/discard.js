const DiscardOverlayTemplate = require('./discard.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class DiscardOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
		this.my_resources = {};
		this.cardsToDiscard = [];
		this.discardString = null;
		this.targetCt = null;
		this.player = null;
	}

	render() {
		this.my_resources = {};
		this.cardsToDiscard = [];
		this.discardString = null;
		this.targetCt = null;
		this.player = null;

		this.player = this.mod.game.player;
		let cardCt =
			this.mod.game.state.players[this.mod.game.player - 1].resources
				.length;
		if (cardCt <= 7) return;
		this.targetCt = Math.floor(cardCt / 2);

		for (let resource of this.mod.returnResources()) {
			let temp = this.mod.countResource(this.mod.game.player, resource);
			if (temp > 0) this.my_resources[resource] = temp;
		}

		this.overlay.show(DiscardOverlayTemplate(this.app, this.mod, this));
		this.overlay.blockClose();
		this.attachEvents();
	}

	attachEvents() {
		this_self = this;
		document
			.querySelectorAll(
				'.discard-cards-overlay .settlers-cards-container img'
			)
			.forEach((card) => {
				card.onclick = (e) => {
					let target = e.currentTarget;
					let res = target.getAttribute('id');

					if (target.classList.contains('selected')) {
						const index = this_self.cardsToDiscard.indexOf(res);

						if (index > -1) {
							// only splice array when item is found
							this_self.cardsToDiscard.splice(index, 1); // 2nd parameter means remove one item only
						}
					} else {
						this_self.cardsToDiscard.push(res); //Add it to recycling bin
					}

					target.classList.toggle('selected');

					if (this_self.cardsToDiscard.length >= this_self.targetCt) {
						for (
							let i = 0;
							i < this_self.cardsToDiscard.length;
							i++
						) {
							this_self.mod.addMove(
								'spend_resource\t' +
									this_self.player +
									'\t' +
									this_self.cardsToDiscard[i]
							);
						}

						this_self.mod.endTurn();
						this_self.overlay.hide();
						return 0;
					}
				};
			});
	}
}

module.exports = DiscardOverlay;
