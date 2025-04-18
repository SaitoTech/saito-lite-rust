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

	updateInstructions(msg="") {

		let obj = document.querySelector(".loss-overlay .help");
		if (obj) {
			obj.innerHTML = msg;
		}

	}

	renderToAssignAdditionalStewiseLoss(faction = "") {

		let qs = '.loss-overlay .units';
		let qs_attacker = '.loss-overlay .units.attacker';
		let qs_defender = '.loss-overlay .units.defender';
		let my_qs = '.loss-overlay .units.defender';
		let defender_units = this.mod.returnDefenderUnits();

		this.overlay.show(LossTemplate());
		this.updateInstructions("Defender - Take Additional Hit to Cancel Retreat");

		for (let i = 0; i < defender_units.length; i++) {
			let html = `
				<div class="loss-overlay-unit" id="${i}">${this.mod.returnUnitImageWithMouseoverOfStepwiseLoss(defender_units[i])}</div>
			`;
			this.app.browser.addElementToSelector(html, qs_defender);
		}

		this.attachEvents();
		this.loss_factor = 0; // this results in canTakeMoreLosses() to return NO after the first hit

	}

	render(faction = '') {

		this.faction = faction;

		let am_i_the_attacker = false;

		let attacker_units;
		let defender_units;
		let attacker_loss_factor;
		let defender_loss_factor;

		let qs = '.loss-overlay .units';
		let qs_attacker = '.loss-overlay .units.attacker';
		let qs_defender = '.loss-overlay .units.defender';
		let my_qs = '.loss-overlay .units.defender';

		attacker_units = this.mod.returnAttackerUnits();
		defender_units = this.mod.returnDefenderUnits();

console.log(JSON.stringify(this.mod.game.state.combat));
console.log("DEFENDER UNITS: " + JSON.stringify(defender_units));
console.log("ATTACKER UNITS: " + JSON.stringify(attacker_units));

		this.units = defender_units;

		if (
			faction == this.mod.game.state.combat.attacking_faction ||
			faction === 'attacker'
		) {
			am_i_the_attacker = true;
			my_qs = '.loss-overlay .units.attacker';
			this.units = attacker_units;
		}

		if (am_i_the_attacker) {
		  this.starting_units = JSON.parse(JSON.stringify(attacker_units));
		  this.starting_loss_factor = this.mod.game.state.combat.attacker_loss_factor;
		  this.loss_factor = this.starting_loss_factor;
		}  else {
		  this.starting_units = JSON.parse(JSON.stringify(defender_units));
		  this.starting_loss_factor = this.mod.game.state.combat.defender_loss_factor;
		  this.loss_factor = this.starting_loss_factor;
		}

		//
		// calculate max losses we can take
		//
		this.loss_factor_maximum = this.returnMaxLossPossible();

		this.moves = [];

		this.overlay.show(LossTemplate());
		//this.updateLossesRequired(this.loss_factor);

		for (let i = 0; i < attacker_units.length; i++) {
			let html = "";
			let akey = attacker_units[i].key;
			let askey = attacker_units[i].spacekey;
			let ad = 0; if (attacker_units[i].damaged) { ad = 1; }
			if (!attacker_units[i].destroyed) {
				html = `<div class="loss-overlay-unit" data-spacekey="${askey}" data-key="${akey}" data-damaged="${ad}" id="${i}">${this.mod.returnUnitImageWithMouseoverOfStepwiseLoss(attacker_units[i])}</div>`;
			}
			this.app.browser.addElementToSelector(html, qs_attacker);
		}


		for (let i = 0; i < defender_units.length; i++) {
			let html = "";
			let dkey = defender_units[i].key;
			let dskey = defender_units[i].spacekey;
			let dd = 0; if (defender_units[i].damaged) { dd = 1; }
			if (!defender_units[i].destroyed) {
				html = `<div class="loss-overlay-unit" data-spacekey="${dskey}" data-key="${dkey}" data-damaged="${dd}" id="${i}">${this.mod.returnUnitImageWithMouseoverOfStepwiseLoss(defender_units[i])}</div>`;
			}
			this.app.browser.addElementToSelector(html, qs_defender);
		}

		//
		// add battle information
		//
		document.querySelector(".attacker.faction").innerHTML = this.mod.game.state.combat.attacker_power;
		document.querySelector(".defender.faction").innerHTML = this.mod.game.state.combat.defender_power;
		document.querySelector(".attacker.power").innerHTML = this.mod.game.state.combat.attacker_strength;
		document.querySelector(".defender.power").innerHTML = this.mod.game.state.combat.defender_strength;
		document.querySelector(".attacker.roll").innerHTML = this.mod.game.state.combat.attacker_modified_roll;
		document.querySelector(".defender.roll").innerHTML = this.mod.game.state.combat.defender_modified_roll;
		document.querySelector(".attacker.hits").innerHTML = this.mod.game.state.combat.defender_loss_factor;
		document.querySelector(".defender.hits").innerHTML = this.mod.game.state.combat.attacker_loss_factor;

		if (this.mod.game.state.combat.winner == "attacker") {
			document.querySelector(".attacker.hits").style.backgroundColor = "yellow";
		}
		if (this.mod.game.state.combat.winner == "defender") {
			document.querySelector(".defender.hits").style.backgroundColor = "yellow";
		}


//
// HACK - bad var name, but debugging
//
let am_iii_the_attacker = false;
if (this.mod.game.player == this.mod.returnPlayerOfFaction(this.mod.game.state.combat.attacker_power)) { am_iii_the_attacker = true; }


if (faction == "attacker") {
	        if (this.mod.game.state.combat.flank_attack == "attacker") {
		  if (am_iii_the_attacker) {
		    this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.attacker_power)} - assign hits`);
		  } else {
		    this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.defender_power)} - opponent assigning hits`);
		  }
	        }
		if (this.mod.game.state.combat.flank_attack == "defender") {
		  if (am_iii_the_attacker) {
		    this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.attacker_power)} - assign hits first`);
		  } else {
		    this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.defender_power)} - opponent assigning hits`);
		  }
		}
		if (!this.mod.game.state.combat.flank_attack) {
		  if (am_iii_the_attacker) {
		    this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.attacker_power)} - assign hits`);
		  } else {
		    this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.defender_power)} - opponent assigning hits`);
		  }
		}
} else {
	        if (this.mod.game.state.combat.flank_attack == "attacker") {
		  if (am_iii_the_attacker) {
		    this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.attacker_power)} - opponent assigning hits`);
		  } else {
		    this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.defender_power)} - assign hits first`);
		  }
	        }
		if (this.mod.game.state.combat.flank_attack == "defender") {
		  if (am_iii_the_attacker) {
		    this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.attacker_power)} - opponent assigning hits`);
		  } else {
		    this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.defender_power)} - assign hits`);
		  }
		}
		if (!this.mod.game.state.combat.flank_attack) {
		  if (am_iii_the_attacker) {
		    this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.attacker_power)} - opponent assigning hits`);
		  } else {
		    this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.defender_power)} - assign hits`);
		  }
		}
}


		if (am_iii_the_attacker == 1 && faction == "attacker") {
		  this.attachEvents(am_i_the_attacker, my_qs, faction);
		}
		if (am_iii_the_attacker == 0 && faction == "defender") {
		  this.attachEvents(am_i_the_attacker, my_qs, faction);
		}

	}

	updateLossesRequired(num) {
		document.querySelector('.loss-overlay .help').innerHTML = num + ' More Losses Required';
	}

	attachEvents(am_i_the_attacker, my_qs ,faction) {

		if (!this.canTakeMoreLosses()) {
			//let c = confirm('Maximum Losses Sustained: Submit?');
			//if (c) {
				for (let i = this.moves.length - 1; i >= 0; i--) {
					this.mod.addMove(this.moves[i]);
				}
				this.mod.endTurn();
				this.hide();
				return;
			//} else {
			//	this.moves = [];
			//	this.render(this.faction);
			//	return;
			//}
		}


		document.querySelectorAll(my_qs + " .loss-overlay-unit").forEach((el) => {

			el.onclick = (e) => {

				let idx = e.currentTarget.id;
				let unit = this.units[idx];
				if (unit.destroyed) { alert("destroyed"); }
				let unit_key = e.currentTarget.dataset.key;
				let unit_spacekey = e.currentTarget.dataset.spacekey;
				let unit_damaged = 0; if (parseInt(e.currentTarget.dataset.damaged)) { unit_damaged = 1; }

				let didx = idx;

				if (unit.damaged) {

					this.moves.push(`damage\t${unit_spacekey}\t${unit_key}\t1\t${this.mod.game.player}`);

					this.loss_factor -= unit.rloss;

					unit.damaged = true;
					unit.destroyed = true;

					el.style.opacity = '0.3';
					el.onclick = (e) => {};
					el.id = "destroyed_unit";

					//
					// replace with corps if destroyed
					//
					if (unit.key.indexOf('army') > 0) {

						let corpskey = unit.key.split('_')[0] + '_corps';
						let corpsunit = this.mod.cloneUnit(corpskey);
						corpsunit.spacekey = unit.spacekey;
						this.units.push(corpsunit);
						this.moves.push(`add\t${unit.spacekey}\t${corpskey}\t${this.mod.game.player}`);
						let html = `<div class="loss-overlay-unit" data-spacekey="${corpsunit.spacekey}" data-key="${corpskey}" data-damaged="0" id="${this.units.length - 1}">${this.mod.returnUnitImageWithMouseoverOfStepwiseLoss(this.units[this.units.length - 1], false, true)}</div>`;
						this.app.browser.addElementToSelector(html, my_qs);
		  				this.attachEvents(am_i_the_attacker, my_qs, faction);

					//
					// damage to corps means removal
					//
					} else {					
					}

					//
					// move to eliminated box
					//
                			let f = this.returnPowerOfUnit(unit);
					if (f === "central") {
					  this.moveUnit(spacekey, unit_idx, "ceubox");
					} else {
					  this.moveUnit(spacekey, unit_idx, "aeubox");
					}

					this.updateLossesRequired(this.loss_factor);

				} else {

					this.moves.push(`damage\t${unit_spacekey}\t${unit_key}\t0\t${this.mod.game.player}`);
					unit.damaged = true;
					this.loss_factor -= unit.loss;
					el.innerHTML = this.mod.returnUnitImageWithMouseoverOfStepwiseLoss(unit, false, true);
					this.updateLossesRequired(this.loss_factor);

				}

				//
				// redisplay space
				//
				this.mod.displaySpace(this.mod.game.state.combat.key);

				if (!this.canTakeMoreLosses()) {
					document
						.querySelectorAll('.loss-overlay-unit')
						.forEach((el) => {
							el.onclick = (e) => {};
						});
					setTimeout(() => {
						//let c = confirm('Maximum Losses Sustained: Submit?');
						//if (c) {
							for (let i = this.moves.length - 1; i >= 0; i--) {
								this.mod.addMove(this.moves[i]);
							}
							this.mod.endTurn();
							this.hide();
							return;
					}, 50);
				}
			};
		});
	}
}

module.exports = LossOverlay;
