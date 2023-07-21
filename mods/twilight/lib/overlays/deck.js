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

        this.overlay.show(DeckTemplate());

	if (this.mod.game.saito_cards_added.length > 0) {
	  this.app.browser.addElementToSelector(`
		<h1>added</h1>
		<div class="cardlist-container cards_added">${this.mod.returnCardList(this.mod.game.saito_cards_added)}</div>
	  `, '.deck-overlay');
	}

	if (this.mod.game.saito_cards_removed.length > 0) {
	  this.app.browser.addElementToSelector(`
		<h1>removed</h1>
		<div class="cardlist-container cards_removed">${this.mod.returnCardList(this.mod.game.saito_cards_removed)}</div>
	  `, '.deck-overlay');
	}

	for (let i = 0; i < this.mod.game.saito_cards_added.length; i++) {
	  let qs = `.deck-overlay .cards_added .card:nth-child(${i+1})`;
	  if (this.mod.game.saito_cards_added_reason.length > i) {
	    this.app.browser.addElementToSelector(`
	      <div class="desc">${this.mod.game.saito_cards_added_reason[i]}</div> 
	    `, qs);
          }
        }
	for (let i = 0; i < this.mod.game.saito_cards_removed.length; i++) {
	  let qs = `.deck-overlay .cards_removed .card:nth-child(${i+1})`;
	  if (this.mod.game.saito_cards_removed_reason.length > i) {
	    this.app.browser.addElementToSelector(`
	      <div class="desc">${this.mod.game.saito_cards_removed_reason[i]}</div> 
	    `, qs);
          }
        }

        this.attachEvents();
    }

    attachEvents(){
    }

}


module.exports = DeckOverlay;
