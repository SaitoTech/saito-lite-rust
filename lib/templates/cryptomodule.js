/*********************************************************************************

 WEB3 CRYPTO MODULE v.2

 This is a general parent class for modules that wish to add the ability for Saito
 applications to interact with third-party cryptocurrencies. It introduces generic
 functions that should be implemented by this modules to allow any Saito modules
 which aim to handle web3 cryptos to interact with their external blockchains or 
 networks. The module itself can determine to what extent usage is handled in a
 trustful or trustless manner.

 The way that web3 support works in Saito is that users need only install a module
 that adds support for a particular crypto ticker. Applications are written that
 can query which tickers are supported. The wallet is the connecting point between
 the modules and the applications. We recommend that application developers looking
 to add crypto support to their own applications start by checking the wallet class
 for the list of "preferred crypto" functions.

 If you are coding a cryptocurrency module, you will need to create a module that 
 inherits from this module, sets its { ticker, name } and implements the following
 functions as a bare minimum.

 Note that amount should reflect the total number of the base-units that are to 
 be transferred and should be expected as a string. In the case of Saito this means
 that transferring 1 SAITO would expect the amount to be 100_000_000 as the module
 will expect denomination in NOLAN.

   //
   // returns the web3 crypto address
   //
   returnAddress()

   //
   // returns the web3 crypto private key
   //
   returnPrivateKey()

   //
   // fetches and returns the balance at the web3 crypto addresses
   //
   // @param {String} address in which to check balance
   // @return {Array} Array of {address: {String}, balance: {Int}}
   //
   async returnBalance(addresses = "")

   //
   // sends a payment in amount requested to the specified address if possible
   //
   // @param {String} amount of tokens to send
   // @param {String} address of recipient
   // @return {Array} Array of {hash: {String}} where hash is the transaction_id
   //        of the transaction that makes this transfer on the external web3
   //	     crypto.
   //
   async sendPayment(amounts="", recipient="")

   //
   // checks if a payment has been received at the web3 crypto address
   //
   // @param {String} amount of tokens to send
   // @param {String} sender of transfer
   // @param {String} recipient of transfer
   // @param {timestamp} timestamp after which transfer must have been made
   // @return {Array} Array of {hash: {String}} where hash is the transaction_id
   //
   async hasPayment(amounts=[], senders=[], receivers=[], timestamp);

 Applications should not interact directly with web3 modules unless they are custom-
 coded or know what they are doing. The Saito wallet pemits integration through its 
 own API that has some sanity-checks that prevent double-spending and trigger modal
 UI elements to handle payment authorizations.


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
    this.categories = "Cryptocurrency";

    //
    // some modules issue warnings to users on selection
    //
    this.warning = "";
    this.introduction = "";
    this.previously_selected = 0;

    //
    // info stored in options file
    //
    this.optionsStorage = {};
    this.optionsStorage.isActivated = false;

    if (new.target === CryptoModule) {
      throw new TypeError("Cannot construct Crypto instances directly");
    }

    //
    // check parent module has initialized all of the needed functions
    //
    if (typeof this.returnAddress != "function") {
      throw new TypeError("Must override returnAddress");
    }

    if (typeof this.returnBalance != "function") {
      throw new TypeError("Must override returnBalance");
    }

    if (typeof this.returnPrivateKey != "function") {
      throw new TypeError("Must override returnPrivateKey");
    }

    if (typeof this.sendPayment != "function") {
      throw new TypeError("Must override sendPayment");
    }

    if (typeof this.hasPayment != "function") {
      throw new TypeError("Must override hasPayment");
    }

  }


  /**
   * Saito Module initialize function
   * @param {*} app 
   */
  initialize(app) {
    if (this.optionsStorage.isActivated) {
      app.connection.emit('crypto_activated');
    }
  }

   /**
   * isActivated is an optional flag that allows users to enable a crypto module.
   * This is needed to accomodate UX in the case that a particular module might
   * require significant resources.
   */
  activate() {
    // check that we're not already activated, we don't want to waste time on save() if not needed
    // and we especially don't want to fire the activated event
    if (!this.optionsStorage.isActivated) {
      this.optionsStorage.isActivated = true;
      this.save();
      this.app.connection.emit("crypto_activated");
    }
  }

  /**
   * Returns a crypto modules activated status.
   * isActivated is an optional flag that allows users to enable a crypto module.
   */
  returnIsActivated() {
    return this.optionsStorage.isActivated;
  }

  onIsActivated() {
    return new Promise((resolve, reject) => {
      if (this.optionsStorage.isActivated) {
        resolve();
      }
      this.app.connection.on('crypto_activated', () => {
        resolve();
      });
    });
  }

  /**
   * Returns balance as a formatted string
   */
  async formatBalance() {
    let balance = await this.returnBalance();
    balace = parseFloat(balance);
    if (balance < 9999) {
      balance = balance.toPrecision(5);
    }
    return balance.toString();
  }

  /**
   * save state of this module to local storage
   */
  save() {
    if (!this.app?.options?.crypto) { this.app.options.crypto = {}; }
    this.app.options.crypto[this.ticker] = this.optionsStorage;
    this.app.storage.saveOptions();
  }


  /**
   * load state of this module from local storage
   */
  load() {
    if (this.app?.options?.crypto) {
      if (!this.app.options.crypto[this.ticker]) { this.app.options.crypto[this.ticker] = {}; }
      this.optionsStorage = this.app.options.crypto[this.ticker];
    } else {
      throw "Module Not Installed: " + this.name;
    }
  }

}


/**
 * Abstract method which should get balance from underlying crypto endpoint
 * @abstract
 * @return {Number}
 */
CryptoModule.prototype.renderModalSelectCrypto = function() {
  return null;
}
CryptoModule.prototype.attachEventsModalSelectCrypto = function() {
  return null;
}

/**
 * Abstract method which should get balance from underlying crypto endpoint
 * @abstract
 * @return {Number}
 */
CryptoModule.prototype.returnBalance = function() {
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
CryptoModule.prototype.send = function() {
  throw new Error('send must be implemented by subclass!');
};

/**
 * Abstract method which should get pubkey/address
 * @abstract
 * @return {String} Pubkey/address
 */
CryptoModule.prototype.returnAddress = function() {
  throw new Error('returnAddress must be implemented by subclass!');
};
/**
 * Abstract method which should get private key
 * @abstract
 * @return {String} Private Key
 */
CryptoModule.prototype.returnPrivateKey = function() {
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
CryptoModule.prototype.hasPayment = function() {
  throw new Error('hasPayment must be implemented by subclass!');
};

module.exports = CryptoModule;
