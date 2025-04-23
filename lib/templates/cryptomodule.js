/*********************************************************************************

 WEB3 CRYPTO MODULE v.2

 This is a general parent class for modules that wish to define a cryptocurrency 
 that can interact with the Saito ecosystem. It introduces generic  functions that 
 should be implemented by these modules to handle web3 cryptos interaction with 
 their external blockchains or  networks. 

 To understand how your module can integrate cryptocurrencies, the API is handled
 in lib/saito/wallet.ts

	Minimum extension functionality: 
	-- checkBalance
	-- returnPrivateKey
	-- sendPayment
	-- receivePayment
	-- returnHistory
	-- checkWithdrawalFeeForAddress

**********************************************************************************/
const ModTemplate = require('./modtemplate');

class CryptoModule extends ModTemplate {
	/**
	 * Initialize CryptoModule and check that subclass overrides abstract functions
	 * @param {Object} app - Saito Application Context
	 * @param {String} ticker - Ticker symbol of underlying Cryptocurrency
	 * @example
	 * constructor(app, ticker, ...) {
	 *   super(app, ticker);
	 *   ...
	 * }
	 */
	constructor(app, ticker) {
		super(app);

		this.app = app;
		this.ticker = ticker;
		this.name = ticker;
		this.categories = 'Cryptocurrency';
		this.description = '';

		//
		// some modules issue warnings to users on selection
		// see ui/saito-crypto/overlays/activate.js
		//
		this.warning = '';
		this.introduction = '';
		this.confirmations = 0;

		//
		// quick sanity check -- cache the balance
		//
		this.balance = '0.0';
		this.address = '';

		//
		// info stored in options file, you can safely add items as necessary
		//
		this.options = {};
		this.options.isActivated = false;
	}

	/**
	 * Saito Module initialize function
	 * @param {*} app
	 */
	async initialize(app) {
		await super.initialize(app);

		//
		// We save the state of our crypto wallet local storage (options file)
		//
		this.load();

		if (this.ticker === this.app.wallet.returnPreferredCryptoTicker()) {
			await this.activate();
			// if UI is enabled, will re-render the qr code, ticker, and balance in the hamburger menu
			this.app.connection.emit('header-update-crypto');
		}
	}

	///////////////////////////////////////////////
	// Accept payments even from blacklisted people
	///////////////////////////////////////////////
	respondTo(type = '', obj) {
		if (type === 'saito-moderation-app') {
			return {
				filter_func: (mod = null, tx = null) => {
					if (tx == null || mod == null || !tx?.from) {
						return 0;
					}

					//This function is called with every module for some reasons
					if (mod.name !== this.name) {
						return 0;
					}

					return 1;
				}
			};
		}
	}

	async onConfirmation(blk, tx, conf) {
		if (!this.app.BROWSER){
			// no need to process on a server, purely browserland user friendly parsing
			return;
		}

		if (conf == 0) {

			console.log("Am I listening? ", this.name);

			if (!tx.isTo(this.publicKey) || tx.isFrom(this.publicKey)) {
				return;
			}

			let txmsg = tx.returnMessage();

			if (txmsg.module !== this.name) {
				return;
			}

			console.log('*****************');
			console.log(txmsg);

			if (txmsg.request === 'crypto payment') {
				this.receivePaymentTransaction(tx);
			}
		}
	}

	async sendPaymentTransaction(publicKey, from_address, to_address, amount, hash) {
		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(publicKey);

		newtx.msg = {
			module: this.name,
			request: 'crypto payment',
			amount,
			from: from_address,
			to: to_address,
			hash
		};

		await newtx.sign();
		await this.app.network.propagateTransaction(newtx);

		console.log('Sent sendPaymentTransaction');
	}

	receivePaymentTransaction(tx) {
		console.log('receivePaymentTransaction');

		let txmsg = tx.returnMessage();

		let expected_payment = false;

		if (this.options?.transfers_inbound) {
			for (let i = 0; i < this.options.transfers_inbound.length; i++) {
				if (this.options.transfers_inbound[i] == txmsg.hash) {
					expected_payment = true;
					this.options.transfers_inbound.splice(i, 1);
					this.save();
					break;
				}
			}
		}

		if (expected_payment) {
			this.app.connection.emit('saito-crypto-receive-confirm', txmsg);
		} else {
			siteMessage(
				`${txmsg.amount} ${this.ticker} inbound from ${this.app.keychain.returnUsername(
					tx.from[0].publicKey
				)}`, 3000
			);
		}
	}

	saveInboundPayment(hash) {
		if (!this.options?.transfers_inbound) {
			this.options.transfers_inbound = [];
		}

		if (!this.options.transfers_inbound.includes(hash)) {
			this.options.transfers_inbound.push(hash);
			this.save();
			return { hash };
		} else {
			console.warn('Already saved expected payment');
			return { err: 'Already saved expected payment' };
		}
	}

	//
	// Please include a small image at this location
	//
	returnLogo() {
		return `/${this.ticker.toLowerCase()}/img/logo.png`;
	}

	/**
	 * @return true/false as to whether the crypto module is installed/activated (e.g. has a valid address)
	 */
	isActivated() {
		//
		// modules might want to know which cryptos are activated before the
		// crypto modules themselves have initialize(app), in which case we
		// have a fallback.
		//
		if (this.app.options?.crypto) {
			if (this.app.options.crypto[this.ticker]) {
				if (this.app.options.crypto[this.ticker].isActivated) {
					return true;
				}
			}
		}

		return this.options.isActivated;
	}

	/**
	 * isActivated is an optional flag that allows users to enable a crypto module.
	 * This is needed to accomodate UX in the case that a particular module might
	 * require significant resources.
	 */
	async activate() {
		await this.checkBalance();

		this.app.connection.emit('crypto-activated', this.ticker);

		this.options.isActivated = true;
		this.save();
	}

	/**
	 *  This function exists only to create a potential stop point in receivePayment
	 *  Instead of refactoring it into oblivion, the code is interesting and may be a good
	 *  reference for connecting an event listener to receivePayment in leiu of repeated polling
	 */
	onIsActivated() {
		return new Promise((resolve, reject) => {
			if (this.isActivated()) {
				resolve();
			} else {
				this.app.connection.on('crypto-activated', (ticker) => {
					if (ticker === this.ticker) {
						resolve();
					}
				});

				this.activate();
			}
		});
	}

	/**
	 * Synchronous getter of crypto balance
	 * @return {String} cached balance
	 */
	returnBalance() {
		return this.balance;
	}

	/**
	 * Abstract method which should get pubkey/address
	 * @abstract
	 * @return {String} Pubkey/address
	 */
	returnAddress() {
		try {
			return this.address;
		} catch (error) {
			console.error('Error returnAddress:', error);
		}
	}

	formatAddress() {
		return this.returnAddress();
	}

	/**
	 * load state of this module from local storage
	 */
	load() {
		//
		// info stored in options file
		//

		if (this.app?.options?.crypto) {
			if (this.app.options.crypto[this.ticker]) {
				this.options = this.app.options.crypto[this.ticker];

				// For convenience we put balance and address at the top level of the module
				if (this.options?.balance && Number(this.balance)==0) {
					this.balance = this.options.balance;
				}
				
				if (this.options?.address && !this?.address) {
					this.address = this.options.address;	
				}
			}
		}
	}

	/**
	 * save state of this module to local storage
	 */
	save() {
		if (!this.app?.options?.crypto) {
			this.app.options.crypto = {};
		}
		if (!this.app.options.crypto[this.ticker]) {
			this.app.options.crypto[this.ticker] = {};
		}

		//
		// Update the fields that we duplicte directly in the module
		//
		this.options.balance = this.balance;
		this.options.address = this.address;

		if (!this.options?.transfers_inbound?.length) {
			delete this.options.transfers_inbound;
		}
		if (!this.options?.transfers_outbound?.length) {
			delete this.options.transfers_outbound;
		}

		// Clean up legacy storage
		delete this.options.destination;

		this.app.options.crypto[this.ticker] = this.options;

		this.app.storage.saveOptions();
	}

	async returnAddressFromPublicKey(publicKey) {
		if (this.validateAddress(publicKey)) {
			return publicKey;
		}

		if (!this.app.wallet.isValidPublicKey(publicKey)) {
			throw new Error(`Error 237509: ${publicKey} is not a Saito public key`);
		}

		let key = this.app.keychain.returnKey(publicKey, true);

		if (key?.crypto_addresses) {
			return key.crypto_addresses[this.ticker];
		}

		return null;
	}
}

/**
 * Abstract method which should get balance from underlying crypto endpoint
 * @abstract
 * @return {Number}
 */
CryptoModule.prototype.checkBalance = async function () {
	throw new Error('checkBalance must be implemented by subclass!');
};

/**
 * Abstract method which should get private key
 * @abstract
 * @return {String} Private Key
 */
CryptoModule.prototype.returnPrivateKey = function () {
	throw new Error('returnPrivateKey must be implemented by subclass!');
};

/**
 * Abstract method which should transfer tokens via the crypto endpoint
 * @abstract
 * @param {Number} howMuch - How much of the token to transfer
 * @param {String} to - Pubkey/address to send to
 * @param {String} uniqueHash - to make sure the code doesn't trigger this twice on browser refresh
 * @return {Number}
 */
CryptoModule.prototype.sendPayment = async function (
	amount = '',
	recipient = '',
	unique_hash = ''
) {
	throw new Error('sendPayment must be implemented by subclass!');
};

/**
 * Searches for a payment which matches the criteria specified in the parameters.
 * @abstract
 * @param {Number} howMuch - How much of the token was transferred
 * @param {String} from - Pubkey/address the transasction was sent from
 * @param {String} to - Pubkey/address the transasction was sent to
 * @param {timestamp} to - timestamp after which the transaction was sent
 * @return {Boolean}
 */
CryptoModule.prototype.receivePayment = function (
	amount,
	sender,
	recipient,
	timestamp,
	unique_hash = ''
) {
	throw new Error('receivePayment must be implemented by subclass!');
};

/**
 * Abstract method
 * @abstract
 * @param {Number} records - how many records per page
 * @param {function} callback - function to call when the data is being fetched/sorted
 * @return {object} payment history data
 */
//
// NOTE, asset_id is a MIXIN module information type and should not be a base crypto-mod fnct
//
CryptoModule.prototype.returnHistory = function (asset_id = '', records = 20, callback = null) {
	throw new Error('returnHistory must be implemented by subclass!');
};

CryptoModule.prototype.checkWithdrawalFeeForAddress = function (recipient = '', mycallback = null) {
	if (mycallback != null) {
		mycallback(0);
	}
};

/**
 * fetch pending deposits
 * @abstract
 * @param {function} callback function
 * @return {array} list of pending deposits
 */

CryptoModule.prototype.fetchPendingDeposits = async function (callback) {
	if (callback != null) {
		callback([]);
	}
};

/**
 * Validate given address
 * @abstract
 * @param {string} address to validate
 * @param {string} ticker to for selected crypto
 * @return {boolean} true/false
 */
CryptoModule.prototype.validateAddress = function (address) {
	return true;
};

/**
 * return utxo
 * @abstract
 * @param {string} address to validate
 * @param {string} ticker to for selected crypto
 * @return {boolean} true/false
 */
CryptoModule.prototype.returnUtxo = async function (
	state = 'unspent',
	limit = 1000,
	order = 'DESC'
) {
	return true;
};

CryptoModule.prototype.returnNetworkInfo = async function (ticker) {
	return {};
};

module.exports = CryptoModule;
