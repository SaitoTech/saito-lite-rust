
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



            <div class="saito-header-profile" style="
    background-color: #877878;
    /* min-height: 18rem; */
    background-image: linear-gradient(143deg,#ffffff,#e4e9f1 14%,#dce6ff 50%);
    padding-bottom: 2.5rem;
    padding-top: 1.5rem;
    border-bottom-right-radius: 4rem;
    border-bottom-left-radius: 4rem;
">
             
               
<img class="saito-identicon" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MjAnIGhlaWdodD0nNDIwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDI0MCwyNDAsMjQwLDEpOyc+PGcgc3R5bGU9J2ZpbGw6cmdiYSgxMTQsMjE3LDM4LDEpOyBzdHJva2U6cmdiYSgxMTQsMjE3LDM4LDEpOyBzdHJva2Utd2lkdGg6Mi4xOyc+PHJlY3QgIHg9JzE2OCcgeT0nMCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzE2OCcgeT0nMTY4JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMTY4JyB5PScyNTInIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScxNjgnIHk9JzMzNicgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9Jzg0JyB5PSc4NCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzI1MicgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMjUyJyB5PScyNTInIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nMzM2JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMjUyJyB5PSczMzYnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScwJyB5PScwJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMzM2JyB5PScwJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMCcgeT0nMTY4JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMzM2JyB5PScxNjgnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjwvZz48L3N2Zz4=" style="
    margin: auto;
    border-radius: 50%;
    width: 5rem;
    height: 5rem;
    border: 1px solid #bbb;
"><div class="saito-header-profile-address" style="
    width: 45%;
    margin: auto;
    padding-top: 0rem;
">
                  <p id="profile-public-key">28yutFsM5vHJx9cg9odTDXMYrRC89AgX3g6WiL4FH4zEc</p>
                  <i class="fas fa-copy" style="
    line-height: 1.7rem;
"></i>
               </div>

<div class="wallet-balance" style="
    margin: auto;
    min-width: fit-content;
    position: relative;
"><span class="balance-amount" style="
    font-size: 3rem;
    display: inline-block;
    float: left;
">0.524</span> <span class="balance-ticker" style="
    display: inline-block;
    /* float: left; */
    font-size: 1.5rem;
    padding-left: 0.5rem;
    /* position: absolute; */
    vertical-align: -webkit-baseline-middle;
    height: 3rem;
    /* border: 1px solid; */
    display: flex;
    justify-content: center;
    align-items: flex-end;
">SAITO</span></div>






               
               
<div class="wallet-btns" style="
    overflow-x: scroll;
    white-space: nowrap;
    width: 34rem;
    /* padding: 0rem 3rem; */
    padding-bottom: 1rem;
    margin: auto;
">


<a href="#" class="" style="
    width: fit-content;
    border-radius: 50%;
    width: 5rem;
    height: 5rem;
    text-align: center;
    color: #333;
    background: #fff;
    display:inline-block;
    margin-right: 9rem;
">

<i class="fa fa-arrow-up" style="
    display: block;
    /* line-height: 6rem; */
    /* border: 1px solid; */
    padding: 0rem;
    margin: 0rem;
    line-height: 5.5rem;
    margin-bottom: 0.5rem;
    color: var(--saito-font-color-light);
"></i>
<span style="
">SEND</span>
</a>


<a href="#" class="" style="
    width: fit-content;
    border-radius: 50%;
    width: 5rem;
    height: 5rem;
    text-align: center;
    color: #333;
    background: #fff;
    display:inline-block;
    margin-right: 9rem;
">

<i class="fa fa-arrow-down" style="
    display: block;
    /* line-height: 6rem; */
    /* border: 1px solid; */
    padding: 0rem;
    margin: 0rem;
    line-height: 5.5rem;
    margin-bottom: 0.5rem;
    color: var(--saito-font-color-light);
"></i>
<span style="
">RECEIVE</span>
</a>


<a href="#" class="" style="
    width: fit-content;
    border-radius: 50%;
    width: 5rem;
    height: 5rem;
    text-align: center;
    color: #333;
    background: #fff;
    display:inline-block;
    margin-right: 9rem;
">

<i class="fas fa-redo" style="
    display: block;
    /* line-height: 6rem; */
    /* border: 1px solid; */
    padding: 0rem;
    margin: 0rem;
    line-height: 5.5rem;
    margin-bottom: 0.5rem;
    color: var(--saito-font-color-light);
"></i>
<span style="
">NUKE</span>
</a>

<a href="#" class="saito-header-register" style="
    width: fit-content;
    border-radius: 50%;
    width: 5rem;
    height: 5rem;
    text-align: center;
    color: #333;
    background: #fff;
    display:inline-block;
    margin-right: 9rem;
">

<i class="fas fa-at" style="
    display: block;
    /* line-height: 6rem; */
    /* border: 1px solid; */
    padding: 0rem;
    margin: 0rem;
    line-height: 5.5rem;
    margin-bottom: 0.5rem;
    color: var(--saito-font-color-light);
"></i>
<span style="
">REGISTER</span>
</a>

<a href="#" class="saito-header-show-qrcode" style="
    width: fit-content;
    border-radius: 50%;
    width: 5rem;
    height: 5rem;
    text-align: center;
    color: #333;
    background: #fff;
    display:inline-block;
    margin-right: 9rem;
">

<i class="fas fa-qrcode" style="
    display: block;
    /* line-height: 6rem; */
    /* border: 1px solid; */
    padding: 0rem;
    margin: 0rem;
    line-height: 5.5rem;
    margin-bottom: 0.5rem;
    color: var(--saito-font-color-light);
"></i>
<span style="
">QRCode</span>
</a>



<a href="#" class="" style="
    width: fit-content;
    border-radius: 50%;
    width: 5rem;
    height: 5rem;
    text-align: center;
    color: #333;
    background: #fff;
    display:inline-block;
    margin-right: 9rem;
">

<i class="fas fa-expand" style="
    display: block;
    /* line-height: 6rem; */
    /* border: 1px solid; */
    padding: 0rem;
    margin: 0rem;
    line-height: 5.5rem;
    margin-bottom: 0.5rem;
    color: var(--saito-font-color-light);
"></i>
<span style="
">SCAN</span>
</a>


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
                        <span> Scan</span>
                     </li>

                     <li class="saito-header-themes">
                        
                     </li>
                  </ul>
               </div>
            </div>
            <div class="saito-header-menu-section">
               <div class="saito-menu">
                  <ul>
                     <li class="saito-header-redsquare">
                     <i class="fas fa-square-full"></i>
                        <span> Red Square </span>
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

            


            <div class="slidein-panel" style="
    position: absolute;
    top: 31vh;
    /*left: 0px;*/
    background: #fff;
    width: 100vw;
    height: 99vh;
    overflow: hidden;
    z-index: 2;
    transition: all 0.2s ease-in-out;
    padding: 1.5rem 0rem;
     left: 100vw;
">
    
    <div class="panel-nav" style="
    color: var(--saito-primary);
    margin-left: 4rem;
"><span class="menu-back" style="
    font-size: 2rem;
"> Menu</span>
<span class="seperator" style="
    font-size: 2rem;
    color: var(--saito-gray-mid);
    padding: 0rem 1rem;
">/</span>
<span style="
    font-size: 2rem;
    color: var(--saito-gray-mid);
"> Settings </span></div>
    <div class="saito-header-menu-section">
               <div class="saito-menu">
                  <ul>
                     <li class="saito-header-redsquare">
                     <i class="fa-regular fa-moon"></i>
                        <span>Theme</span>
                     </li>

                     <li class="saito-header-website">
                     <i class="fa-solid fa-wrench"></i>
                     <span>Modules</span>
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
