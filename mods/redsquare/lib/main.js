const RedSquareMainTemplate = require("./main.template");

class RedSquareMain {

  constructor(app, selector = "") {
    this.app = app;
    this.name = "RedSquareMain";
    this.selector = selector;
  }

  render(app, mod) {
     
    app.browser.replaceElementBySelector(RedSquareMainTemplate(app, mod), this.selector);
  
    this.attachEvents(app, mod);
  }  

  attachEvents(app, mod) {

  }
}

module.exports = RedSquareMain;

