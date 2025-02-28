/*********************************************************************************

 WEB3 CRYPTO MODULE v.2

 This is a general parent class for modules that wish to define a cryptocurrency 
 that can interact with the Saito ecosystem. It introduces generic  functions that 
 should be implemented by these modules to handle web3 cryptos interaction with 
 their external blockchains or  networks. 

 To understand how your module can integrate cryptocurrencies, the API is handled
 in lib/saito/wallet.ts

	Minimum functionality: 
	-- returnAddress
	-- returnBalance
	-- returnPrivateKey
	-- sendPayment
	-- receivePayment
	-- returnHistory

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
		this.categories = 'Cryptocurrency';

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
		this.destination = ''; //Same as address...

		//
		//
		//
		this.is_initialized = 0;

		//
		// info stored in options file
		//
		this.options = {};
		this.options.isActivated = false;
		this.options.transfers_inbound = [];
		this.options.transfers_outbound = [];
	}

	/**
	 * Saito Module initialize function
	 * @param {*} app
	 */
	async initialize(app) {
		await super.initialize(app);
		this.load();
		if (this.options.isActivated) {
			app.connection.emit('crypto_activated');
		}

		//
		// info stored in options file - arrays will be pruned
		// if empty when saved and reloaded. so we have to recreate
		// them.
		//
		if (!this.options) {
			this.options = {};
			this.options.isActivated = false;
		}
		if (!this.options.transfers_inbound) {
			this.options.transfers_inbound = [];
		}
		if (!this.options.transfers_outbound) {
			this.options.transfers_outbound = [];
		}

		this.is_initialized = 1;
	}

	// TODO - purge when ready
	isActivated() {
		return this.returnIsActivated();
	}
	returnIsActivated() {
		let isActivatedCheck = false;
		if (this.is_initialized == 1 ) {
			isActivatedCheck = this.options.isActivated;
		}

		//
		// modules might want to know which cryptos are activated before the
		// crypto modules themselves have initialize(app), in which case we
		// have a fallback.
		//
		if (this.app.options?.crypto) {
			if (this.app.options.crypto[this.ticker]) {
				if (this.app.options.crypto[this.ticker].isActivated == true) {
					isActivatedCheck = true;
				}
			}
		}

		return isActivatedCheck;
	}

	/**
	 * isActivated is an optional flag that allows users to enable a crypto module.
	 * This is needed to accomodate UX in the case that a particular module might
	 * require significant resources.
	 */
	async activate() {
		if (this.options.isActivated !== true) {
			this.options.isActivated = true;
			if (this.destination == "") {
				this.destination = await this.returnAddress();
			}

			this.save();
		}

		await this.returnBalance();
		this.app.connection.emit('header-update-balance');
	}

	returnNetworkAddress(add) {
		return add.split('|')[0];
	}

	onIsActivated() {
		return new Promise((resolve, reject) => {
			if (this.options.isActivated) {
				resolve();
			}
			this.app.connection.on('crypto_activated', () => {
				resolve();
			});
		});
	}

	/**
	 * Returns balance as a formatted string
	 *
	 * this is what saito-header calls, so we cache the balance
	 * here for subsequent checks. modules should update the balance
	 * themselves ideally when they check manually.
	 *
	 */
	async formatBalance() {
		//    let balance = this.balance;
		let balance = await this.returnBalance();

		if (typeof balance == 'undefined') {
			balance = 0.0;
		}

		let balance_as_float = parseFloat(balance);
		if (balance_as_float < 9999) {
			balance_as_float = balance_as_float.toPrecision(3);
		}

		return balance_as_float.toString();
	}

	/**
	 * save state of this module to local storage
	 */
	save() {
		if (!this.app?.options?.crypto) {
			this.app.options.crypto = {};
		}
		this.options.balance = this.balance;
		this.options.address = this.address;
		this.options.destination = this.destination;
		this.app.options.crypto[this.ticker] = this.options;
		this.app.storage.saveOptions();
	}

	//
	// unclear if these following two functions are used -- June 29, 2024
	//
	saveOutboundPayment(amount, sender, receiver, timestamp, unique_hash = '') {
		for (let i = 0; i < this.options.transfers_outbound.length; i++) {
			if (
				this.options.transfers_outbound[i].unique_hash ===
					unique_hash &&
				unique_hash !== ''
			) {
				return;
			}
		}
		let transfer = {
			amount: amount,
			sender: sender,
			receiver: receiver,
			timestamp: timestamp,
			unique_hash: unique_hash
		};
		this.options.transfers_outbound.push(transfer);
		this.save();
		return;
	}
	saveInboundPayment(amount, sender, receiver, timestamp, unique_hash = '') {
		for (let i = 0; i < this.options.transfers_inbound.length; i++) {
			if (
				this.options.transfers_inbound[i].unique_hash === unique_hash &&
				unique_hash !== ''
			) {
				return 1;
			}
		}
		let transfer = {
			amount: amount,
			sender: sender,
			receiver: receiver,
			timestamp: timestamp,
			unique_hash: unique_hash
		};
		this.options.transfers_inbound.push(transfer);
		this.save();
		return;
	}

	/**
	 * load state of this module from local storage
	 */
	load() {
		if (this.app?.options?.crypto) {
			if (!this.app.options.crypto[this.ticker]) {
				this.app.options.crypto[this.ticker] = {};
			}
			this.options = this.app.options.crypto[this.ticker];
			this.balance = this.options.balance;
			this.address = this.options.address;
			this.destination = this.options.destination;
		}
	}

	/**
	 * checks module-level records
	 */
	hasReceivedPayment(amount, sender, receiver, timestamp, unique_hash) {
		for (let i = 0; i < this.options.transfers_inbound.length; i++) {
			if (
				this.options.transfers_inbound[i].amount === amount &&
				this.returnNetworkAddress(
					this.options.transfers_inbound[i].sender
				) === this.returnNetworkAddress(sender) &&
				this.returnNetworkAddress(
					this.options.transfers_inbound[i].receiver
				) === this.returnNetworkAddress(receiver) &&
				this.options.transfers_inbound[i].timestamp >= timestamp &&
				this.options.transfers_inbound[i].unique_hash === unique_hash
			) {
				return 1;
			}
		}
		return 0;
	}
	/**
	 * checks module-level records
	 */
	hasSentPayment(amount, sender, receiver, timestamp, unique_hash) {
		for (let i = 0; i < this.options.transfers_outbound.length; i++) {
			if (
				this.options.transfers_outbound[i].amount === amount &&
				this.returnNetworkAddress(
					this.options.transfers_outbound[i].sender
				) === this.returnNetworkAddress(sender) &&
				this.returnNetworkAddress(
					this.options.transfers_outbound[i].receiver
				) === this.returnNetworkAddress(receiver) &&
				this.options.transfers_outbound[i].timestamp >= timestamp &&
				this.options.transfers_outbound[i].unique_hash === unique_hash
			) {
				return 1;
			}
		}
		return 0;
	}
}

/**
 * Abstract method which should get balance from underlying crypto endpoint
 * @abstract
 * @return {Number}
 */
CryptoModule.prototype.returnBalance = async function () {
	throw new Error('returnBalance must be implemented by subclass!');
};

/**
 * Abstract method which should transfer tokens via the crypto endpoint
 * @abstract
 * @param {Number} howMuch - How much of the token to transfer
 * @param {String} to - Pubkey/address to send to
 * @abstract
 * @return {Number}
 */
CryptoModule.prototype.sendPayment = async function (
	amount = '',
	recipient = '',
	unique_hash = '',
	fee
) {
	for (let i = 0; i < this.options.transfers_outbound.length; i++) {
		if (
			this.options.transfers_outbound[i].unique_hash === unique_hash &&
			unique_hash !== ''
		) {
			return 1;
		}
	}
	return 0;
};

/**
 * Abstract method which should get pubkey/address
 * @abstract
 * @return {String} Pubkey/address
 */
CryptoModule.prototype.returnAddress = function (address = '') {
	throw new Error('returnAddress must be implemented by subclass!');
};
CryptoModule.prototype.returnCachedAddress = function () {
	return this.address;
};
CryptoModule.prototype.returnCachedBalance = function () {
	return this.balance;
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
	for (let i = 0; i < this.options.transfers_inbound.length; i++) {
		if (
			this.options.transfers_inbound[i].unique_hash === unique_hash &&
			unique_hash !== ''
		) {
			return 1;
		}
	}
	return 0;
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
CryptoModule.prototype.returnHistory = function (
	asset_id = '',
	records = 20,
	callback = null
) {
	throw new Error('returnHistory must be implemented by subclass!');
};

CryptoModule.prototype.returnWithdrawalFeeForAddress = function (
	recipient = '',
	mycallback = null
) {
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

CryptoModule.prototype.fetchPendingDeposits = async function(callback) { 
	if (callback != null) {
		callback([]);
	}
}


/**
 * Validate given address
 * @abstract
 * @param {string} address to validate
 * @param {string} ticker to for selected crypto
 * @return {boolean} true/false
 */
CryptoModule.prototype.validateAddress = async function(address, ticker) { return true; }

/**
 * return utxo
 * @abstract
 * @param {string} address to validate
 * @param {string} ticker to for selected crypto
 * @return {boolean} true/false
 */
CryptoModule.prototype.returnUtxo = async function(state = 'unspent', limit = 1000, order = 'DESC') { return true; }


CryptoModule.prototype.returnNetworkInfo = async function(ticker) { return {} }


module.exports = CryptoModule;
