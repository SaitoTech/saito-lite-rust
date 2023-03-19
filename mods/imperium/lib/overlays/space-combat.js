const ImperiumSpaceCombatOverlayTemplate = require("./space-combat.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class SpaceCombatOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.visible = 0;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
  }


  hide() {
    this.visible = 0;
    this.overlay.hide();
  }

  render(attacker, defender, sector, overlay_html) {
    if (this.visible) {
      document.querySelector(".space-combat-menu").innerHTML = overlay_html;
    } else {
      this.visible = 1;
      this.overlay.show(ImperiumSpaceCombatOverlayTemplate(this.mod, attacker, defender, sector, overlay_html));
      this.attachEvents();
    }
  }

  updateHits(attacker, defender, sector, combat_info) {

    if (this.visible == 0) {
      this.render(attacker, defender, sector, '');
    }
console.log("COMBAT INFO");
console.log(JSON.stringify(combat_info));

    //
    // technically attacker could be attacker or defender here
    //
    attacker = combat_info.attacker;

    for (let i = 0; i < combat_info.modified_roll.length; i++) {
      if (combat_info.modified_roll[i] >= combat_info.hits_on[i]) {
        let qs  = `.player-${attacker}-ship-${i} .unit-box:nth-child(2)`;
        let qsn = `.player-${attacker}-ship-${i} .unit-box:nth-child(2) .unit-box-num`;
console.log("FAILURE: " + qs);
        document.querySelector(qs).style.backgroundColor = "green";
        document.querySelector(qsn).innerHTML = combat_info.modified_roll[i];
      } else {
        let qsn = `.attacker-ship-${i} .unit-box:nth-child(2) .unit-box-num`;
        document.querySelector(qsn).innerHTML = combat_info.modified_roll[i];
      }
    }

    // combat_info = {};
    // combat_info.attacker        = attacker;
    // combat_info.hits_or_misses  = hits_or_misses;
    // combat_info.units_firing    = units_firing;
    // combat_info.hits_on         = hits_on;
    // combat_info.unmodified_roll = unmodified_roll;  // unmodified roll
    // combat_info.modified_roll   = modified_roll; // modified roll
    // combat_info.reroll          = reroll; // rerolls
      


  }

  attachEvents() {
  }

}

module.exports = SpaceCombatOverlay;

