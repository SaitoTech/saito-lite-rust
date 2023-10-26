const Slip = require("../../lib/saito/slip").default;
const PeerService = require("saito-js/lib/peer_service").default;

const Transaction = require("../../lib/saito/transaction").default;

var ModTemplate = require("../../lib/templates/modtemplate");
var saito = require("../../lib/saito/saito");
const JSON = require("json-bigint");

class Relay extends ModTemplate {
  constructor(app) {
    super(app);

    this.app = app;
    this.name = "Relay";
    this.description =
      "Adds support for off-chain, realtime communications channels through relay servers, for mobile users and real-time gaming needs.";
    this.categories = "Utilities Core";
    this.description = "Simple Message Relay for Saito";
    this.categories = "Utilities Communications";
    this.debug = false;
    this.busy = false;

    ////////////////////////////////////////////
    // obj.data is a toJson wrapped transaction
    //
    //
    //

    app.connection.on("relay-send-message", async (obj) => {
      try {
        if (obj.recipient === "PEERS") {
          let peers = [];
          let p = await app.network.getPeers();
          for (let i = 0; i < p.length; i++) {
            peers.push(p[i].publicKey);
          }
          obj.recipient = peers;
        }
        await this.sendRelayMessage(obj.recipient, obj.request, obj.data);
      } catch (error) {
        console.error(error);
      }
    });
    app.connection.on("set-relay-status-to-busy", () => {
      this.busy = true;
    });
  }

  returnServices() {
    let services = [];
    services.push(new PeerService(null, "relay"));
    return services;
  }

  //
  // currently a 1-hop function, should abstract to take an array of
  // recipients and permit multi-hop transaction construction.
  //
  async sendRelayMessage(recipients, message_request, message_data) {
    //console.log("sendRelayMessage");
    //
    // recipient can be an array
    //
    if (!Array.isArray(recipients)) {
      let recipient = recipients;
      recipients = [];
      recipients.push(recipient);
    }

    if (this.debug) {
      console.log("RECIPIENTS: " + JSON.stringify(recipients));
      console.log("MESSAGE_REQUEST: " + JSON.stringify(message_request));
      //console.log("MESSAGE_DATA: " + JSON.stringify(message_data));
    }

    //
    // transaction to end-user, containing msg.request / msg.data is
    //
    let tx = new Transaction();
    let slip = new Slip();
    slip.publicKey = this.publicKey;
    tx.addFromSlip(slip);

    for (let i = 0; i < recipients.length; i++) {
      let slip = new Slip();
      slip.publicKey = recipients[i];
      tx.addToSlip(slip);
    }
    tx.timestamp = new Date().getTime();
    tx.msg.request = message_request;
    tx.msg.data = message_data;

    //
    // ... wrapped in transaction to relaying peer
    //

    let peers = await this.app.network.getPeers();
    for (let i = 0; i < peers.length; i++) {
      // if (peers[i].peer) {
      //
      // forward to peer
      //
      let peer = peers[i];

      // *** NOTE ***
      // tx.msg.data is a json-ready transaction
      // this network function wraps the whole thing within another transaction
      // newtx.msg.data.msg.data = original transactionn
      await this.app.network.sendRequestAsTransaction(
        "relay peer message",
        tx.toJson(),
        null,
        peer.peerIndex
      );
      // }
    }
  }

  async handlePeerTransaction(app, tx = null, peer, mycallback) {
    //console.log("relay.handlePeerTransaction : ", tx);
    if (tx == null) {
      return;
    }
    let message = tx.msg;

    try {
      if (tx.isTo(this.publicKey)) {
        if (message.request === "ping") {
          await this.sendRelayMessage(tx.from[0].publicKey, "echo", {
            status: this.busy,
          });
          return 1;
        }

        if (message.request === "echo") {
          if (message.data.status) {
            app.connection.emit("relay-is-busy", tx.from[0].publicKey);
          } else {
            app.connection.emit("relay-is-online", tx.from[0].publicKey);
          }
          return 1;
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
            }
            return 1;
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
