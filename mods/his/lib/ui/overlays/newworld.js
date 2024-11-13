const NewWorldTemplate = require('./newworld.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class NewWorldOverlay {

	constructor(app, mod) {
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
		let overlay_zindex = parseInt(this.overlay.zIndex);
		if (document.querySelector('.hud')) {
			document.querySelector('.hud').style.zIndex = overlay_zindex + 1;
			this.mod.hud.zIndex = overlay_zindex + 1;
		}
	}

	pushHudUnderOverlay() {
		let overlay_zindex = parseInt(this.overlay.zIndex);
		if (document.querySelector('.hud')) {
			document.querySelector('.hud').style.zIndex = overlay_zindex - 2;
			this.mod.hud.zIndex = overlay_zindex - 2;
		}
	}

	render(stage="") {

		let his_self = this.mod;
		this.visible = true;
		this.overlay.show(NewWorldTemplate(this.mod));

		  let active_colonies = 0;
		  let active_conquests = 0;
		  let active_explorations = 0;

		  //////////////
		  // COLONIES //
		  //////////////
	 	  for (let z = 0; z < his_self.game.state.colonies.length; z++) {
		    let c = his_self.game.state.colonies[z];
		    let bonus_card = 0; if (c.bonus_prize == "bonus card") { bonus_card = 1; }
		    if (c.prize == "bonus card") { bonus_card = 1; }
		    if (!c.prize) { c.prize = "-"; }
		    if (c.destroyed != 1 && c.round <= his_self.game.state.round) {
		      active_colonies++;
		      his_self.app.browser.addElementToSelector(this.returnRowHTML({ prize : c.prize , img : c.img , type : "colony", name : c.name , faction : c.faction , total_hits : c.modified_roll , bonus_card : bonus_card }, stage), ".new-world-overlay .content .colonies");
		    } else {
		      if (c.destroyed == 1 && c.round_destroyed == his_self.game.state.round) {
		        active_colonies++;
			let x = c.colony;
		        if (his_self.game.state.newworld[x].claimed != 1) {
		          his_self.app.browser.addElementToSelector(this.returnRowHTML({ prize : c.name , img : c.img , type : "colony", name : c.name , faction : "abandoned" , total_hits : c.modified_roll , depleted : 1 , bonus_card : bonus_card }, stage), ".new-world-overlay .content .colonies");
		        }
		      }
		    }
		  }


		  ///////////////
		  // CONQUESTS //
		  ///////////////
	 	  for (let i = 0; i < his_self.game.state.conquests.length; i++) {
		    let c = his_self.game.state.conquests[i];
		    let bonus_card = 0; if (c.bonus_prize == "bonus card") { bonus_card = 1; }
		    if (!c.prize) { c.prize = ""; }
		    if (c.round == his_self.game.state.round || ((c.prize.indexOf("Aztec") > -1 || c.prize.indexOf("Maya") > -1 || c.prize.indexOf("Inca") > -1))) {
		      active_conquests++;
		      //
		      // conquest earns bonus card
		      //
		      if (bonus_card == 1 && c.depleted != 1) {
			his_self.app.browser.addElementToSelector(this.returnRowHTML({ prize : c.prize , img : c.img , type : "conquest" , name : c.prize , faction : c.faction , conquistador : c.conquistador , total_hits : c.bonus_base_roll , depleted : 0 , bonus_card : bonus_card }, stage, true), ".new-world-overlay .content .conquests");
		      } else {
		        //
		        // conquest depleted
		        //
		        if (c.depleted) {
			  his_self.app.browser.addElementToSelector(this.returnRowHTML({ prize : c.prize , img : c.img , type : "conquest" , name : c.prize , faction : "depleted" , conquistador : c.conquistador , total_hits : c.bonus_base_roll , depleted : 1 , bonus_card : 0 }, stage, false), ".new-world-overlay .content .conquests");
		        //
		        // conquest unproductive
		        //
			} else {
		          his_self.app.browser.addElementToSelector(this.returnRowHTML({ prize : c.prize , img : c.img , type : "conquest" , name : c.prize , faction : c.faction , conquistador : c.conquistador , total_hits : c.modified_roll , depleted : 0 , bonus_card : 0 }, stage, false), ".new-world-overlay .content .conquests");
			}
		      }
		    }
		  }

		  //////////////////
		  // EXPLORATIONS //
		  //////////////////
	 	  for (let i = 0; i < his_self.game.state.explorations.length; i++) {
		    let exp = his_self.game.state.explorations[i];
		    if (exp.round == his_self.game.state.round) {
		      active_explorations++;
		      his_self.app.browser.addElementToSelector(this.returnRowHTML({ prize : exp.prize , img : exp.explorer_img , type : "exploration" , name : exp.name , faction : exp.faction , explorer : exp.explorer , total_hits : exp.modified_roll }, stage, false), ".new-world-overlay .content .explorations");
		    }
		  }

		if (active_explorations == 0) {
		  document.querySelector(".new-world-overlay .content .explorations").remove();
	        }
		if (active_conquests == 0) {
		  document.querySelector(".new-world-overlay .content .conquests").remove();
	        }
		if (active_colonies == 0) {
		  document.querySelector(".new-world-overlay .content .colonies").remove();
	        }

		if (active_colonies == 0 && active_conquests == 0 && active_explorations == 0) {
		  this.hide();
	        }
	}


	returnRowHTML(obj={}, stage="", show_hits_as_goldenrod=true) {

		if (stage === "results") {

		  let img = "";
		  let goldenrod = "";
		  let total_hits = "?";
		  let row_css = "";
		  let prize = obj.prize;
		  if (prize == 'undefined' || prize == "") { prize = "unsuccessful"; }
		  if (prize == undefined || prize == "") { prize = "unsuccessful"; }
		  if (obj.img != "") { img = `background-image:url('${obj.img}')`; }
		  if (obj.total_hits != "") { total_hits = obj.total_hits; }
		  if (obj.prize != "") { prize = obj.prize; }
		  if (obj.depleted == 1) { row_css += " killed"; }
		  if (obj.killed == 1) { row_css += " killed"; }
		  if (prize.indexOf("killed") > -1) { row_css += " killed"; }
		  if (prize.indexOf("depleted") > -1) { row_css += " killed"; }
		  if (prize.indexOf("lost at sea") > -1) { row_css += " killed"; }
		  if (obj.bonus_card == 1) { goldenrod = "goldenrod"; }
		  if (obj.goldenrod == 1) { goldenrod = "goldenrod"; }

		  if (show_hits_as_goldenrod == false) { goldenrod = ""; }

		  return `
	    	    <div class="new-world-row ${row_css}">
            	      <div class="new-world-explorer" style="${img}"></div>
            	      <div class="new-world-description"><div class="new-world-details">${prize}</div><div class="new-world-faction">${obj.faction}</div></div>
            	      <div class="new-world-roll ${goldenrod}">${total_hits}</div>
            	    </div>
		  `;
		} else {
		  return `
	    	    <div class="new-world-row ${row_css}">
            	      <div class="new-world-explorer">?</div>
            	      <div class="new-world-description"><div class="new-world-details">${obj.type}</div><div class="new-world-faction">${obj.faction}</div></div>
            	      <div class="new-world-roll ">?</div>
            	    </div>
		  `;
		}
		return "";
	}

}

module.exports = NewWorldOverlay;
