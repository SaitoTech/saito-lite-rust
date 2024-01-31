const ImperiumGroundCombatOverlayTemplate = require('./ground-combat.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class GroundCombatOverlay {
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

	updateStatus(attacker, defender, sector, planet_idx, overlay_html) {
		if (this.visible == 0) {
			this.render(attacker, defender, sector, planet_idx, overlay_html);
		} else {
			try {
				document.querySelector('.ground-combat-menu').innerHTML =
					overlay_html;
			} catch (err) {}
		}
	}

	removeHits() {
		try {
			let qs = `.unit-table.small .unit-element .unit-box`;
			document.querySelector(qs).style.backgroundColor = 'transparent';
			let qsn = `.dice-results .unit-box-num`;
			document.querySelector(qsn).innerHTML = '?';
		} catch (err) {}
	}

	render(attacker, defender, sector, planet_idx, overlay_html) {
		this.attacker = attacker;
		this.defender = defender;
		this.sector = sector;

		if (this.visible && document.querySelector('.ground-combat-menu')) {
			this.overlay.show(
				ImperiumGroundCombatOverlayTemplate(
					this.mod,
					attacker,
					defender,
					sector,
					planet_idx,
					overlay_html
				)
			);
			this.attachEvents();
		} else {
			this.visible = 1;
			this.overlay.show(
				ImperiumGroundCombatOverlayTemplate(
					this.mod,
					attacker,
					defender,
					sector,
					planet_idx,
					overlay_html
				)
			);
			this.attachEvents();
		}
	}

	updateHits(attacker, defender, sector, planet_idx, combat_info) {
		let nth = 1;
		if (combat_info.attacker == 1) {
			nth = 3;
		}

		if (this.visible == 0) {
			this.render(attacker, defender, sector, planet_idx, '');
		}

		//
		// technically attacker could be attacker or defender here
		//
		attacker = combat_info.attacker;

		let current_infantry_idx = -1;
		let shot_idx = 0;
		for (let i = 0; i < combat_info.infantry_idx.length; i++) {
			if (combat_info.infantry_idx[i] > current_infantry_idx) {
				current_infantry_idx = combat_info.infantry_idx[i];
				shot_idx = 0;
			} else {
				shot_idx++;
			}
			if (combat_info.modified_roll[i] >= combat_info.hits_on[i]) {
				let qs = `.player-${attacker}-ship-${current_infantry_idx}-shot-${shot_idx} .dice-results`;
				let qsn = `.player-${attacker}-ship-${current_infantry_idx}-shot-${shot_idx} .dice-results .unit-box-num`;
				document.querySelector(qs).style.backgroundColor = 'green';
				document.querySelector(qsn).innerHTML =
					combat_info.modified_roll[i];
			} else {
				let qsn = `.player-${attacker}-ship-${current_infantry_idx}-shot-${shot_idx} .dice-results .unit-box-num`;
				document.querySelector(qsn).innerHTML =
					combat_info.modified_roll[i];
			}
		}
	}

	attachEvents() {}
}

module.exports = GroundCombatOverlay;
