const WithdrawTemplate = require('./withdraw.template');
const SaitoOverlay = require('./../../saito-overlay/saito-overlay');

class Withdraw {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.overlay = new SaitoOverlay(this.app, this.mod);

		this.ticker = '';
		this.pc = null; // pointer at the crypto module
		this.publicKey = '';
		this.fee = null;

		this.errors = {
			amount: false,
			address: false
		};

		// We will only programattically input the address if it is a Saito PublicKey
		this.app.connection.on('saito-crypto-withdraw-render-request', async (obj) => {
			
			this.ticker = obj?.ticker || "";
			this.publicKey = obj?.address || "";

			if (this.ticker) {
				await this.app.wallet.setPreferredCrypto(this.ticker);
			} 

			this.render();
		});
	}

	async render() {

		this.pc = this.app.wallet.returnPreferredCrypto();
		this.ticker = this.pc.ticker;
		let destination = "";

		if (this.publicKey) {
			destination = await this.pc.returnAddressFromPublicKey(this.publicKey);
		}

		if (document.getElementById('withdrawal-form')) {
			this.app.browser.replaceElementById(
				WithdrawTemplate(this.app, this.mod, this.publicKey, destination),
				'withdrawal-form'
			);
		} else {
			this.overlay.show(WithdrawTemplate(this.app, this.mod, this.publicKey, destination), ()=> {
				this.ticker = null
				this.pc = null;
				this.publicKey = null;
			});
		}

		this.resetErrors();

		await this.loadCryptos();

		this.attachEvents();
	}

	async loadCryptos() {
		let available_cryptos = this.app.wallet.returnActivatedCryptos();

		//
		// Populate drop down menu to change cryptos
		//
		for (let crypto_mod of available_cryptos) {

			if (!this?.publicKey || (await crypto_mod.returnAddressFromPublicKey(this.publicKey) !== null)){

				let show_me = crypto_mod.name == this.pc.name;

				let html = `<option ${show_me ? 'selected' : ``} id="crypto-option-${
					crypto_mod.name
				}" value="${crypto_mod.ticker}">${crypto_mod.ticker}</option>`;

				this.app.browser.addElementToId(html, 'withdraw-select-crypto');

				let img_html = `<img class="withdraw-img-${crypto_mod.ticker} ${
					show_me ? '' : 'hide-element'
				}" src="${crypto_mod.returnLogo()}">`;
				this.app.browser.addElementToId(img_html, 'withdraw-logo-cont');
				
			}

		}

		document.querySelector(
			'.withdraw-info-value.balance'
		).innerHTML = `${this.pc.returnBalance()} ${this.ticker}`;

		await this.fetchWithdrawFee();

		this.attachDropdownEvents();
	}

	attachDropdownEvents() {
		document.querySelector('#withdraw-select-crypto').onchange = async (e) => {
			let element = e.target;

			document.querySelector('.withdraw-fee-cont').style.display = 'none';
			document.querySelector('.withdraw-info-value.balance').innerHTML = `fetching...`;

			await this.app.wallet.setPreferredCrypto(element.value);
			this.fee = null;

			setTimeout(() => {
				this.render();
			}, 500);
		};
	}

	async attachEvents() {
		let this_withdraw = this;

		if (document.querySelector('#withdraw-input-address')) {
			document.querySelector('#withdraw-input-address').onblur = async (e) => {
				this.validateAddressInput();
				await this.fetchWithdrawFee();
			};
		}

		if (document.querySelector('#withdraw-input-amount')) { //#withdraw-input-amount
			document.querySelector('#withdraw-input-amount').onblur = (e) => {
				this.validateAmountInput();
			};

			// Prevent entering non-numeric values...
			document.querySelector('#withdraw-input-amount').onchange = (e) => {
				let amount = document.querySelector('#withdraw-input-amount').value;
				this.app.browser.validateAmountLimit(amount, e);
			};
		}

		if (document.querySelector('#withdrawal-form') != null) {
			document.querySelector('#withdrawal-form').onsubmit = (e) => {
				e.preventDefault();

				this.validateAddressInput();
				this.validateAmountInput();

				if (this.errors['amount'] != false || this.errors['address'] != false) {
					return false;
				}

				let amount = Number(document.querySelector('#withdraw-input-amount').value);
				let address = document.querySelector('#withdraw-input-address').value;

				document.querySelector('.withdraw-confirm-amount').innerText = `${amount} ${this.ticker}`;
				document.querySelector('.withdraw-confirm-address').innerText = address;

				document.querySelector('.withdraw-confirm-fee').innerText = `(fee: ${this.fee} ${this.ticker})`;

				// Change view to confirmation screen
				document.querySelector('#withdraw-step-one').classList.toggle('hide-element');
				document.querySelector('#withdraw-step-two').classList.toggle('hide-element');
			};

			document.getElementById("reset-form").onclick = (e) => {
				this.app.connection.emit('saito-crypto-withdraw-render-request');
			}

			document.querySelector('#withdraw-cancel').onclick = (e) => {
				e.preventDefault();
				document.querySelector('#withdraw-step-one').classList.toggle('hide-element');
				document.querySelector('#withdraw-step-two').classList.toggle('hide-element');
			};

			document.querySelector('#withdraw-confirm').onclick = async (e) => {
				e.preventDefault();

				try {
					let amount = document.querySelector('#withdraw-input-amount').value;
					let address = document.querySelector('#withdraw-input-address').value;

					let ticker = this.ticker;
					let sender = this.pc.formatAddress();

					document.querySelector('.withdraw-msg-icon').classList.toggle('fa-circle-exclamation');
					document.querySelector('.confirm-msg-container .spinner').classList.add('show');
					document.querySelector('.withdraw-msg-icon').classList.toggle('hide');

					document.querySelector('.confirm-submit').style.opacity = 0;
					document.querySelector('.withdraw-msg-text').innerText = 'Sending';
					document.querySelector('.withdraw-msg-question').innerText = '...';

					console.log('network fee:', this.fee);

					let ts = new Date().getTime();
					let hash = await this.app.wallet.sendPayment(
						ticker,
						[sender],
						[address],
						[amount],
						btoa(sender + address + amount + ts),
						async function (res) {
							if (res.hash != '') {
								setTimeout(function () {
									if (document.querySelector('.confirm-msg')) {
										document.querySelector(
											'.confirm-msg'
										).innerHTML = `Your transaction has been broadcast <br > Please check transaction history in the sidebar menu for confirmation`;
										document
											.querySelector('.confirm-msg-container .spinner')
											.classList.remove('show');
										document.querySelector('.withdraw-msg-icon').classList.toggle('hide');
										document
											.querySelector('.withdraw-msg-icon')
											.classList.toggle('fa-circle-check');
									}
								}, 1000);
							} else {
								this_withdraw.showError();
							}
						},
						this?.publicKey						
					);
				} catch (err) {
					console.error('Send Error: ' + err);
					this_withdraw.showError();
				}
			};

			if (document.querySelector('#withdraw-max-btn') != null) {
				document.querySelector('#withdraw-max-btn').onclick = async (e) => {
					if (!document.querySelector('#withdraw-input-amount').disabled) {
						let amount_avl = this.pc.returnBalance();
						let thousand_separator = this.app.browser.getThousandSeparator();
						let replace = amount_avl.split(thousand_separator).join('');

						let balance_as_float = parseFloat(Number(replace));
						document.querySelector('#withdraw-input-amount').value =
							balance_as_float - this_withdraw.fee;
						this_withdraw.validateAmountInput();
					}
				};
			}
		}
	}

	showError() {
		document.querySelector(
			'.confirm-msg'
		).innerHTML = `Transfer request unsuccessful <br > Please try again`;
		document.querySelector('.confirm-msg-container .spinner').classList.remove('show');
		document.querySelector('.withdraw-msg-icon').classList.toggle('hide');
		document.querySelector('.withdraw-msg-icon').classList.remove('fa-circle-notch');
		document.querySelector('.withdraw-msg-icon').classList.remove('fa-circle-check');
		document.querySelector('.withdraw-msg-icon').classList.toggle('fa-circle-xmark');
	}

	hideSaitoHeaderMenu() {
		let components = this.mod.components;
		for (let key in components) {
			if (components[key]?.slug == 'SaitoHeader') {
				let saito_header = components[key];
				saito_header.hideMenu();
			}
		}
	}

	async fetchWithdrawFee() {
		this_withdraw = this;
		let address = document.querySelector('#withdraw-input-address').value;

		document.querySelector('.withdraw-info-value.fee').innerHTML = 'updating...';
		this.pc.checkWithdrawalFeeForAddress(address, (amt) => {
			this.fee = Number(amt);
			document.querySelector('.withdraw-info-value.fee').innerHTML = `${amt} ${this.ticker}`;
		});

		// Maybe we want an explanatory block on the fees...
		// document.querySelector('.withdraw-fee-cont').style.display = 'block';
	}

	validateAmountInput() {
		this.clearAmountError();

		let amount = document.querySelector('#withdraw-input-amount').value;
		let error_msg = null;

		if (amount != '') {
			amount = Number(amount);

			let amount_avl = Number(this.pc.returnBalance());
			this.fee = Number(this.fee);

			console.log(amount, amount_avl);

			if (amount <= 0) {
				error_msg = 'Error: Amount should be greater than 0';
			} else if (amount > amount_avl) {
				error_msg = `Error: Insufficent funds ( ${amount_avl} ${this.ticker} available)`;
			} else if (amount + this.fee > amount_avl) {
				error_msg = `Error: Your withdrawal amount + transaction fee exceeds available balance. Please reduce the amount to cover withdrawal fee.`;
			}
		} else {
			error_msg = 'Error: No input';
		}

		if (error_msg) {
			this.errors['amount'] = true;
			document.querySelector('#withdraw-amount-error').innerHTML = error_msg;
			document.querySelector('#withdraw-amount-error').style.display = 'block';
		}

		this.handleErrors();
	}

	validateAddressInput() {
		this.clearAddressError();

		let address = document.querySelector('#withdraw-input-address').value;

		let valid = this.pc.validateAddress(address);

		if (!valid) {
			document.querySelector('#withdraw-address-error').innerHTML =
				'Error: Invalid ' + this.ticker + ' address';
			document.querySelector('#withdraw-address-error').style.display = 'block';
			this.errors['address'] = true;
		}

		// Disable submission
		this.handleErrors();
	}

	handleErrors() {
		if (this.errors['amount'] != false || this.errors['address'] != false) {
			document.querySelector('#saito-overlay-submit').classList.add('disabled');
		} else {
			document.querySelector('#saito-overlay-submit').classList.remove('disabled');
		}
	}

	clearAddressError() {
		this.errors['address'] = false;
		document.querySelector('#withdraw-address-error').innerHTML = '';
		document.querySelector('#withdraw-address-error').style.display = 'none';
	}

	clearAmountError() {
		// reset errors
		this.errors['amount'] = false;
		document.querySelector('#withdraw-amount-error').innerHTML = '';
		document.querySelector('#withdraw-amount-error').style.display = 'none';
	}

	resetErrors() {
		this.errors = {
			amount: false,
			address: false
		};
		this.clearAddressError();
		this.clearAmountError();

		this.handleErrors();
	}
}

module.exports = Withdraw;
