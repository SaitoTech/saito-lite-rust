'use strict'

const JSON = require("json-bigint");


/**
 * Handshake Constructor
 */
class Handshake {

    constructor(app) {

        this.app = app || {};

        return this;
    }

    newHandshake() {
        let h = {};
  	    h.publickey = this.app.wallet.returnPublicKey();
	    h.challenge = Math.floor(Math.random() * 100_000_000_000_000);
        return h;
    }

    //
    // TODO - base58 conversion through app.crypto
    //
    serializeHandshake(h) {
        return Buffer.concat([
	    this.app.binary.u64AsBytes(h.challenge),
	    Buffer.from(this.app.crypto.fromBase58(h.publickey), 'hex')
	]);
    }

    deserializeHandshake(buffer) {

	let h2 = this.newHandshake();

        h2.publickey = this.app.crypto.toBase58(Buffer.from(buffer.slice(0, 33)).toString('hex'));
        h2.challenge = this.app.binary.u64FromBytes(buffer.slice(33, 41));

	return h2;

    }

    async initiateHandshake(socket) {

	let h = this.newHandshake();

        let peer_response = await this.app.networkApi.sendAPICall(socket, "SHAKINIT", this.serializeHandshake(h));
	let h2 = this.deserializeHandshake(peer_response);

	socket.peer.peer.publickey = h2.publickey;

console.log("setting peer publickey to " + socket.peer.peer.publickey);

    }


    async handleIncomingHandshakeRequest(peer, buffer) {

	let h2 = this.deserializeHandshake(buffer);

	peer.peer.publickey = h2.publickey;

console.log("setting publickey to " + h2.publickey);

        this.app.connection.emit("handshake_complete", peer);

	let h = this.newHandshake();
        return this.serializeHandshake(h);

    }

}

module.exports = Handshake;

