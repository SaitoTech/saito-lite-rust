const CardfanTemplate = require('./cardfan.template');
const SaitoCardfan = require('./../../../../../lib/saito/ui/game-cardfan/game-cardfan');

class Cardfan {

	constructor(app, mod) {
		this.app = app;
		this.game_mod = mod;
		this.saito_cardfan = new SaitoCardfan(app, mod);
	}

	hide() {
	}

	render() {

		if (!document.querySelector(".cardfan")) {
		  this.app.browser.addElementToSelector(CardfanTemplate(), '.mystuff');
		} else {
		  this.app.browser.replaceElementBySelector(CardfanTemplate(), ".cardfan");
		}
		this.attachEvents();

		this.saito_cardfan.render();

	}

	attachEvents() {
	  this.saito_cardfan.attachEvents();
	}

	show() {
	  this.saito_cardfan.show();
	}

	hide() {
	  this.saito_cardfan.hide();
	}

	addClass(classname) {
	  this.saito_cardfan.addClass(classname);
	}

	removeClass(classname) {
	  this.saito_cardfan.removeClass(classname);
	}

	addCard(html) {
	  this.saito_cardfan.addCard(html);
	}

	prependCard(html) {
	  this.saito_cardfan.prependCard(html);
	}

}

module.exports = Cardfan;

