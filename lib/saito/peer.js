const io = require('socket.io-client');
const saito = require('./saito');
const JSON = require('json-bigint');

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
        this.socket = await this.app.network.initializeWebSocket(this, false, (this.app.BROWSER == 1));
    }

    returnPublicKey() {
        return this.peer.publickey;
    }


    //
    // no checks on socket state necessary when sending response
    //
    async sendResponse(message_id, data) {
        await this.app.networkApi.sendAPIResponse(this.socket, "RESULT__", message_id, data);
    }

    sendRequest(message, data = "") {
        //
        // respect prohibitions
        //

	// block as Block.serialize(BlockType.Header)
        if (message === "SNDBLOCK") {
            this.app.networkApi.sendAPICall(this.socket, "SNDBLOCK", data);
            return;
        }
	// block as block_hash
        if (message === "SNDBLKHH") {
            this.app.networkApi.sendAPICall(this.socket, "SNDBLKHH", data);
            return;
        }
	// transaction as Transaction.serialize()
        if (message === "SNDTRANS") {
            this.app.networkApi.sendAPICall(this.socket, "SNDTRANS", data);
            return;
        }
	// transaction as Transaction.serialize()
        if (message === "REQCHAIN") {
            this.app.networkApi.sendAPICall(this.socket, "REQCHAIN", data);
            return;
        }

	//
	// alternately, we have a legacy transmission format, which is sent
	// as a JSON object for reconstruction and manipulation by apps on 
	// the other side.
	//
        let data_to_send = {message: message, data: data};
        let buffer = Buffer.from(JSON.stringify(data_to_send), "utf-8");

        if (this.socket && this.socket.readyState === this.socket.OPEN) {
            this.app.networkApi.sendAPICall(this.socket, "SENDMESG", buffer)
                .then(() => {
                    //console.debug("message sent with sendRequest");
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
        //console.debug("sendRequestWithCallbackAndRetry");
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

