const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const WaitingGameOverlayTemplate = require('./waiting-game.template');

class WaitingGameOverlay {

  constructor(app, mod, tx=null) {
    this.app = app;
    this.mod = mod;
    this.invite_tx = tx;
    this.invite = null;
    this.overlay = new SaitoOverlay(app, mod, false, true);
  }

  render() {
    
    let txmsg = this.invite_tx.returnMessage();
    let modname = txmsg.name;
    if (!modname) { modname = txmsg.game; }
    if (!modname) { modname = txmsg.module; }

    let game_mod = this.app.modules.returnModuleByName(modname);

    this.overlay.show(WaitingGameOverlayTemplate(this.app, this.mod, this.invite_tx));
    this.overlay.setBackground(`/${game_mod.returnSlug()}/img/arcade/arcade.jpg`);
    this.attachEvents();
  }
  
  attachEvents() {

    document.querySelector(".arcade-game-controls-cancel-invite").onclick = (e) => {
      alert("CANCEL INVITE");
    }
  }

}


module.exports = WaitingGameOverlay;

