const DiscardOverlayTemplate = require('./discard.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class DiscardOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	render() {
		let cardCt =
			this.mod.game.state.players[this.mod.game.player - 1].resources
				.length;

		if (cardCt <= 7) {
			return;
		}

		this.my_resources = {};
		this.targetCt = Math.floor(cardCt / 2);

		for (let resource of this.mod.returnResources()) {
			let temp = this.mod.countResource(this.mod.game.player, resource);
			if (temp > 0) {
				this.my_resources[resource] = temp;
			}
		}

		this.overlay.show(DiscardOverlayTemplate(this.app, this.mod, this));
		this.overlay.blockClose();
		this.attachEvents();
	}

	attachEvents() {
		let cardsToDiscard = [];

		document
			.querySelectorAll(
				'.discard-cards-overlay .settlers-cards-container img'
			)
			.forEach((card) => {
				card.onclick = (e) => {
					let target = e.currentTarget;
					let res = target.getAttribute('id');

					if (target.classList.contains('selected')) {
						const index = cardsToDiscard.indexOf(res);

						if (index > -1) {
							// only splice array when item is found
							cardsToDiscard.splice(index, 1); // 2nd parameter means remove one item only
						}
					} else {
						cardsToDiscard.push(res); //Add it to recycling bin
					}

					target.classList.toggle('selected');

					if (cardsToDiscard.length >= this.targetCt) {
						for (let card of cardsToDiscard) {
							this.mod.addMove(`spend_resource\t${this.mod.game.player}\t${card}`);
						}

						this.mod.endTurn();
						this.overlay.close();
					}
				};
			});

	    // Set timer to auto-end my turn if I take too long
	    // 
	    if (this.mod.turn_limit){
	      this.mod.clock.startClock(this.mod.turn_limit);
	      this.mod.sleep_timer = setTimeout(()=> {
			this.overlay.close();

	      	let resources_available = this.mod.game.state.players[this.mod.game.player-1].resources.slice();
	      	//remove already selected
	      	for (let r of cardsToDiscard){
  		        let target = resources_available.indexOf(r);
        		if (target >= 0) {
          			resources_available.splice(target, 1);
          		}
	      	}
	      	//Randomly select other resources
	      	while (cardsToDiscard.length < this.targetCt) {
	      		let target = Math.floor(Math.random() * resources_available.length);
	      		cardsToDiscard.push(resources_available.splice(target, 1));
	      	}

			for (let card of cardsToDiscard) {
				this.mod.addMove(`spend_resource\t${this.mod.game.player}\t${card}`);
			}

			this.mod.endTurn();

	      }, this.mod.turn_limit);
	    }

	}
}

module.exports = DiscardOverlay;
