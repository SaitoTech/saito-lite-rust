const WarningOverlayTemplate = require("./warning.template");
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class WarningOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
  }

  render() {
    this.overlay.show(WarningOverlayTemplate(this.mod.returnAddress()));
    this.attachEvents();
  }

  attachEvents() {
  }

}

module.exports = WarningOverlay;

