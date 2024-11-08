const AddAppOverlayTemplate = require('./add-app.template.js');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const InstallOverlay = require('./install-app.js');
const Transaction = require('../../../../lib/saito/transaction').default;

class AddAppOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);
		this.installOverlay = new InstallOverlay(app, mod);

		this.app.connection.on(
			'saito-app-app-render-request',
			() => {
				this.render();
			}
		);
	}

	render() {
		this.overlay.show(AddAppOverlayTemplate(this.app, this.mod));
		this.attachEvents();
	}

	attachEvents() {
		try {
			let this_self = this;
			this.app.browser.addDragAndDropFileUploadToElement(`saito-app-upload`, async (filesrc) => {
				document.querySelector('.saito-app-upload').innerHTML = 'Uploading file...';
				
				let data = JSON.parse(filesrc);

				console.log('data:', data);

				let newtx = new Transaction();
	          	newtx.deserialize_from_web(this_self.app, data);

	          	let msg = newtx.returnMessage();

	          	console.log("uploaded tx msg: ", msg);

				this_self.installOverlay.bin = msg.bin;
				this_self.installOverlay.categories = msg.categories;
				this_self.installOverlay.description = msg.description;
				this_self.installOverlay.image = msg.image;
				this_self.installOverlay.publisher = msg.publisher;
				this_self.installOverlay.request = msg.request;
				this_self.installOverlay.name = msg.name;
				this_self.installOverlay.version = msg.version;
				this_self.installOverlay.tx = newtx;
				this_self.installOverlay.tx_json = data;
				this_self.installOverlay.slug = msg.slug;

				this_self.installOverlay.render();
				this_self.overlay.close();

			}, true, false, true);

		} catch(err) {
			console.error("Error: ", err);
			salert("An error occurred while getting application details. Check console for details.");
		}

	}
}

module.exports = AddAppOverlay;
