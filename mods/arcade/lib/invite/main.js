const saito = require('./../../../../lib/saito/saito');
const GameCreatorTemplate = require('./main.template');
const ArcadeGameDetails = require('./../arcade-game/arcade-game-details');
const SaitoOverlay = require('./../../../../lib/saito/new-ui/saito-overlay/saito-overlay');

class GameCreator {

  constructor(app, mod) {
    this.app = app;
    this.name = "GameCreator";
    this.overlay = new SaitoOverlay(app);
  }

  render(app, mod) {
    this.overlay.show(app, mod, GameCreatorTemplate(app, mod, "Select Game to Play"));
    this.attachEvents(app, mod);
  }

  
  attachEvents(app, mod) {

    Array.from(document.querySelectorAll('.redsquare-game-container')).forEach(game => {

      game.onclick = (e) => {

        let modname = e.currentTarget.getAttribute("data-id");

        let tx = new saito.default.transaction();
        tx.msg.game = modname;

	//
	// DEPRECATED -- 
	//
        let arcade_mod = app.modules.returnModule("Arcade");
	// invite info will be here
	arcade_mod.invite = mod.invite;
        ArcadeGameDetails.render(app, arcade_mod, tx);
        ArcadeGameDetails.attachEvents(app, arcade_mod, tx);

	this.overlay.hide();

      };

    });

  }

}


module.exports = GameCreator;

