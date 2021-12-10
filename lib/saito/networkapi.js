const saito = require('./saito');
const fetch = require('node-fetch');
const {set} = require('numeral');
const Base58 = require("base-58");
const secp256k1 = require('secp256k1');
const blake3 = require('blake3');
const HandshakeChallengeMessage = require("./networking/handshake_challenge_message");

/**
 * An APIMessage
 * @typedef {Object} APIMessage
 * @property {array} message_name - The name of the command(remote procedure)
 * @property {number} message_id - The index of the API call, similar to JSON RPC's id.
 * @property {array} message_data - the data being send to the remote procedure
 */
class APIMessage {
    message_name = [];
    message_id = 0;
    message_data = [];

    constructor(message_name, message_id, message_data) {
        this.message_name = message_name;
        this.message_id = message_id;
        this.message_data = message_data;
    }
}

/**
 * A handshake Challenge
 * @typedef {Object} HandshakeChallenge
 * @property {array} their_ip_octets - four numbers representing an IP(v4)
 * @property {array} my_ip_octets - four numbers representing an IP(v4)
 * @property {string} their_address - a pubkey(hex)
 * @property {string} my_address - a pubkey(hex)
 * @property {u64} timestamp - unix timestamp of the challenge
 * @property {array} their_sig - bytes
 */

/**
 * This class provides functions for interacting with other nodes. It wraps
 * the low level socket/http functionality with higher-level functions
 * which can be passed things like a socket or binary data to process them
 * into JS objects or wrap the socket in async functions for easier integration.
 */
class NetworkAPI {

    /**
     *
     * @param {Object} app - the app Object. a catchall for global
     */
    constructor(app) {
        this.app = app;
        this.api_call_index = 0;
        this.api_callbacks = {};
        this.socket_counter = 0;
    }

    async connectAsWebClient(protocol, host, port) {
        //
        // TODO - must connect to proper peer
        //
        //console.log("connectAsWebClient");
        //let socket = new WebSocket("ws://127.0.0.1:12101/wsopen");
        //tmp hack to handle websocket protocol
        let wsProtocol = 'ws';
        if (protocol === 'https') (wsProtocol = 'wss');
        let socket = new WebSocket(`${wsProtocol}://${host}:${port}/wsopen`);

        socket.onopen = (event) => {
            console.log("connected to network", event);
            // socket.peer = this.app.network.addRemotePeer(socket); // TODO : HACK : till a suitable socket id is found
            this.initiateHandshake(socket);
        };
        socket.onclose = (event) => {
            console.log(`[close] Connection closed cleanly by web client, code=${event.code} reason=${event.reason}`);
            this.app.network.cleanupDisconnectedSocket(socket);
        };
        socket.onerror = (event) => {
            console.log(`[error] ${event.message}`);
        };
        socket.onmessage = async (event) => {

            let data = await event.data.arrayBuffer();
            let api_message = this.app.networkApi.deserializeAPIMessage(data);
            //console.debug("message received by web client", api_message);
            if (api_message.message_name === "RESULT__") {
                this.receiveAPIResponse(api_message);
            } else if (api_message.message_name === "ERROR___") {
                this.receiveAPIError(api_message);
            } else {
                // let peer = this.app.network.findPeer(socket); // TODO : HACK : fix with about socket id comment
                // if (peer) {
                //     await peer.handlePeerCommand(api_message);
                // }
                //console.log("handling peer command - receiving peer id " + socket.peer.id);
                await socket.peer.handlePeerCommand(api_message);
            }
        };

        return socket;

    }

    async initiateHandshake(ws) {
        //console.debug("initiateHandshake");

        let init_handshake_message = Buffer.concat([
                                                       Buffer.from(new Uint8Array([127, 0, 0, 1])),
                                                       Buffer.from(Base58.decode(this.app.wallet.returnPublicKey()))
                                                   ]);
        let handshake_init_response_data = await this.sendAPICall(ws, "SHAKINIT", init_handshake_message);
        let handshake_challenge = HandshakeChallengeMessage.deserialize(handshake_init_response_data, this.app);

        //
        // update peer publickey
        //
        ws.peer.peer.publickey = this.app.crypto.toBase58(Buffer.from(handshake_challenge.challenger_node.public_key).toString('hex'));

        let is_sig_valid = this.app.crypto.verifyHash(this.app.crypto.hash(handshake_init_response_data.slice(0, saito.network.ChallengeSize)),
                                                      Buffer.from(handshake_challenge.challenger_node.sig).toString("hex"),
                                                      this.app.crypto.toBase58(Buffer.from(handshake_challenge.challenger_node.public_key)
                                                                                   .toString("hex"))
        );

        // TODO : take a decision on is_sig_valid ???

        let signature = this.app.crypto.signBuffer(Buffer.from(handshake_init_response_data), this.app.wallet.returnPrivateKey());

        //console.debug("handshake_challenge ", handshake_challenge);
        let bytes = Buffer.concat([Buffer.from(handshake_init_response_data), Buffer.from(signature, 'hex')]);
        let handshake_complete_response_data = await this.sendAPICall(ws, "SHAKCOMP", bytes);
        // console.debug("handshake complete response data", handshake_complete_response_data);

        this.app.connection.emit("handshake_complete", ws.peer);
    }

    //
    // Connect and Initialize
    //
    async wsConnectAndInitialize(protocol, host, port) {

        if (this.app.BROWSER) {
            return await this.connectAsWebClient(protocol, host, port);
        }
        let wsProtocol = 'ws';
        if (protocol === 'https') (wsProtocol = 'wss');
        const WebSocket = require('ws');
        const ws = new WebSocket(`${protocol}//${host}:${port}/wsopen`);

        ws.on('open', async (event) => {
            //console.debug("connection opened", event);

            await this.initiateHandshake(ws);
        });
        ws.on('message', async (data) => {
            let api_message = this.deserializeAPIMessage(data);
            console.debug("message received on socket", api_message);
            if (api_message.message_name === "RESULT__") {
                this.receiveAPIResponse(api_message);
            } else if (api_message.message_name === "ERROR___") {
                this.receiveAPIError(api_message);
            } else {
                // let peer = this.app.network.findPeer(socket); // TODO : HACK : fix with about socket id comment
                // if (peer) {
                //     await peer.handlePeerCommand(api_message);
                // }
                console.debug("handling peer command - receiving peer id " + ws.peer.id, api_message);
                await ws.peer.handlePeerCommand(api_message);
            }
        });
        ws.on('error', (event) => {
            console.log(`[error] ${event.message}`);
        });
        ws.on('close', (event) => {
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        });

        return ws;

    }


    /**
     * Initialization function. Sometimes needed if constructor is too early, i.e.
     * other parts of the system may not be ready yet.
     */
    initialize() {
        // Demo of how to connect to Rust here:
        // Disabling these, they are not meant to be shipped.
        if (!this.app.BROWSER) {
            console.log("Connect to Rust client!");
            this.wsConnectToRustPeer();
            console.log("Connect to Rust client!");
            this.getDemoBlockFromRust();
            console.log("Connect to Rust client!");
        }
    }

    /**
     * Async function. A simple mechanism for managing responses to messages sent over the socket.
     * Will keep track of the call index and automatically call resolve/response with a RESULT__
     * is sent back.
     *
     * @param {WebSocket} ws - a websocket
     * @param {string} command - 8-char string - the API command(remote procedure)
     * @param {array} message_bytes - byte Vector - the message to be passed to the procedure.
     * @returns
     */
    sendAPICall(ws, command, message_bytes) {
        //console.debug("sendAPICall : " + command);
        return new Promise((resolve, reject) => {
            this.api_callbacks[this.api_call_index] = {
                resolve: resolve, reject: reject
            };
            let serialized_api_message = this.serializeAPIMessage(command, this.api_call_index, message_bytes);
            //console.debug("sending message for index " + this.api_call_index + " : " + command);
            this.api_call_index += 1;
            ws.send(serialized_api_message);
        });
    }

    sendAPIResponse(ws, command, message_id, message_bytes) {
        //console.debug("sendAPIResponse : " + command + " : " + message_id);
        let serialized_api_message = this.serializeAPIMessage(command, message_id, message_bytes);
        ws.send(serialized_api_message);
    }

    /**
     * When an API is received with special command "RESULT__", this
     * function is called and automatically dispatches the returned
     * data to the appropriate resolve().
     * @private
     * @param {array} bytes
     */
    receiveAPIResponse(api_message) {
        //console.log("receiveAPIResponse : " + api_message.message_id);

        if (this.api_callbacks[api_message.message_id]) {
            //console.log("resolving callback : " + api_message.message_name, api_message.message_data)
            this.api_callbacks[api_message.message_id].resolve(Buffer.from(api_message.message_data));
        } else {
            console.error("expected : " + api_message.message_id + " , callback size : " + this.api_callbacks.length);
            throw "response callback not found";
        }
    }

    /**
     * When an API is received with special command "ERROR____", this
     * function is called and automatically dispatches the returned
     * data to the appropriate reject().
     * @private
     * @param {message} bytes vector
     */
    receiveAPIError(message) { // TODO : is this working or need fixing?
        console.log("receiveAPIError", message);
        let index = this.app.binary.u32FromBytes(message.message_id);
        if (this.api_callbacks[index]) {
            this.api_callbacks[index].reject(Buffer.from(message.message_data));
        } else {
            throw "error callback not found";
        }
    }

    /**
     * Creates a bytes array ready for the wire representing an API call.
     * @param {string} command - the remote prodecure to call
     * @param {number} index - the index of this call, similar to JSON RPC's "id"
     * @param {array} data - data to be sent
     * @returns array - bytes for the wire
     */
    serializeAPIMessage(command, index, data) {
        const enc = new TextEncoder();
        const command_bytes = enc.encode(command);
        const data_bytes = new Uint8Array(data);
        let index_as_bytes = this.app.binary.u32AsBytes(index);
        return new Uint8Array([...command_bytes, ...index_as_bytes, ...data_bytes]);
    }

    /**
     * Creates an APIMessage Object from bytes sent over the wire
     *
     * @param {Uint8Array} bytes - raw bytes from the wire
     * @returns APIMessage
     */
    deserializeAPIMessage(bytes) {
        return new APIMessage(Buffer.from(bytes.slice(0, 8)).toString("utf-8"),
                              this.app.binary.u32FromBytes(Array.from(new Uint8Array(bytes.slice(8, 12)))),
                              Buffer.from(bytes.slice(12))
        );
    }

    /**
     * Deserialize handshake challenge from the wire
     * @param {array} buffer - raw bytes
     * @returns {HandshakeChallenge}
     */
    deserializeHandshakeChallenge(buffer) {
        let their_ip_octets = [];
        their_ip_octets[0] = buffer.readUInt8(0);
        their_ip_octets[1] = buffer.readUInt8(1);
        their_ip_octets[2] = buffer.readUInt8(2);
        their_ip_octets[3] = buffer.readUInt8(3);

        let my_ip_octets = [];
        my_ip_octets[0] = buffer.readUInt8(4);
        my_ip_octets[1] = buffer.readUInt8(5);
        my_ip_octets[2] = buffer.readUInt8(6);
        my_ip_octets[3] = buffer.readUInt8(7);

        let their_address = buffer.slice(8, 41);
        let my_address = buffer.slice(41, 74);
        let timestamp = buffer.slice(74, 82);
        let their_sig = buffer.slice(82, 146);
        return {
            their_ip_octets: their_ip_octets,
            my_ip_octets:    my_ip_octets,
            their_address:   their_address,
            my_address:      my_address,
            timestamp:       timestamp,
            their_sig:       their_sig
        }
    }


    //
    // DEMO TEST FUNCTION, SHOULD BE REFACTORED
    //
    async wsConnectToRustPeer(protocol, host, port) {

        const WebSocket = require('ws');
        const ws = new WebSocket('http://127.0.0.1:3000/wsopen');

        ws.on('open', async (event) => {

            console.log("initing rust Peer Socket");

            let init_handshake_message = Buffer.concat([Buffer.from(new Uint8Array([127, 0, 0, 1])),
                                                           Buffer.from(Base58.decode(this.app.wallet.returnPublicKey()))]);
            await this.initiateHandshake(ws);

            console.log("handshake complete");

        });
        ws.on('message', async (data) => {
            let api_message = this.deserializeAPIMessage(data);
            console.debug("message received on socket (peer)", api_message);
            if (api_message.message_name === "RESULT__") {
                this.receiveAPIResponse(api_message);
            } else if (api_message.message_name === "ERROR___") {
                this.receiveAPIError(api_message);
            } else {
                // let peer = this.app.network.findPeer(socket); // TODO : HACK : fix with about socket id comment
                // if (peer) {
                //     await peer.handlePeerCommand(api_message);
                // }
                console.debug("handling peer command - receiving peer id " + ws.peer.id);
                await ws.peer.handlePeerCommand(api_message);
            }
        });
        ws.on('error', (event) => {
            console.log(`[error] ${event.message}`);
        });
        ws.on('close', (event) => {
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        });
    }


    //
    // DEMO TEST FUNCTION, SHOULD BE REFACTORED
    //
    async getDemoBlockFromRust() {
        const fetch = require('node-fetch');
        try {
            const url = `http://127.0.0.1:3000/block/403fa38a30aa0028f3d7020c4856474eaaf4e6e9b8346142ee83624352ae069d`;
            const res = await fetch(url);
            if (res.ok) {
                const buffer = await res.buffer();
                let block = new saito.block(this.app);
                block.deserialize(buffer);
                console.log(`GOT BLOCK ${block.id} ${block.timestamp}`)
            } else {
                console.log(`Error fetching block: Status ${res.status} -- ${res.statusText}`);
            }
        } catch (err) {
            console.log(`Error fetching block:`);
            console.error(err);
        }
    }
}

NetworkAPI.APIMessage = APIMessage;

module.exports = NetworkAPI;
