const SaitoHeaderTemplate = require("./saito-header.template");
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

  constructor(app) {
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

    this.attachEvents(app);
  }

  attachEvents(app, mod) {
    if (!document) {
      return;
    }
    if (document.querySelector("#header-menu-toggle")) {
      document.querySelector("#header-menu-toggle").addEventListener("click", this.toggleMenu);
    }


    // initialize 
    if (document.querySelector('#general')) {
      const tabToDisplay = document.querySelector('#general');
      let container = document.querySelector('#saito-container');
      container.innerHTML = tabToDisplay.innerHTML;
    }




    if (document.querySelectorAll('#saito-tab-buttons a')) {
      const tabButtons = document.querySelectorAll('#saito-tab-buttons a');
      tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const target = button.dataset.target;
          const tabToDisplay = document.querySelector(target);


          const tabs = document.querySelectorAll('.saito-tab');
          tabButtons.forEach(button => {
            if (button.classList.contains('active')) {
              button.classList.remove('active');
            }
          })
          let container = document.querySelector('#saito-container');
          container.innerHTML = tabToDisplay.innerHTML;
          button.classList.add('active');
        })

      });
    }

    // hamburger menu
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



  }






  toggleMenu(e) {
    console.log("toggling menu");
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



  receiveEvent(type, data) {
    if (type == "chat-render-request") {
      console.log("Header Component processing chat-render-request in " + this.name);
    }
  }

}

module.exports = SaitoHeader;
