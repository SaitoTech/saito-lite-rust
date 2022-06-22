const RedSquareMenuTemplate = require("./menu.template");

class RedSquareMenu {

  constructor(app) {
  }

  render(app, mod) {

    if (!document.querySelector(".redsquare-component-menu")) {
      app.browser.addElementToDom(RedSquareMenuTemplate(app, mod));
    }

  }

}

module.exports = RedSquareMenu;


