const InstallAppOverlayTemplate = require('./install-app.template.js');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class AddAppOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);

		this.bin = '';
		this.description = '';
		this.image = '';
		this.module = '';
		this.publisher = '';
		this.request = '';
		this.name = '';
		this.version = '';
		this.categories = 'Utility';
		this.tx = null;
		this.tx_json = null;
		this.slug = null;
	}

	render() {
		this.overlay.show(InstallAppOverlayTemplate(this.app, this.mod, this));
		this.attachEvents();
	}

	attachEvents() {
		try {
			let this_self = this;

			document.querySelector('#saito-app-install-btn').onclick = async (e) => {

				let mod_data = await this_self.app.storage.loadLocalApplications(this_self.slug);

				console.log('mod_data:',mod_data);
				console.log('mod_data length:',mod_data.length);

				// check if dynamic application already installed
				if (mod_data.length > 0) {
					let c = await sconfirm(`Application '${this_self.slug}' already exist. Do you want to overwrite it?`);
				
					// prompt user if they want to overwrite or cancel install
					if (c) {
						// remove old application 
						await this_self.app.storage.removeLocalApplication(this_self.slug);
						await this_self.installApp();
					} else {
						this_self.overlay.close();
					}
				} else {
					await this_self.installApp();
				}
				
			}
		} catch(err) {
			console.error("Error: ", err);
			salert("An error occurred while installing application. Check console for details.");
		}

	}

	async installApp() {
		let this_self = this;
		await this_self.app.storage.saveLocalApplication((this_self.name).toLowerCase(), this_self.bin);

		salert("Applicaton saved. Reloading page...");
		this_self.overlay.close();

		reloadWindow(1500);
	}
}

module.exports = AddAppOverlay;
