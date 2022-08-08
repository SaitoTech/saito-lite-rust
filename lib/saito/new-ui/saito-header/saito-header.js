const SaitoHeaderTemplate = require("./saito-header.template");
const SaitoOverlay = require("./../saito-overlay/saito-overlay");
const UIModTemplate = require("./../../../templates/uimodtemplate");
const ModalRegisterUsername = require("../../ui/modal-register-username/modal-register-username.js");
const ModalSelectCrypto = require("../../ui/modal-select-crypto/modal-select-crypto.js");

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
    // this.events = ['chat-render-request'];
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

    if (mod == null) {
      return;
    }

    if (!document.getElementById("saito-header")) {
      app.browser.addElementToDom(SaitoHeaderTemplate(app));
    }

    //
    // now attach events
    //
    if (!document) { return; }

    if (document.querySelector("#header-menu-toggle")) {
      document.querySelector("#header-menu-toggle").addEventListener("click", this.toggleMenu);
    }

    //
    // default buttons
    //
    try {
      document.querySelector(".saito-header-nuke-wallet").onclick = (e) => {
        app.wallet.resetWallet();
      }
      document.querySelector(".saito-header-settings").onclick = (e) => {
        window.location = "/redsquare/#settings";
        location.reload();
      }
      document.querySelector(".saito-header-show-qrcode").onclick = (e) => {
        this.overlay = new SaitoOverlay(app, mod);
        this.overlay.show(app, mod, '<div id="qrcode" style="width: 80vw;height:auto;"></div>');
        app.browser.generateQRCode(app.wallet.returnPublicKey());
      }
      document.querySelector(".saito-header-scan-qrcode").onclick = (e) => {
        let scanner_self = app.modules.returnModule("Scanner");
        scanner_self.startScanner();
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
      // hamburger menu
      //
      if (document.querySelectorAll('.saito-sidebar.left .hamburger')) {
        const mobileHamburger = document.querySelectorAll('.saito-sidebar.left .hamburger');
        const icon = document.querySelector('.saito-sidebar.left .hamburger #icon');
        mobileHamburger.forEach(item => {
          item.addEventListener('click', (e) => {
            console.log(item.parentElement);
            const sidebar = item.parentElement;
            if (sidebar.classList.contains('mobile')) {
              sidebar.classList.remove('mobile');
              icon.className = "fas fa-bars";
            } else {
              icon.className = "fas fa-times";
              sidebar.classList.add('mobile');
            }
          })
        })
      }
    } catch (err) {
    }

  }


  toggleMenu(e) {
    document
      .querySelector(".header-hamburger-contents")
      .classList.contains("show-menu")
      ? document
        .querySelector(".header-hamburger-contents")
        .classList.remove("show-menu")
      : document
        .querySelector(".header-hamburger-contents")
        .classList.add("show-menu");
  }

}

module.exports = SaitoHeader;

