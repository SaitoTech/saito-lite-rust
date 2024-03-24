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

	        if (stage != "results") {

	 	  for (let i = 0; i < his_self.game.state.colonies.length; i++) {
		    let faction = his_self.game.state.colonies[i];
		    his_self.app.browser.addElementToSelector(this.returnRowHTML({ img : "" , type : "colony" , name : "unknown", faction : faction }, stage), ".new-world-overlay .content .colonies");
		  }
	 	  for (let i = 0; i < his_self.game.state.conquests.length; i++) {
		    let faction = his_self.game.state.conquests[i];
		    his_self.app.browser.addElementToSelector(this.returnRowHTML({ img : "" , type : "conquest" , name : "unknown", faction : faction }, stage), ".new-world-overlay .content .conquests");
		  }
	 	  for (let i = 0; i < his_self.game.state.explorations.length; i++) {
		    let faction = his_self.game.state.explorations[i];
		    his_self.app.browser.addElementToSelector(this.returnRowHTML({ img : "" , type : "exploration", name : "unknown", faction : faction }, stage), ".new-world-overlay .content .explorations");
		  }
		  if (his_self.game.state.events.cabot_england == 1) {
		    his_self.app.browser.addElementToSelector(this.returnRowHTML({ img : "/his/img/tiles/explorers/Cabot_English.svg" , type : "exploration" , name : "Sebastian Cabot", faction : "england" }, stage), ".new-world-overlay .content .explorations");
		  }
		  if (his_self.game.state.events.cabot_france == 1) {
		    his_self.app.browser.addElementToSelector(this.returnRowHTML({ img : "/his/img/tiles/explorers/Cabot_French.svg" , type : "exploration" , name : "Sebastian Cabot", faction : "france" }, stage), ".new-world-overlay .content .explorations");
		  }
		  if (his_self.game.state.events.cabot_hapsburg == 1) {
		    his_self.app.browser.addElementToSelector(this.returnRowHTML({ img : "/his/img/tiles/explorers/Cabot_Hapsburg.svg" , type : "exploration" , name : "Sebastian Cabot", faction : "hapsburg" }, stage), ".new-world-overlay .content .explorations");
		  }
		} else {

	 	  for (let i = 0; i < his_self.game.state.newworld.results.colonies.length; i++) {
		    let col = his_self.game.state.newworld.results.colonies[i];
		    let roll = col.roll;
		    let prize = col.name; if (col.prize) { prize = col.prize; }
		    his_self.app.browser.addElementToSelector(this.returnRowHTML({ prize : prize , img : col.img , type : "colony", name : col.type , faction : col.faction , total_hits : roll }, stage), ".new-world-overlay .content .colonies");
		  }
	 	  for (let i = 0; i < his_self.game.state.newworld.results.conquests.length; i++) {
		    let con = his_self.game.state.newworld.results.conquests[i];
		    let prize = "-"; if (con.prize) { prize = con.prize; }
		    let roll = 0;
		    if (con.type.indexOf("Aztec") > -1) { roll = his_self.game.state.newworld['aztec'].roll; }
		    if (con.type.indexOf("Inca") > -1) { roll = his_self.game.state.newworld['inca'].roll; }
		    if (con.type.indexOf("Maya") > -1) { roll = his_self.game.state.newworld['maya'].roll; }
		    if (con.idx) {
		      if (his_self.game.state.conquests[con.idx].prize === "killed by natives") {
			prize = "killed by natives";
		      }
		    }
		    his_self.app.browser.addElementToSelector(this.returnRowHTML({ prize : prize , img : con.img , type : "conquest" , name : con.type , faction : con.faction , conquistador : con.conquistador , total_hits : roll }, stage), ".new-world-overlay .content .conquests");
		  }
	 	  for (let i = 0; i < his_self.game.state.newworld.results.explorations.length; i++) {
		    let exp = his_self.game.state.newworld.results.explorations[i];
		    let prize = "-"; if (exp.prize) { prize = exp.prize; }
		    if (exp.idx > -1) {
		      if (his_self.game.state.explorations[exp.idx].prize) {
			prize = his_self.game.state.explorations[exp.idx].prize;
		      }
		    }
		    his_self.app.browser.addElementToSelector(this.returnRowHTML({ prize : prize , img : exp.img , type : "exploration" , name : exp.type , faction : exp.faction , prize : exp.prize , explorer : exp.explorer , total_hits : exp.total_hits }, stage), ".new-world-overlay .content .explorations");
		  }
	 	}

		if (his_self.game.state.newworld.results.explorations.length == 0) {
		  document.querySelector(".new-world-overlay .content .explorations").remove();
	        }
		if (his_self.game.state.newworld.results.conquests.length == 0) {
		  document.querySelector(".new-world-overlay .content .conquests").remove();
	        }
		if (his_self.game.state.newworld.results.colonies.length == 0) {
		  document.querySelector(".new-world-overlay .content .colonies").remove();
	        }
		if (his_self.game.state.newworld.results.explorations.length == 0 && his_self.game.state.newworld.results.conquests.length == 0 && his_self.game.state.newworld.results.colonies.length == 0) {
		  this.hide();
	        }
	}


	returnRowHTML(obj={}, stage="") {

		if (stage === "results") {
		  let img = "";
		  let total_hits = "?";
		  let prize = obj.prize;
		  if (prize == 'undefined' || prize == "") { prize = "unsuccessful"; }
		  if (prize == undefined || prize == "") { prize = "unsuccessful"; }
		  if (obj.img != "") { img = `background-image:url('${obj.img}')`; }
		  if (obj.total_hits != "") { total_hits = obj.total_hits; }
		  if (obj.prize != "") { prize = obj.prize; }

		  let goldenrod = "";
 		  if (prize.length > 3 && prize.indexOf("lost") == -1 && prize.indexOf("killed") == -1) {
		    goldenrod = "goldenrod";
		  }

		  return `
	    	    <div class="new-world-row">
            	      <div class="new-world-explorer" style="${img}"></div>
            	      <div class="new-world-description"><div class="new-world-details">${prize}</div><div class="new-world-faction">${obj.faction}</div></div>
            	      <div class="new-world-roll ${goldenrod}">${total_hits}</div>
            	    </div>
		  `;
		} else {
		  return `
	    	    <div class="new-world-row">
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
