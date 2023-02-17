module.exports = SaitoLoginOverlayTemplate = (app) => {

    let key = app.keychain.returnKey(app.wallet.returnPublicKey());
    let email = key.email || "";
    let password = key.password || "";

    return `  
      <div id="saito-login-overlay" class="saito-modal saito-login-overlay">

	<div class="saito-modal-title">Setup Account Recovery?</div>

	<div class="saito-modal-subtitle">use an email/password to handle account recovery</div>

	<div class="saito-login-overlay-field">
	  <label for="saito-login-email">Email:</label>
	  <input type="text" id="saito-login-email" class="saito-login-email" value="${email}" />
	</div>

	<div class="saito-login-overlay-field">
	  <label for="saito-login-password">Password:</label>
	  <input type="password" id="saito-login-password" class="saito-login-password" value="${password}" />
	</div>

	<div class="saito-login-overlay-field">
	  <div class="saito-backup-button-no saito-button-secondary fat">no thanks</div>
	  <div class="saito-backup-button-yes saito-button-secondary fat">yes please</div>
	</div>

      </div>
    `;
}

