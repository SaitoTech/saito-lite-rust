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
		document.querySelector(".space-overlay .units").innerHTML = JSON.stringify(space.units, null, 2);	
		document.querySelector(".space-overlay .details").innerHTML = JSON.stringify(space, null, 2);

		this.attachEvents();

	}
	attachEvents() {
	}

}

module.exports = SpaceOverlay;
