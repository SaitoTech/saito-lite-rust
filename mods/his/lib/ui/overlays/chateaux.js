const ChateauxTemplate = require('./chateaux.template');
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class ChateauxOverlay {

    constructor(app, mod){
        this.app = app;
        this.mod = mod;
	this.visible = false;
        this.overlay = new SaitoOverlay(app, mod);
	this.selected = [];
	this.bonus = 0;
	this.roll = 0;
    }

    hide() {
        this.visible = false;
        this.overlay.hide();
    }
 
    pullHudOverOverlay() {
      let overlay_zindex = parseInt(this.overlay.zIndex);
      if (document.querySelector(".hud")) {
        document.querySelector(".hud").style.zIndex = overlay_zindex+1;
        this.mod.hud.zIndex = overlay_zindex+1;
      }
    }

    pushHudUnderOverlay() {
      let overlay_zindex = parseInt(this.overlay.zIndex);
      if (document.querySelector(".hud")) {
        document.querySelector(".hud").style.zIndex = overlay_zindex-2;
        this.mod.hud.zIndex = overlay_zindex-2;
      }
    }
  
    render(faction="france") {

	this.visible = true;
        this.overlay.show(ChateauxTemplate());

	// bonuses
	let bonus = 0;
	let p = this.mod.returnPlayerOfFaction(faction);

	if (this.mod.isSpaceControlled("milan", "france")) {
	  bonus += 2;
	  document.querySelector(".modifier1").style.backgroundColor = "yellow";
	  document.querySelector(".modifier1").style.color = "black";
	}
	if (this.mod.isSpaceControlled("florence", "france")) {
	  bonus += 1;
	  document.querySelector(".modifier2").style.backgroundColor = "yellow";
	  document.querySelector(".modifier2").style.color = "black";
	}

	let italian_keys = 0;
	let occupied_french_space = 0;
	let controlled_french_space = 0;

	for (let x in this.mod.game.spaces) {
	  let s = this.mod.game.spaces[x];
	  if (s.language == "italian") {
	    if (this.mod.isSpaceControlled(s.key, "france")) { italian_keys++; }
	  }
	  if (s.home == "france") {
	    if (!this.mod.isSpaceControlled(s.key, "france")) { controlled_french_space++; }
	    if (this.mod.doesSpaceHaveNonFactionUnits(s.key, "france")) { occupied_french_space++; }
	  }
	}

	if (italian_keys >= 3) {
	  bonus += 2;
	  document.querySelector(".modifier3").style.backgroundColor = "yellow";
	  document.querySelector(".modifier3").style.color = "black";
	}
	if (controlled_french_space > 0) {
	  bonus -= 1;
	  document.querySelector(".modifier5").style.backgroundColor = "yellow";
	  document.querySelector(".modifier5").style.color = "black";
	}
	if (occupied_french_space > 0) {
	  bonus -= 2;
	  document.querySelector(".modifier6").style.backgroundColor = "yellow";
	  document.querySelector(".modifier6").style.color = "black";
	}

	this.bonus = bonus;
	this.roll = this.mod.rollDice(6);

	let modified_roll = this.roll + this.bonus;


        document.querySelector(".chateaux-overlay .help").innerHTML = `${this.mod.returnFactionName(faction)} rolls ${this.roll} (modified: ${modified_roll})`;


	if (modified_roll >= 8) {

	  document.querySelector(".outcome1").style.backgroundColor = "yellow";  
	  document.querySelector(".outcome1").style.color = "black";

	  this.mod.game.state.french_chateaux_vp += 1;
	  this.mod.game.queue.push("select_and_discard\t"+faction);
	  this.mod.game.queue.push("hide_overlay\tchateaux");
          this.mod.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+faction);
	  this.mod.game.queue.push("DEAL\t1\t"+p+"\t"+2);
	  this.mod.game.queue.push(`ACKNOWLEDGE\t${this.mod.returnFactionName(faction)} rolls on the Chateaux Table`);

	}
	if (modified_roll >= 5 && modified_roll < 8) {

	  document.querySelector(".outcome2").style.backgroundColor = "yellow";  
	  document.querySelector(".outcome2").style.color = "black";


	  this.mod.game.state.french_chateaux_vp += 1;
	  this.mod.game.queue.push("hide_overlay\tchateaux");
          this.mod.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+faction);
	  this.mod.game.queue.push("DEAL\t1\t"+p+"\t"+1);
	  this.mod.game.queue.push(`ACKNOWLEDGE\t${this.mod.returnFactionName(faction)} rolls on the Chateaux Table`);

	}
	if (modified_roll >= 3 && modified_roll < 5) {

	  document.querySelector(".outcome3").style.backgroundColor = "yellow";  
	  document.querySelector(".outcome3").style.color = "black";

	  this.mod.game.state.french_chateaux_vp += 1;
	  this.mod.game.queue.push("select_and_discard\t"+faction);
	  this.mod.game.queue.push("hide_overlay\tchateaux");
          this.mod.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+faction);
	  this.mod.game.queue.push("DEAL\t1\t"+p+"\t"+1);
	  this.mod.game.queue.push(`ACKNOWLEDGE\t${this.mod.returnFactionName(faction)} rolls on the Chateaux Table`);
	
	}
	if (modified_roll <= 2) {

	  document.querySelector(".outcome4").style.backgroundColor = "yellow";  
	  document.querySelector(".outcome4").style.color = "black";

	  this.mod.game.queue.push("select_and_discard\t"+faction);
	  this.mod.game.queue.push("hide_overlay\tchateaux");
          this.mod.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+faction);
	  this.mod.game.queue.push("DEAL\t1\t"+p+"\t"+2);
	  this.mod.game.queue.push(`ACKNOWLEDGE\t${this.mod.returnFactionName(faction)} rolls on the Chateaux Table`);

	}

	this.pullHudOverOverlay();

    }


}

module.exports = ChateauxOverlay;

