
module.exports = SaitoHeaderTemplate = (app, mod) => {

   let publickey = app.wallet.returnPublicKey();

   let identicon = app.keychain.returnIdenticon(publickey);

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
         <div id="saito-header-menu-toggle">
            <span></span>
            <span></span>
            <span></span>
         </div>
         <div class="saito-header-hamburger-contents">
            
            <!-------- wallet start -------------->

         <div class="saito-header-profile header-wallet">
                                             
            <div class="wallet-infoo">
               <div id="qrcode">
               </div>

               <div class="wallet-balance">
                  <img class="wallet-idenicon" src="${identicon}">
                  <span class="balance-amount">0.0000</span> 
                  <select class="wallet-select-crypto" id="wallet-select-crypto">
                  </select>
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
               <div class="wallet-btn" id="wallet-btn-deposit" data-assetid="" 
               data-confs="20" data-address="" 
               data-ticker="" data-balance="0">   
                  <i class="fa fa-arrow-down"></i>
                  <span>RECEIVE</span>
               </div>
               <div class="wallet-btn more-options" >   
                  <i class="fa-solid fa-plus"></i>
                  <span class="option-more">SETTINGS</span>
               </div>
            </div>
                  
         </div>

         
         <!-------- wallet  end --------------->

            <div class="saito-header-menu-section appspace-menu">
               <div class="saito-menu">
                  <ul>

                     <!--<li class="saito-header-home">
                       <i class="fa-solid fa-house"></i>
                       <span>Home</span>
                     </li>
                     <li class="saito-header-notification">
                     <i class="fas fa-bell"></i>
                        <span>Notifications</span>
                     </li>
                     <li class="saito-header-wallet">
                       <i class="fas fa-wallet"></i>
                        <span>Wallet</span>
                     </li>
                     <li class="saito-header-stun">
                      <i class="fas fa-video"></i>
                      <span>Video Call</span>
                    </li>-->
                  
                  </ul>
               </div>


               <div class="slidein-panel settings">
                  <div class="saito-header-menu-section">
                     <div class="saito-menu">
                        <ul>    
                           <li class="saito-header-scan-qrcode">
                              <i class="fas fa-expand"></i>
                              <span>Scan</span>
                           </li>

                           <li class="saito-header-wallet-history" id="wallet-btn-history" data-assetid="" data-ticker="" data-balance="0" 
                     data-sender="">
                              <i class="fa-regular fa-clock"></i>
                              <span>Wallet History</span>
                           </li>
                           <li class="saito-header-nuke-wallet">
                              <i class="fas fa-redo"></i>
                              <span>Reset/Nuke Wallet </span>
                           </li>

                           <li class="saito-header-themes">
                           </li>

                        </ul>
                     </div>
                  </div>
               </div>

            </div>
            <div class="saito-header-menu-section configure-options">
               <div class="saito-menu">
                  <ul>
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
                        <span> QRCode</span>
                     </li>
                  </ul>
               </div>
            </div>
            <div class="saito-header-menu-section external-links">
               <div class="saito-menu">
                  <ul>
               `;
               if (app.browser.isMobileBrowser()) {
                   html += `
                     <li class="saito-header-chat">
                     <i class="fas fa-comments"></i>
                        <span class="saito-header-chat-text"> Chat </span>
                     </li>
                   `;
               }

                 html += `
                     
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

         </div>
      </div>
      </div>
   </nav>
</header>

  `;
   return html;

}
