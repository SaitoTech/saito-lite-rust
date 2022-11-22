class UtxoSet {
  public slips: Map<string, number>;

  constructor() {
    this.slips = new Map<string, number>();
  }

  update(slipkey:string, val:number) {
    this.slips.set(slipkey, val);
  }

  delete(slipkey:string) {
     this.slips.delete(slipkey);
  }

  validate(slipkey:string) {
    return this.slips.get(slipkey) === 1;
  }
}

export default UtxoSet;
