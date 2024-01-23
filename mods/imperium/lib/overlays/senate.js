const ImperiumSenateOverlayTemplate = require('./senate.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class SenateOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	hide() {
		this.visible = 0;
		this.overlay.hide();
	}

	render() {
		this.visible = 1;
		this.overlay.show(
			ImperiumSenateOverlayTemplate(
				this.mod,
				attacker,
				defender,
				sector,
				overlay_html
			)
		);
		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = SenateOverlay;
