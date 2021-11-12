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
    let from = Buffer.from(hop.from, 'hex');
    let to = Buffer.from(hop.to, 'hex');
    let sig = Buffer.from(hop.sig, 'hex');
    return new Uint8Array([
       ...from,
       ...to,
       ...sig,
    ]);;
  }

  /**
   * Deserialize Hop
   * @param {array} buffer
   * @returns {Hop}
   */
  deserialize(app, buffer) {
    let from = app.crypto.stringToHex(buffer.slice(0, 33));
    let to = app.crypto.stringToHex(buffer.slice(33, 66));
    let sig = app.crypto.stringToHex(buffer.slice(66, 130));
    return {
      from: from,
      to: to,
      sig: sig,
    }
  }

}

module.exports = Hop;

