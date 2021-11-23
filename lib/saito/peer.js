const io = require('socket.io-client');
const saito = require('./saito');

class Peer {

    constructor(app, peerjson = "") {

        this.app = app || {};

        this.peer = {};
        this.peer.host = "localhost";
        this.peer.port = "12101";
        this.peer.publickey = "";
        this.peer.version = "";
        this.peer.protocol = "http";
        this.peer.synctype = "full";         // full = full blocks
                                             // lite = lite blocks
        this.peer.endpoint = {};
        this.peer.endpoint.host = "localhost";
        this.peer.endpoint.port = "12101";
        this.peer.endpoint.publickey = "";
        this.peer.endpoint.protocol = "http";

        this.peer.receiveblks = 1;
        this.peer.receivetxs = 1;
        this.peer.receivegts = 1;
        this.peer.sendblks = 1;
        this.peer.sendtxs = 1;
        this.peer.sendgts = 1;

        this.peer.minfee = 0.001;    // minimum propagation fee
        this.peer.socket = {};
        this.peer.modules = [];
        this.peer.keylist = [];

        if (peerjson != "") {
            let peerobj = JSON.parse(peerjson);
            if (peerobj.peer.endpoint == null) {
                peerobj.peer.endpoint = {};
                peerobj.peer.endpoint.host = peerobj.peer.host;
                peerobj.peer.endpoint.port = peerobj.peer.port;
                peerobj.peer.endpoint.protocol = peerobj.peer.protocol;
            }
            this.peer = peerobj.peer;
        }
    }


    addPathToTransaction(tx) {

        var tmptx = tx.clone();

        // add our path
        var hop = new saito.hop();
        hop.from = this.app.wallet.returnPublicKey();
        hop.to = this.returnPublicKey();
        hop.sig = this.app.crypto.signMessage(hop.to, this.app.wallet.returnPrivateKey());

        tmptx.transaction.path.push(hop);
        return tmptx;

    }


    async connect(attempt = 0) {
        console.log("attempting to connect!");
        this.socket = await this.app.networkApi.wsConnectAndInitialize(this.peer.protocol, this.peer.host, this.peer.port);
    }


    //
    // delete before we close
    //
    disconnect() {

        try {

            let socket_id = this.socket.id;

            try {
                this.socket.close();
            } catch (err) {
                console.log("error with socket.close on " + socket_id);
            }

            delete this.socket;

        } catch (err) {
            console.log("ERROR 582034: error closing websocket: " + err);
        }

    }


    inTransactionPath(tx) {
        if (tx == null) {
            return 0;
        }
        if (tx.isFrom(this.peer.publickey)) {
            return 1;
        }
        for (let i = 0; i < tx.transaction.path.length; i++) {
            if (tx.transaction.path[i].from == this.peer.publickey) {
                return 1;
            }
        }
        return 0;
    }


    returnPublicKey() {
        return this.peer.publickey;
    }

    async handlePeerCommand(peer, message) {
        let command = message.getMessageNameAsString();
        if (command === "SHAKINIT") {
            let challenge = await this.buildSerializedHandshakeChallenge(message, wallet);
            await peer.sendResponse(message.message_id, challenge);
        } else if (command === "SHAKCOMP") {
            let challenge = this.verifySocketHandshake(message.getMessageData());
            if (challenge) {
                peer.has_completed_handshake = true;
                peer.publicKey = challenge.opponent_pubkey;
                await peer.sendResponse(message.message_id, Buffer.from("OK", "utf-8"));
            } else {
                console.error("Error verifying peer handshake signature");
            }
        } else if (command === "REQBLOCK") {
            let api_message =await  this.buildRequestBlockResponse(message, blockchain);
            await this.sendMesageToSocket(api_message, peer.connection_id);
        } else if (command === "REQBLKHD") {
            let bytes = this.socketSendBlockHeader(message, blockchain);
            if (bytes){
                let data = Buffer.from("OK", "utf-8");
                await peer.sendResponse(message.message_id, data);
                await peer.sendCommand("SNDBLKHD", bytes);
            }else{
                await peer.sendErrorResponseFromStr(message.message_id, "ERROR");
            }
        } else if (command === "REQCHAIN") {
            await peer.sendResponseFromStr(message.message_id, "OK");
            let blockchain_message = this.buildSendBlockchainMessage();
        } else if (command === "SNDCHAIN") {

        } else if (command === "SNDBLKHD") {

        } else if (command === "SNDTRANS") {

        } else if (command === "SNDKYLST") {

        } else {

        }
    }
}

module.exports = Peer;

