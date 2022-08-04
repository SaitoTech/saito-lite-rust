module.exports = SettingsAppspaceTemplate = (app) => {

  let email_registered = app.keys.returnEmail(app.wallet.returnPublicKey());
  let identifier_registered = app.keys.returnIdentifierByPublicKey(app.wallet.returnPublicKey());
  if (email_registered == "") { email_registered = `<span id="register-email-btn" style="cursor:pointer" class="register-email-btn settings-appspace-link">Register an email address</span>`; }
  if (identifier_registered == "") { identifier_registered = `<span id="register-identifier-btn" style="cursor:pointer" class="register-identifier-btn settings-appspace-link">Register a username</span>`; }

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
  <div class="settings-appspace">

    <div>

      <div>

      
        ${balance_link}


  <div class="settings-appspace-user-details-container">
	<h6>Wallet</h6>
        <div class="settings-appspace-user-details">
          
          <div class="saito-black">Email:</div>
          <div >${email_registered}</div>

          <div class="saito-black">Username:</div>
         <div>${identifier_registered}</div>

          <div class="saito-black">Public Key:</div>
          <div class="saito-username">${app.wallet.returnPublicKey()}</div>

          <div class="saito-black">Private Key:</div>
          <div class="settings-appspace-privatekey">
            <div class="settings-appspace-password">${app.wallet.returnPrivateKey()} </div>
            <i class="settings-appspace-see-password fas fa-eye"></i>
          </div>

	       </div>
         <div class="saito-grid-1-1-1">
         <div class="saito-button-secondary">Backup</div>
         <div class="saito-button-secondary">Restore</div>
         <div class="saito-button-secondary">Import Private Key</div>
         <input type="file" style="display:none;" />
         </div>
     
  </div>

      </div>

      <div class="settings-appspace-modules-container">
        <h6> Installed Modules </h6>
        `;

  if (app.modules.returnModule("AppStore") != null) {
    html += ` &nbsp; [<span id="trigger-appstore-btn" class="trigger-appstore-btn">&nbsp;install more&nbsp;</span>]`;
  }

  html += `
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
      <div class="settings-appspace-versions-container">
      <h6> Version </h6>
      <div class="settings-appspace-versions">
        <p class="saito-black">Code Version:</p>
        <p>${app.wallet.wallet.version}</p>
        <p class="saito-black">Wallet Version:</p>
        <p>${app.options.wallet.version}</p>
      </div>
      </div>

      <div class="settings-appspace-icons-container">
      <h6> Help </h6>
      <div class="settings-appspace-icons"  style="padding-bottom:40px;">
      <div><a target="_blank" href="https://github.com/SaitoTech"><i class="fab fa-discord"></i></a></div>
      <div class="saito-black">Discord</div>

      <div> <a target="_blank" href="https://t.me/SaitoIO"><i class="fab fa-telegram"></i></a></div>
      <div class="saito-black">Telegram</div>

     <div> <a target="_blank" href="https://github.com/SaitoTech"> <i class="fab fa-github"></i></a></div>
      <div class="saito-black">Github</div>
      </div>
      </div>

    </div>
  
  </select>


  </div>
</div>
  `;

  return html;

}
