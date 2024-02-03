const VPTemplate = require('./vp.template');
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class VPOverlay {

    constructor(app, mod){
        this.app = app;
        this.mod = mod;
	this.visible = false;
        this.overlay = new SaitoOverlay(app, mod);
    }
 
    pullHudOverOverlay() {
      let overlay_zindex = parseInt(this.overlay.zIndex);
      if (document.querySelector(".hud")) {
        document.querySelector(".hud").zIndex = overlay_zindex+1;
        this.mod.hud.zIndex = overlay_zindex+1;
      }
    }

    pushHudUnderOverlay() {
      let overlay_zindex = parseInt(this.overlay.zIndex);
      if (document.querySelector(".hud")) {
        document.querySelector(".hud").zIndex = overlay_zindex-2;
        this.mod.hud.zIndex = overlay_zindex-2;
      }
    }
  
    hide() {
        this.visible = false;
        this.overlay.hide();
    }
    render() {

	this.visible = true;
        this.overlay.show(VPTemplate());

	this.pushHudUnderOverlay();

	let vp = this.mod.calculateVictoryPoints();
	let factions = [];
	for (let f in vp) { factions.push(f); }

	let html = '';
        for (let z = 0; z < factions.length; z++) {
  	  html = `<div class="desc">${this.mod.returnFactionName(factions[z]).replace(" Empire", "")}</div>`;
	  this.app.browser.addElementToSelector(html, ".factions");
          for (let i = 0; i < 9; i++) {
	    if (this.mod.game.state.vp.length > i) {
	      let vp = "";
	      if (this.mod.game.state.vp[i][factions[z]]) {
	        vp = this.mod.game.state.vp[i][factions[z]];
	      }
	      if (vp == "" && this.mod.game.state.round > i) { vp = 0; }
  	      html = `<div class="round round${(i+1)}">${vp}</div>`;
	    } else {
  	      html = `<div class="round round${(i+1)}desc"></div>`;
	    }
	    this.app.browser.addElementToSelector(html, ".factions");
	  }
	}

        this.app.browser.addElementToSelector("Victory at 25 VP", '.vp-overlay .help');
	if (this.mod.game.state.round <= 4) {
          this.app.browser.addElementToSelector("Protestants must be within 8 VP of the Papacy by the end of Round 4", '.vp-overlay .advice');
	}
	if (this.mod.game.state.round > 4) {    
          this.app.browser.addElementToSelector("Instant win with 8 VP difference in points");
	}

	this.pullHudOverOverlay();

    }

}

module.exports = VPOverlay;

