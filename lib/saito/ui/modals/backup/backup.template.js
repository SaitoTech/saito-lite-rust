module.exports = BackupTemplate = (identifier = "") => {

  let txt = "your Saito account";
  if (identifier != "") { txt = "<span style='color:var(--saito-secondary);'>"+identifier+"@saito</span>"; }

  return `
<form>
            <div class="saito-overlay-form">
              <div class="saito-overlay-form-header">
                <div class="saito-overlay-form-header-title">Account Recovery</div>
              </div>
              <div class="saito-overlay-form-text">Protect ${txt} by adding remote login. Your email / password wil be used in-browser for wallet encryption and not shared publicly:</div>
              <div class="saito-overlay-subform">
		<input type="checkbox" class="saito-overlay-subform-checkbox" checked />
		<div class="saito-overlay-subform-text">i understand my wallet will be only as secure as the password i provide</div>
		<div></div>
		<div class="saito-overlay-subform-inputs">
                  <input type="text" id="saito-overlay-form-input" class="saito-overlay-form-input saito-overlay-form-email" placeholder="address@domain.com" value="" />
                  <input type="text" id="saito-overlay-form-input" class="saito-overlay-form-input saito-overlay-form-password" placeholder="password" value="" />
		</div>
	      </div>
              <button type="button" class="saito-button-primary fat saito-overlay-form-submit" id="saito-overlay-submit">Encrypt & Upload</button>
            </div>
</form>
  `;

}
