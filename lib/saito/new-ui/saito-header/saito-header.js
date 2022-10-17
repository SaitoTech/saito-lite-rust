const SaitoHeaderTemplate = require("./saito-header.template");
const SaitoOverlay = require("./../saito-overlay/saito-overlay");
const UIModTemplate = require("./../../../templates/uimodtemplate");
const ModalRegisterUsername = require("../../new-ui/modals/modal-register-username/modal-register-username.js");
const ModalSelectCrypto = require("../../new-ui/modals/modal-select-crypto/modal-select-crypto.js");
let {gsap} = require('gsap');
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
  }

  render(app, mod) {

    if (mod == null || !document) {
      return;
    }

    if (!document.getElementById("saito-header")) {
      app.browser.addElementToDom(SaitoHeaderTemplate(app));
    }

    if (document.querySelector("#saito-header-menu-toggle")) {
      document.querySelector("#saito-header-menu-toggle").addEventListener("click", this.toggleMenu);
    }

    //
    // default buttons
    //
    try {

      let username = app.keys.returnIdentifierByPublicKey(app.wallet.returnPublicKey(), true);
      if (username == "" || username == app.wallet.returnPublicKey()) {
        document.querySelector(".saito-header-register").addEventListener("click", (e) => {
          mod.modal_register_username = new ModalRegisterUsername(app); //No callback
          mod.modal_register_username.render(app, mod);
          mod.modal_register_username.attachEvents(app, mod);
          return;
        });
      } else {
        document.querySelector(".saito-header-register").style.display = 'none';
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
      document.querySelector(".saito-header-nuke-wallet").onclick = (e) => {
        app.wallet.resetWallet();
        location.reload();
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

      //
      // render cryptos
      //
      this.renderCrypto();

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
              alert("Use the Saito AppStore to install other cryptocurrencies!");
            }
            return;
          }
          app.wallet.setPreferredCrypto(element.value, 1);
        };
      });

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
      const html = `<option class="saito-select-crypto-option" id="crypto-option-${preferred_crypto.name}" value="${preferred_crypto.ticker}">... ${preferred_crypto.ticker}</option>`;
      this.app.browser.addElementToElement(html, document.querySelector(".saito-select-crypto"));
      this.loadCryptoBalance(preferred_crypto);

      //
      // add other options
      //
      for (let i = 0; i < available_cryptos.length; i++) {
        let crypto_mod = available_cryptos[i];
        if (crypto_mod.name != preferred_crypto.name) {
          const html = `<option class="saito-select-crypto-option" id="crypto-option-${crypto_mod.name}" value="${crypto_mod.ticker}">... ${crypto_mod.ticker}</option>`;
          this.app.browser.addElementToElement(html, document.querySelector(".saito-select-crypto"));
          this.loadCryptoBalance(available_cryptos[i]);
        }
      }

      //
      // add final option (add new crypto)
      // commenting out /*install new crypto*/ for now
      // const add_other_cryptos_html = `<option id="crypto-option-add-new" value="add-new">install new crypto...</option>`;
      // this.app.browser.addElementToElement(
      //   add_other_cryptos_html,
      //   document.querySelector("#header-token-select")
      // );

      //
      // trigger select modal
      //
      let modal_select_crypto = new ModalSelectCrypto(this.app, preferred_crypto);
      if (!preferred_crypto.isActivated()) {
        preferred_crypto.activate();
        if (preferred_crypto.renderModalSelectCrypto(this.app, preferred_crypto)) {
          modal_select_crypto.render(this.app, preferred_crypto);
          modal_select_crypto.attachEvents(this.app, preferred_crypto);
        }
      }


    } catch (err) { console.log("Error rendering crypto header: " + err); }
  }


  toggleMenu(e) {
  //   .show-menu {
  //     opacity: 1;
  //     width: 40rem;
  //     -webkit-transform: translateX(0);
  //     transform: translateX(0);
  //     pointer-events: auto;
  // }
   
    if (this.hambuger_timeline) {
        this.hambuger_timeline.reverse();
        this.hambuger_timeline = null;
    } else {
      this.hambuger_timeline = gsap.timeline();
      this.hambuger_timeline.to('.saito-header-hamburger-contents', {duration: .1, opacity: 1, width: '40rem', x: 0, pointerEvents: 'auto'});
      this.hambuger_timeline.fromTo(".saito-header-menu-section ul > li", { x: "-10rem", duration: .1, stagger: .05, opacity: 0 }, {x: 0, duration: .1, stagger:.05, opacity:1});
      this.hambuger_timeline.fromTo('.saito-header-menu-section ul > li i', {y: "1rem",duration: .05, opacity: 0  }, { duration: .05, opacity:1, y: 0, ease: "power4.out"} )
  
    }
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

  attachNameEvent(app, mod) {
    let el = document.getElementById("saito-header-username");
    el.addEventListener("click", (e) => {
      mod.modal_register_username = new ModalRegisterUsername(app); //No callback
      mod.modal_register_username.render(app, mod);
      mod.modal_register_username.attachEvents(app, mod);
      return;
    });
  }

}

module.exports = SaitoHeader;

