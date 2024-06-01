const PiracyTemplate = require('./piracy.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class PiracyOverlay {
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

	render(res = {}) {

                this.visible = true;
                this.overlay.show(PiracyTemplate());

		let corsairs_destroyed = 0;

		for (let i = 0; i < res.anti_piracy_rolls.length; i++) {
			let roll = res.anti_piracy_rolls[i];
			let unittype = res.anti_piracy_unittype[i];
			let faction = res.anti_piracy_faction[i];
			let rrclass = '';
			if (roll >= 5) {
				rrclass = 'hit';
				corsairs_destroyed++;
			}
			let html = `
                		<div class="piracy-row">
                			<div class="piracy-unit">${unittype}<div class="piracy-desc">${faction}</div></div>
                			<div class="piracy-roll ${rrclass}">${roll}</div>
                		</div>
              		`;
			this.app.browser.addElementToSelector(html, '.piracy-grid .attacker');
		}

		for (let i = 0; i < res.piracy_rolls.length; i++) {
			let roll = res.piracy_rolls[i];
			let unittype = res.piracy_unittype[i];
			let faction = res.piracy_faction[i];
			let rrclass = '';
			if (roll >= 5) {
				rrclass = 'hit';
			}
			let html = `
                		<div class="piracy-row">
                			<div class="piracy-unit">${unittype}<div class="piracy-desc">${faction}</div></div>
                			<div class="piracy-roll ${rrclass}">${roll}</div>
                		</div>
              		`;
			this.app.browser.addElementToSelector(html, '.piracy-grid .defender');
		}

		if (corsairs_destroyed == 1) {
		  this.updateInstructions(`${corsairs_destroyed} corsair destroyed before Pirate Assault`);
		} else {
		  if (corsairs_destroyed > 1) {
		    this.updateInstructions(`${corsairs_destroyed} corsairs destroyed before Pirate Assault`);
		  }
		}

		this.attachEvents();
	}

	updateInstructions(help = '') {
		let x = document.querySelector('.piracy-overlay .help');
		if (x) {
			x.innerHTML = help;
		}
	}

	attachEvents() {}

}

module.exports = PiracyOverlay;
