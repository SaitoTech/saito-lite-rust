const saito = require('./../../../../../lib/saito/saito');
const GameCreatorTemplate = require('./game-creator.template');
const ArcadeGameDetails = require('./../../../../arcade/lib/arcade-game/arcade-game-details');
const SaitoOverlay = require('./../../../../../lib/saito/new-ui/saito-overlay/saito-overlay');
const GameCreateNew = require('./game-create-new');

class GameCreator {

  constructor(app, mod) {
    this.app = app;
    this.name = "GameCreator";
    this.overlay = new SaitoOverlay(app, mod);
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

        this.overlay.hide();

        let game_mod = app.modules.returnModule(modname);
        console.log('module game i want to play: ');
        console.log(game_mod);        

        let GameCreate = new GameCreateNew(app, mod, game_mod);
        GameCreate.render(app, mod);


        // let arcade_mod = app.modules.returnModule("Arcade");
        // arcade_mod.invite = mod.invite;
        // ArcadeGameDetails.render(app, arcade_mod, tx);
        // ArcadeGameDetails.attachEvents(app, arcade_mod, tx);
      };
    });
  }
}

module.exports = GameCreator;

