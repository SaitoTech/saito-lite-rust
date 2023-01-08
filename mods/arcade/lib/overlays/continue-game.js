const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const ContinueGameOverlayTemplate = require('./continue-game.template');

class ContinueGameOverlay {

  constructor(app, mod, tx=null) {
    this.app = app;
    this.mod = mod;
    this.invite_tx = tx;
    this.overlay = new SaitoOverlay(app, mod, false, true);
  }

  render() {
    
    let txmsg = this.invite_tx.returnMessage();
    let modname = txmsg.name;
    if (!modname) { modname = txmsg.game; }
    if (!modname) { modname = txmsg.module; }

    let game_mod = this.app.modules.returnModuleByName(modname);

    this.overlay.show(ContinueGameOverlayTemplate(this.app, this.mod, this.invite_tx));
    this.overlay.setBackground(`/${game_mod.returnSlug()}/img/arcade/arcade.jpg`);
    this.attachEvents();
  }
  
  attachEvents() {

    document.querySelector(".arcade-game-controls-join-game").onclick = (e) => {
    }
  }

}


module.exports = ContinueGameOverlay;

