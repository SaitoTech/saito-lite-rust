
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
                      
            <img class="saito-identicon" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MjAnIGhlaWdodD0nNDIwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDI0MCwyNDAsMjQwLDEpOyc+PGcgc3R5bGU9J2ZpbGw6cmdiYSgxMTQsMjE3LDM4LDEpOyBzdHJva2U6cmdiYSgxMTQsMjE3LDM4LDEpOyBzdHJva2Utd2lkdGg6Mi4xOyc+PHJlY3QgIHg9JzE2OCcgeT0nMCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzE2OCcgeT0nMTY4JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMTY4JyB5PScyNTInIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScxNjgnIHk9JzMzNicgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9Jzg0JyB5PSc4NCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzI1MicgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMjUyJyB5PScyNTInIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nMzM2JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMjUyJyB5PSczMzYnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScwJyB5PScwJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMzM2JyB5PScwJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMCcgeT0nMTY4JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMzM2JyB5PScxNjgnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjwvZz48L3N2Zz4=">
            <div class="saito-header-profile-address">
               <p id="profile-public-key">28yutFsM5vHJx9cg9odTDXMYrRC89AgX3g6WiL4FH4zEc</p>
               <i class="fas fa-copy"></i>
            </div>

            <div class="wallet-balance">
               <span class="balance-amount">0.524</span> 
               <select>
                   <option value="">SAITO</option>
                   <option value="">TRX</option>
               </select>
            </div>
                  
            <div class="wallet-btn-container">
               <div class="wallet-btn">
                  <i class="fa fa-arrow-up"></i>
                  <span>SEND</span>
               </div>
               <div class="wallet-btn">   
                  <i class="fa fa-arrow-down"></i>
                  <span>RECEIVE</span>
               </div>
               <div class="wallet-btn">   
                  <i class="fas fa-expand"></i>
                  <span>SCAN</span>
               </div>
               <div class="wallet-btn more-options">   
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
            </div>
            <div class="saito-header-menu-section configure-options">
               <div class="saito-menu">
                  <ul>
                     <li class="saito-header-register">
                       <i class="fas fa-at"></i>
                       <span> Register Username</span>
                     </li>
                     <li class="saito-header-nuke-wallet">
                     <i class="fas fa-redo"></i>
                        <span> Reset/Nuke Wallet </span>
                     </li>
                     <li class="saito-header-settings">
                       <i class="fas fa-cog"></i>
                        <span> Settings</span>
                     </li>
                     <li class="saito-header-show-qrcode">
                     <i class="fas fa-qrcode"></i>
                        <span> QRCode</span>
                     </li>
                     <li class="saito-header-scan-qrcode">
                     <i class="fas fa-expand"></i>
                   </span>
                        <span>Scan</span>
                     </li>

                     <li class="saito-header-themes">
                        
                     </li>
                  </ul>
               </div>
            </div>
            <div class="saito-header-menu-section">
               <div class="saito-menu">
                  <ul>
                     <li id="saito_header_menu_item_0" data-id="Games" class="saito-header-appspace-option">
                       <i class="fas fa-gamepad"></i>
                       <span>Games</span>
                     </li>
                     <li id="saito_header_menu_item_5" data-id="Video Call" class="saito-header-appspace-option">
                       <i class="fas fa-video"></i>
                       <span>Video Call</span>
                     </li>
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

            


         <div class="slidein-panel">
            <div class="saito-header-menu-section">
               <div class="saito-menu">
                  <ul>         
                     <li class="saito-header-nuke-wallet">
                        <i class="fa-regular fa-clock"></i>
                        <span>Wallet History</span>
                     </li>
                     <li class="saito-header-show-qrcode">
                        <i class="fas fa-qrcode"></i>
                        <span>QRCode</span>
                     </li>
                     <li class="saito-header-nuke-wallet">
                        <i class="fas fa-redo"></i>
                        <span>Reset/Nuke Wallet </span>
                     </li>
                     <li class="saito-header-show-qrcode">
                        <i class="fa-solid fa-arrows-rotate"></i>
                        <span>Recover</span>
                     </li>         
                  </ul>
               </div>
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
