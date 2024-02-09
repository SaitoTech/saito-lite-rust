const SaitoInputContactListTemplate = require('./saito-input-contact-list.template');
const SaitoUser = require('./../saito-user/saito-user');

class SaitoInputContactList {

	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.keys = [];
	}

	hide() {

	}

	render() {

		//
		// add or empty outside container
		//
		if (!document.querySelector(`${this.container} .saito-input-contacts`) {
			this.app.browser.addElementToSelector(SaitoInputContactsTemplate(), this.container);
		}} else {
			document.querySelector(`${this.container} .saito-input-contacts`).innerHTML = "";
		}

		//
		// now add the keys
		//
		for (let key in this.keys) {
			
		}
	}

	attachEvents() {

	}

}

module.exports = SaitoInputContactList;

