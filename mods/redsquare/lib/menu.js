const RedSquareMenuTemplate = require("./menu.template");

class RedSquareMenu {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareMenu";
  }

  render() {

    //
    // replace element or insert into page
    //
console.log("rendering menu... 1");
    if (document.querySelector(".redsquare-menu")) {
console.log("rendering menu... 1 2");
      this.app.browser.replaceElementBySelector(RedSquareMenuTemplate(this.app, this.mod), ".redsquare-menu");
    } else {
console.log("rendering menu... 2 3");
      if (this.container) {
console.log("rendering menu... 2 4");
        this.app.browser.addElementToSelector(RedSquareMenuTemplate(this.app, this.mod), this.container);
console.log("rendering menu... 2 4 -2");
      } else {
console.log("rendering menu... 2 4");
        this.app.browser.addElementToDom(RedSquareMenuTemplate(this.app, this.mod));
      }
    }

    this.attachEvents();
  }  

  attachEvents() {

  }

}

module.exports = RedSquareMenu;

