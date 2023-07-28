import * as JSON from "json-bigint";
import Slip from "./slip";
import { Saito } from "../../apps/core";
import { TransactionType } from "saito-js/lib/transaction";
import { SlipType } from "saito-js/lib/slip";
import SaitoTransaction from "saito-js/lib/transaction";

export const TRANSACTION_SIZE = 93;
export const SLIP_SIZE = 67;
export const HOP_SIZE = 130;

export default class Transaction extends SaitoTransaction {
  // public transaction = {
  //   to: new Array<Slip>(),
  //   from: new Array<Slip>(),
  //   ts: 0,
  //   sig: "",
  //   r: 1, // "replaces" (how many txs this represents in merkle-tree -- spv block)
  //   type: TransactionType.Normal,
  //   m: Buffer.alloc(0),
  // };
  public optional: any;
  public work_available_to_me: bigint;
  public work_available_to_creator: bigint;
  public work_cumulative: bigint;
  public dmsg: any;
  // public size: number;
  public is_valid: any;

  // public path: Array<Hop>;

  constructor(data?: any, jsonobj = null) {
    super(data);

    /////////////////////////
    // consensus variables //
    /////////////////////////

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
    this.dmsg = "";
    // this.size = 0;
    this.is_valid = 1;
    if (this.timestamp === 0) {
      this.timestamp = new Date().getTime();
    }
    // this.path = new Array<Hop>();
    try {
      if (jsonobj != null) {
        //
        // if the jsonobj has been provided, we have JSON.parsed something
        // and are providing it to the transaction, but should add sanity
        // checks on import to ensure our transaction is type-safe.
        //
        // to: new Array<Slip>(),
        // from: new Array<Slip>(),
        // ts: 0,
        // sig: "",
        // r: 1, // "replaces" (how many txs this represents in merkle-tree -- spv block)
        // type: TransactionType.Normal,
        // m: Buffer.alloc(0),
        //
        for (let i = 0; i < jsonobj.from.length; i++) {
          const fslip = jsonobj.from[i];

          let slip = new Slip();
          slip.publicKey = fslip.publicKey;
          slip.amount = BigInt(fslip.amount);
          slip.type = fslip.type as SlipType;
          slip.index = fslip.index;
          slip.blockId = BigInt(fslip.blockId);
          slip.txOrdinal = BigInt(fslip.txOrdinal);

          // this.from.push(
          //   new Slip(fslip.publicKey  fslip.amt, fslip.type, fslip.sid, fslip.block_id, fslip.tx_ordinal)
          // );
          this.addFromSlip(slip);
        }
        if (jsonobj.from.length > 0) {
          console.log("important tx: " + jsonobj.from[0].publicKey);
        }

        for (let i = 0; i < jsonobj.to.length; i++) {
          const fslip = jsonobj.to[i];
          let slip = new Slip();
          slip.publicKey = fslip.publicKey;
          slip.amount = BigInt(fslip.amount);
          slip.type = fslip.type as SlipType;
          slip.index = fslip.index;
          slip.blockId = BigInt(fslip.blockId);
          slip.txOrdinal = BigInt(fslip.txOrdinal);
          // this.to.push(
          //   new Slip(fslip.publicKey  fslip.amt, fslip.type, fslip.sid, fslip.block_id, fslip.tx_ordinal)
          // );
          this.addToSlip(slip);
        }

        if (jsonobj.timestamp) {
          this.timestamp = jsonobj.timestamp;
        }
        if (jsonobj.signature) {
          this.signature = jsonobj.signature;
        }
        if (jsonobj.txs_replacements) {
          this.txs_replacements = jsonobj.txs_replacements;
        }
        if (jsonobj.type) {
          this.type = jsonobj.type;
        }
        if (jsonobj.buffer) {
          this.data = new Uint8Array(Buffer.from(jsonobj.buffer, "base64"));
          // try {
          //   const reconstruct2 = Buffer.from(this.data).toString("utf-8");
          //   this.msg = JSON.parse(reconstruct2);
          // } catch (err) {
          //   try {
          //     const reconstruct3 = this.base64ToString(Buffer.from(this.data).toString());
          //     this.msg = JSON.parse(reconstruct3);
          //   } catch (err) {
          //     console.log("real issues reconstructing...");
          //   }
          // }
        }

        //
        // FRI FEB 3 -- DEPRECATED -- delete if no problems
        //
        /***********
         if (this.type === TransactionType.Normal) {
        try {
          let buffer = Buffer.from(this.m);
          if (buffer.byteLength === 0) {
            this.msg = {};
          } else {
            try {
              const reconstruct = Buffer.from(this.m).toString("utf-8");
              this.msg = JSON.parse(reconstruct);
            } catch (error) {
              //console.log("failed from utf8. trying if base64 still works for old version");
              //console.error(error);
              const reconstruct = this.base64ToString(Buffer.from(this.m).toString());
              this.msg = JSON.parse(reconstruct);
            }
          }
        } catch (err) {
          //console.log("failed converting buffer in tx : ", this.transaction);
          //console.error(err);
        }
      }
         ***********/
      }
    } catch (error) {
      console.error(error);
    }

    this.unpackData();

    return this;
  }

  static deserialize(buffer, factory) {
    return SaitoTransaction.deserialize(buffer, factory);
  }

  async decryptMessage(app: Saito) {
    let myPublicKey = await app.wallet.getPublicKey();
    const parsed_msg = this.returnMessage();

    if (!app.crypto.isAesEncrypted(parsed_msg)) {
      return;
    }

    if (!parsed_msg) {
      this.dmsg = "";
      return;
    }

    let counter_party_key = "";

    if (this.from[0].publicKey !== myPublicKey) {
      counter_party_key = this.from[0].publicKey;
    } else {
      for (let i = 0; i < this.to.length; i++) {
        if (this.to[i].publicKey !== myPublicKey) {
          counter_party_key = this.to[i].publicKey;    
          break;
        }
      }  
    }

    try {
      let dmsg = app.keychain.decryptMessage(counter_party_key, parsed_msg);
      if (dmsg !== parsed_msg){
        this.dmsg = dmsg;  
      }
    } catch (e) {
      console.error("Decryption error: " , e);
      this.dmsg = "";      
      // there was (pre-wasm) code to automatically try to get the keys, but that seems
      // like a security risk, no???
    }
    return;
  }

  async generateRebroadcastTransaction(
    app: Saito,
    output_slip_to_rebroadcast: Slip,
    with_fee: bigint,
    with_staking_subsidy: bigint
  ) {
    const transaction = new Transaction();
    transaction.timestamp = new Date().getTime();

    let output_payment = BigInt(0);
    if (output_slip_to_rebroadcast.amount > with_fee) {
      output_payment =
        BigInt(output_slip_to_rebroadcast.amount) - BigInt(with_fee) + BigInt(with_staking_subsidy);
    }

    transaction.type = TransactionType.ATR;

    const output = new Slip();
    output.publicKey = output_slip_to_rebroadcast.publicKey;
    output.amount = output_payment;
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
      transaction.data = transaction_to_rebroadcast.data;
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      transaction.data = transaction_to_rebroadcast.serialize(app);
    }

    transaction.addToSlip(output);

    //
    // signature is the ORIGINAL signature. this transaction
    // will fail its signature check and then get analysed as
    // a rebroadcast transaction because of its transaction type.
    //
    await transaction.sign();

    return transaction;
  }

  returnMessage() {
    //console.log("TRANSACTION:");
    //console.log(JSON.stringify(this));

    if (this.dmsg) {
      return this.dmsg;
    }

    if (!!this.msg && Object.keys(this.msg).length > 0) {
      return this.msg;
    }

    try {
      if (this.data && this.data.byteLength > 0) {
        const reconstruct = Buffer.from(this.data).toString("utf-8");
        this.msg = JSON.parse(reconstruct);
      } else {
        this.msg = {};
      }
    } catch (err) {
      // TODO : handle this without printing an error
      console.log("ERROR: " + JSON.stringify(err));
      try {
        console.log("fallback on failure... 1");
        const reconstruct = Buffer.from(this.data).toString("utf-8");
        console.log("fallback on failure... 2");
        this.msg = JSON.parse(reconstruct);
        console.log("fallback on failure... 3");
      } catch (err) {
        console.log(`buffer length = ${this.data.byteLength} type = ${typeof this.data}`);
        console.error("error parsing return message", err);
        console.log("here: " + JSON.stringify(this.msg));
      }
    }
    return this.msg;
  }

  /*  
  Sanka -- maybe these convenience functions should be moved up a level?
  */
  addTo(publicKey: string) {
    for (let s of this?.to) {
      if (s.publicKey === publicKey){
        return;
      }
    }
    let slip = new Slip();
    slip.publicKey = publicKey;
    slip.amount = BigInt(0);

    this.addToSlip(slip);
  }

  addFrom(publicKey: string) {
    for (let s of this?.from) {
      if (s.publicKey === publicKey){
        return;
      }
    }

    let slip = new Slip();
    slip.publicKey = publicKey;
    this.addFromSlip(slip);
  }

  /* stolen from app crypto to avoid including app */
  stringToBase64(str: string): string {
    return Buffer.from(str, "utf-8").toString("base64");
  }

  base64ToString(str: string): string {
    return Buffer.from(str, "base64").toString("utf-8");
  }

  // public get transaction() {
  //   return {
  //     to: this.to.map((slip) => slip.toJson()),
  //     from: this.from.map((slip) => slip.toJson()),
  //     ts: this.timestamp,
  //     sig: this.signature,
  //     r: this.txs_replacements, // "replaces" (how many txs this represents in merkle-tree -- spv block)
  //     type: this.type,
  //     m: this.data,
  //   };
  // }
}
