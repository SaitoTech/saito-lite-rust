const saito = require('./../../../../lib/saito/saito');
const GameCreatorTemplate = require('./main.template');
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
        let arcade_mod = app.modules.returnModule("Arcade");
	arcade_mod.createGameWizard(modname);        
	this.overlay.hide();
      };
    });

  }

}


module.exports = GameCreator;

