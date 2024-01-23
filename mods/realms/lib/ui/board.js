const BoardTemplate = require('./board.template');

class Board {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
	}

	render() {
		let realms_self = this.mod;

		let me = realms_self.game.player;
		let opponent = 1;
		if (me == 1) {
			opponent = 2;
		}

		//
		// refresh board
		//
		let myqs = this.container + ` .board`;
		if (document.querySelector(myqs)) {
			this.app.browser.replaceElementBySelector(BoardTemplate(), myqs);
		} else {
			if (this.container == '') {
				this.app.browser.addElementToDom(BoardTemplate());
			} else {
				this.app.browser.addElementToSelector(
					BoardTemplate(),
					this.container
				);
			}
		}

		//
		// put opponent cards on table
		//
		for (
			let i = 0;
			i < realms_self.game.state.players_info[opponent - 1].cards.length;
			i++
		) {
			let cobj =
				realms_self.game.state.players_info[opponent - 1].cards[i];
			let card = realms_self.deck[cobj.key];

			if (cobj.type == 'land') {
				this.app.browser.addElementToSelector(
					realms_self.deck[cobj.key].returnCardImage(),
					'.opponent .mana'
				);
			}

			if (cobj.type == 'creature') {
				this.app.browser.addElementToSelector(
					realms_self.deck[cobj.key].returnCardImage(),
					'.opponent .creatures'
				);
			}

			if (cobj.type == 'artifact') {
				this.app.browser.addElementToSelector(
					realms_self.deck[cobj.key].returnCardImage(),
					'.opponent .artifacts'
				);
			}
		}

		//
		// put my cards on table
		//
		for (
			let i = 0;
			i < realms_self.game.state.players_info[me - 1].cards.length;
			i++
		) {
			let cobj = realms_self.game.state.players_info[me - 1].cards[i];
			let card = realms_self.deck[cobj.key];

			if (cobj.type == 'land') {
				this.app.browser.addElementToSelector(
					realms_self.deck[card.key].returnCardImage(),
					'.me .mana'
				);
			}

			if (cobj.type == 'creature') {
				this.app.browser.addElementToSelector(
					realms_self.deck[card.key].returnCardImage(),
					'.me .creatures'
				);
			}

			if (cobj.type == 'artifact') {
				this.app.browser.addElementToSelector(
					realms_self.deck[card.key].returnCardImage(),
					'.me .artifacts'
				);
			}
		}
	}
}

module.exports = Board;
