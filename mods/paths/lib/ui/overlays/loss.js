const LossTemplate = require('./loss.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class LossOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod, false, true, false);
		this.faction = '';
		this.units = null;
		this.loss_factor = 0;
		this.starting_units = null;
		this.starting_loss_factor = null;
		this.moves = [];
	}

	hide() {
		this.overlay.hide();
	}

	canTakeMoreLosses() {
		if (this.loss_factor == 0) {
			return false;
		}

		let x = [];
		for (let i = 0; i < this.units.length; i++) {
			x.push([]);
			if (this.units[i].damaged == false) {
				x[i].push(this.units[i].loss);
			}
			if (this.units[i].destroyed == false) {
				x[i].push(this.units[i].rloss);
				if (this.units[i].key.indexOf('army') > 0) {
					let corpskey = this.units[i].key.split('_')[0] + '_corps';
					let cunit = this.mod.cloneUnit(corpskey);
					x[i].push(cunit.loss);
					x[i].push(cunit.rloss);
				}
			}
		}

		for (let i = 0; i < x.length; i++) {
			if (this.loss_factor >= x[i][0]) {
				return true;
			}
		}

		return false;
	}

	returnMaxLossPossible() {
		//
		// associative array with all stepwise losses
		//
		let x = [];
		for (let i = 0; i < this.units.length; i++) {
			x.push([]);
			if (this.units[i].damaged == false) {
				x[i].push(this.units[i].loss);
			}
			x[i].push(this.units[i].rloss);
			if (this.units[i].key.indexOf('army') > 0) {
				let corpskey = this.units[i].key.split('_')[0] + '_corps';
				let cunit = this.mod.cloneUnit(corpskey);
				x[i].push(cunit.loss);
				x[i].push(cunit.rloss);
			}
		}

		//
		// start recursive algorithm at step 0, 0
		//
		let minimum_possible = this.returnMinimumHitPath(
			this.loss_factor,
			x,
			0,
			0
		);

		return minimum_possible;
	}

	returnMinimumHitPath(val, hits, idx1, idx2) {
		let minval = val;

		//
		// if we are out of index, return val
		//
		if (hits.length <= idx1) {
			return val;
		}
		if (hits[idx1].length <= idx2) {
			return val;
		}

		//
		// otherwise calculate new_val (including this spot)
		//
		let new_val = val - hits[idx1][idx2];

		//
		// report back if too low, or exact hit
		//
		if (new_val < 0) {
			return -1;
		}
		if (new_val == 0) {
			return 0;
		}

		//
		// otherwise, this is now our minimum value
		//
		minval = new_val;

		//
		// if we are still above zero, we need to keep exploring
		// down this branch, and potentially calculate every combination
		// including further brances
		//
		if (new_val >= 1) {
			//
			// further down branch
			//
			let x = this.returnMinimumHitPath(new_val, hits, idx1, idx2 + 1);
			if (x == 0) {
				return 0;
			}
			if (x > 0 && x < minval) {
				minval = x;
			}

			//
			// this entry + all subsequent branches
			//
			for (let ii = idx1 + 1; ii < hits.length; ii++) {
				let y = this.returnMinimumHitPath(new_val, hits, ii, 0);
				if (y == 0) {
					return 0;
				}
				if (x > 0 && x < minval) {
					minval = x;
				}
			}
		}

		return minval;
	}

	render(faction = '') {
		this.faction = faction;

		let units;
		let qs = '.loss-overlay .units';

		if (
			faction == this.mod.game.state.combat.attacking_faction ||
			faction === 'attacker'
		) {
			units = this.mod.returnAttackerUnits();
			this.loss_factor = this.mod.game.state.combat.attacker_loss_factor;
		} else {
			units = this.mod.returnDefenderUnits();
			this.loss_factor = this.mod.game.state.combat.defender_loss_factor;
		}
		this.units = JSON.parse(JSON.stringify(units));

		this.starting_units = JSON.parse(JSON.stringify(units));
		this.starting_loss_factor = this.loss_factor;

		//
		// calculate max losses we can take
		//
		this.loss_factor_maximum = this.returnMaxLossPossible();

		this.moves = [];

		this.overlay.show(LossTemplate());
		this.updateLossesRequired(this.loss_factor);

		for (let i = 0; i < units.length; i++) {
			let html = `<div class="loss-overlay-unit" id="${i}">${this.mod.returnUnitImage(
				units[i]
			)}</div>`;
			this.app.browser.addElementToSelector(html, qs);
		}

		this.attachEvents();
	}

	updateLossesRequired(num) {
		document.querySelector('.loss-overlay .help').innerHTML =
			'Losses Required: ' + num;
	}

	attachEvents() {
		if (!this.canTakeMoreLosses()) {
			let c = confirm('Maximum Losses Sustained: Submit?');
			if (c) {
				for (let i = this.moves.length - 1; i >= 0; i--) {
					this.mod.addMove(this.moves[i]);
				}
				this.mod.endTurn();
				this.hide();
				return;
			} else {
				this.moves = [];
				this.render(this.faction);
				return;
			}
		}

		document.querySelectorAll('.loss-overlay-unit').forEach((el) => {
			el.onclick = (e) => {
				let idx = e.currentTarget.id;

				//
				//
				//
				let unit = this.units[idx];

				this.moves.push(`damage\t${unit.spacekey}\t${idx}`);

				if (unit.damaged) {
					this.loss_factor -= unit.rloss;

					unit.damaged = true;
					unit.destroyed = true;

					el.style.opacity = '0.3';
					el.onclick = (e) => {};

					//
					// replace with corps if destroyed
					//
					if (unit.key.indexOf('army')) {
						let corpskey = unit.key.split('_')[0] + '_corps';
						this.units.push(this.mod.cloneUnit(corpskey));
						this.units[this.units.length - 1].spacekey =
							unit.spacekey;
						this.moves.push(`add\t${unit.spacekey}\t${corpskey}`);
						let html = `<div class="loss-overlay-unit" id="${
							this.units.length - 1
						}">${this.mod.returnUnitImage(
							this.units[this.units.length - 1]
						)}</div>`;
						let qs = '.loss-overlay .units';
						this.app.browser.addElementToSelector(html, qs);
						this.attachEvents();
					}

					this.updateLossesRequired(this.loss_factor);
				} else {
					unit.damaged = true;
					this.loss_factor -= unit.loss;
					el.innerHTML = this.mod.returnUnitImage(unit);
					this.updateLossesRequired(this.loss_factor);
				}

				if (!this.canTakeMoreLosses()) {
					document
						.querySelectorAll('.loss-overlay-unit')
						.forEach((el) => {
							el.onclick = (e) => {};
						});
					setTimeout(() => {
						let c = confirm('Maximum Losses Sustained: Submit?');
						if (c) {
							for (let i = this.moves.length - 1; i >= 0; i--) {
								this.mod.addMove(this.moves[i]);
							}
							this.mod.endTurn();
							this.hide();
							return;
						} else {
							this.moves = [];
							this.render(this.faction);
							return;
						}
					}, 50);
				}
			};
		});
	}
}

module.exports = LossOverlay;
