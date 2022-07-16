const RedSquareAppspaceGamesTemplate = require("./games.template");

class RedSquareAppspaceGames {

  constructor(app) {
    this.app = app;
    this.name = "RedSquareAppspaceGames";
  }

  render(app, mod) {
    document.querySelector(".appspace").innerHTML = "";
    app.browser.addElementToClass(RedSquareAppspaceGamesTemplate(app, mod), "appspace");
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {
    // this.overlay.show(this.app, this, `<div class="shim-notice">${dealerHTML}${playerHTML}</div>`, ()=>{
    //   this.restartQueue();
    // });
  }

}

module.exports = RedSquareAppspaceGames;

