const CoinsOverlayTemplate = require("./coins.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class CoinsOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
  }

  render() {
    this.overlay.show(CoinsOverlayTemplate());
    this.attachEvents();
  }

  attachEvents() {

  }

}

module.exports = CoinsOverlay;

