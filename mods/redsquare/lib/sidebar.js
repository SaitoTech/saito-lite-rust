const RedSquareSidebarTemplate = require("./sidebar.template");

class RedSquareSidebar {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareSidebar";
  }

  render() {

console.log("-----------------");
console.log("RENDERING SIDEBAR");
console.log("-----------------");

    if (document.querySelector(".redsquare-sidebar")) {
console.log("-----------------1");
      this.app.browser.replaceElementBySelector(RedSquareSidebarTemplate(), ".redsquare-sidebar");
    } else {
      if (this.container) {
console.log("-----------------2");
console.log(this.container);
console.log(RedSquareSidebarTemplate());

        this.app.browser.addElementToSelector(RedSquareSidebarTemplate(), this.container);
      } else {
console.log("-----------------3");
        this.app.browser.addElementToDom(RedSquareSidebarTemplate());
      }
    }

console.log("and done");

    //
    // appspace modules
    //
    this.app.modules.returnModulesRespondingTo("rankings").forEach((mod) => {
console.log("MODULE FOR SIDEBAR: " + mod.returnName());
      let obj = mod.respondTo("rankings");
      obj.container = ".redsquare-sidebar";
      obj.render();
console.log("we have rendered league");
    });

    this.attachEvents();
  }  



  attachEvents() {

  }

}

module.exports = RedSquareSidebar;

