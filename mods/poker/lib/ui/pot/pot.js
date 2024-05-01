const PotTemplate = require('./pot.template');

class Pot {

	constructor(app, mod) {
		this.app = app;
		this.game_mod = mod;
	}

	render() {
		if (!document.querySelector(".pot")) {
		  this.app.browser.addElementToDom(PotTemplate());
		} else {
		  this.app.browser.replaceElementBySelector(PotTemplate(), ".pot");
		}

		if (this.game_mod.game.state.pot > 0) {
		  let x = this.game_mod.formatWager(this.game_mod.game.state.pot);
                  this.app.browser.replaceElementBySelector(html, ".pot-label");
		}


		this.attachEvents();
	}

	attachEvents() {
	}

}

module.exports = Pot;

