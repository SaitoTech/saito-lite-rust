const NavalMovementTemplate = require('./language-zone.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class NavalMovementOverlay {
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

	render(mycallback = null) {
		this.visible = true;
		this.overlay.show(NavalMovementTemplate());
		this.attachEvents(mycallback);
	}

	selectDestination(html="") {

		let obj = document.querySelector('.naval-movement-overlay .destination .dcontrols');
		if (!obj) {
			return;
		}

		obj.innerHTML = html;

	}

	attachEvents(mycallback = null) {

	}

}

module.exports = NavalMovementOverlay;
