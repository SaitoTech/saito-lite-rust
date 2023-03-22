const ImperiumUnitsOverlayTemplate = require("./units.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class UnitsOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
  }


  render() {
    this.overlay.show(ImperiumUnitsOverlayTemplate(this.mod));
    this.attachEvents();
  }

  attachEvents() {
  }
}

module.exports = UnitsOverlay;

