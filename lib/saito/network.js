const saito = require('./saito');
const fetch = require('node-fetch');
const { set } = require('numeral');
const Base58 = require("base-58");
const secp256k1 = require('secp256k1');

class Network {

  constructor(app) {
    this.app = app || {};
  }

  initialize() {

  }



}

module.exports = Network;

