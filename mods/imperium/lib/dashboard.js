const ImperiumDashboardTemplate = require('./dashboard.template');

class Dashboard {
	constructor(app, mod, container = '', pnum = 0) {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.pnum = pnum;
	}

	render(agenda_phase = 0) {
		let myqs = this.container + ` .dash-faction.p${this.pnum}`;

		console.log('rendering agenda into: ' + myqs);

		if (document.querySelector(myqs)) {
			console.log('A for : ' + this.pnum);
			this.app.browser.replaceElementBySelector(
				ImperiumDashboardTemplate(
					this.mod,
					this.pnum - 1,
					agenda_phase
				),
				myqs
			);
		} else {
			if (this.container == '') {
				console.log('B for : ' + this.pnum);
				this.app.browser.addElementToDom(
					ImperiumDashboardTemplate(
						this.mod,
						this.pnum - 1,
						agenda_phase
					)
				);
			} else {
				console.log('C for : ' + this.pnum + ' --- ' + this.container);
				this.app.browser.addElementToSelector(
					ImperiumDashboardTemplate(
						this.mod,
						this.pnum - 1,
						agenda_phase
					),
					this.container
				);
			}
		}
	}
}

module.exports = Dashboard;
