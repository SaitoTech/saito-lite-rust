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
			(obj) => {
				this.render();
			}
		);
	}

	render() {
		this.overlay.show(AddAppOverlayTemplate(this.app, this.mod));
		this.attachEvents();
	}

	attachEvents() {
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
			this_self.installOverlay.category = msg.category;
			this_self.installOverlay.description = msg.description;
			this_self.installOverlay.img = msg.img;
			this_self.installOverlay.module = msg.module;
			this_self.installOverlay.publisher = msg.publisher;
			this_self.installOverlay.request = msg.request;
			this_self.installOverlay.title = msg.title;
			this_self.installOverlay.version = msg.version;
			this_self.installOverlay.tx = newtx;
			this_self.installOverlay.tx_json = data;

			this_self.installOverlay.render();
			this_self.overlay.close();

		}, true, false, true);

	}
}

module.exports = AddAppOverlay;
