const SaitoOverlay = require("./../../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const CryptoOverlayTemplate = require("./main.template");

class CryptoOverlay {

  constructor(app, mod, game_id = "") {
    this.app = app;
    this.overlay = new SaitoOverlay(app);
    this.game_id = game_id;
  }

  render(app, mod) {

    let html = CryptoOverlayTemplate(app, mod);
    this.overlay.show(app, mod, html);
    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) {

  }

}

module.exports = CryptoOverlay;


