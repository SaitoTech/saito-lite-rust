const path = require("path");
const saito = require("../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const RegistryModal = require("./lib/modal/registry-modal");
const RegisterUsernameModal = require("../../lib/saito/ui/modals/register-username/register-username.js");

class Registry extends ModTemplate {
  constructor(app) {
    super(app);

    this.app = app;
    this.name = "Registry";
    this.description =
      "Adds support for the Saito DNS system, so that users can register user-generated names. Runs DNS server on core nodes.";
    this.categories = "Core Utilities Messaging";

    //
    // master DNS publickey for this module
    //
    this.publickey = "zYCCXRZt2DyPD9UmxRfwFgLTNAqCd5VE8RuNneg4aNMK";

    //
    // we could save the cached keys here instead of inserting them
    // into our wallet / keychain ? perhaps that would be a much more
    // efficient way of handling things that stuffing the wallet with
    // the information of strangers....
    //
    this.cached_keys = {};

    //
    // event listeners - browser.ts calls this in addIdentifiersToDom()
    //
    this.app.connection.on("registry-fetch-identifiers-and-update-dom", async (keys) => {
      let unidentified_keys = [];

      for (let i = 0; i < keys.length; i++) {
        if (this.cached_keys[keys[i]]) {
          this.app.browser.updateAddressHTML(keys[i], this.cached_keys[keys[i]]);
        } else {
          unidentified_keys.push(keys[i]);
        }
      }

      let peers = await this.app.network.getPeers();
      let myKey = await this.app.wallet.getPublicKey();
      for (let i = 0; i < peers.length; i++) {
        let peer = peers[i];
        if (this.app.network.peers[i].hasService("registry")) {
          this.fetchManyIdentifiers(unidentified_keys, peer, (answer) => {
            Object.entries(answer).forEach(([key, value]) => {
              this.cached_keys[key] = value;
              if (key === myKey) {
                let k = this.app.keychain.returnKey(key);
                if (k) {
                  if (!k.identifier) {
                    this.app.keychain.addKey(key, { identifier: value });
                    this.app.connection.emit("update_identifier", key);
                  }
                }
              } else {
                // save if locally stored
                if (this.app.keychain.hasPublicKey(key)) {
                  this.app.keychain.addKey({ publickey: key, identifier: value });
                }
              }
              this.app.browser.updateAddressHTML(key, value);
            });
          });

          //
          // save all keys queried to cache so even if we get nothing
          // back we won't query the server again for them.
          //
          for (let i = 0; i < unidentified_keys.length; i++) {
            if (!this.cached_keys[unidentified_keys[i]]) {
              this.cached_keys[unidentified_keys[i]] = unidentified_keys[i];
            }
          }
        }
      }
    });

    this.username_modal = null;

    return this;
  }

  async initialize(app) {
    await super.initialize(app);
    this.username_modal = new RegisterUsernameModal(app, this);
  }

  returnServices() {
    let services = [];
    //
    // until other nodes are mirroring the DNS directory and capable of feeding out
    // responses to inbound requests for DNS queries, only services that are actually
    // registering domains should report they run the registry module.
    //
    if (this.app.BROWSER == 0) {
      //if (this.publickey == this.app.wallet.returnPublicKey()) {
      services.push({ service: "registry", domain: "saito" });
    }
    return services;
  }

  //
  // fetching identifiers
  //
  async fetchManyPublicKeys(identifiers = [], peer = null, mycallback = null) {
    if (mycallback == null) {
      return;
    }

    const found_keys = [];
    const missing_keys = [];

    identifiers.forEach((identifier) => {
      let publickey = this.app.browser.returnPublicKeyByIdentifier(identifier);
      if (publickey != "" && publickey != identifier) {
        found_keys.push[publickey] = identifier;
      } else {
        missing_keys.push(identifier);
      }
    });

    if (missing_keys.length == 0) {
      mycallback(found_keys);
      return;
    }

    const where_statement = `identifier in (${missing_keys.join(",")})`;
    const sql = `select *
                 from records
                 where ${where_statement}`;

    await this.sendPeerDatabaseRequestWithFilter(
      "Registry",
      sql,
      async (res) => {
        try {
          let rows = [];
          if (typeof res.rows != "undefined") {
            if (!res.err) {
              if (res.rows.length > 0) {
                rows = res.rows.map((row) => {
                  const { publickey, identifier, bid, bsh, lc } = row;
                  if (!found_keys.includes(publickey)) {
                    found_keys[publickey] = identifier;
                  }
                });
              }
            }
          }
          await mycallback(found_keys);
        } catch (err) {
          console.log(err);
        }
      },

      (p) => {
        if (peer == null) {
          if (peer.services) {
            for (let z = 0; z < peer.services.length; z++) {
              if (peer.services[z].service === "registry") {
                return 1;
              }
            }
          }
        } else {
          if (p == peer) {
            return 1;
          }
        }
      }
    );
  }

  //
  // fetching identifiers
  //
  fetchManyIdentifiers(publickeys = [], peer = null, mycallback = null) {
    if (mycallback == null) {
      return;
    }

    const found_keys = [];
    const missing_keys = [];

    publickeys.forEach((publickey) => {
      const identifier = this.app.keychain.returnIdentifierByPublicKey(publickey);
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

    /*
    console.info(this.cached_keys);
    console.info(publickeys);
    console.info(missing_keys);
    console.info("%%%%%%%%%%%%%%%%%%%%% PEER REGISTRY REQUEST %%%%%%%%%%%%%%%%%%%%%%%%%");
    */

    this.sendPeerDatabaseRequestWithFilter(
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

      (p) => {
        if (peer == null) {
          if (peer.peer.services) {
            for (let z = 0; z < peer.peer.services.length; z++) {
              if (peer.peer.services[z].service === "registry") {
                return 1;
              }
            }
          }
        } else {
          if (p == peer) {
            return 1;
          }
        }
      }
    );
  }

  fetchIdentifier(publickey, peer = null, mycallback = null) {
    if (mycallback == null) {
      return;
    }

    this.sendPeerDatabaseRequestWithFilter(
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
          this.cached_keys[publickey] = identifier;
          if (!found_keys.includes(publickey)) {
            found_keys[publickey] = identifier;
          }
        });
        mycallback(found_keys);
      },

      (p) => {
        if (peer == null) {
          if (peer.peer.services) {
            for (let z = 0; z < peer.peer.services.length; z++) {
              if (peer.peer.services[z].service === "registry") {
                return 1;
              }
            }
          }
        } else {
          if (p == peer) {
            return 1;
          }
        }
      }
    );
  }

  respondTo(type = "") {
    let registry_self = this;

    if (type == "saito-return-key") {
      return {
        returnKey: (data = null) => {
          //
          // data might be a publickey, permit flexibility
          // in how this is called by pushing it into a
          // suitable object for searching
          //
          if (typeof data === "string") {
            let d = { publickey: "" };
            d.publickey = data;
            data = d;
          }

          //
          // if keys exist
          //
          for (let key in this.cached_keys) {
            if (key === data.publickey) {
              if (this.cached_keys[key]) {
                return { publickey: key, identifier: this.cached_keys[key] };
              } else {
                return { publickey: key };
              }
            }
          }

          return null;
        },
      };
    }

    if (type == "do-registry-prompt") {
      return {
        doRegistryPrompt: async () => {
          var requested_id = await sprompt(
            "Pick a handle or nickname. <br /><sub>Alphanumeric characters only - Do not include an @</sub.>"
          );
          try {
            let success = this.tryRegisterIdentifier(requested_id);
            if (success) {
              return requested_id;
            } else {
              throw "Unknown error";
            }
          } catch (err) {
            if (err.message == "Alphanumeric Characters only") {
              salert("Alphanumeric Characters only");
            } else {
              throw err;
            }
          }
        },
      };
    }

    /**** part of profile now
     if (type === 'saito-header') {
          let key = this.app.keychain.returnKey(this.app.wallet.returnPublicKey());
          let has_registered_username = false;
          if (key) { if (key.has_registered_username) { has_registered_username = true; } }
          if (!has_registered_username) {
            let m = [{
              text: "Username",
              icon: "fa-solid fa-user",
          rank: 80 ,
              callback: function (app, id) {
               let m = new RegisterUsernameModal(app, registry_self); //No callback
               m.render();
               return;
              }
            }];
            return m;
          }
        }
     ****/
    return null;
  }

  showModal() {
    RegistryModal.render(this.app, this);
    RegistryModal.attachEvents(this.app, this);
  }

  async handlePeerTransaction(app, tx = null, peer, mycallback) {
    if (tx == null) {
      return;
    }
    let message = tx.returnMessage();

    //
    // this code doubles onConfirmation
    //
    if (message.request === "registry username update") {
      let tx = message?.data?.tx;
      let registry_self = app.modules.returnModule("Registry");

      //
      // registration from DNS registrar?
      //
      let identifier = tx.msg.identifier;
      let signed_message = tx.msg.signed_message;
      let sig = tx.msg.sig;

      try {
        if (registry_self.app.crypto.verifyMessage(signed_message, sig, registry_self.publickey)) {
          registry_self.app.keychain.addKey(tx.to[0].publicKey, {
            identifier: identifier,
            watched: true,
            block_id: registry_self.app.blockchain.returnLatestBlockId(),
            block_hash: registry_self.app.blockchain.returnLatestBlockHash(),
            lc: 1,
          });
          registry_self.app.browser.updateAddressHTML(tx.to[0].publicKey, identifier);
        } else {
          console.debug("failed verifying message for username registration : ", tx);
        }
      } catch (err) {
        console.error("ERROR verifying username registration message: ", err);
      }
    }

    await super.handlePeerTransaction(app, tx, peer, mycallback);
  }

  async notifyPeers(app, tx) {
    let peers = await app.network.getPeers();
    for (let i = 0; i < peers.length; i++) {
      if (peers[i].peer.synctype == "lite") {
        //
        // fwd tx to peer
        //
        let message = {};
        message.request = "registry username update";
        message.data = {};
        message.data.tx = tx;
        await app.network.sendRequest(message.request, message.data, null, peers[i].peerIndex);
      }
    }
  }

  async tryRegisterIdentifier(identifier, domain = "@saito") {
    let registry_self = this.app.modules.returnModule("Registry");

    //console.log("REGISTERING TO WHICH MODULE: " + this.name);
    //console.log("REGISTERING TO WHICH PKEY: " + this.publickey);
    //console.log("REGISTERING TO WHICH PKEY: " + registry_self.publickey);

    let newtx = this.app.wallet.createUnsignedTransaction(
      registry_self.publickey,
      0.0,
      this.app.wallet.wallet.default_fee
    );
    if (!newtx) {
      console.log("NULL TX CREATED IN REGISTRY MODULE");
      throw Error("NULL TX CREATED IN REGISTRY MODULE");
    }

    if (typeof identifier === "string" || identifier instanceof String) {
      var regex = /^[0-9A-Za-z]+$/;
      if (!regex.test(identifier)) {
        throw Error("Alphanumeric Characters only");
      }
      newtx.msg.module = "Registry";
      //newtx.msg.request	= "register";
      newtx.msg.identifier = identifier + domain;

      newtx = await this.app.wallet.signTransaction(newtx);
      await this.app.network.propagateTransaction(newtx);

      // sucessful send
      return true;
    } else {
      throw TypeError("identifier must be a string");
    }
    return false;
  }

  // DEPRECATED, USE tryRegisterIdentifier()
  async registerIdentifier(identifier, domain = "@saito") {
    let newtx = await this.app.wallet.createUnsignedTransaction(
      this.publickey,
      0.0,
      this.app.wallet.wallet.default_fee
    );
    if (newtx == null) {
      console.log("NULL TX CREATED IN REGISTRY MODULE");
      return;
    }

    if (typeof identifier === "string" || identifier instanceof String) {
      var regex = /^[0-9A-Za-z]+$/;
      if (!regex.test(identifier)) {
        salert("Alphanumeric Characters only");
        return false;
      }

      newtx.msg.module = "Registry";
      //newtx.msg.request	= "register";
      newtx.msg.identifier = identifier + domain;

      newtx = await this.app.wallet.signTransaction(newtx);
      await this.app.network.propagateTransaction(newtx);

      // sucessful send
      return true;
    }
  }

  async onPeerServiceUp(app, peer, service = {}) {
    //
    // redsquare -- fetch community tweets
    //
    if (service.service === "registry") {
      if (app.BROWSER == 1) {
        await app.browser.addIdentifiersToDom();
      }
    }
  }

  onPeerHandshakeComplete(app, peer) {
    let registry_self = app.modules.returnModule("Registry");

    /***** UNCOMMENT FOR LOCAL DEVELOPMENT ******
     if (registry_self.app.options.server != undefined) {
      registry_self.publickey = registry_self.app.wallet.returnPublicKey();
    } else {
      registry_self.publickey = peer.peer.publickey;
    }
     console.log("WE ARE NOW LOCAL SERVER");
     *******************************************/
  }

  async onConfirmation(blk, tx, conf, app) {
    let registry_self = app.modules.returnModule("Registry");
    let txmsg = tx.returnMessage();

    if (conf == 0) {
      //console.log(JSON.parse(JSON.stringify(txmsg)));

      if (!!txmsg && txmsg.module === "Registry") {
        //
        // this is to us, and we are the main registry server
        //
        if (
          tx.isTo(registry_self.publickey) &&
          app.wallet.returnPublicKey() === registry_self.publickey
        ) {
          let request = txmsg.request;
          let identifier = txmsg.identifier;
          let publickey = tx.transaction.from[0].publicKey;
          let unixtime = new Date().getTime();
          let bid = blk.block.id;
          let bsh = blk.returnHash();
          let lock_block = 0;
          let signed_message = identifier + publickey + bid + bsh;
          let sig = registry_self.app.wallet.signMessage(signed_message);
          let signer = this.publickey;
          let lc = 1;

          // servers update database
          let res = await registry_self.addRecord(
            identifier,
            publickey,
            unixtime,
            bid,
            bsh,
            lock_block,
            sig,
            signer,
            1
          );
          let fee = tx.returnPaymentTo(registry_self.publickey);

          // send message
          if (res == 1) {
            let newtx = registry_self.app.wallet.createUnsignedTransaction(
              tx.transaction.from[0].publicKey,
              0,
              fee
            );
            newtx.msg.module = "Email";
            newtx.msg.origin = "Registry";
            newtx.msg.title = "Address Registration Success!";
            newtx.msg.message =
              "<p>You have successfully registered the identifier: <span class='boldred'>" +
              identifier +
              "</span></p>";
            newtx.msg.identifier = identifier;
            newtx.msg.signed_message = signed_message;
            newtx.msg.signature = sig;

            newtx = registry_self.app.wallet.signTransaction(newtx);
            registry_self.app.network.propagateTransaction(newtx);
          } else {
            let newtx = registry_self.app.wallet.createUnsignedTransaction(
              tx.transaction.from[0].publicKey,
              0.0,
              fee
            );
            newtx.msg.module = "Email";
            newtx.msg.title = "Address Registration Failed!";
            newtx.msg.message =
              "<p>The identifier you requested (<span class='boldred'>" +
              identifier +
              "</span>) has already been registered.</p>";
            newtx.msg.identifier = identifier;
            newtx.msg.signed_message = "";
            newtx.msg.signature = "";

            newtx = registry_self.app.wallet.signTransaction(newtx);
            registry_self.app.network.propagateTransaction(newtx);
          }

          return;
        }
      }

      if (!!txmsg && txmsg.module == "Email") {
        if (tx.transaction.from[0].publicKey == registry_self.publickey) {
          if (tx.transaction.to[0].publicKey == registry_self.app.wallet.returnPublicKey()) {
            if (
              tx.msg.identifier != undefined &&
              tx.msg.signed_message != undefined &&
              tx.msg.signature != undefined
            ) {
              //
              // am email? for us? from the DNS registrar?
              //
              let identifier = tx.msg.identifier;
              let signed_message = tx.msg.signed_message;
              let sig = tx.msg.sig;

              try {
                if (
                  registry_self.app.crypto.verifyMessage(
                    signed_message,
                    sig,
                    registry_self.publickey
                  )
                ) {
                  registry_self.app.keychain.addKey(tx.transaction.to[0].publicKey, {
                    identifier: identifier,
                    watched: true,
                    block_id: blk.block.id,
                    block_hash: blk.returnHash(),
                    lc: 1,
                  });
                } else {
                  registry_self.app.keychain.addKey(tx.transaction.to[0].publicKey, {
                    has_registered_username: false,
                  });
                  console.debug("verification failed for sig : ", tx);
                }
                registry_self.app.connection.emit(
                  "update_identifier",
                  tx.transaction.to[0].publicKey
                );
              } catch (err) {
                console.error("ERROR verifying username registration message: ", err);
              }
            }
          } else {
            if (registry_self.app.wallet.returnPublicKey() != registry_self.publickey) {
              //
              // am email? for us? from the DNS registrar?
              //
              let identifier = tx.msg.identifier;
              let signed_message = tx.msg.signed_message;
              let sig = tx.msg.sig;

              // if i am server, save copy of record
              registry_self.addRecord(
                identifier,
                tx.to[0].publicKey,
                tx.timestamp,
                blk.block.id,
                blk.returnHash(),
                0,
                sig,
                registry_self.publickey
              );

              // if i am a server, i will notify lite-peers of
              console.log("notifying lite-peers of registration!");
              this.notifyPeers(app, tx);
            }
          }
        }
      }
    }
  }

  async addRecord(
    identifier = "",
    publickey = "",
    unixtime = 0,
    bid = 0,
    bsh = "",
    lock_block = 0,
    sig = "",
    signer = "",
    lc = 1
  ) {
    let sql = `INSERT INTO records (identifier,
                                    publickey,
                                    unixtime,
                                    bid,
                                    bsh,
                                    lock_block,
                                    sig,
                                    signer,
                                    lc)
               VALUES ($identifier,
                       $publickey,
                       $unixtime,
                       $bid,
                       $bsh,
                       $lock_block,
                       $sig,
                       $signer,
                       $lc)`;
    let params = {
      $identifier: identifier,
      $publickey: publickey,
      $unixtime: unixtime,
      $bid: Number(bid),
      $bsh: bsh,
      $lock_block: lock_block,
      $sig: sig,
      $signer: signer,
      $lc: lc,
    };
    await this.app.storage.executeDatabase(sql, params, "registry");

    sql =
      "SELECT * FROM records WHERE identifier = $identifier AND publickey = $publickey AND unixtime = $unixtime AND bid = $bid AND bsh = $bsh AND lock_block = $lock_block AND sig = $sig AND signer = $signer AND lc = $lc";
    let rows = await this.app.storage.queryDatabase(sql, params, "registry");
    if (rows.length == 0) {
      return 0;
    } else {
      return 1;
    }
  }

  async onChainReorganization(bid, bsh, lc) {
    var sql = "UPDATE records SET lc = $lc WHERE bid = $bid AND bsh = $bsh";
    var params = { $bid: bid, $bsh: bsh };
    await this.app.storage.executeDatabase(sql, params, "registry");
    return;
  }

  shouldAffixCallbackToModule(modname) {
    if (modname == this.name) {
      return 1;
    }
    if (modname == "Email") {
      return 1;
    }
    return 0;
  }
}

module.exports = Registry;
