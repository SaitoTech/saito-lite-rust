const FieldBattleTemplate = require('./field-battle.template');
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class FieldBattleOverlay {

    constructor(app, mod){
        this.app = app;
        this.mod = mod;
	this.visible = false;
        this.overlay = new SaitoOverlay(app, mod);
    }

    hide() {
        this.visible = false;
        this.overlay.hide();
    }
 
    pullHudOverOverlay() {
      //
      // pull GAME HUD over overlay
      //
      let overlay_zindex = parseInt(this.overlay.zIndex);
      if (document.querySelector(".hud")) {
        document.querySelector(".hud").style.zIndex = overlay_zindex+1;
        this.mod.hud.zIndex = overlay_zindex+1;
      }
    }
    pushHudUnderOverlay() {
      //
      // push GAME HUD under overlay
      //
      let overlay_zindex = parseInt(this.overlay.zIndex);
      if (document.querySelector(".hud")) {
        document.querySelector(".hud").style.zIndex = overlay_zindex-2;
        this.mod.hud.zIndex = overlay_zindex-2;
      }
    }

    renderFortification(res={}) {
      this.render(res);
      let obj = document.querySelector(".field-battle-overlay");
      obj.style.backgroundImage = "url(/his/img/backgrounds/fortification.png)";
      obj.style.backgroundSize = "contain";
      this.updateInstructions("A Field Battle is about to Begin -- Fortification?");
    }
  
    renderPostFieldBattle(res={}) {
      this.render(res);
      let obj = document.querySelector(".field-battle-overlay");
      obj.style.backgroundImage = "url(/his/img/backgrounds/field_battle.jpg)";
      obj.style.backgroundSize = "contain";
      this.updateInstructions("Field Battle Completed");
    }

    renderFieldBattle(res={}) {
      this.render(res);
      let obj = document.querySelector(".field-battle-overlay");
      obj.style.backgroundImage = "url(/his/img/backgrounds/field_battle.jpg)";
      obj.style.backgroundSize = "contain";
      this.updateInstructions("Field Battle Underway");
    }

    renderPreFieldBattle(res={}) {
      this.render(res, 1);
      let obj = document.querySelector(".field-battle-overlay");
      obj.style.backgroundImage = "url(/his/img/backgrounds/field_battle.jpg)";
      obj.style.backgroundSize = "contain";
      this.updateInstructions("Anticipating a Field Battle");
    }

    assignHits(res={}, faction="") {

      let hits_assignable = 0;
      let hits_assigned = 0;
      let hits_to_assign = res.attacker_hits;
      if (faction === res.attacker_faction) { hits_to_assign = res.defender_hits; }

      document.querySelectorAll(".not-assignable").forEach((el) => {
	el.remove();
      });
      document.querySelectorAll(".hits-assignable").forEach((el) => {
	el.classList.add("hits-assignable-hover-effect");
        hits_assignable++;
	el.onclick = (e) => {

	  hits_assigned++;

	  let unit_type = el.getAttribute("data-unit-type");
	  let faction = el.getAttribute("data-faction");
	  let spacekey = res.spacekey;

	  el.remove();

	  this.mod.addMove("field_battle_destroy_unit\t" + faction + "\t" + spacekey + "\t" + unit_type);
	  if (hits_assigned == hits_assigned || hit_assigned >= hits_assignable) {
            document.querySelectorAll(".hits-assignable").forEach((el) => { el.onclick = (e) => {}; });
	    this.mod.endTurn();
	  }

	}
      });
      if (faction != "") {
        this.updateInstructions(this.mod.returnFactionName(faction) + " Assigning Hits");
      } else {
        this.updateInstructions("Assigning Hits");
      }
    }

    attackersWin(res) {
      this.pushHudUnderOverlay();
      this.render(res, 1);
      let obj = document.querySelector(".field-battle-overlay");
      obj.style.backgroundImage = "url(/his/img/backgrounds/field_battle.jpg)";
      obj.style.backgroundSize = "contain";
      this.updateInstructions("Attackers Win: Defenders Besieged");
    }

    defendersWin(res) {
      this.pushHudUnderOverlay();
      this.render(res, 1);
      let obj = document.querySelector(".field-battle-overlay");
      obj.style.backgroundImage = "url(/his/img/backgrounds/field_battle.jpg)";
      obj.style.backgroundSize = "contain";
      this.updateInstructions("Defenders Win: Attackers must Retreat");
    }




    render(res={}, pre_battle = 0) {

	this.visible = true;
        this.overlay.show(FieldBattleTemplate());

	if (pre_battle == 1) { res.attacker_modified_rolls = res.attacker_results; }
	if (pre_battle == 1) { res.defender_modified_rolls = res.defender_results }

	document.querySelector(".field-battle-grid .attacker .title").innerHTML = res.attacker_faction + " / attacker";
	document.querySelector(".field-battle-grid .defender .title").innerHTML = res.defender_faction + " / defender";

	if (res.attacker_modified_rolls) {
	  for (let i = 0; i < res.attacker_modified_rolls.length; i++) {

	    let roll = res.attacker_modified_rolls[i];
	    let unit_type = res.attacker_units[i];
	    let faction_name = res.attacker_units_faction[i];
	    let assignable = " not-assignable"; if (["regular","mercenary","squadron","cavalry","corsair"].includes(unit_type)) { assignable = " hits-assignable"; }
	    let rrclass = "";
	    if (roll >= 5) { rrclass = "hit"; }
	    if (pre_battle) { roll = "?"; rrclass = ""; }

            let html = `
              <div class="field-battle-row ${assignable}" data-unit-type="${unit_type}" data-faction="${faction_name}">
              	<div class="field-battle-unit">${unit_type}<div class="field-battle-desc">${unit_type}</div></div>
              	<div class="field-battle-roll ${rrclass}">${roll}</div>
              </div>
            `;
            this.app.browser.addElementToSelector(html, ".field-battle-grid .attacker");
	  }
	}
 
	if (res.defender_modified_rolls) {
	  for (let i = 0; i < res.defender_modified_rolls.length; i++) {

	    let roll = res.defender_modified_rolls[i];
	    let unit_type = res.defender_units[i];
	    let faction_name = res.defender_units_faction[i];
	    let rrclass = "";
	    if (roll >= 5) { rrclass = "hit"; }
	    if (pre_battle) { roll = "?"; rrclass = ""; }

            let html = `
              <div class="field-battle-row">
              	<div class="field-battle-unit">${unit_type}<div class="field-battle-desc">${faction_name}</div></div>
              	<div class="field-battle-roll ${rrclass}">${roll}</div>
              </div>
            `;
            this.app.browser.addElementToSelector(html, ".field-battle-grid .defender");
	  }
	}
 
       this.attachEvents();

    }

    updateInstructions(help="") {
      let x = document.querySelector(".field-battle-overlay .help");
      if (x) { x.innerHTML = help; }
    }

    attachEvents(){
    }


    showFieldBattleResults(obj) {
    }

}


module.exports = FieldBattleOverlay;
