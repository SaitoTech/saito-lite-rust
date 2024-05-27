module.exports = SettingsAppspaceTemplate = (app, mod, main) => {

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
      if (!mod || mod?.class !== 'utility') {

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
      }
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
            <div class="pubkey-containter" data-id="${publicKey}">
              <div class="profile-public-key">${publicKey}</div>
              <i class="fas fa-copy" id="copy-public-key"></i>
            </div>
      
            <div>Private Key:</div>
            <div class="pubkey-containter" data-id="${main.privateKey}">
              <div class="profile-public-key saito-password">${main.privateKey}</div>
              <i class="fas fa-copy" id="copy-private-key"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="settings-appspace-modules-container">
          <h6> Installed Modules </h6>
          <div class="settings-appspace-modules">
              ${modules_html}
          </div>
      </div>
      <div class="settings-appspace-debug">
        <h6>Debug Info</h6>
        <div class="settings-appspace-debug-content"></div>
      </div>
    </div>
  </div>
  <input id="file-input" class="file-input" type="file" name="name" style="display:none;" />

  `;

	return html;
};
