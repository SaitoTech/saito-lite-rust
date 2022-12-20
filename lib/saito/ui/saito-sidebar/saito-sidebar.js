const SaitoSidebarTemplate = require("./saito-sidebar.template");
const UIModTemplate = require("./../../../templates/uimodtemplate");

//
// UIModTemplate
//
// The header derives from UIModTemplate -- this allows the component
// to be added to the list of modules that are actively running on Saito
// thus allowing them to receive transactions and update their UI just
// like any other modules.
//
// yes... you can send on-chain transactions to your sidebar if you feel
// a pressing need to communicate with it securely. Or ask it to listen
// to process whatever subset of transactions you need.
//
class SaitoSidebar extends UIModTemplate {

  constructor(app, mod = null, container = ".saito-container") {

    super(app);

    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "SaitoSidebar UIComponent";
    this.align = "left";

    //
    // now initialize, since UI components are created
    // after all other modules have initialized, we need
    // to run any missed functions here in the constructor
    // in this case, initialize, as that is what processes
    // receiveEvent, etc.
    //
    this.initialize(app);

  }


  render() {

    let qs = `.saito-sidebar.${this.align}`;

    if (document.querySelector(qs)) {
      this.app.browser.replaceElementBySelector(SaitoSidebarTemplate(this.app, this.mod), qs);
    } else {
      this.app.browser.addElementToSelectorOrDom(SaitoSidebarTemplate(this.app, this.mod), this.container);
    }

    super.render();

    this.attachEvents(app, mod)

  }

  attachEvents(app, mod){  
  }


}

module.exports = SaitoSidebar;

