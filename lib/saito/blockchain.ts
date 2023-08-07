import Saito from "saito-js/saito";
import SaitoBlockchain from "saito-js/lib/blockchain";
import Block from "./block";
import { Saito as S } from "../../apps/core";
import { TransactionType } from "saito-js/lib/transaction";
import Transaction from "./transaction";
import { BlockType } from "saito-js/lib/block";

export default class Blockchain extends SaitoBlockchain {
  public app: S;

  constructor(data) {
    super(data);
  }

  public async getBlock(blockHash: string): Promise<Block> {
    let block = await Saito.getInstance().getBlock(blockHash);

    return block as unknown as Block;
  }

  async resetBlockchain() {
    this.instance.reset();
    await this.saveBlockchain();
  }

  async saveBlockchain() {
    this.app.options.blockchain = {
      last_block_hash: await this.instance.get_last_block_hash(),
      last_block_id: Number(await this.instance.get_last_block_id()),
      last_timestamp: Number(await this.instance.get_last_timestamp()),
      genesis_block_id: Number(await this.instance.get_genesis_block_id()),
      genesis_timestamp: Number(await this.instance.get_genesis_timestamp()),
      lowest_acceptable_timestamp: Number(await this.instance.get_lowest_acceptable_timestamp()),
      lowest_acceptable_block_hash: await this.instance.get_lowest_acceptable_block_hash(),
      lowest_acceptable_block_id: Number(await this.instance.get_lowest_acceptable_block_id()),
    };
    console.log("saveBlockchain : ", this.app.options.blockchain);
    this.app.storage.saveOptions();
  }

  async loadBlockAsync(hash: string): Promise<Block | null> {
    let block: Block = await Saito.getInstance().getBlock(hash);
    if (block.block_type === BlockType.Full) {
      return block;
    } else if (block.block_type === BlockType.Pruned) {
      let block = await this.app.storage.loadBlockByHash(hash);
      if (!block || block.block_type === BlockType.Full) {
        return block;
      }
    }
    return null;
  }

  async initialize() {
    this.app.connection.on("add-block-success", async ({ blockId, hash }) => {
      console.log("calling add block success on : " + hash + " with id : " + blockId);
      await this.onAddBlockSuccess(blockId, hash);
    });
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

  public async onNewBlock(block: Block, lc: boolean) {
    console.log("onNewBlock : " + block.hash);
    await this.saveBlockchain();
    this.app.modules.onNewBlock(block, lc);
  }
}
