
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
      <div class="relative">

        <div id="saito-header-menu-toggle">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div class="saito-header-contents">

          <div class="saito-header-identicon">
            <img class="saito-identicon" src="${identicon}" />
          </div>

          <select class="saito-header-token-select saito-select-border">
            <option value="0">0.0000 SAITO</option>
            <option value="1">0.0000 TRX</option>
          </select>

          <div class="saito-header-address">${publickey}</div>

          <hr />

          <ul class="saito-menu  saito-white-background">
            <li class="saito-header-nuke-wallet">
              <i class="fas fa-redo"></i>
              <span> Reset/Nuke Wallet </span>
            </li>
            <li class="saito-header-register">
              <i class="fas fa-at"></i>
              <span> Register Username</span>
            </li>
            <li class="saito-header-settings">
              <i class="fas fa-cog"></i>
              <span> Settings</span>
            </li>
            <li class="saito-header-show-qrcode">
              <i class="fas fa-qrcode"></i>
              <span> Show QRCode</span>
            </li>
            <li class="saito-header-scan-qrcode">
              <i class="fas fa-expand"></i>
              <span> Scan QRCode</span>
            </li>
          </ul>

	  <hr />

          <ul class="saito-menu  saito-white-background">
            <li class="saito-header-arcade">
              <i class="fas fa-gamepad"></i>
              <span> Arcade </span>
            </li>
            <li class="saito-header-redsquare">
              <i class="fas fa-square-full"></i>
              <span> Red Square </span>
            </li>
            <li class="saito-header-website">
              <i class="fas fa-desktop"></i>
              <span> Saito Website</span>
            </li>
            <li class="saito-header-wiki">
              <i class="fas fa-book-open"></i>
              <span> Saito Wiki</span>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>

  `;
  return html;

}
