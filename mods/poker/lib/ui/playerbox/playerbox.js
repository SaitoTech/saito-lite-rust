const PlayerboxTemplate = require('./playerbox.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class GameBoard {

	/**
	 * @param app - the Saito application
	 * @param mod - reference to the game module
	 */
	constructor(app, mod) {
		this.app = app;
		this.game_mod = mod;
                this.overlay = new SaitoOverlay(this.app, this.game_mod);
	}

	render() {
		this.app.browser.addElementToDom(PlayerboxTemplate());
		this.attachEvents();
	}

	attachEvents() {
	}

}

module.exports = GameBoard;

