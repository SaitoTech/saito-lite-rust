const GameCardStackTemplate = require("./game-cardstack.template");

class GameCardStack {
	constructor(app, mod, uuid) {
		this.app = app;
		this.mod = mod;

		this.orientation = "down"; // or up, left, right, center
		this.card_width = 120; // px
		this.card_height_ratio = 1.53;

		// We duplicate the internal game storage of the card stack
		this.cards = [];

		// A ratio for determinining what fraction of the card width/height is covered by the next card 
		this.overlap = 6;

		// A flag specifying whether only the top card is "visible" or should we apply filter to every card in the stack
		this.top_card_only = true;

		/*
		 * It is strongly recommended that game modules use a grid layout and 
		 * carefully manage the position of the card stacks on the game board
		 */
		this.container = ".cardstack-container";

		/*
		 * Since there are often going to be multiple card stacks, we need a unique name
		 */
		this.name = uuid;
	}

	render() {
		let selector = `cardstack_${this.name}`;
		if (document.getElementById(selector)) {
			this.app.browser.replaceElementById(GameCardStackTemplate(this), selector);
		} else {
			this.app.browser.addElementToSelector(GameCardStackTemplate(this), this.container);
		}
	}

	attachEvents() {}



	push(card, rerender = true) {
		this.cards.push(card);
		if (rerender) {
			this.render();
		}
	}

	pop(rerender = true) {
		let card = "";
		if (this.cards.length > 0) {
			card = this.cards.pop();
		}

		if (rerender) {
			this.render();
		}

		return card;
	}

	/**
	 *  The game mod should pass a test function returning true or false
	 *  Any card for which the value is true will have cs-selectable added to its class list
	 *  and the specified callback added as a click event
	 * 
	 *  The test function passes card_name and the game-cardstack class as parameters, since
	 *  this class includes a reference to the game module, any data or functions native to 
	 *  the game module are readily accessible without worrying about *this*
	 * 
	 *  The callback passes the game-cardstack class and the index of the card which was selected
	 * 
	 */
	applyFilter(test = null, callback = null) {
		this.removeFilter();
		
		let added_filter = 0;

		if (!test || !callback) {
			console.warn("Applying null filter");
			return;
		}

		//Special case for empty stacks (placement, yo!)
		if (this.cards.length == 0) {
			if (test("empty", this, this.mod)) {
				let card_obj = document.getElementById(`cardstack_${this.name}_empty`);
				if (card_obj){
					card_obj.classList.add("cs-selectable");
					card_obj.onclick = () => {
						callback(this, -1);
					}
				}else{
					console.warn(`cardstack_${this.name} not rendered!`);
				}
			
				added_filter++;
			}
		} else {

			//Normal card selection or processing
			let i = (this.top_card_only) ? this.cards.length - 1 : 0;
			
			for (; i < this.cards.length; i++){
				if (test(this.cards[i], this, this.mod)){
					let card_obj = document.getElementById(`cardstack_${this.name}_${i}`);
					if (card_obj){
						let card_index = i;
						card_obj.classList.add("cs-selectable");
						card_obj.onclick = () => {
							callback(this, card_index);
						}
						added_filter++;
					}else{
						console.warn(`cardstack_${this.name}_${i} not rendered!`);
					}
				}
			}

		}

		return added_filter;

	}

	removeFilter() {
		let card_objs = document.querySelectorAll(`#cardstack_${this.name} .card-slot`);
		for (let card of card_objs) {
			card.classList.remove("cs-selectable");
			card.classList.remove("cs-selected");
			card.onclick = null;
		}

		let stack_obj = document.getElementById(`cardstack_${this.name}`);
		if (stack_obj){
			stack_obj.classList.remove("cs-selectable");
			stack_obj.classList.remove("cs-selected");
			stack_obj.onclick = null;
		}

	}

	markSelected(card_index = -1) {
		if (card_index < 0){
			let card_objs = document.querySelectorAll(`#cardstack_${this.name} .card-slot`);
			for (let card of card_objs) {
				card.classList.add("cs-selected");
			}
		} else{
			for (let i = card_index; i < this.cards.length; i++) {
				let card_obj = document.querySelector(`#cardstack_${this.name}_${i}`);
				if (card_obj){
					card_obj.classList.add("cs-selected");
				}	
			}
		}
	}

	clear() {
		this.cards = [];
		this.initialized = false;
	}
}

module.exports = GameCardStack;
