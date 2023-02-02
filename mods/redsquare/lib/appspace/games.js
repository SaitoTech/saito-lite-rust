const AppspaceGamesTemplate = require("./games.template");

class AppspaceGames {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareAppspaceGames";
  }

  render() {

console.log("RENDERING GAMES!");

    //
    // replace element or insert into page
    //
    if (document.querySelector(".redsquare-games")) {
      this.app.browser.replaceElementBySelector(AppspaceGamesTemplate(), ".redsquare-games");
    } else {
      if (this.container) {
        this.app.browser.addElementToSelector(AppspaceGamesTemplate(), this.container);
      } else {
        this.app.browser.addElementToDom(AppspaceGamesTemplate());
      }
    }

    this.attachEvents();
  }  

  attachEvents() {

  }

}

module.exports = AppspaceGames;



