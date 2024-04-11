module.exports = RegisterUsernameTemplate = (msg, key, mode = 'register') => {
	console.log('identifier', key?.identifier);

	let bio = '';
	let photo = '';
	const identifier = key?.identifier || '';

	if (key?.profile) {
		bio = key.profile.bio || '';
		photo = key.profile.photo || '';
	}

	let disabled = identifier.length > 0 ? true : false;
	console.log(disabled);
	if (!msg) {
		msg =
			'Registering a profile is free and makes it easier for others to find you on the network';
	}
	return `
	<div style="position: relative;">
	<div id="image-uploader" class="image-uploader " style="display:none;">
	Click to select or drag and drop to upload an image
	<div>
	</div>
	</div>
		<form id="register-profile-template" class="register-profile-template"> 
      <div class="saito-overlay-form" id="saito-overlay-form">
	      <div class="saito-overlay-form-header">
	        <div class="saito-overlay-form-header-title">${
				mode === 'update' ? 'Update' : 'Register'
			} Profile</div>
	      </div>
	      <div class="saito-overlay-form-text">${msg}:</div>
		  	<div class="saito-overlay-form-inputs"> 
			  <input type="text" id="saito-overlay-form-input" class="saito-overlay-form-input" autocomplete="off" ${
					disabled ? `disabled` : ''
				} placeholder="username@saito" value="${identifier}" />
			  <textarea id="saito-overlay-form-textarea" class="saito-overlay-form-textarea" autocomplete="off" placeholder="Something about yourself...">${bio}</textarea>
			  <div class="saito-flex" id="upload-image"> 
				<div class="saito-box-tab" id="photo-tab">
				<i class="fa-regular fa-image"></i>
				</div>
				<p class="saito-overlay-form-text"> Upload Photo </p>
				<img src="${photo}" id="uploaded-image"/>
			  </div>
			
			  </div>
              
             
	      <div class="saito-overlay-form-submitline">
					<div class="saito-overlay-form-alt-opt" id="loginOrRecover">or login/recover</div>
          <button type="submit" class="saito-button-primary fat saito-overlay-form-submit" id="saito-overlay-submit">${
				mode === 'update' ? 'Update' : 'Register'
			} Profile</button> 
        </div>
      </div>
		</form>
		</div>
  `;
};
