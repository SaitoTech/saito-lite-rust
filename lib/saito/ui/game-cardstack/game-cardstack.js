const GameCardStackTemplate = require('./game-cardstack.template');

class GameCardStack {
	constructor(app, mod, uuid) {
		this.app = app;
		this.mod = mod;

		this.orientation = 'down'; // or up, left, right, center
		this.card_width = 120; // px
		this.card_height_ratio = 1.53;

		// We duplicate the internal game storage of the card stack
		this.cards = [];

		// A ratio for determinining what fraction of the card width/height is covered by the next card
		this.overlap = 6;

		/*
		 * It is strongly recommended that game modules use a grid layout and
		 * carefully manage the position of the card stacks on the game board
		 */
		this.container = '.cardstack-container';

		/*
		 * Since there are often going to be multiple card stacks, we need a unique name
		 */
		this.name = uuid;
	}

	render() {
		let selector = `cardstack_${this.name}`;

		if (document.getElementById(selector)) {
			//Update card_width... this allows dynamic css card sizing
			let card_obj = document.querySelector(
				`#cardstack_${this.name} .card-slot`
			);
			if (card_obj) {
				this.card_width = Math.round(
					card_obj.getBoundingClientRect().width
				);
			}
			this.app.browser.replaceElementById(
				GameCardStackTemplate(this),
				selector
			);
		} else {
			this.app.browser.addElementToSelector(
				GameCardStackTemplate(this),
				this.container
			);
		}

		if (this.cards.length == 0) {
			return;
		}

		//If we have cards to stack let's do some math to figure out how to space them out smartly

		let container_obj = document.getElementById(`cardstack_${this.name}`);
		let container = container_obj.getBoundingClientRect();

		let index = 0;
		let cum_shift = 0;
		let face = '';
		let shift = '';
		let html = '';
		let gap = this.card_width / this.overlap;

		let num_face_down = 0;

		for (let card of this.cards) {
			if (this.mod.isFaceDown(card)) {
				num_face_down++;
			}
		}

		num_face_down = Math.max(0, num_face_down - 1);

		if (this.orientation == 'left' || this.orientation == 'right') {
			if (
				container.width <
				(this.cards.length - 1) * gap + this.card_width
			) {
				gap = Math.ceil(
					(container.width - this.card_width) /
						(this.cards.length - 1)
				);
				console.log(
					'Container: ' + container.width,
					'Cards: ' + this.cards.length,
					'New Gap: ' + gap
				);
			}
		} else if (this.orientation == 'up' || this.orientation == 'down') {
			let card_height = this.card_width * this.card_height_ratio;
			gap = Math.ceil(gap * this.card_height_ratio);

			let needed_height =
				(num_face_down * gap) / 4 +
				(this.cards.length - num_face_down - 2) * gap +
				card_height;

			if (container.height < needed_height) {
				//console.log("num cards: " + this.cards.length, "facedown: " + num_face_down);
				//console.log("Container: " + container.height, "Needed: " + needed_height);

				gap =
					(container.height - card_height) /
					(this.cards.length - num_face_down - 1 + num_face_down / 4);
				//console.log("New Gap: " + gap);
			}
		}

		gap = Math.max(gap, 4);

		for (let card of this.cards) {
			if (face == 'faceup') {
				cum_shift += gap;
			} else if (face == 'facedown') {
				cum_shift += gap / 4;
			} else {
				cum_shift = 0;
			}

			//This test is for how much we shift the next card...
			face = this.mod.isFaceDown(card) ? 'facedown' : 'faceup';

			if (this.orientation == 'left') {
				shift = `right:${cum_shift}px;`;
			} else if (this.orientation == 'right') {
				shift = `left:${cum_shift}px;`;
			} else if (this.orientation == 'up') {
				shift = `bottom:${cum_shift}px;`;
			} else if (this.orientation == 'down') {
				shift = `top:${cum_shift}px;`;
			}

			html += `<div id="cardstack_${this.name}_${index}" 
                  class="card-slot ${face}" 
                  style="z-index:${index};${shift}">${this.mod.returnCardImageHTML(
	card
)}</div>`;
			index++;
		}
		container_obj.innerHTML = html;
	}

	attachEvents() {}

	push(card, rerender = true) {
		if (!card) {
			console.warn('Pushing undefined card to stack');
			console.trace();
		}
		this.cards.push(card);
		if (rerender) {
			this.render();
		}
	}

	pop(rerender = true) {
		let card = '';
		if (this.cards.length > 0) {
			card = this.cards.pop();
		}

		if (rerender) {
			this.render();
		}

		return card;
	}

	getCardCount() {
		return this.cards.length;
	}

	getTopCardElement() {
		if (this.cards.length > 0) {
			return document.getElementById(
				`cardstack_${this.name}_${this.cards.length - 1}`
			);
		}

		return document.getElementById(`cardstack_${this.name}_empty`);
	}

	getTopCardValue() {
		if (this.cards.length > 0) {
			return this.cards[this.cards.length - 1];
		}
		return null;
	}

	/**
	 *  The game mod should pass a test function returning true or false
	 *  Any card for which the value is true will have cs-selectable added to its class list
	 *  and the specified callback added as a click event
	 *
	 *  The test function passes index of card and the game-cardstack class as parameters, since
	 *  this class includes a reference to the game module, any data or functions native to
	 *  the game module are readily accessible without worrying about *this*
	 *
	 *  The callback passes the game-cardstack class and the index of the card which was selected
	 *
	 */
	applyFilter(test = null, callback = null, top_card_only = true) {
		//this.removeFilter();
		this.render();

		let added_filter = 0;

		if (!test || !callback) {
			console.warn('Applying null filter');
			return;
		}

		//Special case for empty stacks (placement, yo!)
		if (this.cards.length == 0) {
			if (test(-1, this)) {
				let card_obj = document.getElementById(
					`cardstack_${this.name}_empty`
				);
				if (card_obj) {
					card_obj.classList.add('cs-selectable');
					card_obj.onclick = (e) => {
						callback(this, -1, e);
					};
				} else {
					console.warn(`cardstack_${this.name}_empty not rendered!`);
				}

				added_filter++;
			}
		} else {
			//Normal card selection or processing
			let i = top_card_only ? this.cards.length - 1 : 0;
			for (; i < this.cards.length; i++) {
				if (test(i, this)) {
					let card_obj = document.getElementById(
						`cardstack_${this.name}_${i}`
					);
					if (card_obj) {
						let card_index = i;
						card_obj.classList.add('cs-selectable');
						card_obj.onclick = (e) => {
							callback(this, card_index, e);
						};
						added_filter++;
					} else {
						console.warn(
							`cardstack_${this.name}_${i} not rendered!`
						);
					}
				}
			}
		}

		return added_filter;
	}

	removeFilter() {
		let card_objs = document.querySelectorAll(
			`#cardstack_${this.name} .card-slot`
		);
		for (let card of card_objs) {
			card.classList.remove('cs-selectable');
			card.classList.remove('cs-selected');
			card.onclick = null;
		}

		let stack_obj = document.getElementById(`cardstack_${this.name}`);
		if (stack_obj) {
			stack_obj.classList.remove('cs-selectable');
			stack_obj.classList.remove('cs-selected');
			stack_obj.onclick = null;
		}
	}

	markSelected(card_index = -1) {
		if (card_index < 0) {
			let card_objs = document.querySelectorAll(
				`#cardstack_${this.name} .card-slot`
			);
			for (let card of card_objs) {
				card.classList.add('cs-selected');
			}
		} else {
			for (let i = card_index; i < this.cards.length; i++) {
				let card_obj = document.querySelector(
					`#cardstack_${this.name}_${i}`
				);
				if (card_obj) {
					card_obj.classList.add('cs-selected');
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
