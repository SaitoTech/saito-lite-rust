import { Saito } from "../../apps/core";

class Blockring {
  public app: Saito;
  public ring_buffer_length: number;
  public ring: any;
  public is_empty: boolean;
  public lc_pos: number;
  public ringp: any;

  constructor(app: Saito, genesis_period) {
    this.app = app;

    //
    // consensus variables
    //
    this.ring_buffer_length = genesis_period * 2;
    this.ring = [this.ring_buffer_length];

    for (let i = 0; i < this.ring_buffer_length; i++) {
      this.ring[i] = {};
      this.ring[i].block_hashes = [];
      this.ring[i].block_ids = [];
      this.ring[i].lc_pos = 0;
    }

    this.is_empty = true;
    this.lc_pos = 0;
  }

  addBlock(block) {
    console.debug("blockring.addBlock : " + block.hash);
    const insert_pos = block.returnId() % this.ring_buffer_length;
    const block_id = block.returnId();
    const block_hash = block.returnHash();
    if (!this.containsBlockHashAtBlockId(block_id, block_hash)) {
      this.ring[insert_pos].block_hashes.push(block_hash);
      this.ring[insert_pos].block_ids.push(block_id);
    }
  }

  containsBlockHashAtBlockId(block_id, block_hash) {
    const insert_pos = block_id % this.ring_buffer_length;
    return this.ring[insert_pos].block_hashes.includes(block_hash);
  }

  deleteBlock(block) {
    const insert_pos = block.returnId() % this.ring_buffer_length;
    const block_id = block.returnId();
    const block_hash = block.returnHash();
    if (this.containsBlockHashAtBlockId(block_id, block_hash)) {
      const new_block_hashes = [];
      const new_block_ids = [];
      let idx_loop = 0;
      let new_lc_pos = 0;

      for (let i = 0; i < this.ring[insert_pos].block_hashes.length; i++) {
        if (
          this.ring[insert_pos].block_ids[i] !== block_id ||
          this.ringp[insert_pos].block_hashes[i] !== block_hash
        ) {
          new_block_hashes.push(this.ring[insert_pos].block_hashes[i]);
          new_block_ids.push(this.ring[insert_pos].block_ids[i]);
          if (this.lc_pos == i) {
            new_lc_pos = idx_loop;
          }
          idx_loop += 1;
        }
      }

      this.ring[insert_pos].block_hashes = new_block_hashes;
      this.ring[insert_pos].block_ids = new_block_ids;
      this.ring[insert_pos].lc_pos = new_lc_pos;
    }
  }

  isEmpty() {
    return this.is_empty;
  }

  print() {
    let idx = this.lc_pos % this.ring_buffer_length;
    let cont = true;
    while (idx >= 0 && cont == true) {
      cont = false;
      if (this.ring[idx].block_hashes.length > 0) {
        console.log(
          "block " +
            this.ring[idx].block_ids[this.ring[idx].lc_pos] +
            ": " +
            this.ring[idx].block_hashes[this.ring[idx].lc_pos]
        );
        idx--;
        cont = true;
      }
    }
  }

  onChainReorganization(block_id, block_hash, lc) {
    const insert_pos = block_id % this.ring_buffer_length;

    for (let i = 0; i < this.ring[insert_pos].block_hashes.length; i++) {
      if (this.ring[insert_pos].block_hashes[i] === block_hash) {
        this.ring[insert_pos].lc_pos = i;
      }
    }

    if (lc) {
      this.lc_pos = insert_pos;
    } else {
      const previous_insert_pos = insert_pos - 1;
      if (previous_insert_pos < 0) {
        previous_insert_pos === this.ring_buffer_length - 1;
      }
      if (this.ring[previous_insert_pos].block_hashes.length > 0) {
        this.lc_pos = previous_insert_pos;
      }
    }
  }

  returnBlockHashesAtBlockId(block_id) {
    const insert_pos = block_id % this.ring_buffer_length;
    const v = [];
    for (let i = 0; i < this.ring[insert_pos].block_hashes.length; i++) {
      v.push(this.ring[insert_pos].block_hashes[i]);
    }
    return v;
  }

  returnLongestChainBlockHashAtBlockId(block_id) {
    const insert_pos = block_id % this.ring_buffer_length;
    if (
      this.ring[insert_pos].lc_pos < this.ring[insert_pos].block_hashes.length
    ) {
      return this.ring[insert_pos].block_hashes[this.ring[insert_pos].lc_pos];
    }
    return "";
  }

  returnLatestBlockHash() {
    if (this.lc_pos == 0) {
      return "";
    }
    if (
      this.ring[this.lc_pos].block_hashes.length > this.ring[this.lc_pos].lc_pos
    ) {
      return this.ring[this.lc_pos].block_hashes[this.ring[this.lc_pos].lc_pos];
    }
    return "";
  }

  returnLatestBlockId() {
    if (this.lc_pos == 0) {
      return 0;
    }
    if (
      this.ring[this.lc_pos].block_ids.length > this.ring[this.lc_pos].lc_pos
    ) {
      return this.ring[this.lc_pos].block_ids[this.ring[this.lc_pos].lc_pos];
    }
    return 0;
  }

  returnLatestBlock() {
    const block_hash = this.returnLatestBlockHash();
    if (this.app.blockchain.isBlockIndexed(block_hash)) {
      return this.app.blockchain.blocks[block_hash];
    }
    return null;
  }

  returnLongestChainBlockHashByBlockId(block_id) {
    const insert_pos = block_id % this.ring_buffer_length;

    if (
      this.ring[insert_pos].block_hashes.length > this.ring[insert_pos].lc_pos
    ) {
      if (this.ring[insert_pos].block_hashes.length > 0) {
        return this.ring[insert_pos].block_hashes[this.ring[insert_pos].lc_pos];
      }
    }
    return "";
  }
}

export default Blockring;
