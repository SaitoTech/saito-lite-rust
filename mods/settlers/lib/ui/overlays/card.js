const CardTemplate = require('./card.template');

class CardOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
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


		settlers_self.hud.showPopup(CardTemplate(card), 3500);
			
		// this will clear any ACKNOWLEDGE
		this.attachEvents();

	}

	attachEvents() {

	}

}

module.exports = CardOverlay;
