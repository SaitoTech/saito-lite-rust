import { TransactionType } from "./transaction";
import { Saito } from "../../apps/core";

class Miner {
  public app: Saito;
  public mining_active: any;
  public mining_speed: any;
  public mining_timer: any;
  public target: any;
  public difficulty: any;

  constructor(app) {
    this.app = app;

    this.mining_active = false;
    this.mining_speed = 1000;
    this.mining_timer = null;

    this.target = "";
    this.difficulty = 1;
  }

  initialize() {
    this.app.connection.on("BlockchainNewLongestChainBlock", (msg) => {
      this.stopMining();
      //if (msg.block_hash) {
      //  this.startMining(msg.block_hash, msg.difficulty);
      //} else {
      this.startMining();
      //}
    });
  }

  startMining(previous_block_hash = null, difficulty = null) {
    if (this.isMining()) {
      this.stopMining();
    }

    // browsers do not need to hash currently
    if (this.app.BROWSER == 1) {
      return;
    }

    if (previous_block_hash == null) {
      let blk = this.app.blockchain.returnLatestBlock();
      if (!blk) {
        return;
      }
      previous_block_hash = blk.returnHash();
      difficulty = blk.returnDifficulty();
    }

    this.target = previous_block_hash;
    this.difficulty = difficulty;

    if (this.mining_active) {
      clearInterval(this.mining_timer);
    }

    this.mining_active = true;
    this.mining_timer = setInterval(async () => {
      await this.mine();
    }, this.mining_speed);
  }

  isMining() {
    return this.mining_active;
  }

  stopMining() {
    this.mining_active = false;
    clearInterval(this.mining_timer);
  }

  async mine() {
    if (this.mining_active) {
      console.log("mining loop...");
      const random_hash = this.app.crypto.generateRandomNumber();
      if (
        this.app.goldenticket.validate(
          this.target,
          random_hash,
          this.app.wallet.returnPublicKey(),
          this.difficulty
        )
      ) {
        const transaction = this.app.wallet.createUnsignedTransaction();
        transaction.transaction.type = TransactionType.GoldenTicket;
        transaction.transaction.m = this.app.goldenticket.serialize(this.target, random_hash);
        transaction.sign(this.app);
        this.app.network.propagateTransaction(transaction);
      }
    }
    return;
  }
}

export default Miner;
