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
    this.events = ['chat-render-request'];
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

  }

  receiveEvent(type, data) {
    if (type == "chat-render-request") {
      console.log("Header Component processing chat-render-request in " + this.name);
    }
  }

}

module.exports = SaitoHeader;
