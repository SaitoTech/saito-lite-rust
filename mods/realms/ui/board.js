const BoardTemplate = require("./board.template");

class Board {

  constructor(app, mod, container="") { 
    this.app = app;
    this.mod = mod;
  }

  render() {
    let myqs = this.container + ` .board`;
    if (document.querySelector(myqs)) {
      this.app.browser.replaceElementBySelector(BoardTemplate(), myqs);
    } else {
      if (this.container == "") {
        this.app.browser.addElementToDom(BoardTemplate());
      } else {
        this.app.browser.addElementToSelector(BoardTemplate(), this.container);
      }
    }
  }

}

module.exports = Board;

