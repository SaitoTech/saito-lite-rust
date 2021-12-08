const io = require('socket.io-client');
const saito = require('./saito');
const JSON = require('json-bigint');

const HandshakeChallengeMessage = require('./networking/handshake_challenge_message');
const Network = require('./network');
const Transaction = require('./transaction');
const RequestBlockMessage = require("./networking/request_block_message");
const Block = require("./block");
const {SendBlockchainBlockData, SyncType} = require("./networking/send_blockchain_message");
const SendBlockchainMessage = require("./networking/send_blockchain_message");
const RequestBlockchainMessage = require("./networking/request_blockchain_message");

const SendBlockHeadMessage = require("./networking/send_block_head_message");
const fetch = require("node-fetch");

class Peer {

    constructor(app, peerjson = "") {

        this.app = app || {};

        this.id = new Date().getTime();

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


    //
    // returns true if we are the first listed peer in the options file
    // TODO -- isFirstPeer
    isMainPeer() {
        if (this.app?.options?.peers?.length > 0) {
            const option_peer = this.app.options.peers[0];
            if (option_peer.host === this.peer.endpoint.host) {
                return true;
            }
            if (option_peer.host === this.peer.host) {
                return true;
            }
        }
        return false;
    }


    async connect(attempt = 0) {

        this.socket = await this.app.networkApi.wsConnectAndInitialize(this.peer.protocol, this.peer.host, this.peer.port);
        this.socket.peer = this;

        //
        // TODO - test -- where is publickey set
        //
        //console.log("start emit handshake complete");
        //this.app.connection.emit("handshake_complete", this);
        //console.log("done emitting handshake complete");

    }

    returnPublicKey() {
        return this.peer.publickey;
    }

    async handlePeerMessage(message, connection_id) {

    }

    async doReqBlock() {

    }

    async handlePeerCommand(message) {
        console.debug("handlePeerCommand : " + message.message_name);

        let command = message.message_name;
        if (command === "SHAKINIT") {
            let challenge = await this.buildSerializedChallenge(message);
            await this.sendResponse(message.message_id, challenge);
        } else if (command === "SHAKCOMP") {
            let challenge = this.socketHandshakeVerify(message.message_data);
            if (challenge) {
                this.has_completed_handshake = true;
                this.publickey = challenge.opponent_pubkey;
                await this.sendResponseFromStr(message.message_id, "OK");

                // TODO : @David - please move to a suitable position. current location will cause the node to send the blockchain request to all
                //  the nodes after handshake
                await this.app.networkApi.sendAPICall(this.socket, "REQCHAIN",
                                                      this.buildRequestBlockchainMessage(this.app.blockchain.blockchain.last_block_id,
                                                                                         Buffer.from(this.app.blockchain.blockchain.last_block_hash,
                                                                                                     "hex"
                                                                                         ),
                                                                                         Buffer.from(this.app.blockchain.blockchain.fork_id, "hex")
                                                      ).serialize()
                );
            } else {
                console.error("Error verifying peer handshake signature");
            }
        } else if (command === "REQBLOCK") {
            let api_message = await this.buildRequestBlockResponse(message, blockchain);
            await this.sendMesageToSocket(api_message, this.connection_id);
        } else if (command === "REQBLKHD") {
            let bytes = this.socketSendBlockHeader(message, blockchain);
            if (bytes) {
                let data = Buffer.from("OK", "utf-8");
                await this.sendResponse(message.message_id, data);
                await this.app.networkApi.sendAPICall(this.socket, "SNDBLKHD", bytes);
            } else {
                await this.app.networkApi.sendAPIResponse(this.socket, "ERROR___", message.message_id, Buffer.from("ERROR", "utf-8"));
            }
        } else if (command === "REQCHAIN") {
            await this.sendResponseFromStr(message.message_id, "OK");
            let blockchain_message = await this.buildSendBlockchainMessage(RequestBlockchainMessage.deserialize(message.message_data, this.app));
            console.debug("built blockchain response", blockchain_message);
            if (blockchain_message) {
                await this.app.networkApi.sendAPICall(this.socket, "SNDCHAIN", blockchain_message.serialize());
            } else {
                console.warn("send blockchain message was not built");
                await this.app.networkApi.sendAPIResponse(this.socket, "ERROR___", message.message_id, Buffer.from("UNKNOWN BLOCK HASH", "utf-8"));
            }
        } else if (command === "SNDCHAIN") {
            await this.sendResponseFromStr(message.message_id, "OK");

            let send_blockchain_message = SendBlockchainMessage.deserialize(message.message_data, this.app);
            console.debug("received send blockchain message", send_blockchain_message);
            for (let data of send_blockchain_message.blocks_data) {
                let block = await this.fetchBlock(data.block_hash);
                console.log(`block fetched ${block.returnId()} ${block.returnTimestamp()}`);
                this.app.mempool.addBlock(block);
            }
        } else if (command === "SNDBLKHD") {
            //console.log("RECEIVED BLOCK HEADER");
            let send_block_head_message = SendBlockHeadMessage.deserialize(message.message_data, this.app);
            await this.sendResponseFromStr(message.message_id, "OK");
            let block_hash = Buffer.from(send_block_head_message.block_hash).toString("hex");
            let is_block_indexed = this.app.blockchain.isBlockIndexed(block_hash);
            if (is_block_indexed) {
                console.info("SNDBLKHD hash already known: " + Buffer.from(send_block_head_message.block_hash).toString("hex"));
            } else {
                let block = await this.fetchBlock(block_hash);
                console.log(`ADD TO MEMPOOL BLOCK ${block.returnId()} ${block.returnTimestamp()}`);

                this.app.mempool.addBlock(block);

                //
                // download block
                //
                // add to mempool.addBlock
                //
                //let message_data = Buffer.from("OK", "utf-8");
                //  await peer.sendResponse(message.message_id, message_data);
                // await peer.doReqBlock(send_block_head_message.block_hash);
            }
        } else if (command === "SNDTRANS") {
            let tx = this.socketReceiveTransaction(message);
            console.log("received TX w/ timestamp: " + tx.transaction.ts);
            await this.app.mempool.addTransaction(tx);
            //await peer.sendResponseFromStr(message.message_id, "OK");
        } else if (command === "SNDKYLST") {
            await this.app.networkApi.sendAPIResponse(this.socket, "ERROR___", message.message_id, Buffer.from("UNHANDLED COMMAND", "utf-8"));
        } else if (command === "SENDMESG") {
            await this.handleApplicationMessage(message);
        } else {
            console.error("Unhandled command received by client... " + message.message_name);
            await this.app.networkApi.sendAPIResponse(this.socket, "ERROR___", message.message_id, Buffer.from("NO SUCH", "utf-8"));
        }
    }

    /**
     * @param {string} block_hash
     */
    async fetchBlock(block_hash) {
        console.debug("peer.fetchBlock : " + block_hash);

        try {
            const fetch = require('node-fetch');
            const url = `${this.peer.protocol}://${this.peer.host}:${this.peer.port}/block/${block_hash}`;
            console.debug("fetch url = " + url);
            const res = await fetch(url);
            if (res.ok) {
                const base64Buffer = await res.arrayBuffer();
                const buffer = Buffer.from(Buffer.from(base64Buffer).toString('utf-8'), "base64");
                let block = new saito.block(this.app);
                block.deserialize(buffer);
                block.peer = this;
                return block;
            } else {
                console.error(`Error fetching block: Status ${res.status} -- ${res.statusText}`);
            }
        } catch (err) {
            console.log(`Error fetching block:`);
            console.error(err);
        }
        return null;
    }

    async handleApplicationMessage(msg) {
        console.debug("handleApplicationMessage", msg);
        let mdata;
        let reconstructed_obj;
        let reconstructed_message;
        let reconstructed_data;

        try {
            mdata = msg.message_data.toString();
            reconstructed_obj = JSON.parse(mdata);
            reconstructed_message = reconstructed_obj.message;
            reconstructed_data = reconstructed_obj.data;
        } catch (err) {
            console.log("Error reconstructing data: ");
            console.error(err);
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
        let peer = this;
        let mycallback = function (response_object) {
            peer.sendResponse(msg.message_id, Buffer.from(JSON.stringify(response_object), 'utf-8'));
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
        console.debug("buildSerializedChallenge", message);
        let my_pubkey = Buffer.from(this.app.crypto.fromBase58(this.app.wallet.wallet.publickey), 'hex');
        let my_privkey = this.app.wallet.returnPrivateKey();

        //console.log("public key", this.app.wallet.wallet.publickey);
        //console.log("private key", this.app.wallet.wallet.privatekey);

        let peer_octets = message.message_data.slice(0, 4);
        let peer_pubkey = message.message_data.slice(4, 37);
        let my_octets = Buffer.from([127, 0, 0, 1]);
        let challenge = new HandshakeChallengeMessage(my_octets, my_pubkey, peer_octets, peer_pubkey, this.app);
        let buffer = challenge.serializeWithSig(my_privkey);
        //console.log("serialized challenge", buffer);
        //console.log("serialized challenge length = " + buffer.length);
        //console.log("public key : ", this.app.crypto.fromBase58(this.app.wallet.wallet.publickey));
        return buffer;
    }

    socketHandshakeVerify(message_data) {
        let challenge = HandshakeChallengeMessage.deserialize(message_data, this.app);
        console.debug("socketHandshakeVerify", challenge);
        if (challenge.timestamp < Date.now() - Network.ChallengeExpirationTime) {
            console.error("Error validating timestamp for handshake complete");
            return null;
        }
        if (!this.app.crypto.verifyHash(this.app.crypto.hash(message_data.slice(0, Network.ChallengeSize + 64)),
                                        Buffer.from(challenge.opponent_node.sig).toString("hex"),
                                        this.app.crypto.toBase58(Buffer.from(challenge.opponent_node.public_key).toString('hex'))
        )) {
            console.error("Error with validating opponent sig");
            return null;
        }
        if (!this.app.crypto.verifyHash(this.app.crypto.hash(message_data.slice(0, Network.ChallengeSize)),
                                        Buffer.from(challenge.challenger_node.sig).toString("hex"),
                                        this.app.crypto.toBase58(Buffer.from(challenge.challenger_node.public_key).toString('hex'))
        )) {
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

    buildRequestBlockchainMessage(latest_block_id, latest_block_hash, fork_id) {
        console.debug("buildRequestBlockchainMessage", arguments);
        return new RequestBlockchainMessage(this.app, latest_block_id, latest_block_hash, fork_id);
    }

    /**
     *
     * @param {RequestBlockchainMessage} request_blockchain_message
     * @returns Promise<SendBlockchainMessage>
     */
    async buildSendBlockchainMessage(request_blockchain_message) {
        console.debug("peer.buildSendBlockchainMessage", request_blockchain_message);

        let block_zero_hash = Buffer.alloc(32, 0);

        let peers_latest_hash = undefined;
        if (request_blockchain_message.latest_block_id === 0 &&
            request_blockchain_message.latest_block_hash.toString("hex") === block_zero_hash.toString("hex")) {
            peers_latest_hash = block_zero_hash;
        } else {
            if (!this.app.blockchain.blockring.containsBlockHashAtBlockId(request_blockchain_message.latest_block_id,
                                                                          request_blockchain_message.latest_block_hash.toString("hex")
            )) {
                console.log("block hash is not in the longest chain : " + request_blockchain_message.latest_block_hash.toString("hex"));
                // The latest hash from our peer is not in the longest chain
                return null;
            }
            peers_latest_hash = request_blockchain_message.latest_block_hash;
        }

        let blocks_data = [];
        let latest_block = this.app.blockchain.returnLatestBlock();
        if (latest_block) {
            let previous_block_hash = latest_block.hash;
            let this_block;
            let block_count = 0;
            while (previous_block_hash !== peers_latest_hash && block_count < this.app.blockchain.genesis_period) {
                console.debug("adding block hash : " + previous_block_hash);
                block_count += 1;
                this_block = await this.app.blockchain.loadBlockAsync(previous_block_hash);
                blocks_data.push(new SendBlockchainBlockData(this_block.block.id, this_block.hash, this_block.timestamp, Buffer.alloc(32, 0), 0));
                previous_block_hash = this_block.block.previous_block_hash;
            }
            return new SendBlockchainMessage(SyncType.Full, peers_latest_hash, blocks_data, this.app);
        } else {
            console.debug("No blocks in the blockchain");
            return new SendBlockchainMessage(SyncType.Full, block_zero_hash, blocks_data, this.app);
        }
    }

    //
    // we do not check socket conditions as the socket is open if we have received
    // a response. on initialization it is possible for us not to know the socket
    // is open yet, even though it is.
    //
    async sendResponseFromStr(message_id, data) {
        await this.app.networkApi.sendAPIResponse(this.socket, "RESULT__", message_id, Buffer.from(data, 'utf-8'));
    }

    //
    // we do not check socket conditions as the socket is open if we have received
    // a response. on initialization it is possible for us not to know the socket
    // is open yet, even though it is.
    //
    async sendResponse(message_id, data) {
        await this.app.networkApi.sendAPIResponse(this.socket, "RESULT__", message_id, data);
    }

    sendRequest(message, data = "") {
        console.debug("sendRequest : " + message);
        //
        // respect prohibitions
        //
        if (this.peer.receiveblks === 0 && message === "block") {
            console.assert(false);
            return;
        }
        if (this.peer.receiveblks === 0 && message === "blockchain") {
            console.assert(false);
            return;
        }
        if (this.peer.receivetxs === 0 && message === "transaction") {
            console.assert(false);
            return;
        }
        if (this.peer.receivegts === 0 && message === "golden ticket") {
            console.assert(false);
            return;
        }

        let data_to_send = {message: message, data: data};
        let buffer = Buffer.from(JSON.stringify(data_to_send), "utf-8");

        console.debug("socket : ", this.socket);
        if (this.socket && this.socket.readyState === this.socket.OPEN) {
            // no need to await as no callback, so no response
            this.app.networkApi.sendAPICall(this.socket, "SENDMESG", buffer)
                .then(() => {
                    console.debug("message sent with sendRequest");
                });
        } else {
            this.sendRequestWithCallbackAndRetry(message, data);
        }
    }


    //
    // new default implementation
    //
    sendRequestWithCallback(message, data = "", callback = null, loop = true) {

        //console.log("sendRequestWithCallback : " + message);
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
            //console.log("SEND MESG: !" + message);
            this.app.networkApi.sendAPICall(this.socket, "SENDMESG", buffer)
                .then((response) => {
                    //console.log("RESPONSE RECEIVED: ", response);
                    if (callback) {
                        let content = Buffer.from(response).toString('utf-8');
                        content = JSON.parse(content);
                        //console.log("SENDMESG callback: ", content);
                        callback(content);
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
                //console.log("send request with callback and retry!");
                this.sendRequestWithCallbackAndRetry(message, data, callback);
            } else {
                if (callback) {
                    callback({err: "Socket Not Connected"});
                }
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
        console.debug("sendRequestWithCallbackAndRetry");
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

