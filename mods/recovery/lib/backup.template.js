module.exports  = (identifier, newIdentifier) => {
	let txt = 'your Saito account';
	if (identifier) {
		if (identifier.indexOf('@saito') == -1) {
			txt =
				'<span style=\'color:var(--saito-secondary);\'>' +
				identifier +
				'@saito</span>';
		} else {
			txt =
				'<span class=\'pending_registration\' style=\'color:var(--saito-secondary);\'>' +
				identifier +
				'</span>';
		}
	}
	let intro = '';
	if (newIdentifier) {
		intro = `<h6>Name Registration Submitted!</h6> `;
	}
	return `
    <form id="backup-template" class="saito-overlay-auto-backup">
      <div class="saito-overlay-form">
        <div class="saito-overlay-form-header">
          <div class="saito-overlay-form-header-title" id="saito-overlay-form-header-title">EASY ACCOUNT RECOVERY</div>
        </div>
        <div class="saito-overlay-form-text">${intro}</div>
        <div class="saito-overlay-subform">
         
          <div class="saito-overlay-form-subtext">
          	Provide an email address and password to enable Account Recovery. 
          	Your browser will use this information to encrypt your wallet, and email you an encrypted copy.
          </div>
         
          <div class="saito-overlay-subform-inputs">
            <input type="text" id="saito-overlay-form-input" class="saito-overlay-form-input saito-overlay-form-email" placeholder="address@domain.com" value="" />
            <input type="text" id="saito-overlay-form-input" class="saito-overlay-form-input saito-overlay-form-password saito-password" placeholder="password" value="" />
          </div>
      	
      		<div class="saito-overlay-form-checkbox-container">	
	      		<input type="checkbox" class="saito-overlay-subform-checkbox" checked />
	      		<div class="saito-overlay-subform-text">
	      			save an encrypted copy on-chain, 
	      			so I can recover my account quickly and easily on any device
	      		</div>
      		</div>

          <button type="submit" class="saito-button-primary fat saito-overlay-form-submit" id="saito-overlay-submit">Encrypt & Backup</button>
	      </div>
      </div>
    </form>
  `;
};
