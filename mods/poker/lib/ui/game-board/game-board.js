const GameBoardTemplate = require('./game-board.template');

class GameBoard {

	/**
	 * @param app - the Saito application
	 * @param mod - reference to the game module
	 */
	constructor(app, mod) {
		this.app = app;
		this.game_mod = mod;
	}

	render() {

		if (!document.querySelector(".gameboard")) {
		  this.app.browser.addElementToDom(GameBoardTemplate());
		  this.attachEvents();
		}


		this.game_mod.playerbox.render();
		this.game_mod.cardfan.render();
		this.game_mod.stack.render();
		this.game_mod.pot.render();

	}

	attachEvents() {
	}

}

module.exports = GameBoard;

