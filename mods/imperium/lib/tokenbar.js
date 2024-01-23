const ImperiumTokenBarTemplate = require('./tokenbar.template');

class TokenBar {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
	}

	render(player) {
		let myqs = this.container + ' .tokenbar';

		let ct = this.mod.game.state.players_info[player - 1].command_tokens;
		let st = this.mod.game.state.players_info[player - 1].strategy_tokens;
		let fs = this.mod.game.state.players_info[player - 1].fleet_supply;

		if (document.querySelector(myqs)) {
			this.app.browser.replaceElementBySelector(
				ImperiumTokenBarTemplate(ct, st, fs),
				myqs
			);
		} else {
			this.app.browser.addElementToSelector(
				ImperiumTokenBarTemplate(ct, st, fs),
				this.container
			);
		}

		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = TokenBar;
