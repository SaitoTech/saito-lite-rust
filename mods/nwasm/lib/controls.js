const ControlsTemplate = require('./controls.template');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');

class ControlsOverlay {
	constructor(app, mod = null, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.overlay = new SaitoOverlay(app, mod, false);
	}

	render() {
		this.overlay.show(ControlsTemplate(this.app, this.mod));
		this.attachEvents();
	}

	attachEvents() {
		let controls = this;

		try {
			console.log('attaching controls...');
		} catch (err) {
			console.log('Error attaching events to controls ' + err);
		}
	}
}

module.exports = ControlsOverlay;
