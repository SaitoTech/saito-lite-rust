const ImperiumUnitTemplate = require('./unit.template');

class Unit {
	constructor(app, mod, unit = '', container = '') {
		this.app = app;
		this.mod = mod;
		this.unit = unit;
		this.container = container;
	}

	render(unit) {
		let myqs = this.container + ' .unit';

		if (document.querySelector(myqs)) {
			this.app.browser.replaceElementBySelector(
				ImperiumUnitTemplate(),
				myqs
			);
		} else {
			this.app.browser.addElementToSelector(
				ImperiumUnitTemplate(),
				this.container
			);
		}

		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = Unit;
