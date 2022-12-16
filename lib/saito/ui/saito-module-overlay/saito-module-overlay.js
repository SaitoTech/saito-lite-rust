const SaitoModuleOverlayTemplate = require('./saito-module-overlay.template');
const SaitoOverlay = require('./../saito-overlay/saito-overlay');

class SaitoModuleOverlay {
  constructor(app, mod, invite) {
    this.app = app;
    this.mod = mod;
    this.invite = invite;
    this.overlay = new SaitoOverlay(app, mod, true, true);

    console.log('invite');
    console.log(this.invite);
  }

  render() {
    this.overlay.show(SaitoModuleOverlayTemplate(this.app, this.mod, this.invite));

    this.attachEvents();
  }
  
  attachEvents() {
  }
}


module.exports = SaitoModuleOverlay;

