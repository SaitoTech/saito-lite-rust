module.exports  = () => {
	return `
<form id="login-template">
            <div class="saito-overlay-form">
              <div class="saito-overlay-form-header">
                <div class="saito-overlay-form-header-title">Account Loaded!</div>
              </div>
              <div class="saito-overlay-form-text">Your wallet has been found and restored. Welcome back!</div>
	            <div class="saito-overlay-form-submitline">
                <button type="button" class="saito-button-primary fat saito-overlay-form-submit saito-overlay-login-submit" id="saito-overlay-submit">Reload Page</button>
              </div>
            </div>
</form>
  `;
};
