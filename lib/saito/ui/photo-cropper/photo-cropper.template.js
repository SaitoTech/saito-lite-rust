const PhotoCropperTemplate = (app, mod) => {
	return ` <div class="photo-cropper"> <img id="imageToCrop" style="max-width: 100%; display: none;">
    <button id="cropButton" class="crop-button" style="display: none;">Crop Image</button>
    `;
};

module.exports = PhotoCropperTemplate;
