module.exports = SettingsAppspaceTemplate = (app) => {

  let email_registered = app.keys.returnEmail(app.wallet.returnPublicKey());
  let identifier_registered = app.keys.returnIdentifierByPublicKey(app.wallet.returnPublicKey());
  if (email_registered == "") { email_registered = `<span id="register-email-btn" style="cursor:pointer" class="register-email-btn">register an email address</span>`; }
  if (identifier_registered == "") { identifier_registered = `<span id="register-identifier-btn" style="cursor:pointer" class="register-identifier-btn">register a username</span>`; }

  let modules_html = "Wallet Outdated - module selection not supported";
  try {
    modules_html = app.options.modules
      .map((mod, i) => {
        let CHECKED = mod.active ? 'CHECKED' : '';
        return `
        <div class="settings-app-select">
        <input
        type="checkbox"
        value="modules_mods_${i}"
        class="modules_mods_checkbox"
        name="modules_mods_${i}" id="${i}" ${CHECKED}/>
          <label class="s-container">${mod.name}
            <span class="s-checkmark"></span>
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
  <link rel="stylesheet" href="/settings/style.css">
  <div class="settings-appspace">

    <div class="settings-appspace-grid">

      <div class="settings-appspace-wallet-management">

        <div class="saito-grid-1-1-1">
          <button id="backup-account-btn" class="backup-account-btn"">Backup Wallet</button>
          <button id="restore-account-btn" class="restore-account-btn">Restore Wallet</button>
          <button id="restore-privatekey-btn" class="restore-privatekey-btn">Import Private Key</button>
         
        </div>

        <div class="saito-grid-1">
        <button class="small"><input id="file-input" class="file-input" type="file" name="name" style="display:none;" /></button>
        </div>
        ${balance_link}


        <div class="saito-grid-1-1">

          <p class="saito-large-paragraph">Email:</p>
          <p>${email_registered}</p>

          <p class="saito-large-paragraph">Username:</p>
          <p>${identifier_registered}</p>

          <p class="public-key saito-large-paragraph">Public Key:</p>
          <p>${app.wallet.returnPublicKey()}</p>

          <p class="saito-large-paragraph">Private Key:</p>
          <p class="private-key">
            <input id="privatekey" type="text" value="${app.wallet.returnPrivateKey()}" class="password" />
            <i class="see-password fas fa-eye" id="see-password"></i>
          </p>

	</div>

      </div>

      <div class="settings-app-management">

        <h3>Installed Modules: `;

  if (app.modules.returnModule("AppStore") != null) {
    html += ` &nbsp; [<span id="trigger-appstore-btn" class="trigger-appstore-btn">&nbsp;install more&nbsp;</span>]`;
  }

  html += `</h2>
        <div class="settings-app-list">
        ${modules_html}
        </div>
      </div>

      <div id="settings-appspace" class="settings-appspace"></div>

      <hr />
      <div class="saito-grid-1-1-1-1">
        <p class="saito-large-paragraph">Code Version:</p>
        <p class="saito-mid-paragraph">${app.wallet.wallet.version}</p>
        <p class="saito-large-paragraph">Wallet Version:</p>
        <p class="saito-mid-paragraph">${app.options.wallet.version}</p>
      </div>

      <p style="padding-bottom:40px;">
        Having trouble? Try clearing your browser cache or <span style="cursor:pointer; border-bottom: 1px dashed" id="reset-account-btn" class="">resetting your account</span>. If that doesn't fix things, write to us at info@saito.tech.
      </p>

    </div>
  </div>
</div>
  `;

  return html;

}

