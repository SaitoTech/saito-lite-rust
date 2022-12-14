const SaitoModuleOverlayTemplate = require('./saito-module-overlay.template');
const SaitoOverlay = require('./../saito-overlay/saito-overlay');

class SaitoModuleOverlay {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(app, mod, true, true);
  }

  render() {
    this.overlay.show(SaitoModuleOverlayTemplate(this.app, this.mod));

    this.attachEvents();
  }
  
  attachEvents() {
  }
}


module.exports = SaitoModuleOverlay;

