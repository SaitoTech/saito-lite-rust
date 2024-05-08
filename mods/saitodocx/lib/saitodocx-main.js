const SaitoDocxMainTemplate = require('./saitodocx-main.template');
const SaitoDocxCreate = require('./saitodocx-create');

class SaitoDocxMain {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;

		this.create = new SaitoDocxCreate(app, mod);

		app.connection.on('saitodocx-render-request', () => {
			this.render();
		});
	}

	async render() {
		//
		// Wipe the main container and create a fresh build render main template
		//
		if (document.getElementById('saitodocx-main-container') != null) {
			this.app.browser.replaceElementBySelector(
				SaitoDocxMainTemplate(),
				'#saitodocx-main-container'
			);
		} else {
			this.app.browser.addElementToDom(SaitoDocxMainTemplate());
		}

		this.attachEvents();
	}

	attachEvents() {
		let this_self = this;
		if (document.getElementById('saitodocx-create-new')) {
			document.getElementById('saitodocx-create-new').onclick = () => {
				console.log('clicked on btn //');
				this_self.app.connection.emit('saitodocx-create-render-request', {});
			};
		}
	}
}

module.exports = SaitoDocxMain;
