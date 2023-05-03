import Block from "./block";
import { Saito } from "../../apps/core";
import Transaction from "./transaction";

class Mempool {
  public app: Saito;
  public mempool: {
    blocks: Array<Block>;
    transactions: Array<Transaction>;
    golden_tickets: Array<Transaction>;
  };
  public routing_work_needed: bigint;
  public routing_work_in_mempool: bigint;
  public transaction_size_cap: number;
  public transaction_size_current: number;
  public block_size_cap: number;
  public block_size_current: number;
  public clearing_active: boolean;
  public accept_zero_fee_txs: boolean;
  public processing_active: boolean;
  public processing_speed: number;
  public processing_timer: any;
  public bundling_active: boolean;
  public bundling_speed: number;
  public bundling_timer: any;
  public blocks_hmap: Map<string, number>;
  public transactions_hmap: Map<string, number>;
  public transactions_inputs_hmap: Map<string, number>;
  public downloads: any;
  public downloads_hmap: any;
  public downloading_active: boolean;
  public transaction_size_limit: number;
  public block_size_limit: number;
  public blocks: Array<Block>;

  constructor(app: Saito) {
    this.app = app;

    //
    // data stores
    //
    this.mempool = {
      blocks: new Array<Block>(), // in block creation -- block can remove from
      transactions: new Array<Transaction>(), // mempool quickly.
      golden_tickets: new Array<Transaction>(),
    }; // contained in object so pass-by-reference

    //
    // work in mempool
    //
    this.routing_work_needed = BigInt(0);
    this.routing_work_in_mempool = BigInt(0);

    //
    // mempool safety caps
    //
    this.transaction_size_cap = 25600000; // bytes hardcap 25 MB
    this.transaction_size_current = 0.0;
    this.block_size_cap = 1024000000; // bytes hardcap 1GB
    this.block_size_current = 0.0;

    //
    // removing block and transactions
    //
    this.clearing_active = false;
    this.accept_zero_fee_txs = true;

    //
    // processing timer
    //
    this.processing_active = false;
    this.processing_speed = 10;
    this.processing_timer = null;

    //
    // bundling timer
    //
    this.bundling_active = false;
    this.bundling_speed = 1000;
    this.bundling_timer = null;

    //
    // hashmap
    //
    this.blocks_hmap = new Map<string, number>(); // index is block.block.sig
    this.transactions_hmap = new Map<string, number>(); // index is tx.transaction.sig
    this.transactions_inputs_hmap = new Map<string, number>(); // index is slip returnKey()

    //
    // downloads
    //
    this.downloads = {};
    this.downloads_hmap = {};
    this.downloading_active = false;

    //
    // size limits
    //
    this.transaction_size_limit = 0;
    this.transaction_size_current = 0;
    this.block_size_limit = 0;
    this.block_size_current = 0;
  }

  async addBlock(block: Block): Promise<boolean> {
    console.log(
      "Mempool : adding block... : " + block.returnHash() + " of type : " + block.block_type
    );
    if (!block) {
      console.warn("ERROR 529384: mempool add.block is not provided");
      return false;
    }
    if (!block.is_valid) {
      console.warn("ERROR 529385: mempool add.block is not valid");
      return false;
    }

    //
    // insert into queue
    //
    const hash = block.returnHash();
    let insertme = true;
    for (let i = 0; i < this.mempool.blocks.length; i++) {
      if (this.mempool.blocks[i].returnHash() === hash) {
        console.debug("block already exists");
        insertme = false;
      }
    }

    if (insertme) {
      this.mempool.blocks.push(block);
    } else {
      console.log("not inserting since mempool already have the block");
      return false;
    }

    // process queue
    if (this.processing_active) {
      console.debug("processing active. returning");
      return false;
    }
    this.processing_active = true;

    try {
      // await new Promise((resolve, reject) => {
      //   let timer = setInterval(() => {
      //     if (this.mempool.blocks.length === 0) {
      //       console.debug("clearing processing timer");
      //       this.processing_active = false;
      //       clearInterval(timer);
      //       resolve(null);
      //     } else {
      //       if (this.app.blockchain.indexing_active === false) {
      //         // sort our block queue before adding to chain
      //         console.debug("sorting mempool blocks");
      //         this.mempool.blocks.sort((a, b) => Number(a.block.id - b.block.id));
      //         const block: Block = this.mempool.blocks.shift();
      //         this.app.blockchain.addBlockToBlockchain(block).then((r) => {
      //           // resolve(null);
      //           return;
      //         });
      //       } else {
      //         console.log("blockchain indexing active. returning...");
      //       }
      //     }
      //   }, this.processing_speed);
      // });
      this.processing_timer = setInterval(() => {
        if (this.mempool.blocks.length > 0) {
          if (this.app.blockchain.indexing_active === false) {
            // sort our block queue before adding to chain
            console.debug("sorting mempool blocks");
            this.mempool.blocks.sort((a, b) => Number(a.block.id - b.block.id));
            const block: Block = this.mempool.blocks.shift();
            this.app.blockchain.addBlockToBlockchain(block).then((r) => {
              return;
            });
          } else {
            console.log("blockchain indexing active. returning...");
          }
        } else {
          console.debug("clearing processing timer");
          this.processing_active = false;
          clearInterval(this.processing_timer);
        }
      }, this.processing_speed);
    } catch (err) {
      console.error(err);
    }

    return true;
  }

  addTransaction(transaction: Transaction): boolean {
    //console.debug("mempool.addTransaction", transaction);
    if (transaction.isGoldenTicket()) {

      const new_gt = this.app.goldenticket.deserializeFromTransaction(transaction);

      //
      // TODO -- update this to check the target block hash, not the sig
      //
      for (let i = 0; i < this.mempool.golden_tickets.length; i++) {
        const gt = this.app.goldenticket.deserializeFromTransaction(this.mempool.golden_tickets[i]);
        if (gt.target_hash === new_gt.target_hash) {
          console.warn("similar golden tickets already exists for target : " + gt.target_hash);
          this.app.miner.stopMining();
          return false;
        }
      }

      this.mempool.golden_tickets.push(transaction);
      this.app.miner.stopMining();
    } else {
      for (let i = 0; i < this.mempool.transactions.length; i++) {
        if (this.mempool.transactions[i].transaction.sig === transaction.transaction.sig) {
          console.warn("transaction already exists");
          return false;
        }
      }

      if (!this.app.miner.isMining()) {
	//
	// if we stop mining and TXS build up, we'll start again
	//
        if (this.mempool.golden_tickets.length == 0 || this.mempool.transactions.length > 10) {
          this.app.miner.startMining();
        } else {
          console.log("mining mining");
        }
      }

      this.mempool.transactions.push(transaction);
    }

    return true;
  }

  async bundleBlock() {
    //
    // nope out if inadequate golden ticket support
    //
    const previous_block_hash = this.app.blockring.returnLatestBlockHash();
    const mempool_contains_golden_ticket = this.containsValidGoldenTicket(previous_block_hash);
    const does_chain_meet_golden_ticket_requirements =
      await this.app.blockchain.doesChainMeetGoldenTicketRequirements(
        previous_block_hash,
        mempool_contains_golden_ticket
      );

    // stop if inadequate golden ticket support?
    if (!does_chain_meet_golden_ticket_requirements) {
      console.log("ERROR 850293: we do not have enough golden ticket support, waiting before bundling...");
      this.app.miner.startMining();
      return;
    }

console.log("enough mining support... continuing");

    // stop if already bundling?
    if (this.bundling_active === true) {
      console.log("ERROR 850293: mempool already bundling a block, not bundling another");
      return;
    }

    // and don't spam the public network
    if (this.mempool.transactions.length === 0) {
      if (!this.app.network.isPrivateNetwork()) {
        if (this.app.network.isProductionNetwork()) {
          console.log("WARNING 582034: refusing to spam public network with no-tx blocks.");
          return;
        }
      }
    }

    // start bundling
    this.bundling_active = true;

    // create block
    try {
      const block = new Block(this.app);
      const previous_block_hash = this.app.blockring.returnLatestBlockHash();
      await block.generate(previous_block_hash);
console.log("about to add new block...");
      await this.addBlock(block);
console.log("done adding new block...");
    } catch (err) {
      console.error("ERROR 781029: unexpected problem bundling block in mempool: ", err);
    }

    // reset
    this.bundling_active = false;

  }

  canBundleBlock(): boolean {
    if (this.app.mempool.mempool.golden_tickets.length === 0) {
      if (!this.app.miner.isMining()) {
        this.app.miner.startMining();
      }
    }
    if (this.app.mempool.mempool.transactions.length === 0) {
      // console.log(
      //   "CANNOT PRODUCE AS MEMPOOL HAS NO TXS -- (" +
      //     this.app.mempool.mempool.golden_tickets.length +
      //     ")"
      // );
      return false;
    }
    if (this.app.mempool.processing_active === true) {
      console.log("CANNOT PRODUCE AS MEMPOOL PROCESSING ACTIVE");
      return false;
    }
    if (this.app.mempool.clearing_active === true) {
      console.log("CANNOT PRODUCE AS MEMPOOL CLEARING ACTIVE");
      return false;
    }
    if (this.mempool.blocks.length > 0) {
      console.log("CANNOT PRODUCE AS MEMPOOL BLOCKS WAITING FOR PROCESSING");
      return false;
    }
    if (this.app.mempool.bundling_active === true) {
      console.log("CANNOT PRODUCE AS MEMPOOL BUNDLING ACTIVE");
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (
      this.mempool.transactions.length === 0 &&
      this.app.blockchain.returnLatestBlockId() > BigInt(1)
    ) {
      console.log("CANNOT PRODUCE AS MEMPOLL HAS NO TXS AND LAST_BID > 1");
      return false;
    }
    if (this.app.blockchain.indexing_active === true) {
      console.log("CANNOT PRODUCE AS BLOCKCHAIN ACTIVELY INDEXING BLOCK");
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (this.app.blockchain.loading_blocks_from_disk_active === true) {
      console.log("CANNOT PRODUCE AS BLOCKCHAIN LOADING FROM DISK");
      return false;
    }
    if (this.app.network.downloading_active === true) {
      console.log("CANNOT PRODUCE AS NETWORK DOWNLOADING BLOCKS");
      return false;
    }

    if (this.app.options) {
      if (this.app.options.wallet) {
        if (
          typeof this.app.options.wallet.bundleBlocks == "number" &&
          this.app.options.wallet.bundleBlocks === 0
        ) {
          return false;
        }
      }
      if (this.app.options.peers) {
        if (this.app.options.peers.length > 0 && this.app.blockchain.blocks.size === 0) {
          console.log("ERROR: 502843: REFUSING TO SELF-GENERATE BLOCK #1 on PEER CHAIN...");
          return false;
        }
      }
    }

    // made it this far? see if we have enough work
    const previous_block = this.app.blockchain.returnLatestBlock();
    if (previous_block != null) {
      this.routing_work_needed = this.app.burnfee.returnRoutingWorkNeededToProduceBlockInNolan(
        previous_block.block.burnfee,
        new Date().getTime(),
        previous_block.block.timestamp
      );
    } else {
      this.routing_work_needed = BigInt(0);
    }

    //
    // TODO - optimize so we don't always recalculate
    //
    this.routing_work_in_mempool = this.returnRoutingWorkAvailable();

    console.log(
      "Total Work Needed: " +
        this.routing_work_needed.toString() +
        " ---- available ---> " +
        this.routing_work_in_mempool.toString() +
        "     (" +
        this.app.wallet.returnBalance() +
        " / " +
        this.mempool.transactions.length +
        ")"
    );

    if (this.routing_work_in_mempool >= this.routing_work_needed) {
      return true;
    }
    return false;
  }

  containsBlock(block): boolean {
    if (!block) {
      return false;
    }
    if (!block.block) {
      return false;
    }
    if (!block.is_valid) {
      return false;
    }

    return this.blocks_hmap.get(block.block.sig) === 1;
  }

  containsTransaction(tx): boolean {
    if (!tx) {
      return false;
    }
    if (!tx.transaction) {
      return false;
    }
    if (!tx.transaction.from) {
      return false;
    }

    if (this.transactions_hmap.get(tx.transaction.sig) === 1) {
      return true;
    }

    for (let i = 0; i < tx.transaction.from.length; i++) {
      if (tx.transaction.from[i].isNonZeroAmount()) {
        const key = tx.transaction.from[i].returnKey();
        if (this.transactions_inputs_hmap.get(key) === 1) {
          return true;
        }
      }
    }
    return false;
  }

  containsGoldenTicket() {
    return this.mempool.golden_tickets.length > 0;
  }

  containsValidGoldenTicket(target_hash: string): boolean {
    if (this.mempool.golden_tickets.length > 0) {
console.log(" mempool contains valid golden ticket... ");
      for (let i = 0; i < this.mempool.golden_tickets.length; i++) {
        const gt = this.app.goldenticket.deserializeFromTransaction(this.mempool.golden_tickets[i]);
        if (gt.target_hash === target_hash) {
          return true;
        }
      }
    }
    //
    // TEST - empty golden tickets array in case this is the cause of the bug where
    // the server just hangs producing a block.
    //
    this.mempool.golden_tickets = [];
    return false;

  }

  async initialize() {
    if (this.app.BROWSER === 1) {
      return;
    }
    if (this.app.SPVMODE === 1) {
      return;
    }

    try {
      this.bundling_timer = setInterval(async () => {
        if (this.canBundleBlock()) {
          await this.bundleBlock();
        }
      }, this.bundling_speed);
    } catch (err) {
      console.log(err);
      this.bundling_active = false;
      this.bundling_speed = 1000;
      this.bundling_timer = null;
    }
  }

  removeBlock(blk: Block | null = null) {
    if (blk == null) {
      return;
    }
    this.clearing_active = true;
    for (let b = this.mempool.blocks.length - 1; b >= 0; b--) {
      if (this.mempool.blocks[b] && this.mempool.blocks[b].returnHash() === blk.returnHash()) {
        // this.block_size_current -= this.mempool.blocks[b].size;
        this.mempool.blocks.splice(b, 1);
      }
    }
    this.clearing_active = false;
  }

  removeBlockAndTransactions(blk: Block | null = null) {
    if (blk == null) {
      return;
    }

    this.clearing_active = true;

    // lets make some hmaps
    const mempool_transactions = new Map<string, number>();
    const replacement = new Array<Transaction>();

    // create hashmap for mempool transactions
    for (let b = 0; b < this.mempool.transactions.length; b++) {
      mempool_transactions.set(this.mempool.transactions[b].transaction.sig, b);
    }

    // set hashmap value to -1 for all txs in block
    for (let b = 0; b < blk.transactions.length; b++) {
      const location_in_mempool = mempool_transactions.get(blk.transactions[b].transaction.sig);
      if (location_in_mempool !== undefined) {
        mempool_transactions.set(blk.transactions[b].transaction.sig, -1);
        this.transaction_size_current -= this.mempool.transactions[location_in_mempool].size;
      }
    }

    // delete any old golden tickets
    this.mempool.golden_tickets.length = 0; // = new Array<Transaction>();

    // fill our replacement array with all non -1 values
    for (let t = 0; t < this.mempool.transactions.length; t++) {
      if (mempool_transactions.get(this.mempool.transactions[t].transaction.sig) > -1) {
        replacement.push(this.mempool.transactions[t]);
      }
    }

    this.mempool.transactions = replacement;

    // and delete utxo references too
    for (let b = 0; b < blk.transactions.length; b++) {
      this.transactions_hmap.delete(blk.transactions[b].transaction.sig);
      for (let i = 0; i < blk.transactions[b].transaction.from.length; i++) {
        blk.transactions[b].transaction.from[i].generateKey(this.app);
        this.transactions_inputs_hmap.delete(blk.transactions[b].transaction.from[i].returnKey());
      }
    }

    this.removeBlock(blk);
    this.clearing_active = false;
  }

  returnRoutingWorkAvailable(): bigint {
    let v = BigInt(0);

    for (let i = 0; i < this.mempool.transactions.length; i++) {
      if (this.mempool.transactions[i].is_valid === 1) {
        v += this.mempool.transactions[i].returnRoutingWorkAvailableToPublicKey();
      }
    }
    return v;
  }
}

export default Mempool;
