const RedSquareSidebarTemplate = require("./sidebar.template");

class RedSquareSidebar {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareSidebar";
  }

  render() {

    if (document.querySelector(".redsquare-sidebar")) {
      this.app.browser.replaceElementBySelector(RedSquareSidebarTemplate(), ".redsquare-sidebar");
    } else {
      this.app.browser.addElementToSelectorOrDom(RedSquareSidebarTemplate(), this.container);
    }

    //
    // appspace modules
    //
    this.app.modules.renderInto(".redsquare-sidebar");

    this.attachEvents();
  }  


  attachEvents() {

  }

}

module.exports = RedSquareSidebar;

