const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const JoinGameOverlayTemplate = require('./join-game.template');

class JoinGameOverlay {

  constructor(app, mod, tx=null) {
    this.app = app;
    this.mod = mod;
    this.invite_tx = tx;
    this.overlay = new SaitoOverlay(app, mod, false, true);
  }

  render() {
    
    let txmsg = this.invite_tx.returnMessage();
    let game_mod = this.app.modules.returnModuleByName(txmsg.name);

    this.overlay.show(JoinGameOverlayTemplate(this.app, this.mod, this.invite_tx));
    this.overlay.setBackground(`/${game_mod.returnSlug()}/img/arcade/arcade.jpg`);
    this.attachEvents();
  }
  
  attachEvents() {
  }

}


module.exports = JoinGameOverlay;

