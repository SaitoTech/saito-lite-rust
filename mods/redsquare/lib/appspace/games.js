const saito = require('./../../../../lib/saito/saito');
const RedSquareAppspaceGamesTemplate = require("./games.template");
const SaitoOverlay = require("../../../../lib/saito/new-ui/saito-overlay/saito-overlay");

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

    this.overlay = new SaitoOverlay(app);

    document.getElementById("redsquare-create-game").onclick = (e) => {
      try {
        let arcade_mod = app.modules.returnModule("Arcade");
        arcade_mod.createGameSelector();
      } catch (err) { alert("Arcade not installed..."); }
    }

    //
    // create game direct-links
    //
    Array.from(document.querySelectorAll('.create-game-link')).forEach(game => {
      game.onclick = (e) => {

        let modname = e.currentTarget.getAttribute("data-id");
        let arcade_mod = app.modules.returnModule("Arcade");
	arcade_mod.createGameWizard(modname);

      };
    });

/****
    Array.from(document.querySelectorAll(".load-game-instructions")).forEach(game => {
      game.onclick = (e) => {
        e.stopPropagation();
        let gameName = e.currentTarget.getAttribute("data-id");
        let gamemod = app.modules.returnModule(gameName);
        if (gamemod){
          gamemod.overlay.show(app, gamemod, gamemod.returnGameRulesHTML());
        }else{
          console.log("Module not found");
        }
      };
    });
****/


  }

}

module.exports = RedSquareAppspaceGames;

