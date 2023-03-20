const ImperiumSpaceCombatOverlayTemplate = require("./space-combat.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class SpaceCombatOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.attacker = null;
    this.defender = null;
    this.sector = null;
    this.visible = 0;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
  }


  hide() {
    this.visible = 0;
    this.overlay.hide();
  }

  updateStatus(overlay_html) {

    //
    // eliminate green
    //
    let qs  = `.unit-table.small .unit-element .unit-box`;
    if (overlay_html.indexOf("ssign") == -1) {
      document.querySelector(qs).style.backgroundColor = "transparent";
    }
    try {
      document.querySelector(".space-combat-menu").innerHTML = overlay_html;
    } catch (err) {}

  }


  render(attacker, defender, sector, overlay_html) {

    this.attacker = attacker;
    this.defender = defender;
    this.sector = sector;

    if (this.visible && document.querySelector(".space-combat-menu")) {
      document.querySelector(".space-combat-menu").innerHTML = overlay_html;
    } else {
      this.visible = 1;
      this.overlay.show(ImperiumSpaceCombatOverlayTemplate(this.mod, attacker, defender, sector, overlay_html));
      this.attachEvents();
    }

    //
    // eliminate green
    //
    let qs  = `.unit-table.small .unit-element .unit-box`;
    document.querySelector(qs).style.backgroundColor = "transparent";

  }

  updateHits(attacker, defender, sector, combat_info) {

    let nth = 1;
    if (combat_info.attacker == 1) { nth = 3; }

    if (this.visible == 0) {
      this.render(attacker, defender, sector, '');
    }

    //
    // technically attacker could be attacker or defender here
    //
    attacker = combat_info.attacker;

    let current_ship_idx = -1;
    let shot_idx = 0;
    for (let i = 0; i < combat_info.ship_idx.length; i++) {
      if (combat_info.ship_idx[i] > current_ship_idx) {
        current_ship_idx = combat_info.ship_idx[i];
        shot_idx = 0;
      } else {
	shot_idx++;
      }
      if (combat_info.modified_roll[i] >= combat_info.hits_on[i]) {
        let qs  = `.player-${attacker}-ship-${current_ship_idx}-shot-${shot_idx} .dice-results`;
        let qsn = `.player-${attacker}-ship-${current_ship_idx}-shot-${shot_idx} .dice-results .unit-box-num`;
        document.querySelector(qs).style.backgroundColor = "green";
        document.querySelector(qsn).innerHTML = combat_info.modified_roll[i];
      } else {
        let qsn = `.player-${attacker}-ship-${current_ship_idx}-shot-${shot_idx} .dice-results .unit-box-num`;
        document.querySelector(qsn).innerHTML = combat_info.modified_roll[i];
      }
    }
  }

  attachEvents() {
  }

}

module.exports = SpaceCombatOverlay;

