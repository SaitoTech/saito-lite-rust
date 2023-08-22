const DeckTemplate = require('./deck.template');
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class DeckOverlay {

    constructor(app, mod){
        this.app = app;
        this.mod = mod;
        
        this.cards = null;
        this.title = null;

        this.overlay = new SaitoOverlay(app, mod);
    }
    
    render() {

	if (this.mod.game.options.deck !== "saito") { return; }

        this.overlay.show(DeckTemplate());

	let cardlist = "";
	if (this.mod.game.saito_cards_added.length > 0) { cardlist += this.mod.returnCardList(this.mod.game.saito_cards_added); }
	if (this.mod.game.saito_cards_removed.length > 0) { cardlist += this.mod.returnCardList(this.mod.game.saito_cards_removed); }

	this.app.browser.addElementToSelector(`<h1>deck updates: round ${this.mod.game.state.round}</h1>`,'.deck-overlay');
	this.app.browser.addElementToSelector(`<div class="cardlist-container cards_added">${cardlist}</div>`, '.deck-overlay');

	let child = 0;

	for (let i = 0; i < this.mod.game.saito_cards_added.length; i++) {
	  child++;
	  let qs = `.deck-overlay .cards_added .card:nth-child(${child})`;
	  if (this.mod.game.saito_cards_added_reason.length > i) {
	    this.app.browser.addElementToSelector(`<div class="desc">${this.mod.game.saito_cards_added_reason[i]}</div>`, qs);
          }
        }
	for (let i = 0; i < this.mod.game.saito_cards_removed.length; i++) {
	  child++;
	  let qs = `.deck-overlay .cards_added .card:nth-child(${child})`;
	  if (this.mod.game.saito_cards_removed_reason.length > i) {
	    this.app.browser.addElementToSelector(`<div class="desc">${this.mod.game.saito_cards_removed_reason[i]}</div>`, qs);
          }
        }

        this.attachEvents();
    }

    attachEvents(){

      document.querySelectorAll(".cardlist-container .card").forEach((el) => {

	if (el.children.length < 4) {
	  el.classList.add("custom_card_resize");
	};

	el.classList.add("noclick");
	el.onclick = (e) => {};
      });;

    }

}


module.exports = DeckOverlay;
