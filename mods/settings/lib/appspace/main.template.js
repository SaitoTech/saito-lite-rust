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
        <div class="settings-appspace-app">
        <input
        type="checkbox"
        value="modules_mods_${i}"
        name="modules_mods_${i}" id="${i}" ${CHECKED}/>
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

        <div class="saito-grid-1-1-1">
          <button>Backup Wallet</button>
          <button>Restore Wallet</button>
          <button>Import Private Key</button>
          <input type="file" style="display:none;" />
        </div>
        ${balance_link}


        <div class="settings-appspace-user-details">
          
          <p class="large">Email:</p>
          <div>${email_registered}</div>

          <p class="large">Username:</p>
         <div>${identifier_registered}</div>

          <p class="large">Public Key:</p>
          <div class="saito-username">${app.wallet.returnPublicKey()}</div>

          <p class="large">Private Key:</p>
          <div class="settings-appspace-privatekey">
            <input type="text" value="${app.wallet.returnPrivateKey()}" class="settings-appspace-password" />
            <i class="settings-appspace-see-password fas fa-eye"></i>
          </div>

	</div>

      </div>

      <div class="settings-appspace-modules-container">

        <h4>Installed Modules: </h4> `;

  if (app.modules.returnModule("AppStore") != null) {
    html += ` &nbsp; [<span id="trigger-appstore-btn" class="trigger-appstore-btn">&nbsp;install more&nbsp;</span>]`;
  }

  html += `</h2>
        <div class="settings-appspace-modules">
        ${modules_html}
        </div>
      </div>
      <hr />
      <div class="settings-appspace-versions">
        <p class="large">Code Version:</p>
        <p>${app.wallet.wallet.version}</p>
        <p class="large">Wallet Version:</p>
        <p>${app.options.wallet.version}</p>
      </div>

      <p  style="padding-bottom:40px;">
        Having trouble? Try clearing your browser cache or <span style="cursor:pointer; border-bottom: 1px dashed" >resetting your account</span>. If that doesn't fix things, write to us at info@saito.tech.
      </p>

    </div>
  </div>
</div>
  `;

  return html;

}

