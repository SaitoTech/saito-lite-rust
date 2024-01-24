const CardTemplate = require('./card.template');

class Card {
	constructor(app, mod, cardname, container = '') {
		this.app = app;
		this.mod = mod;
		this.card = this.mod.deck[cardname];
	}

	render() {
		let myqs = this.container + ` .card.${cardname}`;
		if (document.querySelector(myqs)) {
			this.app.browser.replaceElementBySelector(CardTemplate(), myqs);
		} else {
			if (this.container == '') {
				this.app.browser.addElementToDom(CardTemplate());
			} else {
				this.app.browser.addElementToSelector(
					CardTemplate(),
					this.container
				);
			}
		}
	}
}

module.exports = Card;
