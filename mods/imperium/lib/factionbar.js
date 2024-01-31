const ImperiumFactionBarTemplate = require('./factionbar.template');

class FactionBar {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
	}

	render(player) {
		let myqs = this.container + ' .factionbar';

		if (document.querySelector(myqs)) {
			this.app.browser.replaceElementBySelector(
				ImperiumFactionBarTemplate(),
				myqs
			);
		} else {
			this.app.browser.addElementToSelector(
				ImperiumFactionBarTemplate(),
				this.container
			);
		}

		let playercol = 'player_color_' + this.mod.game.player;
		this.app.browser.addElementToSelector(
			`<div class="player_color_box ${playercol}"></div><div class="sf-readable">${this.mod.returnFaction(
				this.mod.game.player
			)}</div>`,
			'.factionbar'
		);

		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = FactionBar;
