const BuildOverlayTemplate = require('./build.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class BuildOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	render() {
		this.overlay.show(BuildOverlayTemplate(this.app, this.mod, this));
		this.attachEvents();
	}

	checkAndReturnResource(resource, resource_count) {
		let track_resource = [];
		let player = this.mod.game.player;
		let myBank = this.mod.game.state.players[player - 1].resources.slice();

		for (let i = 0; i < myBank.length; i++) {
			if (myBank[i] == resource) {
				track_resource.push(myBank[i]);
			}
		}

		let html = ``;
		for (let i = 0; i < resource_count; i++) {
			if (track_resource.length > 0) {
				html += this.returnCardImg(resource, false);
				track_resource.shift();
			} else {
				html += this.returnCardImg(resource, true);
			}
		}

		return html;
	}

	returnCardImg(resource, disabled = false) {
		return `<img class="${
			disabled ? `settlers-card-disabled` : ``
		}" src="/settlers/img/cards/${resource}.png">`;
	}

	attachEvents() {
		let this_self = this;

		document.querySelectorAll('.settlers-item-row').forEach((item) => {
			item.onclick = (e) => {
				e.preventDefault();
				e.stopImmediatePropagation();

				let id = e.currentTarget.getAttribute('id');
				let disabled = e.currentTarget.classList.contains(
					'settlers-row-disabled'
				);

				if (!disabled) {
					this_self.overlay.close();

					document
						.querySelectorAll('.settlers-item-row')
						.forEach((row) => {
							row.onclick = (e) => {};
						});

					if (id === '0') {
						this_self.mod.addMove(
							`player_build_road\t${this_self.mod.game.player}\t0\t1`
						);
					}
					if (id === '1') {
						this_self.mod.addMove(
							`player_build_city\t${this_self.mod.game.player}\t1`
						);
					}
					if (id === '2') {
						this_self.mod.addMove(
							'player_upgrade_city\t' + this_self.mod.game.player
						);
					}
					if (id === '3') {
						//have everyone update game state
						this_self.mod.addMove(
							'buy_card\t' + this_self.mod.game.player
						);
						// Deck #1 = deck[0] = devcard deck
						//get card from deck
						this_self.mod.addMove(
							'SAFEDEAL\t1\t' + this_self.mod.game.player + '\t1'
						);

						this_self.mod.updateStatusWithOptions("decrypting action card", "WAIT");
						this_self.mod.animateDevCard(this_self.mod.game.player);
					}
					let purchase = parseInt(id);
					if (purchase >= 0 && purchase <= 3) {
						let cost = this_self.mod.priceList[purchase];
						for (let resource of cost) {
							//Put the spends on the front of the move, so we can maybe cancel the building action
							this_self.mod.addMove(
								'spend_resource\t' +
									this_self.mod.game.player +
									'\t' +
									resource
							);
						}
						this_self.mod.endTurn();
					} else {
						//console.log("Unexpected selection for player move:",id);
					}

				}
			};
		});
	}
}

module.exports = BuildOverlay;
