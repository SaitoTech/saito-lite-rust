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

  constructor(app) {
    super(app);

    this.app = app;
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


  render(app, mod, class_container=".saito-container") {

    if (class_container === "") { class_container = ".saito-container"; }

    //
    // the sidebar always renders into saito-container
    //
    if (!document.querySelector(`.saito-sidebar.${this.align}`)) {
      if (class_container === "") {
        app.browser.addElementToDom(SaitoSidebarTemplate(app, mod, this.align));
      } else {
        let my_container = document.querySelector(class_container);
        if (!my_container) {
          app.browser.addElementToDom(SaitoSidebarTemplate(app, mod, this.align));
        } else {
          if (!document.querySelector(`.saito-sidebar.${this.align}`)) {
            app.browser.addElementToElement(SaitoSidebarTemplate(app, mod, this.align), my_container);
          } else {
            app.browser.addElementToElement(SaitoSidebarTemplate(app, mod, this.align), my_container);
          }
        }
      }
    }

    //
    // it renders its components into .saito-sidebar.${this.align}
    //
    super.render(app, mod, `.saito-sidebar.${this.align}`);

  }


}

module.exports = SaitoSidebar;


