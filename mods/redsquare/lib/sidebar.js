const RedSquareSidebarTemplate = require("./sidebar.template");

class RedSquareSidebar {

  constructor(app, mod, container="") {
    this.name = "RedSquareSidebar";
    this.mod = mod;
    this.container = container;
  }

  render(app, mod, container="") {
    if (!document.querySelector(".saito-sidebar.right")) {
      if (container != "") {
        app.browser.addElementToClass(RedSquareSidebarTemplate(app, mod), container);
      } else {
        app.browser.addElementToClass(RedSquareSidebarTemplate(app, mod), this.container);
      }
    }

    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) {

  } 

}

module.exports = RedSquareSidebar;


