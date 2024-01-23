const LanguageZoneTemplate = require('./language-zone.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class LanguageZoneOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod);
	}

	hide() {
		this.visible = false;
		this.overlay.hide();
	}

	render(mycallback = null) {
		this.visible = true;
		this.overlay.show(LanguageZoneTemplate());
		this.attachEvents(mycallback);
	}

	attachEvents(mycallback = null) {
		let lzo = this;

		let obj = document.querySelector('.language-zone-overlay');
		if (!obj) {
			return;
		}

		if (obj.querySelector('.english')) {
			obj.querySelector('.english').click = (e) => {
				lzo.hide();
				if (mycallback) {
					mycallback('english');
				}
			};
		}
		if (obj.querySelector('.french')) {
			obj.querySelector('.french').click = (e) => {
				lzo.hide();
				if (mycallback) {
					mycallback('french');
				}
			};
		}
		if (obj.querySelector('.german')) {
			obj.querySelector('.german').click = (e) => {
				lzo.hide();
				if (mycallback) {
					mycallback('germany');
				}
			};
		}
		if (obj.querySelector('.italian')) {
			obj.querySelector('.italian').click = (e) => {
				lzo.hide();
				if (mycallback) {
					mycallback('italian');
				}
			};
		}
		if (obj.querySelector('.spanish')) {
			obj.querySelector('.spanish').click = (e) => {
				lzo.hide();
				if (mycallback) {
					mycallback('spanish');
				}
			};
		}
	}
}

module.exports = LanguageZoneOverlay;
