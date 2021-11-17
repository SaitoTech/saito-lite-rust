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
    this.binary       = new saito_lib.binary(this);
    this.crypto       = new saito_lib.crypto(this);
    this.connection   = new saito_lib.connection();
    this.browser      = new saito_lib.browser(this);
    this.storage      = new saito_lib.storage(this);
    this.goldenticket = new saito_lib.goldenticket(this);
    this.utxoset      = new saito_lib.utxoset(this);
    this.mempool      = new saito_lib.mempool(this);
    this.wallet       = new saito_lib.wallet(this);
    this.miner        = new saito_lib.miner(this);
    this.keys         = new saito_lib.keychain(this);
    this.network      = new saito_lib.network(this);
    this.networkApi   = new saito_lib.networkApi(this);
    this.burnfee      = new saito_lib.burnfee(this);
    this.blockchain   = new saito_lib.blockchain(this);
    this.blockring    = new saito_lib.blockring(this, this.blockchain.returnGenesisPeriod());

  }

  async init() {
    try {

      await this.storage.initialize();

      //
      // import hashing library here because of complications with both
      // performant blake3 library and less performant blake3-js that neeeds
      // to run in the browser but cannot be deployed via WASM.
      //
      // app.crypto.hash()
      //
      // is still our go-to function for hashing. This just prepares the
      // functions and puts them on the app object so that the crypto.hash
      // function can invoke whichever one is being used in that specific
      // configuration (server / browser);
      //
      if (this.BROWSER == 0) {
        let blake3 = require('blake3');
        this.hash = (data) => { return blake3.hash(data).toString('hex'); };
      } else {
        let blake3 = require("blake3-js");
        this.hash = (data) => { return blake3.newRegular().update(data).finalize();  }
      }

      let _self = this;

      this.wallet.initialize();
      this.mempool.initialize();
      this.miner.initialize();
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

