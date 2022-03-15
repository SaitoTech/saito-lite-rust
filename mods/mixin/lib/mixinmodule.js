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

  constructor(app, ticker, mixin_mod, asset_id) {

    super(app);

    this.app = app;
    this.ticker = ticker;
    this.name = ticker;
    this.categories = "Cryptocurrency";
    this.mixin = mixin_mod;

    this.asset_id = asset_id;
    this.chain_id = "";
    this.icon_url = "";
    this.balance = "0.0";
    this.deposit_entries = {};
    this.destination = "";
    this.tag = "";
    this.price_btc = 0;
    this.price_usd = 0;
    this.change_btc = 0;
    this.change_usd = 0;
    this.asset_key = 0;
    this.mixin_id = "";
    this.reserve = "";
    this.confirmations = 100;
    this.capitalization = 0;
    this.liquidity = "";

    return this;

  }

  installModule() {
    if (this.mixin) {
      if (this.app.wallet.wallet.preferred_crypto !== "SAITO" && this.app.wallet.wallet.preferred_crypto !== "") {
        if (this.mixin.account_created == 0) {
console.log("creating on install: " + this.app.wallet.wallet.preferred_crypto);
	  this.mixin.createAccount();
        }
      }
    }
  }

  activate() {
    if (this.mixin.account_created == 0) { 
      if (this.mixin.mixin.session_id === "") {
        this.mixin.createAccount();
      }
    }
    super.activate();
  }

}





/**
 * Abstract method which should get balance from underlying crypto endpoint
 * @abstract
 * @return {Number}
 */
MixinModule.prototype.renderModalSelectCrypto = function() {
  return `
    <div class="mixin_crypto_overlay" id="mixin_crypto_overlay">

      <div class="mixin_crypto_title">Heads up!</div>

      <div class="mixin_crypto_warning">
      Third-party cryptocurrency support in Saito is currently experimental. All users should 
      be aware that support is experimental. If your browser wallet is compromised you may lose 
      all crypto you upload.

      <p></p>

      Please be sensible and do not put more than 100 USD worth of crypto in your live wallet
      while our network is under development.
      </div>

      <div class="mixin_risk_acknowledge button">i understand</div>

    </div>
    <style>
      .mixin_crypto_overlay {
	padding: 30px;
	background-color: whitesmoke;
	color: black;
	line-height: 1.6em;
        font-size: 1.5em;
      }
      .mixin_crypto_title {
	margin: 0.5em 0;
	font-size: 2em;
	font-weight: bold;
      }
      .mixin_crypto_warning {
	margin-top: 0px;
	margin-bottom: 20px;
      }
      .mixin_risk_acknowledge {
	max-width: 200px;
	text-align: center;
	margin-right: auto;
      }
    </style>
  `;
}



MixinModule.prototype.attachEventsModalSelectCrypto = function(app, cryptomod) {
  let ab = document.querySelector(".mixin_risk_acknowledge");
  ab.onclick = (e) => {
    cryptomod.modal_overlay.hide();
  }
}




/**
 * Abstract method which should get balance from underlying crypto endpoint
 * @abstract
 * @return {Number}
 */
MixinModule.prototype.returnBalance = async function() {
  return this.balance;
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
  if (this.destination === "") {
    return "unknown address";
  }
  return this.destination;
};
/**
 * Abstract method which should get private key
 * @abstract
 * @return {String} Private Key
 */
MixinModule.prototype.returnPrivateKey = function() {
  return this.mixin.mixin.privatekey;
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



