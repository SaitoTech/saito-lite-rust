module.exports  = (app, mod, main) => {

	let publicKey = mod.publicKey;
	let key = app.keychain.returnKey({ publicKey: publicKey });
	let identifier_registered;

	if (key?.identifier) {
		identifier_registered = `<div class="username">${key.identifier}</div>`;
	} else {
		if (key?.has_registered_username) {
			identifier_registered = `<div class="register-identifier-btn">Registering...</div>`;
		} else {
			identifier_registered = `<div id="register-identifier-btn" class="register-identifier-btn settings-appspace-link">Register a username</div>`;
		}
	}

	let modules_html = '';

	try {
		for (let i = 0; i < app.options.modules.length; i++) {

			let mod = app.modules.returnModule(app.options.modules[i].name);

			let shortName = app.options.modules[i].name;
			let fullName = mod ? mod.returnName() : shortName;

			let CHECKED = app.options.modules[i].active ? 'CHECKED' : '';

      // filter out core modules  
      //if (!mod || mod?.class !== 'utility') {
      //if (!mod) {

  			modules_html += `
        <div class="settings-appspace-app">
            <div class="saito-switch">
              <input type="checkbox"  id="${i}" class="modules_mods_checkbox" name="modules_mods_${i}" ${CHECKED}>
            </div>
            <div id="${shortName}" class="settings-appspace-module settings-appspace-link">${fullName}</div>`;

        if (mod?.hasSettings()){
          modules_html += `<i class="fas fa-cog"></i>`
        }

        modules_html += "</div>";
      //}
		}
	} catch (err) {
		console.error(err);
	}

	let html = `

  <div class="settings-appspace">

    <div class="settings-appspace-header">
      <div class="settings-actions-container">
        <div class="saito-button-secondary small" id="restore-privatekey-btn">Import Key</div>
        <div class="saito-button-secondary small" id="restore-account-btn">Restore Wallet</div>
        <div class="saito-button-secondary small" id="backup-account-btn">Backup Wallet</div>
        <div class="saito-button-secondary small" id="nuke-account-btn">Nuke Account</div>
        <div class="saito-button-secondary small" id="clear-storage-btn">Clear Local Cache</div>
      </div>
    </div>

    <div class="settings-appspace-body">
      <div class="settings-appspace-user-details-container">
        <h6>Wallet</h6>
          <div class="settings-appspace-user-details">
            <div>Username:</div>
            ${identifier_registered}
      
            <div>Public Key:</div>
            <div class="pubkey-grid" data-id="${publicKey}">
              <div>${publicKey}</div>
              <i class="fas fa-copy" id="copy-public-key"></i>
            </div>
      
            <div>Private Key:</div>
            <div class="pubkey-grid" data-id="${main.privateKey}">
              <div class="saito-password">${main.privateKey}</div>
              <i class="fas fa-copy" id="copy-private-key"></i>
            </div>

            <div>Default Fee:</div>
            <div class="default-fee-containter">
              <input type="number" 
                     id="profile-default-fee-input" 
                     class="profile-default-fee" 
                     step="0.000000001" 
                     min="0" 
                     value="${app.wallet.convertNolanToSaito(app.wallet.default_fee)}"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div class="settings-appspace-modules-container">
          <div class="settings-installed-mod-header">
            <h6> Installed Modules </h6>
            <i id="settings-add-app" class="fa-solid fa-plus"></i>
          </div>
          <div class="settings-appspace-modules">
              ${modules_html}
          </div>
      </div>

      <div class="settings-appspace-crypto-transfer-container">
        <h6>In-Game Crypto Transfers</h6>
        <div id="settings-appspace-crypto-transfer" class="settings-appspace-modules">     
        </div>
      </div>

      <div class="settings-appspace-debug">
        <h6>Debug Info</h6>

        <!--div id="settings-edit-json">Edit wallet options</div-->
        <div>Advanced: ALT-select items to mark them, and than click <span class="saito-text-link" id="delete_marked">here to delete selected entries</span></div>
        <div class="settings-appspace-debug-content" id="settings-appspace-debug-content"></div>
      </div>

      <div class="settings-storage-info">
      <h6>Storage Info</h6>
      <div class="settings-appspace-storage-content">

        <div class="settings-appspace-localstorage-info">
          <div class="title">Local Storage</div><div></div>
          <div>Quota (Bytes)</div><div class="quota"></div>
          <div>Usage (Bytes)</div><div class="usage"></div>
          <div>Used (%)</div><div class="percent"></div>
        </div>

        <div class="settings-appspace-indexdb-info">
          <div class="title">IndexDB</div><div></div>
          <div>Quota (Bytes)</div><div class="quota"></div>
          <div>Usage (Bytes)</div><div class="usage"></div>
          <div>Used (%)</div><div class="percent"></div>
        </div>

      </div>
      </div>
    </div>
  </div>
  <input id="file-input" class="file-input" type="file" name="name" style="display:none;" />

  `;

	return html;
};
