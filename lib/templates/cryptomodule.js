/*********************************************************************************

 WEB3 CRYPTO MODULE v.2

 This is a general parent class for modules that wish to add the ability for Saito
 applications to interact with third-party cryptocurrencies. It introduces generic
 functions that should be implemented by these modules to allow any Saito modules
 which aim to handle web3 cryptos to interact with their external blockchains or 
 networks. The module itself can determine to what extent usage is handled in a
 trustful or trustless manner.

 The way that web3 support works in Saito is that users need only install a module
 that adds support for a particular crypto ticker. If you are building a module that
 adds support for a particular TICKER you need to create a module that inherits from
 this module and implements the following functions:

   returnAddress()
   returnPrivateKey()
   async returnBalance(address = "")
   async sendPayment(amount="", recipient="", unique_hash="")
   async receivePayment(amount="", sender="", recipient="", timestamp=0, unique_hash="");
   returnHistory(records=20, callback=function(){})

 Applications should not interact directly with your module. They will make requests
 to /lib/saito/wallet.ts which will call these module functions. This allows Saito to
 support more complex transfers without the need to code complexity down at this basic
 API layer where we are interacting with other blockchains.

 Saito supports cascading memory caches to try and speed up checks against existing 
 payments and ensure that your wallet retains memory of them after they have been 
 sent for as long a period of time as is reasonable. All transfers that are requested 
 through the wallet will be hashed into a UNIQUE_HASH. The wallet will save a record
 of these transactions once they have been sent or received. The web3 module will also
 save a copy of these transactions if the SUPER functions are called when the relevant
 functions are overwritten.
 
 As long as applications call the /lib/saito/wallet.ts file to make their transfers we 
 can code applications which support arbitrary cryptocurrencies, with sanity checks 
 against double-spending that work both on the wallet-layer as well as the module 
 layer.

**********************************************************************************/
const ModTemplate = require('./modtemplate');
const ActivateOverlay = require('./../saito/ui/saito-crypto/overlays/activate');

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
		this.confirmations = 0;

		//
		// some modules issue warnings to users on selection
		//
		this.warning = '';
		this.introduction = '';
		this.previously_selected = 0;

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

		//if (new.target === CryptoModule) {
		//  throw new TypeError("Cannot construct Crypto instances directly");
		//}

		//
		// check parent module has initialized all of the needed functions
		//
		if (typeof this.returnAddress != 'function') {
			throw new TypeError('Must override returnAddress');
		}

		if (typeof this.returnBalance != 'function') {
			throw new TypeError('Must override returnBalance');
		}

		if (typeof this.returnPrivateKey != 'function') {
			throw new TypeError('Must override returnPrivateKey');
		}

		if (typeof this.sendPayment != 'function') {
			throw new TypeError('Must override sendPayment');
		}

		if (typeof this.receivePayment != 'function') {
			throw new TypeError('Must override receivePayment');
		}

		if (typeof this.returnHistory != 'function') {
			throw new TypeError('Must override returnHistory');
		}
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
		if (this.is_initialized == 1) {
			return this.options.isActivated;
		}

		//
		// modules might want to know which cryptos are activated before the
		// crypto modules themselves have initialize(app), in which case we
		// have a fallback.
		//
		if (this.app.options?.crypto) {
			if (this.app.options.crypto[this.ticker]) {
				if (this.app.options.crypto[this.ticker].isActivated == true) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * isActivated is an optional flag that allows users to enable a crypto module.
	 * This is needed to accomodate UX in the case that a particular module might
	 * require significant resources.
	 */
	activate() {
		if (this.options.isActivated !== true) {
			this.options.isActivated = true;
			this.save();
		}
		this.returnBalance();
		this.app.connection.emit('update_balance');
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
		this.save();
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
		this.app.options.crypto[this.ticker] = this.options;
		this.app.storage.saveOptions();
	}

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

CryptoModule.prototype.renderModalSelectCrypto = function (
	app,
	mod,
	cryptomod
) {
	let confirmations = this.confirmations;
	let address = this.returnAddress();
	let ticker = this.ticker;

	let activate_overlay = new ActivateOverlay(app, mod);
	activate_overlay.render(ticker, address, confirmations);
};

CryptoModule.prototype.attachEventsModalSelectCrypto = function (
	app,
	mod,
	cryptomod
) {
	return null;
};

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
	unique_hash = ''
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

module.exports = CryptoModule;
