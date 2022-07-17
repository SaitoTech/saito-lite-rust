const RedSquareAppspaceGamesTemplate = require("./games.template");
const SaitoOverlay = require("../../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const GameCreator = require("./arcade/game-creator");
const GameScheduler = require("./arcade/game-scheduler");

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

    this.overlay = new SaitoOverlay(app, mod);

    //
    // if GameCreator was a template file, we could write it directly into the overlay
    // since it is a class, we put an element in the overlay and render into that.
    //
    document.getElementById("redsquare-schedule-game").onclick = (e) => {
      this.overlay.show(app, mod, '<div class="redsquare-game-creator"></div>');
      let gs = new GameScheduler(app, mod, ".redsquare-game-creator");
      gs.render(app, mod, ".redsquare-game-creator");
    }

    document.getElementById("redsquare-create-game").onclick = (e) => {
      this.overlay.show(app, mod, '<div class="redsquare-game-creator"></div>');
      let gc = new GameCreator(app, mod, ".redsquare-game-creator");
      gc.render(app, mod, ".redsquare-game-creator");
    }

  }

}

module.exports = RedSquareAppspaceGames;

