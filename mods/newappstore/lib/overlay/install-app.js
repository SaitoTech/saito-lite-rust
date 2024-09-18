const InstallAppOverlayTemplate = require('./install-app.template.js');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class AddAppOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);
	}

	render() {
		this.overlay.show(InstallAppOverlayTemplate(this.app, this.mod));
		this.attachEvents();
	}

	attachEvents() {

		document.querySelector('#saito-app-install-btn').onclick = (e) => {
			alert('saving json to archive');
		}

	}
}

module.exports = AddAppOverlay;
