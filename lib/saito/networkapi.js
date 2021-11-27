const saito = require('./saito');
const fetch = require('node-fetch');
const {set} = require('numeral');
const Base58 = require("base-58");
const secp256k1 = require('secp256k1');
const blake3 = require('blake3');

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
        console.debug("connectAsWebClient");
        let socket = new WebSocket("ws://127.0.0.1:12101/wsopen");
        socket.onopen = (event) => {
            console.log("connected to network");
            socket.peer = this.app.network.addRemotePeer(socket); // TODO : HACK : till a suitable socket id is found
            this.initiateHandshake(socket);
            // socket.peer.sendRequestWithCallback("application message with callback", JSON.stringify({obj: "object"}), (response) => {
            //     console.log("response received for callback");
            //     console.log(response);
            // });
            let block = new saito.block(mockApp);
            block.block.id = 10;
            block.block.timestamp = 1637034582666;
            block.block.previous_block_hash = "bcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b";
            block.block.merkle = "ccf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b";
            block.block.creator = crypto.toBase58("dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8bcc");
            block.block.burnfee = BigInt(50000000);
            block.block.difficulty = 0;
            block.block.treasury = BigInt(0);
            block.block.staking_treasury = BigInt(0);
            block.block.signature = "c9a6c2d0bf884be6933878577171a3c8094c2bf6e0bc1b4ec3535a4a55224d186d4d891e254736cae6c0d2002c8dfc0ddfc7fcdbe4bc583f96fa5b273b9d63f4";


            let wallet = this.app.wallet;
            let tx = new saito.transaction();
            tx.transaction.ts = 1637034582666;
            tx.transaction.type = saito.transaction.TransactionType.ATR;
            tx.msg = {test: "test"};

            let input_slip = new saito.slip(wallet.wallet.publickey);
            input_slip.uuid = "dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b";
            input_slip.amt = "123";
            input_slip.sid = 10;
            input_slip.type = saito.slip.SlipType.ATR;

            let output_slip = new saito.slip(wallet.wallet.publickey);
            output_slip.uuid = "dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b";
            output_slip.amt = "345";
            output_slip.sid = 23;
            output_slip.type = saito.slip.SlipType.Normal;

            tx.transaction.from.push(input_slip);
            tx.transaction.to.push(output_slip);
            tx.sign(this.app);
            block.transactions.push(tx);

            // this.app.network.propagateTransaction(tx);

            // let block = new saito.block(this.app);
            this.app.network.propagateBlock(block);
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

            console.log("message received by web client : " + api_message.message_name + " : " + api_message.message_id);

            if (api_message.message_name === "RESULT__") {
                this.receiveAPIResponse(api_message);
            } else if (api_message.message_name === "ERROR___") {
                this.receiveAPIError(api_message);
            } else {
                // let peer = this.app.network.findPeer(socket); // TODO : HACK : fix with about socket id comment
                // if (peer) {
                //     await peer.handlePeerCommand(peer, api_message);
                // }
                console.log("handling peer command");
                await socket.peer.handlePeerCommand(socket.peer, api_message);
            }
        };
    }

    async initiateHandshake(ws) {
        console.log("initiateHandshake");

        await this.sendAPICall(ws, "SHAKINIT", Buffer.from("Not implemented..."));

        // let init_handshake_message = Buffer.concat([
        //     Buffer.from(new Uint8Array([127, 0, 0, 1])),
        //     Buffer.from(Base58.decode(this.app.wallet.returnPublicKey()))
        // ]);
        // let handshake_init_response_data = await this.sendAPICall(ws, "SHAKINIT", init_handshake_message);
        // let handshake_challenge = this.deserializeHandshakeChallenge(handshake_init_response_data);
        //
        // console.log(`${handshake_challenge.their_ip_octets[0]}.${handshake_challenge.their_ip_octets[1]}.${handshake_challenge.their_ip_octets[2]}.${handshake_challenge.their_ip_octets[3]}`);
        // console.log(`${handshake_challenge.my_ip_octets[0]}.${handshake_challenge.my_ip_octets[1]}.${handshake_challenge.my_ip_octets[2]}.${handshake_challenge.my_ip_octets[3]}`);
        // console.log(this.app.crypto.compressPublicKey(handshake_challenge.their_address));
        // console.log(this.app.crypto.compressPublicKey(handshake_challenge.my_address));
        // console.log(this.app.crypto.toBase58(handshake_challenge.their_sig));
        //
        // let is_sig_valid = secp256k1.verify(
        //     Buffer.from(blake3.hash(Buffer.from(handshake_init_response_data.slice(0, 82), 'hex')), 'hex'),
        //     handshake_challenge.their_sig,
        //     handshake_challenge.their_address
        // );
        // console.log(is_sig_valid);
        //
        // let {signature, recovery} = secp256k1.sign(
        //     Buffer.from(blake3.hash(handshake_init_response_data), 'hex'),
        //     Buffer.from(this.app.wallet.returnPrivateKey(), 'hex')
        // );
        //
        // const bytes = Buffer.concat([
        //     handshake_init_response_data,
        //     signature
        // ]);
        //
        // let handshake_complete_response_data = await this.sendAPICall(ws, "SHAKCOMP", bytes);
    }

    //
    // Connect and Initialize
    //
    async wsConnectAndInitialize(protocol, host, port) {

        if (this.app.BROWSER) {
            return await this.connectAsWebClient(protocol, host, port);
        }

        const WebSocket = require('ws');
        const ws = new WebSocket('ws://127.0.0.1:3000/wsopen');

        ws.on('open', async (event) => {
            console.debug("connection opened");

            await this.initiateHandshake(ws);
        });
        ws.on('message', (data) => {
            console.log("message received on socket");
            let api_message = this.deserializeAPIMessage(data);
            if (api_message.message_name === "RESULT__") {
                this.receiveAPIResponse(api_message);
            } else if (api_message.message_name === "ERROR___") {
                this.receiveAPIError(api_message);
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
        console.log("sendAPICall : " + command);
        return new Promise((resolve, reject) => {
            this.api_callbacks[this.api_call_index] = {
                resolve: resolve,
                reject: reject
            };
            let serialized_api_message = this.serializeAPIMessage(command, this.api_call_index, message_bytes);
            console.debug("sending message for index " + this.api_call_index + " : " + command);
            this.api_call_index += 1;
            ws.send(serialized_api_message);
        });
    }

    sendAPIResponse(ws, command, message_id, message_bytes) {
        console.log("sendAPIResponse : " + command + " : " + message_id);

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
        console.log("receiveAPIResponse : " + api_message.message_id);

        if (this.api_callbacks[api_message.message_id]) {
            this.api_callbacks[api_message.message_id].resolve(api_message.message_data);
        } else {
            console.error("expected : " + api_message.message_id + " , callback size : " + this.api_callbacks.length);
            throw "response callback not found";
        }
    }

    /**
     * When an API is received with special command "ERROR___", this
     * function is called and automatically dispatches the returned
     * data to the appropriate reject().
     * @private
     * @param {array} bytes vector
     */
    receiveAPIError(bytes) { // TODO : is this working or need fixing?
        console.log("receiveAPIError");
        let index = this.app.binary.u32FromBytes(bytes.slice(8, 12));
        if (this.api_callbacks[index]) {
            this.api_callbacks[index].reject(bytes.slice(12));
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
        return new Uint8Array([
            ...command_bytes,
            ...index_as_bytes,
            ...data_bytes
        ]);
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
            bytes.slice(12));
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
            my_ip_octets: my_ip_octets,
            their_address: their_address,
            my_address: my_address,
            timestamp: timestamp,
            their_sig: their_sig
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

            let init_handshake_message = Buffer.concat([
                Buffer.from(new Uint8Array([127, 0, 0, 1])),
                Buffer.from(Base58.decode(this.app.wallet.returnPublicKey()))
            ]);
            await this.initiateHandshake(ws);

            console.log("handshake complete");

        });
        ws.on('message', (data) => {
            console.log("message received on socket");
            let api_message = this.deserializeAPIMessage(data);
            if (api_message.message_name === "RESULT__") {
                this.receiveAPIResponse(api_message);
            } else if (api_message.message_name === "ERROR___") {
                this.receiveAPIError(api_message);
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
            console.log(`Error fetching block: ${err}`);
        }
    }
}

NetworkAPI.APIMessage = APIMessage;

module.exports = NetworkAPI;
