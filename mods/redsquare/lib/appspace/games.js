const saito = require('./../../../../lib/saito/saito');
const RedSquareAppspaceGamesTemplate = require("./games.template");
const SaitoOverlay = require("../../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const GameCreator = require("./arcade/game-creator");
const GameScheduler = require("./arcade/game-scheduler");
const SaitoScheduler = require("../../../../lib/saito/new-ui/saito-scheduler/saito-scheduler");

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

    document.getElementById("redsquare-schedule-game").onclick = (e) => {

      let sc = new SaitoScheduler(app, mod);
      // callback is on submit
      sc.render(app, mod, function(options) {
        let gc = new GameCreator(app, mod);
        gc.render(app, mod);
      });
    }

    document.getElementById("redsquare-create-game").onclick = (e) => {
      let gc = new GameCreator(app, mod);
      gc.render(app, mod);
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

