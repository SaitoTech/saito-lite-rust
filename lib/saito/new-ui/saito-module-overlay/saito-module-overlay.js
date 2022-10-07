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
    this.invite_sig = null;

    app.connection.on("arcade-game-loading" , () =>{
      this.overlay.show(this.app, this.mod, SaitoModuleOverlayTemplate(this.app, this.mod, this.invite, this.action));
      let gameLoader = new GameLoader(this.app, this);
      gameLoader.render(this.app, this.mod, "#saito-module-overlay-info-box");
    });

    app.connection.on("arcade-game-ready-play" , (game) =>{
      this.overlay.show(this.app, this.mod, SaitoModuleOverlayTemplate(this.app, this.mod, this.invite, this.action));
      let gameLoader = new GameLoader(this.app, this, game.game_id);
      gameLoader.render(this.app, this.mod, "#saito-module-overlay-info-box", `${game.game_name} is ready to start!`);
    });
  
    app.connection.on("arcade-game-ready-observer", (game_id)=>{
      this.overlay.show(this.app, this.mod, SaitoModuleOverlayTemplate(this.app, this.mod, this.invite, this.action));
      let spinner = new GameLoader(app, mod, game_id);
      spinner.render(app, mod, "#saito-module-overlay-info-box", "Game Moves Loaded", "Watch Game");
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
        let spinner = new GameLoader(app, mod);
        spinner.render(app, mod, "#saito-module-overlay-info-box", "Loading Game Moves");
      
        app.connection.emit("arcade-observer-join-table", invite.transaction.sig);
      }
    }

  }
}


module.exports = SaitoModuleOverlay;

