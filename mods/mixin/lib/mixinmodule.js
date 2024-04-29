/*********************************************************************************

 WEB3 CRYPTO MODULE v.2 - Mixin

 Extends the generic web3 crypto module to add auto-support for cryptos that are
 supported by the Mixin module.

 returnAddress()
 returnPrivateKey()
 async returnBalance(address = "")
 async sendPayment(amount="", recipient="", unique_hash="")
 async receivePayment(amount="", sender="", recipient="", timestamp=0, unique_hash="")


 TODO:

 we currently SEND the payments but do not record if the payment has been a success
 so there are failure modes if the effort to send has been unsuccessful. the same
 trace_id will be sent with each request so we should not have multiple payments
 through.



 **********************************************************************************/
const CryptoModule = require('./../../../lib/templates/cryptomodule');
const getUuid = require('uuid-by-string');
const WAValidator = require('multicoin-address-validator');

class MixinModule extends CryptoModule {
	constructor(app, ticker, mixin_mod, asset_id) {
		super(app);

		this.app = app;
		this.ticker = ticker;
		this.name = ticker;
		this.categories = 'Cryptocurrency';
		this.mixin = mixin_mod;

		this.asset_id = asset_id;
		this.chain_id = '';
		this.icon_url = '';
		this.balance = '0.0';
		this.balance_timestamp_last_fetched = 0;
		this.minimum_delay_between_balance_queries = 4000;
		this.deposit_entries = {};
		this.tag = '';
		this.price_btc = 0;
		this.price_usd = 0;
		this.change_btc = 0;
		this.change_usd = 0;
		this.asset_key = 0;
		this.mixin_id = '';
		this.reserve = '';
		this.confirmations = 100;
		this.capitalization = 0;
		this.liquidity = '';

		return this;
	}

	onPeerServiceUp(app, peer, service = {}) {
		if (!peer.hasService('mixin')) {
			return;
		}

		if (this.mixin) {
			if (
				this.app.wallet.preferred_crypto !== 'SAITO' &&
				this.app.wallet.preferred_crypto !== ''
			) {
				if (this.mixin.account_created == 0) {
					//
					// not every crypto should trigger account creation
					//
					let c = this.app.modules.returnModule(
						this.app.wallet.preferred_crypto
					);
					if (!c.asset_id) {
						return;
					}
					console.log(
						'trying to install module -- create account requires network up though...?'
					);
					this.mixin.createAccount();
				}
			}
		}
	}

	async activate() {
		let this_self = this;
		if (this.mixin.account_created == 0) {
				this.app.connection.emit('create-mixin-account');
				await this.mixin.createAccount(async(res) => {
					if (Object.keys(res).length > 0) {
						await this.mixin.createDepositAddress(this_self.asset_id);
						super.activate();
					} else {
						salert('Having problem generating key for '+' '+this_self.ticker);
						await this.app.wallet.setPreferredCrypto('SAITO', 1);
						this.app.connection.emit('header-update-balance');
						this.app.connection.emit('update_identifier', this.publicKey);
					}
				});
		} else {
			super.activate();
		}
	}

	hasReceivedPayment(amount, sender, receiver, timestamp, unique_hash) {
	
		console.log('**********************************************************')
		console.log('amount, sender, receiver, timestamp, unique_hash');
		console.log(amount, sender, receiver, timestamp, unique_hash);

		let trace_id = getUuid(unique_hash);

		for (let i = 0; i < this.mixin.deposits.length; i++) {
			if (this.mixin.deposits[i].trace_id === trace_id) {
				return 1;
			}
		}

		for (let i = 0; i < this.options.transfers_inbound.length; i++) {
			if (
				this.options.transfers_inbound[i].amount === amount &&
				this.options.transfers_inbound[i].timestamp >= timestamp
			) {
				return 1;
			}
		}
		return 0;
	}

	hasSentPayment(amount, sender, receiver, timestamp, unique_hash) {
		for (let i = 0; i < this.options.transfers_outbound.length; i++) {
			if (
				this.options.transfers_outbound[i].amount === amount &&
				this.options.transfers_outbound[i].timestamp >= timestamp
			) {
				return 1;
			}
		}
		return 0;
	}

	/**
	 * Abstract method which should get balance from underlying crypto endpoint
	 * @abstract
	 * @return {Number}
	 */
	async returnBalance() {
		console.log('Query balance for ' + this.ticker);
		if (
			new Date().getTime() - this.balance_timestamp_last_fetched >
			this.minimum_delay_between_balance_queries
		) {
			console.log(
				'Return Balance: ',
				this.balance_timestamp_last_fetched
			);
			this.balance_timestamp_last_fetched = new Date().getTime();
			await this.mixin.fetchSafeUtxoBalance(this.asset_id);

			this.app.connection.emit('header-update-balance');
		}
		return this.balance;
	}

	renderModalSelectCrypto(app, mod, cryptomod) {
		return `
    <div class="mixin_crypto_overlay" id="mixin_crypto_overlay">

      <div class="mixin_crypto_title">Heads up!</div>

      <div class="mixin_crypto_warning">
      Third party cryptocurrency support is in active development. Please take precautions such
       as only using a small amount of funds and avoiding sharing sensitive information. 
       Check for updates regularly and report any suspicious activity. 
       <br >
       Thank you for helping us improve the experience.
      </div>

      <button class="mixin_risk_acknowledge button">i understand</button>

    </div>
  `;
	}

	attachEventsModalSelectCrypto(app, mod, cryptomod) {
		let ab = document.querySelector('.mixin_risk_acknowledge');
		ab.onclick = (e) => {
			cryptomod.modal_overlay.hide(function () {
				setTimeout(function () {
					document
						.querySelector('#settings-dropdown')
						.classList.add('show-right-sidebar');
				}, 500);
			});
		};
	}

	/**
	 * Abstract method which should transfer tokens via the crypto endpoint
	 * @abstract
	 * @param {Number} howMuch - How much of the token to transfer
	 * @param {String} to - Pubkey/address to send to
	 * @abstract
	 * @return {Number}
	 */
	async sendPayment(amount = '', recipient = '', unique_hash = '') {
		try{
			let r = recipient.split('|');
			let ts = new Date().getTime();
			let internal_transfer = false;
			let destination = recipient;
			let res = {};

			console.log('send sendPayment');
			console.log('Recipient: ' + recipient);

			// if address has |mixin| concat
			if (r.length >= 2) {
				if (r[2] === 'mixin') {
					console.log('Send to Mixin address');
					internal_transfer = true;
					destination = r[1];
				}
			}
			
			// check if address exists in local db
			if (internal_transfer == false) { 
				await this.mixin.sendFetchUserTransaction({
					address: recipient
				}, function(res){
					let user_data = res;
					if (typeof user_data.user_id != 'undefined') {
						internal_transfer = true;
						destination = user_data.user_id;
					}
				});
			}
			
			// internal mixin transfer
			if (internal_transfer) {
				res = await this.mixin.sendInNetworkTransferRequest(
					this.asset_id,
					destination,
					amount,
					unique_hash
				);
			} else {
				// address is external, send external withdrawl request
				res = await this.mixin.sendExternalNetworkTransferRequest(
					this.asset_id,
					destination,
					amount,
					unique_hash
				);
			}

			if (res.status == 200) {
				return unique_hash;
			} else {
				console.error(res.message);
				return '';
			}

		} catch(err) {
			console.log('send payment err: ', err);
		}
	}

	/**
	 * Abstract method which should get pubkey/address
	 * @abstract
	 * @return {String} Pubkey/address
	 */
	returnAddress() {
		if (this.destination === '') {
			return 'unknown address';
		}
		return (
			this.destination + '|' + this.mixin.mixin.user_id + '|' + 'mixin'
		);
	}

	formatAddress(address) {
		return address; //+ "|" + this.mixin.mixin.user_id + "|" + "mixin";
	}

	/**
	 * Abstract method which should get private key
	 * @abstract
	 * @return {String} Private Key
	 */
	returnPrivateKey() {
		return this.mixin.mixin.privatekey;
	}

	/**
	 * Searches for a payment which matches the criteria specified in the parameters.
	 * @abstract
	 * @param {Number} howMuch - How much of the token was transferred
	 * @param {String} from - Pubkey/address the transasction was sent from
	 * @param {String} to - Pubkey/address the transasction was sent to
	 * @param {timestamp} to - timestamp after which the transaction was sent
	 * @return {Boolean}
	 */
	async receivePayment(
		amount = '',
		sender = '',
		recipient = '',
		timestamp = 0,
		unique_hash = ''
	) {
		let this_self = this;
		let received_status = 0;
		let split = sender.split('|');

		console.log('split: ', split);

		let opponent_id = split[1];
		sender = split[0];

		//
		// mixin transfers will be registered with a specific TRACE_ID
		//
		// so we can use this TRACE_ID to monitor transactions that have been
		// made from other accounts.
		//
		let trace_id = getUuid(unique_hash);

		//
		// the mixin module might have a record of this already stored locally
		//

		console.log('////////////////////////////////////////////////////');
		console.log('inside receivePayment ///');
		console.log('amount, sender, timestamp');
		console.log(amount, sender, timestamp);

		//snapshot_datetime:  Mon Feb 12 2024 16:31:44 GMT+0500 (Pakistan Standard Time)
		//mixinmodule.js:454 received_datetime:  Sun Sep 20 56111 06:01:14 GMT+0500 (Pakistan Standard Time)

		let status = await this.mixin.fetchUtxo('unspent', 100000, 'DESC', (d) => {

			console.log('utxo: ', d);

			if (d.length > 0) {

				for (let i = (d.length - 1); i >= 0; i--) {
					let row = d[i];

					//compare timestamps
					let snapshot_date = new Date(row.created_at);
					let received_date = new Date(timestamp);

					console.log('received_datetime - snapshot_datetime - diff : ', 
						received_date, snapshot_date, (snapshot_date - received_date));

					if (snapshot_date - received_date > 0) {

						let snapshot_asset_id = row.asset_id;

						console.log('*************************************');				
						console.log("snapshot response ///");

						// filter out specific asset
						if (snapshot_asset_id == this_self.asset_id) {

							console.log("assets matched ///");

							let senders = row.senders;

							console.log('snapshot_opponent_id: ', senders);
							console.log('opponent_id: ', opponent_id);
							console.log('oponnent id exists:', senders.includes(opponent_id));


							// filter out opponents
							if (senders.includes(opponent_id)) {

								console.log('opponent_id matched ////');

								let snapshot_amount = Number(row.amount);
								console.log('row.amount: ', row.amount);
								console.log('snapshot_amount: ', snapshot_amount);

								if (snapshot_amount == amount){
									
									console.log('match found ///');
									
									return 1;
								}
								
							}
						}
				
					}

				}

				return 0;
			}
		});


		console.log('status / ////////////////////////////');
		console.log(status);
		return status;
	}

	/**
	 * Abstract method which should get withdrawl fee
	 * @abstract
	 * @return {Function} Callback function
	 */
	returnWithdrawalFee(asset_id, recipient) {
		return this.mixin.checkWithdrawalFee(asset_id, recipient);
	}


	returnNetworkFee(asset_id) {
		return this.mixin.checkNetworkFee(asset_id);
	}


	//
	// this function creates a Mixin address associated with the account in order to check
	// if it can offer zero-fee in-network transfers or requires a network fee to be paid
	// in order to process the payment.
	//
	async returnWithdrawalFeeForAddress(recipient = '', mycallback) {
		let r = recipient.split('|');
		let ts = new Date().getTime();

		//
		// internal MIXIN transfer
		//
		if (r.length >= 2) {
			if (r[2] === 'mixin') {
				return mycallback(0);
			}
		}

		//
		// check if address exists in local db
		//
		let user_data = null;
		await this.mixin.sendFetchUserTransaction({
			address: recipient
		}, function(res){
			user_data = res;
		});

		//
		// return 0 fee if in-network address, or estimate if external
		//
		if (typeof user_data.user_id != 'undefined') {
			return mycallback(0);
		} else {
			let fee = await this.returnWithdrawalFee(this.asset_id, recipient);
			return mycallback(fee);
		}
	}

	/**
	 * Abstract method which returns snapshot of asset withdrawls, deposits
	 * @abstract
	 * @return {Function} Callback function
	 */
	returnHistory(asset_id = '', records = 20, callback = null) {
		return this.mixin.fetchSafeSnapshots(asset_id, records, callback);
	}

	async returnUtxo(state = 'unspent', limit = 500, order = 'DESC', callback = null) {
		return await this.mixin.fetchUtxo(state, limit, order, callback);
	}

	async getMixinUser(address = '', callback = null) {
		return await this.mixin.sendFetchUserTransaction({address: address}, function(res){
			return callback(res);
		});
	}

	async getMixinAddress(publicKey, ticker, callback = null) {
		this_self = this;
		try {
			if (publicKey == '' || ticker == '') {
				return {};
			}

			//check if key exists in keychain
			let return_data = null;
			let key_exists = false;
			let keys = this.app.keychain.returnKeys();
			let asset_id = this.getAssetIdByTicker(ticker);

			console.log('asset_id: ///////////////////////', asset_id);

			for(let i=0; i< keys.length; i++) {
				// check key exists in keychain
				if (publicKey == keys[i].publicKey) {
					key_exists = true;
					//check if specific asset address exists
					if (typeof keys[i].crypto_addresses != 'undefined') {
						let crypto_addresses = keys[i].crypto_addresses;
						console.log('crypto_addresses in key:', crypto_addresses);
						for (const key in crypto_addresses) {
							if (key == ticker) {
								return_data = crypto_addresses;
								break;
							}
						}
					}	
				}
			}

			if (return_data == null) {
				// if it doesnt exist fetch it from node db
				await this.mixin.sendFetchUserByPublicKeyTransaction({
					publicKey: publicKey,
					asset_id: asset_id
				}, 
				async function(res){
					console.log('miximodule res: ', res);
					if (res.length > 0) {
						for(let i=0; i< res.length; i++) {

							console.log(res[i].asset_id, ' - ' , asset_id, ' - ', res[i].asset_id == asset_id);

							if (res[i].asset_id == asset_id) {
								if (key_exists) {
									// save address to keychain if publickey exists in keychain
									await this_self.addCryptoAddressToKey(publicKey, res[i].address, ticker);
								}
								let obj = {};
								obj[ticker] = res[i].address;
								return_data = obj;
								break;
							}
						}
					}
				});
			}

			console.log('return_data: ', return_data);
			return callback(return_data);
		} catch(err) {
			console.error("Error getMixinAddress: ", err);
		}
	}

	async getAddressByUserId(user_id, asset_id){
		let address = null;
		await this.mixin.sendFetchAddressByUserIdTransaction({
			user_id: user_id,
			asset_id: asset_id
		}, 
		function(res){
			if (res.length > 0) {
				address = res[0];
			}
		});
		return address;
	}

	async addCryptoAddressToKey(publicKey, address, ticker){
		console.log('address, asset_id', address, ticker);
		let crypto_addresses = {};
		crypto_addresses[ticker] = address;
		this.app.keychain.addKey(publicKey, {
			crypto_addresses: crypto_addresses
		});
	}

	getAssetIdByTicker(ticker){
		let available_cryptos = this.app.wallet.returnInstalledCryptos();
		console.log(available_cryptos);
		for (let i=0; i<available_cryptos.length; i++) {
			console.log(available_cryptos[i].ticker, ' - ' , ticker, ' - ', available_cryptos[i].ticker == ticker);
			if (available_cryptos[i].ticker == ticker) {
				if (typeof available_cryptos[i].asset_id != 'undefined') {
					return available_cryptos[i].asset_id;
				}
			}
		}

		return null;
	}


  async formatBalance(precision = 2) {
		let balance = await this.returnBalance();

		if (typeof balance == 'undefined') {
			balance = '0.00';
		}

		let locale = window.navigator?.language
			? window.navigator?.language
			: 'en-US';
		let nf = new Intl.NumberFormat(locale, {
			minimumFractionDigits: 2,
			maximumFractionDigits: precision
		});

		let balance_as_float = parseFloat(balance);
		return nf.format(balance_as_float).toString();
  }
  
  async validateAddress(address, ticker){
		// suported cryptos by validator package
		//https://www.npmjs.com/package/multicoin-address-validator?activeTab=readme		
		try {
			return WAValidator.validate(address, ticker);
		} catch(err) {
			console.error("Error 'validateAddress' MixinModule: ", err);
		}
	}

	async fetchTransaction(transaction_id){
		return await this.mixin.fetchSafeTransaction(transaction_id, function(res){
			console.log('inside miximodule fetchTransaction ///', res);
		});
	}

}

module.exports = MixinModule;
