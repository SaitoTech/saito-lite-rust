const saito = require('./../../lib/saito/saito');
const MixinModule = require('./lib/mixinmodule');
const ModTemplate = require('../../lib/templates/modtemplate');
const MixinAppspace = require('./lib/email-appspace/mixin-appspace');
const SaitoOverlay = require("../../lib/saito/ui/saito-overlay/saito-overlay");
const fetch = require('node-fetch');
const forge = require('node-forge');
const { v4: uuidv4 } = require('uuid');
const getUuid = require('uuid-by-string');
const axios = require('axios');
const { sharedKey: sharedKey } = require('curve25519-js');
const LittleEndian = require('int64-buffer');
const JSON = require("json-bigint");

class Mixin extends ModTemplate {

  constructor(app) {

    super(app);

    this.name = "Mixin";
    this.description = "Adding support for Mixin Network on Saito";
    this.categories = "Finance Utilities";

    this.mixin = {};
    this.mixin.app_id 		= "";    
    this.mixin.user_id 		= "";    
    this.mixin.session_id 	= "";    
    this.mixin.full_name	= "";
    this.mixin.publickey 	= "";
    this.mixin.privatekey 	= "";
    this.mixin.pin_token	= "";
    this.mixin.pin_token_base64 = "";
    this.mixin.pin		= "";

    this.account_created = 0;

    this.mods		= [];
    this.addresses      = [];
    this.withdrawals    = [];
    this.deposits       = [];

  }


  initialize(app) {
    this.load();
    this.loadCryptos();
  }

  
  respondTo(type = "") {

    let mixin_self = this;

    if (type == 'email-appspace') {
      let obj = {};
      obj.render = function (app, mixin_self) {
        MixinAppspace.render(app, mixin_self);
      }
      obj.attachEvents = function (app, mixin_self) {
        MixinAppspace.attachEvents(app, mixin_self);
      }
      return obj;
    }

    return null;
  }




  async handlePeerRequest(app, message, peer, mycallback = null) {

    //
    // we receive requests to create accounts here
    //
    if (message.request === "mixin create account") {

      let saito_publickey = message.data.saito_publickey;
      let mixin_publickey = message.data.mixin_publickey;

      if (app.BROWSER == 0) {

        m = JSON.parse(process.env.MIXIN);
	if (m.appId) {

          let method = "POST";
          let uri = '/users';
          let body = {
            session_secret: mixin_publickey,
            full_name: `Saito User ${saito_publickey}`,
          };

          let appId = m.appId;
          let sessionId = m.sessionId;
          let privateKey = m.privateKey;

          try {
            this.request(appId, sessionId, privateKey, method, uri, body).then(
              (res) => {
		let d = res.data;
		// send response to browser
		if (mycallback) { mycallback(d); }
              }
            );
          } catch (err) {
            console.log("ERROR: Mixin error sending network request: " + err);
          }
        }
      }
    }
  }




  loadCryptos() {

    let mixin_self = this;

    this.app.modules.respondTo("mixin-crypto").forEach(module => {
      let crypto_module = new MixinModule(this.app, module.ticker, mixin_self, module.asset_id);
      crypto_module.installModule(mixin_self.app);
      this.mods.push(crypto_module);
      this.app.modules.mods.push(crypto_module);
      let pc = this.app.wallet.returnPreferredCryptoTicker();
      if (mixin_self.mixin.user_id !== "" || (pc !== "SAITO" && pc !== "")) {
        this.checkBalance(crypto_module.asset_id, function(res) {});
        this.fetchAddresses(crypto_module.asset_id, function(res) {});
        this.fetchDeposits(crypto_module.asset_id, function(res) {});
      }
    });

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
  // sendInNetworkTransferRequest(asset_id, address_id, amount, unique_hash, callback);
  // sendWithdrawalRequest(asset_id, address_id, address, amount, unique_hash, callback)
  // updateUserPin(new_pin, callback)
  //

 
  //
  // DEPOSITS
  //
  // https://developers.mixin.one/docs/api/transfer/snapshots
  //
  fetchDeposits(asset_id, callback=null) {

    const appId = this.mixin.user_id;
    const sessionId = this.mixin.session_id;
    const privateKey = this.mixin.privatekey;

    const method = "GET";
    const uri = `/snapshots?limit=100&order=DESC&asset=${asset_id}`;


    try {
      this.request(appId, sessionId, privateKey, method, uri).then(
        (res) => {
console.log("SNAPSHOT HISTORY: ");
console.log(res.data);
          let d = res.data;
          for (let i = 0; i < d.data.length; i++) {
            /********************************************
	    "amount":     "-1688168",
	    "asset": {
	      "asset_id": "965e5c6e-434c-3fa9-b780-c50f43cd955c",
	      "chain_id": "43d61dcd-e413-450d-80b8-101d5e903357",
	      "icon_url": "https://images.mixin.one/0sQY63dDMkWTURkJVjowWY6Le4ICjAFuu3ANVyZA4uI3UdkbuOT5fjJUT82ArNYmZvVcxDXyNjxoOv0TAYbQTNKS=s128",
	      "name":     "Chui Niu Bi",
	      "symbol":   "CNB",
	      "type":     "asset"
	    },
	    "created_at": "2018-05-29T09:31:04.202186212Z",
	    "data":       "",
	    "snapshot_id":"529934b0-abfd-43ab-9431-1805773000a4",
	    "source":     "TRANSFER_INITIALIZED",
	    "type":       "snapshot",      // Options only for user (or App) who has access.
	    // 4 private fields that only be returend with correct permission
	    "user_id":    "06aed1e3-bd77-4a59-991a-5bb5ae6fbb09",
	    "trace_id":   "7c67e8e8-b142-488b-80a3-61d4d29c90bf",
	    "opponent_id":"a465ffdb-4441-4cb9-8b45-00cf79dfbc46",
	    "data":       "Transfer!"
            *********************************************/
	    let contains_transfer = 0;
	    for (let z = 0; z < this.deposits.length; z++) {
	      if (d.data[i].trace_id === this.deposits[z].trace_id) {
	        contains_transfer = 1;
	      }
            }
            if (contains_transfer === 0) {
	      this.deposits.push(d.data[i]);
	    }
          }
          if (callback) { callback(res.data); }
        }
      );
    } catch (err) {
      console.log("ERROR: Mixin error sending network request: " + err);
    }
  }


  fetchAddresses(asset_id, callback=null) {

    const appId = this.mixin.user_id;
    const sessionId = this.mixin.session_id;
    const privateKey = this.mixin.privatekey;

    const method = "GET";
    const uri = `/assets/${asset_id}/addresses`;

    try {
      this.request(appId, sessionId, privateKey, method, uri).then(
        (res) => {
console.log(res.data);
	  let d = res.data;
	  for (let i = 0; i < d.data.length; i++) {
	    	/********************************************
    		  "type":       "address",
    		  "address_id": "e1524f3c-2e4f-411f-8a06-b5e1b1601308",
    		  "asset_id":   "43d61dcd-e413-450d-80b8-101d5e903357",
    		  "destination":"0x86Fa049857E0209aa7D9e616F7eb3b3B78ECfdb0",
    		  "tag":        "",
    		  "label":      "Eth Address",
    		  "fee":        "0.016",
    		  "reserve":    "0",
    		  "dust":       "0.0001",
    		  "updated_at": "2018-07-10T03:58:17.5559296Z"
		*********************************************/
	    let contains_address = 0;
	    for (let z = 0; z < this.addresses.length; z++) {
	      if (this.addresses[z].destination === d.data[i].destination) {
		contains_address = 1;
	      }
	    }
	    if (contains_address == 0) {
	      this.addresses.push(d.data[i]);
	    }
	  }
	  if (callback) { callback(res.data); }
        }
      );
    } catch (err) {
      console.log("ERROR: Mixin error sending network request: " + err);
    }
  }

  fetchSnapshots(asset_id="", order="DESC", limit=20, callback=null) {

    let appId = this.mixin.user_id;
    let sessionId = this.mixin.session_id;
    let privateKey = this.mixin.privatekey;

    let method = "GET";
    let uri = `/snapshots?limit=${limit}&order=${order}`;
    if (asset_id !== "") { url += `&asset=${asset_id}`; }

    try {
      this.request(appId, sessionId, privateKey, method, uri).then(
        (res) => {
console.log(res.data);
	  let d = res.data;
	  for (let i = 0; i < d.data.length; i++) {
	    /*******************************************
	    "amount":     "-1688168",
	    "asset": {
	      "asset_id": "965e5c6e-434c-3fa9-b780-c50f43cd955c",
	      "chain_id": "43d61dcd-e413-450d-80b8-101d5e903357",
	      "icon_url": "https://images.mixin.one/0sQY63dDMkWTURkJVjowWY6Le4ICjAFuu3ANVyZA4uI3UdkbuOT5fjJUT82ArNYmZvVcxDXyNjxoOv0TAYbQTNKS=s128",
	      "name":     "Chui Niu Bi",
	      "symbol":   "CNB",
	      "type":     "asset"
	    },
	    "created_at": "2018-05-29T09:31:04.202186212Z",
	    "data":       "",
	    "snapshot_id":"529934b0-abfd-43ab-9431-1805773000a4",
	    "source":     "TRANSFER_INITIALIZED",
	    "type":       "snapshot",      // Options only for user (or App) who has access.
	    // 4 private fields that only be returend with correct permission
	    "user_id":    "06aed1e3-bd77-4a59-991a-5bb5ae6fbb09",
	    "trace_id":   "7c67e8e8-b142-488b-80a3-61d4d29c90bf",
	    "opponent_id":"a465ffdb-4441-4cb9-8b45-00cf79dfbc46",
	    "data":       "Transfer!"
	    *******************************************/
	  };
          if (callback) { callback(res.data); }
        }
      );
    } catch (err) {
      console.log("ERROR: Mixin error sending network request: " + err);
    }
  }

  doesWithdrawalAddressExist(asset_id, address) {
    for (let i = 0; i < this.addresses.length; i++) {
      if (this.addresses[i].asset_id === asset_id) {
        if (this.addresses[i].address_id === address) { return 1; }
        if (this.addresses[i].destination === address) { return 1; }
      }
    }
    return 0;
  }

  createWithdrawalAddress(asset_id, withdrawal_address, label="", tag="", callback=null) {

    let appId = this.mixin.user_id;
    let sessionId = this.mixin.session_id;
    let privateKey = this.mixin.privatekey;

    const method = "POST";
    const uri = '/addresses';

    const body = {
      asset_id		: asset_id ,
      label		: `Withdrawal Address` ,
      destination	: withdrawal_address ,
      tag		: tag ,
      pin 		: this.signEd25519PIN(this.mixin.pin, this.mixin.pin_token, this.mixin.session_id, this.mixin.privatekey) ,
    };

    try {
      this.request(appId, sessionId, privateKey, method, uri, body).then(
        (res) => {
	  console.log("WITHDRAWAL REQUEST ADDED: ");
	  console.log(res.data);
	    	/********************************************
    		  "type":       "address",
    		  "address_id": "e1524f3c-2e4f-411f-8a06-b5e1b1601308",
    		  "asset_id":   "43d61dcd-e413-450d-80b8-101d5e903357",
    		  "destination":"0x86Fa049857E0209aa7D9e616F7eb3b3B78ECfdb0",
    		  "tag":        "",
    		  "label":      "Eth Address",
    		  "fee":        "0.016",
    		  "reserve":    "0",
    		  "dust":       "0.0001",
    		  "updated_at": "2018-07-10T03:58:17.5559296Z"
		*********************************************/
	  let d = res.data;
	  this.addresses.push(d.data);
	  if (callback) { callback(res.data); }
	}
      );
    } catch (err) {
      console.log("ERROR: Mixin error sending network request: " + err);
    }
  }


  sendInNetworkTransferRequest(asset_id, address_id, amount, unique_hash="", callback=null) {

    let appId = this.mixin.user_id;
    let sessionId = this.mixin.session_id;
    let privateKey = this.mixin.privatekey;

    let method = "POST";
    let uri = '/transfers';
    let body = {
      asset_id		: asset_id ,
      opponent_id	: address_id ,
      amount		: amount ,
      pin 		: this.signEd25519PIN(this.mixin.pin, this.mixin.pin_token, this.mixin.session_id, this.mixin.privatekey) ,
      trace_id		: getUuid(unique_hash) ,
      memo		: "",
    };

    try {
      this.request(appId, sessionId, privateKey, method, uri, body).then(
        (res) => {
console.log("WITHDRAWAL REQUEST SUBMITTED: ");
console.log(res.data);
	  let d = res.data;
	  this.withdrawals.push(d.data);
	  if (callback) { callback(res.data); }
        }
      );

    } catch (err) {
      console.log("ERROR: Mixin error sending network request: " + err);
    }
  }

  sendWithdrawalRequest(asset_id, address_id, address, amount, unique_hash="", callback=null) {

    let appId = this.mixin.user_id;
    let sessionId = this.mixin.session_id;
    let privateKey = this.mixin.privatekey;

    const method = "POST";
    const uri = '/withdrawals';

    const body = {
      address_id	: address_id ,
      amount		: amount ,
      trace_id		: getUuid(unique_hash) ,
      pin 		: this.signEd25519PIN(this.mixin.pin, this.mixin.pin_token, this.mixin.session_id, this.mixin.privatekey) ,
    };
console.log("AAAA 3");

    try {
      this.request(appId, sessionId, privateKey, method, uri, body).then(
        (res) => {
console.log("WITHDRAWAL REQUEST SUBMITTED: ");
console.log(res.data);
	  let d = res.data;
	  this.withdrawals.push(d.data);
	  if (callback) { callback(res.data); }
        }
      );
    } catch (err) {
      console.log("ERROR: Mixin error sending network request: " + err);
    }
  }


  checkWithdrawalFee(asset_id, callback=null) {
    //
    // CHECK BALANCE
    //
    const appId = this.mixin.user_id;
    const sessionId = this.mixin.session_id;
    const privateKey = this.mixin.privatekey;

    const method = "GET";
    const uri = `/assets/${asset_id}/fee`;

    let fee = 1000000;

    try {
      this.request(appId, sessionId, privateKey, method, uri).then(
        (res) => {
	  let d = res.data.data;
	  for (let i = 0; i < this.mods.length; i++) {
	    if (this.mods[i].asset_id === asset_id) {

	      if (d.type && d.amount) {
	        if (callback) {
		  callback(d.amount);
	        }
	      }

	      return;

	    }
	  }
        }
      );
    } catch (err) {
      console.log("ERROR: Mixin error sending network request: " + err);
    }
  }


  checkBalance(asset_id, callback=null) {
    //
    // CHECK BALANCE
    //
    const appId = this.mixin.user_id;
    const sessionId = this.mixin.session_id;
    const privateKey = this.mixin.privatekey;

    const method = "GET";
    const uri = `/assets/${asset_id}`;

    try {
      this.request(appId, sessionId, privateKey, method, uri).then(
        (res) => {
	  let d = res.data.data;
console.log("RETURNED DATA: " + JSON.stringify(d));
	  for (let i = 0; i < this.mods.length; i++) {
	    if (this.mods[i].asset_id === asset_id) {
	      let initial_balance = this.mods[i].balance;
	      let initial_address = this.mods[i].destination;

	      this.mods[i].balance = d.balance;
              this.mods[i].icon_url = d.icon_url;
	      this.mods[i].deposit_entries  = d.deposit_entries;

	      this.mods[i].destination = d.destination;
	      this.mods[i].tag = d.tag;
	      this.mods[i].price_btc = d.price_btc;
	      this.mods[i].price_usd = d.price_usd;
	      this.mods[i].change_btc = d.change_btc;
	      this.mods[i].change_usd = d.change_usd;
	      this.mods[i].asset_key = d.asset_key;
	      this.mods[i].mixin_id = d.mixin_id;
	      this.mods[i].confirmations = d.confirmations;

	      if (initial_balance !== this.mods[i].balance || initial_address !== this.mods[i].destination) {
                this.app.connection.emit("update_balance", this.app.wallet);
	      }
	    }
	  }
	  if (callback) {
	    callback(res.data);
          }
        }
      );
    } catch (err) {
      console.log("ERROR: Mixin error sending network request: " + err);
    }

  }

  updateUserPin(new_pin, callback=null) {

    let mixin_self = this;

    //
    // CREATE ACCOUNT
    //
    // todo - ping us and we do this, so that we don't compromise the 
    // privatekey associated with account creation. for now we will 
    // have the module make the call directly for simplified
    // development.
    //
    let user_id = this.mixin.user_id;
    let session_id = this.mixin.session_id;
    let privatekey = this.mixin.privatekey;
    let old_pin = this.mixin.pin;

    let encrypted_old_pin = "";
    if (old_pin !== "") { 
      encrypted_old_pin = this.signEd25519PIN(old_pin, this.mixin.pin_token, session_id, privatekey); 
    }
    let encrypted_new_pin = this.signEd25519PIN(new_pin, this.mixin.pin_token, session_id, privatekey);

    const method = "POST";
    const uri = '/pin/update';
    const body = {
      old_pin: encrypted_old_pin,
      pin: encrypted_new_pin,
    };

    try {
      this.request(user_id, session_id, privatekey, method, uri, body).then(
        (res) => {
          console.log("RETURNED PIN DATA: " + JSON.stringify(res.data));
	  mixin_self.mixin.pin = new_pin;
	  mixin_self.save();
	  if (callback != null) { callback(res.data); }
        }
      );
    } catch (err) {
      console.log("ERROR: Mixin error sending network request: " + err);
    }
  }


  createAccountCallback(res, callback=null) {

    let mixin_self = this;

    let d = res;
    mixin_self.mixin.session_id = d.data.session_id;
    mixin_self.mixin.user_id = d.data.user_id;
    mixin_self.mixin.full_name = d.data.full_name;
    mixin_self.mixin.pin_token = d.data.pin_token;
    mixin_self.mixin.pin_token_base64 = d.data.pin_token_base64;

    console.log("RETURNED DATA: " + JSON.stringify(d.data));
    mixin_self.save();

    //
    // we may have activated a crypto to trigger this, in which
    // case we need to update the balance and then emit an event
    // to trigger UI re-render, including address
    //
    let pc = mixin_self.app.wallet.wallet.preferred_crypto;
    for (let i = 0; i < mixin_self.mods.length; i++) {
      if (mixin_self.mods[i].name === pc) {
        mixin_self.checkBalance(mixin_self.mods[i].asset_id, () => {
          //
          // this may already have run elsewhere, we be run
          // it again because of the potential delay here in
          // fetching the balance of the module given the need
          // for mixin account creation.
          //
          mixin_self.app.connection.emit('set_preferred_crypto');
        });
      }
    }

    //
    // and set our pin
    //
    let new_pin = (new Date()).getTime().toString().substr(-6);
    mixin_self.updateUserPin(new_pin, () => {});
    if (callback != null) { callback(res.data); }

  };




  createAccount(callback=null) {

    let mixin_self = this;

    if (this.mixin.publickey !== "") { 
      console.log("Mixin Account already created. Skipping");
      return;
    }

    this.account_created = 1;

    //
    // CREATE ACCOUNT
    //
    // todo - ping us and we do this, so that we don't compromise the 
    // privatekey associated with account creation. for now we will 
    // have the module make the call directly for simplified
    // development.
    //
    let user_keypair = forge.pki.ed25519.generateKeyPair();
    let original_user_public_key = Buffer.from(user_keypair.publicKey).toString('base64');
    let original_user_private_key = Buffer.from(user_keypair.privateKey).toString('base64');
    let user_public_key = this.base64RawURLEncode(original_user_public_key);
    let user_private_key = this.base64RawURLEncode(original_user_private_key);

    let method = "POST";
    let uri = '/users';
    let body = {
      session_secret: user_public_key,
      full_name: `Saito User ${this.app.wallet.returnPublicKey()}`,
    };

    this.mixin.publickey = original_user_public_key;
    this.mixin.privatekey = original_user_private_key;
    this.mixin.user_id          = "";
    this.mixin.session_id       = "";

    let m = "";

    //
    // process directly if ENV variable set
    //
    if (process.env.MIXIN) { 

      m = JSON.parse(process.env.MIXIN);

      let appId = m.appId;
      let sessionId = m.sessionId;
      let privateKey = m.privateKey;

      //
      // if you have an application ID, you can create your account directly
      // using that....
      //
      try {
        this.request(appId, sessionId, privateKey, method, uri, body).then(
  	  (res) => { 
	    mixin_self.createAccountCallback(res, callback);
	    //processRes(res);
	  }
        );
      } catch (err) {
        console.log("ERROR: Mixin error sending network request: " + err);
      }

    }

    //
    // users handle manually
    //
    if (!m.appId) {
   

      m = { appId : "9be2f213-ca9d-4573-80ca-3b2711bb2105", sessionId: "f072cd2a-7c81-495c-8945-d45b23ee6511", privateKey: "dN7CgCxWsqJ8wQpQSaSnrE0eGsToh7fntBuQ5QvVnguOdDbcNZwAMwsF-57MtJPtnlePrNSe7l0VibJBKD62fg"};

      let appId = m.appId;
      let sessionId = m.sessionId;
      let privateKey = m.privateKey;

      let data = {
	saito_publickey	:	mixin_self.app.wallet.returnPublicKey() ,
	mixin_publickey :	user_public_key 
      };

      mixin_self.app.network.peers[0].sendRequestWithCallback("mixin create account", data, function(res) {
console.log("IN CALLBACK IN MIXIN.JS ON CLIENT RES: " + JSON.stringify(res));
	mixin_self.createAccountCallback(res, callback);
      });

    }
  }





  /////////////////////////
  // MIXIN API FUNCTIONS //
  /////////////////////////
  //
  // Core functions needed by the request-specific functions above (and by each other)
  // such as base64 processing, network requests, and cryptographic functions. These 
  // functions should not be changed. We may put them into a separate file at some
  // point for the sake of cleanliness.
  //
  base64RawURLEncode(buffer) {
    return buffer.toString('base64').replace(/\=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

  privateKeyToCurve25519(privateKey) {
    const seed = privateKey.subarray(0, 32);
    const md = forge.md.sha512.create();
    md.update(seed.toString('binary'));
    const digestx = md.digest();
    const digest = Buffer.from(digestx.getBytes(), 'binary');
    digest[0] &= 248;
    digest[31] &= 127;
    digest[31] |= 64;
    return digest.subarray(0, 32);
  }

  requestByTokenNoData(method, path, accessToken) {
    return axios({
      method,
      url: 'https://mixin-api.zeromesh.net' + path,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken,
      },
    })
  }

  requestByToken(method, path, data, accessToken) {
    return axios({
      method,
      url: 'https://mixin-api.zeromesh.net' + path,
      data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken,
      },
    })
  }

  request(uid, sid, privateKey, method, path, data=null) {
    const m = method;
    let accessToken = '';
    if (data == null) {
      accessToken = this.signAuthenticationToken(
        uid,
        sid,
        privateKey,
        method,
        path
      );
      return this.requestByTokenNoData(method, path, accessToken);
    } else {
      accessToken = this.signAuthenticationToken(
        uid,
        sid,
        privateKey,
        method,
        path,
        JSON.stringify(data)
      );
      return this.requestByToken(method, path, data, accessToken);
    }
  }

  signAuthenticationToken(uid, sid, privateKey, method, uri, params, scp) {
    privateKey = Buffer.from(privateKey, 'base64')
    method = method.toLocaleUpperCase()
    if (typeof params === 'object') {
      params = JSON.stringify(params)
    } else if (typeof params !== 'string') {
      params = ''
    }

    let iat = Math.floor(Date.now() / 1000)
    let exp = iat + 3600
    let md = forge.md.sha256.create()
    md.update(method + uri + params, 'utf8')
    let payload = {
      uid: uid,
      sid: sid,
      iat: iat,
      exp: exp,
      jti: uuidv4(),
      sig: md.digest().toHex(),
      scp: scp || 'FULL',
    }

    let header_st = this.base64RawURLEncode(Buffer.from(JSON.stringify({ alg: "EdDSA", typ: "JWT" }), 'utf8'));
    let payload_st = this.base64RawURLEncode(Buffer.from(JSON.stringify(payload), 'utf8'));

    let result_st = header_st.toString() + "." + payload_st.toString();
    let sign = forge.pki.ed25519.sign({
      message: result_st,
      encoding: 'utf8',
      privateKey
    });
    result_st += ".";
    result_st += this.base64RawURLEncode(Buffer.from(sign).toString('base64'));
    return result_st;
  }


  hexToBytes(hex) {
    const bytes = []
    for (let c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.substr(c, 2), 16))
    }
    return bytes
  }

  sharedEd25519Key(pinToken, privateKey) {
    pinToken = Buffer.from(pinToken, 'base64')
    privateKey = Buffer.from(privateKey, 'base64')
    privateKey = this.privateKeyToCurve25519(privateKey)
    return sharedKey(privateKey, pinToken);
  }

  signEd25519PIN(pin, pinToken, sessionId, privateKey, iterator=null) {
    const blockSize = 16
    let Uint64

    try {
      if (LittleEndian) Uint64 = LittleEndian.Int64LE
      if (Uint64BE) Uint64 = Uint64LE
    } catch (error) {}

    const sharedKey = this.sharedEd25519Key(pinToken, privateKey)

    let _iterator = new Uint8Array(new Uint64(Math.floor((new Date()).getTime() / 1000)).buffer)
    _iterator = forge.util.createBuffer(_iterator)
    iterator = iterator || _iterator
    iterator = iterator.getBytes()
    let time = new Uint8Array(new Uint64(Math.floor((new Date()).getTime() / 1000)).buffer)
    time = forge.util.createBuffer(time)
    time = time.getBytes()

    let pinByte = forge.util.createBuffer(pin, 'utf8')

    let buffer = forge.util.createBuffer()
    buffer.putBytes(pinByte)
    buffer.putBytes(time)
    buffer.putBytes(iterator)
    let paddingLen = blockSize - (buffer.length() % blockSize)
    let padding = forge.util.hexToBytes(paddingLen.toString(16))

    for (let i=0; i < paddingLen; i++) {
      buffer.putBytes(padding)
    }
    let iv = forge.random.getBytesSync(16)
    let key = this.hexToBytes(forge.util.binary.hex.encode(sharedKey))
    let cipher = forge.cipher.createCipher('AES-CBC', key)

    cipher.start({
      iv: iv,
    })
    cipher.update(buffer)
    cipher.finish(() => true)

    let pin_buff = forge.util.createBuffer()
    pin_buff.putBytes(iv)
    pin_buff.putBytes(cipher.output.getBytes())

    const encryptedBytes = pin_buff.getBytes()
    return forge.util.encode64(encryptedBytes)
  }





  load() {
    if (this.app?.options?.mixin) { this.mixin = this.app.options.mixin; }
    if (this.mixin.publickey !== "") {
      this.account_created = 1;
    }
  }

  save() {
    this.app.options.mixin = this.mixin;
    this.app.storage.saveOptions();
  }

}

module.exports = Mixin;

