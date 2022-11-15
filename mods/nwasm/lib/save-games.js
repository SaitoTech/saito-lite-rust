const saito = require('./../../../lib/saito/saito');
const SaveGamesTemplate = require("./save-games.template");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const JSON = require('json-bigint');

class SaveGamesOverlay {

  constructor(app, mod = null, selector = "") {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(app);
  }

  render(app, mod, selector = "") {
    this.overlay.show(app, mod, SaveGamesTemplate(app, mod));

console.log("ACTIVE GAME SAVES: " + mod.active_game_saves.length);

    document.getElementById("nwasm-saved-games").innerHTML = "";


    for (let i = 0; i < mod.active_game_saves.length; i++) {
console.log("i1: " + i);
      let s = mod.active_game_saves[i];
console.log("i2: " + i);
      let stxmsg = s.returnMessage();
console.log("i3: " + i);
      let html = `
        <div id="save_game_${i}" data-id="${s.transaction.sig}" class="nwasm-saved-games-item">
          <div class="nwasm-saved-games-screenshot"><img src="${stxmsg.screenshot}" /></div>
        </div>
      `;
console.log("i4: " + i);
      if (!document.getElementById(`save_game_${i}`)) {
        app.browser.addElementToId(html, "nwasm-saved-games");
      }
console.log("i5: " + i);
    }
console.log("DONE");
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {

    let sgo = this;

    for (let i = 0; i < mod.active_game_saves.length; i++) {
      let s = mod.active_game_saves[i];
      let obj = document.getElementById(`save_game_${i}`);
      obj.onclick = (e) => {
	sgo.overlay.hide();	
	sgo.overlay.remove();	
	let sig = e.currentTarget.getAttribute("data-id");
console.log(sig);
        mod.loadSaveGame(sig);
	sgo.overlay.hide();
      };
    }

  }

}


module.exports = SaveGamesOverlay;


