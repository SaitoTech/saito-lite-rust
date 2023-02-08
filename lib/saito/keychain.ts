import modtemplate from "./../templates/modtemplate";
import * as JSON from "json-bigint";
import Identicon from "identicon.js";
import { Saito } from "../../apps/core";


class Keychain {
  public app: Saito;
  public keys: Array<any>;
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

    //
    // saved keys
    //
    for (let i = 0; i < this.app.options.keys.length; i++) {
      this.keys.push(this.app.options.keys[i]);
    }

    //
    // saved groups
    //
    if (this.app.options.groups == null) {
      this.app.options.groups = [];
    } else {
      this.groups = this.app.options.groups;
    }

    //
    // add my key if needed
    //
    if (this.app.options.keys.length == 0) {
      this.addKey({ publickey: this.app.wallet.returnPublicKey(), watched: true });
    }

  }

  //
  // adds an individual key, we have two ways of doing this !
  //
  // (publickey, data)
  // ({ publickey : x, data : y })
  //
  addKey(pa = null, da = null) {

    let data = { publickey: "" };

    //
    // argument-overloading permitted !!
    //
    if (typeof pa === 'string') {
      data.publickey = pa;
      for (let key in da) { if (key !== "publickey") { data[key] = da[key]; } }
    } else {
      if (pa == null) { return; }
      if (!pa.publickey) {
        console.log("Error: cannot add publickey to keychain without publickey...");
        return;
      }
      data = pa;
    }

    //
    // skip empty keys
    //
    if (data.publickey === "") { return; }

    //
    // update existing entry
    //
    for (let i = 0; i < this.keys.length; i++) {
      if (this.keys[i].publickey === data.publickey) {
        let newkey = {};
        for (let key in data) { if (key !== "publickey") { newkey[key] = data[key]; } }
        this.saveKeys();
        return;
      }
    }

    //
    // or add new entry
    //
    let newkey = { publickey: "" };
    newkey.publickey = data.publickey;
    for (let key in data) { if (key !== "publickey") { newkey[key] = data[key]; } }
    this.keys.push(newkey);
    this.saveKeys();

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

  //
  // used in the encrypt module, provided here for convenience of generating DHKE
  // in other ways.
  //
  initializeKeyExchange(publickey: string) {
    const alice = this.app.crypto.createDiffieHellman();
    const alice_publickey = alice.getPublicKey(null, "compressed").toString("hex");
    const alice_privatekey = alice.getPrivateKey(null, "compressed").toString("hex");
    this.updateCryptoByPublicKey(publickey, alice_publickey, alice_privatekey, "");
    return alice_publickey;
  }


  removeKey(publickey = null) {
    if (publickey == null) { return; }
    for (let x = this.keys.length - 1; x >= 0; x--) {
      let match = true;
      if (this.keys[x].publickey == publickey) {
        this.keys.splice(x, 1);
      }
    }
  }

  returnKey(data = null) {

    //
    // data might be a publickey, permit flexibility
    // in how this is called by pushing it into a 
    // suitable object for searching
    //
    if (typeof data === 'string') {
      let d = { publickey: "" };
      d.publickey = data;
      data = d;
    }

    //
    // if keys exist
    //
    for (let x = 0; x < this.keys.length; x++) {
      let match = true;
      for (let key in data) {
        if (this.keys[x][key] !== data[key]) {
          match = false;
        }
      }
      if (match == true) {
        return this.keys[x];
      }
    }

    return null;
  }

  returnKeys(data = null) {
    const kx = [];

    //
    // no filters? return everything
    //
    if (data == null) {
      for (let x = 0; x < this.keys.length; x++) {
        if (this.keys[x].lc && this.keys[x].publickey != this.app.wallet.returnPublicKey()) {
          kx.push(this.keys[x]);
        }
      }
    }

    //
    // if keys exist
    //
    for (let x = 0; x < this.keys.length; x++) {
      let match = true;
      for (let key in data) {
        if (this.keys[x][key] !== data[key]) {
          match = false;
        }
      }
      if (match == true) {
        kx.push(this.keys[x]);
      }
    }

    return kx;
  }

  returnGroups() {
    return this.groups;
  }

  saveKeys() {
    this.app.options.keys = this.keys;
    this.app.storage.saveOptions();
  }

  saveGroups() {
    this.app.options.groups = this.groups;
    this.app.storage.saveOptions();
  }



  returnIdenticon(publickey: string, img_format = "svg") {

    if (this.keys != undefined) {
      for (let x = 0; x < this.keys.length; x++) {
        if (this.keys[x].publickey === publickey) {
          if (
            this.keys[x].identicon != "" &&
            typeof this.keys[x].identicon !== "undefined"
          ) {
            return this.keys[x].identicon;
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
      format: img_format, // use SVG instead of PNG
    };
    const data = new Identicon(this.app.crypto.hash(publickey), options).toString();
    return "data:image/" + img_format + "+xml;base64," + data;
  }


  returnIdenticonColor(publickey) {
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

  returnPublicKeyByIdentifier(identifier: string) {
    let key = this.returnKey({ identifier: identifier });
    if (key) { if (key.publickey) { return key.publickey; } }
    return null;
  }

  returnIdentifierByPublicKey(publickey: string, returnKey = false): string {
    let key = this.returnKey({ publickey: publickey });
    if (key) {
      if (key.identifier) {
        return key.identifier;
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
    if (name != publickey) {
      if (name.length > 12) {
        return name.substring(0, 12) + "...";
      }
      if (name[0]) {
        if (name[0].length > 12) {
          return name[0].substring(0, 12) + "...";
        }
      }
    }
    else {
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

}

export default Keychain;
