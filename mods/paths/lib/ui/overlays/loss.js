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

	showRetreatNotice() {
		try {
		  this.updateInstructions(`<div class="continue_btn">All Possible Damage Assigned - <span style="text-decoration:underline;cursor:pointer">Click to Continue</span></div>`);
		  document.querySelector(".continue_btn").onclick = (e) => {
		    this.hide();
		  }
		} catch (err) {}
	}

	updateInstructions(msg="") {
		let obj = document.querySelector(".loss-overlay .help");
		if (obj) {
			obj.innerHTML = msg;
		}
	}

	renderToAssignAdditionalStepwiseLoss(faction = "") {

		let qs = '.loss-overlay .units';
		let qs_attacker = '.loss-overlay .units.attacker';
		let qs_defender = '.loss-overlay .units.defender';
		let my_qs = '.loss-overlay .units.defender';
		let defender_units = this.mod.returnDefenderUnits();
		this.units = defender_units;

console.log("%");
console.log("%");
console.log("% DEBZUGGING: ");
console.log("%" + JSON.stringify(this.units));
console.log("%");

		this.overlay.show(LossTemplate());
		this.updateInstructions("Defender - Take Additional Hit to Cancel Retreat");

		for (let i = 0; i < defender_units.length; i++) {
			let dkey = defender_units[i].key;
			let dskey = defender_units[i].spacekey;
			let dd = 0; if (defender_units[i].damaged) { dd = 1; }
			html = `<div class="loss-overlay-unit" data-spacekey="${dskey}" data-key="${dkey}" data-damaged="${dd}" id="${i}">${this.mod.returnUnitImageWithMouseoverOfStepwiseLoss(defender_units[i])}</div>`;
			this.app.browser.addElementToSelector(html, qs_defender);
		}

		this.attachEvents(false, ".loss-overlay .units.defender", this.mod.game.state.combat.defender_power, true); // true = 1 more hit!
		this.loss_factor = 0; // this results in canTakeMoreLosses() to return NO after the first hit

	}

	render(faction = '') {

		this.faction = faction;

		let am_i_the_attacker = false;

		let space = this.mod.game.spaces[this.mod.game.state.combat.key];
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
		document.querySelector(".attacker_faction").innerHTML = this.mod.game.state.combat.attacker_power;
		document.querySelector(".defender_faction").innerHTML = this.mod.game.state.combat.defender_power;
		document.querySelector(".attacker_roll").innerHTML = this.mod.game.state.combat.attacker_modified_roll;
		document.querySelector(".defender_roll").innerHTML = this.mod.game.state.combat.defender_modified_roll;
		document.querySelector(".attacker_modifiers").innerHTML = this.mod.game.state.combat.attacker_modified_roll - this.mod.game.state.combat.attacker_roll;
		document.querySelector(".defender_modifiers").innerHTML = this.mod.game.state.combat.defender_modified_roll - this.mod.game.state.combat.defender_roll;
		document.querySelector(".attacker_column_shift").innerHTML = this.mod.game.state.combat.attacker_column_shift;
		document.querySelector(".defender_column_shift").innerHTML = this.mod.game.state.combat.defender_column_shift;
		document.querySelector(".attacker_damage").innerHTML = this.mod.game.state.combat.defender_loss_factor;
		document.querySelector(".defender_damage").innerHTML = this.mod.game.state.combat.attacker_loss_factor;


		//
		// show terrain effects
		//
		document.querySelectorAll(".effects_table .row").forEach((el) => { el.style.display = "none"; });
		document.querySelectorAll(".firing_table .row .col").forEach((el) => { el.style.color = "black"; });
		document.querySelectorAll(".firing_table .row .col").forEach((el) => { el.style.backgroundColor = "transparent"; });

		if (space.terrain == "normal")   { document.querySelector(".effects_table .clear").style.display = "contents"; }
		if (space.terrain == "mountain") { document.querySelector(".effects_table .mountain").style.display = "contents"; }
		if (space.terrain == "swamp")    { document.querySelector(".effects_table .swamp").style.display = "contents"; }
		if (space.terrain == "forest")   { document.querySelector(".effects_table .forest").style.display = "contents"; }
		if (space.terrain == "desert")   { document.querySelector(".effects_table .desert").style.display = "contents"; }
		if (space.trench == 1) 	  	 { document.querySelector(".effects_table .trench1").style.display = "contents"; }
		if (space.trench == 2) 		 { document.querySelector(".effects_table .trench2").style.display = "contents"; }

		//
		// add active card effects
		//
		for (let z = 0; z < this.mod.game.state.cc_allies_active.length; z++) {
		  let cc = this.mod.game.state.cc_allies_active[z];
		  let html = this.mod.popup(cc) + " ";
		  document.querySelector(".other_effects").innerHTML += html;
		}
		for (let z = 0; z < this.mod.game.state.cc_central_active.length; z++) {
		  let cc = this.mod.game.state.cc_central_active[z];
		  let html = this.mod.popup(cc) + " ";
		  document.querySelector(".other_effects").innerHTML += html;
		}

		//
		// 
		//
		let column_number = 0;
		let attacker_column_number = 0;
		let defender_column_number = 0;
		let attacker_table = this.mod.game.state.combat.attacker_table;
		let defender_table = this.mod.game.state.combat.defender_table;
		let attacker_power = this.mod.game.state.combat.attacker_power;
		let defender_power = this.mod.game.state.combat.defender_power;
		let attacker_strength = this.mod.game.state.combat.attacker_strength;
		let defender_strength = this.mod.game.state.combat.defender_strength;
		let attacker_modified_roll = this.mod.game.state.combat.attacker_modified_roll;
		let defender_modified_roll = this.mod.game.state.combat.defender_modified_roll;

		//
		// determine my faction
		//
		let am_iii_the_attacker = false;
		if (this.mod.game.player == this.mod.returnPlayerOfFaction(this.mod.game.state.combat.attacker_power)) { am_iii_the_attacker = true; }

		//
		// show dice rolls
		//
		let attacker_color = "#f2dade";
		let attacker_color_highlight = "#b6344a";
		let defender_color = "#dadcf2";
		let defender_color_highlight = "#343ab6";

		if (defender_power == "central") {
		  let x = defender_color;
		  let y = defender_color_highlight;
		  defender_color = attacker_color;
		  defender_color_highlight = attacker_color_highlight;
		  attacker_color = x;
		  attacker_color_highlight = y;
		}

		if (attacker_table == "army")  {
		  attacker_column_number = this.mod.returnArmyColumnNumber(attacker_strength); 
		  attacker_column_number += this.mod.game.state.combat.attacker_column_shift;
		  if (attacker_column_number < 0) { attacker_column_number = 0; }
		  if (attacker_column_number > 10) { attacker_column_number = 10; }
		  this.highlightFiringTable("army", attacker_color, attacker_color_highlight, attacker_modified_roll, attacker_column_number);
		}
		if (attacker_table == "corps") {
		  attacker_column_number = this.mod.returnCorpsColumnNumber(attacker_strength);
		  attacker_column_number += this.mod.game.state.combat.attacker_column_shift;
		  if (attacker_column_number < 0) { attacker_column_number = 0; }
		  if (attacker_column_number > 9) { attacker_column_number = 9; }
		  this.highlightFiringTable("corps", attacker_color, attacker_color_highlight, attacker_modified_roll, attacker_column_number);
		}
		if (defender_table == "army")  {

	          //
    		  // forts lend their combat strength to the defense
    		  //
    		  if (this.mod.game.spaces[this.mod.game.state.combat.key].fort > 0) {
      		    defender_strength += this.mod.game.spaces[this.mod.game.state.combat.key].fort; 
		  }

		  defender_column_number = this.mod.returnArmyColumnNumber(defender_strength);
		  defender_column_number += this.mod.game.state.combat.defender_column_shift;
		  if (defender_column_number < 0) { defender_column_number = 0; }
		  if (defender_column_number > 10) { defender_column_number = 10; }
		  this.highlightFiringTable("army", defender_color, defender_color_highlight, defender_modified_roll, defender_column_number);
		}
		if (defender_table == "corps") {

	          //
    		  // forts lend their combat strength to the defense
    		  //
    		  if (this.mod.game.spaces[this.mod.game.state.combat.key].fort > 0) {
      		    defender_strength += this.mod.game.spaces[this.mod.game.state.combat.key].fort; 
		  }

		  defender_column_number = this.mod.returnCorpsColumnNumber(defender_strength);
		  defender_column_number += this.mod.game.state.combat.defender_column_shift;
		  if (defender_column_number < 0) { defender_column_number = 0; }
		  if (defender_column_number > 9) { defender_column_number = 9; }
		  this.highlightFiringTable("corps", defender_color, defender_color_highlight, defender_modified_roll, defender_column_number);
		}

		//
		// Update Information Panel 
		//
		if (faction == "attacker") {
	          if (this.mod.game.state.combat.flank_attack == "attacker") {
		    if (am_iii_the_attacker) {
		      this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.attacker_power)} - Assign ${this.loss_factor} Damage Now`);
		    } else {
		      this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.attacker_power)} assigning ${this.loss_factor} hits`);
		    }
	          }
		  if (this.mod.game.state.combat.flank_attack == "defender") {
		    if (am_iii_the_attacker) {
		      this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.attacker_power)} - Assign ${this.loss_factor} Damage Now`);
		    } else {
		      this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.attacker_power)} assigning ${this.loss_factor} hits`);
		    }
		  }
		  if (!this.mod.game.state.combat.flank_attack) {
		    if (am_iii_the_attacker) {
		      this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.attacker_power)} - Assign ${this.loss_factor} Damage Now`);
		    } else {
		      this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.attacker_power)} assigning ${this.loss_factor} hits`);
		    }
		  }
		} else {
	          if (this.mod.game.state.combat.flank_attack == "attacker") {
		    if (am_iii_the_attacker) {
		      this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.defender_power)} assigning ${this.loss_factor} hits`);
		    } else {
		      this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.defender_power)} - Assign ${this.loss_factor} Damage Now`);
		    }
	          }
		  if (this.mod.game.state.combat.flank_attack == "defender") {
		    if (am_iii_the_attacker) {
		      this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.defender_power)} assigning ${this.loss_factor} hits`);
		    } else {
		      this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.defender_power)} - Assign ${this.loss_factor} Damage Now`);
		    }
		  }
		  if (!this.mod.game.state.combat.flank_attack) {
		    if (am_iii_the_attacker) {
		      this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.defender_power)} assigning ${this.loss_factor} hits`);
		    } else {
		      this.updateInstructions(`${this.mod.returnFactionName(this.mod.game.state.combat.defender_power)} - Assign ${this.loss_factor} Damage Now`);
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

	highlightFiringTable(ftable="corps", color="blue", highlight_color="blue", defender_modified_roll=0, defender_column_number=0) {
		let qs = `.${ftable}_firing_table .firing_table `;
	        for (let i = 0; i <= defender_column_number; i++) {
			let obj = document.querySelector(`${qs} .row-${defender_modified_roll} .col-${i}`);
			if (obj.style.color == "black") { obj.style.backgroundColor = color; }
		}
	        for (let i = 0; i < defender_modified_roll; i++) {
			let obj = document.querySelector(`${qs} .row-${i} .col-${defender_column_number}`);
			if (obj.style.color == "black") { obj.style.backgroundColor = color; }
		}
		document.querySelector(`${qs} .row-${defender_modified_roll} .col-${defender_column_number}`).style.backgroundColor = highlight_color;
		document.querySelector(`${qs} .row-${defender_modified_roll} .col-${defender_column_number}`).style.color = "#FFFFFF";
	}



	attachEvents(am_i_the_attacker, my_qs, faction, just_one_more_hit=false) {

		let paths_self = this.mod;

		if (!this.canTakeMoreLosses() && just_one_more_hit == false) {
				for (let i = this.moves.length - 1; i >= 0; i--) {
					paths_self.addMove(this.moves[i]);
				}
				paths_self.endTurn();
				return;
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
				let unit_idx = didx;

				//
				// withdrawal
				//
				if (unit.corps && unit.eligible_for_withdrawal_bonus && paths_self.game.state.events.withdrawal && paths_self.game.state.events.withdrawal_bonus_used != 1) {
				  try { salert("Withdrawal Negates 1 Corps Stepwise Loss..."); } catch (err) {}
				  if (unit.damaged) {
				    this.loss_factor -= unit.rloss;
				  } else {
				    this.loss_factor -= unit.loss;
				  }
				  paths_self.game.state.events.withdrawal_bonus_used = 1;
				}

				if (unit.damaged) {

					this.moves.push(`damage\t${unit_spacekey}\t${unit_key}\t1\t${paths_self.game.player}`);
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

						let corpsbox = "arbox";
						if (paths_self.returnFactionOfPlayer() == "central") { corpsbox = "crbox"; }
						let corpskey = unit.key.split('_')[0] + '_corps';
						let corpsunit = paths_self.cloneUnit(corpskey);
						corpsunit.spacekey = unit.spacekey;
if (paths_self.doesSpaceHaveUnit(corpsbox, corpskey)) {

//
// add new unit
//
						this.units.push(corpsunit);
						if (am_i_the_attacker) {
						  paths_self.game.spaces[corpsunit.spacekey].units.push(corpsunit);
						  paths_self.game.state.combat.attacker.push({ key : paths_self.game.state.combat.key , unit_idx : paths_self.game.spaces[corpsunit.spacekey].units.length-1 , unit_sourcekey : corpsunit.spacekey });
						}
//
// others remove and add too
//
						this.moves.push(`add\t${unit.spacekey}\t${corpskey}\t${this.mod.game.player}`);
						this.moves.push(`remove\t${corpsbox}\t${corpskey}\t${this.mod.game.player}`);
						let html = `<div class="loss-overlay-unit" data-spacekey="${corpsunit.spacekey}" data-key="${corpskey}" data-damaged="0" id="${this.units.length - 1}">${this.mod.returnUnitImageWithMouseoverOfStepwiseLoss(this.units[this.units.length - 1], false, true)}</div>`;
						this.app.browser.addElementToSelector(html, my_qs);
}
		  				this.attachEvents(am_i_the_attacker, my_qs, faction);

					//
					// damage to corps means removal
					//
					} else {					
					}

					//
					// move to eliminated box
					//
                			let f = this.mod.returnPowerOfUnit(unit);
		      			this.updateInstructions(`${this.mod.returnFactionName(this.mod.returnFactionOfPlayer(this.mod.game.player))} - Assign ${this.loss_factor} More Damage`);

				} else {

					this.moves.push(`damage\t${unit_spacekey}\t${unit_key}\t0\t${this.mod.game.player}`);
					unit.damaged = true;
					this.loss_factor -= unit.loss;
					el.innerHTML = this.mod.returnUnitImageWithMouseoverOfStepwiseLoss(unit, false, true);
		      			this.updateInstructions(`${this.mod.returnFactionName(this.mod.returnFactionOfPlayer(this.mod.game.player))} - Assign ${this.loss_factor} More Damage`);

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
							for (let i = this.moves.length - 1; i >= 0; i--) {
								this.mod.addMove(this.moves[i]);
							}
							this.mod.endTurn();
				}

				//
				// negative loss factor = we're cancelling hits
				//
				if (this.loss_factor <= 0) { 
					this.hide();
				}

			};

		});
	}

}

module.exports = LossOverlay;
