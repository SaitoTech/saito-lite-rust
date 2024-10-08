module.exports  = (msg) => {
	if (!msg) {
		msg =
			'Registering a username is free and makes it easier for others to find you on the network';
	}
	return `
		<form id="register-username-template"> 
      <div class="saito-overlay-form">
	      <div class="saito-overlay-form-header">
	        <div class="saito-overlay-form-header-title">Register Username</div>
	      </div>
	      <div class="saito-overlay-form-text">${msg}:</div>
              <input type="text" id="saito-overlay-form-input" class="saito-overlay-form-input" autocomplete="off" placeholder="username@saito" value="" />
	      <div class="saito-overlay-form-submitline">
					<div class="saito-overlay-form-alt-opt">or login/recover</div>
          <button type="submit" class="saito-button-primary fat saito-overlay-form-submit" id="saito-overlay-submit">Register Username</button> 
        </div>
      </div>
		</form>
  `;
};
