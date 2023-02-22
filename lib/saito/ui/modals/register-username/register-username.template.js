module.exports = RegisterUsernameTemplate = () => {

  return `
<form> 
            <div class="saito-overlay-form">
	      <div class="saito-overlay-form-header">
	        <div class="saito-overlay-form-header-title">Register Username</div>
	        <img class="saito-overlay-form-header-image" src="/saito/img/dreamscape.png" />
	      </div>
	      <div class="saito-overlay-form-text">Registering a username is free and makes it easier for others to find you on the network:</div>
              <input type="text" id="saito-overlay-form-input" class="saito-overlay-form-input" placeholder="username@saito" value="" />
              <button type="button" class="saito-button-primary fat saito-overlay-form-submit" id="saito-overlay-submit">Register Username</button> 
            </div>
</form>
  `;

}
