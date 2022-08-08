
module.exports = SaitoHeaderTemplate = (app, mod) => {

  let publickey = app.wallet.returnPublicKey();
  let identicon = app.keys.returnIdenticon(publickey);

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

  <header id="saito-header">
    <img class="saito-header-logo" alt="Logo" src="/saito/img/logo.svg" />
    <nav>
      <div class="relative" style="">
        <div id="header-menu-toggle">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="header-hamburger-contents">

          <div class="header-profile">
	    <div class="header-profile-identicon">
              <img class="saito-identicon" src="${identicon}" />
	    </div>
	    <div class="header-profile-balance">
              <select class="saito-new-select saito-select-border">
                <option value="0">0.0000 SAITO</option>
                <option value="1">0.0000 TRX</option>
              </select>
	    </div>
            <div class="header-profile-address">
              <p>${publickey}</p>
              <i class="fas fa-copy"></i>
            </div>
          </div>


          <div class="header-menu-section">
            <div class="saito-menu  saito-white-background">
              <ul>
                <li class="saito-header-nuke-wallet">
                  <i class="far fa-address-card saito-primary-color"> </i>
                  <span> Reset/Nuke Wallet </span>
                </li>
                <li class="saito-header-settings">
                  <i class="far fa-address-card saito-primary-color"> </i>
                  <span> Settings</span>
                </li>
                <li class="saito-header-show-qrcode">
                  <i class="far fa-address-card saito-primary-color"> </i>
                  <span> Show QRCode</span>
                </li>
                <li class="saito-header-scan-qrcode">
                  <i class="far fa-address-card saito-primary-color"> </i>
                  <span> Scan QRCode</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="header-menu-section">
            <div class="saito-menu  saito-white-background">
              <ul>
                <li class="no-icon">
                  <i class="far fa-address-card saito-primary-color"> </i>
                  <span> Arcade </span>
                </li>
                <li>
                  <i class="far fa-address-card saito-primary-color"> </i>
                  <span> Developers</span>
                </li>
                <li class="no-icon">
                  <i class="far fa-address-card saito-primary-color"> </i>
                  <span> Red Square </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</header>

  `;
  return html;

}
