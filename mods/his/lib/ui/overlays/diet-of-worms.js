const DietOfWormsTemplate = require('./diet-of-worms.template');
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class DietOfWormsOverlay {

    constructor(app, mod){
        this.app = app;
        this.mod = mod;
	this.visible = false;
        this.overlay = new SaitoOverlay(app, mod);
    }

    hide() {
        this.visible = false;
        this.overlay.hide();
    }
   
    render() {
	this.visible = true;
        this.overlay.show(DietOfWormsTemplate());

	//
	// my cards
	//
	let cardlist = this.mod.returnCardList(this.mod.game.deck[0].fhand[0]);
console.log("render cardlist: " + cardlist);
	this.app.browser.addElementToSelector(cardlist, ".diet-overlay .cardlist");
	

        this.attachEvents();
    }

    attachEvents(){
    }

}

module.exports = DietOfWormsOverlay;

