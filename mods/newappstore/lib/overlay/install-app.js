const InstallAppOverlayTemplate = require('./install-app.template.js');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class AddAppOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);

		this.bin = '';
		this.description = '';
		this.img = '';
		this.module = '';
		this.publisher = '';
		this.request = '';
		this.title = '';
		this.version = '';
		this.category = 'Utility';
		this.tx = null;
		this.tx_json = null;
	}

	render() {
		this.overlay.show(InstallAppOverlayTemplate(this.app, this.mod, this));
		this.attachEvents();
	}

	attachEvents() {
		let this_self = this;

		document.querySelector('#saito-app-install-btn').onclick = (e) => {
			console.log('saving json to archive');


			console.log('tx json:', this_self.tx_json);
			this_self.app.storage.saveLocalApplication(this_self.tx_json, (this_self.title).toLowerCase());

			salert("Module saved. Reloading page...");
		}

	}
}

module.exports = AddAppOverlay;
