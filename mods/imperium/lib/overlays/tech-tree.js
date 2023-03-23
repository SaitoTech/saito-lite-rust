const ImperiumTechTreeOverlayTemplate = require("./tech-tree.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class TechTreeOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
  }

  render() {
    this.overlay.show(ImperiumTechTreeOverlayTemplate());
    this.attachEvents();
  }

  attachEvents() {
  }
}

module.exports = TechTreeOverlay;

