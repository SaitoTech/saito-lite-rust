const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");
const CryptoOverlayTemplate = require("./main.template");

class CryptoOverlay {

  constructor(app, mod, game_id = "") {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(app);
    this.game_id = game_id;
  }

  render() {
    this.overlay.show(CryptoOverlayTemplate(this.app, this.mod));
    this.attachEvents();
  }

  attachEvents() {
  }

}

module.exports = CryptoOverlay;


