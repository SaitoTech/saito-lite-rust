const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const CryptoSelectAmountTemplate = require('./select-amount.template');

class CryptoSelectAmount {
	constructor(app, mod, mycallback = null) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);
		this.callback = mycallback;
		this.errors = {
			'amount': false,
			'checkbox': false
		};
	}

	render(mycallback = null) {
		if (mycallback != null) {
			this.callback = mycallback;
		}
		this.overlay.show(CryptoSelectAmountTemplate(this.app, this.mod));
		this.attachEvents(this.callback);
	}

	attachEvents(callback = null) {
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

		document.querySelector('.crypto_amount_btn').onclick = (e) => {
			this_self.validateAmount();
			this_self.validateCheckbox();

			if (this_self.errors.amount == true || 
				this_self.errors.checkbox) {
				return;
			}
 
			if (callback != null) {
				let amount = stake_input.value;
				this.overlay.hide();
				callback(amount);
			}
		};
	}

	validateAmount(){
		let amount = document.getElementById('amount_to_stake_input').value;
  		let input_err = document.querySelector('#stake-amount-error');
		let errorMsg = '';

		console.log('errors: ', this.errors);
		this.errors.amount = false;

		input_err.innerText = '';
		input_err.style.display = 'none';

  		if (parseFloat(amount) <= 0) {
			errorMsg = 'You need to select a positive value';
			this.errors.amount = true;
		} else if (parseFloat(amount) > this.mod.max_balance) {
			errorMsg = 'Not all the players have that much to stake';
			this.errors.amount = true;
		}

		if (this.errors.amount) {
			input_err.innerText = errorMsg;	
			input_err.style.display = 'block';	
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
