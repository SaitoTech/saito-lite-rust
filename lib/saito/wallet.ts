import Decimal from 'decimal.js';
import JSON from 'json-bigint';
import BalanceSnapshot from 'saito-js/lib/balance_snapshot';
import SaitoWallet, { WalletSlip } from 'saito-js/lib/wallet';
import S from 'saito-js/saito';
import { Saito } from '../../apps/core';
import Slip from './slip';
import Transaction from './transaction';
const getUuid = require('uuid-by-string');

const CryptoModule = require('../templates/cryptomodule');

interface PreferredTx {
  sig: string;
  ts: number;
}

export default class Wallet extends SaitoWallet {
  public app: Saito;

  publicKey;

  preferred_crypto = 'SAITO';

  // Array of Objects { sig, ts }
  preferred_txs: PreferredTx[] = [];

  default_fee = BigInt(0); // in nolan

  version = 5.676; //saito-js 0.2.83

  nolan_per_saito = 100000000;

  cryptos = new Map<string, any>();
  public saitoCrypto: any;

  public async createUnsignedTransactionWithDefaultFee(
    publicKey = '',
    amount = BigInt(0),
    default_fee = this.default_fee
  ): Promise<Transaction> {
    if (publicKey == '') {
      publicKey = await this.getPublicKey();
    }
    return this.createUnsignedTransaction(publicKey, amount, default_fee);
  }

  public async createUnsignedTransaction(
    publicKey = '',
    amount = BigInt(0),
    fee = BigInt(0),
    force_merge = false
  ): Promise<Transaction> {
    if (publicKey == '') {
      publicKey = await this.getPublicKey();
    }
    return S.getInstance().createTransaction(publicKey, amount, fee, force_merge);
  }

  public async createUnsignedTransactionWithMultiplePayments(
    keys: string[],
    amounts: bigint[],
    fee: bigint = this.default_fee
  ): Promise<Transaction> {
    return S.getInstance().createTransactionWithMultiplePayments(keys, amounts, fee);
  }

  public async getNftList(): Promise<String> {
      return S.getInstance().getNftList();
  }


  public async getBalance(ticker = 'SAITO'): Promise<bigint> {
    if (ticker === 'SAITO') {
      return this.instance.get_balance();
    }
    return BigInt(0);
  }


  public async createBoundTransaction(
    amt,
    bid,
    tid,
    sid,
    num,
    deposit,
    change,
    data,
    fee,
    receipient_publicKey,
  ): Promise<Transaction> {


      console.log("values going to saito.ts:");
      console.log(amt);
      console.log(bid);
      console.log(tid);
      console.log(sid);
      console.log(num);
      console.log(deposit);
      console.log(change);
      console.log(data);
      console.log(fee);
      console.log(receipient_publicKey);

      let nft_type = "Standard";
      return S.getInstance().createBoundTransaction(
        amt,
        bid,
        tid,
        sid,
        num,
        deposit,
        change,
        data,
        fee,
        receipient_publicKey,
        nft_type
      );
  }

  public async createSendBoundTransaction(
    amt,
    nft_id,
    data,
    receipient_publicKey,
  ){


      console.log("values going to saito.ts:");
      console.log(amt);
      console.log(nft_id);
      console.log(data);
      console.log(receipient_publicKey);

      return S.getInstance().createSendBoundTransaction(
        amt,
        nft_id,
        data,
        receipient_publicKey,
      );
  }

  async initialize() {
    let privateKey = await this.getPrivateKey();
    let publicKey = await this.getPublicKey();

    ////////////////
    // new wallet //
    ////////////////
    if (!privateKey || !publicKey) {
      await this.resetWallet();

      privateKey = await this.getPrivateKey();
      publicKey = await this.getPublicKey();
    }

    this.publicKey = publicKey;
    console.log('Initialize Wallet -- ', publicKey);

    // set default fee from options
    let storedFee = this.app.options.wallet.default_fee;
    this.default_fee = !storedFee ? BigInt(0) : BigInt(storedFee);

    // add ghost crypto module so Saito interface available
    class SaitoCrypto extends CryptoModule {
      constructor(app, publicKey) {
        super(app, 'SAITO');
        this.name = 'Saito';
        this.description = 'Saito';
        this.balance = '0.0';
        this.address = publicKey;

        this.options.isActivated = true;
      }

      returnLogo() {
        return '/saito/img/touch/pwa-192x192.png';
      }

      // Native $SAITO doesn't need to be installed/activated to become available
      isActivated() {
        return true;
      }

      //returns a Promise!
      returnPrivateKey() {
        return this.app.wallet.getPrivateKey();
      }

      checkWithdrawalFeeForAddress(address = '', mycallback: ((fee: string) => void) | null = null) {
        if (mycallback) {
          mycallback(this.app.wallet.convertNolanToSaito(this.app.wallet.default_fee));
        }
      }

      async returnHistory(callback: ((html: string) => void) | null = null) {
        let html = `
                <a target="_blank" href="/explorer" class="saito-history-msg">
                    View SAITO history on block explorer 
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </a>`;

        if (callback) {
          return callback(html);
        }
        return html;
      }

      async sendPayment(amount: string, to_address: string, unique_hash: string = '') {
        let nolan_amount = this.app.wallet.convertSaitoToNolan(amount);

        let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(
          to_address,
          nolan_amount
        );

        newtx.msg = {
          module: this.name,
          request: 'crypto payment',
          amount,
          from: this.publicKey,
          to: to_address,
          hash: unique_hash
        };

        console.log("newtx created: ", newtx);

        await this.app.wallet.signAndEncryptTransaction(newtx);
        await this.app.network.propagateTransaction(newtx);

        console.log("newtx propogated: ", newtx);

        return newtx.signature;
      }

      async sendPayments(amounts: bigint[], to_addresses: string[]) {
        const CHUNK_SIZE = 100;
        const signatures: string[] = [];

        // Process in chunks of 100
        for (let i = 0; i < amounts.length; i += CHUNK_SIZE) {
          const amountsChunk = amounts.slice(i, i + CHUNK_SIZE);
          const addressesChunk = to_addresses.slice(i, i + CHUNK_SIZE);

          let newTx = await this.app.wallet.createUnsignedTransactionWithMultiplePayments(
            addressesChunk,
            amountsChunk
          );
          await this.app.wallet.signAndEncryptTransaction(newTx);
          //console.log("newTx:\t" + JSON.stringify(newTx))
          await this.app.network.propagateTransaction(newTx);
          //console.log("TX Sent");
          signatures.push(newTx.signature);
        }

        // Return all transaction signatures
        return signatures.join(', ');
      }

      async receivePayment(howMuch, from, to, timestamp) {
        return false;

        // Returning false temporarily for all cases now.
        // Inputs and outputs arent used anymore, slips are used.
        // Will add correct logic here once changes related to this are done
        // at rust side.

        // const from_from = 0;
        // const to_to = 0;
        // if (to == (await this.app.wallet.getPublicKey())) {
        //   for (let i = 0; i < this.app.wallet.instance.inputs.length; i++) {
        //     if (this.app.wallet.instance.inputs[i].amount === howMuch) {
        //       if (parseInt(this.app.wallet.instance.inputs[i].timestamp) >= parseInt(timestamp)) {
        //         if (this.app.wallet.instance.inputs[i].publicKey == to) {
        //           return true;
        //         }
        //       }
        //     }
        //   }
        //   for (let i = 0; i < this.app.wallet.instance.outputs.length; i++) {
        //     if (this.app.wallet.instance.outputs[i].amount === howMuch) {
        //       if (parseInt(this.app.wallet.instance.outputs[i].timestamp) >= parseInt(timestamp)) {
        //         if (this.app.wallet.instance.outputs[i].publicKey == to) {
        //           return true;
        //         }
        //       }
        //     }
        //   }
        //   return false;
        // } else {
        //   if (from == (await this.app.wallet.getPublicKey())) {
        //     for (let i = 0; i < this.app.wallet.instance.outputs.length; i++) {
        //       //console.log("OUTPUT");
        //       //console.log(this.app.wallet.instance.outputs[i]);
        //       if (this.app.wallet.instance.outputs[i].amount === howMuch) {
        //         if (
        //           parseInt(this.app.wallet.instance.outputs[i].timestamp) >= parseInt(timestamp)
        //         ) {
        //           if (this.app.wallet.instance.outputs[i].publicKey == to) {
        //             return true;
        //           }
        //         }
        //       }
        //     }
        //   }
        //   return false;
        // }
      }

      async checkBalance() {
        let x = await this.app.wallet.getBalance();
        this.balance = this.app.wallet.convertNolanToSaito(x);
      }

      //typically async
      validateAddress(address) {
        return this.app.wallet.isValidPublicKey(address);
      }
    }

    this.saitoCrypto = new SaitoCrypto(this.app, this.publicKey);

    if (this.app.options.wallet != null) {

      /////////////
      // upgrade //
      /////////////
      if (this.app.options.wallet.version < this.version) {
        if (this.app.BROWSER == 1) {
          console.log('upgrading wallet version to : ' + this.version);
          let tmpprivkey = this.app.options.wallet.privateKey;
          let tmppubkey = this.app.options.wallet.publicKey;

          //
          // Note: since WASM switch over, we use camelCasing for the keys
          // These are two checks to make sure outdated wallets are still compatible
          //
          if (this.app.options.wallet.privatekey) {
            tmpprivkey = this.app.options.wallet.privatekey;
          }

          if (this.app.options.wallet.publickey) {
            tmppubkey = this.app.options.wallet.publickey;
          }

          let mixin = this.app.options.mixin;
          let crypto = this.app.options.crypto;

          // save contacts(keys)
          let keys = this.app.options.keys;
          let chats = this.app.options.chat;
          let leagues = this.app.options.leagues;

          // save theme options
          let theme = this.app.options.theme;

          // keep moderated whitelists & blacklists
          let modtools = this.app.options.modtools;

          // keep user's game preferences
          let gameprefs = this.app.options.gameprefs;

          // specify before reset to avoid archives reset problem
          await this.setPrivateKey(tmpprivkey);
          await this.setPublicKey(tmppubkey);

          // let modules purge stuff
          await this.onUpgrade('upgrade');

          // re-specify after reset
          await this.setPrivateKey(tmpprivkey);
          await this.setPublicKey(tmppubkey);

          // this.app.options.wallet = this.wallet;
          this.app.options.wallet.preferred_crypto = this.preferred_crypto;
          //this.app.options.wallet.preferred_txs = this.preferred_txs;
          this.app.options.wallet.version = this.version;
          this.app.options.wallet.default_fee = this.default_fee.toString();
          this.app.options.wallet.slips = [];

          // if (this.app.options.wallet.slips) {
          //    let slips = this.app.options.wallet.slips.map(
          //        (json: any) => {
          //            let slip = new WalletSlip();
          //            slip.copyFrom(json);
          //            return slip;
          //        }
          //    );
          //    console.log("preserving slips over a wallet reset... : "+slips.length);
          //    await this.addSlips(slips);
          // }
          // reset games and restore game settings
          this.app.options.games = [];
          this.app.options.gameprefs = gameprefs;

          // keep mixin
          this.app.options.mixin = mixin;
          this.app.options.crypto = crypto;

          // keep contacts (keys)
          this.app.options.keys = keys;
          this.app.options.chat = chats;
          this.app.options.leagues = leagues;

          // keep theme
          this.app.options.theme = theme;

          // restore white and black lists
          this.app.options.modtools = modtools;

          await this.reset(true);
          await this.saveWallet();

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          alert('Saito Upgrade: Wallet Version: ' + this.version);
        } else {
          // purge old slips
          this.app.options.wallet.version = this.version;
          this.app.options.wallet.slips = [];

          this.app.storage.saveOptions();
        }
      } else {
        if (typeof this.app.options.wallet.preferred_crypto != 'undefined') {
          this.preferred_crypto = this.app.options.wallet.preferred_crypto;
        }
        if (this.app.options.wallet.slips) {
          let slips = this.app.options.wallet.slips.map((json: any) => {
            let slip = new WalletSlip();
            slip.copyFrom(json);
            return slip;
          });
          console.log('preserving slips without a wallet reset..... : ' + slips.length);
          await this.addSlips(slips);
        }
      }

      //
      // filter and resend pending txs
      //
      if (!this.app.options.pending_txs) {
        this.app.options.pending_txs = [];
      }
      let pending_txs = this.app.options.pending_txs;
      this.app.options.pending_txs = [];
      for (let i = pending_txs.length - 1, k = 0; i >= 0; i--, k++) {
        try {
          if (pending_txs[i].instance) {
            delete pending_txs[i].instance;
          }
          if (!pending_txs[i].from) {
          } else {
            let newtx = new Transaction();
            newtx.deserialize_from_web(this.app, JSON.stringify(pending_txs[i]));
            if (newtx.timestamp > new Date().getTime() - 85000000) {
              await this.app.wallet.addTransactionToPending(newtx, false);
            }
          }
        } catch (err) {
          console.log('caught error: ' + JSON.stringify(err));
        }
      }

      this.app.connection.on('wallet-updated', async () => {
        await this.saveWallet();
      });

      this.app.connection.on('keychain-updated', () => {
        this.setKeyList(this.app.keychain.returnWatchedPublicKeys());
      });
    }

    await this.saitoCrypto.initialize(this.app);
  
  }

  constructor(wallet: any) {
    super(wallet);

    this.saitoCrypto = null;

    // this.recreate_pending_transactions = 0;
  }

  /**
   * Generates a new keypair for the user, resets all stored wallet info, and saves
   * the new wallet to local storage.
   */
  async resetWallet() {
    console.log('resetting wallet : ' + (await this.getPublicKey()));

    //
    // This creates the new key pair
    //
    await this.reset(false);

    if (this.app.options.blockchain) {
      await this.app.blockchain.resetBlockchain();
    }

    await this.app.storage.clearLocalForage();

    await this.app.storage.resetOptions();

    // keychain
    if (this.app.options.keys) {
      this.app.options.keys = [];
    }

    this.app.options.invites = [];
    this.app.options.games = [];

    // wallet backup
    if (!this.app.options.wallet) {
      this.app.options.wallet = {};
    }
    this.app.options.wallet.backup_required = false;

    // in-game crypto transfer preferences
    if (!this.app.options.gameprefs) {
      this.app.options.gameprefs = {};
    }

    this.preferred_crypto = 'SAITO';

    await this.saveWallet();

    console.log('new wallet : ' + (await this.getPublicKey()));
  }

  /**
   * Saves the current wallet state to local storage.
   */
  async saveWallet() {
    if (!this.app.options.wallet) {
      this.app.options.wallet = {};
    }
    this.app.options.wallet.preferred_crypto = this.preferred_crypto;
    this.app.options.wallet.preferred_txs = this.preferred_txs;
    this.app.options.wallet.version = this.version;
    this.app.options.wallet.default_fee = this.default_fee.toString();

    try {
      this.app.options.pending_txs = await this.getPendingTransactions();
      if (!this.app.options.pending_txs) {
        this.app.options.pending_txs = [];
      }
    } catch (err) {
      this.app.options.pending_txs = [];
    }

    let slips = await this.getSlips();
    this.app.options.wallet.slips = slips.map((slip) => slip.toJson());

    await this.save();
    this.app.storage.saveOptions();
  }

  /////////////////////////
  // WEB3 CRYPTO MODULES //
  /////////////////////////

  returnInstalledCryptos() {
    const cryptoModules: (typeof CryptoModule)[] = this.app.modules.returnModulesBySubType(CryptoModule);
    if (this.saitoCrypto !== null) {
      cryptoModules.push(this.saitoCrypto);
    }
    return cryptoModules;
  }

  returnActivatedCryptos() {
    const allMods = this.returnInstalledCryptos();
    const activeMods: (typeof CryptoModule)[] = [];
    for (let i = 0; i < allMods.length; i++) {
      if (allMods[i].isActivated()) {
        activeMods.push(allMods[i]);
      }
    }
    return activeMods;
  }

  returnCryptoModuleByTicker(ticker) {
    const mods = this.returnInstalledCryptos();
    for (let i = 0; i < mods.length; i++) {
      // be case insensitive, just in case
      if (mods[i].ticker.toUpperCase() === ticker.toUpperCase()) {
        return mods[i];
      }
    }
    throw 'Module Not Found: ' + ticker;
  }

  /**
   *
   * @return 1 if successful, 0 if not. Catches the Module not found error and displays it
   */
  async setPreferredCrypto(ticker) {
    try {
      let c_mod = this.returnCryptoModuleByTicker(ticker);
      this.preferred_crypto = ticker.toUpperCase();
      console.log('Activating cryptomod: ' + ticker);
      await c_mod.activate();
      await this.saveWallet();
      // if UI is enabled, will re-render the qr code, ticker, and balance in the hamburger menu
      this.app.connection.emit('header-update-crypto');
      return 1;
    } catch (err) {
      console.error(err);
    }
    return 0;
  }

  returnPreferredCrypto() {
    try {
      return this.returnCryptoModuleByTicker(this.preferred_crypto);
    } catch (err) {
      if (err.startsWith('Module Not Found:')) {
        console.warn(`Preferred crypto (${this.preferred_crypto}) not installed!`);
        //Shouldn't need to await because native crypto is seemless
        this.preferred_crypto = 'SAITO';
        return this.returnCryptoModuleByTicker('SAITO');
      } else {
        throw err;
      }
    }
  }

  returnPreferredCryptoTicker() {
    return this?.preferred_crypto || 'SAITO';
  }

  returnPreferredCryptoAddress() {
    let preferred_crypto = this.returnPreferredCrypto();
    return preferred_crypto.returnAddress();
  }

  returnCryptoAddressByTicker(ticker = 'SAITO') {
    try {
      if (ticker === 'SAITO') {
        return this.publicKey;
      } else {
        const cmod = this.returnCryptoModuleByTicker(ticker);
        if (cmod) {
          return cmod.returnAddress();
        }
        console.log(`Crypto Module (${ticker}) not found`);
      }
    } catch (err) {
      console.error(err);
    }
    return '';
  }

  async returnAvailableCryptosAssociativeArray() {
    console.log('into wallet.returnAvailableCryptosAssociativeArray()');

    let cryptos = {};

    let ticker;
    try {
      let mods = this.returnActivatedCryptos();
      for (let i = 0; i < mods.length; i++) {
        ticker = mods[i].ticker;
        let address = mods[i].formatAddress();
        await mods[i].checkBalance();
        let balance = mods[i].returnBalance();

        if (!cryptos[ticker]) {
          cryptos[ticker] = { address, balance };
        }

        if (parseFloat(balance) > 0) {
          mods[i].save();
        }
      }
    } catch (err) {
      console.error(err);
      console.log(ticker);
    }
    console.log('done wallet.returnAvailableCryptosAssociativeArray()');
    return cryptos;
  }

  saveAvailableCryptosAssociativeArray(publicKey, cryptos) {
    for (let ticker in cryptos) {
      console.log("$$$ SAVE -- ", publicKey, ticker, cryptos[ticker].address);
      this.app.keychain.addCryptoAddress(publicKey, ticker, cryptos[ticker].address);
    }
    this.app.keychain.saveKeys();
  }

  async returnPreferredCryptoBalance() {
    const cryptomod = this.returnPreferredCrypto();
    await cryptomod.checkBalance();
    return cryptomod.returnBalance();
  }

  /**
   * Sends payments to the addresses provided if this user is the corresponding
   * sender. Will not send if similar payment was found after the given timestamp.
   * @param {String} ticker - Ticker of install crypto module
   * @param {Array} senders - Array of addresses -- in web3 currency
   * @param {Array} receivers - Array of addresses -- in web3 curreny
   * @param {Array} amounts - Array of amounts to send
   * @param {Function} mycallback - ({hash: {String}}) -> {...}
   * @param {String} public key of recipient so we can inform them of the payment
   */
  async sendPayment(
    ticker,
    senders = [],
    receivers = [],
    amounts = [],
    unique_hash = '',
    mycallback: ((response: { err?: string; hash?: string; rtnObj?: any }) => void) | null = null,
    saito_public_key = null
  ) {
    console.log('wallet sendPayment 1');

    if (senders.length !== 1 || receivers.length !== 1 || amounts.length !== 1) {
      // We have no code which exercises multiple senders/receivers so can't implement it yet.
      console.error('sendPayment ERROR: Only supports one transaction');
      console.log(senders, receivers, amounts);
      if (mycallback){
        mycallback({ err: 'Only supports one transaction' });
      }
      return;
    }

    let rtnObj = {};

    if (!this.doesPreferredCryptoTransactionExist(unique_hash)) {
      console.log('preferred crypto transaction does not already exist');
      const cryptomod = this.returnCryptoModuleByTicker(ticker);
      for (let i = 0; i < senders.length; i++) {
        //
        // DEBUGGING - sender is address to which we send the crypto
        //       - not our own publickey
        //

        if (senders[i] === cryptomod.formatAddress()) {
          // Need to save before we await, otherwise there is a race condition
          await this.savePreferredCryptoTransaction(unique_hash);
          try {
            const hash = await cryptomod.sendPayment(amounts[i], receivers[i], unique_hash);
            //
            // hash is "" if unsuccessful, trace_id if successful
            //
            if (hash === '') {
              this.deletePreferredCryptoTransaction(unique_hash);
            }

            if (saito_public_key) {
              if (ticker !== "SAITO") {
                await cryptomod.sendPaymentTransaction(saito_public_key, senders[i], receivers[i], amounts[i], unique_hash);
              }
            }

            if (mycallback) {
              mycallback({ hash: hash });
            }
            return;
          } catch (err) {
            // it failed, delete the transaction
            this.deletePreferredCryptoTransaction(unique_hash);
            rtnObj = { err };
          }
        } else {
          console.log(cryptomod.name);
          console.log(senders[i], cryptomod.formatAddress());
          rtnObj = { err: 'wrong address' };
        }
      }
    } else {
      rtnObj = { err: 'already sent' };
    }

    console.error('sendPayment ERROR: ', rtnObj);

    if (mycallback) {
      mycallback({ rtnObj });
    }
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
  async sendPayments(
    senders = [],
    receivers = [],
    amounts = [],
    timestamp,
    unique_hash = '',
    mycallback: ((response: { err?: string; hash?: string }) => void) | null = null,
    ticker
  ) {
    console.log('wallet sendPayment 2');
    // validate inputs
    if (senders.length != receivers.length || senders.length != amounts.length) {
      // mycallback({err: "Lengths of senders, receivers, and amounts must be the same"});
      return;
    }

    if (!this.doesPreferredCryptoTransactionExist(unique_hash)) {
      const cryptomod = this.returnCryptoModuleByTicker(ticker);
      await this.savePreferredCryptoTransaction(unique_hash);
      try {
        let amounts_to_send: bigint[] = [];
        let to_addresses = [];
        for (let i = 0; i < senders.length; i++) {
          amounts_to_send.push(BigInt(amounts[i]));
          to_addresses.push(receivers[i]);
        }
        const hash = await cryptomod.sendPayments(amounts_to_send, to_addresses);
        //
        // hash is "" if unsuccessful, trace_id if successful
        //
        if (hash === '') {
          this.deletePreferredCryptoTransaction(unique_hash);
        }

        if (mycallback) {
          mycallback({ hash: hash });
        }
        return;
      } catch (err) {
        // it failed, delete the transaction
        console.log('sendPayments ERROR: payment failed....\n' + err);
        this.deletePreferredCryptoTransaction(unique_hash);
        if (mycallback) {
          mycallback({ err: err });
        }
        return;
      }
    } else {
      console.log('sendPayment ERROR: already sent');
      //mycallback({err: "already sent"});
    }
  }

  /**
   * Checks that a payment has been received if the current user is the receiver.
   * @param {String} ticker - Ticker of install crypto module
   * @param {Array} senders - Array of addresses
   * @param {Array} receivers - Array of addresses
   * @param {Array} amounts - Array of amounts to send
   * @param {Function} mycallback - (Array of {address: {String}, balance: {Int}}) -> {...}
   * @param {String} (optional) public key of sender 
   */
  async receivePayment(
    ticker,
    senders = [],
    receivers = [],
    amounts = [],
    unique_hash = '',
    mycallback: ((response?: { err?: string }) => void) | null = null,
    saito_public_key = null  
  ) {


    if (senders.length !== 1 || receivers.length !== 1 || amounts.length !== 1) {
      // We have no code which exercises multiple senders/receivers so can't implement it yet.
      console.error('receivePayment ERROR. Only supports one transaction');
      if (mycallback){
        mycallback({ err: 'Only supports one transaction' });
      }
      return;
    }

    const cryptomod = this.returnCryptoModuleByTicker(ticker);

    // make sure activated but not necessarily our preferred crypto... (why?)
    await cryptomod.onIsActivated();

    await cryptomod.saveInboundPayment(unique_hash);

    if (mycallback) {
      mycallback();
    }

  }


  async savePreferredCryptoTransaction(unique_tx_hash) {
    this.preferred_txs.push({
      sig: unique_tx_hash,
      ts: new Date().getTime()
    });

    // trim old transactions
    for (let i = this.preferred_txs.length - 1; i >= 0; i--) {
      if (this.preferred_txs[i].ts < new Date().getTime() - 100000000) {
        this.preferred_txs.splice(i, 1);
      }
    }

    await this.saveWallet();

    return 1;
  }

  doesPreferredCryptoTransactionExist(unique_tx_hash) {
    for (let i = 0; i < this.preferred_txs.length; i++) {
      if (this.preferred_txs[i].sig === unique_tx_hash) {
        return 1;
      }
    }
    return 0;
  }

  deletePreferredCryptoTransaction(unique_tx_hash) {
    console.log('Deleting preferred crypto transaction');

    for (let i = 0; i < this.preferred_txs.length; i++) {
      if (this.preferred_txs[i].sig === unique_tx_hash) {
        this.preferred_txs.splice(i, 1);
      }
    }
  }

  private async isSlipInPendingTransactions(input: Slip): Promise<boolean> {
    let pending = await this.getPendingTransactions();
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

  async getPendingTransactions() {
    return this.getPendingTxs();
  }

  /////////////////////
  // END WEB3 CRYPTO //
  /////////////////////

  //////////////////
  // UI Functions //
  //////////////////

  //
  // We can use this function to selectively exclude some things from the "wallet"
  // for backup purposes
  //
  exportWallet() {
    let newObj = JSON.parse(JSON.stringify(this.app.options));

    delete newObj.games;

    return JSON.stringify(newObj);
  }

  /**
   * Serialized the user's wallet to JSON and downloads it to their local machine
   */
  async backupWallet() {
    try {
      if (this.app.BROWSER == 1) {
        let publicKey = await this.getPublicKey();

        if (this.app.options.wallet?.backup_required) {
          this.app.options.wallet.backup_required = false;
          await this.saveWallet();
          console.log('Clear flashing reminder from wallet.ts');
          this.app.connection.emit('saito-header-update-message', {});
        }

        //let content = JSON.stringify(this.app.options);
        let pom = document.createElement('a');
        pom.setAttribute('type', 'hidden');
        pom.setAttribute(
          'href',
          'data:application/json;utf-8,' + encodeURIComponent(this.exportWallet())
        );
        pom.setAttribute('download', `saito-wallet-${publicKey}.json`);
        document.body.appendChild(pom);
        pom.click();
        pom.remove();
      }
    } catch (err) {
      console.log('Error backing-up wallet: ' + err);
    }
  }

  /**
   * If the to field of the transaction contains a pubkey which has previously negotiated a diffie-hellman
   * key exchange, encrypt the message part of message, attach it to the transaction, and resign the transaction
   * @param {Transaction}
   * @return {Transaction}
   */
  async signAndEncryptTransaction(tx: Transaction, recipient = '') {
    if (tx == null) {
      return null;
    }

    //
    // convert tx.msg to base64 tx.ms
    //
    // if the transaction is of excessive length, we cut the message and
    // continue blank. so be careful kids as there are some hardcoded
    // limits in NodeJS!
    //
    try {
      // Empty placeholder protects data in case encryption fails to fire
      let encryptedMessage = '';

      // if recipient input has a shared secret in keychain
      if (this.app.keychain.hasSharedSecret(recipient)) {
        encryptedMessage = this.app.keychain.encryptMessage(recipient, tx.msg);
      }
      // if tx sendee's public address has shared secret
      else if (this.app.keychain.hasSharedSecret(tx.to[0].publicKey)) {
        encryptedMessage = this.app.keychain.encryptMessage(tx.to[0].publicKey, tx.msg);
      }

      if (encryptedMessage) {
        tx.msg = encryptedMessage;
      } else {
        //console.warn("Not encrypting transaction because don't have shared key with recipient");
      }

      //
      // nov 25 2022 - eliminate base64 formatting for TXS
      //
      //tx.m = Buffer.from(
      //  this.app.crypto.stringToBase64(JSON.stringify(tx.msg)),
      //  "base64"
      //);
      tx.data = Buffer.from(JSON.stringify(tx.msg), 'utf-8');
    } catch (err) {
      console.log('####################');
      console.log('### OVERSIZED TX ###');
      console.log('###   -revert-   ###');
      console.log('####################');
      console.log(err);
      tx.msg = {};
    }

    await tx.sign();

    return tx;
  }

  public async fetchBalanceSnapshot(key: string) {
    try {
      console.log('fetching balance snapshot for key : ' + key);
      let response = await fetch('/balance/' + key);
      let data = await response.text();
      let snapshot = BalanceSnapshot.fromString(data);
      if (snapshot) {
        await S.getInstance().updateBalanceFrom(snapshot);
      }
    } catch (error) {
      console.error(error);
    }
  }

  public isValidPublicKey(key: string): boolean {
    if (this.app.crypto.isBase58(key)) {
      return S.getInstance().isValidPublicKey(key);
    } else {
      return false;
    }
  }

  //
  // temporarily disabled
  //
  public async addTransactionToPending(tx: Transaction, save = true) {
    if (!this.app.options.pending_txs) {
      this.app.options.pending_txs = [];
    }
    if (save) {
      if (!this.app.options.pending_txs) {
        this.app.options.pending_txs = [];
      }
      this.app.options.pending_txs.push(tx.serialize_to_web(this.app));
    }
    return S.getInstance().addPendingTx(tx);
    if (save) {
      this.app.storage.saveOptions();
    }
  }

  public async onUpgrade(type = '', privatekey = '', walletfile: { result: string } | null = null) {
    let publicKey = await this.getPublicKey();

    if (type == 'nuke') {
      await this.resetWallet();
      publicKey = await this.getPublicKey();
    } else if (type == 'import') {
      //
      // wallet file used for importing
      //
      if (walletfile != null) {
        let decryption_secret = '';
        let decrypted_wallet = walletfile.result.toString();
        try {
          let wobj = JSON.parse(decrypted_wallet);

          await this.reset(false);

          await this.setPublicKey(wobj.wallet.publicKey);
          await this.setPrivateKey(wobj.wallet.privateKey);
          wobj.wallet.version = this.version;
          wobj.wallet.inputs = [];
          wobj.wallet.outputs = [];
          wobj.wallet.spends = [];
          wobj.games = [];
          this.app.options = wobj;

        } catch (err) {
          try {
            alert('error: ' + JSON.stringify(err));
          } catch (err) {}
          console.log(err);
          return err.name;
        }

        publicKey = await this.getPublicKey();

      } else if (privatekey != '') {
        //
        // privatekey used for wallet importing
        //
        try {
          publicKey = this.app.crypto.generatePublicKey(privatekey);
          await this.setPublicKey(publicKey);
          await this.setPrivateKey(privatekey);
          this.app.options.wallet.version = this.version;
          this.app.options.wallet.inputs = [];
          this.app.options.wallet.outputs = [];
          this.app.options.wallet.spends = [];
          this.app.options.wallet.pending = [];

          // Maybe stored our options in localForage
          await this.app.storage.resetOptionsFromKey(publicKey);

        } catch (err) {
          return err.name;
        }
      }else{
        console.error("Cannot import a wallet without a private key or json file!");
      }
    } else if (type == 'upgrade') {
      // purge old slips
      this.app.options.wallet.slips = [];
    }

    await this.app.modules.onUpgrade(type, privatekey, walletfile);

    await this.app.blockchain.resetBlockchain();
    
    await this.fetchBalanceSnapshot(publicKey);

    await this.saveWallet();
    return true;
  }

  public convertSaitoToNolan(amount = '0.0') {
    let nolan = 0;
    let num = Decimal(amount);
    if (Number(amount) > 0) {
      nolan = Number(num.times(this.nolan_per_saito).toFixed(0)); // 100,000,000
    }

    return BigInt(nolan);
  }

  public convertNolanToSaito(amount = BigInt(0)) {
    let string = '0.00';
    let num = 0;
    let bigint_divider = 100000000n;

    if (typeof amount == 'bigint') {
      // convert bigint to number
      num = Number((amount * 100000000n) / bigint_divider) / 100000000;

      // convert number to string
      string = num.toString();
    } else {
      console.error(`convertNolanToSaito: Type ` + typeof amount + ` provided. BigInt required`);
    }

    return string;
  }

  public async setKeyList(keylist: string[]): Promise<void> {
    return await this.instance.set_key_list(keylist);
  }

  public async disableProducingBlocksByTimer() {
    return S.getInstance().disableProducingBlocksByTimer();
  }

  public async produceBlockWithGt() {
    return S.getInstance().produceBlockWithGt();
  }

  public async produceBlockWithoutGt() {
    return S.getInstance().produceBlockWithoutGt();
  }
}
