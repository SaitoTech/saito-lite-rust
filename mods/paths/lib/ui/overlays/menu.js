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

	render(player, faction, card="") {

		let paths_self = this.mod;
		let c = {};

		if (card == "") {
		  c.sr = 0;
		  c.rp = 0;
		} else {
		  let deck = paths_self.returnDeck();
		  c = deck[card];
		}

		this.overlay.show(MenuTemplate());

		this.pushHudUnderOverlay();

		let html = `
	      		<div id="ops" class="menu-option-container card menu_movement">
	        		<div class="menu-option-title">Movement / Combat</div>
	      		</div>
	      	`;

		if (c.sr && paths_self.canPlayStrategicRedeployment(faction)) {
			html += `
			<div id="sr" class="menu-option-container card menu_redeployment">
	        		<div class="menu-option-title">Strategic Redeployment</div>
	      		</div>
			`;
		}

    		if (c.rp && paths_self.canPlayReinforcementPoints(faction)) {
			html += `
	      		<div id="rp" class="menu-option-container card menu_replacement">
	        		<div class="menu-option-title">Replacement Points</div>
	      		</div>
			`;
		}

		let can_event_card = false;
		this.mod.game.state.player_turn_card_select = true;
    		try { can_event_card = c.canEvent(this.mod, faction); } catch (err) {}
	 	if (c.cc) { can_event_card = false; }
		this.mod.game.state.player_turn_card_select = false;
    		if (can_event_card) {
			html += `
	      			<div id="event" class="menu-option-container card menu_event">
	        			<div class="menu-option-title">Card Event</div>
	      			</div>
	  		`;
		}

		this.app.browser.addElementToSelector(html, `.menu`);
		this.attachEvents();

	}

	attachEvents() {}
}

module.exports = MenuOverlay;
