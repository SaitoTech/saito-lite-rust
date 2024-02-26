const WarTemplate = require('./war.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class WarOverlay {

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
		let overlay_zindex = parseInt(this.overlay.zIndex);
		if (document.querySelector('.hud')) {
			document.querySelector('.hud').style.zIndex = overlay_zindex + 1;
			this.mod.hud.zIndex = overlay_zindex + 1;
		}
	}
	pushHudUnderOverlay() {
		let overlay_zindex = parseInt(this.overlay.zIndex);
		if (document.querySelector('.hud')) {
			document.querySelector('.hud').style.zIndex = overlay_zindex - 2;
			this.mod.hud.zIndex = overlay_zindex - 2;
		}
	}

	assignHits(res = {}, faction = '') {
		let hits_to_assign = res.attacker_hits;
		if (faction === res.attacker_faction) {
			hits_to_assign = res.defender_hits;
		}
		this.assignHitsManually(res, faction, hits_to_assign);
	}

	assignHitsManually(res = {}, faction = '', hits_to_assign = 1) {
		console.log('Assign Hits Manually!');

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
			let factionspace = el.querySelector('.war-desc').innerHTML;
			let can_i_kill_this_guy = false;

			if (
				factionspace === faction ||
				his_self.returnAllyOfMinorPower(factionspace) === faction ||
				his_self.game.player ===
					his_self.returnPlayerCommandingFaction(faction)
			) {
				can_i_kill_this_guy = true;
			}
			console.log('can I kill this guy? : ' + can_i_kill_this_guy);

			if (can_i_kill_this_guy) {
				if (factionspace) {
					factionspace.innerHTML += ' (click to assign hit)';
				}
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
						this.mod.endTurn();
					}
				};
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
		let obj = document.querySelector('.war-overlay');
		obj.style.backgroundImage =
			'url(/his/img/backgrounds/field_battle.jpg)';
		obj.style.backgroundSize = 'contain';
		this.updateInstructions('Attackers Win - Close to Continue');
	}

	defendersWin(res) {
		this.pushHudUnderOverlay();
		this.render(res, 0);
		let obj = document.querySelector('.war-overlay');
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
		this.overlay.show(WarTemplate());

		if (pre_battle == 1) {
			res.attacker_modified_rolls = res.attacker_results;
		}
		if (pre_battle == 1) {
			res.defender_modified_rolls = res.defender_results;
		}

		console.log('RES: ' + JSON.stringify(res));

		if (res.attacker_modified_rolls) {
			for (let i = 0; i < res.attacker_modified_rolls.length; i++) {
				let roll = res.attacker_modified_rolls[i];
				let unit_type = '';
				let faction_name = '';
				if (i < res.attacker_units.length) {
					unit_type = res.attacker_units[i];
					faction_name = res.attacker_units_faction[i];
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
				let rrclass = '';
				if (roll >= 5) {
					rrclass = 'hit';
				}
				if (pre_battle) {
					roll = '?';
					rrclass = '';
				}

				let html = `
                <div class="war-row ${assignable}" data-unit-type="${unit_type}" data-faction="${faction_name}">
                	<div class="war-unit">${unit_type}<div class="war-desc">${faction_name}</div></div>
                	<div class="war-roll ${rrclass}">${roll}</div>
                </div>
              `;
				this.app.browser.addElementToSelector(
					html,
					'.war-grid .attacker'
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
                <div class="war-row ${assignable}" data-unit-type="${unit_type}" data-faction="${faction_name}">
                	<div class="war-unit">${unit_type}<div class="war-desc">${faction_name}</div></div>
                	<div class="war-roll ${rrclass}">${roll}</div>
                </div>
              `;
				this.app.browser.addElementToSelector(
					html,
					'.war-grid .defender'
				);
			}
		}

		this.attachEvents();
	}

	updateInstructions(help = '') {
		let x = document.querySelector('.war-overlay .help');
		if (x) {
			x.innerHTML = help;
		}
	}

	attachEvents() {}

	showWarResults(obj) {}
}

module.exports = WarOverlay;
