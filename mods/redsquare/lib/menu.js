const RedSquareMenuTemplate = require("./menu.template");

class RedSquareMenu {

  constructor(app) {
    this.name = "RedSquareMenu";
  }

  render(app, mod, class_container="") {

    if (!document.querySelector(".redsquare-component-menu")) {
      app.browser.addElementToClass(RedSquareMenuTemplate(app, mod), class_container);
    }

  }

}

module.exports = RedSquareMenu;


