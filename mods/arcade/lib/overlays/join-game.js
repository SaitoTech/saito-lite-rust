const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const JoinGameOverlayTemplate = require('./join-game.template');

class JoinGameOverlay {

  constructor(app, mod, invite=null) {
    this.app = app;
    this.mod = mod;
    this.invite = invite;
    this.overlay = new SaitoOverlay(app, mod, false, true);
  }

  render() {
    //let txmsg = invite.returnMessage();
    //let game_mod = this.app.modules.returnModule(txmsg.name);
    this.overlay.show(JoinGameOverlayTemplate(this.app, this.mod, this.invite));
    this.overlay.setBackground('/twilight/img/arcade/arcade.jpg');
    this.attachEvents();
  }
  
  attachEvents() {
  }

}


module.exports = JoinGameOverlay;

