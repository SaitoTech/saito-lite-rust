const saito = require('./saito');
const JSON = require('json-bigint');
const fetch = require('node-fetch');
const {set} = require('numeral');
const Base58 = require("base-58");
const secp256k1 = require('secp256k1');

const SendBlockHeadMessage = require("./networking/send_block_head_message");
const HandshakeChallengeMessage = require('./networking/handshake_challenge_message');
const RequestBlockMessage = require("./networking/request_block_message");
const {SendBlockchainBlockData, SyncType} = require("./networking/send_blockchain_message");
const RequestBlockchainMessage = require("./networking/request_blockchain_message");
const SendBlockchainMessage = require("./networking/send_blockchain_message");

class Network {

    constructor(app) {

        this.app = app || {};

        this.peers = [];
        this.peers_connected = 0;
        this.peers_connected_limit = 2048; // max peers

        //
        // default comms behavior
        //
        this.sendblks = 1;
        this.sendtxs = 1;
        this.sendgts = 1;
        this.receiveblks = 1;
        this.receivetxs = 1;
        this.receivegts = 1;

        //
        // downloads
        //
        this.downloads = {};
        this.downloads_hmap = {};
        this.downloading_active = 0;
        this.block_sample_size = 15;

        //
        // manage peer disconnections, to provide fall-back
        // reconnect logic in the event socket.io fails to
        // reconnect to a rebooted peer
        //
        this.dead_peers = [];

    }


    //
    // addPeer
    //
    // we initiate an outgoing connection
    //
    addPeer(peerjson) {

        let peerhost = "";
        let peerport = "";

        let peerobj = {};
        peerobj.peer = JSON.parse(peerjson);

        if (peerobj.peer.protocol == null) {
            peerobj.peer.protocol = "http";
        }
        if (peerobj.peer.host !== undefined) {
            peerhost = peerobj.peer.host;
        }
        if (peerobj.peer.port !== undefined) {
            peerport = peerobj.peer.port;
        }

        //
        // no duplicate connections
        //
        for (let i = 0; i < this.peers.length; i++) {
            if (this.peers[i].peer.host === peerhost && this.peers[i].peer.port === peerport) {
                console.log("already connected to peer...");
                return;
            }
        }

        //
        // do not connect to ourselves
        //
        if (this.app.options.server != null) {
            if (peerhost === "localhost") {
                return;
            }
            if (this.app.options.server.host === peerhost && this.app.options.server.port === peerport) {
                console.log("ERROR 185203: not adding " + this.app.options.server.host + " as peer since it is our server.");
                return;
            }
            if (this.app.options.server.endpoint != null) {
                if (this.app.options.server.endpoint.host === peerhost && this.app.options.server.endpoint.port === peerport) {
                    console.log("ERROR 185204: not adding " + this.app.options.server.host + " as peer since it is our server.");
                    return;
                }
            }
        }
        //
        // create peer and add it
        //
        let peer = new saito.peer(this.app, JSON.stringify(peerobj));

	//
	//
	//

        //
        // we connect to them
        //
        peer.connect();
        this.peers.push(peer);
        this.peers_connected++;

    }


    //
    // addRemotePeer
    //
    // server sends us a websocket
    //
    addRemotePeer(socket) {

        // deny excessive connections
        if (this.peers_connected >= this.peers_connected_limit) {
            console.log("ERROR 757594: denying request to remote peer as server overloaded...");
            return null;
        }

        //
        // sanity check
        //
        for (let i = 0; i < this.peers.length; i++) {
            // if (this.peers[i].socket_id === socket.id) { // TODO : add a valid check. these fields are undefined in websockets
            //     console.log("error adding socket: already in pool [" + this.peers[i].socket_id + " - " + socket.id + "]");
            //     return;
            // }
        }


        //
        // add peer
        //
        let peer = new saito.peer(this.app);
	peer.socket = socket;

	//
	// create socket and attach events
	//
	this.initializeWebSocket(peer, true, false);


        //
        // they connected to us
        //
        // TODO - where and how are events attached to incoming sockets
        // if the handshake is not attaching data such as publickey, etc.
        // to the peer socket, then how we do we handle not adding dupes,
        // etc.
        //
        //peer.connect(1);
        //
        //
        //
        this.peers.push(peer);
        this.peers_connected++;

	//
	//
	//
        this.app.handshake.initiateHandshake(socket);


        return peer;
    }



    /**
     * @param {string} block_hash
     * @param {string} preferred peer (if exists); // TODO - remove duplicate function and update blockchain.js
     */
    async requestMissingBlock(block_hash, peer = null) { return await fetchBlock(block_hash, peer); }
    async fetchBlock(block_hash, peer=null) {

	if (peer == null) {
	    if (this.peers.length == 0) { return; }
	    peer = this.peers[0];
	}

        try {
            const fetch = require('node-fetch');
            const url = `${peer.peer.protocol}://${peer.peer.host}:${peer.peer.port}/block/${block_hash}`;
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



    initializeWebSocket(peer, remote_socket=false, browser=false) {

	//
	// browsers can only use w3c sockets
	//
        if (browser == true) {

            let wsProtocol = 'ws';
            if (peer.peer.protocol === 'https') { wsProtocol = 'wss'; }
            peer.socket = new WebSocket(`${wsProtocol}://${peer.peer.host}:${peer.peer.port}/wsopen`);
            peer.socket.peer = peer;

            peer.socket.onopen = (event) => {
                console.log("connected to network", event);
                this.app.handshake.initiateHandshake(peer.socket);
            };
            peer.socket.onclose = (event) => {
                console.log(`[close] Connection closed cleanly by web client, code=${event.code} reason=${event.reason}`);
                this.app.network.cleanupDisconnectedSocket(peer.socket);
            };
            peer.socket.onerror = (event) => {
                console.log(`[error] ${event.message}`);
            };
            peer.socket.onmessage = async (event) => {
                let data = await event.data.arrayBuffer();
                let api_message = this.app.networkApi.deserializeAPIMessage(data);
                if (api_message.message_name === "RESULT__") {
                    this.app.networkApi.receiveAPIResponse(api_message);
                } else if (api_message.message_name === "ERROR___") {
                    this.app.networkApi.receiveAPIError(api_message);
                } else {
                    await this.receivePeerRequest(peer, api_message);
                }
            };

	    return peer.socket;
	}


	//
	// only create the socket if it is not a remote peer, as remote peers
	// have their socket code added by the server class.
	//
	if (remote_socket == false) {

            const WebSocket = require('ws');
            let wsProtocol = 'ws';
            if (peer.peer.protocol === 'https') { wsProtocol = 'wss'; }
            peer.socket = new WebSocket(`${wsProtocol}://${peer.peer.host}:${peer.peer.port}/wsopen`);
            peer.socket.peer = peer;

	    //
	    // default ws websocket
	    //
            peer.socket.on('open', async (event) => {
                await this.app.handshake.initiateHandshake(peer.socket);
            });
            peer.socket.on('close', (event) => {
                console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            });
            peer.socket.on('error', (event) => {
                console.log(`[error] ${event.message}`);
            });

	} else {
            peer.socket.peer = peer;
	}

        peer.socket.on('message', async (data) => {
            let api_message = this.app.networkApi.deserializeAPIMessage(data);
            if (api_message.message_name === "RESULT__") {
                this.app.networkApi.receiveAPIResponse(api_message);
            } else if (api_message.message_name === "ERROR___") {
                this.app.networkApi.receiveAPIError(api_message);
            } else {
                console.debug("handling peer command - receiving peer id " + peer.socket.peer.id, api_message);
                await this.receivePeerRequest(peer, api_message);
            }
        });

	return peer.socket;
    }
    


    cleanupDisconnectedSocket(peer) {

        for (let c = 0; c < this.peers.length; c++) {
            if (this.peers[c] === peer) {

                let keep_peer = -1;

                //
                // do not remove peers we asked to add
                //
                if (this.app.options.peers != null) {
                    for (let d = 0; d < this.app.options.peers.length; d++) {
                        if (this.app.options.peers[d].host === peer.peer.host && this.app.options.peers[d].port === peer.peer.port) {
                            keep_peer = d;
                        }
                    }
                }

                //
                // do not remove peers if it's end point is in our options
                //
                if (this.app.options.peers != null && typeof peer.peer.endpoint != 'undefined') {
                    for (let d = 0; d < this.app.options.peers.length; d++) {
                        if (this.app.options.peers[d].host ===
                            peer.peer.endpoint.host &&
                            this.app.options.peers[d].port ===
                            peer.peer.endpoint.port) {
                            keep_peer = d;
                        }
                    }
                }

                //
                // do not remove peers serving dns
                //
                if (this.app.options.peers != null) {
                    if (this.app.options.dns != null) {
                        for (let d = 0; d < this.app.options.dns.length; d++) {
                            if (this.app.options.dns[d].host === peer.peer.host && this.app.options.dns[d].port === peer.peer.port) {
                                keep_peer = d;
                            }
                        }
                    }
                }
                if (keep_peer >= 0) {
                    //
                    // we push onto dead peers list, which will
                    // continue to try and request a connection
                    //
                    this.dead_peers.push(this.app.options.peers[keep_peer]);
                }

                //
                // close and destroy socket, and stop timers
                //
                this.peers[c].disconnect();
                this.peers.splice(c, 1);
                c--;
                this.peers_connected--;

            }
        }
    }


    initialize() {

        if (this.app.options) {
            if (this.app.options.server) {
                if (this.app.options.server.receiveblks !== undefined && this.app.options.server.receiveblks === 0) {
                    this.receiveblks = 0;
                }
                if (this.app.options.server.receivetxs !== undefined && this.app.options.server.receivetxs === 0) {
                    this.receivetxs = 0;
                }
                if (this.app.options.server.receivegts !== undefined && this.app.options.server.receivegts === 0) {
                    this.receivegts = 0;
                }
                if (this.app.options.server.sendblks !== undefined && this.app.options.server.sendblks === 0) {
                    this.sendblks = 0;
                }
                if (this.app.options.server.sendtxs !== undefined && this.app.options.server.sendtxs === 0) {
                    this.sendtxs = 0;
                }
                if (this.app.options.server.sendgts !== undefined && this.app.options.server.sendgts === 0) {
                    this.sendgts = 0;
                }
            }
        }

        if (this.app.options.peers != null) {
            for (let i = 0; i < this.app.options.peers.length; i++) {
                this.addPeer(JSON.stringify(this.app.options.peers[i]));
            }
        }

        this.app.connection.on('peer_disconnect', (peer) => {
            this.cleanupDisconnectedSocket(peer);
        });

    }


    isPrivateNetwork() {
        for (let i = 0; i < this.peers.length; i++) {
            if (this.peers[i].isConnected()) {
                return false;
            }
        }
        if (this.app.options.peers != null) {
            return false;
        }
        return true;
    }

    isProductionNetwork() {
        if (this.app.BROWSER === 0) {
            // no peers, ok?
            if (this.peers.length === 0) {
                return true;
            }
            return process.env.NODE_ENV === 'prod'
        } else {
            return false
        }
    }




    async receivePeerRequest(peer, message) {

	let block;
	let block_hash;
	let challenge;
	let is_block_indexed = false;

console.log("Received Peer Message: " + message.message_name);

	switch (message.message_name) {

            case "SHAKINIT":

                challenge = await this.app.handshake.handleIncomingHandshakeRequest(peer, message.message_data);
                await peer.sendResponse(message.message_id, challenge);
                break;

            case "SHAKCOMP":
/***
                challenge = peer.socketHandshakeVerify(message.message_data);
                if (challenge) {
                    peer.has_completed_handshake = true;
                    peer.peer.publickey = challenge.opponent_pubkey;
                    await peer.sendResponse(message.message_id, Buffer.from("OK", "utf-8"));
                    await peer.app.networkApi.sendAPICall(peer.socket, "REQCHAIN",
                              peer.buildRequestBlockchainMessage(
				  this.app.blockchain.blockchain.last_block_id,
                                  Buffer.from(this.app.blockchain.blockchain.last_block_hash,
                                  "hex"
                               ),
                               Buffer.from(this.app.blockchain.blockchain.fork_id, "hex")
                          ).serialize()
                    );
                } else {
                    console.error("Error verifying peer handshake signature");
                }
***/
                break;

            case "REQBLOCK":

		// NOT YET IMPLEMENTED -- send FULL block
                break;

            case "REQBLKHD":

		// NOT YET IMPLEMENTED -- send HEADER block
                break;

            case "REQCHAIN":

		// NOT YET IMPLEMENTED -- request chain
		break;

		//await peer.sendResponse(message.message_id, Buffer.from("OK","utf-8"));
            	//let blockchain_message = await peer.buildSendBlockchainMessage(RequestBlockchainMessage.deserialize(message.message_data, this.app));
            	//if (blockchain_message) {
            	//    let data = blockchain_message.serialize();
            	//    console.debug("serialized message", data);
            	//    await this.app.networkApi.sendAPICall(peer.socket, "SNDCHAIN", data);
            	//} else {
            	//    console.warn("send blockchain message was not built");
            	//    await this.app.networkApi.sendAPIResponse(this.socket, "ERROR___", message.message_id, Buffer.from("UNKNOWN BLOCK HASH", "utf-8"));
            	//}

            case "SNDCHAIN":

		// NOT YET IMPLEMENTED -- send chain
		break;

                //await peer.sendResponse(message.message_id, Buffer.from("OK", "utf-8"));
                //let send_blockchain_message = SendBlockchainMessage.deserialize(message.message_data, this.app);
                //for (let data of send_blockchain_message.blocks_data) {
                //    let block = await network.fetchBlock(data.block_hash.toString("hex"));
                //    console.log(`block fetched ${block.returnId()} ${block.returnTimestamp()}`);
                //    this.app.mempool.addBlock(block);
                //}
                //break;


	    //
	    // this delivers the block as BlockType.Header
	    //
            case "SNDBLOCK":

        	block = new saito.block(this.app);
        	block.deserialize(message.message_data);
                block_hash = block.returnHash();

                is_block_indexed = this.app.blockchain.isBlockIndexed(block_hash);
                if (is_block_indexed) {
                    console.info("SNDBLOCK hash already known: " + block_hash);
                } else {
                    block = await this.fetchBlock(block_hash, peer);
                    this.app.mempool.addBlock(block);
                }
                break;

	    //
	    // this delivers the block as block_hash
	    //
            case "SNDBLKHH":

		block_hash = Buffer.from(message.message_data, 'hex').toString('hex');;

console.log("received block hash: " + block_hash);
                is_block_indexed = this.app.blockchain.isBlockIndexed(block_hash);
                if (is_block_indexed) {
                    console.info("SNDBLKHD hash already known: " + Buffer.from(send_block_head_message.block_hash).toString("hex"));
                } else {
                    let block = await this.fetchBlock(block_hash);
                    this.app.mempool.addBlock(block);
                }
                break;

	    //
	    // this delivers the block as NetworkAPI object
	    //
            case "SNDBLKHD":

                let send_block_head_message = SendBlockHeadMessage.deserialize(message.message_data, this.app);
                block_hash = Buffer.from(send_block_head_message.block_hash).toString("hex");
                is_block_indexed = this.app.blockchain.isBlockIndexed(block_hash);
                if (is_block_indexed) {
                    console.info("SNDBLKHD hash already known: " + Buffer.from(send_block_head_message.block_hash).toString("hex"));
                } else {
                    let block = await network.fetchBlock(block_hash);
                    this.app.mempool.addBlock(block);
                }
                break;

            case "SNDTRANS":

        	let tx = new saito.transaction();
        	tx.deserialize(this.app, message.message_data, 0);
                await this.app.mempool.addTransaction(tx);
		break;

            case "SNDKYLST":
		//await this.app.networkApi.sendAPIResponse(this.socket, "ERROR___", message.message_id, Buffer.from("UNHANDLED COMMAND", "utf-8"));
	        break;


            case "SENDMESG":

		console.log("received SENDMESG application message...");
		await peer.handleApplicationMessage(message);
		break;

	    default:
	        console.error("Unhandled command received by client... " + message.message_name);
                await this.app.networkApi.sendAPIResponse(this.socket, "ERROR___", message.message_id, Buffer.from("NO SUCH", "utf-8"));
		break;

	}
    }


    pollPeers(peers, app) {

        const this_network = app.network;

        //
        // loop through peers to see if disconnected
        //
        peers.forEach((peer) => {

            //
            // if disconnected, cleanupDisconnectedSocket
            //
            if (!peer.socket.connected) {
                if (!this.dead_peers.includes(peer)) {
                    this.cleanupDisconnectedSocket(peer);
                }
            }
        });

        //console.log('dead peers to add: ' + this.dead_peers.length);
        // limit amount of time nodes spend trying to reconnect to
        // prevent ddos issues.
        const peer_add_delay = this.peer_monitor_timer_speed - this.peer_monitor_connection_timeout;
        this.dead_peers.forEach((peer) => {
            setTimeout(() => {
                this_network.connectToPeer(JSON.stringify(peer))
            }, peer_add_delay);
        });
        this.dead_peers = [];
    }



    //
    // propagate block
    //
    propagateBlock(blk) {

        if (this.app.BROWSER) {
            return;
        }
        if (!blk) {
            return;
        }
        if (!blk.is_valid) {
            return;
        }

        const data = {bhash: blk.returnHash(), bid: blk.block.id};
        for (let i = 0; i < this.peers.length; i++) {
            if (this.peers[i].peer.sendblks === 1) {
                //let message = new SendBlockHeadMessage(Buffer.from(blk.returnHash(), 'hex'));
                //let buffer = message.serialize();
                //let new_message = SendBlockHeadMessage.deserialize(buffer);
		//this.sendPeerRequest("SNDBLKHD", message.serialize(), this.peers[i]);

		//this.sendPeerRequest("SNDBLOCK", blk.serialize(saito.block.BlockType.Header), this.peers[i]);
		this.sendPeerRequest("SNDBLKHH", Buffer.from(blk.returnHash(), 'hex'), this.peers[i]);
            }
        }
    }


    //
    // propagate transaction
    //
    propagateTransaction(tx, outbound_message = "transaction") {

        if (tx == null) {
            return;
        }
        if (!tx.is_valid) {
            return;
        }
        if (tx.transaction.type === 1) {
            outbound_message = "golden ticket";
        }

        //
        // if this is our (normal) transaction, add to pending
        //
        if (tx.transaction.from[0].add === this.app.wallet.returnPublicKey()) {
            this.app.wallet.addTransactionToPending(tx);
            this.app.connection.emit("update_balance", this.app.wallet);
        }

        if (this.app.BROWSER === 0 && this.app.SPVMODE === 0) {

            //
            // is this a transaction we can use to make a block
            //
            if (this.app.mempool.containsTransaction(tx) !== 1) {

                //
                // return if we can create a transaction
                //
                if (!this.app.mempool.addTransaction(tx)) {
                    console.error("ERROR 810299: balking at propagating bad transaction");
                    console.error("BAD TX: " + JSON.stringify(tx.transaction));
                    return;
                } else {
                    console.log(" ... added transaftion");
                }
                if (this.app.mempool.canBundleBlock() === 1) {
                    return 1;
                }
            }
        }

        //
        // now send the transaction out with the appropriate routing hop
        //
        let fees = tx.returnFeesTotal(this.app);
        for (let i = 0; i < tx.transaction.path.length; i++) {
            fees = fees / 2;
        }
        this.peers.forEach((peer) => {  //&& fees >= peer.peer.minfee
            if (peer.peer.receivetxs === 0) {
                return;
            }
            if (!peer.inTransactionPath(tx) && peer.returnPublicKey() != null) {
                let tmptx = peer.addPathToTransaction(tx);
                if (peer.socket) {
		    this.sendPeerRequest("SNDTRANS", tx.serialize(this.app), peer);
                } else {
                    console.error("socket not found");
                }
            }
        });
    }


    sendPeerRequest(message, data = "", peer) {
        for (let x = this.peers.length - 1; x >= 0; x--) {
            if (this.peers[x] === peer) {
                this.peers[x].sendRequest(message, data);
            }
        }
    }

    sendPeerRequestWithCallback(message, data = "", peer) {
        for (let x = this.peers.length - 1; x >= 0; x--) {
            if (this.peers[x] === peer) {
                this.peers[x].sendRequestWithCallback(message, data, callback);
            }
        }
    }

    sendRequest(message, data = "") {
        for (let x = this.peers.length - 1; x >= 0; x--) {
            this.peers[x].sendRequest(message, data);
        }
    }

    sendRequestWithCallback(message, data = "", callback) {
        for (let x = this.peers.length - 1; x >= 0; x--) {
            this.peers[x].sendRequestWithCallback(message, data, callback);
        }
    }


    //
    // this function requires switching to the new network API
    //
    updatePeersWithWatchedPublicKeys() {
    }

}

Network.ChallengeSize = 82;
Network.ChallengeExpirationTime = 60000;

module.exports = Network;

