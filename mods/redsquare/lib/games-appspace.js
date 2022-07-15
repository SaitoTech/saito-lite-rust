const RedSquareGamesAppspaceTemplate = require("./games-appspace.template");

class RedSquareGamesAppspace {

  constructor(app, mod, container="") {
    this.name = "RedSquareGamesAppspace";
    this.mod = mod;
    this.container = container;
  }

  render(app, mod, container="") {

    document.querySelector(".appspace").innerHTML = "";
    app.browser.addElementToSelector(RedSquareGamesAppspaceTemplate(app, mod), ".appspace");
    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) {

  } 

}

module.exports = RedSquareGamesAppspace;

