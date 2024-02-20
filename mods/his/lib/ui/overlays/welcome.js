const WelcomeTemplate = require('./welcome.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class WelcomeOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod, false, true, true);
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

	render(faction = '') {
		let his_self = this.mod;

		this.overlay.show(WelcomeTemplate(faction));
		this.pushHudUnderOverlay();

		// PAPACY
		if (faction === 'papacy') {
			document.querySelector(
				'.welcome-title'
			).innerHTML = `You are the Papacy`;
			document.querySelector(
				'.welcome-text'
			).innerHTML = `Since God has given us the Papacy, let us enjoy it.`;
		}

		// PROTESTANT
		if (faction === 'protestant') {
			document.querySelector(
				'.welcome-title'
			).innerHTML = `You are the Protestants`;
			document.querySelector('.welcome-text').innerHTML = `
			  The Saxon princes are weak and divided.
			  <p></p>
			  But from their gentle shelter,
			  <p></p>
			  Great Oaks may yet spread across Europe...
			`;
		}

		// OTTOMAN
		if (faction === 'ottoman') {
			document.querySelector(
				'.welcome-title'
			).innerHTML = `You are the Turks`;
			document.querySelector('.welcome-text').innerHTML = `
			  "If we will not learn out of the Scriptures, we must learn out of the Turk’s scabbard..."
			  </br>-- <i>Martin Luther</i>
			`;
		}

		// ENGLAND
		if (faction === 'england') {
			document.querySelector(
				'.welcome-title'
			).innerHTML = `You are England`;
			document.querySelector('.welcome-text').innerHTML = `
			  This fortress built by Nature for herself </br> Against infection and the hand of war, 
			`;
		}


		// FRANCE
		if (faction === 'france') {
			document.querySelector(
				'.welcome-title'
			).innerHTML = `You are the French`;
			document.querySelector('.welcome-text').innerHTML = `
			  The French are wiser than they seem...
			  </br>
			  <i>-- Francis Bacon</i>
			`;
		}


		// HAPSBURGS
		if (faction === 'hapsburg') {
			document.querySelector(
				'.welcome-title'
			).innerHTML = `You are the Hapsburg Dynasty`;
			document.querySelector('.welcome-text').innerHTML = `
			  El imperio donde nunca se pone el sol...
			`;
		}



		this.attachEvents();
	}

	attachEvents() {
		let his_self = this.mod;

		$('.welcome').on('click', function () {
			if (document.querySelector('.option')) {
				$('.option').click();
			}
		});
	}
}

module.exports = WelcomeOverlay;
