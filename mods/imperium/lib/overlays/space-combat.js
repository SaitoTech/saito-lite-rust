const ImperiumSpaceCombatOverlayTemplate = require("./space-combat.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class SpaceCombatOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
  }


  render(attacker, defender, sector, overlay_html) {
    this.overlay.show(ImperiumSpaceCombatOverlayTemplate(this.mod, attacker, defender, sector, overlay_html));
    this.attachEvents();

  }

  attachEvents() {
  }

}

module.exports = SpaceCombatOverlay;

