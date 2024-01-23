const WarTemplate = require('./war.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class WarOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.war = 'indopaki';
		this.overlay = new SaitoOverlay(app, mod);
	}

	render(conflict = 'indopaki', obj = null) {
		this.overlay.show(WarTemplate(conflict, obj));

		let cardimg = this.mod.returnCardImage(conflict);
		let qs = '.war-overlay .card';
		let qobj = document.querySelector(qs);

		if (qobj) {
			qobj.innerHTML = '';
			this.app.browser.addElementToSelector(cardimg, qs);
		}

		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = WarOverlay;
