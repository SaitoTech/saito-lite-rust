import { Saito } from "../../apps/core";
import SaitoBlock from "saito-js/lib/block";
import { TransactionType } from "saito-js/lib/transaction";
import Transaction from "./transaction";

export enum BlockType {
  Ghost = 0,
  Header = 1,
  Pruned = 2,
  Full = 3,
}

export default class Block extends SaitoBlock {
  public force: boolean;

  public callbacks: any;
  public callbackTxs: any;
  public confirmations: any;

  public txs_hmap: Map<string, number>;
  public txs_hmap_generated: boolean;
  public has_examined_block: boolean;

  constructor(data: any | undefined = undefined) {
    super(data);

    // this.lc = false;
    this.force = false; // set to true if "force" loaded -- used to avoid duplicating callbacks

    this.txs_hmap = new Map<string, number>();
    this.txs_hmap_generated = false;

    this.callbacks = [];
    this.callbackTxs = [];
    this.confirmations = -1; // set to +1 when we start callbacks

    this.has_examined_block = false;
  }

  affixCallbacks(app: Saito) {
    for (let z = 0; z < this.transactions.length; z++) {
      if (this.transactions[z].type === TransactionType.Normal) {
        const txmsg = (this.transactions[z] as Transaction).returnMessage();
        app.modules.affixCallbacks(
          this.transactions[z],
          z,
          txmsg,
          this.callbacks,
          this.callbackTxs
        );
      }
    }
  }

  async runCallbacks(conf, run_callbacks = 1, app: Saito) {
    if (Number(this.confirmations) && this.callbacks) {
      for (let i = Number(this.confirmations) + 1; i <= conf; i++) {
        for (let ii = 0; ii < this.callbacks.length; ii++) {
          try {
            if (run_callbacks === 1) {
              //console.log("running callback!");
              await this.callbacks[ii](this, this.transactions[this.callbackTxs[ii]], i, app);
            }
          } catch (err) {
            console.error("ERROR 567567: ", err);
          }
        }
      }
    }
    this.confirmations = conf;
  }
}
