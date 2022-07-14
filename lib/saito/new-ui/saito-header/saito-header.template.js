
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

  <header id="saito-header">
    <img class="logo" alt="Logo" src="/saito/img/logo.svg" /> 

    <nav>
      <div class="relative" style="">
        <div id="header-menu-toggle">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="header-hamburger-contents">
          <div class="header-profile">
                <img src="/saito/img/background.png" />
                <div>
                    <p>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </p>
                    <i class="fas fa-copy"></i>
                </div>
            
          </div>
          <select class="saito-new-select saito-select-border">
          <option value="0">0.0000 SAITO</option>
          <option value="1">0.0000 TRX</option>
        
      </select>

          <div class="header-menu-section">
            <div class="saito-menu  saito-white-background">
            <ul>
              <li class="no-icon">
                <i class="far fa-address-card saito-primary-color"> </i>
                <span> Create Game </span>
            </li>
              <li>
                <i class="far fa-address-card saito-primary-color"> </i>
                <span> Send Tokens</span>
              </li>
          
            </ul>
            </div>
          </div>
          <div class="header-menu-section">
          <div class="saito-menu  saito-white-background">
          <ul>
            <li class="no-icon">
              <i class="far fa-address-card saito-primary-color"> </i>
              <span> Reset/Nuke Wallet </span>
            </li>
            <li>
              <i class="far fa-address-card saito-primary-color"> </i>
              <span> Backup Access Keys</span>
            </li>
            <li>
              <i class="far fa-address-card saito-primary-color"> </i>
              <span> Restore Access Keys</span>
            </li>
            <li>
              <i class="far fa-address-card saito-primary-color"> </i>
              <span> Settings</span>
            </li>
            <li>
              <i class="far fa-address-card saito-primary-color"> </i>
              <span>Scan</span>
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
            <span> Chat</span>
          </li>
          <li>
            <i class="far fa-address-card saito-primary-color"> </i>
            <span> Dev Center</span>
          </li>
          <li>
            <i class="far fa-address-card saito-primary-color"> </i>
            <span> Post</span>
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
