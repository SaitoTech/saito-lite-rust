const SaitoModuleOverlayTemplate = require('./saito-module-overlay.template');
const SaitoOverlay = require('./../saito-overlay/saito-overlay');

class SaitoModuleOverlay {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(app);
    this.overlay.removeOnClose = true;
    this.action = "join";
  }

  render(app, mod, invite = null) {
    this.overlay.show(this.app, this.mod, SaitoModuleOverlayTemplate(app, mod, invite, this.action));
    this.attachEvents(app, mod, invite);
  }
  
  attachEvents(app, mod, invite) {
    let btn = document.querySelector(".game-invite-join-btn");
    let classSelf = this;
    if (btn){
      btn.onclick = (e) => {
        app.connection.emit("join-game", invite.transaction.sig);
        classSelf.overlay.hide();
      }
    }
  }

}


module.exports = SaitoModuleOverlay;

