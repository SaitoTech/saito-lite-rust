module.exports = SettingsAppspaceTemplate = (app) => {

  let key = app.keychain.returnKey({ publickey : app.wallet.returnPublicKey()});
  let email_registered = key.email || "";
  let identifier_registered = key.identifier || "";
  if (email_registered == "") { email_registered = `<span id="register-email-btn" style="cursor:pointer" class="register-email-btn settings-appspace-link">Register an email address</span>`; }
  if (identifier_registered == "") {
    identifier_registered = `
    <span id="register-identifier-btn" style="cursor:pointer" class="register-identifier-btn settings-appspace-link">Register a username</span>
    `;
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
        <a target="_blank" href="${window.location.origin + "/balance?address=" + app.wallet.returnPublicKey()}">Check Recorded Balance</a>
      `;
    }
  });


  let html = `

  
  <div class="settings-appspace">
    <div class="setting-appspace-header">
      <div class="saito-redsquare-actions-buttons">
        <div class="redsquare-page-header-title">SETTINGS</div>
        <div class="redsquare-actions-container">
          <div class="saito-button-secondary small" id="restore-privatekey-btn">Import Key</div>
          <div class="saito-button-secondary small"id="restore-account-btn">Restore Wallet</div>
          <div class="saito-button-secondary small"id="backup-account-btn">Backup Wallet</div>
        </div>
      </div>
    </div>
    <div class="settings-appspace-body">
      <div class="settings-appspace-user-details-container">
        <h6>Wallet</h6>
          <div class="settings-appspace-user-details">
            <div  class="saito-black">Email:</div>
            <div>${email_registered}</div>
            <div id="register-identifier-btn-label" class="saito-black">Username:</div>
            <div>${identifier_registered}</div>
            <div class="saito-black">Public Key:</div>
            <div class="saito-address">${app.wallet.returnPublicKey()} <span style="margin-left: .5rem;" class="copy-public-key">  <i class="fas fa-copy"></i></span></div>
            <div class="saito-black">Private Key:</div>
            <div class="settings-appspace-privatekey saito-password">
              ${app.wallet.returnPrivateKey()}
              <i class="settings-appspace-see-privatekey fas fa-eye" id="settings-appspace-see-privatekey"></i>
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
