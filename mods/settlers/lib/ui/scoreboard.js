const SettlersScoreboardTemplate = require("./scoreboard.template");

class SettlersScoreboard {

  constructor(app, mod, unit = "", container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
  }

  render() {

    let myqs = this.container + " .scoreboard";

    if (document.querySelector(myqs)) {
      this.app.browser.replaceElementBySelector(SettlersScoreboardTemplate(this), myqs);
    } else {
      this.app.browser.addElementToSelector(SettlersScoreboardTemplate(this), this.container);
    }

    this.attachEvents();
  }

  attachEvents() {
    document.querySelector(".scoreboard").onclick = (e) => {
      if (document.querySelector(".scoreboard").classList.contains("scoreboard-lock")) {
        document.querySelector(".scoreboard").classList.remove("scoreboard-lock");
      } else {
        document.querySelector(".scoreboard").classList.add("scoreboard-lock");
      }
    };
  }


  lock() {
    try {
      document.querySelector(".scoreboard").classList.add("scoreboard-lock");
      setTimeout(function () {
        document.querySelector(".scoreboard").classList.remove("scoreboard-lock");
      }, 3000);
    } catch (err) {
      console.log(err);
    }
  }

}

module.exports = SettlersScoreboard;

