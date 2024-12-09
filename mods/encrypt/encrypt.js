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

 UPDATE 17-7-23: We had incomplete key exchanges that couldn't be rectified because on
 party would just return out instead of responding to a re-request.

 *********************************************************************************/
var saito = require('../../lib/saito/saito');
var ModTemplate = require('../../lib/templates/modtemplate');
const Transaction = require('../../lib/saito/transaction').default;

class Encrypt extends ModTemplate {
  constructor(app) {
    super(app);

    this.app = app;
    this.name = "Encrypt";
    this.slug = "encrypt";
    this.description = "A Diffie-Hellman encryption tool for Saito";
    this.categories = "Encryption Utilities";
    this.class = 'utility';

    app.connection.on("encrypt-key-exchange", (publicKey) => {
      console.log("initiating key exchange...");
      this.initiate_key_exchange(publicKey, 0);
      salert("Please be patient as this may take some time");
    });

    app.connection.on("encrypt-decryption-failed", (publicKey) => {
      let key = app.keychain.returnKey(publicKey, true);
      if (key && key?.aes_secret){
        siteMessage(`Your encrypted channel with ${publicKey} is broken`, 10000);  
        app.keychain.addKey(publicKey, { encryption_failure: true});
      }
    });

    app.connection.on("encrypt-reset-key-exchange", (publicKey) => {
      siteMessage(`Resetting key exchange with ${publicKey}`, 30000);  
      this.reset_key_exchange(publicKey);
    });


    return this;
  }

  async initialize(app) {
    await super.initialize(app);

    if (app.BROWSER){
      //Clear mistaken broken encryption notices...
      let keys = app.keychain.returnKeys();

      for (let key of keys) {
        delete key.encryption_failure;
      }
    }

  }


  respondTo(type, obj) {
    let encrypt_self = this;

    if (type == "user-menu") {
      if (obj?.publicKey) {
        if (
          this.app.keychain.hasSharedSecret(obj.publicKey) ||
          obj.publicKey == encrypt_self.publicKey
        ) {
          return null;
        }
      }

      return {
        text: "Add Contact",
        icon: "fa-solid fa-user-lock",
        callback: function (app, publicKey) {
          encrypt_self.app.keychain.saveKeys();
          encrypt_self.initiate_key_exchange(publicKey, 0);
          salert("Requesting keys to establish an encrypted channel, please be patient as this may take some time");

          //      encrypt_self.app.connection.emit("stun-create-peer-connection", ([publicKey]));
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

  async onConfirmation(blk, tx, conf) {
    if (conf == 0) {
      console.log("ENCRYPT ONCONF: ", tx);

      if (tx.isTo(this.publicKey)) {
        let sender = tx.from[0].publicKey;
        let receiver = tx.to[0].publicKey;
        let txmsg = tx.returnMessage();
        let request = txmsg.request; // "request"

        //
        // key exchange requests
        //
        if (txmsg.request == "key exchange request") {
          if (sender == this.publicKey) {
            console.log("ENCRYPT: You have sent an encrypted channel request to " + receiver);
          }
          if (receiver == this.publicKey) {
            console.log("ENCRYPT: You have received an encrypted channel request from " + sender);
            this.accept_key_exchange(tx);

          }
        }

        //
        // key confirm requests
        //
        if (txmsg.request == "key exchange confirm") {
          if (sender !== this.publicKey){
            console.log(`ENCRYPT: ${sender} has accepted your encrypted channel request`);
            this.confirm_key_exchange(txmsg.bob, sender); 

          }else{
            console.log("ENCRYPT: You have accepted an encrypted channel request from " + sender);
          }          
        }

        if (txmsg.request == "diffie hellman reset"){
          console.log("ENCRYPTION RESET!");
          this.app.keychain.updateEncryptionByPublicKey(sender, "reset");
        }
      }
    }
  }


  async handlePeerTransaction(app, newtx = null, peer, mycallback) {
    if (newtx == null) {
      return 0;
    }
    let message = newtx.returnMessage();

    if (!message?.request?.includes("diffie hellman")) {
      return super.handlePeerTransaction(app, newtx, peer, mycallback);
    }

    console.log(message);
    let tx = new Transaction(undefined, message.data);
    let sender = tx.from[0].publicKey;
    let receiver = tx.to[0].publicKey;
    let txmsg = tx.returnMessage();


    if (message.request === "diffie hellman key exchange") {

      //
      // key exchange requests
      //
      if (txmsg.request == "key exchange request") {
        if (receiver == this.publicKey) {
          console.log("\n\n\nYou have accepted an encrypted channel request from " + sender);
          this.accept_key_exchange(tx, 1, peer);
        }
      }
    }

    if (message.request === "diffie hellman key response") {
      this.confirm_key_exchange(txmsg.bob, sender);
    }

    if (message.request === "diffie hellman key reset"){
      console.log("ENCRYPTION RESET!");
      this.app.keychain.updateEncryptionByPublicKey(sender, "reset");
    }
  }

  async onPeerHandshakeComplete(app, peer) {
    if (app.BROWSER == 0) {
      return;
    }

    //
    // Try again for partial key exchanges!
    //
    for (let key of this.app.keychain.returnKeys()) {
      if ((key.aes_privatekey || key.aes_publicKey) && !key.aes_secret) {
        console.log("ENCRYPT: attempt key exchange again for: " + key.publicKey);
        this.initiate_key_exchange(key.publicKey, 1);
      }
    }


    //
    // check if we have a diffie-key-exchange with peer
    //
    //if (peer.peer.publicKey != "") {
    //  if (!app.keychain.hasSharedSecret(peer.peer.publicKey)) {
    //  this.initiate_key_exchange(peer.peer.publicKey, 1, peer);  // offchain diffie-hellman with server
    //  }
    //}
  }

  async reset_key_exchange(recipient){
    let tx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(recipient);
    if (!tx){
      return;
    }

    console.log(`${recipient} is sending me encrypted messages!`);

    tx.msg = {
      module: this.name,
      request: "diffie hellman reset",
    };

    await tx.sign();

    this.app.network.propagateTransaction(tx);
    
  }

  /**
  *
  *  Step 1 -- request a key exchange
  * 
  *  recipients can be a string (single address) or an array (multiple addresses)
  */
  async initiate_key_exchange(recipients, offchain = 0, peer = null) {
    let recipient = "";
    let parties_to_exchange = 2;

    if (Array.isArray(recipients)) {
      if (recipients.length > 0) {
        recipients.sort();
        recipient = recipients[0];
        parties_to_exchange = recipients.length;
      }
    } else {
      recipient = recipients;
      parties_to_exchange = 2;
    }

    if (!recipient) {
      return;
    }

    let tx = null;
    try {
      tx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(
        recipient,
        BigInt(0)
        //BigInt(parties_to_exchange * this.app.wallet.default_fee)
      );
    } catch (err) {
      console.log("error: " + err);
    }

    //
    // we had an issue creating the transaction, try zero-fee
    //
    if (!tx) {
      console.log("zero fee tx creating...");
      tx = await this.app.wallet.createUnsignedTransaction(recipient, BigInt(0), BigInt(0));
    }

  
    const alice = this.app.crypto.createDiffieHellman();
    const alice_publicKey = alice.getPublicKey(null, "compressed").toString("hex");
    const alice_privatekey = alice.getPrivateKey(null, "compressed").toString("hex");
    this.app.keychain.updateEncryptionByPublicKey(recipient, alice_publicKey, alice_privatekey, "");

    tx.msg.module = this.name;
    tx.msg.request = "key exchange request";
    tx.msg.alice_publicKey = alice_publicKey;
    tx.addTo(this.publicKey);

    //
    // does not currently support n > 2
    //
    if (parties_to_exchange > 2) {
      for (let i = 1; i < parties_to_exchange; i++) {
        tx.addTo(recipients[i]);
      }
    }

    await tx.sign();

    //
    //
    //
    if (offchain == 0) {
      await this.app.network.propagateTransaction(tx);
    } else {
      this.app.connection.emit("relay-send-message", {
      recipient: recipients,
      request: "diffie hellman key exchange",
      data: tx.toJson(),
    });

    }

  }

  /**
   * Step 2 -- We have been asked to exchange keys
   */ 
  async accept_key_exchange(tx, offchain = 0, peer = null) {

    let txmsg = tx.returnMessage();

    console.log("Encrypt: Accepting key exchange");

    let remote_address = tx.from[0].publicKey;
    let our_address = tx.to[0].publicKey;
    let alice_publicKey = txmsg.alice_publicKey;

    if (this.app.BROWSER == 1) {
      siteMessage(`${this.app.keychain.returnUsername(remote_address, 8)} has added you as a friend`, 5000);
    }

    let fee = BigInt(tx.to[0].amount);

    let bob = this.app.crypto.createDiffieHellman();
    let bob_publicKey = bob.getPublicKey(null, "compressed").toString("hex");
    let bob_privatekey = bob.getPrivateKey(null, "compressed").toString("hex");
    let bob_secret = bob.computeSecret(Buffer.from(alice_publicKey, "hex"));
    //this.app.crypto.createDiffieHellmanSecret(bob, Buffer.from(alice_publicKey, "hex"));

    var newtx = await this.app.wallet.createUnsignedTransaction(
      remote_address,
      BigInt(0),
      BigInt(fee)
    );
    if (newtx == null) {
      return;
    }
    newtx.msg.module = "Encrypt";
    newtx.msg.request = "key exchange confirm";
    newtx.msg.tx_id = tx.id; // reference id for parent tx
    newtx.msg.bob = bob_publicKey;
    newtx.addTo(our_address);
    await newtx.sign();

    if (offchain == 0) {
      await this.app.network.propagateTransaction(newtx);
    } else {
      //let data = {};
      //data.module = "Encrypt";
      //data.tx = newtx;
      //this.app.network.sendPeerRequest("diffie hellman key response", data, peer);
      console.log("Encrypt: sending response on network");

      this.app.connection.emit("relay-send-message", {
        recipient: remote_address,
        request: "diffie hellman key response",
        data: newtx.toJson(),
      });

    }

    this.app.keychain.updateEncryptionByPublicKey(
      remote_address,
      bob_publicKey.toString("hex"),
      bob_privatekey.toString("hex"),
      bob_secret.toString("hex")
    );
    this.app.keychain.addWatchedPublicKey(remote_address);
    this.sendEvent("encrypt-key-exchange-confirm", { members: [remote_address, our_address] });
    
  }


  /**
   * Step 3
   * Process the returned key from the counterparty
   */ 
  async confirm_key_exchange(bob, sender) {
    let bob_publicKey = Buffer.from(bob, "hex");

    var senderkeydata = this.app.keychain.returnKey(sender, true);
    if (senderkeydata == null) {
      if (this.app.BROWSER == 1) {
        alert("Cannot find original diffie-hellman keys for key-exchange");
        return;
      }
    }

    if (this.app.BROWSER == 1) {
      siteMessage(`Successfully added ${this.app.keychain.returnUsername(sender, 8)} as a friend`, 5000);
    }

    this.app.connection.emit('saito-whitelist', {
      address: sender,
      duration: 0
    });

    let alice_publicKey = Buffer.from(senderkeydata.aes_publicKey, "hex");
    let alice_privatekey = Buffer.from(senderkeydata.aes_privatekey, "hex");
    let alice = this.app.crypto.createDiffieHellman(alice_publicKey, alice_privatekey);
    let alice_secret = alice.computeSecret(bob_publicKey);
    //this.app.crypto.createDiffieHellmanSecret(alice, bob_publicKey);

    this.app.keychain.updateEncryptionByPublicKey(
      sender,
      alice_publicKey.toString("hex"),
      alice_privatekey.toString("hex"),
      alice_secret.toString("hex"),
    
    );
    this.app.keychain.addWatchedPublicKey(sender)

    //
    //
    // Create chat group contact
    this.sendEvent("encrypt-key-exchange-confirm", {
      members: [sender, this.publicKey],
    });

  }

}

module.exports = Encrypt;
