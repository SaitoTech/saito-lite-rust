const RedSquareMainTemplate = require("./main.template");

class RedSquareMain {

  constructor(app, selector = "") {
    this.app = app;
    this.name = "RedSquareMain";
    this.selector = selector;
  }

  render(app, mod) {

    if (document.querySelector(this.selector) != "" && document.querySelector(this.selector) != null) {
      app.browser.addElementToDom(RedSquareMainTemplate(app, mod));
    } else {
      app.browser.addElementToDom(RedSquareMainTemplate(app, mod), this.selector);
    }
   
    this.attachEvents(app, mod);
  }  

  attachEvents(app, mod) {

  }
}

module.exports = RedSquareMain;

