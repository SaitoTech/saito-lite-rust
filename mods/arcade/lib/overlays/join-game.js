const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const JoinGameOverlayTemplate = require('./join-game.template');

class JoinGameOverlay {

  constructor(app, mod, invite=null) {
    this.app = app;
    this.mod = mod;
    this.invite = invite;
    this.overlay = new SaitoOverlay(app, mod, true, true);
  }

  render() {
    this.overlay.show(JoinGameOverlayTemplate(this.app, this.mod, this.invite));
    this.attachEvents();
  }
  
  attachEvents() {
  }

}


module.exports = JoinGameOverlay;

