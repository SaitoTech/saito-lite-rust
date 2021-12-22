import { Saito } from "../../apps/core";
import saito from "./saito";

class Hop {
  public from: any;
  public to: any;
  public sig: any;

  constructor(from = "", to = "", sig = "") {
    this.from = from;
    this.to = to;
    this.sig = sig;
  }

  /**
   * Serialize Hop
   * @param {Hop} hop
   * @returns {array} raw bytes
   */
  serialize(app) {
    const from = app.binary.hexToSizedArray(this.from, 33);
    const to = app.binary.hexToSizedArray(this.to, 32);
    const sig = app.binary.hexToSizedArray(this.sig, 64);
    return new Uint8Array([...from, ...to, ...sig]);
  }

  clone() {
    return new saito.hop(this.from, this.to, this.sig);
  }

  /**
   * Deserialize Hop
   * @param {array} buffer
   * @returns {Hop}
   */
  deserialize(app: Saito, buffer) {
    this.from = Buffer.from(buffer.slice(0, 33)).toString("hex");
    this.to = Buffer.from(buffer.slice(33, 66)).toString("hex");
    this.sig = Buffer.from(buffer.slice(66, 130)).toString("hex");
    return this;
  }

  returnFrom() {
    return this.from;
  }

  returnSig() {
    return this.sig;
  }

  returnTo() {
    return this.to;
  }
}

export default Hop;
