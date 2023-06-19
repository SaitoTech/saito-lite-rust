/*********************************************************************************

 ENCRYPT MODULE v.2

 This is a general encryption class that permits on-chain exchange of cryptographic
 secrets, enabling users to communicate with encrypted messages over the blockchain.

 For N > 2 channels, we avoid Diffie-Hellman exchanges *for now* in order to have
 something that is fast to setup, and simply default to having the initiating user
 provide the secret, but only communicating it to members with whom he/she already
 has a shared-secret.

 This module thus does two things:

 1. create Diffie-Hellman key exchanges (2 parties)
 2. distribute keys for Groups using DH-generated keys

 The keys as well as group members / shared keys are saved in the keychain class,
 where they are generally available for any Saito application to leverage.

 *********************************************************************************/
var saito = require("../../lib/saito/saito");
var ModTemplate = require("../../lib/templates/modtemplate");
const Big = require("big.js");

class Encrypt extends ModTemplate {
  constructor(app) {
    super(app);

    this.app = app;
    this.name = "Encrypt";
    this.encrypt = this.loadEncrypt(app);

    this.description = "A Diffie-Hellman encryption tool for Saito";
    this.categories = "Crypto Utilities";

<<<<<<< HEAD
    app.connection.on("encrypt-key-exchange", async (publickey) => {
      console.log("initiating key exchange...");
      await this.initiate_key_exchange(publickey, 0);
=======
    app.connection.on("encrypt-key-exchange", (publickey) => {
      console.log("initiating key exchange...");
      this.initiate_key_exchange(publickey, 0);
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    });

    return this;
  }

<<<<<<< HEAD
  async respondTo(type, obj) {
    let encrypt_self = this;

    if (type == "user-menu") {
      if (obj !== undefined && obj["publickey"] !== undefined) {
        let publickey = obj.publickey;
        let key_exists = encrypt_self.app.keychain.hasPublicKey(publickey);

        if (key_exists) return null;
=======
  respondTo(type, obj) {
    let encrypt_self = this;

    if (type == "user-menu") {
      if (obj?.publickey) {
        if (this.app.keychain.alreadyHaveSharedSecret(obj.publickey) || obj.publickey == this.app.wallet.returnPublicKey()) {
          return null;
        }
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
      }

      return {
        text: "Add Contact",
        icon: "far fa-id-card",
        callback: function (app, publickey) {
          encrypt_self.app.keychain.saveKeys();
          encrypt_self.initiate_key_exchange(publickey, 0);
<<<<<<< HEAD
          //	    encrypt_self.app.connection.emit("stun-create-peer-connection", ([publickey]));
=======
          //      encrypt_self.app.connection.emit("stun-create-peer-connection", ([publickey]));
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
          //
          // TODO - remove if above works
          //
          //let stun_mod = app.modules.returnModule("Stun");
          //stun_mod.createStunConnectionWithPeers([public_key]);
        },
      };
    }
    return super.respondTo(type);
  }

  async handlePeerTransaction(app, newtx = null, peer, mycallback) {
    if (newtx == null) {
      return;
    }
    let message = newtx.returnMessage();
<<<<<<< HEAD
    let encrypt_self = this;

    if (message.request === "diffie hellman key exchange") {
      let tx = new saito.default.transaction(undefined, message.data.tx);
=======

    if (message.request === "diffie hellman key exchange") {
      let tx = new saito.default.transaction(message.data.tx);
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

      let sender = tx.from[0].publicKey;
      let receiver = tx.to[0].publicKey;
      let txmsg = tx.returnMessage();
      let request = txmsg.request; // "request"
      if (app.keychain.alreadyHaveSharedSecret(sender)) {
        return;
      }

      //
      // key exchange requests
      //
      if (txmsg.request == "key exchange request") {
        if (receiver == app.wallet.returnPublicKey()) {
          console.log("\n\n\nYou have accepted an encrypted channel request from " + receiver);
<<<<<<< HEAD
          await encrypt_self.accept_key_exchange(tx, 1, peer);
=======
          this.accept_key_exchange(tx, 1, peer);
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
        }
      }
    }

    if (message.request === "diffie hellman key response") {
<<<<<<< HEAD
      let tx = new saito.default.transaction(undefined, message.data.tx);

      let sender = tx.from[0].publicKey;
      let receiver = tx.to[0].publicKey;
=======
      let tx = new saito.default.transaction(message.data.tx);

      let sender = tx.transaction.from[0].add;
      let receiver = tx.transaction.to[0].add;
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
      let txmsg = tx.returnMessage();
      let request = txmsg.request; // "request"
      if (app.keychain.alreadyHaveSharedSecret(sender)) {
        console.log("Already Have Shared Sectret");
        return;
      }

      //
      // copied from onConfirmation
      //
      let bob_publickey = Buffer.from(txmsg.bob, "hex");

      var senderkeydata = app.keychain.returnKey(sender);

      if (senderkeydata == null) {
        if (app.BROWSER == 1) {
          alert("Cannot find original diffie-hellman keys for key-exchange");
          return;
        }
      }

      let alice_publickey = Buffer.from(senderkeydata.aes_publickey, "hex");
      let alice_privatekey = Buffer.from(senderkeydata.aes_privatekey, "hex");
      let alice = app.crypto.createDiffieHellman(alice_publickey, alice_privatekey);
      let alice_secret = app.crypto.createDiffieHellmanSecret(alice, bob_publickey);

      app.keychain.updateCryptoByPublicKey(
        sender,
        alice_publickey.toString("hex"),
        alice_privatekey.toString("hex"),
        alice_secret.toString("hex")
      );

      //
      //
      //
      this.sendEvent("encrypt-key-exchange-confirm", {
        members: [sender, app.wallet.returnPublicKey()],
      });
      this.saveEncrypt();
    }
  }

<<<<<<< HEAD
  async onPeerHandshakeComplete(app, peer) {
=======
  onPeerHandshakeComplete(app, peer) {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    if (app.BROWSER == 0) {
      return;
    }

    //
    // try to connect with friends in pending list
    //
    if (this.encrypt) {
      if (this.encrypt.pending) {
        for (let i = 0; i < this.encrypt.pending.length; i++) {
          await this.initiate_key_exchange(this.encrypt.pending[i]);
        }
        this.encrypt.pending = [];
        this.saveEncrypt();
      }
    }

    //
    // check if we have a diffie-key-exchange with peer
    //
    //if (peer.peer.publickey != "") {
    //  if (!app.keychain.hasSharedSecret(peer.peer.publickey)) {
    //  this.initiate_key_exchange(peer.peer.publickey, 1, peer);  // offchain diffie-hellman with server
    //  }
    //}
  }

  //
  // recipients can be a string (single address) or an array (multiple addresses)
  //
<<<<<<< HEAD
  async initiate_key_exchange(recipients, offchain = 0, peer = null) {
=======
  initiate_key_exchange(recipients, offchain = 0, peer = null) {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    let recipient = "";
    let parties_to_exchange = 2;

    if (Array.isArray(recipients)) {
      if (recipients.length > 0) {
        recipients.sort();
        recipient = recipients[0];
        parties_to_exchange = recipients.length;
      } else {
        recipient = recipients;
        parties_to_exchange = 2;
      }
    } else {
      recipient = recipients;
      parties_to_exchange = 2;
    }

    console.log("recipient is: " + recipient);
    if (recipient == "") {
      return;
    }

    let tx = null;
    try {
<<<<<<< HEAD
      tx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(
        recipient,
        parties_to_exchange * this.app.wallet.default_fee
=======
      tx = this.app.wallet.createUnsignedTransactionWithDefaultFee(
        recipient,
        parties_to_exchange * this.app.wallet.wallet.default_fee
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
      );
    } catch (err) {
      console.log("error: " + err);
    }

    //
    // we had an issue creating the transaction, try zero-fee
    //
    if (!tx) {
      console.log("zero fee tx creating...");
      tx = await this.app.wallet.createUnsignedTransaction(recipient, 0.0, 0.0);
    }

    tx.msg.module = this.name;
    tx.msg.request = "key exchange request";
    tx.msg.alice_publickey = this.app.keychain.initializeKeyExchange(recipient);

    //
    // does not currently support n > 2
    //
    if (parties_to_exchange > 2) {
      for (let i = 1; i < parties_to_exchange; i++) {
        tx.transaction.to.push(new saito.default.slip(recipients[i], 0.0));
      }
    }

    await tx.sign();
    //
    //
    //
    if (offchain == 0) {
      await this.app.network.propagateTransaction(tx);
    } else {
      let data = {};
      data.module = "Encrypt";
      data.tx = tx;
      await this.app.network.sendRequestAsTransaction("diffie hellman key exchange", data, peer);
    }
    this.saveEncrypt();
  }

<<<<<<< HEAD
  async accept_key_exchange(tx, offchain = 0, peer = null) {
=======
  accept_key_exchange(tx, offchain = 0, peer = null) {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    let txmsg = tx.returnMessage();

    let remote_address = tx.from[0].publicKey;
    let our_address = tx.to[0].publicKey;
    let alice_publickey = txmsg.alice_publickey;

    let fee = tx.to[0].amount;

    let bob = this.app.crypto.createDiffieHellman();
    let bob_publickey = bob.getPublicKey(null, "compressed").toString("hex");
    let bob_privatekey = bob.getPrivateKey(null, "compressed").toString("hex");
    let bob_secret = this.app.crypto.createDiffieHellmanSecret(
      bob,
      Buffer.from(alice_publickey, "hex")
    );

    var newtx = await this.app.wallet.createUnsignedTransaction(remote_address, 0, fee);
    if (newtx == null) {
      return;
    }
    newtx.msg.module = "Encrypt";
    newtx.msg.request = "key exchange confirm";
    newtx.msg.tx_id = tx.transaction.id; // reference id for parent tx
    newtx.msg.bob = bob_publickey;
<<<<<<< HEAD
    await newtx.sign();
=======
    newtx = this.app.wallet.signTransaction(newtx);
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

    if (offchain == 0) {
      await this.app.network.propagateTransaction(newtx);
    } else {
      let data = {};
      data.module = "Encrypt";
      data.tx = newtx;
      console.log("sending request on network");
      this.app.network.sendPeerRequest("diffie hellman key response", data, peer);
    }

    this.app.keychain.updateCryptoByPublicKey(
      remote_address,
      bob_publickey.toString("hex"),
      bob_privatekey.toString("hex"),
      bob_secret.toString("hex")
    );
    this.sendEvent("encrypt-key-exchange-confirm", { members: [remote_address, our_address] });
    this.saveEncrypt();
  }

<<<<<<< HEAD
  async onConfirmation(blk, tx, conf) {
    let encrypt_self = this.app.modules.returnModule("Encrypt");
=======
  onConfirmation(blk, tx, conf, app) {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

    if (conf == 0) {
      console.log("ENCRYPT ONCONF");

<<<<<<< HEAD
      if (tx.from[0].publicKey === this.publicKey) {
        encrypt_self.sendEvent("encrypt-key-exchange-confirm", {
          members: [tx.to[0].publicKey, tx.from[0].publicKey],
        });
      }
      if (tx.to[0].publicKey === this.publicKey) {
        let sender = tx.from[0].publicKey;
        let receiver = tx.to[0].publicKey;
        let txmsg = tx.returnMessage();
        let request = txmsg.request; // "request"
        if (this.app.keychain.alreadyHaveSharedSecret(sender)) {
=======
      if (tx.transaction.from[0].add == app.wallet.returnPublicKey()) {
        this.sendEvent("encrypt-key-exchange-confirm", {
          members: [tx.transaction.to[0].add, tx.transaction.from[0].add],
        });
      }
      if (tx.transaction.to[0].add === app.wallet.returnPublicKey()) {
        let sender = tx.transaction.from[0].add;
        let receiver = tx.transaction.to[0].add;
        let txmsg = tx.returnMessage();
        let request = txmsg.request; // "request"
        if (app.keychain.alreadyHaveSharedSecret(sender)) {
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
          return;
        }

        //
        // key exchange requests
        //
        if (txmsg.request == "key exchange request") {
          if (sender == this.publicKey) {
            console.log("\n\n\nYou have sent an encrypted channel request to " + receiver);
          }
          if (receiver == this.publicKey) {
            console.log("\n\n\nYou have accepted an encrypted channel request from " + receiver);
<<<<<<< HEAD
            await encrypt_self.accept_key_exchange(tx);
=======
            this.accept_key_exchange(tx);
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
          }
        }

        //
        // key confirm requests
        //
        if (txmsg.request == "key exchange confirm") {
          let bob_publickey = Buffer.from(txmsg.bob, "hex");

<<<<<<< HEAD
          var senderkeydata = this.app.keychain.returnKey(sender);
=======
          var senderkeydata = app.keychain.returnKey(sender);
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
          if (senderkeydata == null) {
            if (app.BROWSER == 1) {
              alert("Cannot find original diffie-hellman keys for key-exchange");
              return;
            }
          }
          let alice_publickey = Buffer.from(senderkeydata.aes_publickey, "hex");
          let alice_privatekey = Buffer.from(senderkeydata.aes_privatekey, "hex");
<<<<<<< HEAD
          let alice = this.app.crypto.createDiffieHellman(alice_publickey, alice_privatekey);
          let alice_secret = this.app.crypto.createDiffieHellmanSecret(alice, bob_publickey);
          this.app.keychain.updateCryptoByPublicKey(
=======
          let alice = app.crypto.createDiffieHellman(alice_publickey, alice_privatekey);
          let alice_secret = app.crypto.createDiffieHellmanSecret(alice, bob_publickey);
          app.keychain.updateCryptoByPublicKey(
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
            sender,
            alice_publickey.toString("hex"),
            alice_privatekey.toString("hex"),
            alice_secret.toString("hex")
          );

          //
          //
          //
<<<<<<< HEAD
          encrypt_self.sendEvent("encrypt-key-exchange-confirm", {
            members: [sender, this.publicKey],
          });
          encrypt_self.saveEncrypt();
=======
          this.sendEvent("encrypt-key-exchange-confirm", {
            members: [sender, app.wallet.returnPublicKey()],
          });
          this.saveEncrypt();
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
        }
      }
    }
  }

  saveEncrypt() {
    this.app.options.encrypt = this.encrypt;
    this.app.storage.saveOptions();
  }

  loadEncrypt() {
    if (this.app.options.encrypt) {
      this.encrypt = this.app.options.encrypt;
    } else {
      this.encrypt = {};
      this.encrypt.pending = [];
    }

    return this.encrypt;
  }
}

module.exports = Encrypt;
