const WithdrawTemplate = require('./withdraw.template');
const SaitoOverlay = require('./../../saito-overlay/saito-overlay');

class Withdraw {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.overlay = new SaitoOverlay(this.app, this.mod);

		this.ticker = '';
		this.amount = 0.0;
		this.address = '';
		this.balance = 0.0;
		this.fee = null;

    this.callbacks = {};
    this.autofill = false;
    this.errors = {
    	'amount': false,
    	'address': false,
    	'fee': false
    };

		this.app.connection.on(
			'saito-crypto-withdraw-render-request',
			async (obj) => {
				if (typeof obj.amount != 'undefined') {
					this.amount = obj.amount;
				}
				if (typeof obj.ticker != 'undefined') {
					this.ticker = obj.ticker;
				}
				if (typeof obj.address != 'undefined') {
					this.address = obj.address;
				}

				this.autofill = (obj?.autofill == true) ? true : false;

        await this.app.wallet.setPreferredCrypto(this.ticker, 1);
        this.app.connection.emit("wallet-updated");
				this.render();
			}
		);
	}

	async render() {
		this.overlay.show(WithdrawTemplate(this.app, this.mod, this));

    // add qrscanner icon
    let mods = this.app.modules.mods;
    let index = 0;
    for (const mod of mods) {
      let item = mod.respondTo('withdraw');
      if (item instanceof Array) {
        item.forEach(async (j) => {
          let id = `withdraw_action_item_${index}`;
          this.callbacks[id] = j.callback;
          await this.addWithdrawActionItem(j, id);
          index++;
        });
      } else if (item != null) {
        let id = `withdraw_action_item_${index}`;
        this.callbacks[id] = item.callback;
        await this.addWithdrawActionItem(item, id);
      }
      index++;
    }

    if (this.autofill == true) {
  		if (document.querySelector('.withdraw-address-cont .scan')) {
					document.querySelector('.withdraw-address-cont .scan').style.display = 'none';
			}
    }

		await this.loadCryptos();

		this.attachEvents();
	}

  async addWithdrawActionItem(item, id) {
    let html = `<i id="${id}" class="withdraw-action-item ${item.icon} ${(item.text).toLowerCase()}" 
    title="${item.text}"></i>`;

    this.app.browser.prependElementToSelector(html, `#withdraw-address-cont`);
  }

	async loadCryptos(ticker = null) {
		let available_cryptos = this.app.wallet.returnInstalledCryptos();
		let preferred_crypto = await this.app.wallet.returnPreferredCrypto();

		let sender = preferred_crypto.returnAddress();
		let fee = 0;
		let balance = 0;
		let asset_id = '';

		// add crytpo dropdown html
		document.querySelector('#withdraw-select-crypto').innerHTML = '';
		document.querySelector('#withdraw-logo-cont').innerHTML = '';
		let html = '';
		let img_html = ``;
		for (let i = 0; i < available_cryptos.length; i++) {
			let crypto_mod = available_cryptos[i];

			if (ticker != null && crypto_mod.ticker == ticker) {
				preferred_crypto = crypto_mod;
			}

			html = `<option ${
				crypto_mod.name == preferred_crypto.name ? 'selected' : ``
			} 
      id="crypto-option-${crypto_mod.name}" value="${crypto_mod.ticker}">${
      	crypto_mod.ticker
			}</option>`;

			if (crypto_mod.ticker == 'SAITO') {
				img_html = `<img class="withdraw-img-${crypto_mod.ticker} hide-element" src="/saito/img/touch/pwa-192x192.png">`;
			} else {
				img_html = `<img class="withdraw-img-${
					crypto_mod.ticker
				} hide-element" src="/${crypto_mod.ticker.toLowerCase()}/img/logo.png">`;
			}

			this.app.browser.addElementToElement(
				html,
				document.querySelector('#withdraw-select-crypto')
			);
			this.app.browser.addElementToElement(
				img_html,
				document.querySelector('#withdraw-logo-cont')
			);
		}

		document
			.querySelector('.withdraw-img-' + preferred_crypto.ticker)
			.classList.remove('hide-element');

		balance = await preferred_crypto.formatBalance();
		asset_id = preferred_crypto.asset_id;

		// update inputs
		document.querySelector('#withdraw-ticker').value =
			preferred_crypto.ticker;
		if (balance && balance != 'undefined') {
			document.querySelector('#withdraw-balance').value = balance;
		}
		if (asset_id) {
			document.querySelector('#withdraw-asset-id').value = asset_id;
		}
		if (sender) {
			document.querySelector('#withdraw-sender').value = sender;
		}

		// show fee & balance
		if (balance && balance != 'undefined') {
			document.querySelector('.withdraw-info-value.balance').innerHTML =
				balance + ` ${preferred_crypto.ticker}`;
		}
		document.querySelector('.withdraw-info-value.fee').innerHTML = '--';

		this.attachDropdownEvents();
	}

	
	attachDropdownEvents() {
		this_withdraw = this;
		document.querySelector('#withdraw-select-crypto').onchange = async (
			e
		) => {
			let element = e.target;

			if (element.value === 'add-new') {
				let current_default = await app.wallet.returnPreferredCrypto();
				let select_box = document.querySelector('.saito-select-crypto');
				select_box.value = current_default.name;
				let appstore_mod = app.modules.returnModule('AppStore');
				if (appstore_mod) {
					let options = {
						search: '',
						category: 'Cryptocurrency',
						featured: 1
					};
					await appstore_mod.openAppstoreOverlay(options);
				} else {
					salert(
						'Cannot install other cryptocurrencies without the appstore!'
					);
				}
				return;
			}

      document.querySelector(".withdraw-info-value.balance").innerHTML = `fetching...`;

			await this.app.wallet.setPreferredCrypto(element.value, 1);
			setTimeout(async function () {
				await this_withdraw.loadCryptos(element.value);
        document.querySelector('#withdraw-input-address').value = '';
        document.querySelector('#withdraw-input-amount').value = '';

        this_withdraw.resetErrors();

        let preferred_crypto = await this_withdraw.app.wallet.returnPreferredCrypto();
        this_withdraw.ticker = preferred_crypto.ticker;

				if (preferred_crypto.ticker != 'SAITO') {
	        preferred_crypto.getMixinAddress(this_withdraw.address, preferred_crypto.ticker, async function(res){

	        	if (res != null) {
		        	if (Object.keys(res).length > 0){
		        		document.querySelector('#withdraw-input-address').value = res[preferred_crypto.ticker];	

    		      	await this_withdraw.fetchWithdrawFee(preferred_crypto);
				        await this_withdraw.validateAmountInput();
		        	}
	        	}
	        	
	        });
      	} else {
      		if (this_withdraw.address != '') {
      			document.querySelector('#withdraw-input-address').value = this_withdraw.address;	
      		} else {
      			document.querySelector('#withdraw-input-address').value = '';
      		}
      	}

			}, 500);
		};
	}


	async attachEvents() {
		let this_withdraw = this;
		let preferred_crypto = await this.app.wallet.returnPreferredCrypto();

		if (document.querySelector('#withdraw-input-address')) {
			document.querySelector('#withdraw-input-address').oninput = async (
				e
			) => {

	      let preferred_crypto = await this_withdraw.app.wallet.returnPreferredCrypto();
				await this_withdraw.validateAdrressInput(preferred_crypto);

				await this_withdraw.fetchWithdrawFee(preferred_crypto);
				this_withdraw.checkSufficentFee();

			};
		}

		if (document.querySelector("#withdraw-input-amount")) {
	    document.querySelector("#withdraw-input-amount").oninput = async (e) => {
	      await this_withdraw.validateAmountInput();
    	}
	      
	    document.querySelector("#withdraw-input-amount").onkeydown = async (e) => {
	      let amount = document.querySelector("#withdraw-input-amount").value;
	      this_withdraw.app.browser.validateAmountLimit(amount, e);
	    }

	  }


		if (document.querySelector('#withdrawal-form') != null) {
			document.querySelector('#withdrawal-form').onsubmit = (e) => {
				e.preventDefault();

				let amount = Number(document.querySelector('#withdraw-input-amount').value);
				let address = document.querySelector('#withdraw-input-address').value;
				let amount_avl = Number(document.querySelector('#withdraw-balance').value);
				let ticker = document.querySelector('#withdraw-ticker').value;
	      this_withdraw.fee = Number(this_withdraw.fee);

				if (this.errors['fee'] != false || this.errors['amount'] != false || this.errors['address'] != false) {
	      	return false;
	      }

				document.querySelector(
					'.withdraw-confirm-amount'
				).innerText = `${amount} ${ticker}`;
				document.querySelector('.withdraw-confirm-address').innerText =
					address;
				document.querySelector(
					'.withdraw-confirm-fee'
				).innerText = `(fee: ${this_withdraw.fee} ${ticker})`;

				document
					.querySelector('#withdraw-step-one')
					.classList.toggle('hide-element');
				document
					.querySelector('#withdraw-step-two')
					.classList.toggle('hide-element');
			};

			document.querySelector("#withdraw-cancel").onclick = (e) => {
	      e.preventDefault();
	      document.querySelector("#withdraw-step-one").classList.toggle("hide-element");
	      document.querySelector("#withdraw-step-two").classList.toggle("hide-element");
	    };

			document.querySelector('#withdraw-confirm').onclick = async (e) => {
				e.preventDefault();

				try {
					let amount = document.querySelector(
						'#withdraw-input-amount'
					).value;
					let address = document.querySelector(
						'#withdraw-input-address'
					).value;
					let amount_avl =
						document.querySelector('#withdraw-balance').value;
					let fee = document.querySelector('#withdraw-fee').value;
					let ticker =
						document.querySelector('#withdraw-ticker').value;
					let sender =
						document.querySelector('#withdraw-sender').value;

					document
						.querySelector('.withdraw-msg-icon')
						.classList.toggle('fa-circle-exclamation');
					document
						.querySelector('.confirm-msg-container .spinner')
						.classList.add('show');
					document
						.querySelector('.withdraw-msg-icon')
						.classList.toggle('hide');

					document.querySelector('.confirm-submit').style.opacity = 0;
					document.querySelector('.withdraw-msg-text').innerText =
						'Sending';
					document.querySelector('.withdraw-msg-question').innerText =
						'...';

					let ts = new Date().getTime();
					let hash = await this.app.wallet.sendPayment(
						[sender],
						[address],
						[amount],
						ts,
						btoa(sender + address + amount + ts),
						async function (res) {
	            if (res.hash != '') {
								setTimeout(function () {
									if (document.querySelector('.confirm-msg')) {
	  								document.querySelector(
	  									'.confirm-msg'
	  								).innerHTML = `Your transaction has been broadcast <br > Please check transaction history in the sidebar menu for confirmation`;
	  								document
	  									.querySelector(
	  										'.confirm-msg-container .spinner'
	  									)
	  									.classList.remove('show');
	  								document
	  									.querySelector('.withdraw-msg-icon')
	  									.classList.toggle('hide');
	  								document
	  									.querySelector('.withdraw-msg-icon')
	  									.classList.toggle('fa-circle-check');
									}
								}, 1000);
	            } else {
	              this_withdraw.showError();
	            }
						},
						ticker
					);
				} catch (err) {
					console.error('Send Error: ' + err);
					this_withdraw.showError();
				}
			};

			if (document.querySelector('#withdraw-max-btn') != null) {
				document.querySelector('#withdraw-max-btn').onclick = async (e) => {
					if (!document.querySelector('#withdraw-input-amount').disabled) {
						let amount_avl =
							document.querySelector('#withdraw-balance').value;
						let thousand_separator = this.app.browser.getThousandSeparator();	
						let replace = amount_avl.split(thousand_separator).join('');
					
						let balance_as_float = parseFloat(Number(replace));
						document.querySelector('#withdraw-input-amount').value =
							balance_as_float;
						await this_withdraw.validateAmountInput();
					}
				};
			}

	    if (document.querySelectorAll('.withdraw-action-item').length > 0) {
	      document.querySelectorAll('.withdraw-action-item').forEach((menu) => {
	        let id = menu.getAttribute('id');
	        if (id && this_withdraw.callbacks[id]){
	          let callback = this_withdraw.callbacks[id];
	          menu.addEventListener('click', (e) => {
	            let is_scan = e.currentTarget.classList.contains('scan');
	            if (is_scan) {
	              this_withdraw.hideSaitoHeaderMenu();
	              this_withdraw.overlay.remove();
	            }

	            callback(this_withdraw.app, null, function(msg){
	              if (is_scan) {
	                console.log('callback msg: ', msg);
	                this_withdraw.app.connection.emit('saito-crypto-withdraw-render-request', { 
	                  address: msg
	                });
	              }
	            });
	          });
	        }
	      });
	    }
		}
		
	}

  showError(){
    document.querySelector(
            '.confirm-msg'
          ).innerHTML = `Transfer request unsuccessful <br > Please try again`;
    document
      .querySelector('.confirm-msg-container .spinner')
      .classList.remove('show');
    document
      .querySelector('.withdraw-msg-icon')
      .classList.toggle('hide');
    document
      .querySelector('.withdraw-msg-icon')
      .classList.remove('fa-circle-notch');
    document
      .querySelector('.withdraw-msg-icon')
      .classList.remove('fa-circle-check');
    document
      .querySelector('.withdraw-msg-icon')
      .classList.toggle('fa-circle-xmark');
  }

  hideSaitoHeaderMenu(){
    let components = this.mod.components;
    for(let key in components) {
      if (components[key]?.slug == 'SaitoHeader') {
        let saito_header = components[key];
        saito_header.hideMenu();
      }
    }
  }

  async fetchWithdrawFee(preferred_crypto){
    this_withdraw = this;
    let address = document.querySelector(
          '#withdraw-input-address'
        ).value;
    
    if (address.length > 30) {
      document.querySelector('.withdraw-info-value.fee').innerHTML = 'updating...';
      preferred_crypto.returnWithdrawalFeeForAddress(
        address,
        function (amt) {
          this_withdraw.fee = amt;
          document.querySelector(
            '.withdraw-info-value.fee'
          ).innerHTML = amt + ' ' + preferred_crypto.ticker;
          document.querySelector('#withdraw-fee').value = amt;

          this_withdraw.checkSufficentFee();
        }
      );
    }
    
  }

  async validateAmountInput(){
  	this_withdraw.errors['amount'] = false;
  	let preferred_crypto = await this_withdraw.app.wallet.returnPreferredCrypto();
    // reset errors
    document.querySelector('#withdraw-amount-error').innerHTML = '';
    document.querySelector('#withdraw-amount-error').style.display = 'none';
    let amount = document.querySelector("#withdraw-input-amount").value;

		if (amount != ''){
			amount = Number(amount);
			let amount_avl = Number(document.querySelector('#withdraw-balance').value);
			this_withdraw.fee = Number(this_withdraw.fee);

	   	if (amount <= 0) {
	   		document.querySelector('#withdraw-amount-error').innerHTML = 
				'Error: Amount should be greater than 0';
				this_withdraw.errors['amount'] = true;
			} else if (amount > amount_avl) {
				document.querySelector('#withdraw-amount-error').innerHTML = 
				`Error: Insufficent funds (` +
					amount_avl + ` ` + this_withdraw.ticker +
					` available)`;
				this_withdraw.errors['amount'] = true;	
			}

  	} else {
  		this_withdraw.errors['amount'] = true;
  	}

  	console.log('withdraw error: ', this_withdraw.errors['amount']);

  	if (this_withdraw.errors['amount'] == true) {
    	document.querySelector('#withdraw-amount-error').style.display = 'block';
    }

    this.checkSufficentFee();

  	this.handleErrors();
  }

  async validateAdrressInput(preferred_crypto){ 
  	let this_withdraw = this;
  	this_withdraw.errors['address'] = false;
  	document.querySelector('#withdraw-address-error').innerHTML = '';
	  document.querySelector('#withdraw-address-error').style.display = 'none';

  	let address = document.querySelector(
          '#withdraw-input-address'
        ).value;

  	let valid = await this.app.wallet.isAddressValid(address, preferred_crypto.ticker);

		if(!valid) {
			document.querySelector('#withdraw-address-error').innerHTML = 
			'Error: Invalid '+preferred_crypto.ticker+' address';
			this_withdraw.errors['address'] = true;
		}

		if (this_withdraw.errors['address'] == true) {
			document.querySelector('#withdraw-address-error').style.display = 'block';
		}

		this.handleErrors();
  }

  checkSufficentFee(){
  	if (this_withdraw.fee == null)
  		return;

  	this_withdraw = this;
  	let amount_avl = Number(document.querySelector('#withdraw-balance').value);
		this_withdraw.fee = Number(this_withdraw.fee);
		document.querySelector('#withdraw-fee-error').innerHTML = '';
    document.querySelector('#withdraw-fee-error').style.display = 'none';
    this.errors['fee'] = false;

		if (amount_avl < this_withdraw.fee) {
			document.querySelector('#withdraw-fee-error').innerHTML = 
				'Insufficent fee for withdraw';
			document.querySelector('#withdraw-fee-error').style.display = 'block';
			this.errors['fee'] = true;
		}

		this.handleErrors();
  }


  handleErrors(){
  	if (this.errors['fee'] != false || this.errors['amount'] != false || this.errors['address'] != false) {
  		document.querySelector('#saito-overlay-submit').classList.add('disabled');	
  	} else {
  		document.querySelector('#saito-overlay-submit').classList.remove('disabled');
  	}
  }

  resetErrors(){
  	this.errors = {
    	'amount': false,
    	'address': false,
    	'fee': false
    };
    document.querySelector('#withdraw-address-error').innerHTML = '';
    document.querySelector('#withdraw-address-error').style.display = 'none';
    document.querySelector('#withdraw-amount-error').innerHTML = '';
    document.querySelector('#withdraw-amount-error').style.display = 'none';
    document.querySelector('#withdraw-fee-error').innerHTML = '';
    document.querySelector('#withdraw-fee-error').style.display = 'none';

    this.handleErrors();
  }
}

module.exports = Withdraw;