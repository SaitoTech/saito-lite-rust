const PhotoUploaderTemplate = require('./photo-uploader.template');
const SaitoOverlay = require('../../../lib/saito/ui/saito-overlay/saito-overlay');
const PhotoCropper = require('./photo-cropper');

class PhotoUploader {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod);
		this.photoCropper = new PhotoCropper(this.app, this.mod);
		this.callbackAfterUpload = null;

		this.photoCropper.callbackAfterCrop = (image) => {
			this.image = image;
			this.photoCropper.overlay.remove();
			this.handleRender();
		};
	}
	render(image) {
		this.overlay.show(PhotoUploaderTemplate(this.app, this.mod));
		this.image = image;
		this.handleRender();
		this.attachEvents();
	}

	showPhotoCrop() {
		document.querySelector('#photo-uploader');
	}

	attachEvents() {
		this.app.browser.addDragAndDropFileUploadToElement(
			'photo-uploader',
			async (result) => {
				try {
					this.photoCropper.render(result);
				} catch (error) {
					console.error('Error handling the uploaded image: ', error);
				}
			}
		);

		document.querySelector('.edit-photo').onclick = (e) => {
			this.photoCropper.render(this.image);
			e.stopPropagation();

			console.log(e.target);
		};

		document.querySelector('.confirm-photo').onclick = (e) => {
			e.stopPropagation();
			console.log(e.target);
			this.overlay.remove();
			if (this.callbackAfterUpload) {
				this.callbackAfterUpload(this.image);
			}
		};
	}

	handleRender() {
		if (this.image) {
			document.querySelector('.uploader-uploaded-photo').src = this.image;
			document.querySelector('.uploader-uploaded-photo').style.display =
				'block';
			document.querySelector('.uploader-actions').style.display = 'block';
		}
	}
}

module.exports = PhotoUploader;
