const PhotoUploaderTemplate = require('./saito-photo-uploader.template');
const SaitoOverlay = require('../saito-overlay/saito-overlay');
const PhotoCropper = require('../photo-cropper/photo-cropper');

class PhotoUploader {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod);
		this.photoCropper = new PhotoCropper(this.app, this.mod);
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
		try {
			this.overlay.show(PhotoUploaderTemplate(this.app, this.mod));
			this.image = image;
			this.handleRender();
			this.attachEvents();
		} catch (error) {
			console.error('Failed to render PhotoUploader:', error);
		}
	}

	showPhotoCrop() {
		const uploaderElement = document.querySelector('#photo-uploader');
		if (!uploaderElement) {
			console.error('Photo uploader element not found!');
			return;
		}
	}

	attachEvents() {
		try {
			this.app.browser.addDragAndDropFileUploadToElement(
				'photo-uploader',
				async (result) => {
					try {
						this.photoCropper.render(result);
					} catch (error) {
						console.error(
							'Error handling the uploaded image:',
							error
						);
					}
				}
			);

			const editPhoto = document.querySelector('.edit-photo');
			const confirmPhoto = document.querySelector('.confirm-photo');
			const removePhoto = document.querySelector(
				'.uploader-remove-photo'
			);

			if (editPhoto) {
				editPhoto.onclick = (e) => {
					e.stopPropagation();
					try {
						this.photoCropper.render(this.image);
					} catch (error) {
						console.error('Error rendering photo cropper:', error);
					}
				};
			} else {
				console.error('Edit photo button not found!');
			}

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
		} catch (error) {
			console.error('Failed to attach events:', error);
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
			console.error(
				'Profile-Uploader: Required DOM elements for rendering are missing!'
			);
		}
	}
}

module.exports = PhotoUploader;
