const ArcadeMainTemplate = require('./main.template');

class ArcadeMain {

	constructor(app, mod, container) {
		this.app = app;
		this.mod = mod;
		this.container = container;
	}

	render() {

		if (document.querySelector('.saito-arcade-container') != null) {
			document.addElementToSelector(ArcadeMainTemplate(this.app, this.mod), '.saito-arcade-container');
		} else {

			if (container != "") {
				document.addElementToSelector(ArcadeMainTemplate(this.app, this.mod), container);
			} else {
				document.addElementToDom(ArcadeMainTemplate(this.app, this.mod));
			}
		}

		this.attachEvents();
	}	

	attachEvents() {

	}
}

module.exports = ArcadeMain;