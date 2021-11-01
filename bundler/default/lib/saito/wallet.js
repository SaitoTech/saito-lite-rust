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

    this.wallet.inputs                   = [];
    this.wallet.outputs                  = [];
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

    //
    // TODO - migrate pending slips
    //

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

    //if (this.app.options.blockchain != undefined) {
    //  this.app.blockchain.resetBlockchainOptions();
    //}

    // keychain
    if (this.app.options.keys != undefined) {
      this.app.options.keys = [];
    }

    this.wallet.inputs                = [];
    this.wallet.outputs               = [];
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


}

module.exports = Wallet;


