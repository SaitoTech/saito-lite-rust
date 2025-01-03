const GameScoreboardTemplate = require('./game-scoreboard.template');

/**
 *
 */
class GameScoreBoard {
	/**
	 *  @constructor
	 *  @param app - Saito app
	 *  @param game_mod - the game object
	 */
	constructor(app, game_mod) {
		this.app = app;
		this.game_mod = game_mod;
	}

	/**
	 * Add scoreboard to screen
	 */
	render() {
		if (!this.game_mod.browser_active) {
			return;
		}

		if (!document.querySelector('#game-scoreboard')) {
			this.app.browser.addElementAfterSelector(GameScoreboardTemplate(), "#game-menu");
			this.attachEvents();
		}
	}

	/**
	 * No functionality, display only component
	 */
	attachEvents() {}

	update(html, callback = null) {
		console.log("********** update scoreboard **********");
		this.render();
		let scoreboard = document.querySelector('#game-scoreboard');
		if (scoreboard) {
			scoreboard.innerHTML = html;
			if (callback) {
				callback();
			}
		}
	}

	append(html, callback = null) {
		this.render(this.app);
		let scoreboard = document.querySelector('#game-scoreboard');
		if (scoreboard) {
			scoreboard.innerHTML += html;
			if (callback) {
				callback();
			}
		}
	}
}

module.exports = GameScoreBoard;
