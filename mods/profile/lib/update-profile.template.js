module.exports = UpdateProfileTemplate = (msg, key) => {
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

	return `
	
		<form id="register-profile-template" class="register-profile-template"> 
      <div class="saito-overlay-form" id="saito-overlay-form">
	      <div class="saito-overlay-form-header">
	        <div class="saito-overlay-form-header-title">Update Profile</div>
	      </div>
	      <div class="saito-overlay-form-text">${msg ?? ""}</div>
		  	<div class="saito-overlay-form-inputs"> 
			  <input style="display: none;" type="text" id="saito-overlay-form-input" class="saito-overlay-form-input" autocomplete="off" ${
					disabled ? `disabled` : ''
				} placeholder="username@saito" value="${identifier}" />
			  <textarea id="saito-overlay-form-textarea" class="saito-overlay-form-textarea" autocomplete="off" placeholder="Something about yourself...">${bio}</textarea>
			  <div class="saito-flex" id="upload-image"> 
				<div class="saito-box-tab" id="photo-tab">
				<i class="fa-regular fa-image"></i>
				</div>
				<p class="saito-overlay-form-text"> Upload Photo </p>
				${photo ? `<img src="${photo}" class="uploaded-photo" id="uploaded-photo"/>`: `<img alt=""  style="display:none;" class="uploaded-photo" id="uploaded-photo"/>`}
			  </div>
			
			  </div>
              
             
	      <div class="saito-overlay-form-submitline">
					<div class="saito-overlay-form-alt-opt" id="loginOrRecover">or login/recover</div>
          <button type="submit" class="saito-button-primary fat saito-overlay-form-submit" id="saito-overlay-submit">Update Profile</button> 
        </div>
      </div>
		</form>
		</div>
  `;
};
