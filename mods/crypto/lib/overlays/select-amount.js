const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const CryptoSelectAmountTemplate = require('./select-amount.template');

class CryptoSelectAmount {
	constructor(app, mod, mycallback = null) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);
		this.callback = mycallback;
		this.fixed = true;
		this.ticker = "";
		this.stake = 0;
		this.errors = {
			'amount': false,
			'checkbox': false
		};
	}

	render(mycallback = null) {
		if (mycallback != null) {
			this.callback = mycallback;
		}
		this.overlay.show(CryptoSelectAmountTemplate(this.app, this.mod, this));
		this.attachEvents();
	}

	attachEvents() {
		let this_self = this;
		let stake_input = document.getElementById('amount_to_stake_input');
		if (!stake_input) {
			return;
		}

		stake_input.onclick = (e) => {
			let amt = stake_input.value;
			if (parseFloat(amt) == 0) {
				stake_input.select();
			}
		};

		let max_button = document.querySelector('.select_max');
		if (max_button) {
			max_button.onclick = (e) => {
				stake_input.value = this.mod.max_balance;
			};
		}

		stake_input.onkeydown = async(e) => {
			let amount = stake_input.value;
			this_self.app.browser.validateAmountLimit(amount, e);
		}

		stake_input.oninput = async (e) => {
      		this_self.validateAmount();
  		};

		document.querySelector('.crypto_amount_btn').onclick = async (e) => {
			this_self.validateAmount();
			this_self.validateCheckbox();

			if (this_self.errors.amount == true || 
				this_self.errors.checkbox) {
				console.warn(this_self.errors);
				return;
			}

			let confirm = document.getElementById('crypto-stake-confirm-input').checked;
			this_self.app.options.gameprefs.crypto_transfers_inbound_approved = confirm ? 1 : 0;
			await this_self.app.wallet.saveWallet();
 
			if (this.callback != null) {
				let amount = stake_input.value;
				let alt_amount = document.getElementById('minimum_accepted_stake')?.value || null;
				if (document.getElementById('crypto-stake-odds')?.checked == false){
					console.log("Not checked!!!")
					alt_amount = null;
				}
				if (alt_amount == amount){
					alt_amount = null;
				}

				this.callback(this.ticker, amount, alt_amount);
			}else{
				console.warn("No callback");
			}
			this.overlay.close();

		};

		if (document.querySelector('#stake-select-crypto')){
			document.querySelector('#stake-select-crypto').onchange = (e) => {
				this.ticker = e.target.value;
				this.stake = 0;
				this.mod.max_balance = parseFloat(this.mod.balances[this.ticker].balance);

				this.app.browser.replaceElementById(CryptoSelectAmountTemplate(this.app, this.mod, this), "stake-crypto-request-container");
				this.attachEvents();

				//stake_input.value = "";
				//max_button.innerText = `Max: ${this.mod.max_balance}`;
			};
		}

		if (document.getElementById('crypto-stake-odds')){
			document.getElementById('crypto-stake-odds').onchange = (e) => {
				if (document.getElementById('crypto-stake-odds').checked){
					document.getElementById('opponent-minimum-stake').classList.remove("hidden");
				}else{
					document.getElementById('opponent-minimum-stake').classList.add("hidden");
				}
			}

			let opponent_stake = document.getElementById('minimum_accepted_stake');
			opponent_stake.onkeydown = async(e) => {
				this_self.app.browser.validateAmountLimit(opponent_stake.value, e);
			}

			opponent_stake.oninput = async (e) => {
	      		this_self.validateAmount();
	  		};

			opponent_stake.onclick = (e) => {
				opponent_stake.select();
			};

		}
	}

	validateAmount(){
		let amount = document.getElementById('amount_to_stake_input').value;
  		let input_err = document.querySelector('#stake-amount-error');
		let errorMsg = '';


		let opponent_amount = document.getElementById('minimum_accepted_stake')?.value || amount;

		amount = parseFloat(amount);
		opponent_amount = parseFloat(opponent_amount);

		this.errors.amount = false;

		input_err.innerText = '';
		input_err.style.display = 'none';

		//advanced input
		if (opponent_amount < 0) {
			errorMsg = 'Must be non-negative';
		}
		if (opponent_amount > amount) {
			errorMsg = `Opponent's minimum stake cannot be greater than yours`;
		}

		// Basic input
  		if (amount <= 0) {
			errorMsg = 'You need to select a positive value';
		} else if (amount > this.mod.max_balance) {
			if (this.fixed){
				errorMsg = 'Not all the players have that much to stake';
			}else{
				errorMsg = `You don't have that much to stake`;
			}
		}

		if (errorMsg) {
			input_err.innerText = errorMsg;	
			input_err.style.display = 'block';	
			this.errors.amount = true;
		}
	}


	validateCheckbox(){
		let confirm = document.getElementById('crypto-stake-confirm-input').checked;
		let checkbox_err = document.querySelector('#stake-checkbox-error');
		let errorMsg = '';
		this.errors.checkbox = false;

		checkbox_err.innerText = '';
		checkbox_err.style.display = 'none';

		if (!confirm) {
			errorMsg = 'You need to confirm';
			this.errors.checkbox = true;
		}

		if (this.errors.checkbox) {
			checkbox_err.innerText = errorMsg;	
			checkbox_err.style.display = 'block';	
		}
	}
}

module.exports = CryptoSelectAmount;
