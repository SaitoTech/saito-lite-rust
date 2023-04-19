const SettlersWelcomeOverlayTemplate = require("./welcome.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class WelcomeOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
  }

  render() {
    
    this.overlay.show(SettlersWelcomeOverlayTemplate(this));
    this.attachEvents();

  }

  attachEvents() {
  }

}

module.exports = WelcomeOverlay;

