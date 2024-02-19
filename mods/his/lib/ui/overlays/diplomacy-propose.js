const DiplomacyProposeTemplate = require('./diplomacy-propose.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class DiplomacyProposeOverlay {

	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	hide() {
		this.overlay.hide();
		return;
	}

	render() {
	  this.overlay.show(DiplomacyProposeTemplate(this));
    	  this.attachEvents();
	}

	attachEvents() {


	}

}

module.exports = DiplomacyProposeOverlay;

