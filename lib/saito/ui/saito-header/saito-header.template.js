let SaitoHeaderTemplate = (app, mod, headerClass) => {
	let identicon = app.keychain.returnIdenticon(mod.publicKey);

	let menu_insert_html = '';
	let added_top_menu = 0;
	app.modules.respondTo('header-menu').forEach((headerModule) => {
		added_top_menu = 1;
		menu_insert_html += headerModule
			.respondTo('header-menu')
			.returnMenu(app, mod);
	});

	if (added_top_menu == 1) {
		menu_insert_html += `
        <center><hr width="98%" style="color:#888"/></center>
    `;
	}

	let html = `
   <header id="saito-header" class="${headerClass}">
        <div class="saito-header-logo-wrapper">
            <img class="saito-header-logo" alt="Logo" src="/saito/img/logo.svg" />
        </div>
       <nav>
           <div class="relative hamburger-container">
               <span id="header-username" class="header-username"></span>
               <div id="saito-header-menu-toggle" class="fa-solid fa-bars"></div>
               <div class="saito-header-backdrop"></div>
               <div class="saito-header-hamburger-contents">
                   <!-------- wallet start --------->
                   <div class="saito-header-profile header-wallet">
                       <div class="wallet-infoo">
                           <div id="qrcode"></div>
                           <div class="wallet-balance">
                               <img class="wallet-identicon" src="${identicon}">
                               <span class="balance-amount">
                                <span class="balance-amount-whole">0</span>
                                <span class="balance-amount-separator">.</span>
                                <span class="balance-amount-decimal">00</span>
                                </span>
                               <select class="wallet-select-crypto" id="wallet-select-crypto"></select>
                           </div>
                           <div class="pubkey-containter">
                               <p class="profile-public-key" id="profile-public-key">${mod.publicKey}</p>
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

  `;
	return html;
};

module.exports = SaitoHeaderTemplate;
