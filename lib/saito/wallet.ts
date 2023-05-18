import Peer from "./peer";

const getUuid = require("uuid-by-string");
const ModalSelectCrypto = require("./ui/modals/select-crypto/select-crypto");
import Transaction from "./transaction";
import Slip from "./slip";
import { Saito } from "../../apps/core";
import S from "saito-js/saito";
import SaitoWallet from "saito-js/lib/wallet";

const CryptoModule = require("../templates/cryptomodule");

export default class Wallet extends SaitoWallet {
  public app: Saito;
  // public wallet = {
  // balance: "0",
  // publickey: "",
  // privatekey: "",

  preferred_crypto = "SAITO";
  preferred_txs = [];

  // inputs: new Array<Slip>(), // slips available
  // outputs: new Array<Slip>(), // slips spenr
  // spends: [], // TODO -- replace with hashmap using UUID. currently array mapping inputs -> 0/1 whether spent
  // pending: [], // slips pending broadcast
  default_fee = 2;
  version = 4.687;
  // };
  // public inputs_hmap: Map<string, boolean>;
  // public inputs_hmap_counter: number;
  // public inputs_hmap_counter_limit: number;
  // public outputs_hmap: Map<string, boolean>;
  // public outputs_hmap_counter: number;
  // public outputs_hmap_counter_limit: number;
  // public outputs_prune_limit: number;
  // public recreate_pending_transactions: any;
  public saitoCrypto: any;

  public async createUnsignedTransactionWithDefaultFee(
    publickey = "",
    amount = BigInt(0)
  ): Promise<Transaction> {
    if (publickey == "") {
      publickey = await this.getPublicKey();
    }
    return this.createUnsignedTransaction(publickey, amount, BigInt(0));
  }

  public async createUnsignedTransaction(
    publicKey = "",
    amount = BigInt(0),
    fee = BigInt(0),
    force_merge = false
  ): Promise<Transaction> {
    return S.getInstance().createTransaction(publicKey, amount, fee, force_merge);
  }

  // public async signTransaction<T extends Transaction>(tx: T): Promise<T> {
  //   console.log("signing tx..");
  //
  //   return (await S.getInstance().signTransaction(tx)) as T;
  // }

  // public async getPublicKey(): Promise<string> {
  //   return S.getInstance().getPublicKey();
  // }
  //
  // public async returnPrivateKey(): Promise<string> {
  //   return S.getInstance().getPrivateKey();
  // }
  //
  // public async getPendingTransactions(): Promise<Array<Transaction>> {
  //   return S.getInstance().getPendingTransactions();
  // }

  public async getBalance(ticker = "SAITO"): Promise<bigint> {
    if (ticker === "SAITO") {
      return this.wallet.get_balance();
    }
    return BigInt(0);
  }

  async initialize() {
    console.log("wallet.initialize");

    // add ghost crypto module so Saito interface available
    class SaitoCrypto extends CryptoModule {
      constructor(app) {
        super(app, "SAITO");
        this.name = "Saito";
        this.description = "Saito";
      }

      async returnBalance() {
        return parseFloat(await this.app.wallet.getBalance());
      }

      async returnAddress() {
        return await this.app.wallet.getPublicKey();
      }

      returnPrivateKey() {
        return this.app.wallet.getPrivateKey();
      }

      async sendPayment(amount, to_address, unique_hash = "") {
        let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(
          to_address,
          BigInt(amount)
        );
        newtx.signAndEncrypt();
        // newtx = this.app.wallet.signAndEncryptTransaction(newtx);
        await this.app.network.propagateTransaction(newtx);
        return newtx.signature;
      }

      async receivePayment(howMuch, from, to, timestamp) {
        const from_from = 0;
        const to_to = 0;
        if (to == (await this.app.wallet.getPublicKey())) {
          for (let i = 0; i < this.app.wallet.wallet.inputs.length; i++) {
            if (this.app.wallet.wallet.inputs[i].amount === howMuch) {
              if (parseInt(this.app.wallet.wallet.inputs[i].timestamp) >= parseInt(timestamp)) {
                if (this.app.wallet.wallet.inputs[i].publicKey == to) {
                  return true;
                }
              }
            }
          }
          for (let i = 0; i < this.app.wallet.wallet.outputs.length; i++) {
            if (this.app.wallet.wallet.outputs[i].amount === howMuch) {
              if (parseInt(this.app.wallet.wallet.outputs[i].timestamp) >= parseInt(timestamp)) {
                if (this.app.wallet.wallet.outputs[i].publicKey == to) {
                  return true;
                }
              }
            }
          }
          return false;
        } else {
          if (from == (await this.app.wallet.getPublicKey())) {
            for (let i = 0; i < this.app.wallet.wallet.outputs.length; i++) {
              //console.log("OUTPUT");
              //console.log(this.app.wallet.wallet.outputs[i]);
              if (this.app.wallet.wallet.outputs[i].amount === howMuch) {
                if (parseInt(this.app.wallet.wallet.outputs[i].timestamp) >= parseInt(timestamp)) {
                  if (this.app.wallet.wallet.outputs[i].publicKey == to) {
                    return true;
                  }
                }
              }
            }
          }
          return false;
        }
      }

      returnIsActivated() {
        return true;
      }

      onIsActivated() {
        return new Promise((resolve, reject) => {
          resolve(null);
        });
      }
    }

    //
    // this.wallet.publickey = await S.getInstance().getPublicKey();
    // this.wallet.privatekey = await S.getInstance().getPrivateKey();

    this.saitoCrypto = new SaitoCrypto(this.app);
    let privateKey = await this.getPrivateKey();
    let publicKey = await this.getPublicKey();
    console.log("public key = " + publicKey);
    console.log("private key = " + privateKey);

    if (privateKey === "") {
      if (this.app.options.wallet != null) {
        /////////////
        // upgrade //
        /////////////
        if (this.app.options.wallet.version < this.version) {
          if (this.app.BROWSER === 1) {
            const tmpprivkey = this.app.options.wallet.privateKey;
            const tmppubkey = this.app.options.wallet.publicKey;

            let mixin = this.app.options.mixin;
            let crypto = this.app.options.crypto;

            // specify before reset to avoid archives reset problem
            await this.setPrivateKey(tmpprivkey);
            await this.setPublicKey(tmppubkey);
            // this.wallet.publickey = tmppubkey;
            // this.wallet.privatekey = tmpprivkey;

            // let modules purge stuff
            this.app.modules.onWalletReset();

            // reset and save
            await this.app.storage.resetOptions();
            await this.wallet.reset();
            this.app.storage.saveOptions();

            // re-specify after reset
            await this.setPrivateKey(tmpprivkey);
            await this.setPublicKey(tmppubkey);
            // this.wallet.publickey = tmppubkey;
            // this.wallet.privatekey = tmpprivkey;

            // this.app.options.wallet = this.wallet;
            this.app.options.wallet.preferred_crypto = this.preferred_crypto;
            this.app.options.wallet.preferred_txs = this.preferred_txs;
            this.app.options.wallet.version = this.version;
            this.app.options.wallet.default_fee = this.default_fee;

            // reset games
            this.app.options.games = [];

            // delete inputs and outputs
            // this.app.options.wallet.inputs = [];
            // this.app.options.wallet.outputs = [];
            // this.app.options.wallet.spends = [];
            // this.app.options.wallet.pending = [];
            // this.app.options.wallet.balance = "0.0";
            // this.app.options.wallet.version = this.version;

            // keep mixin
            this.app.options.mixin = mixin;
            this.app.options.crypto = crypto;

            await this.saveWallet();

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            alert("Saito Upgrade: Wallet Reset");
          } else {
            //
            // purge old slips
            //
            this.app.options.wallet.version = this.version;

            // this.app.options.wallet.inputs = [];
            // this.app.options.wallet.outputs = [];
            // this.app.options.wallet.pending = [];
            // this.app.options.wallet.balance = "0.0";

            this.app.storage.saveOptions();
          }
        }

        this.wallet = Object.assign(this.wallet, this.app.options.wallet);
      }
    }
    ////////////////
    // new wallet //
    ////////////////
    if ((await this.getPrivateKey()) === "") {
      await this.resetWallet();
    }
  }

  constructor(wallet: any) {
    super(wallet);

    // this.inputs_hmap = new Map<string, boolean>();
    //
    // this.inputs_hmap_counter = 0;
    // this.inputs_hmap_counter_limit = 10000;
    // this.outputs_hmap = new Map<string, boolean>();
    // this.outputs_hmap_counter = 0;
    // this.outputs_hmap_counter_limit = 10000;
    // this.outputs_prune_limit = 100;

    this.saitoCrypto = null;

    // this.recreate_pending_transactions = 0;
  }

  //
  /**
   * Generates a new keypair for the user, resets all stored wallet info, and saves
   * the new wallet to local storage.
   */
  async resetWallet() {
    console.log("resetting wallet");
    // await S.getInstance().resetWallet();
    await this.reset();
    // let privateKey = S.getInstance().generatePrivateKey();
    // let publicKey = S.getInstance().generatePublicKey(privateKey);
    // await this.setPrivateKey(privateKey);
    // await this.setPublicKey(publicKey);
    // this.wallet.privatekey = await S.getInstance().getPrivateKey();
    // this.wallet.publickey = await S.getInstance().getPublicKey();

    if (this.app.options.blockchain) {
      this.app.blockchain.resetBlockchain();
    }

    // keychain
    if (this.app.options.keys) {
      this.app.options.keys = [];
    }

    // this.wallet.inputs = [];
    // this.wallet.outputs = [];
    // this.wallet.spends = [];
    // this.wallet.pending = [];

    await this.saveWallet();

    this.app.options.invites = [];
    this.app.options.games = [];
    this.app.storage.saveOptions();

    if (this.app.browser.browser_active == 1) {
      window.location.reload();
    }
  }

  /**
   * Saves the current wallet state to local storage.
   */
  async saveWallet() {
    console.log("saving wallet...");
    if (!this.app.options.wallet) {
      this.app.options.wallet = {};
    }
    this.app.options.wallet.preferred_crypto = this.preferred_crypto;
    this.app.options.wallet.preferred_txs = this.preferred_txs;
    this.app.options.wallet.version = this.version;
    this.app.options.wallet.default_fee = this.default_fee;

    // this.app.options.wallet = this.wallet;
    // for (let i = 0; i < this.app.options.wallet.inputs.length; i++) {
    //   this.app.options.wallets.inputs[i].amount =
    //     this.app.options.wallets.inputs[i].amount.toString();
    // }
    // for (let i = 0; i < this.app.options.wallet.outputs.length; i++) {
    //   this.app.options.wallets.outputs[i].amount =
    //     this.app.options.wallets.outputs[i].amount.toString();
    // }
    // let wallet = await S.getInstance().getWallet();
    // await wallet.save();
    await this.save();
    this.app.storage.saveOptions();
  }

  /////////////////////////
  // WEB3 CRYPTO MODULES //
  /////////////////////////

  returnInstalledCryptos() {
    const cryptoModules = this.app.modules.returnModulesBySubType(CryptoModule);
    if (this.saitoCrypto !== null) {
      cryptoModules.push(this.saitoCrypto);
    }
    return cryptoModules;
  }

  returnActivatedCryptos() {
    const allMods = this.returnInstalledCryptos();
    const activeMods = [];
    console.log("HOW MANY INSTALLED CRYPTOS: " + allMods.length);
    for (let i = 0; i < allMods.length; i++) {
      console.log("checking if activated: " + allMods[i].name);
      if (allMods[i].returnIsActivated()) {
        activeMods.push(allMods[i]);
      }
    }
    console.log("returning activated cryptos num: " + activeMods.length);
    return activeMods;
  }

  returnCryptoModuleByTicker(ticker) {
    const mods = this.returnInstalledCryptos();
    for (let i = 0; i < mods.length; i++) {
      if (mods[i].ticker === ticker) {
        return mods[i];
      }
    }
    throw "Module Not Found: " + ticker;
  }

  async setPreferredCrypto(ticker, show_overlay = 0) {
    let can_we_do_this = 0;
    const mods = this.returnInstalledCryptos();
    let cryptomod = null;
    for (let i = 0; i < mods.length; i++) {
      if (mods[i].ticker === ticker) {
        console.log("setting cryptomod");
        cryptomod = mods[i];
        can_we_do_this = 1;

        if (mods[i].options.isActivated == true) {
          show_overlay = 0;
        }
      }
    }

    console.log("cryptomod.ticker: " + cryptomod.ticker);

    if (ticker == "SAITO") {
      can_we_do_this = 1;
    }

    if (can_we_do_this == 1) {
      this.preferred_crypto = ticker;
      console.log("Activating cryptomod: " + cryptomod.ticker);
      cryptomod.activate();
      await this.saveWallet();
      console.log("emitting set preferred crypto event");
      this.app.connection.emit("set_preferred_crypto", ticker);
    }

    if (cryptomod && show_overlay === 1) {
      if (cryptomod.renderModalSelectCrypto() != null) {
        const modal_select_crypto = new ModalSelectCrypto(this.app, null, cryptomod);
        modal_select_crypto.render(this.app, null, cryptomod);
        modal_select_crypto.attachEvents(this.app, null, cryptomod);
      }
    }

    console.log("done in setPreferredCrypto");

    return;
  }

  async returnPreferredCrypto() {
    try {
      return this.returnCryptoModuleByTicker(this.preferred_crypto);
    } catch (err) {
      if (err.startsWith("Module Not Found:")) {
        await this.setPreferredCrypto("SAITO");
        return this.returnCryptoModuleByTicker(this.preferred_crypto);
      } else {
        throw err;
      }
    }
  }

  async returnPreferredCryptoTicker() {
    try {
      const pc = await this.returnPreferredCrypto();
      if (pc != null && pc != undefined) {
        return pc.ticker;
      }
    } catch (err) {
      return "";
    }
  }

  async returnCryptoAddressByTicker(ticker = "SAITO") {
    try {
      if (ticker === "SAITO") {
        return this.getPublicKey();
      } else {
        const cmod = this.returnCryptoModuleByTicker(ticker);
        return cmod.returnAddress();
      }
    } catch (err) {
      console.error(err);
    }
    return "";
  }

  async returnPreferredCryptoBalances(addresses = [], mycallback = null, ticker = "") {
    if (ticker == "") {
      ticker = this.preferred_crypto;
    }
    const cryptomod = this.returnCryptoModuleByTicker(ticker);
    const returnObj = [];
    const balancePromises = [];
    for (let i = 0; i < addresses.length; i++) {
      balancePromises.push(cryptomod.returnBalance(addresses[i]));
    }
    const balances = await Promise.all(balancePromises);
    for (let i = 0; i < addresses.length; i++) {
      returnObj.push({ address: addresses[i], balance: balances[i] });
    }
    if (mycallback != null) {
      mycallback(returnObj);
    }
    return returnObj;
  }

  /*** courtesy function to simplify balance checks for a single address w/ ticker ***/
  async checkBalance(address, ticker) {
    const robj = await this.returnPreferredCryptoBalances([address], null, ticker);
    if (robj.length < 1) {
      return 0;
    }
    if (robj[0].balance) {
      return robj[0].balance;
    }
    return 0;
  }

  async returnPreferredCryptoBalance() {
    const cryptomod = await this.returnPreferredCrypto();
    return await this.checkBalance(cryptomod.returnAddress(), cryptomod.ticker);
  }

  /**
   * Sends payments to the addresses provided if this user is the corresponding
   * sender. Will not send if similar payment was found after the given timestamp.
   * @param {Array} senders - Array of addresses -- in web3 currency
   * @param {Array} receivers - Array of addresses -- in web3 curreny
   * @param {Array} amounts - Array of amounts to send
   * @param {Int} timestamp - Timestamp of time after which payment should be made
   * @param {Function} mycallback - ({hash: {String}}) -> {...}
   * @param {String} ticker - Ticker of install crypto module
   */
  async sendPayment(
    senders = [],
    receivers = [],
    amounts = [],
    timestamp,
    unique_hash = "",
    mycallback = null,
    ticker
  ) {
    console.log("IN SEND PAYMENT IN WALLET!");

    console.log("wallet sendPayment");
    // validate inputs
    if (senders.length != receivers.length || senders.length != amounts.length) {
      console.log("Lengths of senders, receivers, and amounts must be the same");
      //mycallback({err: "Lengths of senders, receivers, and amounts must be the same"});
      return;
    }
    if (senders.length !== 1) {
      // We have no code which exercises multiple senders/receivers so can't implement it yet.
      console.error("sendPayment ERROR: Only supports one transaction");
      //mycallback({err: "Only supports one transaction"});
      return;
    }
    // only send if hasn't been sent before
    console.log(
      "does preferred crypto transaction exist: " +
        this.doesPreferredCryptoTransactionExist(senders, receivers, amounts, unique_hash, ticker)
    );
    console.log("unique hash: " + unique_hash);
    console.log("uuid: " + getUuid(unique_hash));

    if (
      !this.doesPreferredCryptoTransactionExist(senders, receivers, amounts, unique_hash, ticker)
    ) {
      console.log("preferred transaction does not exist, so...");

      const cryptomod = this.returnCryptoModuleByTicker(ticker);
      for (let i = 0; i < senders.length; i++) {
        console.log(
          "senders and returnAddress: " + senders[i] + " -- " + (await cryptomod.returnAddress())
        );

        //
        // DEBUGGING - sender is address to which we send the crypto
        // 	     - not our own publickey
        //
        if (senders[i] === (await cryptomod.returnAddress())) {
          // Need to save before we await, otherwise there is a race condition
          await this.savePreferredCryptoTransaction(
            senders,
            receivers,
            amounts,
            unique_hash,
            ticker
          );
          try {
            let unique_tx_hash = this.generatePreferredCryptoTransactionHash(
              senders,
              receivers,
              amounts,
              unique_hash,
              ticker
            );
            console.log("wallet -> cryptomod - sendPayment: " + unique_tx_hash);
            console.log("unique_hash: " + unique_tx_hash);
            console.log("senders: " + JSON.stringify(senders));
            console.log("receivers: " + JSON.stringify(receivers));
            console.log("amounts: " + JSON.stringify(amounts));
            console.log("timestamp: " + timestamp);
            console.log("ticker: " + ticker);
            const hash = await cryptomod.sendPayment(amounts[i], receivers[i], unique_tx_hash);
            console.log("wallet -> cryptomod - sendPayment - done");
            //
            // hash is "" if unsuccessful, trace_id if successful
            //
            if (hash === "") {
              this.deletePreferredCryptoTransaction(
                senders,
                receivers,
                amounts,
                unique_hash,
                ticker
              );
            }

            if (mycallback) {
              mycallback({ hash: hash });
            }
            console.log("and after the callback");
            return;
          } catch (err) {
            // it failed, delete the transaction
            console.log("sendPayment ERROR: payment failed....\n" + err);
            this.deletePreferredCryptoTransaction(senders, receivers, amounts, unique_hash, ticker);
            //mycallback({err: err});
            return;
          }
        }
      }
    } else {
      console.log("sendPayment ERROR: already sent");
      //mycallback({err: "already sent"});
    }
  }

  /**
   * Checks that a payment has been received if the current user is the receiver.
   * @param {Array} senders - Array of addresses
   * @param {Array} receivers - Array of addresses
   * @param {Array} amounts - Array of amounts to send
   * @param {Int} timestamp - Timestamp of time after which payment should be made
   * @param {Function} mycallback - (Array of {address: {String}, balance: {Int}}) -> {...}
   * @param {String} ticker - Ticker of install crypto module
   * @param {Int} tries - (default: 36) Number of tries to query the underlying crypto API before giving up. Sending -1 will cause infinite retries.
   * @param {Int} pollWaitTime - (default: 5000) Amount of time to wait between tries
   * @return {Array} Array of {address: {String}, balance: {Int}}
   */
  async receivePayment(
    senders = [],
    receivers = [],
    amounts = [],
    timestamp,
    unique_hash = "",
    mycallback,
    ticker,
    tries = 36,
    pollWaitTime = 5000
  ) {
    console.log("wallet receivePayment");
    let unique_tx_hash = this.generatePreferredCryptoTransactionHash(
      senders,
      receivers,
      amounts,
      unique_hash,
      ticker
    );
    console.log("wallet -> cryptomod - sendPayment: " + unique_tx_hash);
    console.log("unique_hash: " + unique_tx_hash);
    console.log("senders: " + JSON.stringify(senders));
    console.log("receivers: " + JSON.stringify(receivers));
    console.log("amounts: " + JSON.stringify(amounts));
    console.log("timestamp: " + timestamp);
    console.log("ticker: " + ticker);

    if (senders.length != receivers.length || senders.length != amounts.length) {
      console.log(
        "receivePayment ERROR. Lengths of senders, receivers, and amounts must be the same"
      );
      return;
    }
    if (senders.length !== 1) {
      console.log("receivePayment ERROR. Only supports one transaction");
      return;
    }

    //
    // if payment already received, return
    //
    if (
      this.doesPreferredCryptoTransactionExist(senders, receivers, amounts, unique_hash, ticker)
    ) {
      mycallback();
      console.log("our preferred crypto transaction exists!");
      return 1;
    }

    const cryptomod = this.returnCryptoModuleByTicker(ticker);
    await cryptomod.onIsActivated();

    //
    // create a function we can loop through to check if the payment has come in....
    //
    const check_payment_function = async () => {
      console.log("wallet -> cryptmod receivePayment");
      return await cryptomod.receivePayment(
        amounts[0],
        senders[0],
        receivers[0],
        timestamp - 3,
        unique_tx_hash
      ); // subtract 3 seconds in case system time is slightly off
    };

    const poll_check_payment_function = async () => {
      console.log("poll_check_payment_function remaining tries: " + tries);
      let result = null;
      try {
        result = await check_payment_function();
      } catch (err) {
        console.log("receivePayment ERROR." + err);
        return;
        //mycallback({err: err});
      }
      did_complete_payment(result);
    };

    const did_complete_payment = (result) => {
      if (result) {
        // The transaction was found, we're done.
        console.log("TRANSACTION FOUND");
        this.savePreferredCryptoTransaction(senders, receivers, amounts, unique_hash, ticker);
        mycallback(result);
      } else {
        // The transaction was not found.
        tries--;
        // This is === rather than < because sending -1 is a way to do infinite polling
        if (tries != 0) {
          setTimeout(() => {
            poll_check_payment_function();
          }, pollWaitTime);
        } else {
          // There is no way to handle errors with the interface of receivePayment as it's been designed.
          // We will swallow this error and log it to the console and return.
          // Do not delete this console.log, at least maybe the engineer who is maintaining this needs
          // some hope of figuring out why the game isn't progressing.
          console.log(
            "Did not receive payment after " + (pollWaitTime * tries) / 1000 + " seconds"
          );
          return;
          // mycallback({err: "Did not receive payment after " + ((pollWaitTime * tries)/1000) + " seconds"});
        }
      }
    };
    await poll_check_payment_function();
    //});
  }

  generatePreferredCryptoTransactionHash(
    senders = [],
    receivers = [],
    amounts,
    unique_hash,
    ticker
  ) {
    return this.app.crypto.hash(
      Buffer.from(
        JSON.stringify(senders) +
          JSON.stringify(receivers) +
          JSON.stringify(amounts) +
          unique_hash +
          ticker,
        "utf-8"
      )
    );
  }

  async savePreferredCryptoTransaction(senders = [], receivers = [], amounts, unique_hash, ticker) {
    let sig = this.generatePreferredCryptoTransactionHash(
      senders,
      receivers,
      amounts,
      unique_hash,
      ticker
    );
    this.preferred_txs.push({
      sig: sig,
      ts: new Date().getTime(),
    });
    for (let i = this.preferred_txs.length - 1; i >= 0; i--) {
      if (this.preferred_txs[i].timestamp < new Date().getTime() - 100000000) {
        this.preferred_txs.splice(i, 1);
      }
    }

    await this.saveWallet();

    return 1;
  }

  doesPreferredCryptoTransactionExist(senders = [], receivers = [], amounts, unique_hash, ticker) {
    const sig = this.generatePreferredCryptoTransactionHash(
      senders,
      receivers,
      amounts,
      unique_hash,
      ticker
    );
    for (let i = 0; i < this.preferred_txs.length; i++) {
      if (this.preferred_txs[i].signature === sig) {
        return 1;
      }
    }
    return 0;
  }

  deletePreferredCryptoTransaction(senders = [], receivers = [], amounts, unique_hash, ticker) {
    const sig = this.generatePreferredCryptoTransactionHash(
      senders,
      receivers,
      amounts,
      unique_hash,
      ticker
    );
    for (let i = 0; i < this.preferred_txs.length; i++) {
      if (this.preferred_txs[i].signature === sig) {
        this.preferred_txs.splice(i, 1);
      }
    }
  }

  private async isSlipInPendingTransactions(input: Slip): Promise<boolean> {
    let pending = await this.getPendingTxs();
    for (let i = 0; i < pending.length; i++) {
      let ptx = pending[i];
      for (let ii = 0; ii < ptx.from.length; ii++) {
        if (input.utxoKey === ptx.from[ii].utxoKey) {
          return true;
        }
      }
    }
    return false;
  }

  /////////////////////
  // END WEB3 CRYPTO //
  /////////////////////

  //////////////////
  // UI Functions //
  //////////////////

  /**
   * Serialized the user's wallet to JSON and downloads it to their local machine
   */
  async backupWallet() {
    try {
      if (this.app.BROWSER == 1) {
        let content = JSON.stringify(this.app.options);
        let pom = document.createElement("a");
        pom.setAttribute("type", "hidden");
        pom.setAttribute("href", "data:application/json;utf-8," + encodeURIComponent(content));
        pom.setAttribute("download", "saito.wallet.json");
        document.body.appendChild(pom);
        pom.click();
        pom.remove();
      }
    } catch (err) {
      console.log("Error backing-up wallet: " + err);
    }
  }

  async restoreWallet(file) {
    console.log("restoring wallet...");
    let wallet_reader = new FileReader();
    wallet_reader.readAsBinaryString(file);
    wallet_reader.onloadend = async () => {
      let decryption_secret = "";
      let decrypted_wallet = wallet_reader.result.toString();
      try {
        let wobj = JSON.parse(decrypted_wallet);
        await this.reset();
        await this.setPublicKey(wobj.wallet.publicKey);
        await this.setPrivateKey(wobj.wallet.privateKey);
        wobj.wallet.version = this.version;
        wobj.wallet.inputs = [];
        wobj.wallet.outputs = [];
        wobj.wallet.spends = [];
        wobj.games = [];
        wobj.gameprefs = {};
        this.app.options = wobj;

        this.app.blockchain.resetBlockchain();

        this.app.modules.returnModule("Arcade").onResetWallet();
        this.app.storage.saveOptions();

        alert("Restoration Complete ... click to reload Saito");
        window.location.reload();
      } catch (err) {
        if (err.name == "SyntaxError") {
          alert("Error reading wallet file. Did you upload the correct file?");
        } else if (false) {
          // put this back when we support encrypting wallet backups again...
          alert("Error decrypting wallet file. Password incorrect");
        } else {
          alert("Unknown error<br/>" + err);
        }
      }
    };
  }
}
