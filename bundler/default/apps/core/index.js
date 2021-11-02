const saito_lib = require('../../lib/saito/saito');
const path = require('path');

class Saito {

  constructor(config={}) {

    this.BROWSER           = 1;
    this.SPVMODE           = 0;
    this.options           = config;
    this.config            = {};

    this.newSaito();

    this.modules    = new saito_lib.modules(this, config.mod_paths);

    return this;
  }

  newSaito() {
    this.crypto     = new saito_lib.crypto(this);
    this.connection = new saito_lib.connection();
    this.browser    = new saito_lib.browser(this);
    this.storage    = new saito_lib.storage(this);
    this.utxoset    = new saito_lib.utxoset(this);
    this.mempool    = new saito_lib.mempool(this);
    this.wallet     = new saito_lib.wallet(this);
    this.miner      = new saito_lib.miner(this);
    this.keys       = new saito_lib.keychain(this);
    this.network    = new saito_lib.network(this);
    this.burnfee    = new saito_lib.burnfee(this);
    this.blockchain = new saito_lib.blockchain(this);
  }

  async init() {
    try {

      await this.storage.initialize();

if (this.BROWSER == 0) {
  //this.blake3 = require('blake3');
  //this.hash = this.blake3.hash;
  //console.log("TEST: " + this.hash("TESTING"));
  let blake3 = require('blake3');
  this.hash = (data) => { return blake3.hash(data).toString('hex'); };
  console.log("TEST: " + this.hash("TESTING"));
} else {
  console.log("importing blake 3");
  let blake3 = require("blake3-js");
  console.log("importing blake 3 - 2");
  this.hash = (data) => { 
    console.log("in hash function");
    return blake3.newRegular().update(data).finalize(); 
  }
  console.log("HASH: " + this.hash("TESTING"));
  //console.log("HASH: " + this.blake3.newRegular().update("TESTING").finalize());
}

      let _self = this;

      this.wallet.initialize();
      this.mempool.initialize();
      this.keys.initialize();

      this.modules.mods = this.modules.mods_list.map(mod_path => {
        const Module = require(`../../mods/${mod_path}`);
        let x = new Module(this);
        x.dirname = path.dirname(mod_path);
        return x;
      });

      //
      // browser sets active module
      //
      await this.browser.initialize();
      await this.modules.initialize();

      //
      // blockchain after modules create dbs
      //
      await this.blockchain.initialize();

      this.network.initialize();

      if (this.server) {
        this.server.initialize();
      }

    } catch(err) {
      console.log("Error occured initializing your Saito install. The most likely cause of this is a module that is throwing an error on initialization. You can debug this by removing modules from your config file to test which ones are causing the problem and restarting.");
      console.log(err);
    }

  }

  async reset(config) {
    this.options = config
    this.newSaito()
    await this.init();
  }

  shutdown() {
    this.network.close();
  }
}

module.exports.Saito = Saito;
module.exports.saito_lib = saito_lib;

