const DepositTemplate = require('./deposit.template');
const SaitoOverlay = require('./../../saito-overlay/saito-overlay');

class Deposit {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod, false);

		app.connection.on('saito-crypto-deposit-render-request', async (obj) => {
			// Fallback in case specifying a different crypto
			if (obj?.ticker) {
				await app.wallet.setPreferredCrypto(obj.ticker);
			}

			if (obj?.amount) {
				this.desired_amount = obj.amount;
			} else {
				delete this.desired_amount;
			}

			this.render();
		});
	}

	async render() {
		// Cache these to fill in the overlay
		this.ticker = this.app.wallet.returnPreferredCryptoTicker();
		this.address = this.app.wallet.returnPreferredCryptoAddress();

		this.overlay.show(DepositTemplate(this.app, this.mod, this));
		this.renderCrypto();
		this.attachEvents();
	}

	attachEvents() {
		document.querySelector('.saito-crypto-deposit-container .pubkey-containter').onclick = (e) => {
			navigator.clipboard.writeText(this.address);
			let icon_element = document.querySelector(
				'.saito-crypto-deposit-container .pubkey-containter i'
			);
			icon_element.classList.toggle('fa-copy');
			icon_element.classList.toggle('fa-check');
			setTimeout(() => {
				icon_element.classList.toggle('fa-copy');
				icon_element.classList.toggle('fa-check');
			}, 800);
		};
	}

	async renderCrypto() {
		try {
			let cryptomod = this.app.wallet.returnPreferredCrypto();
			let balance = await this.app.wallet.returnPreferredCryptoBalance();

			document.querySelector(`.saito-crypto-deposit-container .balance-amount`).innerHTML = this.app.browser.returnBalanceHTML(balance);

			if (cryptomod?.confirmations) {
				document.querySelector('.network-confirmations-count').innerHTML = cryptomod.confirmations;
			} else {
				document.querySelector('.network-confirmations').style.display = 'none';
			}

			console.log('GEN QR 1: ' + this.address);
			this.app.browser.generateQRCode(this.address, 'deposit-qrcode');
			console.log('GEN QR 2');
		} catch (err) {
			console.log('Error rendering crypto header: ' + err);
		}
	}
}

module.exports = Deposit;
