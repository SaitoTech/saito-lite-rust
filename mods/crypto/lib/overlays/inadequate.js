const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const CryptoInadequateTemplate = require('./inadequate.template');

class CryptoInadequate {
	constructor(app, mod, mycallback = null) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);
		this.callback = mycallback;
	}

	render(mycallback = null) {
		if (mycallback != null) {
			this.callback = mycallback;
		}
		this.overlay.show(CryptoInadequateTemplate(this.app, this.mod));
		this.attachEvents(this.callback);
	}

	attachEvents(callback = null) {
		document.querySelector('.crypto_transfer_btn').onclick = (e) => {
			this.overlay.hide();
		};
	}
}

module.exports = CryptoInadequate;
