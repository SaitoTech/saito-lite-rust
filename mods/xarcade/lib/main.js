const ArcadeMainTemplate = require('./main.template');

class ArcadeMain {

	constructor(app, mod, container = "") {
		this.app = app;
		this.mod = mod;
		this.container = container;
	}

	render() {

		if (document.querySelector('.saito-arcade-container') != null) {
			this.app.browser.addElementToSelector(ArcadeMainTemplate(this.app, this.mod), '.saito-arcade-container');
		} else {

			if (this.container != "") {
				this.app.browser.addElementToSelector(ArcadeMainTemplate(this.app, this.mod), this.container);
			} else {
				this.app.browser.addElementToDom(ArcadeMainTemplate(this.app, this.mod));
			}
		}

		this.attachEvents();
	}	

	attachEvents() {

	}
}

module.exports = ArcadeMain;