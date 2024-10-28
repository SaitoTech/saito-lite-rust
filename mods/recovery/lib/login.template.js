module.exports  = () => {
	return `
<form id="login-template">
            <div class="saito-overlay-form">
              <div class="saito-overlay-form-header">
                <div class="saito-overlay-form-header-title">Account Login</div>
              </div>
              <div class="saito-overlay-form-text">Provide your email address and password. We will fetch your wallet and decrypt it for this browser.</div>
              <input type="text" id="saito-overlay-form-input" class="saito-overlay-form-input saito-overlay-form-email" placeholder="address@domain.com" value="" />
              <input type="text" id="saito-overlay-form-input" class="saito-overlay-form-input saito-overlay-form-password saito-password" placeholder="password" value="" />
	      <div class="saito-overlay-form-submitline">
		<div></div>
                <button type="button" class="saito-button-primary fat saito-overlay-form-submit saito-overlay-login-submit" id="saito-overlay-submit">Download & Decrypt</button>
              </div>
            </div>
</form>
  `;
};
