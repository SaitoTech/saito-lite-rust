const FortificationOverlayTemplate = require('./fortification.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class FortificationOverlay {

	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	hide() {
		this.overlay.hide();
		return;
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

	render(
		mobj,
		units_to_move = null,
		selectUnitsInterface = null,
		finishAndFortify = null,
		unfortification_mode = 0
	) {

		let his_self = this.mod;
		if (!mobj.unmoved_units) { mobj.unmoved_units = []; }
		if (!mobj.moved_units) { mobj.moved_units = []; }

		//
		// create list of figures in each space
		//
		let moved_units = mobj.moved_units;
		let unmoved_units = mobj.unmoved_units;
		let destination_units = [];

		this.overlay.show(FortificationOverlayTemplate(mobj, his_self));

		this.pushHudUnderOverlay();

		if (unfortification_mode == 1) {
		  document.querySelector(".fortification-from").innerHTML = "Under Seige";
		  document.querySelector(".fortification-to").innerHTML = "Field Battle";
		  document.querySelector(".fortification-submit-button").innerHTML = "Confirm and Join Battle";
		}

		this.attachEvents(obj);
	}

	attachEvents(obj) {}
}

module.exports = FortificationOverlay;
