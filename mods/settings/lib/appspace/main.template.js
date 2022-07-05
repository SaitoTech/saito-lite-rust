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
  <div class="settings-appspace">

    <div>

      <div>

        <div class="saito-grid-1-1-1">
          <button>Backup Wallet</button>
          <button>Restore Wallet</button>
          <button>Import Private Key</button>
        </div>

        <div class="saito-grid-1">
         <input  type="file" name="name" style="display:none;" />
        </div>
        ${balance_link}


        <div class="saito-grid-1-1">

          <p class="large">Email:</p>
          <p>${email_registered}</p>

          <p class="large">Username:</p>
 .         <p>${identifier_registered}</p>

          <p class="large">Public Key:</p>
          <p>${app.wallet.returnPublicKey()}</p>

          <p class="large">Private Key:</p>
          <p class="settings-privatekey">
            <input id="settings-privatekey-input" type="text" value="${app.wallet.returnPrivateKey()}" class="settings-password" />
            <i class="settings-see-password fas fa-eye" id="settings-see-password"></i>
          </p>

	</div>

      </div>

      <div class="">

        <h3>Installed Modules: `;

  if (app.modules.returnModule("AppStore") != null) {
    html += ` &nbsp; [<span id="trigger-appstore-btn" class="trigger-appstore-btn">&nbsp;install more&nbsp;</span>]`;
  }

  html += `</h2>
        <div class="settings-appspace-modules">
        ${modules_html}
        </div>
      </div>
      <hr />
      <div class="saito-grid-1-1-1-1">
        <p class="large">Code Version:</p>
        <p class="middle">${app.wallet.wallet.version}</p>
        <p class="large">Wallet Version:</p>
        <p class="middle">${app.options.wallet.version}</p>
      </div>

      <p class="small" style="padding-bottom:40px;">
        Having trouble? Try clearing your browser cache or <span style="cursor:pointer; border-bottom: 1px dashed" >resetting your account</span>. If that doesn't fix things, write to us at info@saito.tech.
      </p>

    </div>
  </div>
</div>
  `;

  return html;

}

