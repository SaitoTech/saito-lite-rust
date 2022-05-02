const Buffer = require('buffer/').Buffer
import forge from 'node-forge'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import Util from './util'

class Client {
  constructor() {
    this.util = new Util();
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

    let header = this.util.base64RawURLEncode(Buffer.from(JSON.stringify({ alg: "EdDSA", typ: "JWT" }), 'utf8'));
    payload = this.util.base64RawURLEncode(Buffer.from(JSON.stringify(payload), 'utf8'));

    let result = [header, payload]
    let sign = this.util.base64RawURLEncode(forge.pki.ed25519.sign({
      message: result.join('.'),
      encoding: 'utf8',
      privateKey
    }))
    result.push(sign)
    return result.join('.')
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

  request(uid, sid, privateKey, method, path, data) {
    const m = method;
    const accessToken = this.signAuthenticationToken(
      uid,
      sid,
      privateKey,
      method,
      path,
      JSON.stringify(data)
    )

console.log("ACCESS TOKEN CREATED: " + accessToken);

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

    return this.requestByToken(method, path, data, accessToken)
  }
}

export default Client;
