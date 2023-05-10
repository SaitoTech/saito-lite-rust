module.exports = SettingsAppspaceTemplate = (app) => {

  let key = app.keychain.returnKey({ publickey : app.wallet.publicKey});
  let identifier_registered = key?.identifier || "";

  if (!identifier_registered) {
    if (key.has_registered_username){
      identifier_registered = `<span class="register-identifier-btn settings-appspace-link">Registering...</span>`;  
    }else{
      identifier_registered = `<span id="register-identifier-btn" class="register-identifier-btn settings-appspace-link">Register a username</span>`;  
    }
  }

  let modules_html = "Wallet Outdated - module selection not supported";
  let modules_html_active = "Wallet Outdated - module selection not supported";
  try {
    modules_html = app.options.modules
      .map((mod, i) => {
        let CHECKED = mod.active ? 'CHECKED' : '';
        return `
        <div class="settings-appspace-app">
        <label class="saito-switch">
          <input type="checkbox"  id="${i}"  value="modules_mods_${i}" name="modules_mods_${i}" ${CHECKED}>
          <span class="saito-switch-slider"></span>
        </label>
          <label>${mod.name}
            <span></span>
          </label>
         </div>
      `;
      })
      .join('');

    modules_html_active = app.options.modules
      .map((mod, i) => {
        let CHECKED = mod.active ? 'CHECKED' : '';
        return `
        <div class="settings-appspace-installed-app">
          <label>${mod.name}
            <span></span>
          </label>
         </div>
      `;
      })
      .join('');
  } catch (err) {
    if (err.message.startsWith("Cannot read property 'map'")) {
      modules_html = "Initialization error. Refresh page should fix this.";
    } else {
      modules_html = `Unknown error<br/>${err}`;
    }
  }

  let balance_link = "";
  app.modules.mods.forEach(mod => {
    if (mod.name == 'Balance') {
      balance_link = `
        <a target="_blank" href="${window.location.origin + "/balance?address=" + app.wallet.publicKey}">Check Recorded Balance</a>
      `;
    }
  });


  let html = `
  
  <div class="settings-appspace">

    <div class="redsquare-appspace-header">
      <div class="redsquare-actions-buttons">
        <div class="redsquare-actions-buttons-icon"></div>
        <div id="redsquare-page-header-title" class="redsquare-page-header-title">SETTINGS</div>
        <div class="redsquare-actions-container">
          <div class="saito-button-secondary small" id="restore-privatekey-btn">Import Key</div>
          <div class="saito-button-secondary small"id="restore-account-btn">Restore Wallet</div>
          <div class="saito-button-secondary small"id="backup-account-btn">Backup Wallet</div>
          <div class="saito-button-secondary small"id="nuke-account-btn">Nuke Account</div>
        </div>
      </div>
    </div>

    <div class="settings-appspace-body">
      <div class="settings-appspace-user-details-container">
        <h6>Wallet</h6>
          <div class="settings-appspace-user-details">
            <div>Username:</div>
            <div>${identifier_registered}</div>
      
            <div>Public Key:</div>
            <div class="pubkey-containter" data-id="${app.wallet.publicKey}">
              <span class="profile-public-key">${app.wallet.publicKey}</span><i class="fas fa-copy" id="copy-public-key"></i>
            </div>
      
            <div>Private Key:</div>
            <div class="pubkey-containter" data-id="${app.wallet.returnPrivateKey()}">
              <span class="profile-public-key saito-password">${app.wallet.returnPrivateKey()}</span><i class="fas fa-copy" id="copy-private-key"></i>
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

}
