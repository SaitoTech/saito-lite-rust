import Saito from "saito-js/saito";
import SaitoBlockchain from "saito-js/lib/blockchain";
import Block from "./block";

export default class Blockchain extends SaitoBlockchain {
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

    this.saveBlockchain();
  }

  saveBlockchain() {
    // TODO : implement
    // throw new Error("not implemented");
  }

  async loadBlockAsync(hash: string): Promise<Block | null> {
    // TODO : implement
    // throw new Error("not implemented");
    return null;
  }

  async initialize() {
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
  }
}
