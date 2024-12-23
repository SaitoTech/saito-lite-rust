const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const AcceptStakeTemplate = require('./accept-stake.template');

class AcceptStake {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);
		this.accept_callback = null;
		this.reject_callback = null;
	}

	async render(obj) {
		if (obj?.accept_callback) {
			this.accept_callback = obj.accept_callback;
		}
		if (obj?.reject_callback) {
			this.reject_callback = obj.reject_callback;
		}

		this.overlay.show(AcceptStakeTemplate(this.app, obj.game_mod, obj));
		this.overlay.blockClose();
		this.attachEvents();

	}

	attachEvents() {
		let this_self = this;
		if (document.querySelector('#approve-crypto-request-container #enable_staking_yes')){
			document.querySelector('#approve-crypto-request-container #enable_staking_yes').onclick = async(e) => {
				let confirm = document.querySelector(
					'#approve-crypto-request-container #approve-crypto-stake-confirm-input'
				).checked;

				this_self.app.options.gameprefs.crypto_transfers_inbound_trusted = confirm ? 1 : 0;
				this_self.app.wallet.saveWallet();

				if (!confirm) {
					salert('You need to confirm');
					return;
				}

				if (this_self.accept_callback){
					this_self.accept_callback();
				}
				this_self.overlay.close();
			};

		}

		if (document.querySelector('#approve-crypto-request-container #enable_staking_no')){
			document.querySelector('#approve-crypto-request-container #enable_staking_no').onclick = (e) => {
				if (this_self.reject_callback){
					this_self.reject_callback();
				}
				this_self.overlay.close();
			};
		}			

	}

}

module.exports = AcceptStake;
