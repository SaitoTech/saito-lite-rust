const CardfanTemplate = require('./cardfan.template');

class Cardfan {

	constructor(app, mod) {
		this.app = app;
		this.game_mod = mod;
	}

	hide() {
	}

	render() {
		if (!document.querySelector(".cardfan")) {
		  this.app.browser.addElementToDom(CardfanTemplate());
		} else {
		  this.app.browser.replaceElementBySelector(CardfanTemplate(), ".cardfan");
		}
		this.attachEvents();
	}

	attachEvents() {
	}

}

module.exports = Cardfan;

