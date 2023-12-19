module.exports = BackupTemplate = (identifier, newIdentifier) => {

  let txt = "your Saito account";
  if (identifier) { 
    if (identifier.indexOf("@saito") == -1) { 
      txt = "<span style='color:var(--saito-secondary);'>"+identifier+"@saito</span>"; 
    } else {
      txt = "<span class='pending_registration' style='color:var(--saito-secondary);'>"+identifier+"</span>"; 
    }
  }
  let intro = "";
  if (newIdentifier) {
    intro = `<h6>Name Registration Submitted!</h6> `;
  }
  return `
    <form id="backup-template">
      <div class="saito-overlay-form">
        <div class="saito-overlay-form-header">
          <div class="saito-overlay-form-header-title">On-chain Account Recovery</div>
        </div>
        <div class="saito-overlay-form-text">${intro}</div>
        <div class="saito-overlay-subform">
          <div class="saito-overlay-form-subtext">Protect ${txt} by adding remote login. Your email / password will be used for wallet encryption and not shared publicly.</div>
          <div></div><!-- Necessary for formatting -->
          <div class="saito-overlay-subform-inputs">
            <input type="text" id="saito-overlay-form-input" class="saito-overlay-form-input saito-overlay-form-email" placeholder="address@domain.com" value="" />
            <input type="text" id="saito-overlay-form-input" class="saito-overlay-form-input saito-overlay-form-password" placeholder="password" value="" />
          </div>
      		<input type="checkbox" class="saito-overlay-subform-checkbox" checked />
      		<div class="saito-overlay-subform-text">i understand my wallet will be only as secure as my password</div>
          <button type="submit" class="saito-button-primary fat saito-overlay-form-submit" id="saito-overlay-submit">Encrypt & Upload</button>
	      </div>
        <button type="submit" class="saito-button-primary fat saito-overlay-form-cancel" id="saito-overlay-cancel">No Thanks</button>

      </div>
    </form>
  `;

}
