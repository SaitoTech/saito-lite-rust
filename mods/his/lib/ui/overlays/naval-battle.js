const NavalBattleTemplate = require('./naval-battle.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class NavalBattleOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod);
	}

	hide() {
		this.visible = false;
		this.overlay.hide();
	}

	pullHudOverOverlay() {
		//
		// pull GAME HUD over overlay
		//
		let overlay_zindex = parseInt(this.overlay.zIndex);
		if (document.querySelector('.hud')) {
			document.querySelector('.hud').style.zIndex = overlay_zindex + 1;
			this.mod.hud.zIndex = overlay_zindex + 1;
		}
	}
	pushHudUnderOverlay() {
		//
		// push GAME HUD under overlay
		//
		let overlay_zindex = parseInt(this.overlay.zIndex);
		if (document.querySelector('.hud')) {
			document.querySelector('.hud').style.zIndex = overlay_zindex - 2;
			this.mod.hud.zIndex = overlay_zindex - 2;
		}
	}

	renderFortification(res = {}) {
		this.render(res);
		let obj = document.querySelector('.naval-battle-overlay');
		obj.style.backgroundImage =
			'url(/his/img/backgrounds/fortification.png)';
		obj.style.backgroundSize = 'cover';
		this.updateInstructions(
			'A Naval Battle imminent in ' +
				this.mod.returnSpaceName(res.spacekey) +
				': Fortification?'
		);
	}

	renderPostNavalBattle(res = {}) {
		this.render(res);
		let obj = document.querySelector('.naval-battle-overlay');
		obj.style.backgroundImage =
			'url(/his/img/backgrounds/naval_battle.png)';
		obj.style.backgroundSize = 'cover';
		this.updateInstructions(
			'Naval Battle over in ' + this.mod.returnSpaceName(res.spacekey)
		);
	}

	renderNavalBattle(res = {}) {
		this.render(res);
		let obj = document.querySelector('.naval-battle-overlay');
		obj.style.backgroundImage =
			'url(/his/img/backgrounds/naval_battle.png)';
		obj.style.backgroundSize = 'cover';
		this.updateInstructions(
			'Naval Battle in ' + this.mod.returnSpaceName(res.spacekey)
		);
	}

	renderPreNavalBattle(res = {}) {
		this.render(res, 1);
		let obj = document.querySelector('.naval-battle-overlay');
		obj.style.backgroundImage =
			'url(/his/img/backgrounds/naval_battle.png)';
		obj.style.backgroundSize = 'cover';
		this.updateInstructions(
			'Naval Battle imminent in ' + this.mod.returnSpaceName(res.spacekey)
		);
	}

	assignHits(res = {}, faction = '') {
		let hits_to_assign = res.attacker_hits;
		if (this.mod.returnPlayerCommandingFaction(faction) === this.mod.returnPlayerCommandingFaction(res.attacker_faction)) {
			hits_to_assign = res.defender_hits;
		}
		this.assignHitsManually(res, faction, hits_to_assign);
	}

	assignHitsManually(res = {}, faction = '', hits_to_assign = 1) {

		let hits_assignable = 0;
		let hits_assigned = 0;
		let his_self = this.mod;
		let hitstext = ' Hits';
		let undestroyed_corsairs = 0;
		let undestroyed_squadrons = 0;
		if (hits_to_assign == 1) {
			hitstext = ' Hit';
		}

		let did_i_lose_and_need_to_assign_last_hit = false;
		if (this.mod.game.state.naval_battle.attacker_hits > this.mod.game.state.naval_battle.defender_hits && this.mod.returnControllingPower(faction) == this.mod.returnControllingPower(this.mod.game.state.naval_battle.defender_faction)) { did_i_lose_and_need_to_assign_last_hit = true; }
		if (this.mod.game.state.naval_battle.attacker_hits <= this.mod.game.state.naval_battle.defender_hits && this.mod.returnControllingPower(faction) == this.mod.returnControllingPower(this.mod.game.state.naval_battle.attacker_faction)) { did_i_lose_and_need_to_assign_last_hit = true; }


		this.updateInstructions(
			`Assign <span class="hits_to_assign">${hits_to_assign}</span> ${hitstext} (squadrons take 2 hits)`
		);
		this.mod.updateStatus(
			`Assign <span class="hits_to_assign">${hits_to_assign}</span> ${hitstext} (squadrons take 2 hits)`
		);

		let qs1 = '.attacker .not-assignable';
		let qs2 = '.attacker .hits-assignable';

		if (this.mod.returnPlayerCommandingFaction(faction) === this.mod.returnPlayerCommandingFaction(res.defender_faction)) {
			qs1 = '.defender .not-assignable';
			qs2 = '.defender .hits-assignable';
		}

		document.querySelectorAll(qs1).forEach((el) => {
			el.remove();
		});

		//
		// count undestroyed corsairs
		//
		document.querySelectorAll(qs2).forEach((el) => {
			let unit_type = el.getAttribute('data-unit-type');
			if (unit_type == "corsair") { undestroyed_corsairs++; }
			if (unit_type == "squadron") { undestroyed_squadrons++; }
		});


		document.querySelectorAll(qs2).forEach((el) => {
try {
			let factionspace = el.querySelector('.naval-battle-desc').innerHTML;
			let can_i_kill_this_guy = false;

			if (
				factionspace === faction ||
				his_self.returnAllyOfMinorPower(factionspace) === faction ||
				his_self.game.player === his_self.returnPlayerCommandingFaction(faction)
			) {
				can_i_kill_this_guy = true;
			}

			if (can_i_kill_this_guy) {

				if (factionspace) {
					let obj = el.querySelector('.naval-battle-desc');
					if (obj) {
						obj.innerHTML += ' (click to assign hit)';
					}
				}
				el.classList.add('hits-assignable-hover-effect');

				let unit_type = el.getAttribute('data-unit-type');

				hits_assignable++;
				if (unit_type === 'squadron') {
					hits_assignable++;
				}

				el.onclick = (e) => {

					let hits_left = hits_to_assign - hits_assigned;

					//
					// loser needs to assign the last hit
					//
					if (undestroyed_corsairs == 0 && undestroyed_squadrons > 0 && did_i_lose_and_need_to_assign_last_hit == true) {
						if (hits_left == 1) {
							hits_left = 2;
						}
					}


					let this_unit_type = e.currentTarget.getAttribute('data-unit-type');

					if (hits_left > 1 && this_unit_type == "corsair" && undestroyed_squadrons > 0) {
						alert("You must assign hits to Squadrons before Corsairs...");
						return;
					}

					if (hits_left == 1 && this_unit_type == "squadron") {
						alert("You must assign your last hit to a Corsair...");
						return;
					}

					if (hits_left == 2 && this_unit_type == "corsair") {
						if (undestroyed_corsairs <= 1 && undestroyed_squadrons > 0) {
							alert("You must assign your last two hits to a Squadron...");
							return;
						}
					}

					document
						.querySelectorAll('hits_to_assign')
						.forEach((el2) => {
							el2.innerHTML = hits_left;
						});

					let unit_type = el.getAttribute('data-unit-type');
					let faction = el.getAttribute('data-faction');
					let spacekey = res.spacekey;

					hits_assigned++;
					if (unit_type === 'squadron') {
						hits_assigned++;
					}
					hits_left = hits_to_assign - hits_assigned;

					if (hits_left > 0) {
						this.mod.updateStatus(
							`Assign <span class="hits_to_assign">${hits_left}</span> Hits`
						);
					}

					el.remove();

					this.mod.addMove(
						'naval_battle_destroy_unit\t' +
							faction +
							'\t' +
							spacekey +
							'\t' +
							unit_type
					);


					//
					// loser needs to assign the last hit if squadron remains
					//
					if (undestroyed_squadrons > 1 && did_i_lose_and_need_to_assign_last_hit == true) {
						if (hits_left == 1) {
							hits_left = 2;
						}
					}


					//
					// Ottoman may have corsairs which can be destroyed in 1 hit
					//
					if (
						hits_left == 0 ||
						hits_assigned == hits_to_assign ||
						hits_assigned >= hits_assignable ||
						(undestroyed_corsairs == 0 && hits_left == 1 && hits_assignable % 2 == 0)
					) {
						document
							.querySelectorAll('.hits-assignable')
							.forEach((el3) => {
								el3.onclick = (e) => {};
							});
						this.updateInstructions(
							`Cannot Assign More Hits (squadrons take 2 hits to destroy) - close to continue`
						);
						this.mod.endTurn();
						return;
					}
				};
			}
} catch (err) {
  console.log("#");
  console.log("#");
  console.log("# naval battle error? " + JSON.stringify(err));
  console.log("#");
  console.log("#");
  alert("error assigning hits -- please check console.log!");
}
		});

		if (hits_to_assign > hits_assignable) {
			hits_to_assign = hits_assignable;
			hits_left = hits_to_assign;
		}
		if (
			hits_assigned == hits_to_assign ||
			hits_assigned >= hits_assignable ||
			(hits_to_assign == 1 && hits_assignable % 2 == 0)
		) {
			document.querySelectorAll('.hits-assignable').forEach((el) => {
				el.onclick = (e) => {};
			});
			this.updateInstructions(
				`Cannot Assign More Hits (squadrons take 2 hits to destroy) - close to continue`
			);
			if (
				this.mod.game.player ==
				this.mod.returnPlayerCommandingFaction(faction)
			) {
				this.mod.endTurn();
			}
			return;
		}

		if (faction != '') {
			if (
				this.mod.game.player ==
				this.mod.returnPlayerCommandingFaction(faction)
			) {
				this.mod.updateStatus(
					`Assign <span class="hits_to_assign">${hits_to_assign}</span> Hits`
				);
			} else {
				this.updateInstructions(
					this.mod.returnFactionName(faction) + ' Assigning Hits'
				);
			}
		} else {
			this.updateInstructions('Assigning Hits');
		}
	}

	attackersWin(res) {
		this.pushHudUnderOverlay();
		this.render(res, 0);
		let obj = document.querySelector('.naval-battle-overlay');
		obj.style.backgroundImage =
			'url(/his/img/backgrounds/naval_battle.png)';
		obj.style.backgroundSize = 'cover';
		this.updateInstructions('Attackers Win - Close to Continue');
	}

	defendersWin(res) {
		this.pushHudUnderOverlay();
		this.render(res, 0);
		let obj = document.querySelector('.naval-battle-overlay');
		obj.style.backgroundImage =
			'url(/his/img/backgrounds/naval_battle.png)';
		obj.style.backgroundSize = 'cover';
		this.updateInstructions('Defenders Win - Close to Continue');
	}

	render(res = {}, pre_battle = 0) {
		let am_i_attacker = false;
		let am_i_defender = false;

		if (
			this.mod
				.returnPlayerFactions(this.mod.game.player)
				.includes(res.attacker_faction) ||
			this.mod.returnPlayerCommandingFaction(res.attacker_faction) ==
				this.mod.game.player
		) {
			am_i_attacker = true;
		}
		if (
			this.mod
				.returnPlayerFactions(this.mod.game.player)
				.includes(res.defender_faction) ||
			this.mod.returnPlayerCommandingFaction(res.defender_faction) ==
				this.mod.game.player
		) {
			am_i_defender = true;
		}

		this.visible = true;
		this.overlay.show(NavalBattleTemplate());

		if (pre_battle == 1) {
			res.attacker_modified_rolls = res.attacker_results;
		}
		if (pre_battle == 1) {
			res.defender_modified_rolls = res.defender_results;
		}

		console.log('RES: ' + JSON.stringify(res));

		let modified_rolls_idx = 0;

		//
		// attacker units first!
		//
		for (let i = 0; i < res.attacker_units.length; i++) {
			let roll = res.attacker_modified_rolls[modified_rolls_idx];
			let unit_type = res.attacker_units[i];
			let faction_name = res.attacker_units_faction[i];
			let faction_owner = faction_name;
			if (res.attacker_units_owners.length > i) { faction_owner = res.attacker_units_owners[i]; }
			let how_many_hits = 1;
			if (unit_type === 'squadron') {
				how_many_hits = 2;
			}

			let assignable = '';
			if (am_i_attacker) {
				assignable = ' not-assignable';
			}
			if (
				[
					'regular',
					'mercenary',
					'squadron',
					'cavalry',
					'corsair'
				].includes(unit_type)
			) {
				if (am_i_attacker) {
					assignable = ' hits-assignable';
				}
			}

			for (let z = 0; z < how_many_hits; z++) {
				let hit_number = '';

				if (z > 0) {
					modified_rolls_idx++;
					roll = res.attacker_modified_rolls[modified_rolls_idx];
					assignable = ' not-assignable';
					hit_number = ' (2nd shot)';
				}

				if (res.attacker_units_destroyed.includes(i)) {
					assignable = 'destroyed';
					faction_name = 'destroyed';
				}
				let rrclass = '';
				if (roll >= 5) {
					rrclass = 'hit';
				}
				if (pre_battle) {
					roll = '?';
					rrclass = '';
				}

				if (faction_owner != faction_name) { faction_name = faction_name + " / " + faction_owner; }

				let html = `
              <div class="naval-battle-row ${assignable}" data-unit-type="${unit_type}" data-faction="${faction_name}">
                <div class="naval-battle-unit">${unit_type}<div class="naval-battle-desc">${faction_name}${hit_number}</div></div>
                 	<div class="naval-battle-roll ${rrclass}">${roll}</div>
                </div>
          `;
				this.app.browser.addElementToSelector(
					html,
					'.naval-battle-grid .attacker'
				);
			}

			modified_rolls_idx++;
		}

		while (modified_rolls_idx < res.attacker_modified_rolls.length) {
			let faction_name = 'navy leader';
			let unit_type = 'bonus';
			let roll = res.attacker_modified_rolls[modified_rolls_idx];
			let assignable = ' not-assignable';
			let rrclass = '';

			if (roll >= 5) {
				rrclass = 'hit';
			}
			if (pre_battle) {
				roll = '?';
				rrclass = '';
			}

			let html = `
              <div class="naval-battle-row ${assignable}" data-unit-type="${unit_type}" data-faction="${faction_name}">
                <div class="naval-battle-unit">${unit_type}<div class="naval-battle-desc">${faction_name}</div></div>
                 	<div class="naval-battle-roll ${rrclass}">${roll}</div>
                </div>
          `;
			this.app.browser.addElementToSelector(
				html,
				'.naval-battle-grid .attacker'
			);
			modified_rolls_idx++;
		}

		//
		// defender next
		//
		modified_rolls_idx = 0;
		for (let i = 0; i < res.defender_units.length; i++) {
			let roll = res.defender_modified_rolls[modified_rolls_idx];
			let unit_type = res.defender_units[i];
			let faction_name = res.defender_units_faction[i];
			let faction_owner = faction_name;
			if (res.defender_units_owners.length > i) { faction_owner = res.defender_units_owners[i]; }
			let how_many_hits = 1;
			if (unit_type === 'squadron') {
				how_many_hits = 2;
			}

			let assignable = '';
			if (am_i_defender) {
				assignable = ' not-assignable';
			}
			if (
				[
					'regular',
					'mercenary',
					'squadron',
					'cavalry',
					'corsair'
				].includes(unit_type)
			) {
				if (am_i_defender) {
					assignable = ' hits-assignable';
				}
			}

			for (let z = 0; z < how_many_hits; z++) {
				let hit_number = '';

				if (z > 0) {
					modified_rolls_idx++;
					roll = res.defender_modified_rolls[modified_rolls_idx];
					assignable = ' not-assignable';
					hit_number = ' (2nd shot)';
				}

				if (res.defender_units_destroyed.includes(i)) {
					assignable = 'destroyed';
					faction_name = 'destroyed';
				}
				let rrclass = '';
				if (roll >= 5) {
					rrclass = 'hit';
				}
				if (pre_battle) {
					roll = '?';
					rrclass = '';
				}

				if (faction_owner != faction_name) { faction_name = faction_name + " / " + faction_owner; }

				let html = `
              <div class="naval-battle-row ${assignable}" data-unit-type="${unit_type}" data-faction="${faction_name}">
                <div class="naval-battle-unit">${unit_type}<div class="naval-battle-desc">${faction_name}${hit_number}</div></div>
                 	<div class="naval-battle-roll ${rrclass}">${roll}</div>
                </div>
            `;
				this.app.browser.addElementToSelector(
					html,
					'.naval-battle-grid .defender'
				);
			}

			modified_rolls_idx++;
		}

		while (modified_rolls_idx < res.defender_modified_rolls.length) {
			let faction_name = 'navy leader';
			let unit_type = 'bonus';
			let roll = res.defender_modified_rolls[modified_rolls_idx];
			let assignable = ' not-assignable';
			let rrclass = '';

			if (roll >= 5) {
				rrclass = 'hit';
			}
			if (pre_battle) {
				roll = '?';
				rrclass = '';
			}

			let html = `
              <div class="naval-battle-row ${assignable}" data-unit-type="${unit_type}" data-faction="${faction_name}">
                <div class="naval-battle-unit">${unit_type}<div class="naval-battle-desc">${faction_name}</div></div>
                 	<div class="naval-battle-roll ${rrclass}">${roll}</div>
                </div>
          `;
			this.app.browser.addElementToSelector(
				html,
				'.naval-battle-grid .defender'
			);
			modified_rolls_idx++;
		}

		this.attachEvents();
	}

	updateInstructions(help = '') {
		let x = document.querySelector('.naval-battle-overlay .help');
		if (x) {
			x.innerHTML = help;
		}
	}

	attachEvents() {}

	showNavalBattleResults(obj) {}
}

module.exports = NavalBattleOverlay;
