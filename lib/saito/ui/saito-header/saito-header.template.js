
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



      <div class="saito-header-profile header-wallet" style="position:relative;/* background: var(--saito-background-light); */padding: 0rem;">
<div class="saito-header-profile-address" style="
    margin-bottom: -0.5rem;
">
                  
                  
                  <i class="fas fa-copy" style="
    display: none;
"></i>
               </div>

                      
            
<div class="wallet-infoo" style="
    display: block;
    margin: auto;
">
<img class="wallet-qrcode" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAAydEVYdENyZWF0aW9uIFRpbWUARnJpZGF5LCBGZWJydWFyeSAxMCwgMjAyMyBQTTA2OjU5OjI3gFPJAAAABdpJREFUeJzt3UFu8kgQhuH2yDsOEJA4RBZsvc+ZwhpOxA1ygewhh0CKd0jMYmakf0ZxM66/XC7zvc82salEfDKpVHc3pZR7WaDr9Vrath11zWq1Gvxa3/e/W9JkLHVbf9ah6yzXZLZer8vX11f5Y+5CgDkRAEgjAJBGACCNAEDaYBul67rSdd0kL9o0Tbnfh5tPv379eDxOUgOm9/7+PncJpZT6e6jaR9zv9+7FjHE4HEzXebblrPeytCc9Wdu63u3g7O8hPgJBGgGANAIAaQQA0ggApI2bJvvb6+uraxGfn5+u97N0YCzdGe+OieV+luG1yPv95Ha7ld1u53a/7XZbTqeT6VpTAEop5Xw+Wy/9l81m43IfLIvX+6eUvwJgxUcgSCMAkEYAII0AQBoBgDRzFygzz5amdXjNcl1U3bWWZua10VPgCQBpBADSCACkEQBIIwCQ9pRdoKihsqgd2yJ3XosYhsuEJwCkEQBIIwCQRgAgjQBAmrkLxEou/I4s7x9TALzX8HqLauV5HxrhWXfmtmXbtuVyucxdRimFj0AQRwAgjQBAGgGANAIAadUu0OFweHiYhbIMw3DeSyK9/fdwimzvpaY84TnBnpOd2adBOSfYhnOCgcLfABBHACCNAEAaAYC0NvPQlFWG4bGogbwMHZglv4d4AkAaAYA0AgBpBADSCACkEQBISzEMl2FLwCHew3A1Gc4qHrLUgbxHvx+eAJBGACCNAEAaAYA0AgBpYQdkTPEX/Nj71UQN0GVZqzvEs/OW4ed5hCcApBEASCMAkEYAII0AQBoBgLSm7/vRw3DebUbvobcMZ/RGDfgtodX4kyyDjjwBII0AQBoBgDQCAGkEANJa7+Esz+5HZOcoqr4MO9Bl6Lp5389aA08ASCMAkEYAII0AQBoBgDQCAGmmYThvGVqkGVp5Y+9V470rm4X3mm52hgOcEQBIIwCQRgAgjQBAGgGAtOrWiHMf2JBhGjSq3Wq939yvU5Nh3e+jdjBPAEgjAJBGACCNAEAaAYA00zGpSx1E85ZhsM3yOlGHdCxhII8nAKQRAEgjAJBGACCNAEAaAYC0ahvUc4u6SFFrSiMP3Bj7OjWZh/isNQxhGA6oIACQRgAgjQBAGgGANFMXyNvcSy8jZVgmmKGjY8HOcIAzAgBpBADSCACkEQBIIwCQVt0ZzlOGda2RLb6hGqIOu1jCGb2erG1xngCQRgAgjQBAGgGANAIAaWFdoKile9brouqLqi37wJulPu9OFEsiIY8AQBoBgDQCAGkEANIIAKSFtUEtMgzDee+CFzUMZ+VZ3xKOmOUJAGkEANIIAKQRAEgjAJBGACDN1AadYirP65pH141lbTNGTVxmaSd63suztcvWiEAFAYA0AgBpBADSCACkNX3fDx6QsVQZukAW1kMextzLyvv3ENW9ogsEVBAASCMAkEYAII0AQFr7/f09dw0mq9WqNE0zdxlYuPbl5WXuGkyu12tp23mXNGc+NCJya0TP9q31Og7IAAwIAKQRAEgjAJBGACCtKaX8OAzXdV3pum6aF22acr8Pz+D9+vXj8fjj92ToAtXMvVsaw3D/737Vd9B+vx99U0+Hw2HW18fzS/0RiH90YWqpA1D7mAR4SB0AYGoEANJMbZTb7eZbROJuDp6b6Z232+3K+Xx2KWCz2ZTL5eJyr39ErQmOPLjCUsMQ7zN6vUUOEvIRCNIIAKSlDgD/B8DUUgeA/wNgaqkDAEyNAECaVAM+e/tvSOT2jBl4rzGu4QkAaQQA0ggApBEASCMAkCbVBYpcJ2vpZMy9m1ytBgvvY269B/9K4QkAcQQA0ggApBEASCMAkGbqAm2327Ldbr1rAcKZAnA6nbzreDqWlubQNd7t1loNnoNoGdZTP3odPgJBGgGANAIAaQQA0ggApFW7QG9vb1F1pBXZyYgaoPOsbQqeQ2+PftbBAHx8fIwuAlgaPgJBGgGANAIAaQQA0tr1ej13DcBsmr7v2YEWsv4Ee2iVdAd+LYUAAAAASUVORK5CYII=" style="
    margin: auto;
    display: block;
    margin: 3rem auto;
    padding: 0.5rem;
    border: 2px solid #000;
">


    <div class="wallet-balance" style="
    margin: auto;
    margin: 1rem auto;
    /* border: 1px solid; */
    /* margin-bottom: -0.5rem; */
    position: relative;
    margin-top: 0rem;
    height: 4rem;
    /* border: 1px solid; */
">
<img class="wallet-idenicon" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MjAnIGhlaWdodD0nNDIwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDI0MCwyNDAsMjQwLDEpOyc+PGcgc3R5bGU9J2ZpbGw6cmdiYSgxMTQsMjE3LDM4LDEpOyBzdHJva2U6cmdiYSgxMTQsMjE3LDM4LDEpOyBzdHJva2Utd2lkdGg6Mi4xOyc+PHJlY3QgIHg9JzE2OCcgeT0nMCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzE2OCcgeT0nMTY4JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMTY4JyB5PScyNTInIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScxNjgnIHk9JzMzNicgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9Jzg0JyB5PSc4NCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzI1MicgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMjUyJyB5PScyNTInIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nMzM2JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMjUyJyB5PSczMzYnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScwJyB5PScwJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMzM2JyB5PScwJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMCcgeT0nMTY4JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMzM2JyB5PScxNjgnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjwvZz48L3N2Zz4=" style="
    display: inline-block;
    float: left;
    /* margin: auto; */
    /* width: 6rem; */
    /* height: 6rem; */
    /* border-radius: 50%; */
    /* margin-right: -4rem; */
">

                  <span class="balance-amount" style="
    font-weight: bold;
    font-size: 5rem;
    height: min-content;
    /* border: 1px solid; */
    /* margin-left: 4rem; */
    padding-left: 1rem;
    line-height: 4rem;
">0.52411</span> 
                  <select style="
    margin-top: 1.2rem;
    /* width: 8rem; */
    /* margin-left: 1rem; */
    /* border: 1px solid; */
    text-align: center;
    width: auto;
    font-size: 2.2rem;
    line-height: ;
">
                      <option value="">SAITO</option>
                      <option value="">TRX</option>
                  </select>
               </div>


<div class="pubkey-containter" style="
    position: relative;
    margin-bottom: 5rem;
">
<p id="profile-public-key" style="
    width: 74%;
    display: block;
    margin-left: 50%;
    transform: translateX(-54%);
    float: left;
    font-size: 1.7rem;
    margin-top: 0.5rem;
    font-weight: bold;
    white-space: break-spaces;
    overflow: hidden;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    /* padding-right: 2rem; */
    /* border: 1px solid; */
    /* margin-left: 2rem; */
">28yutFsM5vHJx9cg9odTDXMYrRC89AgX3g6WiL4FH4zEc</p>
<i class="fas fa-copy" style="
    line-height: 12rem;
    position: absolute;
    bottom: -7.5rem;
    right: 5rem;
"></i>
</div>


</div>
            


               

<div class="wallet-btn-container" style="
    white-space: nowrap;
    width: fit-content;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    border: none;
    grid-column-gap: 3.3rem;
    color: #fff;
    background: var(--saito-arcade-overlay-background);
    border-radius: 0.7rem;
    padding: 1rem 1rem;
    margin: auto;
    width: 95%;
    margin-bottom: 1.5rem;
">
               <div class="wallet-btn" style="">
                  <i class="fa fa-arrow-up" style="
    display: block;
    padding: 0rem;
    margin: 0rem;
    line-height: 2rem;
    margin-bottom: 0.5rem;
"></i>
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
