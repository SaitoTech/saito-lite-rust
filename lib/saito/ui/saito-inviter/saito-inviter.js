const SaitoInviterTemplate = require('./saito-inviter.template');
const SaitoOverlay = require('./../saito-overlay/saito-overlay');

class SaitoInviter {
	constructor(app, mod) {
		this.app = app;
		this.name = 'SaitoInviter';
		this.overlay = new SaitoOverlay(app);
		this.mycallback = null;
		this.options = {};
	}

	render(mycallback = null) {
		if (mycallback != null) {
			this.mycallback = mycallback;
		}
		this.overlay.show(
			SaitoInviterTemplate(this.app, this.mod, this.options)
		);
		this.attachEvents(this.mycallback);
	}

	attachEvents(mycallback) {
		document.querySelector('.saito-public-invitation').onclick = (e) => {
			this.overlay.hide();
			if (mycallback != null) {
				mycallback('public');
			}
		};

		document.querySelector('.saito-private-invitation').onclick = (e) => {
			document.querySelectorAll('.saito-invite').forEach((el) => {
				el.remove();
			});

			let html = `
	<input type="text" placeholder="address" id="saito-invite-address" class="saito-invite-address" />
	<div class="saito-button-secondary small saito-invite-button" id="saito-invite-button">invite</div>
      `;

			this.app.browser.addElementToSelector(html, '.saito-inviter');

			document.getElementById('saito-invite-button').onclick = (e) => {
				let address = document.getElementById(
					'saito-invite-address'
				).value;
				if (this.app.wallet.isValidPublicKey(address)) {
					this.overlay.hide();
					if (mycallback != null) {
						mycallback(address);
					}
				} else {
					alert('Not a public key / Saito address');
				}
			};
		};
	}
}

module.exports = SaitoInviter;
