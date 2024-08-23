const CardTemplate = require('./welcome.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class CardOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod, false, false, true);
	}

	hide() {
		this.overlay.hide();
	}

	pullHudOverOverlay() {
		//
		// pull GAME HUD over overlay
		//
		let overlay_zindex = parseInt(this.overlay.zIndex);
		if (document.querySelector('.hud')) {
			document.querySelector('.hud').style.zIndex = overlay_zindex + 1;
			this.mod.hud.zIndex = overlay_zindex + 1;
		}
	}
	pushHudUnderOverlay() {
		//
		// push GAME HUD under overlay
		//
		let overlay_zindex = parseInt(this.overlay.zIndex);
		if (document.querySelector('.hud')) {
			document.querySelector('.hud').style.zIndex = overlay_zindex - 2;
			this.mod.hud.zIndex = overlay_zindex - 2;
		}
	}

	render(obj={}) {

		let his_self = this.mod;

	    	if (document.querySelector(".winter")) {
        	  this.overlay.zIndex = his_self.winter_overlay.overlay.zIndex + 2;
    		}

		this.overlay.show(CardTemplate(""));
		this.pushHudUnderOverlay();
		this.overlay.pullOverlayToFront();

		if (obj.title) { document.querySelector('.welcome-title').innerHTML = obj.title; }
		if (obj.text)  { document.querySelector('.welcome-text').innerHTML  = obj.text; }
		if (obj.img)   { document.querySelector('.welcome').style.backgroundImage = `url(${obj.img})`; }
		if (obj.card)  { his_self.app.browser.addElementToSelector(`<div class="welcome-card">${his_self.returnCardImage(obj.card)}<div>`, '.welcome'); }
		if (obj.styles){ 
		  for (let z = 0; z < obj.styles.length; z++) { 
		    let s = obj.styles[z];
		    document.querySelector('.welcome').style[s.key] = s.val; 
		  }
		}
		let overlay_zindex = parseInt(this.overlay.zIndex);
		document.querySelector('.welcome').style["zIndex"] = overlay_zindex;
		document.querySelector('.welcome').style["display"] = "block";

		// this will clear any ACKNOWLEDGE
		this.attachEvents();

	}

	attachEvents() {

		let his_self = this.mod;

// this clears acknowledge if exists
/****
		$('.welcome').on('click', () => {
			// don't hide() AND removeOnClose
			//this.hide();
			  	if (document.querySelector('.option.acknowledge')) {
					document.querySelector('.option.acknowledge').click();
			  	}
		});
		$('.saito-overlay:has(> .welcome) + .saito-overlay-backdrop').on('click', () => {
			//this.hide();
				if (document.querySelector('.option.acknowledge')) {
					document.querySelector('.option.acknowledge').click();
				}
		});
****/

	}
}

module.exports = CardOverlay;
