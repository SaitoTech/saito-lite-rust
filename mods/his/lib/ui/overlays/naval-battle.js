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
		if (hits_to_assign == 1) {
			hitstext = ' Hit';
		}

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
		document.querySelectorAll(qs2).forEach((el) => {
try {
			let factionspace = el.querySelector('.naval-battle-desc').innerHTML;
			let can_i_kill_this_guy = false;

			if (
				factionspace === faction ||
				his_self.returnAllyOfMinorPower(factionspace) === faction ||
				his_self.game.player ===
					his_self.returnPlayerCommandingFaction(faction)
			) {
				can_i_kill_this_guy = true;
			}

			if (can_i_kill_this_guy) {
				if (factionspace) {
					factionspace.innerHTML += ' (click to assign hit)';
				}
				el.classList.add('hits-assignable-hover-effect');

				let unit_type = el.getAttribute('data-unit-type');

				hits_assignable++;
				if (unit_type === 'squadron') {
					hits_assignable++;
				}

				el.onclick = (e) => {
					document
						.querySelectorAll('hits_to_assign')
						.forEach((el) => {
							el.innerHTML = hits_left;
						});

					let unit_type = el.getAttribute('data-unit-type');
					let faction = el.getAttribute('data-faction');
					let spacekey = res.spacekey;

					hits_assigned++;
					if (unit_type === 'squadron') {
						hits_assigned++;
					}
					let hits_left = hits_to_assign - hits_assigned;

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
					if (
						hits_left == 0 ||
						hits_assigned == hits_to_assign ||
						hits_assigned >= hits_assignable ||
						(hits_left == 1 && hits_assignable % 2 == 0)
					) {
						document
							.querySelectorAll('.hits-assignable')
							.forEach((el) => {
								el.onclick = (e) => {};
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
