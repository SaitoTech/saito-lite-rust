const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const SendTokensOverlayTemplate = require('./send-tokens-overlay.template');

module.exports = SendTokensOverlay = {
	render(app, mod, container) {
		this.app = app;
		this.mod = mod;
		if (!mod.overlay) {
			mod.overlay = new SaitoOverlay(app, mod);
		}
		mod.overlay.show(SendTokensOverlayTemplate());
	},

	attachEvents() {
		let app = this.app;
		let mod = this.mod;

		document.getElementById('wallet-send-tokens-form').onsubmit = async (
			e
		) => {
			e.preventDefault();

			let recipient = document.getElementById(
				'wallet-send-tokens-recipient'
			).value;
			let amount = document.getElementById(
				'wallet-send-tokens-amount'
			).value;
			let preferred_crypto = app.wallet.preferred_crypto;
			let ticker = preferred_crypto;
			let cryptomod = null;

			for (let i = 0; i < app.modules.mods.length; i++) {
				if (app.modules.mods[i].ticker === ticker) {
					cryptomod = app.modules.mods[i];
				}
			}

			let c = confirm(
				`Do you wish to send ${amount} ${app.wallet.preferred_crypto}/${ticker} to ${recipient}`
			);
			if (c) {
				let sender = cryptomod.returnAddress();
				let hash = await app.wallet.sendPayment(
					[sender],
					[recipient],
					[amount],
					new Date().getTime(),
					btoa(sender + recipient + amount + Date.now()),
					function () {
						mod.overlay.remove();
						salert('Transfer successful');
					},
					ticker
				);
			} else {
				salert('Transfer cancelled');
			}
		};
	}
};
