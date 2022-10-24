const saito = require('./../../../../lib/saito/saito');
const GameSelectorTemplate = require('./game-selector.template');
const SaitoOverlay = require('./../../../../lib/saito/new-ui/saito-overlay/saito-overlay');
const GameWizard = require('./game-wizard');

/*
  Creates an overlay of the list of available games, users can click to launch the game creation interface for that game
*/

class GameSelector {

  constructor(app, mod) {
    this.app = app;
    this.name = "GameSelector";
    this.overlay = new SaitoOverlay(app);
  }

  render(app, mod) {
    this.overlay.show(app, mod, GameSelectorTemplate(app, mod, "Select Game to Play"));
    this.attachEvents(app, mod);
  }

  
  attachEvents(app, mod) {

    Array.from(document.querySelectorAll('.redsquare-game-container')).forEach(game => {

      game.onclick = (e) => {

        let modname = e.currentTarget.getAttribute("data-id");

        let tx = new saito.default.transaction();
        tx.msg.game = modname;

        this.overlay.remove();

        let game_mod = app.modules.returnModule(modname);

        let w = new GameWizard(app, mod, game_mod, tx);
        w.render(app, mod, tx);

      };
    });
  }
}

module.exports = GameSelector;

