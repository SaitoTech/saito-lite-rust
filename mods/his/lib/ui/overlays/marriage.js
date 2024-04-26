const MarriageTemplate = require('./marriage.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class MarriageOverlay {

	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod);
		this.selected = [];
		this.bonus = 0;
		this.roll = 0;
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

	render(faction = 'france') {

		let his_self = this.mod;

		this.overlay.show(MarriageTemplate());

		for (let i = 0; i < 7; i++) {
			tileqs = `.marriage-overlay .tile${i+1}`;
			let obj = document.querySelector(tileqs);
			obj.classList.add(`henry_viii_marital_status`);
			obj.classList.add(`henry_viii_marital_status${i+1}`);
                        if (i == his_self.game.state.henry_viii_marital_status) {
			  obj.classList.add("active");
			}
                        if (i > his_self.game.state.henry_viii_marital_status) {
			  obj.classList.add(`show_wife`);
			}
		}
	}

}

module.exports = MarriageOverlay;
