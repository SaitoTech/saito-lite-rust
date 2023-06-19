/*********************************************************************************

 WEB3 CRYPTO MODULE v.2 - Mixin

 Extends the generic web3 crypto module to add auto-support for cryptos that are
 supported by the Mixin module.

<<<<<<< HEAD
 returnAddress()
 returnPrivateKey()
 async returnBalance(address = "")
 async sendPayment(amount="", recipient="", unique_hash="")
 async receivePayment(amount="", sender="", recipient="", timestamp=0, unique_hash="")
=======
   returnAddress()
   returnPrivateKey()
   returnHistory(mycallback, order="DESC", limit=20);
   async returnBalance(address = "")
   async sendPayment(amount="", recipient="", unique_hash="")
   async receivePayment(amount="", sender="", recipient="", timestamp=0, unique_hash="")
   returnHistory(page=1, records=20, callback())
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0


 TODO:

 we currently SEND the payments but do not record if the payment has been a success
 so there are failure modes if the effort to send has been unsuccessful. the same
 trace_id will be sent with each request so we should not have multiple payments
 through.



<<<<<<< HEAD
 **********************************************************************************/
const CryptoModule = require("./../../../lib/templates/cryptomodule");
const getUuid = require("uuid-by-string");
=======
**********************************************************************************/
const CryptoModule = require('./../../../lib/templates/cryptomodule');

const getUuid = require('uuid-by-string');
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

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
    this.balance_timestamp_last_fetched = 0;
    this.minimum_delay_between_balance_queries = 10000; // if it hasn't been 10 seconds since last fetch, fetch
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
      if (this.app.wallet.preferred_crypto !== "SAITO" && this.app.wallet.preferred_crypto !== "") {
        if (this.mixin.account_created == 0) {

          //
          // not every crypto should trigger account creation
          //
          let c = this.app.modules.returnModule(this.app.wallet.preferred_crypto);
          if (!c.asset_id) {
            return;
          }
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

<<<<<<< HEAD
}


MixinModule.prototype.renderModalSelectCrypto = function(app, mod, cryptomod) {
  return `
    <div class="mixin_crypto_overlay" id="mixin_crypto_overlay">

      <div class="mixin_crypto_title">Heads up!</div>
=======
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

  returnHistory(records, callback) {
    this.mixin.fetchSnapshots(this.asset_id, records, callback);
  }  


<<<<<<< HEAD
    </div>
  `;
};
=======
}

>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0


MixinModule.prototype.attachEventsModalSelectCrypto = function(app, mod, cryptomod) {
  let ab = document.querySelector(".mixin_risk_acknowledge");
  ab.onclick = (e) => {
    cryptomod.modal_overlay.hide(function() {
      setTimeout(function() {
        document.querySelector("#settings-dropdown").classList.add("show-right-sidebar");
      }, 500);
    });
  };
};


/**
 * Abstract method which should get balance from underlying crypto endpoint
 * @abstract
 * @return {Number}
 */
MixinModule.prototype.returnBalance = async function() {
  if ((new Date().getTime() - this.balance_timestamp_last_fetched) > this.minimum_delay_between_balance_queries) {
    this.balance_timestamp_last_fetched = new Date().getTime();
    let mixin_mod = this.app.modules.returnModule("Mixin");
    if (mixin_mod) {
      mixin_mod.checkBalance(this.asset_id);
    }
  }
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
MixinModule.prototype.sendPayment = function(amount = "", recipient = "", unique_hash = "") {

  let r = recipient.split("|");
  let ts = new Date().getTime();

  //
  // internal MIXIN transfer
  //
  if (r.length >= 2) {
    if (r[2] === "mixin") {
      let opponent_address_id = r[1];
      let trace_id = this.mixin.sendInNetworkTransferRequest(this.asset_id, opponent_address_id, amount, unique_hash, function() {
      });
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

    this.mixin.sendWithdrawalRequest(this.asset_id, withdrawal_address_id, destination, amount, unique_hash, function(d) {
    });
    this.saveOutboundPayment(amount, this.returnAddress(), recipient, ts, unique_hash);
    return unique_hash;

    //
    // create withdrawal address and save
    //
  } else {

    let mm_self = this;

    this.mixin.createWithdrawalAddress(mm_self.asset_id, destination, "", "", (d) => {

      let asset_id = d.data.asset_id;
      let withdrawal_address_id = d.data.address_id;

      mm_self.mixin.sendWithdrawalRequest(mm_self.asset_id, withdrawal_address_id, destination, amount, unique_hash, (d) => {
      });
      mm_self.saveOutboundPayment(amount, this.returnAddress(), recipient, ts, unique_hash);

    });

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
MixinModule.prototype.receivePayment = function(amount = "", sender = "", recipient = "", timestamp = 0, unique_hash = "") {

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
  if (this.hasReceivedPayment(amount, sender, recipient, timestamp, unique_hash) == 1) {
    return 1;
  }
  this.mixin.fetchDeposits(this.asset_id, this.ticker, (d) => {
  });
  return 0;

};

module.exports = MixinModule;



