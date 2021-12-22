"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIMessage = void 0;
/**
 * An APIMessage
 * @typedef {Object} APIMessage
 * @property {array} message_name - The name of the command(remote procedure)
 * @property {number} message_id - The index of the API call, similar to JSON RPC's id.
 * @property {array} message_data - the data being send to the remote procedure
 */
var APIMessage = /** @class */ (function () {
    function APIMessage(message_name, message_id, message_data) {
        this.message_id = 0;
        this.message_data = [];
        this.message_name = message_name;
        this.message_id = message_id;
        this.message_data = message_data;
    }
    return APIMessage;
}());
exports.APIMessage = APIMessage;
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
var NetworkAPI = /** @class */ (function () {
    /**
     *
     * @param {Object} app - the app Object. a catchall for global
     */
    function NetworkAPI(app) {
        this.app = app;
        this.api_call_index = 0;
        this.api_callbacks = {};
        this.socket_counter = 0;
    }
    /**
     * Non-Async function -- just emits a message on the websocket. If it arrives it arrives
     * if it doesn't arrive it doesn't arrive. Broadcast-only with no fancy expectation of a
     * response.
     *
     * @param {WebSocket} ws - a websocket
     * @param {string} command - 8-char string - the API command(remote procedure)
     * @param {array} message_bytes - byte Vector - the message to be passed to the procedure.
     * @returns
     */
    NetworkAPI.prototype.send = function (ws, command, message_bytes) {
        var serialized_api_message = this.serializeAPIMessage(command, this.api_call_index, message_bytes);
        this.api_call_index += 1;
        ws.send(serialized_api_message);
    };
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
    NetworkAPI.prototype.sendAPICall = function (ws, command, message_bytes) {
        var _this = this;
        //console.debug("sendAPICall : " + command);
        return new Promise(function (resolve, reject) {
            _this.api_callbacks[_this.api_call_index] = {
                resolve: resolve, reject: reject
            };
            var serialized_api_message = _this.serializeAPIMessage(command, _this.api_call_index, message_bytes);
            //console.debug("sending message for index " + this.api_call_index + " : " + command);
            _this.api_call_index += 1;
            ws.send(serialized_api_message);
        });
    };
    NetworkAPI.prototype.sendAPIResponse = function (ws, command, message_id, message_bytes) {
        //console.debug("sendAPIResponse : " + command + " : " + message_id);
        var serialized_api_message = this.serializeAPIMessage(command, message_id, message_bytes);
        ws.send(serialized_api_message);
    };
    /**
     * When an API is received with special command "RESULT__", this
     * function is called and automatically dispatches the returned
     * data to the appropriate resolve().
     * @private
     * @param {array} bytes
     */
    NetworkAPI.prototype.receiveAPIResponse = function (api_message) {
        //console.log("receiveAPIResponse : " + api_message.message_id);
        if (this.api_callbacks[api_message.message_id]) {
            //console.log("resolving callback : " + api_message.message_name, api_message.message_data)
            this.api_callbacks[api_message.message_id].resolve(Buffer.from(api_message.message_data));
        }
        else {
            console.error("expected : " + api_message.message_id + " , callback size : " + this.api_callbacks.length);
            throw "response callback not found";
        }
    };
    /**
     * When an API is received with special command "ERROR____", this
     * function is called and automatically dispatches the returned
     * data to the appropriate reject().
     * @private
     * @param {message} bytes vector
     */
    NetworkAPI.prototype.receiveAPIError = function (message) {
        console.log("receiveAPIError", message);
        var index = this.app.binary.u32FromBytes(message.message_id);
        if (this.api_callbacks[index]) {
            this.api_callbacks[index].reject(Buffer.from(message.message_data));
        }
        else {
            throw "error callback not found";
        }
    };
    /**
     * Creates a bytes array ready for the wire representing an API call.
     * @param {string} command - the remote prodecure to call
     * @param {number} index - the index of this call, similar to JSON RPC's "id"
     * @param {array} data - data to be sent
     * @returns array - bytes for the wire
     */
    NetworkAPI.prototype.serializeAPIMessage = function (command, index, data) {
        var enc = new TextEncoder();
        var command_bytes = enc.encode(command);
        var data_bytes = new Uint8Array(data);
        var index_as_bytes = this.app.binary.u32AsBytes(index);
        return new Uint8Array(__spreadArray(__spreadArray(__spreadArray([], __read(command_bytes), false), __read(index_as_bytes), false), __read(data_bytes), false));
    };
    /**
     * Creates an APIMessage Object from bytes sent over the wire
     *
     * @param {Uint8Array} bytes - raw bytes from the wire
     * @returns APIMessage
     */
    NetworkAPI.prototype.deserializeAPIMessage = function (bytes) {
        return new APIMessage(Buffer.from(bytes.slice(0, 8)).toString("utf-8"), this.app.binary.u32FromBytes(Array.from(new Uint8Array(bytes.slice(8, 12)))), Buffer.from(bytes.slice(12)));
    };
    /**
     * Deserialize handshake challenge from the wire
     * @param {array} buffer - raw bytes
     * @returns {HandshakeChallenge}
     */
    NetworkAPI.prototype.deserializeHandshakeChallenge = function (buffer) {
        var their_ip_octets = [];
        their_ip_octets[0] = buffer.readUInt8(0);
        their_ip_octets[1] = buffer.readUInt8(1);
        their_ip_octets[2] = buffer.readUInt8(2);
        their_ip_octets[3] = buffer.readUInt8(3);
        var my_ip_octets = [];
        my_ip_octets[0] = buffer.readUInt8(4);
        my_ip_octets[1] = buffer.readUInt8(5);
        my_ip_octets[2] = buffer.readUInt8(6);
        my_ip_octets[3] = buffer.readUInt8(7);
        var their_address = buffer.slice(8, 41);
        var my_address = buffer.slice(41, 74);
        var timestamp = buffer.slice(74, 82);
        var their_sig = buffer.slice(82, 146);
        return {
            their_ip_octets: their_ip_octets,
            my_ip_octets: my_ip_octets,
            their_address: their_address,
            my_address: my_address,
            timestamp: timestamp,
            their_sig: their_sig
        };
    };
    return NetworkAPI;
}());
exports.default = NetworkAPI;
//# sourceMappingURL=networkapi.js.map