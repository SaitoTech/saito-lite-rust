const CardTemplate = require('./card.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class CardOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod, false, false, true);
	}

	hide() {
		this.overlay.close();
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

		let settlers_self = this.mod;

		let player = obj.player;
		let cardname = obj.card;
		let cardimg = "";
		let cardtitle = new String("");
		let cardtext = new String("");

		for (let i = 0; i < this.mod.game.deck[0].cards.length; i++) {
			if (this.mod.game.deck[0].cards[i].card === cardname) {
				cardimg = this.mod.game.deck[0].cards[i].img;
				if (this.mod.game.deck[0].cards[i].title) { cardtitle = this.mod.game.deck[0].cards[i].title; }
				if (this.mod.game.deck[0].cards[i].text) { cardtext = this.mod.game.deck[0].cards[i].text; }

			}
		}

		cardtitle = cardtitle.replace("Player ", `Player ${player} `);
		cardtext = cardtext.replace("Player ", `Player ${player} `);

		this.overlay.show(CardTemplate(""));
		this.pushHudUnderOverlay();
		this.overlay.pullOverlayToFront();

		if (cardtitle) { document.querySelector('.cardover-title').innerHTML = cardtitle; }
		if (cardtext)  { document.querySelector('.cardover-text').innerHTML  = cardtext; }
		if (cardimg)   { document.querySelector('.cardover').style.setProperty('--settlers-cardimg', `url(${cardimg})`); }
		if (obj.img)   { document.querySelector('.cardover').style.backgroundImage = `url(${obj.img})`; }
		if (obj.card)  { settlers_self.app.browser.addElementToSelector(`<div class="cardover-cardover"><img src="${cardimg}" /><div>`, '.cardover'); }
		if (obj.styles){ 
		  for (let z = 0; z < obj.styles.length; z++) { 
		    let s = obj.styles[z];
		    document.querySelector('.cardover').style[s.key] = s.val; 
		  }
		}
		let overlay_zindex = parseInt(this.overlay.zIndex);
		document.querySelector('.cardover').style["zIndex"] = overlay_zindex;
		document.querySelector('.cardover').style["display"] = "block";

		// this will clear any ACKNOWLEDGE
		this.attachEvents();

	}

	attachEvents() {}

}

module.exports = CardOverlay;
