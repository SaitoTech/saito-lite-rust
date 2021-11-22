class Hop {

  constructor(from="", to="", sig="") {
    this.from = from;
    this.to   = to;
    this.sig  = sig;
  }


  /**
   * Serialize Hop
   * @param {Hop} hop
   * @returns {array} raw bytes
   */
  serialize(app) {
    let from = app.binary.hexToSizedArray(hop.from, 33);
    let to = app.binary.hexToSizedArray(hop.to, 32);
    let sig = app.binary.hexToSizedArray(hop.sig, 64);
    return new Uint8Array([
       ...from,
       ...to,
       ...sig,
    ]);
  }

  clone() {
    return new saito.hop(this.from, this.to, this.sig);
  }

  /**
   * Deserialize Hop
   * @param {array} buffer
   * @returns {Hop}
   */
  deserialize(app, buffer) {
    let from =  Buffer.from(buffer.slice(0, 33)).toString("hex");
    let to =  Buffer.from(buffer.slice(33, 66)).toString("hex");
    let sig =  Buffer.from(buffer.slice(66, 130)).toString("hex");
    return {
      from: from,
      to: to,
      sig: sig,
    }
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

module.exports = Hop;

