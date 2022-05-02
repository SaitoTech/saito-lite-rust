
module.exports = SaitoHeaderTemplate = (app, mod) => {

  let menu_insert_html = '';
  let added_top_menu = 0;
  app.modules.respondTo("header-menu").forEach(module => {
    added_top_menu = 1;
    menu_insert_html += module.respondTo("header-menu").returnMenu(app, mod);
  });
  if (added_top_menu == 1) {
    menu_insert_html += `
        <center><hr width="98%" style="color:#888"/></center>
    `;
  }

  let html = `

  <div id="saito-header" class="header header-home">
    <div class="header-wrapper">
      <a id="header-logo-link" href="/"><img class="logo" src="/saito/img/logo.svg"></a>
      <div id="header-icon-links" class="header-icon-links">
        <div id="header-mini-wallet" class="header-mini-wallet">
          <span id="header-username" class="header-username"></span>
        </div>
        <i id="navigator" class="header-icon icon-med fas fa-bars"></i>
      </div>

      <div id="settings-dropdown" class="header-dropdown">
        <div class="personal-info">
          <img id="header-profile-photo" class="header-profile-photo" />
          <div class="account-info">
            <div class="profile-key-cont">
              <div id="profile-public-key" class="profile-public-key"></div>
              <div id="copy-btn" class="fas fa-copy fa-regular"></div>
            </div>
            <div class="saito-select">
              <select id="header-token-select" class="saito-slct"></select>
            </div>
            </div>
        </div>

        <center><hr width="98%" style="color:#888"/></center>

        <div class="wallet-actions">
	  ${menu_insert_html}
          <div class="wallet-action-row" id="header-dropdown-reset-wallet">
            <span class="scan-qr-info"><i class="settings-fas-icon fas fa-copy"></i> Reset/Nuke Wallet</span>
          </div>
          <div class="wallet-action-row" id="header-dropdown-backup-wallet">
            <span class="scan-qr-info"><i class="settings-fas-icon fas fa-copy"></i> Backup Access Keys</span>
          </div>
          <div class="wallet-action-row" id="header-dropdown-restore-wallet">
            <span class="scan-qr-info"><i class="settings-fas-icon fas fa-redo"></i> Restore Access Keys</span>
	    <div style="display:none"><input id="saito-header-file-input" class="saito-header-file-input" type="file" name="name" style="display:none;" /></div>
          </div>
          <div class="wallet-action-row" id="header-dropdown-settings">
            <span class="scan-qr-info"><i class="settings-fas-icon fas fa-wrench"></i> Settings </span>
          </div>
          <div class="wallet-action-row" id="header-dropdown-scan-qr">
            <span class="scan-qr-info"><i class="settings-fas-icon fas fa-qrcode"></i> Scan </span>
          </div>
        </div>
       </div>
     </div>
  `;
  return html;

}
