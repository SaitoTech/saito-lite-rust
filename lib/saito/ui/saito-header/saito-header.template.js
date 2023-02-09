
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


            <div class="saito-header-profile header-wallet" style="position:relative;background: var(--saito-background-light);padding: 2.5rem;">
                      
            <div class="wallet-infoo">
<img class="wallet-qrcode" src="data:image/png;base64,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">


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
            


               <div class="wallet-balance">
                  <span class="balance-amount">0.524</span> 
                  <select>
                      <option value="">SAITO</option>
                      <option value="">TRX</option>
                  </select>
               </div><div class="saito-header-profile-address">
                  <img class="wallet-idenicon" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MjAnIGhlaWdodD0nNDIwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDI0MCwyNDAsMjQwLDEpOyc+PGcgc3R5bGU9J2ZpbGw6cmdiYSgxMTQsMjE3LDM4LDEpOyBzdHJva2U6cmdiYSgxMTQsMjE3LDM4LDEpOyBzdHJva2Utd2lkdGg6Mi4xOyc+PHJlY3QgIHg9JzE2OCcgeT0nMCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzE2OCcgeT0nMTY4JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMTY4JyB5PScyNTInIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScxNjgnIHk9JzMzNicgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9Jzg0JyB5PSc4NCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzI1MicgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMjUyJyB5PScyNTInIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nMzM2JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMjUyJyB5PSczMzYnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScwJyB5PScwJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMzM2JyB5PScwJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMCcgeT0nMTY4JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMzM2JyB5PScxNjgnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjwvZz48L3N2Zz4=">
                  <p id="profile-public-key" style="
    width: 79%;
">28yutFsM5vHJx9cg9odTDXMYrRC89AgX3g6WiL4FH4zEc</p>
                  <i class="fas fa-copy"></i>
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
