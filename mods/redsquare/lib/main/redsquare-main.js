const RedSquareMainTemplate = require("./redsquare-main.template");


class RedSquareMain {

  constructor(app) {
  }

  render(app, mod) {
    if (!document.querySelector(".saito-page-content")) {
      app.browser.addElementToDom(RedSquareMainTemplate(app, mod));
    }
  }

}

module.exports = RedSquareMain;

