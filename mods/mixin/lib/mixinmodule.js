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




  hasReceivedPayment(amount, sender, receiver, timestamp, unique_hash) {

    let trace_id = getUuid(unique_hash);

console.log("checking to see if we have received payment with unique_hash: " + unique_hash);
console.log("checking to see if we have received payment with trace_id: " + trace_id);
console.log("deposits complete: " + JSON.stringify(this.mixin.deposits));

    for (let i = 0; i < this.mixin.deposits.length; i++) {
      if (
        this.mixin.deposits[i].trace_id === trace_id
      ) {
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
MixinModule.prototype.sendPayment = function(amount="", recipient="", unique_hash="") {

console.log("arrived in mixin module - sendPayment");
console.log("amount: " + amount);
console.log("recipient: " + recipient);
console.log("unique_hash: " + unique_hash);

  let r = recipient.split("|");
  let ts = new Date().getTime();

  //
  // internal MIXIN transfer
  //
  if (r.length >= 2) {
    if (r[2] === "mixin") {
      let opponent_address_id = r[1];
console.log("this is a Mixin address so send in-network transfer request to: " + opponent_address_id);
      let trace_id = this.mixin.sendInNetworkTransferRequest(this.asset_id, opponent_address_id, amount, unique_hash, function() {});
console.log("and saving outbound payment");
      this.saveOutboundPayment(amount, this.returnAddress(), recipient, ts, trace_id);
      return;
    }
  }

  //
  // external withdrawal to network
  //
  let destination = this.returnNetworkAddress(recipient);
  let withdrawal_address_exists = 0;
  let withdrawal_address_id = "";

console.log("this is an external transfer to external withdrawal address");

  for (let i = 0; i < this.mixin.addresses.length; i++) {
    if (this.mixin.addresses[i].destination === destination) { 
      withdrawal_address_exists = 1; 
      withdrawal_address_id = this.mixin.addresses[i].address_id;
    }
  }

  //
  // existing withdrawal address
  //
  if (withdrawal_address_exists === 1) {

console.log("we already have an address for this destination!");
    this.mixin.sendWithdrawalRequest(this.asset_id, withdrawal_address_id, destination, amount, unique_hash, function(d) {
console.log("sent withdrawal request and received: " + JSON.stringify(d));
    });
console.log("about to save outbound");
    this.saveOutboundPayment(amount, this.returnAddress(), recipient, ts, unique_hash);
    return unique_hash;

  //
  // create withdrawal address and save
  //
  } else {
  
    let mm_self = this;

console.log("we need to create an address for this destination!");
console.log("unique hash is : " + unique_hash);
    this.mixin.createWithdrawalAddress(mm_self.asset_id, destination, "", "", (d) => {

console.log("In the catch function in create Withdrawal Address in mixinmodule.");

      let asset_id = d.data.asset_id;
      let withdrawal_address_id = d.data.address_id;

console.log("we have created a withdrawal address with " + mm_self.asset_id + " -- " + withdrawal_address_id + " -- " + destination);

      mm_self.mixin.sendWithdrawalRequest(mm_self.asset_id, withdrawal_address_id, destination, amount, unique_hash, (d) => {
console.log("sent withdrawal request and received: " + JSON.stringify(d));
      });
      mm_self.saveOutboundPayment(amount, this.returnAddress(), recipient, ts, unique_hash);

    });

console.log("and returning unique hash");
    return unique_hash;

  }
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
  return this.destination + "|" + this.mixin.mixin.user_id + "|" + "mixin";
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
MixinModule.prototype.receivePayment = function(amount="", sender="", recipient="", timestamp=0, unique_hash="") {

  //
  // mixin transfers will be registered with a specific TRACE_ID
  //
  // so we can use this TRACE_ID to monitor transactions that have been
  // made from other accounts.
  //
  let trace_id = getUuid(unique_hash);
console.log("checking for this unique hash: " + unique_hash);
console.log("checking for this trace ID: " + trace_id);

  //
  // the mixin module might have a record of this already stored locally
  //
  if (this.hasReceivedPayment(amount, sender, recipient, timestamp, unique_hash) == 1) { return 1; }
  this.mixin.fetchDeposits(this.asset_id, (d) => {});

  return 0;

};

module.exports = MixinModule;



