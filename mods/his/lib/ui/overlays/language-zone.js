const LanguageZoneTemplate = require('./language-zone.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class LanguageZoneOverlay {
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

	render(mycallback = null) {
		this.visible = true;
		this.overlay.show(LanguageZoneTemplate());
		this.attachEvents(mycallback);
	}

	attachEvents(mycallback = null) {
		let lzo = this;

		let obj = document.querySelector('.language-zone-overlay');
		if (!obj) {
			return;
		}

		if (obj.querySelector('.english')) {
			obj.querySelector('.english').click = (e) => {
				lzo.hide();
				if (mycallback) {
					mycallback('english');
				}
			};
		}
		if (obj.querySelector('.french')) {
			obj.querySelector('.french').click = (e) => {
				lzo.hide();
				if (mycallback) {
					mycallback('french');
				}
			};
		}
		if (obj.querySelector('.german')) {
			obj.querySelector('.german').click = (e) => {
				lzo.hide();
				if (mycallback) {
					mycallback('germany');
				}
			};
		}
		if (obj.querySelector('.italian')) {
			obj.querySelector('.italian').click = (e) => {
				lzo.hide();
				if (mycallback) {
					mycallback('italian');
				}
			};
		}
		if (obj.querySelector('.spanish')) {
			obj.querySelector('.spanish').click = (e) => {
				lzo.hide();
				if (mycallback) {
					mycallback('spanish');
				}
			};
		}
	}

	showDebaters(language_zone="german", committed="uncommitted", faction="protestant") {

                let his_self = this.mod;

		let obj = document.querySelector(".language-zone-overlay .debaters");
		if (obj) { obj.innerHTML = ""; obj.style.display = "flex"; }

                for (let i = 0; i < his_self.game.state.debaters.length; i++) {

			if (his_self.game.state.debaters[i].faction == faction) {
	                        if (committed == "committed" && his_self.game.state.debaters[i].committed == 1) {
        	                	this.app.browser.addElementToSelector(
                	                	`<div class="debaters-tile debaters-tile${i} debater-commited" data-key="${his_self.game.state.debaters[i].key}" data-id="${his_self.game.state.debaters[i].img}" style="background-image:url('/his/img/tiles/debaters/${his_self.game.state.debaters[i].img}')"></div>`,
                        	        	'.language-zone-overlay .debaters' 
                        		);
                        	}
                       		if (committed == "uncommitted" && his_self.game.state.debaters[i].committed != 1) {
                        		this.app.browser.addElementToSelector(
                        	        	`<div class="debaters-tile debaters-tile${i}" data-key="${his_self.game.state.debaters[i].key}" data-id="${his_self.game.state.debaters[i].img}" style="background-image:url('/his/img/tiles/debaters/${his_self.game.state.debaters[i].img}')"></div>`,
                        	        	'.language-zone-overlay .debaters' 
                        		);
				}
                	}
                }
              
	}

	hideDebaters() {
		let obj = document.querySelector(".language-zone-overlay .debaters");
		if (obj) { obj.style.display = "none"; }
	}

}

module.exports = LanguageZoneOverlay;
