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

    this.busy = false;

    app.connection.on("send-relay-message", (obj) => {
      let peers = app.network.getPeers();
      if (obj.recipient === "PEERS") {
        let peers = [];
        for (let i = 0; i < peers.length; i++) {
          peers.push(peers[i].getPublicKey());
        }
        obj.recipient = peers;
      }
      this.sendRelayMessage(obj.recipient, obj.request, obj.data);
    });
    app.connection.on("set-relay-status-to-busy", () => {
      this.busy = true;
    });
  }

  returnServices() {
    let services = [];
    services.push({ service: "relay" });
    return services;
  }

  //
  // currently a 1-hop function, should abstract to take an array of
  // recipients and permit multi-hop transaction construction.
  //
  sendRelayMessage(recipients, message_request, message_data) {
    //
    // recipient can be an array
    //
    if (!Array.isArray(recipients)) {
      let recipient = recipients;
      recipients = [];
      recipients.push(recipient);
    }

    console.log("RECIPIENTS: " + JSON.stringify(recipients));
    console.log("MESSAGE_REQUEST: " + JSON.stringify(message_request));
    console.log("MESSAGE_DATA: " + JSON.stringify(message_data));

    //
    // transaction to end-user, containing msg.request / msg.data is
    //
    let tx = new saito.default.transaction();

    let slip = new saito.default.slip();
    slip.publicKey = this.app.wallet.getPublicKey();
    tx.addFromSlip(slip);
    for (let i = 0; i < recipients.length; i++) {
      let slip = new saito.default.slip();
      slip.publicKey = recipients[i];
      tx.addToSlip(slip);
      // tx.transaction.to.push(new saito.default.slip(recipients[i]));
    }
    tx.timestamp = new Date().getTime();
    tx.msg.request = message_request;
    tx.msg.data = message_data;

    tx.presign(this.app);

    //
    // ... wrapped in transaction to relaying peer
    //
    for (let i = 0; i < this.app.network.peers.length; i++) {
      if (this.app.network.peers[i].peer) {
        //
        // forward to peer
        //
        let peer = this.app.network.peers[i];
        this.app.network.sendRequestAsTransaction(
          "relay peer message",
          tx.transaction,
          undefined,
          peer.peerIndex
        );
      }
    }
  }

  async handlePeerTransaction(app, tx = null, peer, mycallback) {
    if (tx == null) {
      return;
    }
    let message = tx.returnMessage();

    try {
      let relay_self = app.modules.returnModule("Relay");

      if (message.request === "relay peer message") {
        //
        // sanity check on tx
        //
        let txjson = message.data;
        let inner_tx = new saito.default.transaction(undefined, txjson);
        if (inner_tx.transaction.to.length <= 0) {
          return;
        }
        if (inner_tx.transaction.to[0].add == undefined) {
          return;
        }
        inner_tx.decryptMessage(this.app);
        let inner_txmsg = inner_tx.returnMessage();

        //
        // if interior transaction is intended for me, I process regardless
        //
        if (inner_tx.isTo(app.wallet.getPublicKey())) {
          if (inner_txmsg.request === "ping") {
            this.sendRelayMessage(inner_tx.transaction.from[0].add, "echo", { status: this.busy });
            return;
          }

          if (inner_txmsg.request === "echo") {
            if (inner_txmsg.data.status) {
              app.connection.emit("relay-is-busy", inner_tx.transaction.from[0].add);
            } else {
              app.connection.emit("relay-is-online", inner_tx.transaction.from[0].add);
            }
            return;
          }

          app.modules.handlePeerTransaction(inner_tx, peer, mycallback);
          return;

          //
          // otherwise relay
          //
        } else {
          //
          // check to see if original tx is for a peer
          //
          let peer_found = 0;

          for (let i = 0; i < app.network.peers.length; i++) {
            if (inner_tx.isTo(app.network.peers[i].peer.publickey)) {
              peer_found = 1;

              if (this.app.BROWSER == 0) {
                app.network.peers[i].sendTransactionWithCallback(inner_tx, function () {
                  if (mycallback != null) {
                    mycallback({ err: "", success: 1 });
                  }
                });
              }
            }
          }
          if (peer_found == 0) {
            if (mycallback != null) {
              mycallback({ err: "ERROR 141423: peer not found in relay module", success: 0 });
            }
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = Relay;
