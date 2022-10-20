const RedSquareGamesTemplate = require("./games.template");
const GameCreator = require("./../../appspace/arcade/game-creator");
const SaitoModuleOverlay = require("../../../../../lib/saito/new-ui/saito-module-overlay/saito-module-overlay");
const SaitoScheduler = require("./../../../../../lib/saito/new-ui/saito-scheduler/saito-scheduler");
const GameLoader = require("../../../../../lib/saito/new-ui/game-loader/game-loader");

class RedSquareGames {

  constructor(app, mod, selector = "") {
    this.app = app;
    this.mod = mod;
    this.selector = selector;

    app.connection.on("game-invite-list-update", () => {
        //console.log("Arcade update received");
        this.render(app, mod);
    });

  }

  render(app, mod, selector="") {
    if (selector != "") {
      this.selector = selector;
    }

    let div = document.querySelector(this.selector);
    if (div){
      div.innerHTML = RedSquareGamesTemplate(app, mod);
      this.attachEvents(app, mod);
    }

  }


  attachEvents(app, mod) {

    Array.from(document.querySelectorAll('.saito-arcade-invite-list .saito-module-x')).forEach(game => {
      game.onclick = (e) => {
      	let x = e.currentTarget.getAttribute("data-id");
        let click_me = "saito-module-action-"+x;
        document.getElementById(click_me).click();
      }
    });

    Array.from(document.querySelectorAll('.saito-module-action.join, .saito-module-action.details')).forEach(game => {
      game.onclick = (e) => {

        //Prevent double rendering from overlapping selectors
        e.stopImmediatePropagation();

        let game_id = e.currentTarget.getAttribute("data-id");
        let game_cmd = e.currentTarget.getAttribute("data-cmd");

        let saito_mod_detials_overlay = new SaitoModuleOverlay(app, mod);

        saito_mod_detials_overlay.render(app, app.modules.returnModule("Arcade"), game_id, game_cmd);
              
      }
    }); 
  
    //Copied from lib/appspace/games.js
    if (document.getElementById("redsquare-schedule-game")){
      document.getElementById("redsquare-schedule-game").onclick = (e) => {
        let sc = new SaitoScheduler(app, mod);
        // callback is on submit
        sc.render(app, mod, function(options) {
          let gc = new GameCreator(app, mod);
          gc.render(app, mod);
        });
      }

    }
    if (document.getElementById("redsquare-create-game")){
      document.getElementById("redsquare-create-game").onclick = (e) => {
        let gc = new GameCreator(app, mod);
        gc.render(app, mod);
      }
    }


  }
}

module.exports = RedSquareGames;

