import Saito from "saito-js/saito";
import SaitoBlockchain from "saito-js/lib/blockchain";
import Block from "./block";
import { Saito as S } from "../../apps/core";
import { TransactionType } from "saito-js/lib/transaction";
import Transaction from "./transaction";

export default class Blockchain extends SaitoBlockchain {
  public app: S;

  constructor(data) {
    super(data);
  }

  public async getBlock(blockHash: string): Promise<Block> {
    let block = await Saito.getInstance().getBlock(blockHash);

    return block as unknown as Block;
  }

  resetBlockchain() {
    // TODO : implement
    // //
    // // last in longest_chain
    // //
    // this.blockchain.last_block_hash = "";
    // this.blockchain.last_block_id = BigInt(0);
    // this.blockchain.last_timestamp = new Date().getTime();
    // this.blockchain.last_burnfee = BigInt(0);
    //
    // //
    // // earliest in epoch
    // //
    // this.blockchain.genesis_block_id = BigInt(0);
    // this.blockchain.genesis_timestamp = 0;
    //
    // //
    // // first received this sync (used to prevent recursive fetch forever)
    // //
    // this.blockchain.lowest_acceptable_timestamp = 0;
    // this.blockchain.lowest_acceptable_block_hash = "";
    // this.blockchain.lowest_acceptable_block_id = BigInt(0);

    this.instance.reset();

    this.saveBlockchain();
  }

  saveBlockchain() {
    // TODO : implement
    // throw new Error("not implemented");
  }

  async loadBlockAsync(hash: string): Promise<Block | null> {
    return Saito.getInstance().getBlock(hash);
  }

  async initialize() {
    this.app.connection.on("add-block-success", async ({ blockId, hash }) => {
      console.log("calling add block success on : " + hash + " with id : " + blockId);
      await this.onAddBlockSuccess(blockId, hash);
    });
    // TODO : implement
    //
    // load blockchain from options if exists
    //
    // if (this.app.options.blockchain) {
    //   let obj = this.app.options.blockchain;
    //   for (let key in obj) {
    //     if (typeof obj[key] !== "undefined") {
    //       this.blockchain[key] = obj[key];
    //     }
    //   }
    //   this.blockchain.last_callback_block_id = this.blockchain.last_block_id;
    // }

    if (this.app.options.blockchain) {
      let chain = this.app.options.blockchain;
      // this.last_block_hash = chain.last_block_hash;
    }
  }

  public async affixCallbacks(block: Block) {
    console.log("affixing callbacks for block : " + block.hash);
    let callbacks = [];
    let callbackIndices = [];
    let txs: Transaction[] = block.transactions as Transaction[];
    for (let z = 0; z < txs.length; z++) {
      if (txs[z].type === TransactionType.Normal) {
        await txs[z].decryptMessage(this.app);
        const txmsg = txs[z].returnMessage();
        this.app.modules.affixCallbacks(txs[z], z, txmsg, callbacks, callbackIndices);
      }
    }
    this.callbacks.set(block.hash, callbacks);
    this.callbackIndices.set(block.hash, callbackIndices);
    this.confirmations.set(block.hash, BigInt(-1));
  }

  public onNewBlock(block: Block, lc: boolean) {
    console.log("onNewBlock : " + block.hash);
    this.app.modules.onNewBlock(block, lc);
  }
}
