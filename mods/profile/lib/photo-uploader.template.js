const PhotoUploaderTemplate = (app, mod) => {
	return `<div id="photo-uploader" class="photo-uploader ">
	Click to select or drag and drop to upload an image
     <img class="uploader-uploaded-photo"/>
	 <div class="uploader-actions">
	 <button class="edit-photo"> 
	 Edit
	 </button>
	 <button class="confirm-photo">
	 Confirm
	 </button>
	 </div>
	</div>`;
};

module.exports = PhotoUploaderTemplate;
