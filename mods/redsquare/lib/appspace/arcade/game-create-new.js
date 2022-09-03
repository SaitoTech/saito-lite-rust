const GameCreateNewTemplate = require('./game-create-new.template.js');
const SaitoOverlay = require('./../../../../../lib/saito/new-ui/saito-overlay/saito-overlay');

class GameCreateNew {

  constructor(app, mod, game_mod) {
    this.app = app;
    this.mod = mod;
    this.game_mod = game_mod;
    this.overlay = new SaitoOverlay(app, mod);
  }

  render(app, mod) {
    this.overlay.show(app, mod, GameCreateNewTemplate(app, mod, this.game_mod));
    this.attachEvents(app, mod);
  }

  
  attachEvents(app, mod) {
    if (document.querySelector(".dynamic_button")){
      document.querySelector(".dynamic_button").addEventListener("click", (e) => {
      e.currentTarget.classList.toggle("showAll");
      });  
    }
  }
}

module.exports = GameCreateNew;
