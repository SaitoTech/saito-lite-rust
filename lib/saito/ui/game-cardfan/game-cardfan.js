const GameCardfanTemplate = require('./game-cardfan.template');

/**
 * GameCardFan is a tool for displaying a hand of cards, fanned out so all the cards are overlapping but visible
 * The main utility is in the css for fanning the cards out in a visually pleasing layout, which can also be accessed by just using the "cardfan" class in the container of "card"-classed items
 * cardFan is included by default in gameTemplate and is accessible through .cardfan in the inheriting game module
 * cardFan should only be rendered when needed and only one card fan can exist on the screen at a time.
 * The Game module should provide detailed html for the cards to be displayed in the fan, otherwise by default render
 * makes strong assumptions about the data structure of your game module
 *
 */
class GameCardfan {
	/**
	 * @constructor stores a reference to the Saito app
	 * @param app - the Saito application
	 * @param mod - the game module
	 */
	constructor(app, mod) {
		this.app = app;
		this.game_mod = mod;
		this.container = '';
		this.el = null;
	}

	/**
	 * Adds a cardfan div to the DOM if it does not already exist and populates it with the
	 * provided card html. If no card html is provided, card fan queries the hand in deck one
	 * and creates an html template assuming card images are in the directory specified in mod.card_img_dir
	 * and appropriately named (when creating the deck)
	 */
	render(cards_html = '') {
		if (!this.game_mod.gameBrowserActive()) {
			return;
		}
		if (!this.game_mod.game.player){
			return;
		}

		try {
			if (!document.getElementById('cardfan')) {
				if (this.container) {
					this.app.browser.addElementToSelector(GameCardfanTemplate(), this.container);
				} else {
					this.app.browser.addElementToDom(GameCardfanTemplate());
				}
				this.attachEvents();
			}

			this.el = document.getElementById('cardfan');

			if (cards_html === '') {
				let { cards, hand } = this.game_mod.game.deck[0];

				let cards_in_hand = hand.map((key) => cards[key]);
				cards_html = cards_in_hand
					.map((card) => `<img class="card" src="${this.game_mod.card_img_dir}/${card.name}">`)
					.join('');
			}

			if (cards_html) {
				this.el.innerHTML = cards_html;
			}
			
			this.el.style.display = 'block';
		} catch (err) {}
	}

	/**
	 * Makes the cardFan draggable
	 */
	attachEvents() {
		//if (!this.container) {
			this.app.browser.makeDraggable('cardfan');
		//}
	}

	//** Show the card fan */
	show() {
		try {
			if (this.el){
				this.el.style.display = 'block';
			}
		} catch (err) {
			console.error(err);
		}
	}

	//** Hide the card fan */
	hide() {
		try {
			if (this.el){
				this.el.style.display = 'none';	
			}
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * Sets a class name for the cardFan to facilitate customization of display
	 * @param classname {string} - the class name
	 */
	addClass(classname) {
		try {
			if (this.el && !this.el.classList.contains(classname)) {
				this.el.classList.add(classname);
			}
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * Removes a class name for the cardFan to facilitate customization of display
	 * @param classname {string} - the class name
	 */
	removeClass(classname) {
		try {
			if (this.el && this.el.classList.contains(classname)) {
				this.el.classList.remove(classname);
			}
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * Inserts the html for a single card into the start of the fan (left side)
	 * @param app - the Saito application
	 * @param mod - the game module
	 * @param cards_html - html specification of the card to be addedf
	 */
	prependCard(cards_html = '') {
		if (cards_html !== '') {

			if (this.el) {
				this.el.innerHTML = cards_html + fan.innerHTML;
			}
		}
	}

	/**
	 * Inserts the html for a single card into the end of the fan (right side)
	 * @param app - the Saito application
	 * @param mod - the game module
	 * @param cards_html - html specification of the card to be addedf
	 */
	addCard(cards_html = '') {
		if (cards_html !== '') {
			if (this.el) {
				this.el.innerHTML += cards_html;
			}
		}
	}
}

module.exports = GameCardfan;
