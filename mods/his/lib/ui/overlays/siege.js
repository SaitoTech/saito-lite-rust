const AssaultTemplate = require('./siege.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class AssaultOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod);
	}

	hide() {
		this.visible = false;
		this.pushHudUnderOverlay();
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

	renderPostAssault(res = {}) {
		this.render(res);
		let obj = document.querySelector('.siege-overlay');
		obj.style.backgroundImage = 'url(/his/img/backgrounds/siege.png)';
		obj.style.backgroundSize = 'cover';
		this.updateInstructions(
			'Assault over in ' + this.mod.game.spaces[res.spacekey].name
		);
	}

	renderAssault(res = {}) {
		this.render(res);
		let obj = document.querySelector('.siege-overlay');
		obj.style.backgroundImage = 'url(/his/img/backgrounds/siege.png)';
		obj.style.backgroundSize = 'cover';
		this.updateInstructions(
			'Assault in ' + this.mod.game.spaces[res.spacekey].name
		);
	}

	renderPreAssault(res = {}) {
		this.render(res, 1);
		let obj = document.querySelector('.siege-overlay');
		obj.style.backgroundImage = 'url(/his/img/backgrounds/siege.png)';
		obj.style.backgroundSize = 'cover';
		this.updateInstructions(
			'Assault imminent in ' + this.mod.game.spaces[res.spacekey].name
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

		let am_i_attacker = false;
		let am_i_defender = false;

		if (
			this.mod.game.player ==
			this.mod.returnPlayerCommandingFaction(res.attacker_faction)
		) {
			am_i_attacker = true;
		}
		if (
			this.mod.game.player ==
			this.mod.returnPlayerCommandingFaction(res.defender_faction)
		) {
			am_i_defender = true;
		}

		this.pushHudUnderOverlay();

		let side = '.attacker';
		if (this.mod.returnPlayerCommandingFaction(faction) != this.mod.returnPlayerCommandingFaction(res.attacker_faction)) {
			side = '.defender';
		}

		//
		// remove abstract entries
		//
		document
			.querySelectorAll(`.siege-grid ${side} .siege-row`)
			.forEach((el) => {
				el.remove();
			});

		//
		// replace with actual units
		//
		if (side === '.attacker') {
			let faction_name = '';
			for (let i = 0; i < res.attacker_units_units.length; i++) {
				let roll = 'x';
				let unit_type = res.attacker_units_units[i].type;
				if (res.attacker_units_faction[i]) {
					faction_name = res.attacker_units_faction[i];
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
				let html = `
                <div class="siege-row ${assignable}" data-unit-type="${unit_type}" data-faction="${faction_name}">
                        <div class="siege-unit">${unit_type}<div class="siege-desc">${faction_name}</div></div>
                        <div class="siege-roll ${rrclass}">${roll}</div>
                </div>
              `;
				this.app.browser.addElementToSelector(
					html,
					'.siege-grid .attacker'
				);
			}
		} else {
			let faction_name = '';
			for (let i = 0; i < res.defender_units_units.length; i++) {
				let roll = 'x';
				let unit_type = res.defender_units_units[i].type;
				if (res.defender_units_faction[i]) {
					faction_name = res.defender_units_faction[i];
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
				if (res.defender_units_destroyed.includes(i)) {
					assignable = 'destroyed';
					faction_name = 'destroyed';
				}
				let rrclass = '';
				let html = `
                <div class="siege-row ${assignable}" data-unit-type="${unit_type}" data-faction="${faction_name}">
                        <div class="siege-unit">${unit_type}<div class="siege-desc">${faction_name}</div></div>
                        <div class="siege-roll ${rrclass}">${roll}</div>
                </div>
              `;
				this.app.browser.addElementToSelector(
					html,
					'.siege-grid .defender'
				);
			}
		}

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
			let obj = el.querySelector('.siege-desc');
			if (obj) {
				let factionspace = el.querySelector('.siege-desc').innerHTML;
				let can_i_kill_this_guy = false;

				if (
					factionspace === faction ||
					his_self.returnAllyOfMinorPower(factionspace) === faction
				) {
					can_i_kill_this_guy = true;
				}

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
							'siege_destroy_unit\t' +
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
							this.pushHudUnderOverlay();
							this.overlay.hide();
						}
					};
				}
			}
		});
		if (faction != '') {
			if (
				this.mod.game.player == this.mod.returnPlayerOfFaction(faction)
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
		let obj = document.querySelector('.siege-overlay');
		obj.style.backgroundImage = 'url(/his/img/backgrounds/siege.png)';
		obj.style.backgroundSize = 'cover';
		this.updateInstructions('Attackers Win - Close to Continue');
	}

	defendersWin(res) {
		this.pushHudUnderOverlay();
		this.render(res, 0);
		let obj = document.querySelector('.siege-overlay');
		obj.style.backgroundImage = 'url(/his/img/backgrounds/siege.png)';
		obj.style.backgroundSize = 'cover';
		this.updateInstructions('Defenders Win - Close to Continue');
	}

	render(res = {}, pre_battle = 0) {
		let am_i_attacker = false;
		let am_i_defender = false;

		if (
			this.mod
				.returnPlayerFactions(this.mod.game.player)
				.includes(res.attacker_faction)
		) {
			am_i_attacker = true;
		}
		if (
			this.mod
				.returnPlayerFactions(this.mod.game.player)
				.includes(res.defender_faction)
		) {
			am_i_defender = true;
		}

		this.visible = true;
		this.overlay.show(AssaultTemplate());
		this.updateInstructions("Assault in " + this.mod.returnSpaceName(res.spacekey)) ;

		if (pre_battle == 1) {
			res.attacker_modified_rolls = res.attacker_results;
		}
		if (pre_battle == 1) {
			res.defender_modified_rolls = res.defender_results;
		}

		if (res.attacker_modified_rolls) {
			let faction_name = '';
			for (let i = 0; i < res.attacker_modified_rolls.length; i++) {
				let roll = res.attacker_modified_rolls[i];
				let unit_type = 'assault';
				if (res.attacker_units_faction[i]) {
					faction_name = res.attacker_units_faction[i];
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
                <div class="siege-row" data-unit-type="${unit_type}" data-faction="${faction_name}">
                	<div class="siege-unit">${unit_type}<div class="siege-desc">${faction_name}</div></div>
                	<div class="siege-roll ${rrclass}">${roll}</div>
                </div>
              `;
				this.app.browser.addElementToSelector(
					html,
					'.siege-grid .attacker'
				);
			}
		}


		if (res.defender_modified_rolls) {
			let faction_name = '';
			for (let i = 0; i < res.defender_modified_rolls.length; i++) {
				let roll = res.defender_modified_rolls[i];
				let unit_type = 'assault';
				if (res.defender_units_faction[i]) {
					faction_name = res.defender_units_faction[i];
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
                <div class="siege-row" data-unit-type="${unit_type}" data-faction="${faction_name}">
                	<div class="siege-unit">${unit_type}<div class="siege-desc">${faction_name}</div></div>
                	<div class="siege-roll ${rrclass}">${roll}</div>
                </div>
              `;
				this.app.browser.addElementToSelector(
					html,
					'.siege-grid .defender'
				);
			}
		}

		this.attachEvents();
	}

	updateInstructions(help = '') {
		let x = document.querySelector('.siege-overlay .help');
		if (x) {
			x.innerHTML = help;
		}
	}

	attachEvents() {}

	showAssaultResults(obj) {}
}

module.exports = AssaultOverlay;
