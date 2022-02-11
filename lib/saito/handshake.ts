/**
 * Handshake Constructor
 */
import { Saito } from "../../apps/core";
import Peer from "./peer";

class Handshake {
  public app: Saito;

  constructor(app: Saito) {
    this.app = app;

    return this;
  }

  newHandshake() {
    return {
      publickey: this.app.wallet.returnPublicKey(),
      challenge: Math.floor(Math.random() * 100_000_000_000_000),
      lite: this.app.BROWSER,
      server_port: this.app.BROWSER ? 0 : this.app.server.server.endpoint.port,
      server_ip: this.app.BROWSER ? "" : this.app.server.server.endpoint.host,
      server_protocol: this.app.BROWSER ? "" : this.app.server.server.endpoint.protocol,
    };
  }

  //
  // TODO - base58 conversion through app.crypto
  //
  serializeHandshake(h) {
    return Buffer.concat([
      Buffer.from(this.app.crypto.fromBase58(h.publickey), "hex"),
      this.app.binary.u64AsBytes(h.challenge),
      this.app.binary.u64AsBytes(h.lite),
      Buffer.from(this.app.binary.u32AsBytes(h.server_port)),
      Buffer.from(this.app.binary.u32AsBytes(h.server_ip.length)),
      Buffer.from(h.server_ip, "utf-8"),
      Buffer.from(this.app.binary.u32AsBytes(h.server_protocol.length)),
      Buffer.from(h.server_protocol),
    ]);
  }

  deserializeHandshake(buffer) {
    const h2 = this.newHandshake();

    h2.publickey = this.app.crypto.toBase58(Buffer.from(buffer.slice(0, 33)).toString("hex"));
    h2.challenge = Number(this.app.binary.u64FromBytes(buffer.slice(33, 41)));
    h2.lite = Number(this.app.binary.u64FromBytes(buffer.slice(41, 49)));

    h2.server_port = this.app.binary.u32FromBytes(buffer.slice(49, 53));
    let length = Number(this.app.binary.u32FromBytes(buffer.slice(53, 57)));

    h2.server_ip = Buffer.from(buffer.slice(57, 57 + length)).toString("utf-8");

    const offset = 57 + length;
    length = Number(this.app.binary.u32FromBytes(buffer.slice(offset, offset + 4)));
    h2.server_protocol = Buffer.from(buffer.slice(offset + 4, offset + 4 + length)).toString(
      "utf-8"
    );

    return h2;
  }

  async initiateHandshake(socket) {
    const h = this.newHandshake();

    const peer_response = await this.app.networkApi.sendAPICall(
      socket,
      "SHAKINIT",
      this.serializeHandshake(h)
    );
    const h2 = this.deserializeHandshake(peer_response);

    socket.peer.peer.publickey = h2.publickey;
    if (h2.lite === 1) {
      socket.peer.peer.synctype = "lite";
    }
  }

  async handleIncomingHandshakeRequest(peer: Peer, buffer: Buffer) {
    const h2 = this.deserializeHandshake(buffer);

    peer.peer.publickey = h2.publickey;
    if (h2.lite === 1) {
      peer.peer.synctype = "lite";
    } else {
      peer.peer.host = h2.server_ip;
      peer.peer.port = h2.server_port;
      peer.peer.protocol = h2.server_protocol;
    }

    this.app.connection.emit("handshake_complete", peer);

    const h = this.newHandshake();
    return this.serializeHandshake(h);
  }
}

export default Handshake;
