const SaitoHeaderTemplate = require("./saito-header.template");
const SaitoOverlay = require("./../../ui/saito-overlay/saito-overlay");
const UIModTemplate = require("./../../../templates/uimodtemplate");
const RegisterUsername = require("../../ui/modals/register-username/register-username.js");
const SelectCrypto = require("../../ui/modals/select-crypto/select-crypto.js");

//
// UIModTemplate
//
// The header derives from UIModTemplate -- this allows the component
// to be added to the list of modules that are actively running on Saito
// thus allowing them to receive transactions and update their UI just
// like any other modules.
//
class SaitoHeader extends UIModTemplate {

  constructor(app, mod) {

    super(app);

    //
    // UI components as modules allows them to respond
    // to events individually...
    //
    this.name = "SaitoHeader UIComponent";
    this.app = app;
    this.mod = mod;

    this.callbacks = {};

    //
    // now initialize, since UI components are created
    // after all other modules have initialized, we need
    // to run any missed functions here in the constructor
    // in this case, initialize, as that is what processes
    // receiveEvent, etc.
    //
    this.initialize(app);

  }

  initialize(app) {
    super.initialize(app);

    app.connection.on("update_identifier", (tmpkey)=>{
      if (tmpkey.publickey === app.wallet.returnPublicKey()) {
        let username = app.keychain.returnIdentifierByPublicKey(app.wallet.returnPublicKey());
        if (document.querySelector(".saito-header-register")){
          document.querySelector(".saito-header-register").onclick = null;
          document.querySelector(".saito-header-register span").innerHTML = username;
        }
      }
    });

    app.connection.on("update_balance", (wallet) => {
      this.renderCrypto();
    });

    app.connection.on("set_preferred_crypto", (data) => {
      this.renderCrypto();
    });


  }

  render() {

    this_header = this;
    let app = this.app;
    let mod = this.mod;

    if (mod == null || !document) {
      return;
    }

    //
    // add to DOM if needed
    //
    if (!document.getElementById("saito-header")) {
      app.browser.addElementToDom(SaitoHeaderTemplate(app, mod));
    }

    //
    // render cryptos
    //
    this.renderCrypto();

    this.app.modules.renderInto(".saito-header-themes");

    let mods = app.modules.respondTo("saito-header");

    let index = 0;
    mods.forEach((mod) => {
        let item = mod.respondTo('saito-header');
        if(item instanceof Array){
          item.forEach(j => {

            let active_mod = this.app.modules.returnActiveModule();
            if (typeof j.allowed_mods != 'undefined' && 
              !j.allowed_mods.includes(active_mod.slug)) {
              return;
            }
              let id = `saito_header_menu_item_${index}`;
              this_header.callbacks[id] = j.callback;
              this_header.addMenuItem(j, id);
              index++;
          });
        } else {
          let id = `saito_header_menu_item_${index}`;
          this_header.callbacks[id] = item.callback;
          this_header.addMenuItem(item, id);
          index++;
        }
        index++;
    })

    this.attachEvents();
  }

  addMenuItem(item, id) {
    document.querySelector(".saito-header-menu-section.appspace-menu > .saito-menu > ul").innerHTML += `
      <li id="${id}" data-id="${item.text}" class="saito-header-appspace-option">
        <i class="${item.icon}"></i>
        <span>${item.text}</span>
      </li>
    `;
  }

  attachEvents(){

    let app = this.app;
    let mod = this.mod;
    this_header = this;

    document.querySelectorAll('.saito-header-appspace-option').forEach(menu => {
      let id = menu.getAttribute("id");
      let data_id = menu.getAttribute("data-id");
      let callback = this_header.callbacks[id];

      menu.addEventListener('click', () => {
	  this.toggleMenu();
          callback(app, data_id);
      });
    })

    if (document.querySelector("#saito-header-menu-toggle")) {
      document.querySelector("#saito-header-menu-toggle").addEventListener("click", this.toggleMenu);
    }

    //
    // default buttons
    //
    try {
      let username = app.keychain.returnIdentifierByPublicKey(app.wallet.returnPublicKey(), true);

      if (username == "" || username == app.wallet.returnPublicKey()) {
        document.querySelector(".saito-header-register").onclick = (e) => {
         mod.modal_register_username = new RegisterUsername(app, mod); //No callback
         mod.modal_register_username.render();
         return;
        };
      } else {
        document.querySelector(".saito-header-register span").innerHTML = username;
      }

      document.querySelector(".saito-header-settings").onclick = (e) => {
        window.location = "/redsquare/#settings";
      }
      document.querySelector(".saito-header-show-qrcode").onclick = (e) => {
        this.overlay = new SaitoOverlay(app, mod, false, true);
        this.overlay.show('<div id="qrcode"></div>');
        app.browser.generateQRCode(app.wallet.returnPublicKey());
      }
      document.querySelector(".saito-header-scan-qrcode").onclick = (e) => {
        let scanner_self = app.modules.returnModule("QRScanner");
        scanner_self.startScanner();
      }
      document.querySelector(".saito-header-nuke-wallet").onclick = async (e) => {
        let c = await sconfirm("Are you sure you want to reset your wallet?");
        if (c){
          app.wallet.resetWallet();
          location.reload();
        }
      }
try {
      document.querySelector(".saito-header-chat").onclick = (e) => {
	this.toggleMenu();
	let chatmod = this.app.modules.returnModule("Chat");
	if (chatmod) {
	  let cmo = chatmod.respondTo("chat-manager-overlay");
	  cmo.render();
	} else {
          window.location = "/chat";
	}
      }
} catch (err) {}
      document.querySelector(".saito-header-arcade").onclick = (e) => {
        window.location = "/arcade";
      }
      document.querySelector(".saito-header-redsquare").onclick = (e) => {
        window.location = "/redsquare";
      }
      document.querySelector(".saito-header-website").onclick = (e) => {
        window.location = "https://saito.tech";
      }
      document.querySelector(".saito-header-wiki").onclick = (e) => {
        window.location = "https://wiki.saito.io";
      }

      document.querySelector(".saito-header-profile-address").onclick = (e) =>{
        let public_key = document.getElementById('profile-public-key').innerHTML;
        navigator.clipboard.writeText(public_key);
  
        let icon_element = document.querySelector(".saito-header-profile-address i");
        icon_element.classList.toggle("fa-copy");
        icon_element.classList.toggle("fa-check");

        setTimeout(() => {
          icon_element.classList.toggle("fa-copy");
          icon_element.classList.toggle("fa-check");
        }, 800);

      }

      //
      //
      //
      document.querySelectorAll(".saito-select-crypto").forEach((element, i) => {
        element.onchange = (value) => {
          if (element.value === "add-new") {
            let current_default = app.wallet.returnPreferredCrypto();
            let select_box = document.querySelector(".saito-select-crypto");
            select_box.value = current_default.name;

            let appstore_mod = app.modules.returnModule("AppStore");
            if (appstore_mod) {
              let options = { search: "", category: "Cryptocurrency", featured: 1 };
              appstore_mod.openAppstoreOverlay(options);
            } else {
              salert("Cannot install other cryptocurrencies without the appstore!");
            }
            return;
          }

          app.wallet.setPreferredCrypto(element.value, 1);
        };
      });


      document.querySelector(".saito-header-logo").onclick = (e) => {
        window.location.href = "/" + mod.returnSlug();
      }


    } catch (err) {
      console.log("ERROR: " + err);
    }


    document.querySelector('.configure-options').style.display = 'none';
  }


  async renderCrypto() {
    try {

      let available_cryptos = this.app.wallet.returnInstalledCryptos();
      let preferred_crypto = this.app.wallet.returnPreferredCrypto();
      let add = preferred_crypto.returnAddress();

      document.querySelector(".saito-select-crypto").innerHTML = "";

      //
      // add crypto options
      //
      for (let i = 0; i < available_cryptos.length; i++) {
        let crypto_mod = available_cryptos[i];
        let html = '';

        if (crypto_mod.name == preferred_crypto.name) {
          html = '<option selected class="saito-select-crypto-option" id="crypto-option-'+preferred_crypto.name+'" value="'+preferred_crypto.ticker+'">... '+preferred_crypto.ticker+'</option>';
        } else {
          html = '<option class="saito-select-crypto-option" id="crypto-option-'+crypto_mod.name+'" value="'+crypto_mod.ticker+'">... '+crypto_mod.ticker+'</option>';
        }

        this.app.browser.addElementToElement(html, document.querySelector(".saito-select-crypto"));        
        this.loadCryptoBalance(available_cryptos[i]);
      }


      //
      // trigger select modal
      //
      let modal_select_crypto = new SelectCrypto(this.app, this.mod, preferred_crypto);
      let activation_check = preferred_crypto.isActivated();

      if (activation_check == false) {
        preferred_crypto.activate();
        if (preferred_crypto.renderModalSelectCrypto(this.app, this.mod, preferred_crypto)) {
          modal_select_crypto.render(this.app, this.mod, preferred_crypto);
          modal_select_crypto.attachEvents(this.app, this.mod, preferred_crypto);
        }
      }


    } catch (err) { console.log("Error rendering crypto header: " + err); }
  }


  toggleMenu(e) {
    document
      .querySelector(".saito-header-hamburger-contents")
      .classList.contains("show-menu")
      ? document
        .querySelector(".saito-header-hamburger-contents")
        .classList.remove("show-menu")
      : document
        .querySelector(".saito-header-hamburger-contents")
        .classList.add("show-menu");
  }


  async loadCryptoBalance(cryptoMod) {
    try {
      let innerText = "activate " + cryptoMod.ticker;
      if (cryptoMod.returnIsActivated()) {
        let balance = await cryptoMod.formatBalance();
        innerText = balance + " " + cryptoMod.ticker;
      }
      document.querySelector(`#crypto-option-${cryptoMod.name}`).innerHTML = this.app.browser.sanitize(innerText);
    } catch (err) {
      console.log(err);
    }
  }



}

module.exports = SaitoHeader;

