const SaitoHeaderTemplate = require("./saito-header.template");
const SaitoOverlay = require("./../saito-overlay/saito-overlay");
const UIModTemplate = require("./../../../templates/uimodtemplate");
const ModalRegisterUsername = require("../../new-ui/modals/modal-register-username/modal-register-username.js");
const ModalSelectCrypto = require("../../new-ui/modals/modal-select-crypto/modal-select-crypto.js");

//NOTE: THIS MODULE VIOLATES THE RENDER/ATTACHEVENTS STANDARD

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
        let username = app.keys.returnIdentifierByPublicKey(app.wallet.returnPublicKey());
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

    let app = this.app;
    let mod = this.mod;

    if (mod == null || !document) {
      return;
    }

    if (!document.getElementById("saito-header")) {
      app.browser.addElementToDom(SaitoHeaderTemplate(app));
    }

    //
    // render cryptos
    //
    this.renderCrypto();

    this.attachEvents(app, mod);
  }

  attachEvents(app, mod){

    if (document.querySelector("#saito-header-menu-toggle")) {
      document.querySelector("#saito-header-menu-toggle").addEventListener("click", this.toggleMenu);
    }

    //
    // default buttons
    //
    try {

      let username = app.keys.returnIdentifierByPublicKey(app.wallet.returnPublicKey(), true);
      if (username == "" || username == app.wallet.returnPublicKey()) {
        document.querySelector(".saito-header-register").onclick = (e) => {
         mod.modal_register_username = new ModalRegisterUsername(app); //No callback
         mod.modal_register_username.render(app, mod);
         mod.modal_register_username.attachEvents(app, mod);
         return;
        };
      } else {
        document.querySelector(".saito-header-register span").innerHTML = username;
      }

      document.querySelector(".saito-header-settings").onclick = (e) => {
        window.location = "/redsquare/#settings";
        location.reload();
      }
      document.querySelector(".saito-header-show-qrcode").onclick = (e) => {
        this.overlay = new SaitoOverlay(app);
        this.overlay.show(app, mod, '<div id="qrcode" style="width: 80vw;height:auto;"></div>');
        app.browser.generateQRCode(app.wallet.returnPublicKey());
      }
      document.querySelector(".saito-header-scan-qrcode").onclick = (e) => {
        let scanner_self = app.modules.returnModule("Scanner");
        scanner_self.startScanner();
      }
      document.querySelector(".saito-header-nuke-wallet").onclick = async (e) => {
        let c = await sconfirm("Are you sure you want to reset your wallet?");
        if (c){
          app.wallet.resetWallet();
          location.reload();
        }
      }
      document.querySelector(".saito-header-arcade").onclick = (e) => {
        window.location = "/arcade";
      }
      document.querySelector(".saito-header-redsquare").onclick = (e) => {
        window.location = "/redsquare";
      }
      document.querySelector(".saito-header-website").onclick = (e) => {
        window.open("https://saito.tech");
      }
      document.querySelector(".saito-header-wiki").onclick = (e) => {
        window.open("https://wiki.saito.io");
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
      let modal_select_crypto = new ModalSelectCrypto(this.app, preferred_crypto);
      let activation_check = preferred_crypto.isActivated();

      if (activation_check == false) {
        preferred_crypto.activate();
        if (preferred_crypto.renderModalSelectCrypto(this.app, preferred_crypto)) {
          modal_select_crypto.render(this.app, preferred_crypto);
          modal_select_crypto.attachEvents(this.app, preferred_crypto);
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

