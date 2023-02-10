import Saito from "saito-js/dist/saito";

export default class Crypto {
  public hash(buffer: Uint8Array | string): string {
    if (typeof buffer === "string") {
      return Saito.getInstance().hash(Buffer.from(buffer));
    }
    // 64-bit hash
    return Saito.getInstance().hash(buffer);
  }

  public signBuffer(buffer: Uint8Array, privateKey: string): string {
    return Saito.getInstance().signBuffer(buffer, privateKey);
  }

  public verifySignature(buffer: Uint8Array, sig: string, publicKey: string): boolean {
    return Saito.getInstance().verifySignature(buffer, sig, publicKey);
  }

  public signMessage(msg: string, privateKey: string): string {
    return this.signBuffer(Buffer.from(msg, "utf-8"), privateKey);
  }

  public verifyMessage(msg: string, sig: string, publicKey: string): boolean {
    return this.verifySignature(Buffer.from(msg, "utf-8"), sig, publicKey);
  }
}
