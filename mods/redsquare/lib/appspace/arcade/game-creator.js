const saito = require('./../../../../../lib/saito/saito');
const GameCreatorTemplate = require('./game-creator.template');
const SaitoOverlay = require('./../../../../../lib/saito/new-ui/saito-overlay/saito-overlay');
const GameCreateNew = require('./game-create-new');

/*
  Creates an overlay of the list of available games, users can click to launch the game creation interface for that game
*/

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

        this.overlay.remove();

        let game_mod = app.modules.returnModule(modname);

        let GameCreate = new GameCreateNew(app, mod, game_mod, tx);
        GameCreate.render(app, mod, tx);

      };
    });
  }
}

module.exports = GameCreator;

