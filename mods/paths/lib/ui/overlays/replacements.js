const ReplacementsTemplate = require('./replacements.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ReplacementsOverlay {

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

	render(options=[]) {
		this.visible = true;
		this.overlay.show(ReplacementsTemplate());
		this.attachEvents();
	}

	selectUnits(msg="", html="") {

		let obj = null;

		obj = document.querySelector('.replacements-overlay .mainmenu .sstatus');
		if (!obj) { return; }
		obj.innerHTML = msg;

		obj = document.querySelector('.replacements-overlay .mainmenu .scontrols');
		if (!obj) { return; }
		obj.innerHTML = html;

	}

	hideDestination() {
		let obj = document.querySelector('.replacements-overlay .submenu .dcontrols');
		if (!obj) { return; }
		obj.innerHTML = "";
	}

	selectDestination(msg="", html="") {

		let obj = document.querySelector('.replacements-overlay .submenu .dcontrols');
		if (!obj) { return; }
		obj.innerHTML = html;

	}

	attachEvents(mycallback = null) {

	}

}

module.exports = ReplacementsOverlay;
