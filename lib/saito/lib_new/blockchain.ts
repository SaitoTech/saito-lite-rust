import Saito from "saito-js/dist/saito";
import Block from "./block";

export default class Blockchain {
  public async getBlock(blockHash: string): Promise<Block> {
    let block = await Saito.getInstance().getBlock(blockHash);

    return block;
  }
}
