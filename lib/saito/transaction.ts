import saito from "./saito";

import * as JSON from "json-bigint";
import Slip, { SlipType } from "./slip";
import Hop from "./hop";
import { Saito } from "../../apps/core";

export const TRANSACTION_SIZE = 93;
export const SLIP_SIZE = 67;
export const HOP_SIZE = 130;

export enum TransactionType {
  Normal = 0,
  Fee = 1,
  GoldenTicket = 2,
  ATR = 3,
  Vip = 4,
  SPV = 5,
  Issuance = 6,
  Other = 7,
}

class Transaction {
  public transaction = {
    to: new Array<Slip>(),
    from: new Array<Slip>(),
    ts: 0,
    sig: "",
    r: 1, // "replaces" (how many txs this represents in merkle-tree -- spv block)
    type: TransactionType.Normal,
    m: Buffer.alloc(0),
  };
  public optional: any;
  public fees_total: bigint;
  public work_available_to_me: bigint;
  public work_available_to_creator: bigint;
  public work_cumulative: bigint;
  public msg: any;
  public dmsg: any;
  public size: number;
  public is_valid: any;
  public path: Array<Hop>;

  constructor(jsonobj = null) {
    /////////////////////////
    // consensus variables //
    /////////////////////////

    this.fees_total = BigInt(0);
    this.work_available_to_me = BigInt(0);
    this.work_available_to_creator = BigInt(0);
    this.work_cumulative = BigInt(0);
    //
    // cumulative fees. this is calculated when
    // we process the block so that we can quickly
    // select the winning transaction based on the
    // golden ticket. it indicates how much this
    // transaction carries in work in the overall
    // weight of the block. we use this to find
    // the winning node in the block for the
    // routing payment. i.e. this measures the
    // cumulative weight of the usable fees that
    // are behind the transactions.

    this.optional = {}; // non-signed field for users
    this.msg = {};
    this.dmsg = "";
    this.size = 0;
    this.is_valid = 1;
    this.path = new Array<Hop>();

    if (jsonobj != null) {
      this.transaction = jsonobj;
      if (this.transaction.type === TransactionType.Normal) {
        try {
          let buffer = Buffer.from(this.transaction.m);
          if (buffer.byteLength === 0) {
            this.msg = {};
          } else {
            try {
              const reconstruct = Buffer.from(this.transaction.m).toString("utf-8");
              this.msg = JSON.parse(reconstruct);
            } catch (error) {
              console.log("failed parsing the msg as base64. trying as a utf8");
              console.error(error);
              const reconstruct = Buffer.from(this.transaction.m).toString("utf-8");
              this.msg = JSON.parse(reconstruct);
            }
          }
        } catch (err) {
          console.log("failed converting buffer in tx : ", this.transaction);
          console.error(err);
        }
      }
      for (let i = 0; i < this.transaction.from.length; i++) {
        const fslip = this.transaction.from[i];
        this.transaction.from[i] = new Slip(
          fslip.add,
          fslip.amt,
          fslip.type,
          fslip.sid,
          fslip.block_id,
          fslip.tx_ordinal
        );
      }
      for (let i = 0; i < this.transaction.to.length; i++) {
        const fslip = this.transaction.to[i];
        this.transaction.to[i] = new Slip(
          fslip.add,
          fslip.amt,
          fslip.type,
          fslip.sid,
          fslip.block_id,
          fslip.tx_ordinal
        );
      }
    }

    return this;
  }

  addInput(slip: Slip) {
    this.transaction.from.push(slip);
  }

  addOutput(slip: Slip) {
    this.transaction.to.push(slip);
  }

  clone() {
    const tx = new Transaction();
    tx.transaction.from = [];
    tx.transaction.to = [];
    for (let i = 0; i < this.transaction.from.length; i++) {
      tx.transaction.from.push(this.transaction.from[i].clone());
    }
    for (let i = 0; i < this.transaction.to.length; i++) {
      tx.transaction.to.push(this.transaction.to[i].clone());
    }
    tx.transaction.ts = this.transaction.ts;
    tx.transaction.sig = this.transaction.sig;
    tx.path = new Array<Hop>();
    for (let i = 0; i < this.path.length; i++) {
      tx.path.push(this.path[i].clone());
    }
    tx.transaction.r = this.transaction.r;
    tx.transaction.type = this.transaction.type;
    tx.transaction.m = this.transaction.m;

    return tx;
  }

  decryptMessage(app: Saito) {
    if (this.transaction.from[0].add !== app.wallet.returnPublicKey()) {
      try {
        if (this.msg === null) {
          this.dmsg = "";
        } else {
          const parsed_msg = this.msg;
          this.dmsg = app.keys.decryptMessage(this.transaction.from[0].add, parsed_msg);
        }
      } catch (e) {
        console.error("ERROR: " + e);
      }
      return;
    }
    try {
      if (this.msg === null) {
        this.dmsg = "";
        return;
      }
      this.dmsg = app.keys.decryptMessage(this.transaction.to[0].add, this.msg);
    } catch (e) {
      this.dmsg = "";
    }
    return;
  }

  /**
   * Deserialize Transaction
   * @param app
   * @param {array} buffer - raw bytes, perhaps an entire block
   * @param {number} start_of_transaction_data - where in the buffer does the tx data begin
   * @returns {Transaction}
   */
  deserialize(app: Saito, buffer: Uint8Array, start_of_transaction_data) {
    const inputs_len = app.binary.u32FromBytes(
      buffer.slice(start_of_transaction_data, start_of_transaction_data + 4)
    );
    const outputs_len = app.binary.u32FromBytes(
      buffer.slice(start_of_transaction_data + 4, start_of_transaction_data + 8)
    );
    const message_len = app.binary.u32FromBytes(
      buffer.slice(start_of_transaction_data + 8, start_of_transaction_data + 12)
    );
    const path_len = app.binary.u32FromBytes(
      buffer.slice(start_of_transaction_data + 12, start_of_transaction_data + 16)
    );

    const signature = app.crypto.stringToHex(
      buffer.slice(start_of_transaction_data + 16, start_of_transaction_data + 80)
    );
    const timestamp = app.binary.u64FromBytes(
      buffer.slice(start_of_transaction_data + 80, start_of_transaction_data + 88)
    );
    const r = app.binary.u32FromBytes(
      buffer.slice(start_of_transaction_data + 88, start_of_transaction_data + 92)
    );
    const transaction_type = Number(buffer[start_of_transaction_data + 92]) as TransactionType;
    const start_of_inputs = start_of_transaction_data + TRANSACTION_SIZE;
    const start_of_outputs = start_of_inputs + inputs_len * SLIP_SIZE;
    const start_of_message = start_of_outputs + outputs_len * SLIP_SIZE;
    const start_of_path = start_of_message + message_len;

    const inputs = new Array<Slip>();
    for (let i = 0; i < inputs_len; i++) {
      const start_of_slip = start_of_inputs + i * SLIP_SIZE;
      const end_of_slip = start_of_slip + SLIP_SIZE;
      const input = new Slip();
      input.deserialize(app, buffer.slice(start_of_slip, end_of_slip));
      inputs.push(input);
    }
    const outputs = new Array<Slip>();
    for (let i = 0; i < outputs_len; i++) {
      const start_of_slip = start_of_outputs + i * SLIP_SIZE;
      const end_of_slip = start_of_slip + SLIP_SIZE;
      const output = new Slip();
      output.deserialize(app, buffer.slice(start_of_slip, end_of_slip));
      outputs.push(output);
    }
    const message = buffer.slice(start_of_message, start_of_message + message_len);

    const path = new Array<Hop>();
    for (let i = 0; i < path_len; i++) {
      const start_of_data = start_of_path + i * HOP_SIZE;
      const end_of_data = start_of_data + HOP_SIZE;
      const hop = new Hop();
      hop.deserialize(app, buffer.slice(start_of_data, end_of_data));
      path.push(hop);
    }

    this.transaction.from = inputs;
    this.transaction.to = outputs;
    this.transaction.ts = Number(timestamp);
    this.transaction.sig = signature;
    this.path = path;
    this.transaction.r = Number(r);
    this.transaction.type = transaction_type;
    this.transaction.m = Buffer.from(message);

    try {
      if (this.transaction.type === TransactionType.Normal) {
        if (this.transaction.m.byteLength === 0) {
          this.msg = {};
        } else {
          const reconstruct = Buffer.from(this.transaction.m).toString("utf-8");
          this.msg = JSON.parse(reconstruct);
        }
      }
    } catch (err) {
      //console.log("buffer length = " + this.transaction.m.byteLength);
      //console.error("error trying to parse this.msg: ", err);
      console.error("error trying to parse the message as JSON, tx : ", this.transaction.sig);
    }
  }

  generateRebroadcastTransaction(
    app: Saito,
    output_slip_to_rebroadcast,
    with_fee,
    with_staking_subsidy
  ) {
    const transaction = new Transaction();

    let output_payment = BigInt(0);
    if (output_slip_to_rebroadcast.returnAmount() > with_fee) {
      output_payment =
        BigInt(output_slip_to_rebroadcast.returnAmount()) -
        BigInt(with_fee) +
        BigInt(with_staking_subsidy);
    }

    transaction.transaction.type = TransactionType.ATR;

    const output = new Slip();
    output.add = output_slip_to_rebroadcast.add;
    output.amt = output_payment;
    output.type = SlipType.ATR;
    // output.block_id = output_slip_to_rebroadcast.block_id;
    // output.tx_ordinal = output_slip_to_rebroadcast.tx_ordinal;
    // output.sid = output_slip_to_rebroadcast.sid;

    //
    // if this is the FIRST time we are rebroadcasting, we copy the
    // original transaction into the message field in serialized
    // form. this preserves the original message and its signature
    // in perpetuity.
    //
    // if this is the SECOND or subsequent rebroadcast, we do not
    // copy the ATR tx (no need for a meta-tx) and rather just update
    // the message field with the original transaction (which is
    // by definition already in the previous TX message space.
    //
    if (output_slip_to_rebroadcast.type === SlipType.ATR) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      transaction.transaction.m = transaction_to_rebroadcast.transaction.m;
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      transaction.transaction.m = transaction_to_rebroadcast.serialize(app);
    }

    transaction.addOutput(output);

    //
    // signature is the ORIGINAL signature. this transaction
    // will fail its signature check and then get analysed as
    // a rebroadcast transaction because of its transaction type.
    //
    transaction.sign(app);

    return transaction;
  }

  isGoldenTicket() {
    return this.transaction.type === TransactionType.GoldenTicket;
  }

  isFeeTransaction() {
    return this.transaction.type === TransactionType.Fee;
  }

  isIssuanceTransaction() {
    return this.transaction.type === TransactionType.Issuance;
  }

  isFrom(senderPublicKey) {
    return this.returnSlipsFrom(senderPublicKey).length !== 0;
  }

  isTo(receiverPublicKey) {
    return this.returnSlipsTo(receiverPublicKey).length > 0;
  }

  onChainReorganization(app: Saito, lc, block_id: bigint) {
    let input_slip_value = 1;
    let output_slip_value = 0;

    if (lc) {
      input_slip_value = Number(block_id);
      output_slip_value = 1;
    }

    for (let i = 0; i < this.transaction.from.length; i++) {
      this.transaction.from[i].onChainReorganization(app, lc, input_slip_value);
    }
    for (let i = 0; i < this.transaction.to.length; i++) {
      this.transaction.to[i].onChainReorganization(app, lc, output_slip_value);
    }
  }

  asReadableString() {
    let html = "";
    html += `
      timestamp:   ${this.transaction.ts}
      signature:   ${this.transaction.sig}
      type:        ${this.transaction.type}
      message:     ${this.transaction.m}
      === from slips ==
`;
    for (let i = 0; i < this.transaction.from.length; i++) {
      html += this.transaction.from[i].asReadableString();
      html += "\n";
    }
    html += `      === to slips ==
`;
    for (let i = 0; i < this.transaction.to.length; i++) {
      html += this.transaction.to[i].asReadableString();
      html += "\n";
    }
    html += `
`;
    return html;
  }

  returnFeesTotal(): bigint {
    if (this.fees_total === BigInt(0)) {
      //
      // sum inputs
      //
      let inputs = BigInt(0);
      if (this.transaction.from != null) {
        for (let v = 0; v < this.transaction.from.length; v++) {
          inputs += this.transaction.from[v].returnAmount();
        }
      }

      //
      // sum outputs
      //
      let outputs = BigInt(0);
      for (let v = 0; v < this.transaction.to.length; v++) {
        //
        // do not count outputs in GT and FEE txs create outputs that cannot be counted.
        //
        if (
          this.transaction.to[v].type !== SlipType.ATR &&
          this.transaction.to[v].type !== SlipType.VipInput
        ) {
          outputs += this.transaction.to[v].returnAmount();
        }
      }

      this.fees_total = inputs - outputs;
    }

    return this.fees_total;
  }

  returnMessage() {
    if (this.dmsg !== "") {
      return this.dmsg;
    }

    if (!!this.msg && Object.keys(this.msg).length > 0) {
      return this.msg;
    }

    try {
      if (this.transaction.m && this.transaction.m.byteLength > 0) {
        const reconstruct = Buffer.from(this.transaction.m).toString("utf-8");
        this.msg = JSON.parse(reconstruct);
      } else {
        this.msg = {};
      }
    } catch (err) {
      // TODO : handle this without printing an error
      console.log(
        `buffer length = ${this.transaction.m.byteLength} type = ${typeof this.transaction.m}`
      );
      console.error("error parsing return message", err);
    }
    return this.msg;
  }

  returnPaymentTo(publickey: string) {
    const slips = this.returnSlipsToAndFrom(publickey);
    let x = BigInt(0);
    for (let v = 0; v < slips.to.length; v++) {
      if (slips.to[v].add === publickey) {
        x += BigInt(slips.to[v].amt);
      }
    }
    return x.toString();
  }

  returnRoutingWorkAvailableToPublicKey() {
    let uf = this.returnFeesTotal();
    for (let i = 0; i < this.path.length; i++) {
      let d = 1;
      for (let j = i; j > 0; j--) {
        d = d * 2;
      }
      uf /= BigInt(d);
    }
    return uf;
  }

  returnSignature(app: Saito, force = 0) {
    if (this.transaction.sig !== "" && force != 1) {
      return this.transaction.sig;
    }
    this.sign(app);
    return this.transaction.sig;
  }

  returnSlipsFrom(publickey: string): Array<Slip> {
    const x = new Array<Slip>();
    if (this.transaction.from != null) {
      for (let v = 0; v < this.transaction.from.length; v++) {
        if (this.transaction.from[v].add === publickey) {
          x.push(this.transaction.from[v]);
        }
      }
    }
    return x;
  }

  returnSlipsToAndFrom(publickey: string): { from: Array<Slip>; to: Array<Slip> } {
    let x = {
      from: new Array<Slip>(),
      to: new Array<Slip>(),
    };
    if (this.transaction.from != null) {
      for (let v = 0; v < this.transaction.from.length; v++) {
        if (this.transaction.from[v].add === publickey) {
          x.from.push(this.transaction.from[v]);
        }
      }
    }
    if (this.transaction.to != null) {
      for (let v = 0; v < this.transaction.to.length; v++) {
        if (this.transaction.to[v].add === publickey) {
          x.to.push(this.transaction.to[v]);
        }
      }
    }
    return x;
  }

  returnSlipsTo(publickey: string): Array<Slip> {
    let x = new Array<Slip>();
    if (this.transaction.to != null) {
      for (let v = 0; v < this.transaction.to.length; v++) {
        if (this.transaction.to[v].add === publickey) {
          x.push(this.transaction.to[v]);
        }
      }
    }
    return x;
  }

  returnWinningRoutingNode(random_number: string) {
    //
    // if there are no routing paths, we return the sender of
    // the payment, as they're got all of the routing work by
    // definition. this is the edge-case where sending a tx
    // can make you money.
    //
    if (this.path.length === 0) {
      if (this.transaction.from.length !== 0) {
        return this.transaction.from[0].returnPublicKey();
      }
    }

    //
    // no winning transaction should have no fees unless the
    // entire block has no fees, in which case we have a block
    // without any fee-paying transactions.
    //
    // burn these fees for the sake of safety.
    //
    if (this.returnFeesTotal() === BigInt(0)) {
      return "";
    }

    //
    // if we have a routing path, we calculate the total amount
    // of routing work that it is possible for this transaction
    // to contain (2x the fee).
    //
    let aggregate_routing_work = this.returnFeesTotal();
    let routing_work_this_hop = aggregate_routing_work;
    const work_by_hop = [];
    work_by_hop.push(aggregate_routing_work);

    for (let i = 0; i < this.path.length; i++) {
      const new_routing_work_this_hop = routing_work_this_hop / BigInt(2);
      aggregate_routing_work += new_routing_work_this_hop;
      routing_work_this_hop = new_routing_work_this_hop;
      work_by_hop.push(aggregate_routing_work);
    }

    //
    // find winning routing node
    //
    const x = BigInt("0x" + random_number);
    const z = BigInt("0x" + aggregate_routing_work);
    const winning_routing_work_in_nolan = x % z;

    for (let i = 0; i < work_by_hop.length; i++) {
      if (winning_routing_work_in_nolan <= work_by_hop[i]) {
        return this.path[i].returnTo();
      }
    }

    //
    // we should never reach this
    //
    return "";
  }

  /**
   * Serialize TX
   * @returns {array} raw bytes
   * @param app
   */
  serialize(app: Saito): Uint8Array {
    //console.log("tx.serialize", this.transaction);

    const inputs_len = app.binary.u32AsBytes(this.transaction.from.length);
    const outputs_len = app.binary.u32AsBytes(this.transaction.to.length);
    const message_len = app.binary.u32AsBytes(this.transaction.m.byteLength);
    const path_len = this.path ? this.path.length : 0;
    const path_len_buffer = app.binary.u32AsBytes(path_len);
    const signature = app.binary.hexToSizedArray(this.transaction.sig, 64);
    const timestamp = app.binary.u64AsBytes(this.transaction.ts);
    const r = app.binary.u32AsBytes(this.transaction.r);
    const transaction_type = app.binary.u8AsByte(this.transaction.type);
    const inputs = [];
    const outputs = [];
    const path = [];

    ///
    ///  reference for starting point of inputs
    ///
    /// [len of inputs - 4 bytes - u32]
    /// [len of outputs - 4 bytes - u32]
    /// [len of message - 4 bytes - u32]
    /// [len of path - 4 bytes - u32]
    /// [signature - 64 bytes - Secp25k1 sig]
    /// [timestamp - 8 bytes - u64]
    /// [transaction r - 4 bytes - u32]
    /// [transaction type - 1 byte]
    /// [input][input][input]...
    /// [output][output][output]...
    /// [message]
    /// [hop][hop][hop]...

    const start_of_inputs = TRANSACTION_SIZE;
    const start_of_outputs = TRANSACTION_SIZE + this.transaction.from.length * SLIP_SIZE;
    const start_of_message =
      TRANSACTION_SIZE + (this.transaction.from.length + this.transaction.to.length) * SLIP_SIZE;
    const start_of_path =
      TRANSACTION_SIZE +
      (this.transaction.from.length + this.transaction.to.length) * SLIP_SIZE +
      this.transaction.m.byteLength;
    const size_of_tx_data =
      TRANSACTION_SIZE +
      (this.transaction.from.length + this.transaction.to.length) * SLIP_SIZE +
      this.transaction.m.byteLength +
      path_len * HOP_SIZE;
    const ret = new Uint8Array(size_of_tx_data);
    ret.set(
      new Uint8Array([
        ...inputs_len,
        ...outputs_len,
        ...message_len,
        ...path_len_buffer,
        ...signature,
        ...timestamp,
        ...r,
        transaction_type,
      ]),
      0
    );

    for (let i = 0; i < this.transaction.from.length; i++) {
      inputs.push(this.transaction.from[i].serialize(app));
    }
    let next_input_location = start_of_inputs;
    for (let i = 0; i < inputs.length; i++) {
      ret.set(inputs[i], next_input_location);
      next_input_location += SLIP_SIZE;
    }

    for (let i = 0; i < this.transaction.to.length; i++) {
      outputs.push(this.transaction.to[i].serialize(app));
    }
    let next_output_location = start_of_outputs;
    for (let i = 0; i < outputs.length; i++) {
      ret.set(outputs[i], next_output_location);
      next_output_location += SLIP_SIZE;
    }

    //
    // convert message to hex as otherwise issues in current implementation
    //
    const m_as_hex = Buffer.from(this.transaction.m).toString("hex");
    // binary requires 1/2 length of hex string
    const tm = app.binary.hexToSizedArray(m_as_hex, m_as_hex.length / 2);

    ret.set(this.transaction.m, start_of_message);

    for (let i = 0; i < path_len; i++) {
      const serialized_hop = this.path[i].serialize(app);
      path.push(serialized_hop);
    }
    let next_hop_location = start_of_path;
    for (let i = 0; i < path.length; i++) {
      ret.set(path[i], next_hop_location);
      next_hop_location += HOP_SIZE;
    }

    // console.debug(
    //   `transaction.serialize length : ${ret.length}, inputs : ${inputs.length}, outputs : ${outputs.length}, message len : ${this.transaction.m.byteLength}, path len : ${this.transaction.path.length}`
    // );

    return ret;
  }

  serializeForSignature(app: Saito): Buffer {
    let buffer = Buffer.from(app.binary.u64AsBytes(this.transaction.ts));

    for (let i = 0; i < this.transaction.from.length; i++) {
      buffer = Buffer.concat([
        buffer,
        Buffer.from(this.transaction.from[i].serializeInputForSignature(app)),
      ]);
    }
    for (let i = 0; i < this.transaction.to.length; i++) {
      buffer = Buffer.concat([
        buffer,
        Buffer.from(this.transaction.to[i].serializeOutputForSignature(app)),
      ]);
    }

    buffer = Buffer.concat([
      buffer,
      Buffer.from(app.binary.u32AsBytes(this.transaction.r)),
      Buffer.from(app.binary.u32AsBytes(this.transaction.type)),
    ]);

    buffer = Buffer.concat([buffer, this.transaction.m]);

    return buffer;
  }

  //
  // everything but the signature
  //
  presign(app: Saito) {
    //
    // set slip ordinals
    //
    for (let i = 0; i < this.transaction.to.length; i++) {
      this.transaction.to[i].sid = i;
    }

    //
    // transaction message
    //
    if (this.transaction.m.byteLength === 0) {
      if (Object.keys(this.msg).length === 0) {
        this.transaction.m = Buffer.alloc(0);
      } else {
console.log("pre JSONify: " + new Date().getTime());
        let jsonstr = JSON.stringify(this.msg);
console.log("post JSONify: " + new Date().getTime());
        this.transaction.m = Buffer.from(JSON.stringify(this.msg), "utf-8");
      }
    }
  }

  sign(app: Saito) {
    //
    // everything but the signature
    //
    this.presign(app);

    this.transaction.sig = app.crypto.signBuffer(
      this.serializeForSignature(app),
      app.wallet.returnPrivateKey()
    );
  }

  validate(app: Saito) {
    //
    // Fee Transactions are validated in the block class. There can only
    // be one per block, and they are checked by ensuring the transaction hash
    // matches our self-generated safety check. We do not need to validate
    // their input slips as their input slips are records of what to do
    // when reversing/unwinding the chain and have been spent previously.
    //
    if (this.transaction.type === TransactionType.Fee) {
      return true;
    }

    //
    // User-Sent Transactions
    //
    // most transactions are identifiable by the publickey that
    // has signed their input transaction, but some transactions
    // do not have senders as they are auto-generated as part of
    // the block itself.
    //
    // ATR transactions
    // VIP transactions
    // FEE transactions
    //
    // the first set of validation criteria is applied only to
    // user-sent transactions. validation criteria for the above
    // classes of transactions are further down in this function.
    // at the bottom is the validation criteria applied to ALL
    // transaction types.
    //
    if (
      this.transaction.type !== TransactionType.ATR &&
      this.transaction.type !== TransactionType.Vip &&
      this.transaction.type !== TransactionType.Issuance
    ) {
      //
      // validate sender exists
      //
      if (this.transaction.from.length < 1) {
        console.log("ERROR 582039: less than 1 input in transaction");
        return false;
      }

      //
      // validate signature
      //
      if (!this.validateSignature(app)) {
        console.log("ERROR:382029: transaction signature does not validate");
        return false;
      }

      //
      // validate routing path sigs
      //
      if (!this.validateRoutingPath(app)) {
        console.log("ERROR 482033: routing paths do not validate, transaction invalid");
        return false;
      }

      //
      // validate we're not creating tokens out of nothing
      //
      let total_in = BigInt(0);
      let total_out = BigInt(0);
      for (let i = 0; i < this.transaction.from.length; i++) {
        total_in += this.transaction.from[i].returnAmount();
      }
      for (let i = 0; i < this.transaction.to.length; i++) {
        total_out += this.transaction.to[i].returnAmount();
      }
      if (total_out > total_in) {
        console.log("ERROR 802394: transaction spends more than it has available");
        return false;
      }
    }

    //
    // atr transactions
    //
    if (this.transaction.type === TransactionType.ATR) {
      // TODO
    }

    //
    // normal transactions
    //
    if (this.transaction.type === TransactionType.Normal) {
      // TODO
    }

    //
    // golden ticket transactions
    //
    if (this.transaction.type === TransactionType.GoldenTicket) {
      // TODO
    }

    //
    // vip transactions
    //
    // a special class of transactions that do not pay rebroadcasting
    // fees. these are issued to the early supporters of the Saito
    // project. they carried us and we're going to carry them. thanks
    // for the faith and support.
    //
    if (this.transaction.type === TransactionType.Vip) {
      //
      // validate VIP transactions appropriately signed
      //
    }

    //
    // all Transactions
    //

    //
    // must have outputs
    //
    if (this.transaction.to.length === 0) {
      console.log("ERROR 582039: transaction does not have a single output");
      return false;
    }

    //
    // must have valid slips
    //
    for (let i = 0; i < this.transaction.from.length; i++) {
      if (this.transaction.from[i].validate(app) !== true) {
        console.log("ERROR 858043: transaction does not have valid slips");
        return false;
      }
    }

    return true;
  }

  validateRoutingPath(app: Saito) {
    console.log("JS needs to validate routing paths still...");

    if (!this.path) {
      return true;
    }
    for (let i = 0; i < this.path.length; i++) {
      let buffer = Buffer.concat([
        Buffer.from(this.transaction.sig, "hex"),
        Buffer.from(app.crypto.fromBase58(this.path[i].to), "hex"),
      ]);
      let hash = app.crypto.hash(buffer);

      if (!app.crypto.verifyHash(buffer, this.path[i].sig, this.path[i].from)) {
        console.warn(`transaction path is not valid`);
        return false;
      }
      if (i > 0) {
        if (this.path[i].from !== this.path[i - 1].to) {
          console.warn(`transaction path is not valid`);
          return false;
        }
      }
    }

    return true;
  }

  validateSignature(app: Saito) {
    //
    // validate signature
    //
    if (
      !app.crypto.verifyHash(
        this.serializeForSignature(app),
        this.transaction.sig,
        this.transaction.from[0].add
      )
    ) {
      console.log("ERROR:382029: transaction signature does not validate");
      return false;
    }

    return true;
  }

  generateMetadata(app: Saito, block_id: bigint, tx_ordinal: bigint) {
    for (let i = 0; i < this.transaction.from.length; i++) {
      this.transaction.from[i].generateKey(app);
    }
    for (let i = 0; i < this.transaction.to.length; i++) {
      this.transaction.to[i].block_id = block_id;
      this.transaction.to[i].tx_ordinal = tx_ordinal;
      this.transaction.to[i].sid = i;
      this.transaction.to[i].generateKey(app);
    }
  }

  generateMetadataCumulativeFees() {
    return BigInt(0);
  }

  generateMetadataCumulativeWork() {
    return BigInt(0);
  }

  hasPublicKey(publickey: string) {
    const slips = this.returnSlipsToAndFrom(publickey);
    if (slips.to.length > 0 || slips.from.length > 0) {
      return true;
    }
    return false;
  }

  /* stolen from app crypto to avoid including app */
  stringToBase64(str: string) {
    return Buffer.from(str, "utf-8").toString("base64");
  }

  base64ToString(str: string) {
    return Buffer.from(str, "base64").toString("utf-8");
  }
}

export default Transaction;
