'use strict'

const crypto = require('crypto-browserify');
const sha256 = require('sha256');
const node_cryptojs = require('node-cryptojs-aes');
const {randomBytes} = require('crypto');
const secp256k1 = require('secp256k1');
const CryptoJS = node_cryptojs.CryptoJS;
const JsonFormatter = node_cryptojs.JsonFormatter;
const Base58 = require("base-58");
const stringify = require('fastest-stable-stringify');


/**
 * Handshake Constructor
 */
class Handshake {

    constructor(app) {

        this.app = app || {};

        return this;
    }



    buildSerializedChallenge(message) {
        //console.debug("buildSerializedChallenge", message);
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
        //console.debug("socketHandshakeVerify", challenge);
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

}

module.exports = Handshake;

