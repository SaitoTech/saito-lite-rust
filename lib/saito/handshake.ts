/**
 * Handshake Constructor
 */
import {Saito} from "../../apps/core";
import Peer from "./peer";
import {MessageType} from "./networkapi";
import {randomBytes} from "crypto";

class Handshake {
  public app: Saito;

  constructor(app: Saito) {
    this.app = app;

    return this;
  }

  newHandshakeChallenge() {
    return {
      publickey: this.app.wallet.returnPublicKey(),
      challenge: randomBytes(32),
      lite: this.app.BROWSER,
      block_fetch_url : this.app.BROWSER ? "" : this.app.server.server.block_fetch_url,
    };
  }

  //
  // TODO - base58 conversion through app.crypto
  //
  serializeHandshakeChallenge(h) {
    return Buffer.concat([
      Buffer.from(this.app.crypto.fromBase58(h.publickey), "hex"),
      h.challenge,
      this.app.binary.u64AsBytes(h.lite),
      Buffer.from(this.app.binary.u32AsBytes(h.block_fetch_url.length)),
      Buffer.from(h.block_fetch_url, "utf-8"),
    ]);
  }

  deserializeHandshakeChallenge(buffer) {
    const h2 = this.newHandshakeChallenge();

    h2.publickey = this.app.crypto.toBase58(Buffer.from(buffer.slice(0, 33)).toString("hex"));
    h2.challenge = Buffer.from(buffer.slice(33, 65));
    h2.lite = Number(this.app.binary.u64FromBytes(buffer.slice(65, 73)));
    let length = Number(this.app.binary.u32FromBytes(buffer.slice(73, 77)));
    h2.block_fetch_url = Buffer.from(buffer.slice(77, 77 + length)).toString("utf-8");

    return h2;
  }

  newHandshakeResponse() {
    return {
      publickey: this.app.wallet.returnPublicKey(),
      signature: randomBytes(64),
      challenge: randomBytes(32),
      lite: this.app.BROWSER,
      block_fetch_url : this.app.BROWSER ? "" : this.app.server.server.block_fetch_url,
    }
  }

  serializeHandshakeResponse(r) {
    return Buffer.concat([
      Buffer.from(this.app.crypto.fromBase58(r.publickey), "hex"),
      r.signature,
      r.challenge,
      this.app.binary.u64AsBytes(r.lite),
      Buffer.from(this.app.binary.u32AsBytes(r.block_fetch_url.length)),
      Buffer.from(r.block_fetch_url, "utf-8"),
    ]);
  }

  deserializeHandshakeResponse(buffer) {
    const r = this.newHandshakeResponse();

    r.publickey = this.app.crypto.toBase58(Buffer.from(buffer.slice(0, 33)).toString("hex"));
    r.signature = Buffer.from(buffer.slice(33, 97))
    r.challenge = Buffer.from(buffer.slice(97, 129));
    r.lite = Number(this.app.binary.u64FromBytes(buffer.slice(129, 137)));
    let length = Number(this.app.binary.u32FromBytes(buffer.slice(137, 141)));
    r.block_fetch_url = Buffer.from(buffer.slice(141, 141 + length)).toString("utf-8");

    return r;
  }

  newHandshakeCompletion() {
    return {
      signature : randomBytes(64),
    }
  }

  serializeHandshakeCompletion(c) {
    return Buffer.concat([
      c.signature,
    ]);
  }

  deserializeHandshakeCompletion(buffer) {
    const c = this.newHandshakeCompletion();
    c.signature = Buffer.from(buffer.slice(0, 64))
    return c;
  }

  async initiateHandshake(socket) {
    const h = this.newHandshakeChallenge();
    socket.peer.challenge = h.challenge;
    this.app.networkApi.send(socket,
        MessageType.HandshakeChallenge, this.serializeHandshakeChallenge(h));
  }

  async handleIncomingHandshakeChallenge(peer: Peer, buffer: Buffer) {
    const h2 = this.deserializeHandshakeChallenge(buffer);

    peer.peer.publickey = h2.publickey;
    if (h2.lite === 1) {
      peer.peer.synctype = "lite";
    } else {
      peer.peer.block_fetch_url = h2.block_fetch_url;
    }

    const r = this.newHandshakeResponse();
    peer.challenge = h2.challenge;
    r.signature = this.app.crypto.signBufferWithoutHashing(h2.challenge, this.app.wallet.returnPrivateKey());
    this.app.networkApi.send(peer.socket, MessageType.HandshakeResponse, this.serializeHandshakeResponse(r));
  }

  async handleHandshakeResponse(peer: Peer, buffer: Buffer) {
    const r = this.deserializeHandshakeResponse(buffer);

    if (this.app.crypto.verify(peer.challenge, r.signature.toString("hex"), r.publickey)) {
      peer.peer.publickey = r.publickey;
      if (r.lite === 1) {
        peer.peer.synctype = "lite";
      } else {
        peer.peer.block_fetch_url = r.block_fetch_url;
      }

      this.app.connection.emit("handshake_complete", peer);

      const c = this.newHandshakeCompletion();
      c.signature = this.app.crypto.signBufferWithoutHashing(r.challenge, this.app.wallet.returnPrivateKey());
      this.app.networkApi.send(peer.socket, MessageType.HandshakeCompletion, this.serializeHandshakeCompletion(c));
    }
  }

  async handleHandshakeCompletion(peer: Peer, buffer: Buffer) {
    const c = this.deserializeHandshakeCompletion(buffer);

    if (this.app.crypto.verify(peer.challenge, c.signature.toString("hex"), peer.peer.publickey)) {
      this.app.connection.emit("handshake_complete", peer);
    }
  }
}

export default Handshake;
