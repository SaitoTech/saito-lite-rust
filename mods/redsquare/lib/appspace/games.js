const saito = require('./../../../../lib/saito/saito');
const RedSquareAppspaceGamesTemplate = require("./games.template");
const SaitoOverlay = require("../../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const GameCreator = require("./arcade/game-creator");
const GameScheduler = require("./arcade/game-scheduler");
const SchedulerOverlay = require("./arcade/schedule-overlay");

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
    
      this.overlay.show(app, mod, '<div class="redsquare-game-scheduler"></div>');
      let sc = new SchedulerOverlay(app, mod, ".redsquare-game-scheduler");
      sc.render(app, mod, ".redsquare-game-scheduler");

    }

    document.getElementById("redsquare-create-game").onclick = (e) => {
      this.overlay.show(app, mod, '<div class="redsquare-game-creator"></div>');
      let gc = new GameCreator(app, mod, ".redsquare-game-creator");
      gc.render(app, mod, ".redsquare-game-creator");
    }

    //
    // create game direct-links
    //
    Array.from(document.querySelectorAll('.create-game-link')).forEach(game => {

      game.onclick = (e) => {

        let modname = e.currentTarget.getAttribute("data-id");

        let tx = new saito.default.transaction();
        tx.msg.game = modname;

        //
        // DEPRECATED --
        //
        let arcade_mod = app.modules.returnModule("Arcade");
        ArcadeGameDetails.render(app, arcade_mod, tx);
        ArcadeGameDetails.attachEvents(app, arcade_mod, tx);

      };

    });


  }

}

module.exports = RedSquareAppspaceGames;

