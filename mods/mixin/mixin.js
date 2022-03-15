const saito = require('./../../lib/saito/saito');
const MixinModule = require('./lib/mixinmodule');
const ModTemplate = require('../../lib/templates/modtemplate');
const MixinAppspace = require('./lib/email-appspace/mixin-appspace');
const SaitoOverlay = require("../../lib/saito/ui/saito-overlay/saito-overlay");
const fetch = require('node-fetch');
const forge = require('node-forge');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { sharedKey: sharedKey } = require('curve25519-js');
const LittleEndian = require('int64-buffer');

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

    this.mods			= [];

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
      }
    });

  }

  initialize(app) {

    this.load();
    this.loadCryptos();

/****
    //
    // WORKS - our private-key can query profiles @ /me
    //
    const appId = '9be2f213-ca9d-4573-80ca-3b2711bb2105';
    const sessionId = 'f072cd2a-7c81-495c-8945-d45b23ee6511';
    const privateKey = 'dN7CgCxWsqJ8wQpQSaSnrE0eGsToh7fntBuQ5QvVnguOdDbcNZwAMwsF-57MtJPtnlePrNSe7l0VibJBKD62fg';
    const method = 'GET';
    const uri = '/me';
    const token = this.signAuthenticationToken(appId, sessionId, privateKey, method, uri);
    console.log(token);

    try {
      this.request(appId, sessionId, privateKey, method, uri).then(
        (res) => {
          console.log("RETURNED DATA: " + JSON.stringify(res.data));
        }
      );
    } catch (err) {
      console.log("ERROR: Mixin error sending network request: " + err);
    }
****/


/****
    //
    // WORKS - we can create Mixin network users @ /users
    //
    const appId = '9be2f213-ca9d-4573-80ca-3b2711bb2105';
    const sessionId = 'f072cd2a-7c81-495c-8945-d45b23ee6511';
    const privateKey = 'dN7CgCxWsqJ8wQpQSaSnrE0eGsToh7fntBuQ5QvVnguOdDbcNZwAMwsF-57MtJPtnlePrNSe7l0VibJBKD62fg';

    const user_keypair = forge.pki.ed25519.generateKeyPair();
    const original_user_public_key = Buffer.from(user_keypair.publicKey).toString('base64');
    const original_user_private_key = Buffer.from(user_keypair.privateKey).toString('base64');
    const user_public_key = this.base64RawURLEncode(original_user_public_key);
    const user_private_key = this.base64RawURLEncode(original_user_private_key);

    const method = "POST";
    const uri = '/users'; 
    const body = {
      session_secret: user_public_key,
      full_name: "Saito Test User 23",
    };

    console.log("ORIG USER PUBKEY: "+original_user_public_key);
    console.log("PRIG USER PRVKEY: "+original_user_private_key);
    console.log("URI USER PUBKEY: "+user_public_key.toString('base64'));
    console.log("URI USER PRVKEY: "+user_private_key.toString('base64'));

    try {
      this.request(appId, sessionId, privateKey, method, uri, body).then(
        (res) => {
          console.log("RETURNED DATA: " + JSON.stringify(res.data));
        }
      );
    } catch (err) {
      console.log("ERROR: Mixin error sending network request: " + err);
    }
****/


/***
    //
    // FAILS - our new user cannot query their profile @ /me
    //
    const appId = '886f09f1-c36c-3ea6-9b0d-798ddcbfedfc'; //must be user_id from step 2
    const sessionId = 'bdd2e1cc-6e66-4ff6-a69b-bda661e7bd81';
    const privateKey = 'HkHtQ5KItj9lbmuTTxnfFvOvJBNH09M7EES/pd7QQGmw/1kBViHNIxZZ++Jrji6+FioVGWIWms993OZrPQ2h5A==';
    const method = 'GET';
    const uri = '/me';
    const token = this.signAuthenticationToken(appId, sessionId, privateKey, method, uri);
    console.log(token);

    try {
      this.request(appId, sessionId, privateKey, method, uri).then(
        (res) => {
          console.log("RETURNED DATA: " + JSON.stringify(res.data));
        }
      );
    } catch (err) {
      console.log("ERROR: Mixin error sending network request: " + err);
    }
***/

  }


  
  ///////////
  // MIXIN //
  ///////////
  //
  // - processWithdrawal
  // - addWithdrawalAddress
  // - checkWithdrawalFee
  // - checkBalance
  // - createAccount
  //
  processWithdrawal(asset_id, address, amount, fee) {

  
    const appId = this.mixin.user_id;
    const sessionId = this.mixin.session_id;
    const privateKey = this.mixin.privatekey;

    const method = "POST";
    const uri = '/withdrawals';

    let address_id = "";

    const body = {
      address_id	: address_id ,
      amount		: amount ,
      trace_id		: trace_id ,
      pin 		: this.base64RawURLEncode(this.mixin.pin_token_base64),
    };

    try {
      this.request(appId, sessionId, privateKey, method, uri, body).then(
        (res) => {
	  callback(res.data);
        }
      );

    } catch (err) {
      console.log("ERROR: Mixin error sending network request: " + err);
    }

  }


  addWithdrawalAddress(asset_id, withdrawal_address, callback=null) {

    const appId = this.mixin.user_id;
    const sessionId = this.mixin.session_id;
    const privateKey = this.mixin.privatekey;

    const method = "POST";
    const uri = '/addresses';
    const body = {
      asset_id		: asset_id ,
      label 		: withdrawal_address ,
      destination 	: withdrawal_address ,
      tag 		: "standard withdrawal" ,
      pin 		: this.base64RawURLEncode(this.mixin.pin_token_base64),
    };

    try {
      this.request(appId, sessionId, privateKey, method, uri, body).then(
        (res) => {
	  callback(res.data);
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
    const appId = '9be2f213-ca9d-4573-80ca-3b2711bb2105';
    const sessionId = 'f072cd2a-7c81-495c-8945-d45b23ee6511';
    const privateKey = 'dN7CgCxWsqJ8wQpQSaSnrE0eGsToh7fntBuQ5QvVnguOdDbcNZwAMwsF-57MtJPtnlePrNSe7l0VibJBKD62fg';

console.log("checking asset_id: " + asset_id);

    const method = "GET";
    const uri = `/assets/${asset_id}/fee`;

    let fee = 1000000;

    try {
      this.request(appId, sessionId, privateKey, method, uri).then(
        (res) => {
	  let d = res.data.data;

console.log("FEE LEVEL: " +JSON.stringify(res));

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
    const appId = '9be2f213-ca9d-4573-80ca-3b2711bb2105';
    const sessionId = 'f072cd2a-7c81-495c-8945-d45b23ee6511';
    const privateKey = 'dN7CgCxWsqJ8wQpQSaSnrE0eGsToh7fntBuQ5QvVnguOdDbcNZwAMwsF-57MtJPtnlePrNSe7l0VibJBKD62fg';

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

console.log("PT: " + this.mixin.pin_token);
console.log("PTB64: " + this.mixin.pin_token_base64);
console.log("PRIV: " + privatekey);
console.log("old pin: " + old_pin);
console.log("new pin: " + new_pin);

    let encrypted_old_pin = "";
    if (old_pin !== "") { 
      console.log("gen old key 1");
      this.signEd25519PIN(old_pin, this.mixin.pin_token, session_id, privatekey); 
      console.log("gen old key 2");
    }
    console.log("gen new key 1");
    let encrypted_new_pin = this.signEd25519PIN(new_pin, this.mixin.pin_token, session_id, privatekey);
    console.log("gen new key 2");

console.log("encrypted op: " + encrypted_old_pin);
console.log("encrypted np: " + encrypted_new_pin);

    const method = "POST";
    const uri = '/pin/update';
    const body = {
      old_pin: encrypted_old_pin,
      pin: encrypted_new_pin,
    };

    try {
console.log("SENDING PIN UPDATE REQUEST");
      this.request(user_id, session_id, privatekey, method, uri, body).then(
        (res) => {
          console.log("RETURNED PIN DATA: " + JSON.stringify(res.data));
	  mixin_self.mixin.pin = new_pin;
	  mixin_self.save();
console.log("SAVED MIXIN DATA WITH NEW PIN: " + new_pin);
	  if (callback != null) { callback(res.data); }
        }
      );
    } catch (err) {
      console.log("ERROR: Mixin error sending network request: " + err);
    }
  }



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
    let appId = '9be2f213-ca9d-4573-80ca-3b2711bb2105';
    let sessionId = 'f072cd2a-7c81-495c-8945-d45b23ee6511';
    let privateKey = 'dN7CgCxWsqJ8wQpQSaSnrE0eGsToh7fntBuQ5QvVnguOdDbcNZwAMwsF-57MtJPtnlePrNSe7l0VibJBKD62fg';

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

console.log("USER PUBLIC KEY: " + original_user_public_key.toString('base64'));
console.log("USER PRIVATE KEY: " + original_user_private_key.toString('base64'));
console.log("pubkey: " + user_public_key.toString('base64'));
console.log("privkey: " + user_private_key.toString('base64'));

    try {
      this.request(appId, sessionId, privateKey, method, uri, body).then(
        (res) => {

console.log("FETCHED PIN TOKEN: " + res.data.pin_token);
	  let d = res.data;

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
console.log("we want to set this pin: " + new_pin);
console.log("pin token is now: " + res.data.pin_token);
	  mixin_self.updateUserPin(new_pin, () => {
console.log("we have updated our pin to: " + new_pin);
	  });

	  if (callback != null) { callback(res.data); }
        }
      );
    } catch (err) {
      console.log("ERROR: Mixin error sending network request: " + err);
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

  setupPin(pin, user, sessionKey, callback) {
    const encryptedPIN = this.encryptPin(
      pin,
      user.pin_token,
      user.session_id,
      sessionKey
    )

    return this.updatePin(
      '',
      encryptedPIN,
      user.user_id,
      user.session_id,
      sessionKey,
      callback
    )
  }

  updatePin(oldEncryptedPin, encryptedPin, uid, sid, sessionKey, callback) {
    const data = {
      old_pin: oldEncryptedPin,
      pin: encryptedPin,
    }
    return this.client.request(uid, sid, sessionKey, 'POST', '/pin/update', data).then(
      (res) => {
        if (callback) {
          callback(res.data)
        } else {
          return res.data
        }
      }
    )
  }

  encryptPin(pin, pinToken, sessionId, privateKey, iterator=null) {
    const blockSize = 16
    let Uint64

    try {
      if (LittleEndian) Uint64 = LittleEndian.Int64LE
      if (Uint64BE) Uint64 = Uint64LE
    } catch (error) {}

    privateKey = forge.pki.privateKeyFromPem(privateKey)
    let pinKey = privateKey.decrypt(forge.util.decode64(pinToken), 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      label: sessionId,
    })

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
    let paddingLen = blockSize - (pinByte.length() % blockSize)
    let padding = forge.util.hexToBytes(paddingLen.toString(16))

    while (paddingLen > 0) {
      paddingLen--
      buffer.putBytes(padding)
    }

    let iv = forge.random.getBytesSync(16)
    let key = this.hexToBytes(forge.util.binary.hex.encode(pinKey))
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


