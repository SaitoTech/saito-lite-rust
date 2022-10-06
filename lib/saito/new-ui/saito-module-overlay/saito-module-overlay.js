const SaitoModuleOverlayTemplate = require('./saito-module-overlay.template');
const SaitoOverlay = require('./../saito-overlay/saito-overlay');
const GameLoader = require("./../game-loader/game-loader");

class SaitoModuleOverlay {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(app);
    this.overlay.removeOnClose = true;
    this.action = "join";
    this.invite = null;

    app.connection.on("arcade-game-loading" , () =>{
      this.overlay.show(this.app, this.mod, SaitoModuleOverlayTemplate(this.app, this.mod, this.invite, this.action));
      let gameLoader = new GameLoader(this.app, this);
      gameLoader.render(this.app, this.mod, "#saito-module-overlay-info-table");
    });

    app.connection.on("arcade-game-ready-play" , (game) =>{
      this.overlay.show(this.app, this.mod, SaitoModuleOverlayTemplate(this.app, this.mod, this.invite, this.action));
      let gameLoader = new GameLoader(this.app, this, game.game_id);
      gameLoader.render(this.app, this.mod, "#saito-module-overlay-info-table", `${game.game_name} is ready to start!`);
    });
  }

  render(app, mod, invite = null) {
    this.invite = invite;
    this.overlay.show(this.app, this.mod, SaitoModuleOverlayTemplate(this.app, this.mod, invite, this.action));
    this.attachEvents(app, mod, invite);
  }
  
  attachEvents(app, mod, invite) {
    let join = document.querySelector(".saito-module-overlay-btn.join");
    if (join){
      join.onclick = (e) => {
        app.connection.emit("join-game", invite.transaction.sig);
      }
    }

    let watch = document.querySelector(".saito-module-overlay-btn.watch");
    if (watch){
      watch.onclick = (e) => {
        alert('clicked on watch');
        let spinner = new GameLoader(app, mod);
        spinner.render(app, mod, "#saito-module-overlay-info-table", "Loading Game Moves");
      
        app.connection.emit("arcade-observer-join-table", invite.transaction.sig);
      }
    }

  }
}


module.exports = SaitoModuleOverlay;

