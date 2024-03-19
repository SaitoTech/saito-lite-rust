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
		  this.app.browser.addElementToSelector(`<div class="factionbar-faction ${f}" id="${f}">${f}</div>`, '.factionbar');
		}

		this.visible = true;

		this.attachEvents();

	}

	attachEvents() {

		let his_self = this.mod;

		for (let i = 0; i < his_self.game.state.players_info[his_self.game.player-1].factions.length; i++) {
			let f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
			document.querySelector(`.factionbar-faction.${f}`).onclick = (e) => {
				let f = e.currentTarget.id;
        			if (his_self.returnPlayerOfFaction(f) === his_self.game.player) {
          				let fhand_idx = his_self.returnFactionHandIdx(his_self.game.player, f);
          				let c = his_self.game.deck[0].fhand[fhand_idx];
          				his_self.deck_overlay.render("hand", c);
          				return;
				}
			}
		}
	}

}

module.exports = FactionBarOverlay;
