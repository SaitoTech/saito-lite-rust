module.exports = SaitoLoginOverlayTemplate = (component) => {
    return `  
      <div id="saito-login-overlay" class="saito-modal saito-login-overlay">

	<div class="saito-modal-title">Welcome Back</div>

	<div class="saito-modal-subtitle">login to restore access to your account</div>

	<div class="saito-login-overlay-field">
	  <label for="saito-login-email">Email</label>
	  <input type="text" id="saito-login-email" class="saito-login-email" value/>
	</div>

	<div class="saito-login-overlay-field">
	  <label for="saito-login-password">Password</label>
	  <input type="password" id="saito-login-password" class="saito-login-password" value/>
	</div>

	<div class="saito-login-overlay-field">
	  <div class="saito-restore-button saito-button-secondary fat">restore account</div>
	</div>

      </div>
    `;
}

