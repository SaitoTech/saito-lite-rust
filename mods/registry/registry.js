const ModTemplate = require("./../../lib/templates/modtemplate");
const RegisterUsernameOverlay = require("./lib/register-username");
const PeerService = require("saito-js/lib/peer_service").default;

class Registry extends ModTemplate {
  constructor(app) {
    super(app);

    this.app = app;
    this.name = "Registry";
    this.description = "Saito DNS support";
    this.categories = "Core Utilities Messaging";

    //
    // master DNS publickey for this module
    //
    this.registry_publickey = "zYCCXRZt2DyPD9UmxRfwFgLTNAqCd5VE8RuNneg4aNMK";

    //
    // peers
    //
    this.peers = [];

    //
    // we keep an in-memory list of cached keys to avoid the need for contant
    // database lookups. this is used primarily by browsers but also by servers
    // to avoid the need for database hits on simple DNS queries.
    //
    // this set of cached keys is updated by the browser in fetchManyIdentifiers()
    // after it gets a response from the server. It is updated by the server in
    // handlePeerTransaction() when it fields a request from the browser.
    //
    // servers will periodically remove content
    //
    this.cached_keys = {};

    //
    // we keep a copy of our own publicKey for convenience. this is set in
    // super.initialize(app).
    //
    this.publicKey = "";

    //
    // set true for testing locally
    // All it does is allows both main nodes and lite clients to update
    // this.registry_publickey with the public key of the main node
    //
    this.local_dev = 0;

    //
    // EVENTS
    //
    // Saito Registry module supports two main events, one that fetches identifiers from
    // the DNS service and then updates the DOM, and a second that starts the registration
    // process by showing a popup. The first is the entry point for most applications.
    //
    this.app.connection.on("registry-fetch-identifiers-and-update-dom", async (keys) => {
      let unidentified_keys = [];

      //
      // every 1 in 500 times, clear cache
      //
      if (Math.random() < 0.005) {
        this.cached_keys = {};
      }

      for (let i = 0; i < keys.length; i++) {
        if (this.cached_keys[keys[i]]) {
          this.app.browser.updateAddressHTML(keys[i], this.cached_keys[keys[i]]);
        } else {
          unidentified_keys.push(keys[i]);
        }
      }

      this.fetchManyIdentifiers(unidentified_keys, (answer) => {
        Object.entries(answer).forEach(([key, value]) => {
          if (value !== this.publicKey) {
            this.cached_keys[key] = value;

            //
            // if this is a key that is stored in our keychain, then we want
            // to update the cached value that we have stored there as well
            //
            if (this.app.keychain.returnKey(key, true) && key !== value) {
              this.app.keychain.addKey({ publicKey: key, identifier: value });
            }

            this.app.browser.updateAddressHTML(key, value);
          }
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
      });
    });

    this.app.connection.on("register-username-or-login", (obj) => {
      let key = this.app.keychain.returnKey(this.publicKey);
      if (key?.has_registered_username) {
        return;
      }
      if (!this.register_username_overlay) {
        this.register_username_overlay = new RegisterUsernameOverlay(this.app, this);
      }
      if (obj?.success_callback) {
        this.register_username_overlay.callback = obj.success_callback;
      }
      this.register_username_overlay.render(obj?.msg);
    });

    return this;
  }

  //
  // initialization
  //
  async initialize(app) {
    await super.initialize(app);

    if (this.app.BROWSER == 0) {
      if (this.local_dev) {
        this.registry_publickey = this.publicKey;
        console.log("Registry public key: " + this.registry_publickey);
      }
    }
  }

  //
  // let people know we have a registry
  //
  returnServices() {
    let services = [];

    //
    // So all full nodes can act as a registry of sorts
    // (or at leastreroute requests to the actual registry)
    //
    if (this.app.BROWSER == 0) {
      services.push(new PeerService(null, "registry", "saito"));
    }
    return services;
  }

  //
  // fetching identifiers
  //
  // this function is run on the browsers, triggered by the event that wants to re-write the DOM
  // so it will query the first peer it sees that runs the registry module and ask it for the
  // identifiers
  //
  // this first checks the cache that browsers maintain in their own memory that maps keys to
  // identifiers and only fetches information from the server when that does not work or find
  // an address. this is intended to limit the load on the parent server.
  //
  fetchManyIdentifiers(publickeys = [], mycallback = null) {
    let registry_self = this;

    if (mycallback == null) {
      return;
    }

    const found_keys = {};
    const missing_keys = [];

    publickeys.forEach((publickey) => {
      const identifier = this.app.keychain.returnIdentifierByPublicKey(publickey);

      //returns "" if not found
      if (identifier) {
        found_keys[publickey] = identifier;
      } else {
        missing_keys.push(publickey);
      }
    });

    //console.log("REGISTRY Found: ", found_keys);

    if (missing_keys.length == 0) {
      mycallback(found_keys);
      return;
    }

    //console.log("REGISTRY Missing: ", missing_keys);

    this.queryKeys(this.peers[0], missing_keys, function (identifiers) {
      for (let key in identifiers) {
        registry_self.cached_keys[key] = identifiers[key];
        found_keys[key] = identifiers[key];
      }
      mycallback(found_keys);
    });
  }

  respondTo(type = "") {
    if (type == "saito-return-key") {
      return {
        returnKey: (data = null) => {
          //
          // data might be a publickey, permit flexibility
          // in how this is called by pushing it into a
          // suitable object for searching
          //
          if (typeof data === "string") {
            let d = { publicKey: "" };
            d.publicKey = data;
            data = d;
          }

          //
          // if keys exist
          //
          for (let key in this.cached_keys) {
            if (key === data.publicKey) {
              if (this.cached_keys[key] && key !== this.cached_keys[key]) {
                return { publicKey: key, identifier: this.cached_keys[key] };
              } else {
                return { publicKey: key };
              }
            }
          }

          return null;
        },
      };
    }

    return super.respondTo(type);
  }

  //
  // Creates and sends an on-chain tx to register the identifier @ the domain
  // Throws errors for invalid identifier types
  //
  async tryRegisterIdentifier(identifier, domain = "@saito") {
    let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(
      this.registry_publickey
    );
    if (!newtx) {
      throw Error("NULL TX CREATED IN REGISTRY MODULE");
    }

    if (typeof identifier === "string" || identifier instanceof String) {
      var regex = /^[0-9A-Za-z]+$/;
      if (!regex.test(identifier)) {
        throw Error("Alphanumeric Characters only");
      }
      newtx.msg.module = "Registry";
      newtx.msg.request = "register";
      newtx.msg.identifier = identifier + domain;

      newtx.addTo(this.publicKey);

      await newtx.sign();
      await this.app.network.propagateTransaction(newtx);

      console.log("REGISTRY tx: ", newtx);

      // sucessful send
      return true;
    } else {
      throw TypeError("identifier must be a string");
    }
  }

  /**
   * QueryKeys is a cross network database search for a set of public keys
   * Typically we call it from the browser on the first peer claiming to have a registry service
   */
  queryKeys(peer, keys, mycallback) {
    if (!peer?.peerIndex) {
      return;
    }

    let data = {
      request: "registry query",
      keys: keys,
    };

    //console.log(`REGISTRY queryKeys from ${this.publicKey} to ${peer.publicKey}`);
    this.app.network.sendRequestAsTransaction("registry query", data, mycallback, peer.peerIndex);
  }

  onPeerServiceUp(app, peer, service = {}) {
    if (service.service === "registry") {
      this.peers.push(peer);

      //
      // We want to allow service nodes to connect to each other as registry peers
      // but don't need to do any of the other processing
      //
      if (!app.BROWSER) {
        return;
      }

      //
      // if we have instructed the server to run this application locally then we
      // want browsers (connecting to the server) to update their registry publickey
      // so the publickey of the server.
      //

      if (this.local_dev) {
        this.registry_publickey = peer.publicKey;
      }

      console.log(
        `Registry connected: ${peer.publicKey} and/but using: ${this.registry_publickey}`
      );

      let myKey = app.keychain.returnKey(this.publicKey, true);
      if (myKey?.identifier) {
        let registry_self = this;

        this.queryKeys(peer, [this.publicKey], function (identifiers) {
          console.log(
            "REGISTRY lookup: " + registry_self.publicKey + " in " + peer.publicKey,
            identifiers
          );
          for (let key in identifiers) {
            if (key == myKey.publicKey) {
              if (identifiers[key] !== myKey.identifier) {
                console.log("REGISTRY: Identifier mismatch...");
                console.log(
                  `REGISTRY: Expecting ${myKey.identifier}, but Registry has ${identifiers[key]}`
                );
                //Maybe we do an update here???
              } else {
                console.log("REGISTRY: Identifier checks out");
                //Identifier checks out!
              }
              return;
            }
          }

          //
          //Make sure that we actually checked the right source
          //
          if (peer.publicKey == registry_publickey.registry_publickey){
            let identifier = myKey.identifier.split("@");
            if (identifier.length !== 2) {
              console.log("REGISTRY: Invalid identifier", myKey.identifier);
              return;
            }
            registry_self.tryRegisterIdentifier(identifier[0], "@" + identifier[1]);
            console.log("REGISTRY: Attempting to register our name again");
          }
        });
      } else if (myKey.has_registered_username) {
        console.log("REGISTRY: unset registering... status");
        this.app.keychain.addKey(this.publicKey, { has_registered_username: false });
        this.app.connection.emit("update_identifier", this.publicKey);
      }
    }
  }

  /////////////////////////////
  // HANDLE PEER TRANSACTION //
  /////////////////////////////
  //
  // data queries hit here
  //
  async handlePeerTransaction(app, newtx = null, peer, mycallback = null) {
    if (newtx == null) {
      return;
    }
    let txmsg = newtx.returnMessage();
    if (!txmsg?.data) {
      return;
    }

    if (txmsg.data.request === "registry query") {
      let keys = txmsg?.data?.keys;
      this.fetchIdentifiersFromDatabase(keys, mycallback);
      return;
    }

    if (txmsg.data.request === "registry namecheck") {
      let identifier = txmsg?.data?.identifier;
      this.checkIdentifierInDatabase(identifier, mycallback);
      return;
    }

    return await super.handlePeerTransaction(app, newtx, peer, mycallback);
  }

  //
  // There are TWO types of requests that this module will process on-chain. The first is
  // the request to REGISTER a @saito address. This will only be processed by the node that
  // is running the publickey identified in this module as the "registry_publickey".
  //
  // The second is a confirmation that the node running the domain broadcasts into the network
  // with a proof-of-registration. All nodes that run the DNS service should listen for
  // these messages and add the records into their own copy of the database, along with the
  // signed proof-of-registration.
  //
  async onConfirmation(blk, tx, conf) {
    let txmsg = tx.returnMessage();

    if (conf == 0) {
      if (!!txmsg && txmsg.module === "Registry") {
        /////////////////////////////////////////
        // REGISTRATION REQUESTS - main server //
        /////////////////////////////////////////
        if (tx.isTo(this.publicKey) && this.publicKey === this.registry_publickey) {
          let identifier = txmsg.identifier;
          let publickey = tx.from[0].publicKey;
          let unixtime = new Date().getTime();
          let bid = blk.id;
          let bsh = blk.hash;
          let lock_block = 0;
          let signed_message = identifier + publickey + bid + bsh;
          let sig = this.app.crypto.signMessage(
            signed_message,
            await this.app.wallet.getPrivateKey()
          );
          //this.app.wallet.signMessage(signed_message);
          let signer = this.registry_publickey;
          let lc = 1;

          // servers update database
          let res = await this.addRecord(
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
          let fee = BigInt(0); //tx.returnPaymentTo(this.publicKey);

          let newtx = await this.app.wallet.createUnsignedTransaction(
            tx.from[0].publicKey,
            BigInt(0),
            fee
          );

          // send message
          if (res == 1) {
            newtx.msg.module = "Email";
            newtx.msg.origin = "Registry";
            newtx.msg.title = "Address Registration Success!";
            newtx.msg.identifier = identifier;
            newtx.msg.publickey = publickey;
            newtx.msg.unixtime = unixtime;
            newtx.msg.bid = bid;
            newtx.msg.bsh = bsh;
            newtx.msg.lock_block = lock_block;
            newtx.msg.bsh = unixtime;
            newtx.msg.signer = signer;
            newtx.msg.signed_message = signed_message;
            newtx.msg.signature = sig;
          } else {
            newtx.msg.module = "Email";
            newtx.msg.title = "Address Registration Failed!";
            newtx.msg.identifier = identifier;
            newtx.msg.publickey = publickey;
            newtx.msg.unixtime = unixtime;
            newtx.msg.bid = bid;
            newtx.msg.bsh = bsh;
            newtx.msg.lock_block = lock_block;
            newtx.msg.bsh = unixtime;
            newtx.msg.signer = signer;
            newtx.msg.signed_message = "";
            newtx.msg.signature = "";
          }

          await newtx.sign();
          await this.app.network.propagateTransaction(newtx);

          return;
        }
      }

      ////////////////////////////////////////
      // OTHER SERVERS - mirror central DNS //
      ////////////////////////////////////////
      if (!!txmsg && txmsg.module == "Email") {
        console.log("REGISTRY: " + txmsg.title);

        if (tx.from[0].publicKey == this.registry_publickey) {
          try {
            //
            // am email? for us? from the DNS registrar?
            //
            let identifier = tx.msg.identifier;
            let signed_message = tx.msg.signed_message;
            let sig = tx.msg.signature;
            let bid = tx.msg.bid;
            let bsh = tx.msg.bsh;
            let unixtime = tx.msg.unixtime;
            let lock_block = tx.msg.lock_block;
            let signer = tx.msg.signer;
            let lc = 1;

            if (this.app.crypto.verifyMessage(signed_message, sig, this.registry_publickey)) {
              if (this.publicKey != this.registry_publickey) {
                // servers update database
                if (!this.app.BROWSER) {
                  let res = await this.addRecord(
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
                }

                if (tx.isTo(this.publicKey)) {
                  this.app.keychain.addKey(tx.to[0].publicKey, {
                    identifier: identifier,
                    watched: true,
                    block_id: blk.id,
                    block_hash: blk.hash,
                    lc: 1,
                  });
                  console.info("***********************");
                  console.info("verification success for : " + identifier);
                  console.info("***********************");

                  this.app.browser.updateAddressHTML(tx.to[0].publicKey, identifier);
                  this.app.connection.emit("update_identifier", tx.to[0].publicKey);
                }
              }
            }
          } catch (err) {
            console.error("ERROR verifying username registration message: ", err);
          }
        }
      }
    }
  }

  returnCachedIdentifier(key) {
    if (this.cached_keys[key]) {
      if (this.cached_keys[key] !== key) {
        return this.cached_keys[key];
      }
    }
    return "";
  }

  /*
   * Lightly recursive, server side code to look up keys in the registry database
   * Invoked through a peer request.
   * Any requested keys not found are passed on to any peers with the DNS publickey
   */
  async fetchIdentifiersFromDatabase(keys, mycallback = null) {
    let found_keys = {};
    let missing_keys = [];

    let myregexp = new RegExp("^([a-zA-Z0-9])*$");
    for (let i = keys.length - 1; i >= 0; i--) {
      if (!myregexp.test(keys[i])) {
        keys.splice(i, 1);
        continue;
      }
      if (this.returnCachedIdentifier(keys[i])) {
        found_keys[keys[i]] = this.returnCachedIdentifier(keys[i]);
        keys.splice(i, 1);
      }
    }

    //
    // check database if needed
    //
    if (keys.length > 0) {
      const where_statement = `publickey in ("${keys.join('","')}")`;
      const sql = `SELECT * 
                   FROM records
                   WHERE ${where_statement}`;

      let rows = await this.app.storage.queryDatabase(sql, {}, "registry");
      if (rows != undefined) {
        if (rows.length > 0) {
          for (let i = 0; i < rows.length; i++) {
            //const { publickey, identifier, bid, bsh, lc } = rows[i];
            let publickey = rows[i].publickey;
            let identifier = rows[i].identifier;
            if (identifier !== publickey) {
              found_keys[publickey] = identifier;
              // and add to the cache for faster responsiveness in future
              this.cached_keys[publickey] = identifier;
            }
          }
        }
      }
    }

    //
    // which keys are we missing ?
    //
    let found_check = Object.keys(found_keys);

    for (let key of keys) {
      if (!found_check.includes(key)) {
        missing_keys.push(key);
      }
    }

    if (mycallback) {
      mycallback(found_keys);
    }

    //
    // Fallback because browsers don't automatically have DNS as a peer
    //
    if (missing_keys.length > 0 && this.publicKey !== this.registry_publickey) {
      //
      // if we were asked about any missing keys, ask our parent server
      //
      for (let i = 0; i < this.peers.length; i++) {
        if (this.peers[i].publicKey == this.registry_publickey) {
          // ask the parent for the missing values, cache results
          this.queryKeys(this.peers[i], missing_keys, (res) => {
            let more_keys = {};
            for (let key in res) {
              if (res[key] != key) {
                this.cached_keys[key] = res[key];
                more_keys[key] = res[key];
              }
            }
            if (mycallback) {
              mycallback(more_keys);
            }
          });
          return;
        }
      }
    }
  }

  async checkIdentifierInDatabase(identifier, mycallback = null) {

    if (!mycallback) {
      console.warn("No callback");
      return;
    }

    if (this.publicKey == this.registry_publickey) {
      const sql = `SELECT * FROM records WHERE identifier = ?`;

      let rows = await this.app.storage.queryDatabase(sql, [identifier], "registry");

      mycallback(rows);

    } else {
      
      await this.sendPeerDatabaseRequestWithFilter(
        "Registry",
        `SELECT * FROM records WHERE identifier = "${identifier}"`,
        (res) => {
          mycallback(res?.rows);
        },
      
        (p) => {
          if (p.publicKey == this.registry_publickey) {
            return 1;
          }
          return 0;
        }
      );

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

    let res = await this.app.storage.executeDatabase(sql, params, "registry");

    return res?.stmt?.changes;
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
