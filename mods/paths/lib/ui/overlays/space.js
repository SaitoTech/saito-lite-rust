const SpaceTemplate = require('./space.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class SpaceOverlay {

	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod, false, true, false);
	}

	hide() {
		this.overlay.hide();
	}

	render(spacekey = '') {

		let space = this.mod.game.spaces[spacekey];

		this.overlay.show(SpaceTemplate());

		//
		// add battle information
		//
		document.querySelector(".space-overlay .name").innerHTML = space.name + " - " + space.country;
		let html = "";
		for (let z = 0; z < space.units.length; z++) { html += this.mod.returnUnitImage(space.units[z]); }
		document.querySelector(".space-overlay .units").innerHTML = html;
		document.querySelector(".space-overlay .status").innerHTML = "in supply";
		if (!this.mod.checkSupplyStatus(spacekey)) { document.querySelector(".space-overlay .status").innerHTML = "out-of-supply"; }

		this.attachEvents();

	}
	attachEvents() {
	}

}

module.exports = SpaceOverlay;
