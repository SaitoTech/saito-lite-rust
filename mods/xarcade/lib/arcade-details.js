const ArcadeDetailsTemplate = require('./arcade-details.template');

class ArcadeDetails {

	constructor(app, mod, container = "") {
		this.app = app;
		this.mod = mod;
		this.container = container;
	}

	render() {

		if (document.querySelector('.arcade-details-box') != null) {
			this.app.browser.addElementToSelector(ArcadeDetailsTemplate(this.app, this.mod), '.saito-arcade-menu');
		} else {

			if (this.container != "") {
				this.app.browser.addElementToSelector(ArcadeDetailsTemplate(this.app, this.mod), this.container);
			} else {
				this.app.browser.addElementToDom(ArcadeDetailsTemplate(this.app, this.mod));
			}
		}

		this.attachEvents();
	}	

	attachEvents() {

	}
}

module.exports = ArcadeDetails;