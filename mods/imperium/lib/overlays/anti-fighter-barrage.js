const ImperiumAntiFighterBarrageOverlayTemplate = require('./anti-fighter-barrage.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class AntiFighterBarrageOverlay {
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
				`<div>${msg}</div><ul><li class="option acknowledge_it" id="acknowledge_it">acknowledge</li></ul>`
			);
			// ACKNOWLEDGE or playerAcknowledgeNotice should attach event to this UI element
			$('.acknowledge_it').on('click', () => {
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
			document.querySelector('.anti-fighter-barrage-menu').innerHTML =
				overlay_html;
		} catch (err) {}
	}

	render(attacker, defender, sector, overlay_html) {
		this.attacker = attacker;
		this.defender = defender;
		this.sector = sector;

		if (
			this.visible &&
			document.querySelector('.anti-fighter-barrage-menu')
		) {
			document.querySelector('.anti-fighter-barrage-menu').innerHTML =
				overlay_html;
		} else {
			this.visible = 1;
			this.overlay.show(
				ImperiumAntiFighterBarrageOverlayTemplate(
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

	updateHits(attacker, defender, sector, combat_info) {
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

		let current_ship_idx = -1;
		let shot_idx = 0;
		for (let i = 0; i < combat_info.ship_idx.length; i++) {
			if (combat_info.ship_idx[i] > current_ship_idx) {
				current_ship_idx = combat_info.ship_idx[i];
				shot_idx = 0;
			} else {
				shot_idx++;
			}
			if (combat_info.modified_roll[i] >= combat_info.hits_on[i]) {
				let qs = `.player-afb-${attacker}-ship-${current_ship_idx}-shot-${shot_idx} .dice-results`;
				let qsn = `.player-afb-${attacker}-ship-${current_ship_idx}-shot-${shot_idx} .dice-results .unit-box-num`;
				document.querySelector(qs).style.backgroundColor = 'green';
				document.querySelector(qsn).innerHTML =
					combat_info.modified_roll[i];
			} else {
				let qsn = `.player-afb-${attacker}-ship-${current_ship_idx}-shot-${shot_idx} .dice-results .unit-box-num`;
				document.querySelector(qsn).innerHTML =
					combat_info.modified_roll[i];
			}
		}
	}

	attachEvents() {}
}

module.exports = AntiFighterBarrageOverlay;
