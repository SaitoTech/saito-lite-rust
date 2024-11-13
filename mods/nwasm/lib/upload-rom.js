const UploadRomOverlayTemplate = require('./upload-rom.template');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');

class UploadRomOverlay {
	constructor(app, mod = null, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.overlay = new SaitoOverlay(app, mod, false);
	}

	render() {
		this.overlay.show(UploadRomOverlayTemplate(this.app, this.mod));
		this.attachEvents();
	}

	attachEvents() {
		let app = this.app;
		let mod = this.mod;

		let uploader = this;

		try {
			//
			// upload rom file
			//
			app.browser.addDragAndDropFileUploadToElement(
				'nwasm-upload-overlay',
				async (file) => {
					let obj;

					obj = document.querySelector('.nwasm-upload-overlay');
					obj.classList.add('nwasm-upload-overlay-dark');

					obj = document.querySelector('.preloader');
					obj.innerHTML = 'initializing may take a minute...';
					obj.classList.add('nwasm-preloader-dark');

					obj = document.querySelector('.nwasm-upload-instructions');
					obj.innerHTML = 'uploading ROM file...';

					obj = document.querySelector('.loader');
					obj.style.display = 'block';

					mod.active_rom = file;

					let a = Buffer.from(file, 'binary').toString('base64');
					let ab = mod.convertBase64ToByteArray(a);

					//
					// initialize ROM gets the ROM the APP and the MOD
					myApp.initializeRom(ab, app, mod);
					mod.startPlaying();
					mod.ui.hide();
				},
				false,
				true
			); // true = read as array buffer
		} catch (err) {
			console.log('ROM file upload error: ' + err);
		}
	}
}

module.exports = UploadRomOverlay;
