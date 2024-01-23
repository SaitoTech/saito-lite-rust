const BoardTemplate = require('./board.template');

class ShogunBoard {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
	}

	render() {
		if (document.querySelector('.shogun-board')) {
			this.app.browser.replaceElementBySelector(
				BoardTemplate(),
				'.shogun-board'
			);
		} else {
			this.app.browser.addElementToSelector(
				BoardTemplate(),
				this.container
			);
		}

		this.renderCardPile();
		this.renderDrawPile();
		this.renderDiscardPile();

		this.attachEvents();
	}

	renderCardPile() {
		if (this.mod.game.deck.length == 0) {
			return;
		}

		document.querySelector('.cardpile').innerHTML = '';

		for (let c in this.mod.game.state.supply) {
			if (c !== 'curse') {
				if (this.mod.game.state.supply[c] > 0) {
					html = `
	    <div class="cardpile showcard" id="${c}">
              <div class="card_count">${this.mod.game.state.supply[c]}</div>
                ${this.mod.returnCardImage(c, false)}
              </div>
            </div>
	   `;
					this.app.browser.addElementToSelector(html, '.cardpile');
				} else {
					html = `
	      <div class="cardpile showcard" id="${c}">
                No more ${this.mod.cardToText(c, true)}
              </div>
	    `;
					this.app.browser.addElementToSelector(html, '.cardpile');
				}
			}
		}
	}

	renderDiscardPile() {
		if (this.mod.game.deck.length == 0) {
			return;
		}

		discardhtml = `<div id="discardpile" class="cardpile">
                <div>Discards: ${
	Object.keys(
		this.mod.game.deck[this.mod.game.player - 1].discards
	).length
}</div>`;
		let shift = 0;
		for (let card in this.mod.game.deck[this.mod.game.player - 1]
			.discards) {
			let c = this.mod.game.deck[this.mod.game.player - 1].discards[card];
			discardhtml += `<img src="${this.mod.card_img_dir}/${this.mod.deck[c].img}">`;
			shift++;
		}
		discardhtml += `</div>`;

		this.app.browser.addElementToSelector(discardhtml, '.discard-pile');
	}

	renderDrawPile() {
		if (this.mod.game.deck.length == 0) {
			return;
		}

		let drawhtml = `<div id="drawpile" class="cardpile">
                    <div>Draw: ${
	this.mod.game.deck[this.mod.game.player - 1].crypt
		.length
}</div>`;
		for (
			let i = 0;
			i < this.mod.game.deck[this.mod.game.player - 1].crypt.length;
			i++
		) {
			if (
				this.mod.game.deck[this.mod.game.player - 1].crypt.length - i <=
				5
			) {
				drawhtml += `<img id="draw${
					this.mod.game.deck[this.mod.game.player - 1].crypt.length -
					i
				}" src="${this.mod.card_img_dir}/blank.jpg" >`;
			} else {
				drawhtml += `<img src="${this.mod.card_img_dir}/blank.jpg" >`;
			}
		}
		drawhtml += `</div>`;

		this.app.browser.addElementToSelector(drawhtml, '.draw-pile');
	}

	attachEvents() {
		alert('attaching events!');

		document.querySelector('.shogun-board .coins').onclick = (e) => {
			this.mod.coins_overlay.render();
		};

		document.querySelector('.shogun-board .estates').onclick = (e) => {
			this.mod.estates_overlay.render();
		};

		document.querySelector('.shogun-board .cardpile').onclick = (e) => {
			this.mod.cardpile_overlay.render();
		};
	}
}

module.exports = ShogunBoard;
