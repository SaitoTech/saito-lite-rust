const ImperiumSpaceCombatOverlayTemplate = require('./space-combat.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class SpaceCombatOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.attacker = null;
		this.defender = null;
		this.sector = null;
		this.visible = 0;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	hide() {
		this.visible = 0;
		this.overlay.hide();
	}

	removeHits() {
		try {
			let qs = `.unit-table.small .unit-element .unit-box`;
			document.querySelector(qs).style.backgroundColor = 'transparent';
			let qsn = `.dice-results .unit-box-num`;
			document.querySelector(qsn).innerHTML = '?';
		} catch (err) {}
	}

	updateStatusAndAcknowledge(msg = '') {
		if (!this.visible) {
			return;
		}
		try {
			this.updateStatus(
				`<div>${msg}</div><ul><li class="option" id="resume">acknowledge</li></ul>`
			);
			$('#resume').on('click', () => {
				this.hide();
				this.restartQueue();
			});
		} catch (err) {
			this.hide();
			this.restartQueue();
		}
	}

	updateStatus(overlay_html) {
		try {
			document.querySelector('.space-combat-menu').innerHTML =
				overlay_html;
		} catch (err) {}
	}

	render(attacker, defender, sector, overlay_html) {
		if (this.mod.anti_fighter_barrage_overlay.visible) {
			this.mod.anti_fighter_barrage_overlay.hide();
		}

		this.attacker = attacker;
		this.defender = defender;
		this.sector = sector;

		if (this.visible && document.querySelector('.space-combat-menu')) {
			document.querySelector('.space-combat-menu').innerHTML =
				overlay_html;
		} else {
			this.visible = 1;
			this.overlay.show(
				ImperiumSpaceCombatOverlayTemplate(
					this.mod,
					attacker,
					defender,
					sector,
					overlay_html
				)
			);
			this.attachEvents();
		}

		//
		// eliminate green
		//
		let qs = `.unit-table.small .unit-element .unit-box`;
		document.querySelector(qs).style.backgroundColor = 'transparent';
	}

	updateHits(attacker, defender, sector, combat_info) {
		console.log('COMBAT INFO: ' + JSON.stringify(combat_info));

		let nth = 1;
		if (combat_info.attacker == 1) {
			nth = 3;
		}

		if (this.visible == 0) {
			this.render(attacker, defender, sector, '');
		}

		//
		// technically attacker could be attacker or defender here
		//
		attacker = combat_info.attacker;

		let current_ship_idx = -2;
		let shot_idx = 0;
		for (let i = 0; i < combat_info.ship_idx.length; i++) {
			if (combat_info.ship_idx[i] > current_ship_idx) {
				current_ship_idx = combat_info.ship_idx[i];
				shot_idx = 0;
			} else {
				shot_idx++;
			}

			if (combat_info.modified_roll[i] >= combat_info.hits_on[i]) {
				let qs = `.player-${attacker}-ship-${current_ship_idx}-shot-${shot_idx} .dice-results`;
				let qsn = `.player-${attacker}-ship-${current_ship_idx}-shot-${shot_idx} .dice-results .unit-box-num`;
				console.log('1 SQN: ' + qsn);
				console.log('ROLL: ' + combat_info.modified_roll[i]);
				document.querySelector(qs).style.backgroundColor = 'green';
				console.log('SET GREEN! ' + qs);
				document.querySelector(qsn).innerHTML =
					combat_info.modified_roll[i];
				console.log('ROLL: ' + combat_info.modified_roll[i]);
			} else {
				let qsn = `.player-${attacker}-ship-${current_ship_idx}-shot-${shot_idx} .dice-results .unit-box-num`;
				console.log('2 SQN: ' + qsn);
				console.log('ROLL: ' + combat_info.modified_roll[i]);
				document.querySelector(qsn).innerHTML =
					combat_info.modified_roll[i];
			}
		}
	}

	attachEvents() {}
}

module.exports = SpaceCombatOverlay;
