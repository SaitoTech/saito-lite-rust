const saito = require("./../../lib/saito/saito");
const MixinModule = require("./lib/mixinmodule");
const ModTemplate = require("../../lib/templates/modtemplate");
const fetch = require("node-fetch");
const forge = require("node-forge");
const { v4: uuidv4 } = require("uuid");
const getUuid = require("uuid-by-string");
const axios = require("axios");
const { sharedKey: sharedKey } = require("curve25519-js");
const LittleEndian = require("int64-buffer");
const JSON = require("json-bigint");
const PeerService = require("saito-js/lib/peer_service").default;
const { MixinApi, getED25519KeyPair, signEd25519PIN, base64RawURLEncode, base64RawURLDecode, getTipPinUpdateMsg } = require('@mixin.dev/mixin-node-sdk');

class Mixin extends ModTemplate {
  constructor(app) {
    super(app);

    this.name = "Mixin";
    this.slug = "Mixin";
    this.appname = "Mixin";
    this.description = "Adding support for Web3 Crypto transfers on Saito";
    this.categories = "Finance Utilities";
    this.icon = "fas fa-wallet";

    this.mixin = {};
    this.mixin.app_id = "";
    this.mixin.user_id = "";
    this.mixin.session_id = "";
    this.mixin.full_name = "";
    this.mixin.publickey = "";
    this.mixin.privatekey = "";
    this.mixin.pin_token = "";
    this.mixin.pin_token_base64 = "";
    this.mixin.pin = "";

    this.bot = null;
    this.bot_data = {};
    this.user = null;
    this.user_data = {};

    this.account_created = 0;

    this.mods = [];
    this.addresses = [];
    this.withdrawals = [];
    this.deposits = [];
  }

  returnServices() {
    let services = [];
    if (this.app.BROWSER == 0) {
      services.push(new PeerService(null, "mixin"));
    }
    return services;
  }

  async initialize(app) {
    await super.initialize(app);
    this.load();
    await this.loadCryptos();
    this.app.connection.emit('update_balance');
  }

  canRenderInto(qs) {
    return false;
  }

  renderInto(qs) {}

  respondTo(type = "") {
    return null;
  }

  async handlePeerTransaction(app, tx = null, peer, mycallback) {
    if (tx == null) {
      return 0;
    }
    let message = tx.returnMessage();

    //
    // we receive requests to create accounts here
    //
    if (message.request === "mixin create account") {
      await this.receiveCreateAccountTransaction(app, tx, peer, mycallback);
    }

    return super.handlePeerTransaction(app, tx, peer, mycallback);
  }

  async loadCryptos() {
    let mixin_self = this;

    let respondTo = this.app.modules.respondTo("mixin-crypto");

    for (const rtModule of respondTo) {
      let crypto_module = new MixinModule(this.app, rtModule.ticker, mixin_self, rtModule.asset_id);
      //
      //Use the module's returnBalance function if provided
      //
      if (rtModule.returnBalance) {
        crypto_module.returnBalance = rtModule.returnBalance;
      }

      await crypto_module.installModule(mixin_self.app);
      this.mods.push(crypto_module);
      this.app.modules.mods.push(crypto_module);
      let pc = await this.app.wallet.returnPreferredCryptoTicker();
      if (mixin_self.mixin.user_id !== "" || (pc !== "SAITO" && pc !== "")) {
        if (crypto_module.returnIsActivated()) {
          await this.fetchSafeUtxo();
        }
      }
    }
  }

  ///////////
  // MIXIN //
  ///////////
  //
  // createWithdrawalAddress(asset_id, withdrawal_address, label, tag, callback)
  // checkWithdrawalFee(asset_id, callback);
  // checkBalance(asset_id, callback);
  // createAccount(callback);
  // fetchDeposits(asset_id, callback)
  // fetchAddresses(asset_id, callback)
  // doesWithdrawalAddressExist(asset_id, address_id_or_withdrawal_address)
  // async sendInNetworkTransferRequest(asset_id, address_id, amount, unique_hash);
  // sendWithdrawalRequest(asset_id, address_id, address, amount, unique_hash, callback)
  // updateUserPin(new_pin, callback)
  //


  onPeerServiceUp(app, peer, service = {}) {
    let mixin_self = this;
    if (service.service === "mixin" && this.app.BROWSER == 0 && this.account_created == 0) {
      this.createAccount();
    }
  }

  async createAccount(callback){
    console.log('inside mixin account create ////');
    console.log('account_created');
    console.log(this.account_created);
    if (this.account_created == 0) {
      await this.sendCreateAccountTransaction(callback);
    }
  }

  async sendCreateAccountTransaction(callback = null){
    console.log("sendCreateAccountTransaction ///");
    let mixin_self = this;
    let peers = await this.app.network.getPeers();
    // we cannot create an account if the network is down
    if (peers.length == 0) {
      console.warn("No peers");
      return;
    }
   
    if (this.mixin.publickey !== "") {
      console.warn("Mixin Account already created. Skipping");
      return;
    }

    let data = {
    };
    mixin_self.app.network.sendRequestAsTransaction(
      "mixin create account",
      data,
      function (res) {
        console.log("Callback for sendCreateAccountTransaction request: ", res);
        if (typeof res == 'object') {
          mixin_self.mixin = res;
          mixin_self.account_created = 1;
          mixin_self.save();

          if (callback) {
            return callback();
          }
        }
      },
      peers[0].peerIndex
    );
  }

  async receiveCreateAccountTransaction(app, tx, peer, callback) {
    if (app.BROWSER == 0) {

      console.log("receiveCreateAccountTransaction ///");
      let mixin_self = this;
      // get mixin env
      let m = this.getEnv();
      if (!m) {
        console.error("MIXIN ENV variable missing.");
        return;
      }

      // create bare user
      let user = await this.bare_register(m);

      // update/create first tipPin
      this.user = MixinApi({
        keystore: {
          app_id: user.user_id,
          session_id: user.session_id,
          pin_token_base64: user.pin_token_base64,
          session_private_key: mixin_self.bot_data.session_private_key
        },
      });

      console.log("user keystore ///");
      console.log({
          app_id: user.user_id,
          session_id: user.session_id,
          pin_token_base64: user.pin_token_base64,
          session_private_key: mixin_self.bot_data.session_private_key
        });

      const { privateKey: spendPrivateKey, publicKey: spendPublicKey, seed: sessionSeed } = getED25519KeyPair();
      const spend_private_key = spendPrivateKey;
      const spend_public_key = spendPublicKey.toString('hex');
      const session_seed = sessionSeed.toString('hex');
    
      this.user_data.spend_private_key = spend_private_key;
      this.user_data.spend_public_key = spend_public_key;
      await this.updateTipPin('', spend_public_key, user.tip_counter + 1);
      
      // verify tipPin
      await this.verifyTipPin(this.user_data.spend_private_key);

      // create safe user
      let safe_user = await this.safe_register(user.user_id);
 
      if (callback) {
        return callback({
          user_id:  safe_user.user_id,
          full_name: safe_user.full_name,
          session_id:  safe_user.session_id,
          tip_key_base64:  safe_user.tip_key_base64,
          bot_session_private_key:  mixin_self.bot_data.session_private_key,
          bot_session_public_key:  mixin_self.bot_data.session_public_key,
          spend_private_key: spend_private_key,
          spend_public_key: spend_public_key,
          session_seed: mixin_self.bot_data.session_private_key
        });
      }
    }
  };

  async bare_register(m) {
    try {
      const keystore = {
        app_id: m.app_id,
        session_id: m.session_id,
        server_public_key: m.server_public_key,
        session_private_key: m.session_private_key,
      };

      this.bot = MixinApi({ keystore });

      const { seed: sessionSeed, publicKey: sessionPublicKey } = getED25519KeyPair();
      const session_private_key = sessionSeed.toString('hex');
      this.bot_data.session_private_key = session_private_key;
      this.bot_data.session_public_key = sessionPublicKey;

      console.log('user session_private_key', session_private_key);
      const user = await this.bot.user.createBareUser(`Saito User ${this.publicKey}`, base64RawURLEncode(sessionPublicKey));

      console.log('user //');
      console.log(user);

      return user;
    } catch(err) {
      console.error("ERROR: Mixin error create bare register: " + err);
      return false;
    }
  }

  async updateTipPin(first_pin, second_pin, counter){
    try {
      if (this.user){
        let update = await this.user.pin.updateTipPin(first_pin, second_pin, counter);
        console.log('update pin //');
        console.log(update);
        return update;
      } 
    } catch(err) {
      console.error("ERROR: Mixin error update tip pin: " + err);
      return false;
    }
  }

  async verifyTipPin(tipPin){
    try {
      let tip_verify = await this.user.pin.verifyTipPin(tipPin);
      console.log('verify pin //');
      console.log(tip_verify);
      return tip_verify;
    } catch(err) {
      console.error("ERROR: Mixin error verify tip pin: " + err);
      return false;
    }
  }

  async safe_register(user_id){  
    try {
      const account = await this.user.safe.register(
        user_id, 
        this.user_data.spend_private_key.toString('hex'), 
        this.user_data.spend_private_key
      );
      
      console.log('safe account ///');
      console.log(account);
      return account;
    } catch(err) {
      console.error("ERROR: Mixin error safe register: " + err);
      return false;
    }
  }

  async createDepositAddress(asset_id){
    try {
      let priv_key = (this.mixin.session_seed);

      let user = MixinApi({
        keystore: {
          app_id: this.mixin.user_id,
          session_id: this.mixin.session_id,
          pin_token_base64: this.mixin.tip_key_base64,
          session_private_key: priv_key
        },
      });

      let address = await user.safe.createDeposit(asset_id);

      console.log('adress //');
      console.log(address);

      if (typeof address[0].destination != 'undefined') {
        for (let i = 0; i < this.mods.length; i++) {
          if (this.mods[i].asset_id === asset_id) {
            this.mods[i].address = address[0].destination;
            this.mods[i].destination = address[0].destination;
            this.mods[i].save();
          }
        }
      }
    } catch(err) {
      console.error("ERROR: Mixin error create deposit address: " + err);
      return false;
    }
  }

  async fetchAsset(asset_id){
    try {
      let priv_key = (this.mixin.session_seed);

      let user = MixinApi({
        keystore: {
          app_id: this.mixin.user_id,
          session_id: this.mixin.session_id,
          pin_token_base64: this.mixin.tip_key_base64,
          session_private_key: priv_key
        },
      });

      let utxo = await user.safe.fetchAsset(asset_id);

      console.log("asset ///");
      console.log(asset);

      for (let i = 0; i < this.mods.length; i++) {
        if (this.mods[i].asset_id === asset_id) {
          if ((utxo.data).length > 0) {
            this.mods[i].destination = address[0].destination;
            this.mods[i].save();
          }
        }
      }
    } catch(err) {
      console.error("ERROR: Mixin error fetch safe utxo: " + err);
      return false;
    }
  }

  async fetchSafeUtxo(asset_id){
    try {
      console.log('inside fetchSafeSnapshots ///');
      let priv_key = (this.mixin.session_seed);

      let user = MixinApi({
        keystore: {
          app_id: this.mixin.user_id,
          session_id: this.mixin.session_id,
          pin_token_base64: this.mixin.tip_key_base64,
          session_private_key: priv_key
        },
      });

      let utxo = await user.utxo.safeAssetBalance({
        members: [this.mixin.user_id],
        threshold: 1,
        asset: asset_id
      });

      console.log("utxo ///");
      console.log(utxo);

      for (let i = 0; i < this.mods.length; i++) {
        if (this.mods[i].asset_id === asset_id) {  
          this.mods[i].balance = utxo;
          this.mods[i].save();
        }
      }
    } catch(err) {
      console.error("ERROR: Mixin error fetch safe utxo: " + err);
      return false;
    }
  }

  async fetchSafeSnapshots(asset_id, limit = 500, callback = null){
    try {
      let priv_key = (this.mixin.session_seed);

      let user = MixinApi({
        keystore: {
          app_id: this.mixin.user_id,
          session_id: this.mixin.session_id,
          pin_token_base64: this.mixin.tip_key_base64,
          session_private_key: priv_key
        },
      });

      let snapshots = await user.safe.fetchSafeSnapshots({
        asset: asset_id,
        limit: limit
      });

      if (callback){
        return callback(snapshots);  
      }
    } catch(err) {
      console.error("ERROR: Mixin error fetch safe snapshots: " + err);
      return false;
    }
  }


  async checkWithdrawalFee(asset_id){
    try {
      let priv_key = (this.mixin.session_seed);

      let user = MixinApi({
        keystore: {
          app_id: this.mixin.user_id,
          session_id: this.mixin.session_id,
          pin_token_base64: this.mixin.tip_key_base64,
          session_private_key: priv_key
        },
      });

      let asset = await user.network.fetchAsset(asset_id);
      if (typeof asset.fee != 'undefined') {
        return asset.fee;  
      } else {
        return 0;
      }
      
    } catch(err) {
      console.error("ERROR: Mixin error check withdrawl fee: " + err);
      return false;
    }
  }

  async createWithdrawalAddress(asset_id, withdrawal_address, tag = "", callback = null) {
    try {
      console.log("check 7");
      let priv_key = (this.mixin.session_seed);

      let user = MixinApi({
        keystore: {
          app_id: this.mixin.user_id,
          session_id: this.mixin.session_id,
          pin_token_base64: this.mixin.tip_key_base64,
          session_private_key: priv_key
        },
      });

      console.log("check 8");
      console.log({
        asset_id: asset_id,
        destination: withdrawal_address,
        tag: tag,
      });

      let address_data = await user.external.checkAddress({
        asset_id: asset_id,
        destination: withdrawal_address,
        tag: tag,
      });

      console.log("check address //");
      console.log(address_data);
    } catch(err) {
      console.error("ERROR: Mixin error check withdrawl fee: " + err);
      return false;
    }
  }

  load() {
    if (this.app?.options?.mixin) {
      this.mixin = this.app.options.mixin;
      console.log("MIXIN DEETS: " + JSON.stringify(this.app.options.mixin));
      if (this.mixin.user_id) {
        this.account_created = 1;
      }
    }
  }

  save() {
    this.app.options.mixin = this.mixin;
    this.app.storage.saveOptions();
  }

  getEnv(){
    if (typeof process.env.MIXIN != "undefined") {
      return JSON.parse(process.env.MIXIN);
    } else {
      // to develop locally please request a mixin key and add it as an
      // enviromnent variable 'MIXIN'
      return false;
    }
  }

 
}

module.exports = Mixin;

