const RedSquareMainTemplate = require("./redsquare-main.template");
const RedSquareMenu = require("./../components/menu");


class RedSquareMain {

  constructor(app) {
    this.app = app;
    this.name = "RedSquareMain";
  }

  render(app, mod) {

    if (document.getElementById("saito-container")) {
      app.browser.addElementToDom(RedSquareMainTemplate(app, mod), "saito-container");
    }

  }

}

module.exports = RedSquareMain;

