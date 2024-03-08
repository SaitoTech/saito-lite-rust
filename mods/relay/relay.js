//const Slip = require("../../lib/saito/slip").default;
const PeerService = require("saito-js/lib/peer_service").default;
const Transaction = require("../../lib/saito/transaction").default;

var ModTemplate = require("../../lib/templates/modtemplate");
//var saito = require("../../lib/saito/saito");
const JSON = require("json-bigint");


/**
 * 
 * Relay is a utility for sending offchain messages
 * 
 * If you just want to send a tx, pass it as a parameter to the event "relay-transaction"
 * 
 * Otherwise, you can send arbitrary data and a request to specified recipients through "relay-send-message",
 * that will wrap your data in a relay transaction. Your module will need to listen for the given request
 * in it's handlePeerTransaction function.
 * 
 */ 

class Relay extends ModTemplate {
  constructor(app) {
    super(app);

    this.app = app;
    this.name = "Relay";
    this.description =
      "Adds support for off-chain, realtime communications channels through relay servers, for mobile users and real-time gaming needs.";
    this.categories = "Utilities Core";
    this.class = 'utility';
    this.description = "Simple Message Relay for Saito";
    this.categories = "Utilities Communications";
    this.debug = false;
    this.busy = false;

    this.stun = null;

    app.connection.on("relay-send-message", async (obj) => {
      this.sendRelayMessage(obj.recipient, obj.request, obj.data);
    });

    app.connection.on("relay-transaction", async (tx) => {
      this.sendRelayTransaction(tx);
    });

    app.connection.on("set-relay-status-to-busy", () => {
      this.busy = true;
    });

  }


  async initialize(app) {
    await super.initialize(app);

    let modList = this.app.modules.returnModulesRespondingTo("peer-manager");
    if (modList.length > 0){
      this.stun = modList[0].respondTo("peer-manager");
    }
  }

  returnServices() {
    let services = [];
    services.push(new PeerService(null, "relay"));
    return services;
  }


  async createRelayTransaction(recipients, message_request, message_data) {

    let peers = [];

    if (recipients === "PEERS") {
      let p = await this.app.network.getPeers();
      for (let i = 0; i < p.length; i++) {
        peers.push(p[i].publicKey);
      }
    }else if (!Array.isArray(recipients)) {
      peers.push(recipients);
    }else{
      peers = recipients;
    }

    let tx = new Transaction();
    tx.addFrom(this.publicKey);

    for (let i = 0; i < peers.length; i++) {
      tx.addTo(peers[i]);
    }

    tx.timestamp = new Date().getTime();
    tx.msg.request = message_request;
    tx.msg.data = message_data;

    // Should we sign the transaction???
    // I ask because the code didn't originally sign it...
    
    return tx;
  }

  async sendRelayTransaction(tx){

    if (tx.to.length == 1 && this.stun) {
      let addressee = tx.to[0].publicKey;
      if (this.stun.hasConnection(addressee)){
        this.stun.sendTransaction(addressee, tx);
        return;
      }
    } 

    let peers = await this.app.network.getPeers();
    for (let i = 0; i < peers.length; i++) {

      // *** NOTE ***
      // tx.msg.data is a json-ready transaction
      // this network function wraps the whole thing within another transaction
      // newtx.msg.data.msg.data = original transactionn
      this.app.network.sendRequestAsTransaction(
        "relay peer message",
        tx.toJson(),
        null,
        peers[i].peerIndex
      );
    }

  }

  //
  // currently a 1-hop function, should abstract to take an array of
  // recipients and permit multi-hop transaction construction.
  //
  async sendRelayMessage(recipients, message_request, message_data) {
    if (!recipients || !message_request){
      console.warn("Invalid relay message:", recipients, message_request, message_data);
      return;
    }
    let newtx = await this.createRelayTransaction(recipients, message_request, message_data);
    await this.sendRelayTransaction(newtx);
  }

  async handlePeerTransaction(app, tx = null, peer, mycallback) {

    if (tx == null) {
      return 0;
    }
    let message = tx.msg;

    try {
      if (tx.isTo(this.publicKey)) {
        if (message.request === "ping") {
          await this.sendRelayMessage(tx.from[0].publicKey, "echo", {
            status: this.busy,
          });
          return 0;
        }

        if (message.request === "echo") {
          if (message.data.status) {
            app.connection.emit("relay-is-busy", tx.from[0].publicKey);
          } else {
            app.connection.emit("relay-is-online", tx.from[0].publicKey);
          }
          return 0;
        }

      }

      if (message.request === "relay peer message") {
        let relayed_tx = new Transaction(null, message.data);

        //
        // sanity check on tx
        //
        await relayed_tx.decryptMessage(app);
        let txjson = relayed_tx.returnMessage();

        if (this.debug) {
          console.log("Relay message: ", message);
          console.log("decrypting relay message");
          console.log("txjson : ", txjson);
        }

        if (!relayed_tx.to[0]?.publicKey) {
          return 0;
        }

        //
        // if interior transaction is intended for me, I process regardless
        //
        if (this.debug) {
          console.log("relay tx to me? " + relayed_tx.isTo(this.publicKey));
        }

        if (relayed_tx.isTo(this.publicKey)) {
          return app.modules.handlePeerTransaction(relayed_tx, peer, mycallback);
        } else {
          // check to see if original tx is for a peer
          let peer_found = 0;

          let peers = await app.network.getPeers();
          for (let i = 0; i < peers.length; i++) {
            if (relayed_tx.isTo(peers[i].publicKey)) {
              peer_found = 1;

              if (this.app.BROWSER == 0) {
                console.log("Relay tx to peer");
                app.network.sendTransactionWithCallback(
                  relayed_tx,
                  async function () {
                    if (mycallback != null) {
                      mycallback({ err: "", success: 1 });
		                }
                    return 1;
                  },
                  peers[i].peerIndex
                );
              }
            }
          }

          if (peer_found == 0) {
            if (mycallback != null) {
              mycallback({ err: "ERROR 141423: peer not found in relay module", success: 0 });
              return 1;
            }
          }
        }
      }
    } catch (err) {
      console.log(err);
    }

    return 0;

  }
}

module.exports = Relay;
