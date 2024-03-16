const ShopOverlayTemplate = require('./shop.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ShopOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, true, false);

	}

	render(title = "", max = 0) {

		$(".shop").removeClass("pay-attention");
		if (this.overlay.callback_on_close){
			this.overlay.show(null, this.overlay.callback_on_close);
		}else{
			this.overlay.show(ShopOverlayTemplate(this.mod, title));	
		}
		
		if (max){
			this.filterBoardDisplay(max);
		}

		this.attachEvents();

		this.mod.cardbox.render();
		$("#game-cardbox").appendTo(".card-preview");
		this.mod.attachCardboxEvents();
	}

	attachEvents() {

	}



	buyCard(title, max, optional, callback = null){

		this.overlay.closebox = optional;
		this.render(title, max);

		if (!callback){
			return;
		}

		if (!optional){
			this.overlay.blockClose();
		}else{
	
			if (document.querySelector(".no-purchase")){
				document.querySelector(".no-purchase").onclick = async (e) => {
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
			this.overlay.callback_on_close = () => {
				$(".shop").addClass("pay-attention");
				this.overlay.hide();
			}
		}

		// Less than elegant, but it should work...
		this.mod.cardbox.removeCardType("buyme");
    this.mod.cardbox.addCardType("buyme", "buy", (card_id) => {
				console.log(card_id);
				callback(card_id);
				this.hide();
		});

		this.mod.attachCardboxEvents();
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
