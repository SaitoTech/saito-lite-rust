const GameSelectorTemplate = require('./game-selector.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

/*
  Creates an overlay of the list of available games, users can click to launch the game creation interface for that game
*/

class GameSelector {

  constructor(app, mod, obj = {}) {
    this.app = app;
    this.mod = mod;
    this.name = "GameSelector";
    this.overlay = new SaitoOverlay(app);
    this.obj = obj;
    this_self = this;

    this.app.connection.on("arcade-launch-game-selector", (obj = {}) => {


      this_self.mod.styles = ['/arcade/css/arcade-game-selector-overlay.css',
        '/arcade/css/arcade-overlays.css'];
      this_self.mod.attachStyleSheets();

      this.obj = obj;
      this.render();
    });

  }

  render() {
    this.overlay.show(GameSelectorTemplate(this.app, this.mod, "Select Game to Play"));
    this.attachEvents();
  }

  attachEvents() {

    Array.from(document.querySelectorAll('.game-selector-container')).forEach(game => {
      game.onclick = (e) => {
        let modname = e.currentTarget.getAttribute("data-id");
        this.obj.game = modname;
        this.overlay.remove();


        let game_mod = this.app.modules.returnModule(modname);
        this.app.connection.emit("league-launch-wizard", (game_mod));

        //this.app.connection.emit("arcade-launch-game-wizard", (this.obj));
      };
    });
  }
}

module.exports = GameSelector;

