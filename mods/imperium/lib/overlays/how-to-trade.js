const ImperiumHowToTradeOverlayTemplate = require("./how-to-trade.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class HowToTradeOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
    this.overlay.clickToClose = true;
  }


  render() {
    this.overlay.show(ImperiumHowToTradeOverlayTemplate());
    this.overlay.setBackground("/imperium/img/backgrounds/production_background2.png");
    //this.overlay.setBackground("/imperium/img/backgrounds/production_background2.png", false);
  }

}

module.exports = HowToTradeOverlay;

