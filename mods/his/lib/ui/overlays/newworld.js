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
		this.overlay.show(NewWorldTemplate());

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
		    his_self.app.browser.addElementToSelector(this.returnRowHTML({ img : "" , type : "exploration" , name : "Sebastian Cabot", faction : "england" }, stage), ".new-world-overlay .content .explorations");
		  }
		  if (his_self.game.state.events.cabot_france == 1) {
		    his_self.app.browser.addElementToSelector(this.returnRowHTML({ img : "" , type : "exploration" , name : "Sebastian Cabot", faction : "france" }, stage), ".new-world-overlay .content .explorations");
		  }
		  if (his_self.game.state.events.cabot_hapsburg == 1) {
		    his_self.app.browser.addElementToSelector(this.returnRowHTML({ img : "" , type : "exploration" , name : "Sebastian Cabot", faction : "hapsburg" }, stage), ".new-world-overlay .content .explorations");
		  }
		} else {

	 	  for (let i = 0; i < his_self.game.state.newworld.results.colonies.length; i++) {
		    let col = his_self.game.state.newworld.results.colonies[i];
console.log("COLONY");
console.log(JSON.stringify(col));
		    his_self.app.browser.addElementToSelector(this.returnRowHTML({ img : "" , type : "colony", name : col.name , faction : col.faction }), ".new-world-overlay .content .colonies");
		  }
	 	  for (let i = 0; i < his_self.game.state.newworld.results.conquests.length; i++) {
		    let con = his_self.game.state.newworld.results.conquests[i];
console.log("CONQUEST");
console.log(JSON.stringify(con));
		    his_self.app.browser.addElementToSelector(this.returnRowHTML({ img : "" , type : "conquest" , name : con.name , faction : con.faction , conquistador : con.conquistador , total_hits : con.total_hits }, stage), ".new-world-overlay .content .conquests");
		  }
	 	  for (let i = 0; i < his_self.game.state.newworld.results.explorations.length; i++) {
		    let exp = his_self.game.state.newworld.results.explorations[i];
console.log("EXPLORATION");
console.log(JSON.stringify(exp));
		    his_self.app.browser.addElementToSelector(this.returnRowHTML({ img : "" , type : "exploration" , name : exp.name , faction : exp.faction , explorer : exp.explorer , total_hits : exp.total_hits }, stage), ".new-world-overlay .content .explorations");
		  }

	 	}


	}


	returnRowHTML(obj={}, stage="") {
		if (stage === "results") {
		  return `
	    	    <div class="new-world-row">
            	      <div class="new-world-explorer">?</div>
            	      <div class="new-world-description"><div class="new-world-details">${obj.type}</div><div class="new-world-faction">${obj.faction}</div></div>
            	      <div class="new-world-roll ">?</div>
            	    </div>
		  `;
		} else {
		  let img = "";
		  if (obj.img != "") { img = `backgroundImage:url('${obj.img}')`; }
		  return `
	    	    <div class="new-world-row">
            	      <div class="new-world-explorer" style="${img}"></div>
            	      <div class="new-world-description"><div class="new-world-details">${obj.name}</div><div class="new-world-faction">${obj.faction}</div></div>
            	      <div class="new-world-roll ">?</div>
            	    </div>
		  `;
		}
		return "";
	}

}

module.exports = NewWorldOverlay;
