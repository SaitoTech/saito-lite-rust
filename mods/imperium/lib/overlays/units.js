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
    this.overlay.setBackground("/imperium/img/backgrounds/units-background.jpg");
    this.attachEvents();
  }

  attachEvents() {
    document.querySelector(".saito-overlay").onclick = (e) => { this.overlay.hide(); }
  }
}

module.exports = UnitsOverlay;

