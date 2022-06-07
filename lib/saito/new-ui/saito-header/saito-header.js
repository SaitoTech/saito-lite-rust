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

    try {
      //
      // UI component (modules) will show up sometimes if they're in the mod list
      // but in those cases mod will be undefined, so we can work-around the problem
      // by only rendering if there is a module here...
      //
      if (mod == null) {
        return;
      }

      if (!document.getElementById("saito-header")) {
        app.browser.addElementToDom(SaitoHeaderTemplate(app));

      }

      this.attachEvents(app, mod);

    } catch (err) {
      console.log(err);
    }
  }

  attachEvents(app, mod) {
    if (!document) {
      return;
    }
    if (document.querySelector("#saito-menuToggle")) {
      document.querySelector("#saito-menuToggle").addEventListener("click", this.toggleMenu);
    }

    /// Tabs 
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
          tabs.forEach(tab => {
            console.log('tab ', tab);
            tab.classList.remove('show');
          })


          console.log('tab to display ', tabToDisplay);
          tabToDisplay.classList.add('show');
          button.classList.add('active');
        })

      });
    }



  }






  toggleMenu(e) {
    console.log("toggling menu");
    document
      .querySelector("#saito-hamburger-contents")
      .classList.contains("show-menu")
      ? document
        .querySelector("#saito-hamburger-contents")
        .classList.remove("show-menu")
      : document
        .querySelector("#saito-hamburger-contents")
        .classList.add("show-menu");
  }



  receiveEvent(type, data) {
    if (type == "chat-render-request") {
      console.log("Header Component processing chat-render-request in " + this.name);
    }
  }

}

module.exports = SaitoHeader;
