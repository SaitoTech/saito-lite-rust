import modtemplate from "./../templates/modtemplate";

import * as JSON from "json-bigint";

import Identicon from "identicon.js";
import { Saito } from "../../apps/core";
import Key from "./key";

class Keychain {
  public app: Saito;
  public keys: Array<Key>;
  public groups: any;
  public modtemplate: any;
  public fetched_keys: Map<string, number>;
  public publickey: string;
  public identifier: string;
  public bid: bigint;
  public bsh: string;
  public lc: boolean;

  constructor(app: Saito) {
    this.app = app;
    this.keys = [];
    this.groups = [];
    this.modtemplate = new modtemplate(this.app);
    this.fetched_keys = new Map<string, number>();
  }

  initialize() {
    if (this.app.options.keys == null) {
      this.app.options.keys = [];
    }

    for (let i = 0; i < this.app.options.keys.length; i++) {
      const tk = this.app.options.keys[i];

      const k = new Key();
      k.publickey = tk.publickey;
      k.watched = tk.watched;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      k.bid = tk.bid;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      k.bsh = tk.bsh;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      k.lc = tk.lc;
      k.aes_publickey = tk.aes_publickey;
      k.aes_privatekey = tk.aes_privatekey;
      k.aes_secret = tk.aes_secret;
      k.data = tk.data;

      for (let m = 0; m < tk.identifiers.length; m++) {
        k.identifiers[m] = tk.identifiers[m];
        if (m == 0) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          k.name = tk.identifiers[m];
        }
      }
      for (let m = 0; m < tk.tags.length; m++) {
        k.tags[m] = tk.tags[m];
      }
      this.keys.push(k);
    }

    //
    // add my key if nothing else
    //
    if (this.app.options.keys.length == 0) {
      this.addKey(this.app.wallet.returnPublicKey(), { watched: true });
    }

    // Load groups from storage

    if (this.app.options.groups == null) {
      this.app.options.groups = [];
    } else {
      this.groups = this.app.options.groups;
    }
  }

  //
  // adds an individual key
  //
  addKey(publickey = "", data = {}) {
    if (publickey === "") {
      return;
    }

    //
    // eliminate excessive keys if needed
    //
    this.pruneKeys();

    publickey = publickey.trim();

    let tmpkey = this.findByPublicKey(publickey);
    let added_identifier = 0;
    let added_tag = 0;
    if (tmpkey == null) {
      tmpkey = new Key();
      tmpkey.publickey = publickey;
      tmpkey.watched = false;
      tmpkey.lc = true;
      this.keys.push(tmpkey);
    }

    //console.log("IS THIS A NEW OR EXISTING KEY: " + JSON.stringify(tmpkey));

    for (let key in data) {
      if (key === "identifiers") {
        for (let z = 0; z < data[key].length; z++) {
          if (!tmpkey.identifiers.includes(data[key][z])) {
            tmpkey.identifiers.push(data[key][z]);
            added_identifier = 1;
          }
        }
      } else {
        if (key === "tags") {
          for (let z = 0; z < data[key].length; z++) {
            if (!tmpkey.tags.includes(data[key][z])) {
              tmpkey.tags.push(data[key][z]);
              added_tag = 1;
            }
          }
        } else {
          if (key === "identifier") {
            if (!tmpkey.identifiers.includes(data[key])) {
              tmpkey.identifiers.push(data[key]);
              added_identifier = 1;
            }
          } else {
            tmpkey[key] = data[key];
          }
        }
      }
    }

    this.saveKeys();

    if (added_identifier == 1) {
      this.app.connection.emit("update_identifier", tmpkey);
    }
    if (added_tag == 1) {
      this.app.connection.emit("update_tag", tmpkey);
    }
  }

  decryptMessage(publickey: string, encrypted_msg) {
    // submit JSON parsed object after unencryption
    for (let x = 0; x < this.keys.length; x++) {
      if (this.keys[x].publickey == publickey) {
        if (this.keys[x].aes_secret != "") {
          const tmpmsg = this.app.crypto.aesDecrypt(encrypted_msg, this.keys[x].aes_secret);
          if (tmpmsg != null) {
            const tmpx = JSON.parse(tmpmsg);
            if (tmpx.module != null) {
              return tmpx;
            }
          }
        }
      }
    }

    // or return original
    return encrypted_msg;
  }

  addGroup(group_id = "", data = { members: [] }) {
    //
    //
    //
    let group = null;

    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].id === group_id) {
        group = this.groups[i];
      }
    }

    if (group === null) {
      group = {};
      group.id = group_id;
      group.members = [];
      group.name = "New Group";
      group.tag = "";
      group.block_id = 0;
      group.block_hash = 0;
    }

    for (let key in data) {
      if (key !== "members") {
        group[key] = data[key];
      } else {
        if (data.members) {
          for (let i = 0; i < data.members.length++; i++) {
            this.addKey(data.members[i]);
            if (!group.members.includes(data.members[i])) {
              group.members.push(data.members[i]);
            }
          }
        }
      }
    }

    this.saveGroups();
  }

  decryptString(publickey, encrypted_string) {
    for (let x = 0; x < this.keys.length; x++) {
      if (this.keys[x].publickey == publickey) {
        if (this.keys[x].aes_secret != "") {
          return this.app.crypto.aesDecrypt(encrypted_string, this.keys[x].aes_secret);
        }
      }
    }

    return encrypted_string;
  }

  encryptMessage(publickey: string, msg) {
    for (let x = 0; x < this.keys.length; x++) {
      if (this.keys[x].publickey === publickey) {
        if (this.keys[x].aes_secret != "") {
          const jsonmsg = JSON.stringify(msg);
          return this.app.crypto.aesEncrypt(jsonmsg, this.keys[x].aes_secret);
        }
      }
    }
    return msg;
  }

  findByPublicKey(publickey: string): Key | null {
    for (let x = 0; x < this.keys.length; x++) {
      if (this.keys[x].publickey === publickey) {
        return this.keys[x];
      }
    }
    return null;
  }

  findByIdentifier(identifier) {
    for (let x = 0; x < this.keys.length; x++) {
      if (this.keys[x].isIdentifier(identifier)) {
        return this.keys[x];
      }
    }
    return null;
  }

  hasSharedSecret(publickey: string) {
    for (let x = 0; x < this.keys.length; x++) {
      if (this.keys[x].publickey === publickey || this.keys[x].isIdentifier(publickey)) {
        if (this.keys[x].hasSharedSecret()) {
          return true;
        }
      }
    }
    return false;
  }

  isWatched(publickey) {
    for (let x = 0; x < this.keys.length; x++) {
      if (this.keys[x].publickey == publickey || this.keys[x].isIdentifier(publickey)) {
        if (this.keys[x].isWatched()) {
          return true;
        }
      }
    }
    return false;
  }

  initializeKeyExchange(publickey: string) {
    const alice = this.app.crypto.createDiffieHellman();
    const alice_publickey = alice.getPublicKey(null, "compressed").toString("hex");
    const alice_privatekey = alice.getPrivateKey(null, "compressed").toString("hex");
    this.updateCryptoByPublicKey(publickey, alice_publickey, alice_privatekey, "");
    return alice_publickey;
  }

  isTagged(publickey, tag) {
    const x = this.findByPublicKey(publickey);
    if (x == null) {
      return false;
    }
    return x.isTagged(tag);
  }

  saveKeys() {
    this.app.options.keys = this.keys;
    this.app.storage.saveOptions();
  }

  saveGroups() {
    this.app.options.groups = this.groups;
    this.app.storage.saveOptions();
  }

  pruneKeys() {
    let replacement_key_array = [];
    let keys_replaced = 0;
    if (this.keys.length > 200) {
      for (let x = 0; x < this.keys.length && keys_replaced < 50; x++) {
        let k = this.keys[x];
        let keep_key = 0;
        if (k.watched) {
          keep_key = 1;
        }
        if (k.aes_publickey) {
          keep_key = 1;
        }
        if (k.aes_secret) {
          keep_key = 1;
        }
        if (k.tags.length > 0) {
          keep_key = 1;
        }
        if (k.data) {
          keep_key = 1;
        }
        if (keep_key) {
          replacement_key_array.push(k);
        } else {
          keys_replaced++;
        }
      }
      this.keys = replacement_key_array;
    }
  }

  removeKey(publickey) {
    for (let x = this.keys.length - 1; x >= 0; x--) {
      if (this.keys[x].publickey == publickey) {
        this.keys.splice(x, 1);
      }
    }
  }

  // unused
  // removeKeywordByIdentifierAndKeyword(identifier, tag) {
  //   for (let x = this.keys.length - 1; x >= 0; x--) {
  //     if (this.keys[x].isIdentifier(identifier) && this.keys[x].isTagged(tag)) {
  //       this.removeKey(this.keys[x].publickey);
  //       return;
  //     }
  //   }
  // }

  returnKeys() {
    const kx = [];
    for (let x = 0; x < this.keys.length; x++) {
      if (this.keys[x].lc && this.keys[x].publickey != this.app.wallet.returnPublicKey()) {
        kx.push(this.keys[x]);
      }
    }
    return kx;
  }

  returnGroups() {
    return this.groups;
  }

  returnKeychainByTag(tag) {
    const kx = [];
    for (let x = 0; x < this.keys.length; x++) {
      if (this.keys[x].isTagged(tag)) {
        kx[kx.length] = this.keys[x];
      }
    }
    return kx;
  }

  // used by email registration
  updateEmail(publickey, email) {
    let added = 0;
    if (this.keys != undefined) {
      for (let x = 0; x < this.keys.length; x++) {
        if (this.keys[x].publickey === publickey) {
          if (!this.keys[x].data) {
            this.keys[x].data = {};
          }
          added = 1;
          this.keys[x].data.email = email;
          this.app.connection.emit("update_email", this.keys[x]);
        }
      }
    }
    if (added == 0) {
      this.addKey(publickey);
      this.updateEmail(publickey, email);
    }
    this.saveKeys();
  }

  returnEmail(publickey) {
    if (this.keys != undefined) {
      for (let x = 0; x < this.keys.length; x++) {
        if (this.keys[x].publickey === publickey) {
          if (this.keys[x].data.email != "" && typeof this.keys[x].data.email !== "undefined") {
            return this.keys[x].data.email;
          }
        }
      }
    }
    return "";
  }

  updateIdenticon(publickey, identicon) {
    if (this.keys != undefined) {
      for (let x = 0; x < this.keys.length; x++) {
        if (this.keys[x].publickey === publickey) {
          if (!this.keys[x].data) {
            this.keys[x].data = {};
          }
          this.keys[x].data.identicon = identicon;
        }
      }
    }
    this.saveKeys();
  }

  returnIdenticon(publickey: string) {
    if (this.keys != undefined) {
      for (let x = 0; x < this.keys.length; x++) {
        if (this.keys[x].publickey === publickey) {
          if (
            this.keys[x].data.identicon != "" &&
            typeof this.keys[x].data.identicon !== "undefined"
          ) {
            return this.keys[x].data.identicon;
          }
        }
      }
    }

    //
    // if we reach here, generate from publickey
    //
    const options = {
      //foreground: [247, 31, 61, 255],           // saito red
      //background: [255, 255, 255, 255],
      margin: 0.0, // 0% margin
      size: 420, // 420px square
      format: "svg", // use SVG instead of PNG
    };
    // console.debug("publickey for identicon 1 : ", publickey);
    const data = new Identicon(this.app.crypto.hash(publickey), options).toString();
    return "data:image/svg+xml;base64," + data;
  }

  returnIdenticonasPNG(publickey: string) {
    const options = {
      margin: 0.0, // 0% margin
      size: 420, // 420px square
      format: "png", // use SVG instead of PNG
    };
    // console.debug("publickey for identicon 2 : ", publickey);
    const data = new Identicon(this.app.crypto.hash(publickey), options).toString();
    return "data:image/png;base64," + data;
  }

  returnIdenticonColor(publickey) {
    // foreground defaults to last 7 chars as hue at 70% saturation, 50% brightness
    const hue = parseInt(this.app.crypto.hash(publickey).substr(-7), 16) / 0xfffffff;
    const saturation = 0.7;
    const brightness = 0.5;
    const values = this.hsl2rgb(hue, saturation, brightness).map(Math.round);
    return `rgba(${values.join(",")})`;
  }

  hsl2rgb(h, s, b) {
    h *= 6;
    s = [
      (b += s *= b < 0.5 ? b : 1 - b),
      b - (h % 1) * s * 2,
      (b -= s *= 2),
      b,
      b + (h % 1) * s,
      b + s,
    ];

    return [
      s[~~h % 6] * 255, // red
      s[(h | 16) % 6] * 255, // green
      s[(h | 8) % 6] * 255, // blue
    ];
  }

  fetchIdentifierPromise(publickey) {
    return new Promise((resolve, reject) => {
      this.fetchIdentifier(publickey, (answer) => {
        resolve(answer);
      });
    });
  }

  fetchManyIdentifiersPromise(publickeys) {
    return new Promise((resolve, reject) => {
      this.fetchManyIdentifiers(publickeys, (answer) => {
        resolve(answer);
      });
    });
  }

  fetchIdentifier(publickey = "", mycallback) {
    let identifier = "";
    const found_keys = [];
    if (publickey == "") {
      mycallback(identifier);
    }

    identifier = this.returnIdentifierByPublicKey(publickey);
    if (this.fetched_keys[publickey] == 1) {
      mycallback(identifier);
    }
    if (!identifier) {
      mycallback(identifier);
    }

    this.modtemplate.sendPeerDatabaseRequestWithFilter(
      "Registry",
      'SELECT * FROM records WHERE publickey = "' + publickey + '"',
      (res) => {
        let rows = [];

        if (res.rows == undefined) {
          mycallback(rows);
        }
        if (res.err) {
          mycallback(rows);
        }
        if (res.rows == undefined) {
          mycallback(rows);
        }
        if (res.rows.length == 0) {
          mycallback(rows);
        }
        rows = res.rows.map((row) => {
          const { publickey, identifier, bid, bsh, lc } = row;

          // keep track that we fetched this already
          this.fetched_keys[publickey] = 1;
          this.addKey(publickey, {
            identifier: identifier,
            watched: false,
            block_id: bid,
            block_hash: bsh,
            lc: lc,
          });
          if (!found_keys.includes(publickey)) {
            found_keys[publickey] = identifier;
          }
        });
        mycallback(found_keys);
      },

      (peer) => {
        for (let z = 0; z < peer.peer.services.length; z++) {
          if (peer.peer.services[z].service === "registry") {
            return 1;
          }
        }
      }
    );
  }

  fetchManyIdentifiers(publickeys = [], mycallback) {
    const found_keys = [];
    const missing_keys = [];

    publickeys.forEach((publickey) => {
      const identifier = this.returnIdentifierByPublicKey(publickey);
      if (identifier.length > 0) {
        found_keys[publickey] = identifier;
      } else {
        missing_keys.push(`'${publickey}'`);
      }
    });

    if (missing_keys.length == 0) {
      mycallback(found_keys);
      return;
    }

    const where_statement = `publickey in (${missing_keys.join(",")})`;
    const sql = `select *
                     from records
                     where ${where_statement}`;

    this.modtemplate.sendPeerDatabaseRequestWithFilter(
      "Registry",

      sql,

      (res) => {
        try {
          let rows = [];
          if (typeof res.rows != "undefined") {
            if (!res.err) {
              if (res.rows.length > 0) {
                rows = res.rows.map((row) => {
                  const { publickey, identifier, bid, bsh, lc } = row;
                  this.addKey(publickey, {
                    identifier: identifier,
                    watched: false,
                    block_id: bid,
                    block_hash: bsh,
                    lc: lc,
                  });
                  if (!found_keys.includes(publickey)) {
                    found_keys[publickey] = identifier;
                  }
                });
              }
            }
          }
          mycallback(found_keys);
        } catch (err) {
          console.log(err);
        }
      },

      (peer) => {
        if (peer.peer.services) {
          for (let z = 0; z < peer.peer.services.length; z++) {
            if (peer.peer.services[z].service === "registry") {
              return 1;
            }
          }
        }
      }
    );
  }

  fetchPublicKeyPromise(identifier = "") {
    return new Promise((resolve, reject) => {
      this.fetchPublicKey(identifier, (answer) => {
        resolve(answer);
      });
    });
  }

  fetchPublicKey(identifier = null, mycallback = null) {
    if (!identifier) {
      return null;
    }
    if (this.app.crypto.isPublicKey(identifier)) {
      return identifier;
    }
    const publickey = this.returnPublicKeyByIdentifier(identifier);
    if (publickey != "") {
      return publickey;
    }
    //
    // if no result, fetch from server (modtemplate)
    //
    this.modtemplate.sendPeerDatabaseRequestWithFilter(
      "Registry",
      `SELECT * FROM records WHERE identifier = '${identifier}'`,
      (res) => {
        if (res.rows && res.rows.length > 0) {
          //It should be unique....
          res.rows.forEach((row) => {
            const { publickey, identifier, bid, bsh, lc } = row;
            this.addKey(publickey, {
              identifier: identifier,
              watched: false,
              block_id: bid,
              block_hash: bsh,
              lc: lc,
            });
          });
          return res.rows[0].publickey;
        }
      }
    );
    return null;
  }

  returnPublicKeyByIdentifier(identifier: string): string {
    for (let x = 0; x < this.keys.length; x++) {
      const key = this.keys[x];
      if (key.lc && key.isIdentifier(identifier)) {
        return key.publickey;
      }
    }
    return "";
  }

  returnIdentifierByPublicKey(publickey: string, returnKey = false): string {
    if (this.keys != undefined) {
      for (let x = 0; x < this.keys.length; x++) {
        const key = this.keys[x];
        if (key.publickey === publickey) {
          if (key.identifiers != undefined && key.lc) {
            if (key.identifiers.length > 0) {
              return key.identifiers[0];
            }
          }
        }
      }
    }
    if (returnKey) {
      return publickey;
    } else {
      return "";
    }
  }

  returnUsername(publickey: string): string {
    const name = this.returnIdentifierByPublicKey(publickey, true);
    if (name != "" && name != publickey) {
      return name;
    }
    if (name.length > 12) {
      return name.substr(0, 12) + "...";
    }
    if (name[0]) {
      if (name[0].length > 12) {
        return name[0].substr(0, 12) + "...";
      }
    }
    if (name) {
      return name;
    } else {
      return publickey;
    }
  }

  returnWatchedPublicKeys() {
    const x = [];
    for (let i = 0; i < this.keys.length; i++) {
      if (this.keys[i].isWatched() && this.keys[i].lc) {
        x.push(this.keys[i].publickey);
      }
    }
    return x;
  }

  addWatchedPublicKey(publickey = "") {
    this.addKey(publickey, { watched: true });
    this.saveKeys();
    this.app.network.updatePeersWithWatchedPublicKeys();
  }

  updateCryptoByPublicKey(publickey, aes_publickey = "", aes_privatekey = "", shared_secret = "") {
    console.log("updating crypto for: " + publickey);

    if (publickey == "") {
      return;
    }

    this.addKey(publickey);

    for (let x = 0; x < this.keys.length; x++) {
      console.log("TESTING: " + this.keys[x].publickey + " -- " + this.keys[x].lc);
      if (this.keys[x].publickey == publickey && this.keys[x].lc) {
        console.log("UPDATING: " + shared_secret);
        this.keys[x].aes_publickey = aes_publickey;
        this.keys[x].aes_privatekey = aes_privatekey;
        this.keys[x].aes_secret = shared_secret;
      }
    }

    this.saveKeys();

    return true;
  }

  alreadyHaveSharedSecret(publickey: string): boolean {
    for (let x = 0; x < this.keys.length; x++) {
      if (this.keys[x].publickey === publickey && this.keys[x].lc) {
        if (this.keys[x].aes_secret != "") {
          return true;
        }
      }
    }

    return false;
  }

  clean() {
    for (let x = 0; x < this.keys.length; x++) {
      if (!this.keys[x].isWatched()) {
        if (this.keys[x].aes_secret != "") {
          console.log(
            "purging key records: " +
              this.keys[x].publickey +
              " " +
              JSON.stringify(this.keys[x].identifiers)
          );
          this.keys.splice(x, 1);
          x--;
        }
      }
    }
  }
}

export default Keychain;
