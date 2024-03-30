const WinterTemplate = require('./winter.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class WinterOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod, false, true, true);
	}

	hide() {
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

	render(stage = 'stage1') {
		let his_self = this.mod;

		this.overlay.show(WinterTemplate(stage));

	        document.querySelector(`.winter-text ul li.${stage}`).classList.add("active");

		this.pullHudOverOverlay();

		this.attachEvents();
	}

	attachEvents() {
		let his_self = this.mod;

		$('.winter').on('click', function () {
			if (document.querySelector('#confirmit')) {
				$('#confirmit').click();
			}
		});
	}
}

module.exports = WinterOverlay;
