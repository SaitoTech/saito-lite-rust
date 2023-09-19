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
    // if you are not this publickey, but you have a peer with this 
    // publickey, the module will fire off a request to check whether it 
    // has any specific addresses if it is asked for information on an
    // address that it does not have
    //
    this.parent_publickey = "zYCCXRZt2DyPD9UmxRfwFgLTNAqCd5VE8RuNneg4aNMK";

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
    //
    this.local_dev = false;
    this.local_dev = true;

    //
    // EVENTS
    //
    // Saito Registry module supports two main events, one that fetches identifiers from 
    // the DNS service and then updates the DOM, and a second that starts the registration
    // process by showing a popup. The first is the entry point for most applications.
    //
    this.app.connection.on("registry-fetch-identifiers-and-update-dom", async (keys) => {

      let unidentified_keys = [];

      console.log("registry-fetch-identifiers-and-update-dom", keys);

      for (let i = 0; i < keys.length; i++) {
        if (this.cached_keys[keys[i]]) {
          this.app.browser.updateAddressHTML(keys[i], this.cached_keys[keys[i]]);
        } else {
          unidentified_keys.push(keys[i]);
        }
      }

      this.fetchManyIdentifiers(unidentified_keys, (answer) => {

console.log("FETCHED REGISTRY IDENTIFIERS: " + JSON.stringify(answer));

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
      if (this.local_dev) { this.registry_publickey = this.publicKey; }
    }

  }

  //
  // let people know we have a registry
  //
  returnServices() {
    let services = [];
    if (this.app.BROWSER == 0) { services.push(new PeerService(null, "registry", "saito")); }
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
      if (identifier.length > 0) {
        found_keys[publickey] = identifier;
      } else {
        missing_keys.push(`${publickey}`);
      }
    });

    if (missing_keys.length == 0) {
      if (mycallback) {
        mycallback(found_keys);
      }
      return;
    } else {
      console.log("we are missing: " + JSON.stringify(missing_keys));
    }


    if (1) {

      this.queryKeys(this.peers[0], missing_keys, function(identifiers) {
        for (let key in identifiers) {
	  registry_self.cached_keys[key] = identifiers[key];
	  found_keys[key] = identifiers[key];;
	}
	mycallback(found_keys);
      });

    } else {

      //
      // 
      //
      const where_statement = `publickey in ("${missing_keys.join('","')}")`;
      const sql = `SELECT *
                   FROM records
                   WHERE ${where_statement}`;

      this.sendPeerDatabaseRequestWithFilter(
        "Registry",
        sql,
        (res) => {
          try {
            if (!res.err) {
              if (res?.rows?.length > 0) {
                res.rows.forEach((row) => {
                  const { publickey, identifier, bid, bsh, lc } = row;
                  found_keys[publickey] = identifier;
                });
              }
            }
            mycallback(found_keys);
          } catch (err) {
            console.error(err);
          }
        },
        (p) => {
  	  if (p.hasService("registry")) { return 1; }
	  return 0;
        }
      );

    }
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
    let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);
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
      newtx.msg.request = "register";
      newtx.msg.identifier = identifier + domain;

      newtx.addTo(this.registry_publickey);

      await newtx.sign();
      await this.app.network.propagateTransaction(newtx);

      console.log(newtx);

      // sucessful send
      return true;
    } else {
      throw TypeError("identifier must be a string");
    }
  }



  queryKeys(peer, keys, mycallback) {

    let data = {
      request: "registry query",
      keys: keys,
    };
    this.app.network.sendRequestAsTransaction(
      "registry query",
      data,
      function (res) {
        mycallback(res);
      },
      peer.peerIndex
    );
  }


  onPeerServiceUp(app, peer, service = {}) {

    if (!app.BROWSER) {
      return;
    }

    if (service.service === "registry") {
      this.peers.push(peer);
    }

    //
    // if we have instructed the server to run this application locally then we
    // want browsers (connecting to the server) to update their registry publickey
    // so the publickey of the server.
    //
    if (this.local_dev) {
      if (service.service === "registry") {
        this.registry_publickey = peer.publicKey;
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

    if (newtx == null) { return; }
    let txmsg = newtx.returnMessage();
    if (!txmsg?.data) { return; }

    if (txmsg.data.request === "registry query") {
      let keys = txmsg?.data?.keys;
console.log("received remote request for keys");
console.log("cached: " + JSON.stringify(this.cached_keys));
      this.fetchIdentifiersFromDatabase(keys, mycallback);
      return;
    }

    await super.handlePeerTransaction(app, newtx, peer, mycallback);

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
          console.log("Process Registry TX");
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
            console.log("Identifier successfully registered");
            newtx.msg.module = "Email";
            newtx.msg.origin = "Registry";
            newtx.msg.title = "Address Registration Success!";
            newtx.msg.message =
              "<p>You have successfully registered the identifier: <span class='boldred'>" +
              identifier +
              "</span></p>";
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
            console.log("Identifier registration failed");
            newtx.msg.module = "Email";
            newtx.msg.title = "Address Registration Failed!";
            newtx.msg.message =
              "<p>The identifier you requested (<span class='boldred'>" +
              identifier +
              "</span>) has already been registered.</p>";
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

          console.log(newtx);

          return;
        }
      }

      ////////////////////////////////////////
      // OTHER SERVERS - mirror central DNS //
      ////////////////////////////////////////
      if (!!txmsg && txmsg.module == "Email") {
        console.log("Registry Response TX: ", txmsg);
        console.log(tx.toJson());

        if (tx.from[0].publicKey == this.registry_publickey) {

console.log("received message from publickey that should register!");

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

console.log("and it verifies!");

	      if (this.publicKey != this.registry_publickey) {

console.log("and we are not that server!!!! so adding!");

		if (!this.app.BROWSER) {

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

	        }

                if (tx.to[0].publicKey == this.publicKey) {

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

  async fetchIdentifiersFromDatabase(keys, mycallback=null) {

    let found_keys = {};
    let missing_keys = [];

    let myregexp = new RegExp('^([a-zA-Z0-9])*$');
    for (let i = 0; i < keys.length; i++) {
      if (!myregexp.test(keys[i])) { return false; }
      if (this.returnCachedIdentifier(keys[i])) {
        found_keys[keys[i]] = this.returnCachedIdentifier(keys[i]);
        keys.splice(i, 1);
	i--;
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
          for (let i = 0, k = 0; i < rows.length; i++) {
            const { publickey, identifier, bid, bsh, lc } = row;
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
    let found_check = [];
    for (let key in found_keys) { found_check.push(key); }
    for (let i = 0; i < keys.length; i++) {
      if (!found_check.includes(keys[i])) {
	missing_keys.push(keys[i]);
      }
    }

    //
    // return what we know about
    //
/**** potentially useful for debugging, sets cached version ot random first time fetched
let count = 0;
for (let key in found_keys) {
  count++;
}
if (count == 0) {
console.log("keys updating...");
  for (let i = 0; i < keys.length; i++) {
    found_keys[keys[i]] = Math.random();
    this.cached_keys[keys[i]] = found_keys[keys[i]];
  }
}
****/

    if (mycallback) { mycallback(found_keys); }


    //
    // if we were asked about any missing keys, ask our parent server
    //
    for (let i = 0; i < this.peers.length; i++) {
      if (this.peers[i].publicKey == this.parent_publickey) {
	// ask the parent for the missing values, cache results
        this.queryKeys(this.peers[i], missing_keys, function(res) {
	  for (let key in res) {
	    if (res[key] != key) {
	      this.cached_keys[key] = res[key];
	    }
	  }
	});
      }
    }

    //
    // every 1 in 500 times, clear cache
    //
    if (Math.random() < 0.005) {
      this.cached_keys = {};
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
