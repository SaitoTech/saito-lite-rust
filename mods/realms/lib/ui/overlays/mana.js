const ManaTemplate = require('./mana.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ManaOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);
	}

	render(player = 0) {
		if (player == 0) {
			player = this.mod.game.player;
		}

		this.overlay.show(ManaTemplate());

		for (
			let i = 0;
			i < this.mod.game.state.players_info[player - 1].mana.length;
			i++
		) {
			this.app.browser.addElementToSelector(
				this.deck[
					this.mod.game.state.players_info[player - 1].mana[i].key
				].returnCardImage(),
				'.mana-overlay'
			);
		}

		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = ManaOverlay;
