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
		this.minimum_delay_between_balance_queries = 20000; // if it hasn't been 10 seconds since last fetch, fetch
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
			if (this.mixin.mixin.session_id === '') {
				this.app.connection.emit('create-mixin-account');
				await this.mixin.createAccount(async() => {
					await this.mixin.createDepositAddress(this_self.asset_id);
					super.activate();
				});
			}
		} else {
			super.activate();
		}
	}

	hasReceivedPayment(amount, sender, receiver, timestamp, unique_hash) {
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
			await this.mixin.fetchSafeUtxo(this.asset_id);

			this.app.connection.emit("update_balance", this.app.wallet);
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

		console.log('send sendPayment');
		console.log('Recipient: ' + recipient);

		//
		// internal MIXIN transfer
		//
		if (r.length >= 2) {
			if (r[2] === 'mixin') {
				console.log('Send to Mixin address');
				let opponent_address_id = r[1];
				let trace_id = await this.mixin.sendInNetworkTransferRequest(
					this.asset_id,
					opponent_address_id,
					amount,
					unique_hash
				);
				if (trace_id?.error) {
					return '';
				}
				this.saveOutboundPayment(
					amount,
					this.returnAddress(),
					recipient,
					ts,
					trace_id
				);
				return trace_id;
			}
		}

		//
		// check if address exists in local db
		//
		let user_data = null;
		await this.mixin.sendFetchUserTransaction({
			address: recipient
		}, function(res){
			console.log('MixinModule user_data', res);
			user_data = res;
		});
		
		console.log('user_data inside sendPayment', user_data);

		//
		// in-network transfer if address exists in db
		//
		if (typeof user_data.user_id != 'undefined') {

			await this.mixin.sendInNetworkTransferRequest(
				this.asset_id,
				user_data.user_id,
				amount,
				unique_hash
			);

			return;

			// this.saveOutboundPayment(
			// 	amount,
			// 	this.returnAddress(),
			// 	recipient,
			// 	ts,
			// 	unique_hash
			// );
			return unique_hash;

			//
			// create withdrawal address and save
			//
		} else {
			
			// send external withdrawl
		}

		} catch(err) {
			console.log('send payment err: ', err);
		}

//		this.mixin.withdrawAmount(this.asset_id, recipient, amount);
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
	receivePayment(
		amount = '',
		sender = '',
		recipient = '',
		timestamp = 0,
		unique_hash = ''
	) {
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
		if (
			this.hasReceivedPayment(
				amount,
				sender,
				recipient,
				timestamp,
				unique_hash
			) == 1
		) {
			return 1;
		}
		this.mixin.fetchDeposits(this.asset_id, this.ticker, (d) => {});
		return 0;
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
			console.log('MixinModule user_data', res);
			user_data = res;
		});
		
		console.log('user_data', user_data);

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

}

module.exports = MixinModule;
