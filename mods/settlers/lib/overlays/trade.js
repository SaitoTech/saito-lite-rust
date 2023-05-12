const TradeOverlayTemplate = require("./trade.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class TradeOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
  }

  render() {
    this.overlay.show(TradeOverlayTemplate(this.app, this.mod, this));
    this.attachEvents();
  }

  attachEvents() {
  }

}

module.exports = TradeOverlay;

