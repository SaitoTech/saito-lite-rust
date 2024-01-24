const ImperiumUpgradesOverlayTemplate = require('./upgrades.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class UpgradesOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	render(obj) {
		console.log('OBJ: ' + JSON.stringify(obj));

		this.overlay.show(ImperiumUpgradesOverlayTemplate(this.mod, obj.tech));
		this.overlay.setBackground(obj.img);
		this.attachEvents();
	}

	attachEvents() {
		document.querySelector('.saito-overlay').onclick = (e) => {
			this.overlay.hide();
		};
	}
}

module.exports = UpgradesOverlay;
