/**
 * Handshake Constructor
 */
import { Saito } from "../../apps/core";

class Handshake {
  public app: Saito;

  constructor(app: Saito) {
    this.app = app;

    return this;
  }

  newHandshake() {
    const h: any = {};
    h.publickey = this.app.wallet.returnPublicKey();
    h.challenge = Math.floor(Math.random() * 100_000_000_000_000);
    h.lite = this.app.BROWSER;
    return h;
  }

  //
  // TODO - base58 conversion through app.crypto
  //
  serializeHandshake(h) {
    return Buffer.concat([
      Buffer.from(this.app.crypto.fromBase58(h.publickey), "hex"),
      this.app.binary.u64AsBytes(h.challenge),
      this.app.binary.u64AsBytes(h.lite),
    ]);
  }

  deserializeHandshake(buffer) {
    const h2 = this.newHandshake();

    h2.publickey = this.app.crypto.toBase58(
      Buffer.from(buffer.slice(0, 33)).toString("hex")
    );
    h2.challenge = this.app.binary.u64FromBytes(buffer.slice(33, 41));
    h2.lite = Number(this.app.binary.u64FromBytes(buffer.slice(41, 49)));

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
    if (h2.lite === 1) { socket.peer.peer.synctype = "lite"; }
  }

  async handleIncomingHandshakeRequest(peer, buffer) {
    const h2 = this.deserializeHandshake(buffer);

    peer.peer.publickey = h2.publickey;
    if (h2.lite === 1) { peer.peer.synctype = "lite"; }

    this.app.connection.emit("handshake_complete", peer);

    const h = this.newHandshake();
    return this.serializeHandshake(h);
  }
}

export default Handshake;
