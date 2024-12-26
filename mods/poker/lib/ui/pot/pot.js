const PotTemplate = require('./pot.template');

class Pot {

	constructor(app, mod) {
		this.app = app;
		this.game_mod = mod;
		this.pot_counter = mod.crypto || 'CHIPS';
	}

	render() {
		let pot = 0;
		for (let i = 0; i < this.game_mod.game.state.player_pot.length; i++) {
		  pot += this.game_mod.game.state.player_pot[i];
        }

		if (!document.querySelector(".pot")) {
		  this.app.browser.addElementToDom(PotTemplate(pot, this.pot_counter));
		} else {
		  this.app.browser.replaceElementBySelector(PotTemplate(pot, this.pot_counter), ".pot");
		}

		this.attachEvents();
	}

	attachEvents() {
	}

}

module.exports = Pot;

