const ImperiumDashboardManagerTemplate = require('./dashboard-manager.template');
const ImperiumDashboard = require('./dashboard');

class DashboardManager {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.factions = [];
		this.container = container;
	}

	render(agenda_phase = 0) {
		console.log('creating Dashboard Manager 2');

		let myqs = this.container + ' .imperium-dashboard';

		if (document.querySelector(myqs)) {
			this.app.browser.replaceElementBySelector(
				ImperiumDashboardManagerTemplate(this.mod, agenda_phase),
				myqs
			);
		} else {
			if (this.container == '') {
				this.app.browser.addElementToDom(
					ImperiumDashboardManagerTemplate(this.mod, agenda_phase)
				);
			} else {
				this.app.browser.addElementToSelector(
					ImperiumDashboardManagerTemplate(this.mod, agenda_phase),
					this.container
				);
			}
		}

		console.log('done creating Dashboard Manager 2');

		//
		// now insert factions
		//
		if (this.factions.length < this.mod.game.players.length) {
			this.factions = [];
			for (let i = 0; i < this.mod.game.players.length; i++) {
				this.factions.push(
					new ImperiumDashboard(this.app, this.mod, myqs, i + 1)
				);
			}
		}

		//
		// and render factions
		//
		for (let i = 0; i < this.factions.length; i++) {
			this.factions[i].render(agenda_phase);
		}

		console.log('rendered: ' + this.factions.length);

		this.attachEvents(agenda_phase);
	}

	attachEvents() {}
}

module.exports = DashboardManager;
