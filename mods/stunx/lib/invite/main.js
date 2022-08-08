const saito = require('./../../../../lib/saito/saito');
const StunInviteTemplate = require('./main.template');
const SaitoOverlay = require('./../../../../lib/saito/new-ui/saito-overlay/saito-overlay');

class StunInvite {

  constructor(app, mod) {
    this.app = app;
    this.name = "StunInvite";
    this.overlay = new SaitoOverlay(app, mod);
  }

  render(app, mod) {
    this.overlay.show(app, mod, StunInviteTemplate(app, mod));
    this.attachEvents(app, mod);
  }

  
  attachEvents(app, mod) {
    document.getElementById("stunx-create-invite").onclick = (e) => {
      mod.createOpenTransaction(mod.options);
      this.overlay.hide();
    }
  }

}


module.exports = StunInvite;

