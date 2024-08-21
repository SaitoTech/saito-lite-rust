const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const AdjustStakeTemplate = require('./adjust-stake.template');

class AdjustStake {
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
		this.my_balance = parseFloat(current_balance);

		  this.min_stake = parseFloat(obj.stake.min);
		  this.match_stake = this.min_stake;
		  for (let i in obj.stake){
		    if (parseFloat(obj.stake[i]) > this.match_stake){
		      this.match_stake = parseFloat(obj.stake[i]);
		    }
		  }

		  this.ticker = obj.ticker;

		if (this.my_balance >= this.min_stake) {
			this.overlay.show(AdjustStakeTemplate(this.app, this), this.reject_callback);
			this.overlay.blockClose();
			this.attachEvents();
		} else {
			//
			// take the user to the crypto deposit page
			//
			this.app.connection.emit('saito-crypto-deposit-render-request', {
				ticker: obj.ticker,
				amount: obj.stake.min
			});
			return;
		}

	}

	attachEvents() {

		let stake_input = document.getElementById('amount_to_stake_input');
		if (!stake_input) {
			return;
		}

		stake_input.onclick = (e) => {
			stake_input.select();
		};

		let match_button = document.querySelector('.select_match');
		if (match_button) {
			match_button.onclick = (e) => {
				stake_input.value = this.match_stake;
			};
		}

		let min_button = document.querySelector('.select_min');
		if (min_button) {
			min_button.onclick = (e) => {
				stake_input.value = this.min_stake;
			};
		}

		stake_input.onkeydown = async(e) => {
			let amount = stake_input.value;
			this.app.browser.validateAmountLimit(amount, e);
		}

		stake_input.oninput = async (e) => {
      		this.validateAmount();
  		};


		if (document.querySelector('#approve-crypto-request-container #enable_staking_yes')){
			document.querySelector('#approve-crypto-request-container #enable_staking_yes').onclick = async(e) => {

				if (!this.validateAmount()){
					return;
				}

				let confirm = document.querySelector(
					'#approve-crypto-request-container #approve-crypto-stake-confirm-input'
				).checked;

				this.app.options.gameprefs.crypto_transfers_inbound_trusted = confirm ? 1 : 0;
				this.app.wallet.saveWallet();

				if (!confirm) {
					salert('You need to confirm');
					return;
				}

				let amount = parseFloat(stake_input.value);

				if (this.accept_callback){
					this.accept_callback(amount);
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


	
	validateAmount(){
		let amount = document.getElementById('amount_to_stake_input').value;
  		let input_err = document.querySelector('#stake-amount-error');
		let errorMsg = '';

		amount = parseFloat(amount);

		input_err.innerText = '';
		input_err.style.display = 'none';

		// Basic input
  		if (amount < 0) {
			errorMsg = 'You need to select a non-negative value';
		} else if (amount > this.my_balance) {
			errorMsg = `You don't have that much to stake`;
		} else if (amount < this.min_stake){
			errorMsg = `You need to stake at least ${this.min_stake}`;
		}

		if (errorMsg) {
			input_err.innerText = errorMsg;	
			input_err.style.display = 'block';	
			return false;
		}

		return true;
	}

	

}

module.exports = AdjustStake;
