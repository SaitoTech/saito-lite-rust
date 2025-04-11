const FieldBattleTemplate = require('./field-battle.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class FieldBattleOverlay {
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
		let obj = document.querySelector('.field-battle-overlay');
		obj.style.backgroundImage =
			'url(/his/img/backgrounds/fortification.png)';
		obj.style.backgroundSize = 'contain';
		this.updateInstructions('Withdraw Units into Fortification?');
	}

	renderPostFieldBattle(res = {}) {
		this.render(res);
		let obj = document.querySelector('.field-battle-overlay');
		obj.style.backgroundImage =
			'url(/his/img/backgrounds/field_battle.jpg)';
		obj.style.backgroundSize = 'contain';
		this.updateInstructions(
			'Field Battle over in ' + this.mod.game.spaces[res.spacekey].name
		);
	}

	renderFieldBattle(res = {}) {
		this.render(res);
		let obj = document.querySelector('.field-battle-overlay');
		obj.style.backgroundImage =
			'url(/his/img/backgrounds/field_battle.jpg)';
		obj.style.backgroundSize = 'contain';
		this.updateInstructions(
			'Field Battle in ' + this.mod.game.spaces[res.spacekey].name
		);
	}

	renderPreFieldBattle(res = {}) {
		this.render(res, 1);
		let obj = document.querySelector('.field-battle-overlay');
		obj.style.backgroundImage =
			'url(/his/img/backgrounds/field_battle.jpg)';
		obj.style.backgroundSize = 'contain';
		this.updateInstructions(
			'Field Battle imminent in ' +
				this.mod.game.spaces[res.spacekey].name
		);
	}

	assignHits(res = {}, faction = '') {
		let hits_to_assign = res.attacker_hits;
		if (faction === res.attacker_faction) {
			hits_to_assign = res.defender_hits;
		}
		this.assignHitsManually(res, faction, hits_to_assign);
	}

	assignHitsManually(res = {}, faction = '', hits_to_assign = 1) {

		let hits_assignable = 0;
		let hits_assigned = 0;
		let his_self = this.mod;

		this.updateInstructions(
			`Assign <span class="hits_to_assign">${hits_to_assign}</span> Hits`
		);
		this.mod.updateStatus(
			`Assign <span class="hits_to_assign">${hits_to_assign}</span> Hits`
		);

		document.querySelectorAll('.not-assignable').forEach((el) => {
			el.remove();
		});
		document.querySelectorAll('.hits-assignable').forEach((el) => {
try {
			let obj = el.querySelector('.field-battle-unit .field-battle-desc');
			let original_factionspace = obj.innerHTML;
			let factionspace = obj.innerHTML;
			factionspace = factionspace.replace(/<span[^>]*>.*?<\/span>/gs, '');

			let was_this_guy_besieged = false;
			let can_i_kill_this_guy = false;

console.log("HERE: " + was_this_guy_besieged + " --- " + factionspace + " -- " + original_factionspace);

			if (factionspace !== original_factionspace) {
				was_this_guy_besieged = true;
			}

			if (
				factionspace === faction ||
				his_self.returnAllyOfMinorPower(factionspace) === faction ||
				his_self.areAllies(factionspace, faction)
			) {
				can_i_kill_this_guy = true;
			}

			if (can_i_kill_this_guy) {

				if (factionspace) { factionspace.innerHTML += ' (click to assign hit)'; }
				el.classList.add('hits-assignable-hover-effect');
				hits_assignable++;

				el.onclick = (e) => {

					hits_assigned++;
					let hits_left = hits_to_assign - hits_assigned;

					document
						.querySelectorAll('hits_to_assign')
						.forEach((el) => {
							el.innerHTML = hits_left;
						});

					let unit_type = el.getAttribute('data-unit-type');
					let faction = el.getAttribute('data-faction');
					let spacekey = res.spacekey;

					el.remove();

					this.mod.addMove(
						'field_battle_destroy_unit\t' +
							faction +
							'\t' +
							spacekey +
							'\t' +
							unit_type
					);
					if (
						hits_assigned == hits_to_assign ||
						hits_assigned >= hits_assignable
					) {
						document
							.querySelectorAll('.hits-assignable')
							.forEach((el) => {
								el.onclick = (e) => {};
							});
							this.updateInstructions("All Hits Assigned");
						this.mod.endTurn();
					}
				};
			}
} catch (err) {
  console.log("ERROR: " + JSON.stringify(err));
}
		});
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
		let obj = document.querySelector('.field-battle-overlay');
		obj.style.backgroundImage =
			'url(/his/img/backgrounds/field_battle.jpg)';
		obj.style.backgroundSize = 'contain';
		this.updateInstructions('Attackers Win - Close to Continue');
	}

	defendersWin(res) {
		this.pushHudUnderOverlay();
		this.render(res, 0);
		let obj = document.querySelector('.field-battle-overlay');
		obj.style.backgroundImage =
			'url(/his/img/backgrounds/field_battle.jpg)';
		obj.style.backgroundSize = 'contain';
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
		this.overlay.show(FieldBattleTemplate());

		if (pre_battle == 1) {
			res.attacker_modified_rolls = res.attacker_results;
		}
		if (pre_battle == 1) {
			res.defender_modified_rolls = res.defender_results;
		}

		let space = this.mod.game.spaces[res.spacekey];
		let is_besieged = false;
		if (space.besieged != 0) { is_besieged = true; }

		if (res.attacker_modified_rolls) {
			for (let i = 0; i < res.attacker_modified_rolls.length; i++) {

				let roll = res.attacker_modified_rolls[i];
				let unit_type = '';
				let faction_name = '';
				let unit_status = '';
				let previously_besieged_unit = 0;

				if (i < res.attacker_units.length) {
					unit_type = res.attacker_units[i];
					faction_name = res.attacker_units_faction[i];
					previously_besieged_unit = res.attacker_units_relief_force[i];
					if (!previously_besieged_unit && is_besieged == true) {
						unit_status = " (besieged)";
					}
				} else {
					faction_name = 'army leader present';
					unit_type = 'bonus';
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
				if (res.attacker_units_destroyed.includes(i)) {
					assignable = 'destroyed';
					faction_name = 'destroyed';
				}
				if (unit_status != '') {
					unit_status = faction_name + "<span>" + unit_status + "</span>";
				} else {
					unit_status = faction_name;
				}


				let rrclass = '';
				if (roll >= 5) {
					rrclass = 'hit';
				}
				if (pre_battle) {
					roll = '?';
					rrclass = '';
				}

				let html = `
                <div class="field-battle-row ${assignable}" data-unit-type="${unit_type}" data-faction="${faction_name}">
                	<div class="field-battle-unit">${unit_type}<div class="field-battle-desc">${unit_status}</div></div>
                	<div class="field-battle-roll ${rrclass}">${roll}</div>
                </div>
              `;

				this.app.browser.addElementToSelector(
					html,
					'.field-battle-grid .attacker'
				);
			}
		}

		if (res.defender_modified_rolls) {
			for (let i = 0; i < res.defender_modified_rolls.length; i++) {
				let roll = res.defender_modified_rolls[i];
				let unit_type = '';
				let faction_name = '';
				if (i < res.defender_units.length) {
					unit_type = res.defender_units[i];
					faction_name = res.defender_units_faction[i];
				} else {
					unit_type = 'bonus';
					faction_name = 'army leader present';
				}
				let rrclass = '';
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
				if (res.defender_units_destroyed.includes(i)) {
					assignable = 'destroyed';
					faction_name = 'destroyed';
				}
				if (roll >= 5) {
					rrclass = 'hit';
				}
				if (pre_battle) {
					roll = '?';
					rrclass = '';
				}

				let html = `
                <div class="field-battle-row ${assignable}" data-unit-type="${unit_type}" data-faction="${faction_name}">
                	<div class="field-battle-unit">${unit_type}<div class="field-battle-desc">${faction_name}</div></div>
                	<div class="field-battle-roll ${rrclass}">${roll}</div>
                </div>
              `;
				this.app.browser.addElementToSelector(
					html,
					'.field-battle-grid .defender'
				);
			}
		}

		this.attachEvents();
	}

	updateInstructions(help = '') {
		let x = document.querySelector('.field-battle-overlay .help');
		if (x) {
			x.innerHTML = help;
		}
	}

	attachEvents() {}

	showFieldBattleResults(obj) {}
}

module.exports = FieldBattleOverlay;
