const io = require('socket.io-client');
const saito = require('./saito');

const HandshakeChallengeMessage = require('./networking/handshake_challenge_message');
const Network = require('./network');
const Transaction = require('./transaction');
const RequestBlockMessage = require("./networking/request_block_message");
const Block = require("./block");
const {SendBlockchainBlockData, SyncType} = require("./networking/send_blockchain_message");
const SendBlockchainMessage = require("./networking/send_blockchain_message");
const RequestBlockchainMessage = require("./networking/request_blockchain_message");

const JSON = require('json-bigint');
const SendBlockHeadMessage = require("./networking/send_block_head_message");

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

        if (peerjson !== "") {
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
            if (tx.transaction.path[i].from === this.peer.publickey) {
                return 1;
            }
        }
        return 0;
    }

    async connect(attempt = 0) {
        this.socket = await this.app.networkApi.wsConnectAndInitialize(this.peer.protocol, this.peer.host, this.peer.port);

        //
        // TODO - test
        //
        console.log("emit handshake complete");
        this.app.connection.emit("handshake_complete", this);
        console.log("done emitting handshake complete");

    }

    returnPublicKey() {
        return this.peer.publickey;
    }

    async handlePeerMessage(message, connection_id) {

    }

    async doReqBlock() {

    }

    async handlePeerCommand(peer, message) {

        console.log("handling message : " + message.message_name);

        let command = message.message_name;
        if (command === "SHAKINIT") {
            // let challenge = await this.buildSerializedHandshakeChallenge(message, wallet);
            // await peer.sendResponse(message.message_id, challenge);
            console.log("not handled yet");
            // await peer.sendResponseFromStr(message.message_id, "OK");

            // this.sendRequest("application message", Buffer.from("application message data"));

        } else if (command === "SHAKCOMP") {
            let challenge = this.verifySocketHandshake(message.message_data);
            if (challenge) {
                peer.has_completed_handshake = true;
                peer.publicKey = challenge.opponent_pubkey;
                await peer.sendResponse(message.message_id, Buffer.from("OK", "utf-8"));
            } else {
                console.error("Error verifying peer handshake signature");
            }
        } else if (command === "REQBLOCK") {
            let api_message = await this.buildRequestBlockResponse(message, blockchain);
            await this.sendMesageToSocket(api_message, peer.connection_id);
        } else if (command === "REQBLKHD") {
            let bytes = this.socketSendBlockHeader(message, blockchain);
            if (bytes) {
                let data = Buffer.from("OK", "utf-8");
                await peer.sendResponse(message.message_id, data);
                await peer.sendCommand("SNDBLKHD", bytes);
            } else {
                await peer.sendErrorResponseFromStr(message.message_id, "ERROR");
            }
        } else if (command === "REQCHAIN") {
            await peer.sendResponseFromStr(message.message_id, "OK");
            let blockchain_message = await this.buildSendBlockchainMessage(
                RequestBlockchainMessage.deserialize(message.getMessageData(), this.app)
            );
            if (blockchain_message) {
                let connection_id_clone = peer.connection_id + "";
                // TODO : PORT thread + db code here.
            } else {
                await peer.sendErrorResponseFromStr(message.message_id, "UNKNOWN BLOCK HASH");
            }
        } else if (command === "SNDCHAIN") {
            await peer.sendResponseFromStr(message.message_id, "OK");

            let send_blockchain_message = SendBlockchainMessage.deserialize(message.message_data, this.app);
            for (let data of send_blockchain_message.blocks_data) {
                await peer.doReqBlock(data.block_hash);
            }
        } else if (command === "SNDBLKHD") {
            let send_block_head_message = SendBlockHeadMessage.deserialize(message.message_data, this.app);
            let block = await this.app.blockchain.getBlock(send_block_head_message.block_hash);
            if (block) {
                console.info("SNDBLKHD hash already known: " + Buffer.from(send_block_head_message.block_hash).toString("hex"));
            } else {
                let message_data = Buffer.from("OK", "utf-8");
                await peer.sendResponse(message.message_id, message_data);
                await peer.doReqBlock(send_block_head_message.block_hash);
            }
        } else if (command === "SNDTRANS") {
console.log("receiving SNDTRANS");
            let tx = this.socketReceiveTransaction(message);
console.log("transaction is as hex: " + JSON.stringify(tx.transaction));
            await this.app.mempool.addTransaction(tx);
            //await peer.sendResponseFromStr(message.message_id, "OK");
        } else if (command === "SNDKYLST") {
            await peer.sendErrorResponseFromStr(message.message_id, "UNHANDLED COMMAND");
        } else if (command === "SENDMESG") {
            await peer.handleApplicationMessage(peer, message);
        } else {
            console.error("Unhandled command received by client... ", message.message_name);
            await peer.sendErrorResponseFromStr(message.message_id, "NO SUCH");
        }
    }

    async handleApplicationMessage(peer, msg) {

        let mdata;
        let reconstructed_obj;
        let reconstructed_message;
        let reconstructed_data;

        try {
            mdata = msg.message_data.toString();
            reconstructed_obj = JSON.parse(mdata);
            reconstructed_message = reconstructed_obj.message;
            reconstructed_data = JSON.parse(reconstructed_obj.data);
        } catch (err) {

        }

        let message = {};
        message.request = "";
        message.data = {};

        if (reconstructed_message) {
            message.request = reconstructed_message;
        }
        if (reconstructed_data) {
            message.data = reconstructed_data;
        }

        console.log("X: " + reconstructed_message);
        console.log("Y: " + JSON.stringify(reconstructed_data));

        let mycallback = function (response_object) {
            peer.sendResponse(msg.message_id, response_object);
        }

        switch (msg.message_name) {
            case 'block':
                console.log("old block request");
                //this.handleBlockRequest(message);
                break;
            case 'missing block':
                console.log("old missing block request");
                //this.handleMissingBlockRequest(message, mycallback);
                break;
            case 'blockchain':
                console.log("old blockchain request");
                //this.handleBlockchainRequest(message);
                break;
            case 'transaction':
                console.log("old transaction request");
                //this.handleTransactionRequest(message, mycallback);
                break;
            case 'keylist':
                console.log("old keyist request");
                //this.handleKeylistRequest(message);
                break;
            default:


                //
                // if the attached data is a transaction, ensure MSG field exists
                //
                // transaction.msg included for backwards compatibility
                //
                if (reconstructed_data) {
                    if (reconstructed_data.transaction) {
                        if (reconstructed_data.transaction.m) {
                            // backwards compatible - in case modules try the old fashioned way
                            message.data.transaction.msg = JSON.parse(this.app.crypto.base64ToString(message.data.transaction.m));
                            message.data.msg = message.data.transaction.msg;
                        }
                    }
                }

                this.app.modules.handlePeerRequest(message, this, mycallback);
                break;
        }

        //
        // send callback?
        //
        // TODO : handle application messages here !!!

    }

    buildSerializedChallenge(message) {
        let my_pubkey = this.app.wallet.wallet.publickey;
        let my_privkey = this.app.wallet.wallet.privatekey;

        let peer_octets = message.getMessageData().slice(0, 4);
        let peer_pubkey = message.getMessageData().slice(4, 37);
        let my_octets = Buffer.from([127, 0, 0, 1]);
        let challenge = new HandshakeChallengeMessage(my_octets, my_pubkey, peer_octets, peer_pubkey, this.app);
        return challenge.serializeWithSig(my_privkey);
    }

    socketHandshakeVerify(message_data) {
        let challenge = HandshakeChallengeMessage.deserialize(message_data, this.app);
        if (challenge.timestamp < Date.now() - Network.ChallengeExpirationTime) {
            console.error("Error validating timestamp for handshake complete");
            return null;
        }
        if (!this.app.crypto.verify(this.app.crypto.hash(message_data.slice(0, Network.ChallengeSize + 64), challenge.opponent_node.sig, challenge.opponent_node.public_key))) {
            console.error("Error with validating opponent sig");
            return null;
        }
        if (!this.app.crypto.verify(this.app.hash(0, Network.ChallengeSize), challenge.challenger_node.sig, challenge.challenger_node.public_key)) {
            console.error("Error with validating challenger sig");
            return null;
        }
        return challenge;
    }

    socketReceiveTransaction(message) {
        let tx = new saito.transaction();
        tx.deserialize(this.app, message.message_data, 0);
        return tx;
    }

    async buildRequestBlockResponse(message) {
        let request_block_message = RequestBlockMessage.deserialize(message.message_data, this.app);
        if (request_block_message.block_id) {
            // TODO : port this correctly
        } else if (request_block_message.block_hash) {
            let block_hash = request_block_message.block_hash;

            if (this.app.blockchain.getBlock(block_hash)) {
                // TODO : handle APIMessage line here
            } else {
                // TODO : handle APIMessage line here
            }
        } else {
            // TODO : handle APIMessage line here
        }
    }

    async socketSendBlockHeader(message) {
        let block_hash = message.message_data.slice(0, 32);
        let target_block = this.app.blockchain.getBlock(block_hash);
        if (target_block) {
            return target_block.serialize(Block.BlockType.Header); // TODO : implement Block Header serialization support
        } else {
            return null;
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
            if (tx.transaction.path[i].from === this.peer.publickey) {
                return 1;
            }
        }
    }

    async buildSendBlockchainMessage(request_blockchain_message) {
        let block_zero_hash = Buffer.alloc(32, 0);

        let peers_latest_hash = undefined;
        if (request_blockchain_message.latest_block_id === 0
            && request_blockchain_message.latest_block_hash === block_zero_hash) {
            peers_latest_hash = block_zero_hash;
        } else {
            // TODO contains_block_hash_at_block_id for some reason needs mutable access to block_ring
            // We should figure out why this is and get rid of this problem, I don't think there's any
            // reason we should need to get the write lock for this operation...
            if (!this.app.blockchain.containsBlockHashAtBlockId(request_blockchain_message.latest_block_id, request_blockchain_message.latest_block_hash)) {
                // The latest hash from our peer is not in the longest chain
                return null;
            }
            peers_latest_hash = request_blockchain_message.latest_block_hash;
        }

        let blocks_data = [] < SendBlockchainBlockData > (0);
        let latest_block = this.app.blockchain.getLatestBlock();
        if (latest_block) {
            let previous_block_hash = latest_block.hash;
            let this_block;
            let block_count = 0;
            while (previous_block_hash !== peers_latest_hash && block_count < this.app.blockchain.genesis_period) {
                block_count += 1;
                this_block = this.app.blockchain.getBlock(previous_block_hash);
                blocks_data.push(new SendBlockchainBlockData(this_block.block.id, this_block.hash, this_block.timestamp, Buffer.alloc(32, 0), 0));
                previous_block_hash = this_block.block.previous_block_hash;
            }
            return new SendBlockchainMessage(SyncType.Full, peers_latest_hash, blocks_data, this.app);
        } else {
            throw new Error("Blockchain does not have any blocks");
        }
    }

    async sendResponseFromStr(message_id, data) {
        console.log("sendResponseFromStr");
        console.log(data);
        if (this.socket && this.socket.readyState === this.socket.OPEN) {
            await this.app.networkApi.sendAPIResponse(this.socket, "RESULT__", message_id, Buffer.from(data, 'utf-8'));
        } else {
            console.error("socket not open");
            console.log(this);
        }
    }
    async sendResponse(message_id, data) {
        console.log("sendResponse");
        console.log(data);
        if (this.socket && this.socket.readyState === this.socket.OPEN) {
            await this.app.networkApi.sendAPIResponse(this.socket, "RESULT__", message_id, Buffer.from(JSON.stringify(data), 'utf-8'));
        } else {
            console.error("socket not open");
            console.log(this);
        }
    }

    sendRequest(message, data = "") {
        console.log("send request!");

        //
        // respect prohibitions
        //
        if (this.peer.receiveblks === 0 && message === "block") {
            return;
        }
        if (this.peer.receiveblks === 0 && message === "blockchain") {
            return;
        }
        if (this.peer.receivetxs === 0 && message === "transaction") {
            return;
        }
        if (this.peer.receivegts === 0 && message === "golden ticket") {
            return;
        }

        let data_to_send = {message: message, data: data};
        let buffer = Buffer.from(JSON.stringify(data_to_send), "utf-8");

        if (this.socket && this.socket.readyState === this.socket.OPEN) {
            // no need to await as no callback, so no response
            this.app.networkApi.sendAPICall(this.socket, "SENDMESG", buffer)
                .then(() => {
                    console.debug("message sent with sendRequest");
                });
        } else {
            callback({err: "Socket Not Connected"});
            this.sendRequestWithCallbackAndRetry(message, data);
        }
    }


    //
    // new default implementation
    //
    sendRequestWithCallback(message, data = "", callback = null, loop = true) {
        console.log("sendRequestWithCallback : " + message);
        //
        // respect prohibitions
        //
        if (this.peer.receiveblks === 0 && message === "block") {
            return;
        }
        if (this.peer.receiveblks === 0 && message === "blockchain") {
            return;
        }
        if (this.peer.receivetxs === 0 && message === "transaction") {
            return;
        }
        if (this.peer.receivegts === 0 && message === "golden ticket") {
            return;
        }

        let data_to_send = {message: message, data: data};
        let buffer = Buffer.from(JSON.stringify(data_to_send), "utf-8");

        if (this.socket && this.socket.readyState === this.socket.OPEN) {
            this.app.networkApi.sendAPICall(this.socket, "SENDMESG", buffer)
                .then((response) => {
                    if (callback) {
                        let content = Buffer.from(response).toString('utf-8');
                        content = JSON.parse(content);
                        callback(response);
                    }
                })
                .catch(error => {
                    console.error(error);
                    if (callback) {
                        callback({err: error.toString()});
                    }
                });
        } else {
            if (loop) {
                this.sendRequestWithCallbackAndRetry(message, data, callback);
            }
            if (callback) {
                callback({err: "Socket Not Connected"});
            }
        }
    }

    //
    // repeats until success. this should no longer be called directly, it is called by the
    // above functions in the event that socket transmission is unsuccessful. this is part of
    // our effort to simplify and move down to having only two methods for requesting
    // request emission.
    //
    sendRequestWithCallbackAndRetry(request, data = {}, callback = null, initialDelay = 1000, delayFalloff = 1.3) {
        let callbackWrapper = (res) => {
            if (!res.err) {
                if (callback != null) {
                    callback(res);
                }
            } else if (res.err === "Socket Not Connected") {
                setTimeout((() => {
                    initialDelay = initialDelay * delayFalloff;
                    this.sendRequestWithCallback(request, data, callbackWrapper, false);
                }), initialDelay);
            } else if (res.err === "Peer not found") {
                if (callback != null) {
                    callback(res); // Server could not find peer,
                }
            } else {
                console.log("ERROR 12511: Unknown Error from socket...")
            }
        }
        this.sendRequestWithCallback(request, data, callbackWrapper, false);
    }

}

module.exports = Peer;

