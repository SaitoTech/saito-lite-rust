const ShopOverlayTemplate = require('./shop.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ShopOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod);
	}

	render(title = "", max = 0) {
		this.overlay.show(ShopOverlayTemplate(this.mod, title));
		if (max){
			this.filterBoardDisplay(max);
		}

		this.mod.cardbox.render();
		$("#game-cardbox").appendTo(".card-preview");
		this.mod.attachCardboxEvents();
	}

	attachEvents() {}



	buyCard(title, max, optional, callback = null){

		this.overlay.closebox = optional;
		this.render(title, max);

		if (!callback){
			return;
		}

		if (!optional){
			this.overlay.blockClose();
		}else{
			this.overlay.callback_on_close = async () => {
				let c = await sconfirm("Are you sure you don't want a card?");

				if (c){
					this.mod.game.state.buys = -1;
					this.mod.endTurn();
					this.hide(); // reset overlay state
				}else{
					this.buyCard(title, max, optional, callback);
				}
			}
		}

		document.querySelectorAll(".shop-overlay .cardpile.buyme").forEach(card => {
			card.onclick = (e) => {
				card_id = e.currentTarget.id;
				console.log(card_id);
				callback(card_id);
				this.hide();
			}
		});
	}

  filterBoardDisplay(max){
    for (let c in this.mod.game.state.supply){
      if (c !== "curse"){
        if (this.mod.deck[c].cost > max || this.mod.game.state.supply[c] <= 0){
          $(`#${c}.cardpile img`).css("filter","brightness(0.45) grayscale(100%)");
        }else{
          $(`#${c}.cardpile img`).css("filter","brightness(0.95)");
          $(`#${c}.cardpile`).addClass("buyme");
        }
      }
    }
  }


  hide() {
  	//
  	// Get rid of the overlay without running any callbacks!
  	//
  	this.overlay.remove();
  	this.overlay.closebox = true;
  	this.overlay.callback_on_close = null;
  }

}

module.exports = ShopOverlay;
