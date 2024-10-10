module.exports = (mod) => {
	return `
		<form id="register-whitelist-key-template"> 
      <div class="saito-overlay-form">
	      <div class="saito-overlay-form-header">
	        <div class="saito-overlay-form-header-title">Add Key to Peer Whitelist</div>
	      </div>
	      	  <label for="saito-overlay-form-input">Public key:</label>
              <input type="text" id="saito-overlay-form-input" class="saito-overlay-form-input" autocomplete="off" placeholder="${mod.publicKey}" value="" />
              <label for="saito-overlay-form-password">Admin password:</label>
              <input type="password" id="saito-overlay-form-password" class="saito-overlay-form-input" autocomplete="off" value="" />
	      <div class="saito-overlay-form-submitline">
          	<button type="button" class="saito-button-primary fat saito-overlay-form-submit" id="saito-overlay-submit">Submit</button> 
        </div>
      </div>
		</form>
  `;
};
