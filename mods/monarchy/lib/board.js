const BoardTemplate = require('./board.template');

class ShogunBoard {

    constructor(app, mod, container = "") {
        this.app = app;
        this.mod = mod;
	this.container = container;
    }
    
    render() {

      if (document.querySelector(".shogun-board")) {
        this.app.browser.replaceElementBySelector(BoardTemplate(), ".shogun-board");
      } else {
        this.app.browser.addElementToSelector(BoardTemplate(), this.container);
      }

      this.attachEvents();

    }

    attachEvents() {

alert("attaching events!");

      document.querySelector(".shogun-board .coins").onclick = (e) => {
alert("a");
	this.mod.coins_overlay.render();
      };

      document.querySelector(".shogun-board .estates").onclick = (e) => {
alert("b");
	this.mod.estates_overlay.render();
      };

      document.querySelector(".shogun-board .cardpile").onclick = (e) => {
alert("c");
	this.mod.cardpile_overlay.render();
      };

    }

}

module.exports = ShogunBoard;

