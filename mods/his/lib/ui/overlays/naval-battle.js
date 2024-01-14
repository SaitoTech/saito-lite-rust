const NavalBattleTemplate = require('./naval-battle.template');
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class NavalBattleOverlay {

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
      let obj = document.querySelector(".naval-battle-overlay");
      obj.style.backgroundImage = "url(/his/img/backgrounds/fortification.png)";
      obj.style.backgroundSize = "cover";
      this.updateInstructions("A Naval Battle imminent in "+ this.mod.returnSpaceName(res.spacekey)+": Fortification?");
    }
  
    renderPostNavalBattle(res={}) {
      this.render(res);
      let obj = document.querySelector(".naval-battle-overlay");
      obj.style.backgroundImage = "url(/his/img/backgrounds/naval_battle.png)";
      obj.style.backgroundSize = "cover";
      this.updateInstructions("Naval Battle over in " + this.mod.returnSpaceName(res.spacekey));
    }

    renderNavalBattle(res={}) {
      this.render(res);
      let obj = document.querySelector(".naval-battle-overlay");
      obj.style.backgroundImage = "url(/his/img/backgrounds/naval_battle.png)";
      obj.style.backgroundSize = "cover";
      this.updateInstructions("Naval Battle in " + this.mod.returnSpaceName(res.spacekey));
    }

    renderPreNavalBattle(res={}) {
      this.render(res, 1);
      let obj = document.querySelector(".naval-battle-overlay");
      obj.style.backgroundImage = "url(/his/img/backgrounds/naval_battle.png)";
      obj.style.backgroundSize = "cover";
console.log("spacekey: " + res.spacekey);
      this.updateInstructions("Naval Battle imminent in " + this.mod.returnSpaceName(res.spacekey));
    }

    assignHits(res={}, faction="") {
      let hits_to_assign = res.attacker_hits;
      if (faction === res.attacker_faction) { hits_to_assign = res.defender_hits; }
      this.assignHitsManually(res, faction, hits_to_assign);
    }

    assignHitsManually(res={}, faction="", hits_to_assign=1) {

      let hits_assignable = 0;
      let hits_assigned = 0;
      let his_self = this.mod;

      this.updateInstructions(`Assign <span class="hits_to_assign">${hits_to_assign}</span> Hits`);
      this.mod.updateStatus(`Assign <span class="hits_to_assign">${hits_to_assign}</span> Hits`);

      document.querySelectorAll(".not-assignable").forEach((el) => {
	el.remove();
      });
      document.querySelectorAll(".hits-assignable").forEach((el) => {

	let factionspace = el.querySelector(".naval-battle-desc").innerHTML;
	let can_i_kill_this_guy = false;

	if (factionspace === faction || his_self.returnAllyOfMinorPower(factionspace) === faction || his_self.game.player === his_self.returnPlayerCommandingFaction(faction)) {
	  can_i_kill_this_guy = true;
	}

	if (can_i_kill_this_guy) {

	  if (factionspace) { factionspace.innerHTML += " (click to assign hit)"; }
	  el.classList.add("hits-assignable-hover-effect");

          let unit_type = el.getAttribute("data-unit-type");

          hits_assignable++;
	  if (unit_type === "squadron") { hits_assignable++; }

	  el.onclick = (e) => {

	    document.querySelectorAll("hits_to_assign").forEach((el) => {
	      el.innerHTML = hits_left;
	    });

	    let unit_type = el.getAttribute("data-unit-type");
	    let faction = el.getAttribute("data-faction");
	    let spacekey = res.spacekey;

	    hits_assigned++;
	     if (unit_type === "squadron") { hits_assigned++; }
	    let hits_left = hits_to_assign - hits_assigned;


	    el.remove();

	    this.mod.addMove("naval_battle_destroy_unit\t" + faction + "\t" + spacekey + "\t" + unit_type);
	    if (hits_assigned == hits_to_assign || hits_assigned >= hits_assignable || (hits_to_assign == 1 && hits_assignable%2 == 0)) {
              document.querySelectorAll(".hits-assignable").forEach((el) => { el.onclick = (e) => {}; });
	      this.mod.endTurn();
	    }
	  }

	}
      });
      if (faction != "") {
	if (this.mod.game.player == this.mod.returnPlayerCommandingFaction(faction)) {
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
      let obj = document.querySelector(".naval-battle-overlay");
      obj.style.backgroundImage = "url(/his/img/backgrounds/naval_battle.png)";
      obj.style.backgroundSize = "cover";
      this.updateInstructions("Attackers Win - Close to Continue");
    }

    defendersWin(res) {
      this.pushHudUnderOverlay();
      this.render(res, 0);
      let obj = document.querySelector(".naval-battle-overlay");
      obj.style.backgroundImage = "url(/his/img/backgrounds/naval_battle.png)";
      obj.style.backgroundSize = "cover";
      this.updateInstructions("Defenders Win - Close to Continue");
    }




    render(res={}, pre_battle = 0) {

	let am_i_attacker = false;
	let am_i_defender = false;

	if (this.mod.returnPlayerFactions(this.mod.game.player).includes(res.attacker_faction) || this.mod.returnPlayerCommandingFaction(res.attacker_faction) == this.mod.game.player) { am_i_attacker = true; }
	if (this.mod.returnPlayerFactions(this.mod.game.player).includes(res.defender_faction) || this.mod.returnPlayerCommandingFaction(res.defender_faction) == this.mod.game.player) { am_i_defender = true; }

	this.visible = true;
        this.overlay.show(NavalBattleTemplate());

	if (pre_battle == 1) { res.attacker_modified_rolls = res.attacker_results; }
	if (pre_battle == 1) { res.defender_modified_rolls = res.defender_results }

console.log("RES: " + JSON.stringify(res));

	if (res.attacker_modified_rolls) {
	  for (let i = 0; i < res.attacker_modified_rolls.length; i++) {

	      let roll = res.attacker_modified_rolls[i];
	      let unit_type = "";
	      let faction_name = "";
	      if (i < res.attacker_units.length) {
	        unit_type = res.attacker_units[i];
	        faction_name = res.attacker_units_faction[i];
	      } else {
		faction_name = "navy leader present";
	        unit_type = "bonus";
	      }
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
                <div class="naval-battle-row ${assignable}" data-unit-type="${unit_type}" data-faction="${faction_name}">
                	<div class="naval-battle-unit">${unit_type}<div class="naval-battle-desc">${faction_name}</div></div>
                	<div class="naval-battle-roll ${rrclass}">${roll}</div>
                </div>
              `;
              this.app.browser.addElementToSelector(html, ".naval-battle-grid .attacker");

	  }
	}
 
	if (res.defender_modified_rolls) {
	  for (let i = 0; i < res.defender_modified_rolls.length; i++) {

	      let roll = res.defender_modified_rolls[i];
	      let unit_type = "";
	      let faction_name = "";
	      if (i < res.defender_units.length) {
		unit_type = res.defender_units[i];
	        faction_name = res.defender_units_faction[i];
	      } else {
	        unit_type = "bonus";
		faction_name = "navy leader present";
	      }
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

              let html = `
                <div class="naval-battle-row ${assignable}" data-unit-type="${unit_type}" data-faction="${faction_name}">
                	<div class="naval-battle-unit">${unit_type}<div class="naval-battle-desc">${faction_name}</div></div>
                	<div class="naval-battle-roll ${rrclass}">${roll}</div>
                </div>
              `;
              this.app.browser.addElementToSelector(html, ".naval-battle-grid .defender");
	  }
	}
 
       this.attachEvents();

    }

    updateInstructions(help="") {
      let x = document.querySelector(".naval-battle-overlay .help");
      if (x) { x.innerHTML = help; }
    }

    attachEvents(){
    }


    showNavalBattleResults(obj) {
    }

}


module.exports = NavalBattleOverlay;
