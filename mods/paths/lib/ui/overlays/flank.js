const FlankTemplate = require('./flank.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class FlankOverlay {
	constructor(app, mod, c1, c2, c3) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod, true, false, false);
	}

	remove() {
		this.overlay.remove();
	}

	hide() {
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
		//
		// push GAME HUD under overlay
		//
		let overlay_zindex = parseInt(this.overlay.zIndex);
		if (document.querySelector('.hud')) {
			document.querySelector('.hud').style.zIndex = overlay_zindex - 2;
			this.mod.hud.zIndex = overlay_zindex - 2;
		}
	}

	render() {
		this.overlay.show(FlankTemplate());
		this.pushHudUnderOverlay();
	}

	attachEvents() {}
}

module.exports = FlankOverlay;
