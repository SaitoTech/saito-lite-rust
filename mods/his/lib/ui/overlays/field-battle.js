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
      this.updateInstructions("A Field Battle imminent in "+ this.mod.game.spaces[res.spacekey].name+": Fortification?");
    }
  
    renderPostFieldBattle(res={}) {
      this.render(res);
      let obj = document.querySelector(".field-battle-overlay");
      obj.style.backgroundImage = "url(/his/img/backgrounds/field_battle.jpg)";
      obj.style.backgroundSize = "contain";
      this.updateInstructions("Field Battle over in " + this.mod.game.spaces[res.spacekey].name);
    }

    renderFieldBattle(res={}) {
      this.render(res);
      let obj = document.querySelector(".field-battle-overlay");
      obj.style.backgroundImage = "url(/his/img/backgrounds/field_battle.jpg)";
      obj.style.backgroundSize = "contain";
      this.updateInstructions("Field Battle in " + this.mod.game.spaces[res.spacekey].name);
    }

    renderPreFieldBattle(res={}) {
      this.render(res, 1);
      let obj = document.querySelector(".field-battle-overlay");
      obj.style.backgroundImage = "url(/his/img/backgrounds/field_battle.jpg)";
      obj.style.backgroundSize = "contain";
      this.updateInstructions("Field Battle imminent in " + this.mod.game.spaces[res.spacekey].name);
    }

    assignHits(res={}, faction="") {
      let hits_to_assign = res.attacker_hits;
      if (faction === res.attacker_faction) { hits_to_assign = res.defender_hits; }
      this.assignHitsManually(res, faction, hits_to_assign);
    }

    assignHitsManually(res={}, faction="", hits_to_assign=1) {

console.log("AHM!");

      let hits_assignable = 0;
      let hits_assigned = 0;
      let his_self = this.mod;

      this.updateInstructions(`Assign <span class="hits_to_assign">${hits_to_assign}</span> Hits`);
      this.mod.updateStatus(`Assign <span class="hits_to_assign">${hits_to_assign}</span> Hits`);

      document.querySelectorAll(".not-assignable").forEach((el) => {
	el.remove();
      });
      document.querySelectorAll(".hits-assignable").forEach((el) => {

console.log("HA");

	let factionspace = el.querySelector(".field-battle-desc").innerHTML;
	let can_i_kill_this_guy = false;

	if (factionspace === faction || his_self.returnAllyOfMinorPower(factionspace) === faction) {
	  can_i_kill_this_guy = true;
	}

console.log("faction: " + faction);
console.log("factionspace: " + factionspace);
console.log("ally of: " + his_self.returnAllyOfMinorPower(factionspace));

	if (can_i_kill_this_guy) {

	  if (factionspace) { factionspace.innerHTML += " (click to assign hit)"; }
	  el.classList.add("hits-assignable-hover-effect");

          hits_assignable++;
	  el.onclick = (e) => {

	    hits_assigned++;
	    let hits_left = hits_to_assign - hits_assigned;

	    document.querySelectorAll("hits_to_assign").forEach((el) => {
	      el.innerHTML = hits_left;
	    });

	    let unit_type = el.getAttribute("data-unit-type");
	    let faction = el.getAttribute("data-faction");
	    let spacekey = res.spacekey;

	    el.remove();

	    this.mod.addMove("field_battle_destroy_unit\t" + faction + "\t" + spacekey + "\t" + unit_type);
	    if (hits_assigned == hits_to_assign || hits_assigned >= hits_assignable) {
              document.querySelectorAll(".hits-assignable").forEach((el) => { el.onclick = (e) => {}; });
	      this.mod.endTurn();
	    }
	  }

	}
      });
      if (faction != "") {
	if (this.mod.game.player == this.mod.returnPlayerOfFaction(faction)) {
          this.mod.updateStatus(`Assign <span class="hits_to_assign">${hits_to_assign}</span> Hits`);
	} else {
          this.updateInstructions(this.mod.returnFactionName(faction) + " Assigning Hits");
	}
      } else {
        this.updateInstructions("Assigning Hits");
      }
    }

    attackersWin(res) {
      this.pushHudUnderOverlay();
      this.render(res, 0);
      let obj = document.querySelector(".field-battle-overlay");
      obj.style.backgroundImage = "url(/his/img/backgrounds/field_battle.jpg)";
      obj.style.backgroundSize = "contain";
      this.updateInstructions("Attackers Win - Close to Continue");
    }

    defendersWin(res) {
      this.pushHudUnderOverlay();
      this.render(res, 0);
      let obj = document.querySelector(".field-battle-overlay");
      obj.style.backgroundImage = "url(/his/img/backgrounds/field_battle.jpg)";
      obj.style.backgroundSize = "contain";
      this.updateInstructions("Defenders Win - Close to Continue");
    }




    render(res={}, pre_battle = 0) {

	let am_i_attacker = false;
	let am_i_defender = false;

	if (this.mod.returnPlayerFactions(this.mod.game.player).includes(res.attacker_faction)) { am_i_attacker = true; }
	if (this.mod.returnPlayerFactions(this.mod.game.player).includes(res.defender_faction)) { am_i_defender = true; }

console.log("am i attacker: " + am_i_attacker);
console.log("am i defender: " + am_i_defender);
console.log(JSON.stringify(res));

	this.visible = true;
        this.overlay.show(FieldBattleTemplate());

	if (pre_battle == 1) { res.attacker_modified_rolls = res.attacker_results; }
	if (pre_battle == 1) { res.defender_modified_rolls = res.defender_results }

//	document.querySelector(".field-battle-grid .attacker .title").innerHTML = res.attacker_faction + " (attacker)";
//	document.querySelector(".field-battle-grid .defender .title").innerHTML = res.defender_faction + " (defender)";

	if (res.attacker_modified_rolls) {
	  for (let i = 0; i < res.attacker_modified_rolls.length; i++) {

	      let roll = res.attacker_modified_rolls[i];
	      let unit_type = res.attacker_units[i];
	      let faction_name = res.attacker_units_faction[i];
	      let assignable = "";
	      if (am_i_attacker) { assignable = " not-assignable"; }
	      if (["regular","mercenary","squadron","cavalry","corsair"].includes(unit_type)) {
		if (am_i_attacker) {
	          assignable = " hits-assignable";
	        }
	      }
	      if (res.attacker_units_destroyed.includes(i)) { assignable = "destroyed"; faction_name = "destroyed"; }
	      let rrclass = "";
	      if (roll >= 5) { rrclass = "hit"; }
	      if (pre_battle) { roll = "?"; rrclass = ""; }

              let html = `
                <div class="field-battle-row ${assignable}" data-unit-type="${unit_type}" data-faction="${faction_name}">
                	<div class="field-battle-unit">${unit_type}<div class="field-battle-desc">${faction_name}</div></div>
                	<div class="field-battle-roll ${rrclass}">${roll}</div>
                </div>
              `;
              this.app.browser.addElementToSelector(html, ".field-battle-grid .attacker");

	  }
	}
 
	if (res.defender_modified_rolls) {
	  for (let i = 0; i < res.defender_modified_rolls.length; i++) {

console.log("def mod rolls: " + i);

	      let roll = res.defender_modified_rolls[i];
	      let unit_type = res.defender_units[i];
	      let faction_name = res.defender_units_faction[i];
	      let rrclass = "";
	      let assignable = "";
	      if (am_i_defender) { assignable = " not-assignable"; }	      
	      if (["regular","mercenary","squadron","cavalry","corsair"].includes(unit_type)) {
		if (am_i_defender) {
		  assignable = " hits-assignable";
	        }
	      }
	      if (res.defender_units_destroyed.includes(i)) { assignable = "destroyed"; faction_name = "destroyed"; }
	      if (roll >= 5) { rrclass = "hit"; }
	      if (pre_battle) { roll = "?"; rrclass = ""; }

console.log("def mod rolls 2: " + i);

              let html = `
                <div class="field-battle-row ${assignable}" data-unit-type="${unit_type}" data-faction="${faction_name}">
                	<div class="field-battle-unit">${unit_type}<div class="field-battle-desc">${faction_name}</div></div>
                	<div class="field-battle-roll ${rrclass}">${roll}</div>
                </div>
              `;
console.log("def mod rolls 3: " + i);
              this.app.browser.addElementToSelector(html, ".field-battle-grid .defender");
console.log("def mod rolls 4: " + i);

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
