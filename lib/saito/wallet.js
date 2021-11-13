'use strict';

const saito = require('./saito');
const Big      = require('big.js');
const AbstractCryptoModule = require('../templates/abstractcryptomodule')
const ModalSelectCrypto = require('./ui/modal-select-crypto/modal-select-crypto');



/**
 * A Saito-lite wallet.
 * @param {*} app
 */
class Wallet {

  constructor(app) {
    if (!(this instanceof Wallet)) {
      return new Wallet(app);
    }

    this.app				 = app || {};
    this.wallet                          = {};
    this.wallet.balance                  = "0";
    this.wallet.publickey                = "";
    this.wallet.privatekey               = "";

    this.wallet.inputs                   = [];		// slips available
    this.wallet.outputs                  = [];		// slips spenr
    this.wallet.spends                   = [];		// TODO -- replace with hashmap using UUID. currently array mapping inputs -> 0/1 whether spent
    this.wallet.pending                  = [];		// slips pending broadcast
    this.wallet.default_fee              = 2;
    this.wallet.version                  = 3.443;

    this.wallet.preferred_crypto         = "SAITO";
    this.wallet.preferred_txs            = [];

    this.inputs_hmap                     = [];
    this.inputs_hmap_counter             = 0;
    this.inputs_hmap_counter_limit       = 10000;
    this.outputs_hmap                    = [];
    this.outputs_hmap_counter            = 0;
    this.outputs_hmap_counter_limit      = 10000;
    this.outputs_prune_limit             = 100;

    this.recreate_pending_transactions   = 0;

  }

  createUnsignedTransactionWithDefaultFee(publickey, amount=0.0) {
    return this.createUnsignedTransaction(publickey, amount, 0.0);
  }
  createUnsignedTransaction(publickey, amount=0.0, fee=0.0, force_merge=0) {

    if (publickey == "") { publickey = this.returnPublicKey(); }

    let transaction = new saito.transaction();

    transaction.transaction.inputs.push(new saito.slip(this.returnPublicKey(), "0"));
    transaction.transaction.outputs.push(new saito.slip(this.returnPublicKey(), "0"));

    return transaction;

  }


  initialize() {

    if (this.wallet.privatekey == "") {
      if (this.app.options.wallet != null) {

        /////////////
        // upgrade //
        /////////////
        if (this.app.options.wallet.version < this.wallet.version) {

          if (this.app.BROWSER == 1) {

            let tmpprivkey = this.app.options.wallet.privatekey;
            let tmppubkey = this.app.options.wallet.publickey;

            // specify before reset to avoid archives reset problem
            this.wallet.publickey = tmppubkey;
            this.wallet.privatekey = tmpprivkey;

            // let modules purge stuff
            this.app.modules.onWalletReset();

            // reset and save
            this.app.storage.resetOptions();
            this.app.storage.saveOptions();

            // re-specify after reset
            this.wallet.publickey = tmppubkey;
            this.wallet.privatekey = tmpprivkey;

            this.app.options.wallet = this.wallet;

            // reset blockchain
            //this.app.options.blockchain.last_bid = "";
            //this.app.options.blockchain.last_hash = "";
            //this.app.options.blockchain.last_ts = "";

            // delete inputs and outputs
            this.app.options.wallet.inputs   = [];
            this.app.options.wallet.outputs  = [];
            this.app.options.wallet.spends   = [];
            this.app.options.wallet.pending  = [];
            this.app.options.wallet.balance  = "0.0";
            this.app.options.wallet.version  = this.wallet.version;

            this.saveWallet();

            salert("Saito Upgrade: Wallet Reset");

          } else {

            //
            // purge old slips
            //
            this.app.options.wallet.version = this.wallet.version;

            this.app.options.wallet.inputs   = [];
            this.app.options.wallet.outputs  = [];
            this.app.options.wallet.pending  = [];
            this.app.options.wallet.balance  = "0.0";

            this.app.storage.saveOptions();
          }
        }

        this.wallet = Object.assign(this.wallet, this.app.options.wallet);
      }
    }
    ////////////////
    // new wallet //
    ////////////////
    if (this.wallet.privatekey == "") {
      this.resetWallet();
    }

  }

  isSlipValid(slip, index) {
    let isSlipSpent = this.wallet.spends[index];
    let isSlipLC = slip.lc == 1;
    let isSlipGtLVB = slip.bid >= this.app.blockchain.returnLowestSpendableBlock();
    let isSlipinTX = this.app.mempool.transactions_inputs_hmap[slip.returnKey()] != 1;
    let valid = !isSlipSpent && isSlipLC && isSlipGtLVB && isSlipinTX;
    return valid;
  }

  onChainReorganization(block, lc) {

  }

  returnPublicKey() {
    return this.wallet.publickey;
  }

  returnPrivateKey() {
    return this.wallet.privatekey;
  }

  returnBalance(ticker="SAITO") {
    if (ticker === "SAITO") {
      let b = Big(0);
       this.wallet.inputs.forEach((input, index )=> {
         if (this.isSlipValid(input, index)) {
           b = b.plus(input.amt);
         }
       });
       return b;
    }
    return "0.0";
  }


  /**
   * Generates a new keypair for the user, resets all stored wallet info, and saves
   * the new wallet to local storage.
   */
  async resetWallet() {

    this.wallet.privatekey            = this.app.crypto.generateKeys();
    this.wallet.publickey             = this.app.crypto.returnPublicKey(this.wallet.privatekey);

    if (this.app.options.blockchain != undefined) {
      this.app.blockchain.resetBlockchain();
    }

    // keychain
    if (this.app.options.keys != undefined) {
      this.app.options.keys = [];
    }

    this.wallet.inputs                = [];
    this.wallet.outputs               = [];
    this.wallet.spends                = [];
    this.wallet.pending               = [];

    this.saveWallet();

    if (this.app.browser.browser_active == 1) {
      window.location.reload();
    }

  }


  /**
   * Saves the current wallet state to local storage.
   */
  saveWallet() {
    this.app.options.wallet = this.wallet;
    this.app.storage.saveOptions();
  }

  /**
   * Sign a transactions and attach the sig to the transation
   * @param {Transaction}
   * @return {Transaction}
   */
  signTransaction(tx) {

    if (tx == null) { return null; }

    //
    // convert tx.msg to base64 tx.transaction.m
    //
    try {
      tx.transaction.message = this.app.crypto.stringToBase64(JSON.stringify(tx.msg));
      tx.sign(this.app);
    } catch (err) {
      console.error("####################");
      console.error("### OVERSIZED TX ###");
      console.error("###   -revert-   ###");
      console.error("####################");
      console.error(err);
      tx.msg = {};
      return tx;
    }

    return tx;
  }


}

module.exports = Wallet;


