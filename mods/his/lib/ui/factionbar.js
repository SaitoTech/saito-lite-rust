const FactionBarTemplate = require('./factionbar.template');

class FactionBarOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
	}

	render(faction = '') {

		if (this.mod.game.state.players_info[this.mod.game.player-1].factions.length == 1) { return; }
	 	if (this.visible) { return; }

		let his_self = this.mod;

		this.app.browser.addElementToSelector(FactionBarTemplate());
		for (let i = 0; i < his_self.game.state.players_info[his_self.game.player-1].factions.length; i++) {
		  let f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
		  this.app.browser.addElementToSelector(`<div class="factionbar-faction ${f}">${f}</div>`, '.factionbar');
		}

		this.visible = true;

		this.attachEvents();

	}

	attachEvents() {}

}

module.exports = FactionBarOverlay;
