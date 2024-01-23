const SaitoModuleTemplate = require('./saito-module.template');
const SaitoOverlay = require('./../../ui/saito-overlay/saito-overlay');

class SaitoModule {
	constructor(app, mod, callback = null) {
		this.app = app;
		this.mod = mod;
		this.callback = callback;
		this.overlay = new SaitoOverlay(app, mod);
	}

	render() {
		this.overlay.show(
			SaitoModuleTemplate(this.app, this.mod),
			this.callback
		);
		this.attachEvents();
	}

	attachEvents() {
		this.mod.loadSettings('.saito-module-settings');
	}
}

module.exports = SaitoModule;
