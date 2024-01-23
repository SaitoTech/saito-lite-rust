const RoundTemplate = require('./round.template');

class Round {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
	}

	render() {
		let myqs = this.container + ' .turns';

		if (document.querySelector(myqs)) {
			this.app.browser.replaceElementBySelector(
				RoundTemplate(
					this.mod.game.state.round,
					this.mod.game.state.turn
				),
				myqs
			);
		} else {
			this.app.browser.addElementToSelector(
				RoundTemplate(
					this.mod.game.state.round,
					this.mod.game.state.turn
				),
				myqs
			);
		}

		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = Round;
