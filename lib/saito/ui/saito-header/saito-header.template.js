module.exports = SaitoHeaderTemplate = async (app, mod) => {
  let publickey = await app.wallet.returnPublicKey();

  let identicon = app.keychain.returnIdenticon(publickey);

  let menu_insert_html = "";
  let added_top_menu = 0;
  app.modules.respondTo("header-menu").forEach((module) => {
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
           <div class="relative hamburger-container">
               <span id="header-username" class="header-username"></span>
               <div id="saito-header-menu-toggle">
                   <span></span>
                   <span></span>
                   <span></span>
               </div>
               <div class="saito-header-hamburger-contents">
                   <!-------- wallet start --------->
                   <div class="saito-header-profile header-wallet">
                       <div class="wallet-infoo">
                           <div id="qrcode"></div>
                           <div class="wallet-balance">
                               <img class="wallet-idenicon" src="${identicon}">
                               <span class="balance-amount">0.0</span>
                               <select class="wallet-select-crypto" id="wallet-select-crypto"></select>
                           </div>
                           <div class="pubkey-containter">
                               <p class="profile-public-key" id="profile-public-key">${publickey}</p>
                               <i class="fas fa-copy"></i>
                           </div>
                       </div>
                       <div class="wallet-btn-container">
                           <div class="wallet-btn" id="wallet-btn-withdraw" data-assetid="" data-ticker="" data-balance="0"
                               data-sender="">
                               <i class="fa fa-arrow-up"></i>
                               <span>SEND</span>
                           </div>
                           <div class="wallet-btn wallet-btn-history" id="wallet-btn-history" data-asset-id="" data-ticker="">
                               <i class="fa-regular fa-clock"></i>
                               <span>History</span>
                           </div>
                           <div class="wallet-btn more-options">
                               <i class="fas fa-cog"></i>
                               <span class="option-more">ACCOUNT</span>
                           </div>
                       </div>



                       <div class="slidein-panel settings">
                           <div class="saito-header-menu-section">
                               <div class="saito-menu">
                                   <ul>
                                       <li class="saito-header-scan-qrcode">
                                           <i class="fas fa-expand"></i>
                                           <span>Scan</span>
                                       </li>
                                       <li class="saito-header-wallet-history" id="wallet-btn-history" data-assetid=""
                                           data-ticker="" data-balance="0" data-sender="">
                                           <i class="fa-regular fa-clock"></i>
                                           <span>Wallet History</span>
                                       </li>
                                       <li class="saito-header-nuke-wallet">
                                           <i class="fas fa-redo"></i>
                                           <span>Nuke Wallet</span>
                                       </li>
                                   </ul>
                               </div>
                           </div>
                       </div>

                   </div>
                   <!-------- wallet end ----------->
                   <div class="saito-header-menu-section appspace-menu">
                     <div class="saito-menu">
                       <ul>
                       </ul>
                     </div>
                   </div>
          
               </div>
           </div>
       </nav>
   </header>

    <!-- floating menu start -->
    <div class="saito-floating-container">
        <div class="saito-floating-item-container">
        </div>

        <div class="saito-floating-plus-btn" id="saito-floating-plus-btn">
            <i class="fa-solid fa-plus"></i>
        </div>
    </div>
    <!-- floating menu end -->
  `;
  return html;
};
