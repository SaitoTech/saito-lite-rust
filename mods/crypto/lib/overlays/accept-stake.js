const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const AcceptStakeTemplate = require('./accept-stake.template');

class AcceptStake {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);
	}

	async render(obj) {

		if (obj?.accept_callback) {
			this.accept_callback = obj.accept_callback;
		}
		if (obj?.reject_callback) {
			this.reject_callback = obj.reject_callback;
		}

		let cryptomod = this.app.wallet.returnCryptoModuleByTicker(obj.ticker);
		let current_balance = await cryptomod.returnBalance();

		if (parseFloat(current_balance) >= parseFloat(obj.stake)) {
			this.overlay.show(AcceptStakeTemplate(this.app, obj.game_mod, obj), this.reject_callback);
			this.overlay.blockClose();
			this.attachEvents();
		} else {
			//
			// take the user to the crypto deposit page
			//
			this.app.connection.emit('saito-crypto-deposit-render-request', {
				ticker: obj.ticker,
				amount: obj.stake
			});
			return;
		}

	}

	attachEvents() {

		if (document.querySelector('#approve-crypto-request-container #enable_staking_yes')){
			document.querySelector('#approve-crypto-request-container #enable_staking_yes').onclick = async(e) => {

				let confirm = document.querySelector(
					'#approve-crypto-request-container #approve-crypto-stake-confirm-input'
				).checked;

				this.app.options.gameprefs.crypto_transfers_inbound_trusted = confirm ? 1 : 0;
				this.app.wallet.saveWallet();

				if (!confirm) {
					salert('You need to confirm');
					return;
				}

				if (this.accept_callback){
					this.accept_callback();
				}
				this.overlay.close();
			};

		}

		if (document.querySelector('#approve-crypto-request-container #enable_staking_no')){
			document.querySelector('#approve-crypto-request-container #enable_staking_no').onclick = (e) => {
				if (this.reject_callback){
					this.reject_callback();
				}
				this.overlay.close();
			};
		}			

	}

}

module.exports = AcceptStake;
