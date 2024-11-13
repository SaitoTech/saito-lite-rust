const PhotoUploaderTemplate = (app, mod) => {
	return `
	<div id="photo-uploader" class="photo-uploader ">
		Click to select or drag and drop to upload an image
		<div class="uploader-content">
		     <img class="uploader-uploaded-photo"/>
			 <div class="uploader-actions">
				 <button class="remove-photo saito-button-secondary">Delete</button>
				 <button class="confirm-photo">Confirm</button>
			 </div>
		 </div>
	</div>`;
};

module.exports = PhotoUploaderTemplate;
