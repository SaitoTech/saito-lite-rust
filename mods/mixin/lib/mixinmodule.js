/*********************************************************************************

 WEB3 CRYPTO MODULE v.2 - Mixin

 Extends the generic web3 crypto module to add auto-support for cryptos that are
 supported by the Mixin module.

 returnPrivateKey()
 async sendPayment(amount="", recipient="", unique_hash="")
 async receivePayment(amount="", sender="", recipient="", timestamp=0, unique_hash="")


 Uses Mixin API:
 ----------------
 createAccount()
 createDepositAddress()

 fetchSafeUtxoBalance()
 fetchUtxo()
 fetchSafeSnapshots()
 fetchPendingDeposits()

 sendInNetworkTransferRequest()
 sendExternalNetworkTransferRequest()

 returnNetworkInfo()
 checkWithdrawalFee()

 sendFetchUserTransaction()
 sendFetchUserByPublicKeyTransaction()
 sendFetchAddressByUserIdTransaction()

 deposit[]
 mixin.privatekey
 mixin.user_id


 **********************************************************************************/
const CryptoModule = require('./../../../lib/templates/cryptomodule');
const getUuid = require('uuid-by-string');
const WAValidator = require('multicoin-address-validator');

class MixinModule extends CryptoModule {
	constructor(app, ticker, mixin_mod, asset_id) {
		super(app, ticker);

		this.mixin = mixin_mod;

		this.asset_id = asset_id;
		this.chain_id = '';

		this.balance_timestamp_last_fetched = 0;
		this.minimum_delay_between_balance_queries = 4000;

		this.confirmations = 100;
	}

	async activate() {
		if (this.mixin.account_created == 0) {
			this.app.connection.emit('header-install-crypto', this.ticker);
			await this.mixin.createAccount(async (res) => {
				if (Object.keys(res).length > 0) {
					await this.mixin.createDepositAddress(this.asset_id);
					super.activate();
				} else {
					salert('Having problem generating key for ' + ' ' + this.ticker);
					await this.app.wallet.setPreferredCrypto('SAITO');
				}
			});
		} else {
			if (!this.address) {
				this.app.connection.emit('header-install-crypto', this.ticker);
				await this.mixin.createDepositAddress(this.asset_id);
			}

			super.activate();
		}
	}

	/**
	 * Abstract method which should get balance from underlying crypto endpoint
	 * @abstract
	 * @return {Number}
	 */
	async checkBalance() {
		let now = new Date().getTime();
		if (now - this.balance_timestamp_last_fetched > this.minimum_delay_between_balance_queries) {
			console.log('MixinModule Query balance for ' + this.ticker);

			this.balance_timestamp_last_fetched = now;

			await this.mixin.fetchSafeUtxoBalance(this.asset_id);
		} else {
			console.log('MixinModule warning: too soon to query balance updates');
		}
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
		try {
			let r = recipient.split('|');

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
				await this.mixin.sendFetchUserTransaction(
					{
						address: recipient
					},
					function (res) {
						console.log('Cross network callback complete');
						if (res?.user_id) {
							internal_transfer = true;
							destination = res.user_id;
						}
					}
				);
			}

			console.log('Initiate mixin transfer, internally? ', internal_transfer);

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
		} catch (err) {
			console.log('send payment err: ', err);
		}
	}

	//
	// Reference for how we used to package the mixin address bar...
	//
	formatAddress() {
		return this.address + '|' + this.mixin.mixin.user_id + '|' + 'mixin';
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
	async receivePayment(amount = '', sender = '', recipient = '', timestamp = 0, unique_hash = '') {
		let this_self = this;
		let received_status = 0;
		let split = sender.split('|');

		console.log('split: ', split);

		let opponent_id = split[1];
		sender = split[0];

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
				for (let i = d.length - 1; i >= 0; i--) {
					let row = d[i];

					//compare timestamps
					let snapshot_date = new Date(row.created_at);
					let received_date = new Date(timestamp);

					console.log(
						'received_datetime - snapshot_datetime - diff : ',
						received_date,
						snapshot_date,
						snapshot_date - received_date
					);

					if (snapshot_date - received_date > 0) {
						let snapshot_asset_id = row.asset_id;

						console.log('*************************************');
						console.log('snapshot response ///');

						// filter out specific asset
						if (snapshot_asset_id == this_self.asset_id) {
							console.log('assets matched ///');

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

								if (snapshot_amount == amount) {
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

	returnNetworkInfo() {
		return this.mixin.returnNetworkInfo(this.asset_id);
	}

	//
	// this function creates a Mixin address associated with the account in order to check
	// if it can offer zero-fee in-network transfers or requires a network fee to be paid
	// in order to process the payment.
	//
	async checkWithdrawalFeeForAddress(recipient = '', mycallback) {
		if (recipient == '') {
			return mycallback(0);
		}

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
		await this.mixin.sendFetchUserTransaction(
			{
				address: recipient
			},
			function (res) {
				user_data = res;
			}
		);

		//
		// return 0 fee if in-network address, or estimate if external
		//
		if (typeof user_data.user_id != 'undefined') {
			return mycallback(0);
		} else {
			let fee = await this.mixin.returnWithdrawalFee(this.asset_id, recipient);
			if (fee !== false) {
				return mycallback(fee);
			}

			return mycallback(0);
		}
	}

	/**
	 * Abstract method which returns snapshot of asset withdrawls, deposits
	 * @abstract
	 * @return {Function} Callback function
	 */
	async returnHistory(callback = null) {
		let this_self = this;
		let d = await this.mixin.fetchSafeSnapshots(this.asset_id, 1000, async function (d) {
			console.log('mixin tx history:', d);

			let html = '';
			if (d.length > 0) {
				for (let i = d.length - 1; i >= 0; i--) {
					let row = d[i];
					let created_at = row.created_at.slice(0, 19).replace('T', ' ');

					//Parse it as UTC time
					let datetime = new Date(created_at + 'Z');
					let amount = Number(row.amount);
					let type = amount > 0 ? 'Deposit' : 'Withdraw';

					if (i < d.length - 1) {
						if (Number(d[i + 1].amount) > 0) {
							balance = balance - Math.abs(Number(d[i + 1].amount));
						} else {
							balance = balance + Math.abs(Number(d[i + 1].amount));
						}
					}

					let balance_as_float = parseFloat(balance);

					let opponnent = typeof d[i].opponent_id != 'undefined' ? d[i].opponent_id : null;

					let sender_html = '';
					if (opponnent != null && opponnent != '') {
						// Showing details for internal mixin transaction details

						let user_data = null;
						if (opponnent in tmp_user_data) {
							user_data = tmp_user_data[opponnent];
						} else {
							user_data = await this_self.getAddressByUserId(opponnent, this_self.asset_id);
							tmp_user_data[opponnent] = user_data;
						}

						if (user_data != null) {
							let public_key = user_data.publickey;
							let address = user_data.address;

							let identicon = null;
							if (public_key in tmp_identicon) {
								identicon = tmp_identicon[public_key];
							} else {
								identicon = this_self.app.keychain.returnIdenticon(public_key);
								tmp_identicon[public_key] = identicon;
							}

							let username = null;
							if (public_key in tmp_identifer) {
								username = tmp_identifer[public_key];
							} else {
								username = this_self.app.keychain.returnIdentifierByPublicKey(public_key, true);
								tmp_identifer[public_key] = username;
							}

							sender_html = `<div class="saito-identicon-container">
						        <img class="saito-identicon" src="${identicon}">  
						        <div class="history-address-container">
						          <div class="history-to-publickey">${username}</div>
						          ${
												address != ''
													? `
						          	 <div class="history-to-address-container">
									  <div class="history-to-address">${address}</div>
									  <i class="history-copy-address fas fa-copy"
									  data-address="${address}">
									  </i>
									</div>
						          `
													: ``
											}
						        </div>
						      </div>`;
						}
					} else {
						// Mixin sdk throwing error when fetching tx details.
						// Temproraily redirecting users to mixin explorer for
						// external transaction details
						let trans_hash = d[i].transaction_hash;
						sender_html = `<a class="history-tx-link" href="https://viewblock.io/mixin/tx/${trans_hash}"
       							target="_blank">
       								<div class="history-tx-id">${trans_hash}</div>
       								<i class="fa-solid fa-arrow-up-right-from-square"></i>
       							</a>`;
					}

					html += `<div class='saito-table-row'>
                    <div class='mixin-his-created-at'>${created_at}</div>
                    <div>${type}</div>
                    <div class='${type.toLowerCase()}'>${amount} ${this_self.mod.ticker}</div>
                    <div>${nf.format(balance_as_float).toString()} ${this_self.mod.ticker}</div>
                    <div>${sender_html}</div>
                  </div>`;
				}
			}

			return callback(html);
		});
	}

	async returnUtxo(state = 'unspent', limit = 500, order = 'DESC', callback = null) {
		return await this.mixin.fetchUtxo(state, limit, order, callback);
	}

	async returnAddressFromPublicKey(publicKey) {
		this_self = this;
		try {

			//check if key exists in keychain
			let address = await super.returnAddressFromPublicKey(publicKey);

			if (address) {
				return;
			}

			// if it doesnt exist fetch it from node db
			return this.mixin.sendFetchUserByPublicKeyTransaction(
				{
					publicKey: publicKey,
					asset_id: this.asset_id
				},
				function (res) {
					console.log('miximodule res: ', res);
					// this.address + '|' + this.mixin.mixin.user_id + '|' + 'mixin';
					if (res.length > 0) {
						for (let i = 0; i < res.length; i++) {
							console.log(res[i].asset_id, ' - ', this_self.asset_id, ' - ', res[i].asset_id == this_self.asset_id);
							if (res[i].asset_id == this_self.asset_id) {
								let address = res[i].address;
								if (res[i]?.user_id){
									address += "|" + res[i].user_id + "|mixin";
								}
								// save address to keychain if publickey exists in keychain
								this_self.app.keychain.addCryptoAddress(publicKey, this_self.ticker, address);
								return address;
							}
						}
					}
				}
			);
		} catch (err) {
			console.error('Error getMixinAddress: ', err);
			return null;
		}
	}

	// Return history
	async getAddressByUserId(user_id, asset_id) {
		let address = null;
		await this.mixin.sendFetchAddressByUserIdTransaction(
			{
				user_id: user_id,
				asset_id: asset_id
			},
			function (res) {
				if (res.length > 0) {
					address = res[0];
				}
			}
		);
		return address;
	}

	validateAddress(address) {

		if (address.includes("|")){
			let r = address.split('|');
			address = r[0];
		}

		// suported cryptos by validator package
		//https://www.npmjs.com/package/multicoin-address-validator?activeTab=readme
		try {
			return WAValidator.validate(address, this.ticker);
		} catch (err) {
			console.error("Error 'validateAddress' MixinModule: ", err);
		}
	}

	async fetchPendingDeposits(callback = null) {
		return await this.mixin.fetchPendingDeposits(this.asset_id, this.address, callback);
	}
}

module.exports = MixinModule;
