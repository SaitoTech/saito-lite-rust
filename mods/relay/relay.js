const Slip = require("../../lib/saito/slip").default;

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

    app.connection.on("relay-send-message", async (obj) => {
      if (obj.recipient === "PEERS") {
        let peers = [];
        let p = await app.network.getPeers();
        for (let i = 0; i < p.length; i++) {
          peers.push(p[i].publicKey);
        }
        obj.recipient = peers;
      }
      await this.sendRelayMessage(obj.recipient, obj.request, obj.data);
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
  async sendRelayMessage(recipients, message_request, message_data) {
    console.log("sendRelayMessage");
    //
    // recipient can be an array
    //
    if (!Array.isArray(recipients)) {
      let recipient = recipients;
      recipients = [];
      recipients.push(recipient);
    }

    // if (this.debug) {
    console.log("RECIPIENTS: " + JSON.stringify(recipients));
    console.log("MESSAGE_REQUEST: " + JSON.stringify(message_request));
    console.log("MESSAGE_DATA: " + JSON.stringify(message_data));
    // }

    //
    // transaction to end-user, containing msg.request / msg.data is
    //
    let tx = new Transaction();
    let slip = new Slip();
    slip.publicKey = await this.app.wallet.getPublicKey();
    tx.addFromSlip(slip);
    for (let i = 0; i < recipients.length; i++) {
      let slip = new Slip();
      slip.publicKey = recipients[i];
      tx.addToSlip(slip);
    }
    tx.timestamp = new Date().getTime();
    tx.msg.request = message_request;
    tx.msg.data = message_data;
    tx.packData();
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
    // console.log("relay.handlePeerTransaction : ", tx);
    if (tx == null) {
      return;
    }
    let message = tx.msg;
    try {
      let relay_self = app.modules.returnModule("Relay");

      if (message.request === "relay peer message") {
        //
        // sanity check on tx
        //
        let txjson = message.data;
        // console.log("txjson : ", txjson);
        let inner_tx = new Transaction(undefined, txjson);
        if (inner_tx.to.length === 0) {
          return;
        }
        if (inner_tx.to[0].publicKey == undefined) {
          return;
        }

        await inner_tx.decryptMessage(this.app);
        let inner_txmsg = inner_tx.returnMessage();

        //
        // if interior transaction is intended for me, I process regardless
        //
        if (inner_tx.isTo(await app.wallet.getPublicKey())) {
          if (inner_txmsg.request === "ping") {
            await this.sendRelayMessage(inner_tx.from[0].publicKey, "echo", {
              status: this.busy,
            });
            return;
          }

          if (inner_txmsg.request === "echo") {
            if (inner_txmsg.data.status) {
              app.connection.emit("relay-is-busy", inner_tx.from[0].publicKey);
            } else {
              app.connection.emit("relay-is-online", inner_tx.from[0].publicKey);
            }
            return;
          }

          await app.modules.handlePeerTransaction(inner_tx, peer, mycallback);

          //
          // otherwise relay
          //
        } else {
          //
          // check to see if original tx is for a peer
          //
          let peer_found = 0;

          let peers = await app.network.getPeers();
          for (let i = 0; i < peers.length; i++) {
            if (inner_tx.isTo(peers[i].publicKey)) {
              peer_found = 1;

              if (this.app.BROWSER == 0) {
                await app.network.sendTransactionWithCallback(
                  inner_tx,
                  async function () {
                    if (mycallback != null) {
                      await mycallback({ err: "", success: 1 });
                    }
                  },
                  peers[i].peerIndex
                );
              }
            }
          }

          if (peer_found == 0) {
            if (mycallback != null) {
              await mycallback({ err: "ERROR 141423: peer not found in relay module", success: 0 });
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
