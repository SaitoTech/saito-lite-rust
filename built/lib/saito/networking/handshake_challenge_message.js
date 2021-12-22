"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var network_1 = require("../network");
var HandshakeNode = /** @class */ (function () {
    function HandshakeNode(ip_address, public_key, sig) {
        if (sig === void 0) { sig = Buffer.from([]); }
        this.ip_address = [];
        this.public_key = [];
        this.sig = Buffer.alloc(64);
        this.ip_address = ip_address;
        this.public_key = public_key;
        this.sig = sig;
    }
    return HandshakeNode;
}());
var HandshakeChallengeMessage = /** @class */ (function () {
    function HandshakeChallengeMessage(challenger_ip_address, challenger_public_key, opponent_ip_address, opponent_public_key, app) {
        this.timestamp = 0;
        this.challenger_node = new HandshakeNode(challenger_ip_address, challenger_public_key);
        this.opponent_node = new HandshakeNode(opponent_ip_address, opponent_public_key);
        this.timestamp = Date.now();
        this.app = app;
    }
    HandshakeChallengeMessage.deserialize = function (bytes, app) {
        //console.log("deserialize handshake message");
        var challenger_octet = Buffer.from(bytes.slice(0, 4));
        var opponent_octet = Buffer.from(bytes.slice(4, 8));
        var challenger_pubkey = Buffer.from(bytes.slice(8, 41));
        var opponent_pubkey = Buffer.from(bytes.slice(41, 74));
        var timestamp = app.binary.u64FromBytes(Buffer.from(bytes.slice(74, network_1.ChallengeSize)));
        var handshake_challenge = new HandshakeChallengeMessage(challenger_octet, challenger_pubkey, opponent_octet, opponent_pubkey, app);
        handshake_challenge.timestamp = timestamp;
        //console.log("byte length : " + bytes.byteLength);
        if (bytes.byteLength > network_1.ChallengeSize) {
            handshake_challenge.challenger_node.sig = bytes.slice(network_1.ChallengeSize, network_1.ChallengeSize + 64);
        }
        if (bytes.byteLength > network_1.ChallengeSize) {
            handshake_challenge.opponent_node.sig = bytes.slice(network_1.ChallengeSize + 64, network_1.ChallengeSize + 128);
        }
        return handshake_challenge;
    };
    HandshakeChallengeMessage.prototype.serialize = function () {
        //console.debug("handshake challenge message serialize", this);
        return Buffer.concat([Buffer.from(this.challenger_node.ip_address),
            Buffer.from(this.opponent_node.ip_address),
            Buffer.from(this.challenger_node.public_key),
            Buffer.from(this.opponent_node.public_key),
            this.app.binary.u64AsBytes(this.timestamp)]);
    };
    HandshakeChallengeMessage.prototype.serializeWithSig = function (privatekey) {
        var buffer = Buffer.from(this.serialize());
        var signature = this.app.crypto.signBuffer(buffer, privatekey);
        return Buffer.concat([buffer, Buffer.from(signature, 'hex')]);
    };
    return HandshakeChallengeMessage;
}());
exports.default = HandshakeChallengeMessage;
//# sourceMappingURL=handshake_challenge_message.js.map