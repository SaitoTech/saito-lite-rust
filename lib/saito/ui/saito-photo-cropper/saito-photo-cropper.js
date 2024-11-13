const SaitoPhotoCropperTemplate = require('./saito-photo-cropper.template');
const SaitoOverlay = require('../saito-overlay/saito-overlay');
const Cropper = require('cropperjs');

class SaitoPhotoCropper {
	constructor(app, mod, type = 'banner') {
		this.app = app;
		this.mod = mod;
		this.type = type;
		this.overlay = new SaitoOverlay(app, mod);
		this.callbackAfterCrop = null;
	}

	render(image) {
		this.image = image;
		try {
			this.overlay.show(SaitoPhotoCropperTemplate(this.app, this.mod));
			this.attachEvents();
		} catch (error) {
			console.error('Failed to render SaitoPhotoCropper:', error);
		}
	}

	attachEvents() {
		try {
			const imgElement = document.getElementById('imageToCrop');
			if (!imgElement) {
				throw new Error('Image element not found.');
			}

			imgElement.src = this.image;

			const cropper = new Cropper(imgElement, {
				aspectRatio: this.getAspectRatio(),
				crop(event) {
					console.log(`Crop X: ${event.detail.x}`);
					console.log(`Crop Y: ${event.detail.y}`);
					console.log(`Crop Width: ${event.detail.width}`);
					console.log(`Crop Height: ${event.detail.height}`);
				}
			});

			const cropButton = document.getElementById('cropButton');
			if (!cropButton) {
				throw new Error('Crop button not found.');
			}

			cropButton.style.display = 'block';
			cropButton.onclick = () => {
				try {
					const croppedCanvas = cropper.getCroppedCanvas();
					if (this.callbackAfterCrop) {
						this.callbackAfterCrop(croppedCanvas.toDataURL());
					} else {
						throw Error('No callback on crop ');
					}
					cropper.destroy();
					imgElement.style.display = 'none';
					cropButton.style.display = 'none';
				} catch (cropError) {
					console.error('Failed to crop image:', cropError);
				}
			};
		} catch (error) {
			console.error(
				'Failed to attach events or initialize cropper:',
				error
			);
		}
	}
	getAspectRatio() {
		if (this.type === 'banner') {
			return 3;
		}
		return 3;
	}
}

module.exports = SaitoPhotoCropper;
