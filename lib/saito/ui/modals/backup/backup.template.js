module.exports = BackupTemplate = (identifier, newIdentifier) => {

  let txt = "your Saito account";
  if (identifier) { txt = "<span style='color:var(--saito-secondary);'>"+identifier+"@saito</span>"; }
  let intro = "";
  if (newIdentifier) {
    intro = `<span style="font-weight:bold">Name Registration Submitted!</span> `;
  }
  return `
    <form>
      <div class="saito-overlay-form">
        <div class="saito-overlay-form-header">
          <div class="saito-overlay-form-header-title">Account Recovery</div>
        </div>
        <div class="saito-overlay-form-text">${intro}Protect ${txt} by adding remote login. Your email / password will be used for wallet encryption and not shared publicly</div>
        <div class="saito-overlay-subform">
          <div></div>
          <div class="saito-overlay-subform-inputs">
            <input type="text" id="saito-overlay-form-input" class="saito-overlay-form-input saito-overlay-form-email" placeholder="address@domain.com" value="" />
            <input type="text" style="margin-top: 1.5rem; margin-bottom: 1rem;" id="saito-overlay-form-input" class="saito-overlay-form-input saito-overlay-form-password" placeholder="password" value="" />
          </div>
      		<input type="checkbox" class="saito-overlay-subform-checkbox" checked />
      		<div class="saito-overlay-subform-text">i understand my wallet will be only as secure as my password</div>
	      </div>
        <button type="submit" class="saito-button-primary fat saito-overlay-form-submit" id="saito-overlay-submit">Encrypt & Upload</button>
      </div>
    </form>
  `;

}
