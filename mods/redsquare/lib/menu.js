const RedSquareMenuTemplate = require("./menu.template");

class RedSquareMenu {

  constructor(app) {
    this.name = "RedSquareMenu";
  }

  render(app, mod, container="") {

    if (!document.querySelector(".redsquare-menu")) {
      app.browser.addElementToClass(RedSquareMenuTemplate(app, mod), container);
    }

  }

}

module.exports = RedSquareMenu;


