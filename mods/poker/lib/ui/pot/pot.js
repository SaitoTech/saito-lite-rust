const PotTemplate = require('./pot.template');

class Pot {

	constructor(app, mod) {
		this.app = app;
		this.game_mod = mod;
	}

	render() {
		let pot = 0;
		for (let i = 0; i < this.game_mod.game.state.player_pot.length; i++) {
		  pot += this.game_mod.game.state.player_pot[i];
        }

		if (!document.querySelector(".pot")) {
		  this.app.browser.addElementToDom(PotTemplate(`${pot} CHIPS`));
		} else {
		  this.app.browser.replaceElementBySelector(PotTemplate(`${pot} CHIPS`), ".pot");
		}

		this.attachEvents();
	}

	attachEvents() {
	}

}

module.exports = Pot;

