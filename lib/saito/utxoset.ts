class UtxoSet {
  public slips: any;

  constructor() {
    this.slips = [];
  }

  update(slipkey, val) {
    this.slips[slipkey] = val;
  }

  delete(slipkey) {
    delete this.slips[slipkey];
  }

  validate(slipkey) {
    if (this.slips[slipkey] == 1) {
      return true;
    }
    return false;
  }
}

export default UtxoSet;
