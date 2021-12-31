import { Saito } from "../../apps/core";

export default class Hop {
  public from: string;
  public to: string;
  public sig: string;

  constructor(from = "", to = "", sig = "") {
    this.from = from;
    this.to = to;
    this.sig = sig;
  }

  /**
   * Serialize Hop
   * @returns {array} raw bytes
   * @param app
   */
  serialize(app: Saito): Uint8Array {
    const from = app.binary.hexToSizedArray(this.from, 33);
    const to = app.binary.hexToSizedArray(this.to, 33);
    const sig = app.binary.hexToSizedArray(this.sig, 64);
    return new Uint8Array([...from, ...to, ...sig]);
  }

  clone() {
    return new Hop(this.from, this.to, this.sig);
  }

  /**
   * Deserialize Hop
   * @param app
   * @param {array} buffer
   * @returns {Hop}
   */
  deserialize(app: Saito, buffer) {
    this.from = Buffer.from(buffer.slice(0, 33)).toString("hex");
    this.to = Buffer.from(buffer.slice(33, 66)).toString("hex");
    this.sig = Buffer.from(buffer.slice(66, 130)).toString("hex");
    return this;
  }

  returnFrom(): string {
    return this.from;
  }

  returnSig(): string {
    return this.sig;
  }

  returnTo(): string {
    return this.to;
  }
}
