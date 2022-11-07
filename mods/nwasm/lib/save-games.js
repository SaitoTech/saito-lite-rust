const saito = require('./../../../lib/saito/saito');
const SaveGamesTemplate = require("./save-games.template");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");


class SaveGamesOverlay {

  constructor(app, mod = null, selector = "") {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(app);
  }

  render(app, mod, selector = "") {
    this.overlay.show(app, mod, SaveGamesTemplate(app, mod));

    for (let i = 0; i < mod.active_game_saves.length; i++) {
      let s = mod.active_game_saves[i];
      let html = `
        <div id="${s.transaction.sig}" class="nwasm-saved-games-item">
          <div class="nwasm-saved-games-screenshot">${(i+1)}. SAVED GAME</div>
        </div>
      `;
      app.browser.addElementToId(html, "nwasm-saved-games");
    }
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {

    let sgo = this;

    for (let i = 0; i < mod.active_game_saves.length; i++) {
      let s = mod.active_game_saves[i];
      let obj = document.getElementById(s.transaction.sig);
      obj.onclick = (e) => {
	let sig = e.currentTarget.id;
        mod.loadSaveGame(sig);
	sgo.overlay.hide();
      };
    }

  }

}


module.exports = SaveGamesOverlay;


