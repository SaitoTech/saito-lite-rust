const CardTemplate = require('./card.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class CardOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod, false, true, true);
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

	//obj = {player, card: cardname}
	render(obj={}) {

		let settlers_self = this.mod;

		let player = obj.player;
		let cardname = obj.card;
		let card;

		for (let i = 0; i < this.mod.deck.length; i++) {
			if (this.mod.deck[i].card === cardname) {
				card = this.mod.deck[i];
				break;
			}
		}

		if (!card){
			console.error("Card not found", cardname);
			return;
		}

		if (!obj?.cardtext){
			let cardtext = card.text.toLowerCase();
			if (player == this.mod.game.player){
				cardtext = "You" + cardtext.replace("earns", "earn").replace("moves", "move").replace("is", "are");
			}else{
				cardtext = this.mod.game.playerNames[player - 1] + cardtext;
			}

			card.cardtext = cardtext;
		}else{
			card.cardtext = obj.cardtext;
		}

		this.overlay.show(CardTemplate(card));

		document.querySelector('.cardover').style.setProperty('--settlers-cardimg', `url(${card.img})`);

		// this will clear any ACKNOWLEDGE
		this.attachEvents();

	}

	attachEvents() {

		let settlers_self = this.mod;
	    $(".cardover-optout").on('click', function () {
	    	console.log("!!!!!");
          	settlers_self.saveGamePreference("settlers_overlays", 0);
	    });

	}

}

module.exports = CardOverlay;
