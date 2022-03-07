const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const MixinAppspace = require('./lib/email-appspace/mixin-appspace');
const SaitoOverlay = require("../../lib/saito/ui/saito-overlay/saito-overlay");
const fetch = require('node-fetch');
const forge = require('node-forge');
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

class Mixin extends ModTemplate {

  constructor(app) {

    super(app);

    this.name = "Mixin";
    this.description = "Send and Receive Third-Party Cryptocurrency Tokens Fee-Free on Saito";
    this.categories = "Finance Utilities";
    
  }
  
  respondTo(type = "") {

    if (type == 'email-appspace') {
      let obj = {};
      obj.render = function (app, data) {
        MixinAppspace.render(app, data);
      }
      obj.attachEvents = function (app, data) {
        MixinAppspace.attachEvents(app, data);
      }
      return obj;
    }

    return null;
  }


  initialize(app) {

/*****
    const appId = '9be2f213-ca9d-4573-80ca-3b2711bb2105';
    const sessionId = 'f072cd2a-7c81-495c-8945-d45b23ee6511';
    const method = 'GET';
    const uri = '/me';
    const token = this.signAuthenticationToken(appId, sessionId, privateKey, method, uri);
    console.log(token);

    try {
      this.request(appId, sessionId, privateKey, method, uri).then(
        (res) => {
          const user = res.data
console.log("RETURNED DATA: " + JSON.stringify(user));
          const userData = {
            user,
            sessionKey,
          }
        }
      );
    } catch (err) {
console.log("ERROR: Mixin error sending network request: " + err);
    }

***/

  const appId = '9be2f213-ca9d-4573-80ca-3b2711bb2105';
  const sessionId = '2237774c-4f90-4dbc-b189-42eb5917e0f7';
  const method = 'GET';
  const uri = '/me';
  const token = this.signAuthenticationToken(appId, sessionId, privateKey, method, uri);
  console.log(token);

    try {
      this.request(appId, sessionId, privateKey, method, uri).then(
        (res) => {
          const user = res.data
console.log("RETURNED DATA: " + JSON.stringify(user));
        }
      );
    } catch (err) {
console.log("ERROR: Mixin error sending network request: " + err);
    }


/****

    const appId = '9be2f213-ca9d-4573-80ca-3b2711bb2105';
    const sessionId = 'f072cd2a-7c81-495c-8945-d45b23ee6511';

    const user_keypair = forge.pki.ed25519.generateKeyPair();
    const user_public_key = user_keypair.publicKey.toString('base64');
    const user_private_key = user_keypair.privateKey.toString('base64');

    const method = "POST";
    const uri = '/users'; 
    const body = {
      session_secret: user_public_key,
      full_name: "Saito Test User 14",
    };

console.log("USER PUBKEY: "+user_public_key.toString('base64'));
console.log("USER PRVKEY: "+user_private_key.toString('base64'));

    try {
      this.request(appId, sessionId, privateKey, method, uri, body).then(
        (res) => {
          const user = res.data
console.log("RETURNED DATA: " + JSON.stringify(user));
        }
      );
    } catch (err) {
console.log("ERROR: Mixin error sending network request: " + err);
    }

***/

  }



  base64RawURLEncode(buffer) {
    return buffer.toString('base64').replace(/\=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
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
      )
      return this.requestByTokenNoData(method, path, accessToken);
    } else {
      accessToken = this.signAuthenticationToken(
        uid,
        sid,
        privateKey,
        method,
        path,
        JSON.stringify(data)
      )
      return this.requestByToken(method, path, data, accessToken);
    }

/***
    fetch(`${target_url}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      method: "POST",
      body: `{'full_name': '${data.full_name}','session_secret': '${data.session_secret}'}`;
    }).then(response => {
      response.json().then(data => {

console.log("DATA IS: " + JSON.stringify(data));

      });
    });
***/

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

    let header = this.base64RawURLEncode(Buffer.from(JSON.stringify({ alg: "EdDSA", typ: "JWT" }), 'utf8'));
    payload = this.base64RawURLEncode(Buffer.from(JSON.stringify(payload), 'utf8'));

    let result = [header, payload]
    let sign = this.base64RawURLEncode(forge.pki.ed25519.sign({
      message: result.join('.'),
      encoding: 'utf8',
      privateKey
    }))
    result.push(sign)
    return result.join('.')
  }



}

module.exports = Mixin;


