const AddAppOverlayTemplate = require('./add-app.template.js');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const InstallOverlay = require('./install-app.js');

class AddAppOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);
		this.installOverlay = new InstallOverlay(app, mod);
	}

	render() {
		this.overlay.show(AddAppOverlayTemplate(this.app, this.mod));
		this.attachEvents();
	}

	attachEvents() {
		let this_self = this;
		this.app.browser.addDragAndDropFileUploadToElement(`saito-app-upload`, async (filesrc) => {
			document.querySelector('.saito-app-upload').innerHTML = 'Uploading file...';
			
			console.log("filesrc: ", filesrc);

			this_self.installOverlay.render();
			this_self.overlay.close();

		});

	}
}

module.exports = AddAppOverlay;
