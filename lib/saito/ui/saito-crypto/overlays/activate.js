const ActivateTemplate = require('./activate.template');
const SaitoOverlay = require('./../../saito-overlay/saito-overlay');

class ActivateOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod);
	}

	render(ticker, address, confirmations) {
		if (ticker === 'SAITO') {
			return;
		}
		this.overlay.show(ActivateTemplate(ticker, address, confirmations));
		this.attachEvents();
	}

	attachEvents() {
		document.querySelector('.crypto-activation-confirm').onclick = (e) => {
			this.overlay.remove();
		};
	}
}

module.exports = ActivateOverlay;
