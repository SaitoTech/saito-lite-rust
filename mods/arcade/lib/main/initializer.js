const saito = require('./../../../../lib/saito/saito');
const JSON = require('json-bigint');


class Initializer {
	
  constructor(app, mod, container="") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.initialization_timer = null;
    this.game_id = "";
  }

  render(game_id="") {

    this.game_id = game_id;

    this.mod.is_game_initializing = true;

    let html = `
      <div class="arcade-initializer">
        <div id="game-loader-container" class="game-loader-container"> 
          <div id="game-loader-title" class="game-loader-title">
            Your Game is Initializing
          </div>
          <div class="game-loader-spinner" id="game-loader-spinner"></div>
        </div>
      </div>
    `; 

    if (document.querySelector(".arcade-initializer")) {
      this.app.browser.replaceElementBySelector(html, ".arcade-initializer");
    } else {
      this.app.browser.addElementToSelector(html, this.container);
    }

    this.initialization_timer = setInterval(() => {

      let game_idx = -1;
      if (this.app.options.games != undefined) {
        for (let i = 0; i < this.app.options.games.length; i++) {
          if (this.app.options.games[i].id == this.game_id) {
            game_idx = i;
          }
        }
      }

      if (game_idx == -1) { return; }

      if (this.app.options.games[game_idx].initializing == 0) {

        //
        // check we don't have a pending TX for this game...
        //
        let ready_to_go = 1;

        if (this.app.wallet.wallet.pending.length > 0) {
          for (let i = 0; i < this.app.wallet.wallet.pending.length; i++) {
            let thistx = new saito.default.transaction(JSON.parse(this.app.wallet.wallet.pending[i]));
            let thistxmsg = thistx.returnMessage();
            if (thistxmsg.module == this.app.options.games[game_idx].module) {
              if (thistxmsg.game_id == this.app.options.games[game_idx].id) {
                ready_to_go = 0;
              }
            }
          }
        }

        if (ready_to_go == 0) {
          console.log("transaction for this game still in pending...");
          return;
        }

        clearInterval(this.initialization_timer);

        this.app.browser.replaceElementBySelector(`
	  <div class="arcade-game-initializer-success"> 
            <div class="arcade-game-initializer-success-title">Your game is ready to start!</div>
	    <button class="arcade-game-initializer-success-button saito-button saito-primary-button">start game</button>
	  </div>
	`, ".arcade-initializer");

	document.querySelector(".arcade-game-initializer-success-button").onclick = (e) => {
          let gamemod = this.app.modules.returnModule(this.app.options.games[game_idx].module);
	  window.location.href = `/${gamemod.returnSlug()}`;
	};
      }
    }, 1000);

    this.attachEvents();

  }


  attachEvents() {
  }

}

module.exports = Initializer;

