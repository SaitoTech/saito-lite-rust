const DevCardOverlayTemplate = require('./dev-card.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class DevCardOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod);
	}

	render() {
		this.overlay.show(DevCardOverlayTemplate(this.app, this.mod, this));
		this.attachEvents();
	}

	attachEvents() {
		this_dev_card = this;
		document.querySelectorAll('.settlers-dev-card').forEach((card) => {
			card.onclick = (e) => {
				let target = e.currentTarget;

				if (target.classList.contains('settlers-card-disabled')) {
					salert('You cannot play that card now');
					return;
				}

				let selection = target.getAttribute('id');
				let card = this_dev_card.mod.game.state.players[this_dev_card.mod.game.player-1].devcards[selection];
				let cardobj = this_dev_card.mod.game.deck[0].cards[card];

				this_dev_card.overlay.remove();

				switch (cardobj.action) {
				case 1: //Soldier/Knight
					this_dev_card.mod.addMove(
						`play_knight\t${this_dev_card.mod.game.player}\t${cardobj.card}`
					);
					this_dev_card.mod.endTurn();
					break;
				case 2:
					this_dev_card.mod.year_of_plenty.player =
							this_dev_card.mod.game.player;
					this_dev_card.mod.year_of_plenty.cardname =
							cardobj.card;
					this_dev_card.mod.year_of_plenty.render(card);
					break;
				case 3:
					this_dev_card.mod.monopoly.player =
							this_dev_card.mod.game.player;
					this_dev_card.mod.monopoly.cardname = cardobj.card;
					this_dev_card.mod.monopoly.render(card);
					break;
				case 4:
					this_dev_card.mod.game.state.canPlayCard = false; //No more cards this turn
					this_dev_card.mod.addMove(
						'player_build_road\t' +
								this_dev_card.mod.game.player
					);
					this_dev_card.mod.addMove(
						'player_build_road\t' +
								this_dev_card.mod.game.player
					);
					this_dev_card.mod.addMove(
						`road_building\t${this_dev_card.mod.game.player}\t${cardobj.card}`
					);
					this_dev_card.mod.endTurn();
					break;
				default:
					//victory point
					this_dev_card.mod.addMove(
						`vp\t${this_dev_card.mod.game.player}\t${cardobj.card}`
					);
					this_dev_card.mod.endTurn();
				}

				this_dev_card.mod.game.state.players[this_dev_card.mod.game.player-1].devcards.splice(parseInt(selection), 1);
				this_dev_card.mod.game.state.canPlayCard = false; //No more cards this turn

				if (this_dev_card.mod.game.deck[0].hand.length == 0 && this_dev_card.mod.game.state.players[this_dev_card.mod.game.player-1].devcards.length == 0) {
					$(".controls #playcard").removeClass('enabled');
				}
			};
		});
	}
}

module.exports = DevCardOverlay;
