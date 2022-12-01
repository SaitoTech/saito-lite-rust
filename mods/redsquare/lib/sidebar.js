const RedSquareSidebarTemplate = require("./sidebar.template");

class RedSquareSidebar {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareSidebar";
  }

  render() {

    if (document.querySelector(".redsquare-menu")) {
      this.app.browser.replaceElementBySelector(RedSquareSidebarTemplate(this.app, this.mod), ".redsquare-sidebar");
    } else {
      if (this.container) {
        this.app.browser.addElementToSelector(RedSquareSidebarTemplate(this.app, this.mod), this.container);
      } else {
        this.app.browser.addElementToDom(RedSquareSidebarTemplate(this.app, this.mod));
      }
    }

    //
    // appspace modules
    //
    this.app.modules.returnModulesRespondingTo("redsquare-sidebar").forEach((mod) => {
      mod.container = ".redsquare-sidebar";
      mod.render();
    });

    this.attachEvents();
  }  



  attachEvents() {

  }

}

module.exports = RedSquareSidebar;

