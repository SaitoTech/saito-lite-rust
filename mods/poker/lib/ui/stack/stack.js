const StackTemplate = require('./stack.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class Stack {

	/**
	 * @param app - the Saito application
	 * @param mod - reference to the game module
	 */
	constructor(app, mod) {
		this.app = app;
		this.game_mod = mod;
	}

	render() {
		if (!document.querySelector(".stack")) {
		  this.app.browser.addElementToDom(StackTemplate());
		} else {
		  this.app.browser.replaceElementBySelector(StackTemplate(), ".stack");
		}
		this.attachEvents();

		let player = this.game_mod.game.player;
                let credit = this.game_mod.game.state.player_credit[player - 1]; 
                let userline = `${this.game_mod.returnPlayerRole(player)}<div class="saito-balance">${this.game_mod.formatWager(credit)}</div>`;
                this.game_mod.playerbox.renderUserline(userline, player); 
	}

	attachEvents() {
	}

}

module.exports = Stack;

