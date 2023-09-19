const ModTemplate = require("./../../lib/templates/modtemplate");
const RegisterUsernameOverlay = require("./lib/register-username");
const PeerService = require("saito-js/lib/peer_service").default;

////////////////////////////////////////////////////////
//
// IMPORTANT CHANGES WASM  -- Daniel 28/07
//
// Fees are dropped because transaction no longer has returnPaymentTo() function
//
// This is probably bad idea and should be fixed later
//
///////////////////////////////////////////////////////

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
    this.registry_publickey = "zYCCXRZt2DyPD9UmxRfwFgLTNAqCd5VE8RuNneg4aNMK";

    //
    // we could save the cached keys here instead of inserting them
    // into our wallet / keychain ? perhaps that would be a much more
    // efficient way of handling things that stuffing the wallet with
    // the information of strangers....
    //
    this.cached_keys = {};

    //Set True for testing locally
    this.local_dev = true;

    //
    // event listeners -
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
        console.log("Registry callback: ", answer);

        Object.entries(answer).forEach(([key, value]) => {
          if (value !== this.publicKey) {
            this.cached_keys[key] = value;

            //
            // We don't NEED or WANT to filter for key == wallet.getPublicKey
            // If the key is in our keychain, we obviously care enough that we
            // want to update that key in the keychain!
            //

            // save if locally stored
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

  async initialize(app) {
    await super.initialize(app);

    if (this.app.BROWSER == 0) {
      if (this.local_dev) {
        this.registry_publickey = this.publicKey;
      }
    }

    console.log("Registry Address: " + this.registry_publickey);
  }

  returnServices() {
    let services = [];
    //
    // until other nodes are mirroring the DNS directory and capable of feeding out
    // responses to inbound requests for DNS queries, only services that are actually
    // registering domains should report they run the registry module.
    //
    if (this.app.BROWSER == 0) {
      if (this.registry_publickey == this.publicKey) {
        services.push(new PeerService(null, "registry", "saito"));
        console.log("I am the Registry!");
      }
    }
    return services;
  }


  //
  // fetching identifiers
  //
  fetchManyIdentifiers(publickeys = [], mycallback = null) {
    if (mycallback == null) {
      return;
    }

    const found_keys = {};
    const missing_keys = [];

    console.log("Registry: fetchManyIdentifiers", publickeys);

    publickeys.forEach((publickey) => {
      const identifier = this.app.keychain.returnIdentifierByPublicKey(publickey);
      if (identifier.length > 0) {
        found_keys[publickey] = identifier;
      } else {
        missing_keys.push(`'${publickey}'`);
      }
    });

    if (missing_keys.length == 0) {
      console.log("No missing keys");
      if (mycallback) {
        mycallback(found_keys);
      }
      return;
    }

    const where_statement = `publickey in (${missing_keys.join(",")})`;
    const sql = `SELECT *
                 FROM records
                 WHERE ${where_statement}`;

    console.log(sql);

    this.sendPeerDatabaseRequestWithFilter(
      "Registry",

      sql,

      (res) => {
        try {
          console.log("Registry Database results: ", res);
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
      }
    );
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

  onPeerServiceUp(app, peer, service = {}) {
    if (!app.BROWSER) {
      return;
    }

    //Update our key for the active register service node
    if (service.service === "registry") {
      this.registry_publickey = peer.publicKey;
      console.log("We are using " + this.registry_publickey + " for the Registry");
    }
  }

  async onPeerHandshakeComplete(app, peer) {
    /***** USE VARIABLE TO TOGGLE LOCAL DEV MODE ******
    if (this.local_dev) {
      if (this.app.options.server != undefined) {
        this.registry_publickey = this.publicKey;
      } else {
        this.registry_publickey = peer.publicKey;
      }
      console.log("WE ARE USING LOCAL NODE: " + this.registry_publickey);
    }
    */
  }

  async onConfirmation(blk, tx, conf) {
    let txmsg = tx.returnMessage();

    if (conf == 0) {
      if (!!txmsg && txmsg.module === "Registry") {
        console.log("Registry TX: ", txmsg);
        console.log(tx.toJson());
        //
        // this is to us, and we are the main registry server
        //
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
            newtx.msg.signed_message = "";
            newtx.msg.signature = "";
          }

          await newtx.sign();
          await this.app.network.propagateTransaction(newtx);

          console.log(newtx);

          return;
        }
      }

      if (!!txmsg && txmsg.module == "Email") {
        console.log("Registry Response TX: ", txmsg);
        console.log(tx.toJson());

        if (tx.from[0].publicKey == this.registry_publickey) {
          if (tx.to[0].publicKey == this.publicKey) {
            if (txmsg.identifier && txmsg.signed_message && txmsg.signature) {
              console.log("Process Registry Response TX");
              //
              // am email? for us? from the DNS registrar?
              //
              let identifier = tx.msg.identifier;
              let signed_message = tx.msg.signed_message;
              let sig = tx.msg.signature;

              try {
                if (this.app.crypto.verifyMessage(signed_message, sig, this.registry_publickey)) {
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
                } else {
                  this.app.keychain.addKey(tx.to[0].publicKey, {
                    has_registered_username: false,
                  });
                  console.debug("verification failed for sig : ", tx);
                }
                this.app.browser.updateAddressHTML(tx.to[0].publicKey, identifier);
                this.app.connection.emit("update_identifier", tx.to[0].publicKey);
              } catch (err) {
                console.error("ERROR verifying username registration message: ", err);
              }
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
