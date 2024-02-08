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

	 	for (let i = 0; i < his_self.game.state.colonies.length; i++) {
		  let faction = his_self.game.state.colonies[i];
		  his_self.app.browser.addElementToSelector(this.returnRowHTML({ name : "unknown", faction : faction }), ".new-world-overlay .content .colonies");
		}
	 	for (let i = 0; i < his_self.game.state.conquests.length; i++) {
		  let faction = his_self.game.state.conquests[i];
		  his_self.app.browser.addElementToSelector(this.returnRowHTML({ name : "unknown", faction : faction }), ".new-world-overlay .content .conquests");
		}
	 	for (let i = 0; i < his_self.game.state.explorations.length; i++) {
		  let faction = his_self.game.state.explorations[i];
		  his_self.app.browser.addElementToSelector(this.returnRowHTML({ name : "unknown", faction : faction }), ".new-world-overlay .content .explorations");
		}

		if (his_self.game.state.events.cabot_england == 1) {
		  his_self.app.browser.addElementToSelector(this.returnRowHTML({ name : "Sebastian Cabot", faction : "england" }), ".new-world-overlay .content .explorations");
		}
		if (his_self.game.state.events.cabot_france == 1) {
		  his_self.app.browser.addElementToSelector(this.returnRowHTML({ name : "Sebastian Cabot", faction : "france" }), ".new-world-overlay .content .explorations");
		}
		if (his_self.game.state.events.cabot_hapsburg == 1) {
		  his_self.app.browser.addElementToSelector(this.returnRowHTML({ name : "Sebastian Cabot", faction : "hapsburg" }), ".new-world-overlay .content .explorations");
		}


	}

	returnRowHTML(obj={}) {
		let html = `
	    	    <div class="new-world-row">
            	      <div class="new-world-explorer">?</div>
            	      <div class="new-world-description"><div class="new-world-details">${obj.name}</div><div class="new-world-faction">${obj.faction}</div></div>
            	      <div class="new-world-roll ">?</div>
            	    </div>
		`;
		return html;
	}

}

module.exports = NewWorldOverlay;
