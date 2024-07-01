const DepositTemplate = require('./deposit.template');
const SaitoOverlay = require('./../../saito-overlay/saito-overlay');

class Deposit {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod, false);
		this.ticker = 'SAITO';
		this.address = null;

		this.app.connection.on('saito-crypto-deposit-render-request', async(obj) => {
			this.ticker = obj.ticker;
			this.ticker_mod = this.app.wallet.returnCryptoModuleByTicker(
				this.ticker
			);
			this.address = await this.ticker_mod.returnAddress();
			if (this.address.indexOf('|') > -1) {
				this.address = this.address.split('|')[0];
			}
			this.render();
		});
	}

	async render() {
		this.address = await this.app.wallet.getPublicKey();
		this.overlay.show(DepositTemplate(this.app, this.mod, this));
		this.renderCrypto();
		this.attachEvents();
	}

	attachEvents() {
		document.querySelector(
			'.saito-crypto-deposit-container .pubkey-containter'
		).onclick = (e) => {
			let public_key = document.querySelector(
				'.saito-crypto-deposit-container #profile-public-key'
			).innerHTML;
			navigator.clipboard.writeText(public_key);
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
			let cryptomod = this.app.wallet.returnCryptoModuleByTicker(
				this.ticker
			);
			let balance = await cryptomod.formatBalance();
			document.querySelector(
				`.saito-crypto-deposit-container .balance-amount`
			).innerHTML = `${balance} <span class="deposit-ticker">${cryptomod.ticker}</span>`;

			if (typeof cryptomod.confirmations != 'undefined') {
				document.querySelector(
					'.network-confirmations-count'
				).innerHTML = cryptomod.confirmations;
			} else {
				document.querySelector(
					'.network-confirmations-count'
				).style.display = 'none';
			}

			console.log('GEN QR 1: ' + this.address);
			this.app.browser.generateQRCode(this.address);
			console.log('GEN QR 2');
		} catch (err) {
			console.log('Error rendering crypto header: ' + err);
		}
	}
}

module.exports = Deposit;
