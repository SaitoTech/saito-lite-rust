const RedSquareMenuTemplate = require("./menu.template");

class RedSquareMenu {

  constructor(app) {
  }

  render(app, mod, class_container = "") {

    if (!document.querySelector(".redsquare-menu")) {
      if (class_container !== "") {
        let container = document.querySelector(class_container);
        if (container) {
          app.browser.addElementToElement(RedSquareMenuTemplate(app, mod), container);
        } else {
          app.browser.addElementToDom(RedSquareMenuTemplate(app, mod));
        }
      } else {
        app.browser.addElementToDom(RedSquareMenuTemplate(app, mod));
      }
    }

  }

}

module.exports = RedSquareMenu;


