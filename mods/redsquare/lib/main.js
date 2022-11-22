const RedSquareMainTemplate = require("./main.template");

class RedSquareMain {

  constructor(app, selector = "") {
    this.app = app;
    this.name = "RedSquareMain";
    this.selector = selector;
  }

  render(app, mod) {

    if (document.querySelector(".saito-container")) {
      
      app.browser.replaceElementBySelector(RedSquareMainTemplate(app, mod), ".saito-container");
    } else {

      if (this.selector) {
        app.browser.addElementToSelector(RedSquareMainTemplate(app, mod), this.selector);
      } else {
        app.browser.addElementToDom(RedSquareMainTemplate(app, mod));
      }
    }

    this.attachEvents(app, mod);
  }  

  attachEvents(app, mod) {

  }
}

module.exports = RedSquareMain;

