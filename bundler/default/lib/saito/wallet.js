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
  }

  initialize() {

  }


}

module.exports = Wallet;

