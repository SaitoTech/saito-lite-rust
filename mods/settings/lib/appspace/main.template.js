module.exports = SettingsAppspaceTemplate = (app) => {

  let email_registered = app.keys.returnEmail(app.wallet.returnPublicKey());
  let identifier_registered = app.keys.returnIdentifierByPublicKey(app.wallet.returnPublicKey());
  if (email_registered == "") { email_registered = `<span id="register-email-btn" style="cursor:pointer" class="register-email-btn settings-appspace-link">Register an email address</span>`; }
  if (identifier_registered == "") { 
    identifier_registered = `
    <span id="register-identifier-btn" style="cursor:pointer" class="register-identifier-btn settings-appspace-link">Register a username</span>
    `; }

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
          <span class="saito-switch-slider round"></span>
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


  <div class="saito-page-header">

        <div class="saito-redsquare-actions-buttons">
        <div class="saito-redsquare-actions-buttons-icon">
          <i id="icon" class="fas fa-plus"></i>
        </div>
        <div class="redsquare-actions-container"> 
        <div class="saito-button-secondary small" style="float: right;" id="restore-privatekey-btn">Import Key</div>
        <div class="saito-button-secondary small" style="float: right;" id="restore-account-btn">Restore Wallet</div>
        <div class="saito-button-secondary small" style="float: right;" id="backup-account-btn">Backup Wallet</div>
        </div>
        </div>
        
    <div class="saito-page-header-title">SETTINGS</div>
    <div class="saito-page-header-text">
      Configure and personalise your Saito experience. Add/remove modules, setup wallet. 
      Get informed on latest versions. Reach out to us on social media platforms in case of any queries.
    </div>
  </div>

  <div class="settings-appspace">

    <input id="file-input" class="file-input" type="file" name="name" style="display:none;" />

    <div>

      <div>

      
        ${balance_link}


  <div class="settings-appspace-user-details-container">
	<h6>Wallet</h6>
        <div class="settings-appspace-user-details">
          
          <div id="register-email-btn" class="saito-black">Email:</div>
          <div >${email_registered}</div>

          <div id="register-identifier-btn-label" class="saito-black">Username:</div>
         <div>${identifier_registered}</div>

          <div class="saito-black">Public Key:</div>
          <div class="saito-address">${app.wallet.returnPublicKey()}</div>

          <div class="saito-black">Private Key:</div>
          <div class="settings-appspace-privatekey">
             <div class="settings-appspace-password" id="settings-appspace-password">${app.wallet.returnPrivateKey()} </div>
            <i class="settings-appspace-see-password fas fa-eye" id="settings-appspace-see-password"></i>
          </div>

	       </div>
     
  </div>

      </div>

      <div class="settings-appspace-modules-container">
        <h6> Installed Modules </h6>

  <div class="settings-appspace-modules">
      ${modules_html_active}
   </div>
   <div id="settings-appspace-manage-modules" class="saito-button-primary">Manage Modules</div>
      <div class="saito-overlay-container">
            <div class="saito-backdrop">
              <div class="settings-appspace-modules-modal">
              ${modules_html}
              </div>
              <div class="saito-overlay-actions">
                <div id="settings-appspace-cancel-modules-modal" class="saito-button-secondary"> Cancel </div>
              </div>
            </div>
      </div>
      </div>
      
      </div>

    </div>
  
  </select>


  </div>
</div>
  `;

  return html;

}
