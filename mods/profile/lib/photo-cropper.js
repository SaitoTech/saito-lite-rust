const PhotoCropperTemplate = require('./photo-cropper.template');
const SaitoOverlay = require('../../../lib/saito/ui/saito-overlay/saito-overlay');
const Cropper = require('cropperjs');

class PhotoCropper {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);

		this.callbackAfterCrop = null;
	}

	render(image) {
		this.image = image;
		this.overlay.show(PhotoCropperTemplate(this.app, this.mod));
		this.attachEvents();
	}

	attachEvents() {
		const imgElement = document.getElementById('imageToCrop');
		imgElement.style.display = 'block';
		imgElement.style.maxWidth = '100%';
		imgElement.src = this.image;

		const cropper = new Cropper(imgElement, {
			aspectRatio: 16 / 9,
			crop(event) {
				console.log(`Crop X: ${event.detail.x}`);
				console.log(`Crop Y: ${event.detail.y}`);
				console.log(`Crop Width: ${event.detail.width}`);
				console.log(`Crop Height: ${event.detail.height}`);
			}
		});

		// Show the crop button and set up its functionality
		const cropButton = document.getElementById('cropButton');
		cropButton.style.display = 'block';
		cropButton.onclick = () => {
			const croppedCanvas = cropper.getCroppedCanvas();

			if (this.callbackAfterCrop) {
				this.callbackAfterCrop(croppedCanvas.toDataURL());
			}

			cropper.destroy();
			imgElement.style.display = 'none';
			cropButton.style.display = 'none';
		};
	}
}

module.exports = PhotoCropper;
