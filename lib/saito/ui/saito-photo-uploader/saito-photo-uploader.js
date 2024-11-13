const PhotoUploaderTemplate = require('./saito-photo-uploader.template');
const SaitoOverlay = require('../saito-overlay/saito-overlay');
const SaitoPhotoCropper = require('../saito-photo-cropper/saito-photo-cropper');

class PhotoUploader {
	constructor(app, mod, type = 'banner') {
		this.app = app;
		this.mod = mod;
		this.type = type;
		this.overlay = new SaitoOverlay(this.app, this.mod);
		this.photoCropper = new SaitoPhotoCropper(this.app, this.mod, type);
		this.callbackAfterUpload = null;

		this.photoCropper.callbackAfterCrop = (image) => {
			this.image = image;
			try {
				this.photoCropper.overlay.remove();
			} catch (error) {
				console.error('Failed to remove photo cropper overlay:', error);
			}
			this.handleRender();
		};
	}

	render(image) {
		this.overlay.show(PhotoUploaderTemplate(this.app, this.mod));
		this.image = image;
		this.handleRender();
		this.attachEvents();
	}

	attachEvents() {
		this.app.browser.addDragAndDropFileUploadToElement('photo-uploader', async (result) => {
			try {
				this.photoCropper.render(result);
			} catch (error) {
				console.error('Error handling the uploaded image:', error);
			}
		});

		const confirmPhoto = document.querySelector('.confirm-photo');
		const removePhoto = document.querySelector('.remove-photo');

		if (confirmPhoto) {
			confirmPhoto.onclick = (e) => {
				e.stopPropagation();
				this.overlay.remove();
				if (this.callbackAfterUpload) {
					this.callbackAfterUpload(this.image);
				} else {
					console.error('No callback on upload');
				}
			};
		} else {
			console.error('Confirm photo button not found!');
		}

		if (removePhoto) {
			removePhoto.onclick = (e) => {
				e.stopPropagation();
				this.image = null;
				this.handleRender();
				console.log('this.image', this.image);
			};
		}
	}

	handleRender() {
		const photoElement = document.querySelector('.uploader-uploaded-photo');
		const uploaderContent = document.querySelector('.uploader-content');
		if (photoElement) {
			if (this.image) {
				photoElement.src = this.image;
				uploaderContent.style.display = 'block';
			} else {
				photoElement.src = null;
				uploaderContent.style.display = 'none';
			}
		} else {
			console.error('Profile-Uploader: Required DOM elements for rendering are missing!');
		}
	}
}

module.exports = PhotoUploader;
