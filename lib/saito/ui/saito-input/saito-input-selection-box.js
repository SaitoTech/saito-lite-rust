const SaitoInputSelectionBoxTemplate = require('./saito-input-selection-box.template');
const SaitoUser = require('./../saito-user/saito-user');

class SaitoInputSelectionBox {

	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = ""; // add straight to DOM
		this.is_visible = false;
	}

	hide() {
		this.is_visible = false;

		if (document.querySelector('.saito-input-selection-box')) {
			document.querySelector('.saito-input-selection-box').remove();
		}
	}

	render() {
		this.is_visible = true;

		if (!document.querySelector(".saito-input-selection-box")) {
			this.app.browser.addElementToDom(SaitoInputSelectionBox());
		}

	}

	attachEvents() {

	}

}
module.exports = SaitoInputSelectionBox;



