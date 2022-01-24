var ModTemplate = require('../../lib/templates/modtemplate');
var saito = require('../../lib/saito/saito');
const JSON = require('json-bigint');


class Relay extends ModTemplate {

    constructor(app) {

        super(app);

        this.app = app;
        this.name = "Relay";
        this.description = "Adds support for off-chain, realtime communications channels through relay servers, for mobile users and real-time gaming needs.";
        this.categories = "Utilities Core";


        this.description = "Simple Message Relay for Saito";
        this.categories = "Utilities Communications";
        return this;
    }


    returnServices() {
        let services = [];
        services.push({service: "relay"});
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

        //
        // transaction to end-user, containing msg.request / msg.data is
        //
        let tx = new saito.default.transaction();
        tx.transaction.from.push(new saito.default.slip(this.app.wallet.returnPublicKey()));
        for (let i = 0; i < recipients.length; i++) {
            tx.transaction.to.push(new saito.default.slip(recipients[i]));
        }
        tx.transaction.ts = new Date().getTime();
        tx.msg.request = message_request;
        tx.msg.data = message_data;
        tx.presign(this.app);

        //
        // ... wrapped in transaction to relaying peer
        //
        for (let i = 0; i < this.app.network.peers.length; i++) {

            if (this.app.network.peers[i].peer) {

                //if (this.app.network.peers[i].peer.modules) {
                //if (this.app.network.peers[i].peer.modules.length > 0) {
                //if (this.app.network.peers[i].peer.modules.includes(this.name)) {

                let peer = this.app.network.peers[i];

                //
                // forward to peer
                //
console.log("relay peer message");
                peer.sendRequest("relay peer message", tx.transaction);

            }
            //}
            //}
            //}
        }

        return;

    }


    async handlePeerRequest(app, message, peer, mycallback = null) {

        try {

            let relay_self = app.modules.returnModule("Relay");

            if (message.request === "relay peer message") {

                //
                // sanity check on tx
                //
                let txjson = message.data;
                let tx = new saito.default.transaction(txjson);
                if (tx.transaction.to.length <= 0) {
                    return;
                }
                if (tx.transaction.to[0].add == undefined) {
                    return;
                }
                tx.decryptMessage(this.app);
                let txmsg = tx.returnMessage();

                //
                // the embedded message to examine is txmsg
                //

                //
                // if interior transaction is intended for me, I process regardless
                //
                if (tx.isTo(app.wallet.returnPublicKey())) {
// && !tx.isFrom(app.wallet.returnPublicKey())) {

                    //console.log("RELAY MOD PROCESSING RELAYED TX: " + JSON.stringify(txmsg.request));
                    app.modules.handlePeerRequest(txmsg, peer, mycallback);
                    return;

                    //
                    // otherwise relay
                    //
                } else {

                    //
                    // check to see if original tx is for a peer
                    //
                    let peer_found = 0;

                    //console.log("number of peers: " + app.network.peers.length);

                    for (let i = 0; i < app.network.peers.length; i++) {

                        //if (!tx.isFrom(app.network.peers[i].peer.publickey)) {
                        if (tx.isTo(app.network.peers[i].peer.publickey)) {

                            peer_found = 1;

                            app.network.peers[i].sendRequest("relay peer message", message.data, function () {
                                if (mycallback != null) {
                                    mycallback({err: "", success: 1});
                                }
                            });
                        }
                        //}
                    }
                    if (peer_found == 0) {
                        if (mycallback != null) {
                            mycallback({err: "ERROR 141423: peer not found in relay module", success: 0});
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

