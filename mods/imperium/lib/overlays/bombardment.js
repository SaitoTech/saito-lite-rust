const ImperiumBombardmentOverlayTemplate = require('./bombardment.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class BombardmentOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
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
				if (document.querySelector('.acknowledge')) {
					document.querySelector('.acknowledge').click();
				}
			});
		} catch (err) {
			this.hide();
		}
	}

	updateStatus(overlay_html) {
		try {
			document.querySelector('.bombardment-menu').innerHTML =
				overlay_html;
		} catch (err) {}
	}

	render(attacker, defender, sector, planet_idx, overlay_html) {
		this.attacker = attacker;
		this.defender = defender;
		this.sector = sector;

		if (this.visible && document.querySelector('.bombardment-menu')) {
			document.querySelector('.bombardment-menu').innerHTML =
				overlay_html;
		} else {
			this.visible = 1;
			this.overlay.show(
				ImperiumBombardmentOverlayTemplate(
					this.mod,
					attacker,
					defender,
					sector,
					overlay_html
				)
			);
			this.attachEvents();
		}
	}

	updateHits(attacker, defender, sector, planet_idx, combat_info) {
		if (this.visible == 0) {
			this.render(attacker, defender, sector, planet_idx, '');
		}

		//
		// technically attacker could be attacker or defender here
		//
		attacker = combat_info.attacker;

		let current_ship_idx = -1;
		let shot_idx = 0;
		for (let i = 0; i < combat_info.ship_idx.length; i++) {
			if (combat_info.ship_idx[i] > current_ship_idx) {
				current_ship_idx = combat_info.ship_idx[i];
				shot_idx = 0;
			} else {
				shot_idx++;
			}
			console.log('ROLL IS: ' + combat_info.modified_roll[i]);
			console.log('HITS ON: ' + combat_info.hits_on[i]);
			if (combat_info.modified_roll[i] >= combat_info.hits_on[i]) {
				let qs = `.player-bb-${attacker}-ship-${current_ship_idx}-shot-${shot_idx} .dice-results`;
				let qsn = `.player-bb-${attacker}-ship-${current_ship_idx}-shot-${shot_idx} .dice-results .unit-box-num`;
				document.querySelector(qs).style.backgroundColor = 'green';
				document.querySelector(qsn).innerHTML =
					combat_info.modified_roll[i];
				console.log('updating: ' + qsn);
				console.log('to: ' + combat_info.modified_roll[i]);
			} else {
				let qsn = `.player-bb-${attacker}-ship-${current_ship_idx}-shot-${shot_idx} .dice-results .unit-box-num`;
				console.log('updating: ' + qsn);
				console.log('to: ' + combat_info.modified_roll[i]);
				document.querySelector(qsn).innerHTML =
					combat_info.modified_roll[i];
			}
		}
	}

	attachEvents() {}
}

module.exports = BombardmentOverlay;
