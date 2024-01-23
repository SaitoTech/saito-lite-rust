const LeaderboardTemplate = require('./leaderboard.template');

class Leaderboard {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
	}

	render() {
		let myqs = this.container + ' .leaderboard';

		if (document.querySelector(myqs)) {
			this.app.browser.replaceElementBySelector(
				LeaderboardTemplate(this.mod),
				myqs
			);
		} else {
			this.app.browser.addElementToDom(
				LeaderboardTemplate(this.mod),
				this.container
			);
		}

		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = Leaderboard;
