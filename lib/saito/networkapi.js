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

}

NetworkAPI.APIMessage = APIMessage;

module.exports = NetworkAPI;
