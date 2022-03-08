/*********************************************************************************

 WEB3 CRYPTO MODULE v.2 - Mixin

 Extends the generic web3 crypto module to add auto-support for cryptos that are
 supported by the Mixin module.

   returnAddress()
   returnPrivateKey()
   async returnBalance(addresses = "")
   async sendPayment(amounts="", recipient="")
   async hasPayment(amounts=[], senders=[], receivers=[], timestamp);

**********************************************************************************/
const CryptoModule = require('./../../../lib/templates/cryptomodule');


class MixinModule extends CryptoModule {

  constructor(app, ticker) {

    super(app);

    this.app = app;
    this.ticker = ticker;
    this.name = ticker;
    this.categories = "Cryptocurrency";

    return this;


  }

}


/**
 * Abstract method which should get balance from underlying crypto endpoint
 * @abstract
 * @return {Number}
 */
MixinModule.prototype.returnBalance = function() {
  return "0.0004";
//  throw new Error('returnBalance must be implemented by subclass!');
};

/**
 * Abstract method which should transfer tokens via the crypto endpoint
 * @abstract
 * @param {Number} howMuch - How much of the token to transfer
 * @param {String} to - Pubkey/address to send to
 * @abstract
 * @return {Number}
 */
MixinModule.prototype.sendPayment = function() {
  throw new Error('send must be implemented by subclass!');
};

/**
 * Abstract method which should get pubkey/address
 * @abstract
 * @return {String} Pubkey/address
 */
MixinModule.prototype.returnAddress = function() {
  return "0x00000000000000000000000000";
  //throw new Error('returnAddress must be implemented by subclass!');
};
/**
 * Abstract method which should get private key
 * @abstract
 * @return {String} Private Key
 */
MixinModule.prototype.returnPrivateKey = function() {
  return "0x00000000000000000000000000";
  //throw new Error('returnPrivateKey must be implemented by subclass!');
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
MixinModule.prototype.hasPayment = function() {
  throw new Error('hasPayment must be implemented by subclass!');
};

module.exports = MixinModule;



