import { Saito } from "../../apps/core";
import block from "./block";
import assert from "assert";
import { SLIP_SIZE } from "./transaction";

export enum SlipType {
  Normal = 0,
  ATR = 1,
  VipInput = 2,
  VipOutput = 3,
  MinerInput = 4,
  MinerOutput = 5,
  RouterInput = 6,
  RouterOutput = 7,
  Other = 8,
}

class Slip {
  public add: string;
  public amt: bigint;
  public type: SlipType;
  //public uuid: string;
  public sid: number;
  public block_id: bigint;
  public block_hash: string;
  public tx_ordinal: bigint;
  public lc: boolean;
  public timestamp: number;
  public key: string;
  public from: Array<Slip>;

  // amount can be a string in NOLAN or a BigInt
  constructor(
    publickey = "",
    amount = BigInt(0),
    type = SlipType.Normal,
    slip_ordinal = 0,
    block_id = BigInt(0),
    tx_ordinal = BigInt(0),
    lc = true,
    block_hash = ""
  ) {
    //
    // consensus variables
    //
    this.add = publickey;
    this.amt = BigInt(amount);
    this.type = type;
    //this.uuid = uuid;
    this.sid = slip_ordinal;
    this.block_id = block_id;
    this.tx_ordinal = tx_ordinal;
    //
    // non-consensus variables
    //
    this.lc = lc; // longest-chain
    this.timestamp = 0; // timestamp
    this.key = ""; // index in utxoset hashmap
    this.from = new Array<Slip>();
    this.block_hash = block_hash;
  }

  returnAmount(): bigint {
    return this.amt;
  }

  //
  // slip comparison function was originally created for managing the staking
  // tables since slip insertion / removal needed to be consistent across the
  // network which means a way of agreeing which slips are greater or less
  // than other slips.
  //
  // we are keeping this code as it may be useful in the future to have a
  // standard way to compare slips, although it is not currently used.
  //
  // 1 = self is bigger
  // 2 = other is bigger
  // 3 = same
  //
  compare(other_slip: Slip): number {
    const x = BigInt("0x" + this.returnPublicKey());
    const y = BigInt("0x" + other_slip.returnPublicKey());

    if (x > y) {
      return 1;
    }
    if (y > x) {
      return 2;
    }

    //
    // use the part of the utxoset key that does not include the
    // publickey but includes the amount and slip ordinal, so that
    // testing is happy that manually created slips are somewhat
    // unique for staker-table insertion..
    //
    const a = BigInt(this.returnKey().substring(42, 74));
    const b = BigInt(other_slip.returnKey().substring(42, 74));

    if (a > b) {
      return 1;
    }
    if (b > a) {
      return 2;
    }

    return 3;
  }

  clone() {
    return new Slip(
      this.add,
      BigInt(this.amt.toString()),
      this.type,
      this.sid,
      this.block_id,
      this.tx_ordinal,
      this.lc,
      this.block_hash
    );
  }

  deserialize(app: Saito, buffer) {
    this.add = app.crypto.toBase58(Buffer.from(buffer.slice(0, 33)).toString("hex"));
    // this.uuid = Buffer.from(buffer.slice(33, 65)).toString("hex");
    this.amt = app.binary.u128FromBytes(buffer.slice(33, 49));
    this.block_id = app.binary.u64FromBytes(buffer.slice(49, 57));
    this.tx_ordinal = app.binary.u64FromBytes(buffer.slice(57, 65));
    this.sid = app.binary.u8FromByte(buffer[65]);
    this.type = app.binary.u8FromByte(buffer[66]);

    // convert to BigInts
    this.amt = BigInt(this.amt.toString());
  }

  isNonZeroAmount() {
    if (this.amt == BigInt(0)) {
      return 0;
    }
    return 1;
  }

  onChainReorganization(app: Saito, lc: boolean, slip_value: number) {
    if (this.isNonZeroAmount()) {
      app.utxoset.update(this.returnKey(), slip_value);
    }
  }

  asReadableString() {
    return `         ${this.sid} | ${this.add} | ${this.amt.toString()}`;
  }

  generateKey(app: Saito) {
    const publickey = app.binary.hexToSizedArray(app.crypto.fromBase58(this.add), 33);
    const block_id = app.binary.u64AsBytes(this.block_id.toString());
    const tx_ordinal = app.binary.u64AsBytes(this.tx_ordinal.toString());
    const slip_ordinal = app.binary.u8AsByte(this.sid);
    const amount = app.binary.u128AsBytes(this.amt.toString());

    //console.debug(`Generating UTXOKey for ${this.block_id}, ${this.tx_ordinal}, ${this.sid}`);
    let arr = new Uint8Array([...publickey, ...block_id, ...tx_ordinal, slip_ordinal, ...amount]);
    console.assert(arr.length == 66, "UTXO Key Length is not 66");
    this.key = Buffer.from(arr).toString("hex");
  }

  returnKey() {
    console.assert(this.key != "", "UTXO Key is not generated");
    return this.key;
  }

  returnPublicKey() {
    return this.add;
  }

  /**
   * Serialize Slip
   * @returns {Uint8Array} raw bytes
   * @param app
   * @param uuid
   */
  serialize(app: Saito) {
    const publickey = app.binary.hexToSizedArray(app.crypto.fromBase58(this.add), 33);

    const amount = app.binary.u128AsBytes(this.amt.toString());
    const block_id = app.binary.u64AsBytes(this.block_id.toString());
    const tx_ordinal = app.binary.u64AsBytes(this.tx_ordinal.toString());
    const slip_ordinal = app.binary.u8AsByte(this.sid);
    const slip_type = [this.type as number];

    let arr = new Uint8Array([
      ...publickey,
      ...amount,
      ...block_id,
      ...tx_ordinal,
      slip_ordinal,
      ...slip_type,
    ]);
    console.assert(arr.length == SLIP_SIZE, "Slip Size is incorrect");
    return arr;
  }

  serializeInputForSignature(app: Saito): Uint8Array {
    const publickey = app.binary.hexToSizedArray(app.crypto.fromBase58(this.add), 33);

    const amount = app.binary.u128AsBytes(this.amt.toString());
    // const block_id = app.binary.u64AsBytes(this.block_id.toString());
    // const tx_ordinal = app.binary.u64AsBytes(this.tx_ordinal.toString());
    const slip_ordinal = app.binary.u8AsByte(this.sid);
    const slip_type = [this.type as number];

    let arr = new Uint8Array([...publickey, ...amount, slip_ordinal, ...slip_type]);
    console.assert(arr.length == 51, "serializeInputForSignature Size is incorrect");
    return arr;
  }

  serializeOutputForSignature(app: Saito): Uint8Array {
    const publickey = app.binary.hexToSizedArray(app.crypto.fromBase58(this.add), 33);

    const amount = app.binary.u128AsBytes(this.amt.toString());
    // const block_id = app.binary.u64AsBytes(this.block_id.toString());
    // const tx_ordinal = app.binary.u64AsBytes(this.tx_ordinal.toString());
    const slip_ordinal = app.binary.u8AsByte(this.sid);
    const slip_type = [this.type as number];

    let arr = new Uint8Array([...publickey, ...amount, slip_ordinal, ...slip_type]);
    console.assert(arr.length == 51, "serializeOutputForSignature Size is incorrect");
    return arr;
  }

  validate(app: Saito): boolean {
    if (this.amt > BigInt(0)) {
      return app.utxoset.validate(this.returnKey());
      // return true;
      //return false; // TODO : isSpendable is not implemented. so returning false here for now just to catch bugs.
      // return !!app.utxoset.isSpendable(this.returnKey());
    } else {
      return true;
    }
  }
}

export default Slip;
