const saito = require("./../../lib/saito/saito");
const MixinModule = require("./lib/mixinmodule");
const ModTemplate = require("../../lib/templates/modtemplate");
const fetch = require("node-fetch");
const axios = require("axios");
const JSON = require("json-bigint");
const PeerService = require("saito-js/lib/peer_service").default;
const { MixinApi, getED25519KeyPair, signEd25519PIN, base64RawURLEncode, 
        base64RawURLDecode, getTipPinUpdateMsg, MixinCashier,
        buildSafeTransactionRecipient,getUnspentOutputsForRecipients,
        buildSafeTransaction, encodeSafeTransaction, signSafeTransaction,
        blake3Hash
      } = require('@mixin.dev/mixin-node-sdk');
const { v4 } = require('uuid');


class Mixin extends ModTemplate {
  constructor(app) {
    super(app);

    this.name = "Mixin";
    this.slug = "mixin";
    this.appname = "Mixin";
    this.description = "Adding support for Web3 Crypto transfers on Saito";
    this.categories = "Finance Utilities";
    this.icon = "fas fa-wallet";
    this.class = 'utility';

    //
    // All the stuff we save in our wallet
    //
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

    // No clue why we need these 
    // ( createAccount / bare_register)
    this.bot = null;
    this.bot_data = {};
    // ((safe_register, verifyTipPin, updateTipPin))
    this.user = null;
    this.user_data = {};

    this.account_created = 0;

    this.crypto_mods = [];
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
    await this.load();
    await this.loadCryptos();
  }

  canRenderInto(qs) {
    return false;
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

    //
    // Save user info when we create a deposit address (for a particular ticker)
    //
    if (message.request === "mixin save user") {
      await this.receiveSaveUserTransaction(app, tx, peer, mycallback);
    }

    //
    // sendPayment, returnWithdrawalFeeForAddress
    //
    if (message.request === "mixin fetch user") {
      await this.receiveFetchUserTransaction(app, tx, peer, mycallback);
    }

    //
    // getMixinAddress
    //
    if (message.request === "mixin fetch user by publickey") {
      await this.receiveFetchUserByPublickeyTransaction(app, tx, peer, mycallback);
    }

    //
    // returnHistory
    //
    if (message.request === "mixin fetch address by user id") {
      await this.receiveFetchAddressByUserIdTransaction(app, tx, peer, mycallback);
    }

    return super.handlePeerTransaction(app, tx, peer, mycallback);
  }

  async loadCryptos() {
    let mixin_self = this;
    let rtModules = this.app.modules.respondTo("mixin-crypto");

    /*
      We define basic modules to determine which cryptos to add to the MixinWallet
    */
    for (let i=0; i<rtModules.length; i++) {

      // 
      // Create a crypto module for the currency
      //
      let crypto_module = new MixinModule(this.app, rtModules[i].ticker, mixin_self, rtModules[i].asset_id);
      
      //
      // Use the module's returnBalance function if provided
      //
      if (rtModules[i].returnBalance) {
        crypto_module.returnBalance = rtModules[i].returnBalance;
      }

      await crypto_module.installModule(mixin_self.app);
      this.crypto_mods.push(crypto_module);
      this.app.modules.mods.push(crypto_module);
      
      // Do an initial balance check if we are able to
      if (mixin_self.account_created) {
        if (crypto_module.isActivated()) {
          await this.fetchSafeUtxoBalance();
        }
      }
    }
  }


  async onPeerServiceUp(app, peer, service = {}) {
    if (!peer.hasService('mixin')) {
      return;
    }

    if (service.service === "mixin" && !this.account_created) {
      
      // We should never execute this code...
      // but just in case
      let c = this.app.wallet.returnPreferredCrypto();
      if (c?.chain_id) {
        console.log("user has 3rd party crypto but no mixin account");
        this.createAccount();
      }
    }

  }


  async createAccount(callback = null){
    if (this.account_created == 0) {
      await this.sendCreateAccountTransaction(callback);
    }
  }

  async sendCreateAccountTransaction(callback = null){
    let mixin_self = this;
    let peers = await this.app.network.getPeers();
    // we cannot create an account if the network is down
    if (peers.length == 0) {
      console.warn("No peers");
      return;
    }
  
    let data = {
    };
    mixin_self.app.network.sendRequestAsTransaction(
      "mixin create account",
      data,
      function (res) {
        console.log("Callback for sendCreateAccountTransaction request: ", res);
        if (typeof res == 'object' && Object.keys(res).length > 0) {
          mixin_self.mixin = res;
          mixin_self.account_created = 1;
          mixin_self.save();
        }

        if (callback) {
          return callback(res);
        }
      },
      peers[0].peerIndex
    );
  }

  async receiveCreateAccountTransaction(app, tx, peer, callback) {
    if (app.BROWSER == 0) {

      let mixin_self = this;
      // get mixin env
      let m = this.getEnv();
      if (!m) {
        if (callback){
          return callback({err: "MIXIN ENV variable missing."}); 
        }

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

      const { privateKey: spendPrivateKey, publicKey: spendPublicKey, seed: sessionSeed } = getED25519KeyPair();
      
      const spend_private_key = sessionSeed;
      const spend_public_key = spendPublicKey.toString('hex');
      const session_seed = sessionSeed.toString('hex');
    
      this.user_data.spend_private_key = spend_private_key;
      this.user_data.spend_public_key = spend_public_key;
      await this.updateTipPin('', spend_public_key, user.tip_counter + 1);
      
      // verify tipPin
      await this.verifyTipPin(this.user_data.spend_private_key);

      // create safe user
      let safe_user = await this.safe_register(user.user_id);

      if (safe_user == false) {
        return callback({});
      }

      if (callback) {
        return callback({
          user_id:  safe_user.user_id,
          full_name: safe_user.full_name,
          session_id:  safe_user.session_id,
          tip_key_base64:  safe_user.tip_key_base64,
          spend_private_key: spendPrivateKey.toString('hex'),
          spend_public_key: spendPublicKey.toString('hex'),
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
      console.error("ERROR: Mixin error safe register: " + err.stack);
      return false;
    }
  }

  async createDepositAddress(asset_id){
    let mixin_self = this;
    try {
      let user = MixinApi({
        keystore: {
          app_id: this.mixin.user_id,
          session_id: this.mixin.session_id,
          pin_token_base64: this.mixin.tip_key_base64,
          session_private_key: this.mixin.session_seed
        },
      });

      let address = await user.safe.createDeposit(asset_id);

      console.log('adress //');
      console.log(address);

      if (typeof address[0].destination != 'undefined') {
        for (let i = 0; i < this.crypto_mods.length; i++) {
          if (this.crypto_mods[i].asset_id === asset_id) {
            this.crypto_mods[i].address = address[0].destination;
            //this.crypto_mods[i].destination = address[0].destination;
            this.crypto_mods[i].save();

            await this.sendSaveUserTransaction({
              user_id: this.mixin.user_id,
              asset_id: asset_id,
              address: address[0].destination,
              publickey: mixin_self.publicKey
            });
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
      let user = MixinApi({
        keystore: {
          app_id: this.mixin.user_id,
          session_id: this.mixin.session_id,
          pin_token_base64: this.mixin.tip_key_base64,
          session_private_key: this.mixin.session_seed
        },
      });

      let utxo = await user.safe.fetchAsset(asset_id);

      console.log("asset ///");
      console.log(asset);

      for (let i = 0; i < this.crypto_mods.length; i++) {
        if (this.crypto_mods[i].asset_id === asset_id) {
          if ((utxo.data).length > 0) {
            this.crypto_mods[i].address = address[0].destination;
	    //  removing save here for debugging purposes -- June 21, '24
            this.crypto_mods[i].save();
          }
        }
      }
    } catch(err) {
      console.error("ERROR: Mixin error fetch safe utxo: " + err);
      return false;
    }
  }

  async fetchSafeUtxoBalance(asset_id){
    try {
      let user = MixinApi({
        keystore: {
          app_id: this.mixin.user_id,
          session_id: this.mixin.session_id,
          pin_token_base64: this.mixin.tip_key_base64,
          session_private_key: this.mixin.session_seed
        },
      });

      let utxo = await user.utxo.safeAssetBalance({
        members: [this.mixin.user_id],
        threshold: 1,
        asset: asset_id
      });

      // console.log("utxo ///");
      // console.log(utxo);

      for (let i = 0; i < this.crypto_mods.length; i++) {
        if (this.crypto_mods[i].asset_id === asset_id) {  
          this.crypto_mods[i].balance = utxo;
	  //  removing save here for debugging purposes -- June 21, '24
          //this.crypto_mods[i].save();
        }
      }
    } catch(err) {
      console.error("ERROR: Mixin error fetch safe utxo: " + err);
      return false;
    }
  }

  async fetchSafeSnapshots(asset_id, limit = 500, callback = null){
    try {
      let user = MixinApi({
        keystore: {
          app_id: this.mixin.user_id,
          session_id: this.mixin.session_id,
          pin_token_base64: this.mixin.tip_key_base64,
          session_private_key: this.mixin.session_seed
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

  async fetchUtxo(state = 'unspent', limit = 100000, order = 'DESC', callback = null){
    try {
      let user = MixinApi({
        keystore: {
          app_id: this.mixin.user_id,
          session_id: this.mixin.session_id,
          pin_token_base64: this.mixin.tip_key_base64,
          session_private_key: this.mixin.session_seed
        },
      });

      let params = {
        limit: limit,
        state: state,
        order: order,
      };

      let utxo_list = await user.utxo.safeOutputs(params);
      console.log(`utxo_list ${state}:///`, utxo_list);

      if (callback){
        return callback(utxo_list);  
      }
    } catch(err) {
      console.error("ERROR: Mixin error return utxo: " + err);
      return false;
    }
  }


  async returnNetworkInfo(asset_id){
    try {
      let user = MixinApi({
        keystore: {
          app_id: this.mixin.user_id,
          session_id: this.mixin.session_id,
          pin_token_base64: this.mixin.tip_key_base64,
          session_private_key: this.mixin.session_seed
        },
      });

      let asset = await user.network.fetchAsset(asset_id);
      return asset;
    } catch(err) {
      console.error("ERROR: Mixin error check network fee: " + err);
      return false;
    }
  }

  async returnWithdrawalFee(asset_id, recipient){
    try {
      let user = MixinApi({
        keystore: {
          app_id: this.mixin.user_id,
          session_id: this.mixin.session_id,
          pin_token_base64: this.mixin.tip_key_base64,
          session_private_key: this.mixin.session_seed
        },
      });

      const asset = await user.safe.fetchAsset(asset_id);
      const chain = asset.chain_id === asset.asset_id ? asset : await user.safe.fetchAsset(asset.chain_id);
      const fees = await user.safe.fetchFee(asset.asset_id, recipient);
      const assetFee = fees.find(f => f.asset_id === asset.asset_id);
      const chainFee = fees.find(f => f.asset_id === chain.asset_id);
      const fee = assetFee ?? chainFee;
      
      return fee.amount;
    } catch(err) {
      console.error("ERROR: Mixin error check withdrawl fee: " + err);
      return false;
    }
  }


  async sendInNetworkTransferRequest(asset_id, destination, amount, unique_hash = "") {
    try {
      let spend_private_key = this.mixin.spend_private_key;
      let client = MixinApi({
        keystore: {
          app_id: this.mixin.user_id,
          session_id: this.mixin.session_id,
          pin_token_base64: this.mixin.tip_key_base64,
          session_private_key: this.mixin.session_seed
        },
      });

      // destination
      const members = [destination];
      const threshold = 1;
      const recipients = [buildSafeTransactionRecipient(members, threshold, amount)];

      // get unspent utxos
      const outputs = await client.utxo.safeOutputs({
        members: [this.mixin.user_id],
        threshold: 1,
        asset: asset_id,
        state: 'unspent',
      });
      console.log('outputs: ',outputs);
      const balance = await client.utxo.safeAssetBalance({
        members: [this.mixin.user_id],
        threshold: 1,
        asset: asset_id,
        state: 'unspent',
      });
      console.log('balance: ',balance);

      // Get utxo inputs and change fot tx
      const { utxos, change } = getUnspentOutputsForRecipients(outputs, recipients);
      if (!change.isZero() && !change.isNegative()) {
        recipients.push(buildSafeTransactionRecipient(outputs[0].receivers, outputs[0].receivers_threshold, change.toString()));
      }
      // get ghost key to send tx to uuid multisigs
      // For Mixin Kernel Address start with 'XIN', get ghost key with getMainnetAddressGhostKey
      const ghosts = await client.utxo.ghostKey(
        recipients.map((r, i) => ({
          hint: v4(),
          receivers: r.members,
          index: i,
        })),
      );
      console.log('ghosts: ',ghosts);

      // build safe transaction raw
      const tx = buildSafeTransaction(utxos, recipients, ghosts, 'test-memo');
      console.log('tx: ', tx);
      const raw = encodeSafeTransaction(tx);
      console.log('raw: ', raw);

      // verify safe transaction
      const request_id = v4();
      const verifiedTx = await client.utxo.verifyTransaction([
        {
          raw,
          request_id,
        },
      ]);
      console.log('verifiedTx: ', verifiedTx);

      // sign safe transaction with the private key registerd to safe
      const signedRaw = signSafeTransaction(tx, verifiedTx[0].views, spend_private_key);
      console.log('signedRaw:', signedRaw);
      const sendedTx = await client.utxo.sendTransactions([
        {
          raw: signedRaw,
          request_id: request_id,
        },
      ]);

      console.log('sendedTx: ',sendedTx);
      return {status: 200, message: sendedTx};
    
    } catch(err) {
      return {status: 400, message: err};
    }
  }


  async sendExternalNetworkTransferRequest(asset_id, destination, amount, unique_hash = ""){
    try {
      let spend_private_key = this.mixin.spend_private_key;
      let user = MixinApi({
        keystore: {
          app_id: this.mixin.user_id,
          session_id: this.mixin.session_id,
          pin_token_base64: this.mixin.tip_key_base64,
          session_private_key: this.mixin.session_seed
        },
      });

      const asset = await user.safe.fetchAsset(asset_id);
      const chain = asset.chain_id === asset.asset_id ? asset : await user.safe.fetchAsset(asset.chain_id);
      const fees = await user.safe.fetchFee(asset.asset_id, destination);
      const assetFee = fees.find(f => f.asset_id === asset.asset_id);
      const chainFee = fees.find(f => f.asset_id === chain.asset_id);
      const fee = assetFee ?? chainFee;
      console.log('fee', fee);

    // withdrawal with chain asset as fee
      if (fee.asset_id !== asset.asset_id) {
        const outputs = await user.utxo.safeOutputs({
          asset: asset_id,
          state: 'unspent',
        });
        const feeOutputs = await user.utxo.safeOutputs({
          asset: fee.asset_id,
          state: 'unspent',
        });
        console.log('outputs: ', outputs, 'feeOutputs: ',feeOutputs);

        let recipients = [
          // withdrawal output, must be put first
          {
            amount: amount,
            destination: destination,
          },
        ];
        const { utxos, change } = getUnspentOutputsForRecipients(outputs, recipients);
        if (!change.isZero() && !change.isNegative()) {
          // add change output if needed
          recipients.push(buildSafeTransactionRecipient(outputs[0].receivers, outputs[0].receivers_threshold, change.toString()));
        }
        // the index of ghost keys must be the same with the index of outputs
        // but withdrawal output doesnt need ghost key, so index + 1
        const ghosts = await user.utxo.ghostKey(
          recipients
            .filter(r => 'members' in r)
            .map((r, i) => ({
              hint: v4(),
              receivers: r.members,
              index: i + 1,
            })),
        );
        // spare the 0 inedx for withdrawal output, withdrawal output doesnt need ghost key
        const tx = buildSafeTransaction(utxos, recipients, [undefined, ...ghosts], 'withdrawal-memo');
        console.log('tx: ',tx);
        const raw = encodeSafeTransaction(tx);
        const ref = blake3Hash(Buffer.from(raw, 'hex')).toString('hex');

        const feeRecipients = [
          // fee output
          buildSafeTransactionRecipient([MixinCashier], 1, fee.amount),
        ];
        const { utxos: feeUtxos, change: feeChange } = getUnspentOutputsForRecipients(feeOutputs, feeRecipients);
        if (!feeChange.isZero() && !feeChange.isNegative()) {
          // add fee change output if needed
          feeRecipients.push(buildSafeTransactionRecipient(feeOutputs[0].receivers, feeOutputs[0].receivers_threshold, feeChange.toString()));
        }
        const feeGhosts = await user.utxo.ghostKey(
          feeRecipients.map((r, i) => ({
            hint: v4(),
            receivers: r.members,
            index: i,
          })),
        );
        const feeTx = buildSafeTransaction(feeUtxos, feeRecipients, feeGhosts, 'withdrawal-fee-memo', [ref]);
        console.log('feeTx: ',feeTx);
        const feeRaw = encodeSafeTransaction(feeTx);
        console.log('feeRaw: ',feeRaw);

        const txId = v4();
        const feeId = v4();
        //console.log(txId, feeId);
        let txs = await user.utxo.verifyTransaction([
          {
            raw,
            request_id: txId,
          },
          {
            raw: feeRaw,
            request_id: feeId,
          },
        ]);

        const signedRaw = signSafeTransaction(tx, txs[0].views, spend_private_key);
        const signedFeeRaw = signSafeTransaction(feeTx, txs[1].views, spend_private_key);
        const res = await user.utxo.sendTransactions([
          {
            raw: signedRaw,
            request_id: txId,
          },
          {
            raw: signedFeeRaw,
            request_id: feeId,
          },
        ]);


        console.log('res: ', res);
        return {status: 200, message: res};
      } else {
        // withdrawal with asset as fee
        const outputs = await user.utxo.safeOutputs({
          asset: asset_id,
          state: 'unspent',
        });
        console.log('outputs: ', outputs);

        let recipients = [
          // withdrawal output, must be put first
          {
            amount: amount,
            destination: destination,
          },
          // fee output
          buildSafeTransactionRecipient([MixinCashier], 1, fee.amount),
        ];
        const { utxos, change } = getUnspentOutputsForRecipients(outputs, recipients);
        if (!change.isZero() && !change.isNegative()) {
          // add change output if needed
          recipients.push(buildSafeTransactionRecipient(outputs[0].receivers, outputs[0].receivers_threshold, change.toString()));
        }
        // the index of ghost keys must be the same with the index of outputs
        // but withdrawal output doesnt need ghost key, so index + 1
        const ghosts = await user.utxo.ghostKey(
          recipients
            .filter(r => 'members' in r)
            .map((r, i) => ({
              hint: v4(),
              receivers: r.members,
              index: i + 1,
            })),
        );
        // spare the 0 inedx for withdrawal output, withdrawal output doesnt need ghost key
        const tx = buildSafeTransaction(utxos, recipients, [undefined, ...ghosts], 'withdrawal-memo');
        console.log('tx: ', tx);
        const raw = encodeSafeTransaction(tx);

        const request_id = v4();
        console.log(request_id);
        let txs = await user.utxo.verifyTransaction([
          {
            raw,
            request_id,
          },
        ]);

        const signedRaw = signSafeTransaction(tx, txs[0].views, spend_private_key);
        const res = await user.utxo.sendTransactions([
          {
            raw: signedRaw,
            request_id,
          },
        ]);
        console.log('res: ',res);
        return {status: 200, message: res};
      }
    } catch(err) {
      return {status: 400, message: err};
    }
    
  }


  async sendSaveUserTransaction(params = {}) {
    let peers = await this.app.network.getPeers();
    if (peers.length == 0) {
      console.warn("No peers");
      return;
    }

    await this.app.network.sendRequestAsTransaction(
      "mixin save user",
      params,
      function (res) {
        console.log("Callback for sendSaveUserTransaction request: ", res);
      },
      peers[0].peerIndex
    );
  }

  async receiveSaveUserTransaction(app, tx, peer, callback){
    let message = tx.returnMessage();

    let user_id = message.data.user_id;
    let address = message.data.address;
    let publickey = message.data.publickey;
    let asset_id = message.data.asset_id;
    let created_at = tx.timestamp;
    let updated_at = tx.timestamp;

    let sql = `INSERT INTO mixin_users (user_id,
                                   address,
                                   publickey,
                                   asset_id,
                                   created_at,
                                   updated_at)
               VALUES ($user_id,
                       $address,
                       $publickey,
                       $asset_id,
                       $created_at,
                       $updated_at
                       )`;

    let params = {
      $user_id: user_id,
      $address: address,
      $publickey: publickey,
      $asset_id: asset_id,
      $created_at: created_at,
      $updated_at: updated_at
    };

    let result = await this.app.storage.runDatabase(sql, params, "Mixin");
    console.log(result);
  }


  async sendFetchUserTransaction(params = {}, callback){
    let peers = await this.app.network.getPeers();
    if (peers.length == 0) {
      console.warn("No peers");
      return;
    }

    let data = params;
    return this.app.network.sendRequestAsTransaction(
      "mixin fetch user",
      data,
      function (res) {
        console.log("Callback for sendFetchUserTransaction request: ", res);
        return callback(res);
      },
      peers[0].peerIndex
    );
  }

  async receiveFetchUserTransaction(app, tx, peer, callback = null){
    let message = tx.returnMessage();
    let address = message.data.address;
    let sql = `SELECT * FROM mixin_users 
               WHERE address = $address;`;
    let params = {
      $address: address,
    };

    let result = await this.app.storage.queryDatabase(sql, params, "Mixin");  
    if (result.length > 0) {
      return callback(result[0]);
    }

    return callback(false);
  }


  // Get MixinAddress -> returnAddressFromPublicKey
  async sendFetchUserByPublicKeyTransaction(params = {}, callback){
    let peers = await this.app.network.getPeers();
    if (peers.length == 0) {
      console.warn("No peers");
      return;
    }

    console.log('params: ', params);

    return await this.app.network.sendRequestAsTransaction(
      "mixin fetch user by publickey",
      params,
      callback,
      peers[0].peerIndex
    );
  }

  async receiveFetchUserByPublickeyTransaction(app, tx, peer, callback = null){
    let message = tx.returnMessage();
    let publicKey = message.data.publicKey;
    let asset_id = message.data.asset_id;
    let sql = `SELECT * FROM mixin_users 
               WHERE publickey = $publicKey AND asset_id = $asset_id ORDER BY created_at DESC;`;
    let params = {
      $publicKey: publicKey,
      $asset_id: asset_id
    };
    let result = await this.app.storage.queryDatabase(sql, params, "Mixin");
    if (result.length > 0) {
      return callback(result);
    }

    return callback(false);
  }

  //Return History
  async sendFetchAddressByUserIdTransaction(params = {}, callback){
    let peers = await this.app.network.getPeers();
    if (peers.length == 0) {
      console.warn("No peers");
      return;
    }

    let data = params;
    await this.app.network.sendRequestAsTransaction(
      "mixin fetch address by user id",
      data,
      function (res) {
        return callback(res);
      },
      peers[0].peerIndex
    );
  }

  async receiveFetchAddressByUserIdTransaction(app, tx, peer, callback = null){
    console.log('tx:', tx);
    let message = tx.returnMessage();
    let user_id = message.data.user_id;
    let asset_id = message.data.asset_id;
    let sql = `SELECT * FROM mixin_users 
               WHERE user_id = $user_id AND asset_id = $asset_id ORDER BY created_at DESC;`;
    let params = {
      $user_id: user_id,
      $asset_id: asset_id
    };
    let result = await this.app.storage.queryDatabase(sql, params, "Mixin");
    console.log('result:', result);
    if (result.length > 0) {
      return callback(result);
    }

    return callback(false);
  }


  async fetchPendingDeposits(asset_id, destination, callback){
    try {
      let user = MixinApi({
        keystore: {
          app_id: this.mixin.user_id,
          session_id: this.mixin.session_id,
          pin_token_base64: this.mixin.tip_key_base64,
          session_private_key: this.mixin.session_seed
        },
      });

      if (!destination) {
        return callback([]);
      }

      let params = {
        'asset': asset_id,
        'destination': destination
      };

      let deposits = await user.safe.pendingDeposits(params);
      return callback(deposits);
    } catch(err) {
      console.error("ERROR: Mixin error fetch fetchPendingDeposits: " + err);
      return false;
    }
  }


  async load() {
    if (this.app?.options?.mixin) {
      this.mixin = this.app.options.mixin;
      console.log("MIXIN OPTIONS: " + JSON.stringify(this.app.options.mixin));
      if (this.mixin.user_id) {
        this.account_created = 1;

        //check if legacy user        
        if (typeof this.mixin.pin_token_base64 != 'undefined') {
          await this.saveLegacy();
          this.account_created = 0;
          this.mixin = {};
          this.save();

          await this.app.wallet.setPreferredCrypto('SAITO', 1);
        }
      }
    }
  }

  save() {
    this.app.options.mixin = this.mixin;
    this.app.storage.saveOptions();
  }

  async saveLegacy() {
    this.app.options.mixin_legacy = this.mixin;
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
