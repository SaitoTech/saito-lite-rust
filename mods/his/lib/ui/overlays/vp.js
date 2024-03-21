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
        try { document.querySelector(".acknowledge").click(); } catch (err) {}
        this.overlay.hide();
    }
    render() {

	this.visible = true;
        this.overlay.show(VPTemplate());

	this.pushHudUnderOverlay();

	let vp = this.mod.calculateVictoryPoints();
	let factions = [];
	for (let f in vp) { factions.push(f); }
	let ordered_factions = ["ottoman","hapsburg","england","france","protestant","papacy"];

	let html = '';
        for (let z = 0; z < ordered_factions.length; z++) {
	  if (factions.includes(ordered_factions[z])) {
    	    html = `<div class="desc">${this.mod.returnFactionName(ordered_factions[z]).replace(" Empire", "")}</div>`;
	    this.app.browser.addElementToSelector(html, ".factions");
            for (let i = 0; i < 9; i++) {
	      if (this.mod.game.state.vp.length > i) {
	        let vp = "";
	        if (this.mod.game.state.vp[i][ordered_factions[z]]) {
	          vp = this.mod.game.state.vp[i][ordered_factions[z]];
	        }
	        if (vp == "" && this.mod.game.state.round > i) { vp = 0; }
  	        html = `<div class="round round${(i+1)}">${vp}</div>`;
	      } else {
  	        html = `<div class="round round${(i+1)}desc"></div>`;
	      }
	      this.app.browser.addElementToSelector(html, ".factions");
	    }
	  }
	}

        this.app.browser.addElementToSelector("Victory at 25 VP", '.vp-overlay .help');
	if (this.mod.game.players.length == 2) {
	  if (this.mod.game.state.round <= 4) {
            this.app.browser.addElementToSelector("Protestants should be within 8 VP of the Papacy by Round 5", '.vp-overlay .advice');
	  }
	  if (this.mod.game.state.round > 4) {    
            this.app.browser.addElementToSelector("Instant win with 8 VP difference in points");
	  }
	} else {
          this.app.browser.addElementToSelector("check your Faction Sheet for auto-win conditions...", '.vp-overlay .advice');
	}

	this.pullHudOverOverlay();

	this.attachEvents();
    }

    attachEvents() {
      try {
	document.querySelector(".vp-overlay").onclick = (e) => {
	  this.hide();
	};
      } catch (err) {
      }
    }

}

module.exports = VPOverlay;

