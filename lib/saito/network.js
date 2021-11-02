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

  isPrivateNetwork() {
    for (let i = 0; i < this.peers.length; i++) {
      if (this.peers[i].isConnected()) {
	return false; 
      }
    }
    if (this.app.options.peers != null) {
      return false;
    }
    return true;
    return false;
  }

  isProductionNetwork() {
    if (this.app.BROWSER === 0) {
      return process.env.NODE_ENV === 'prod'
    } else {
      return false
    }
  }


}

module.exports = Network;

