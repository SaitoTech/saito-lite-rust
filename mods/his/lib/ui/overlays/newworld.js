const NewWorldTemplate = require('./newworld.template');
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class NewWorldOverlay {

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
  
    render() {

	this.visible = true;
        this.overlay.show(NewWorldTemplate());

    }


}

module.exports = NewWorldOverlay;

