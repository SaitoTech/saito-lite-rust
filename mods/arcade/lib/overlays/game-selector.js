const GameSelectorTemplate = require('./game-selector.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

/*
  Creates an overlay of the list of available games, users can click to launch the game creation interface for that game
*/

class GameSelector {

  constructor(app, mod, obj = {}) {
    this.app = app;
    this.name = "GameSelector";
    this.overlay = new SaitoOverlay(app);
    this.obj = obj;
alert("creating game selector!");

    this.app.connection.on("arcade-launch-game-selector", (obj={}) => {
alert("TESTING!");
      this.obj = obj;
      this.render();
    });

  }

  render() {
    this.overlay.show(GameSelectorTemplate(this.app, this.mod, "Select Game to Play"));
    this.attachEvents();
  }

  attachEvents() {

    Array.from(document.querySelectorAll('.redsquare-game-container')).forEach(game => {
      game.onclick = (e) => {
        let modname = e.currentTarget.getAttribute("data-id");
alert("emit event to trigger game wizard!");
        this.overlay.remove();
      };
    });
  }
}

module.exports = GameSelector;

