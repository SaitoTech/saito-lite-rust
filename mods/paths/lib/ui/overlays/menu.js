const MenuTemplate = require('./menu.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class MenuOverlay {
	constructor(app, mod, c1, c2, c3) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod, true, false, false);
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

	render(player, faction) {

		let his_self = this.mod;
		this.overlay.show(MenuTemplate());

		this.pushHudUnderOverlay();

		let html = `
	      		<div id="ops" class="menu-option-container card">
	        		<div class="menu-option-image">
	        			<img src="/paths/img/backgrounds/menu/combat.png" />
	        		</div>
	        		<div class="menu-option-title">Movement / Combat</div>
	      		</div>
	      		<div id="sr" class="menu-option-container card">
	        		<div class="menu-option-image">
	        			<img src="/paths/img/backgrounds/menu/redeployment.png" />
	        		</div>
	        		<div class="menu-option-title">Strategic Redeployment</div>
	      		</div>
	      		<div id="rp" class="menu-option-container card">
	        		<div class="menu-option-image">
	        			<img src="/paths/img/backgrounds/replacement.png" />
	        		</div>
	        		<div class="menu-option-title">Replacement Points</div>
	      		</div>
	      		<div id="event" class="menu-option-container card">
	        		<div class="menu-option-image">
	        			<img src="/paths/img/backgrounds/event.png" />
	        		</div>
	        		<div class="menu-option-title">Card Event</div>
	      		</div>
	  	`;

		this.app.browser.addElementToSelector(html, `.menu`);
		this.attachEvents();

	}

	attachEvents() {}
}

module.exports = MenuOverlay;
