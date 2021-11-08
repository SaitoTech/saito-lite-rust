const saito = require('./saito');

class Blockring {

  constructor(app) {

    this.app = app || {};

    //
    // consensus variables
    //
    this.ring_buffer_length = app.blockchain.returnGenesisPeriod() * 2;
    this.ring 	            = [this.ring_buffer_length];

    for (let i = 0; i < this.ring_buffer_length; i++) {
      this.ring[i] = {};
      this.ring[i].block_hashes = [];
      this.ring[i].block_ids = [];
      this.ring[i].lc_pos = 0;
    }

    this.is_empty			= true;
    this.lc_pos			        = 0;

  }


  add_block(block) {
    let insert_pos = block.return_id() % this.ring_buffer_length;
    let block_id = block.return_id();
    let block_hash = block.return_hash();
    if (!this.contains_block_hash_at_block_id(block_id, block_hash)) {
      this.ring[insert_pos].block_hashes.push(block_hash);
      this.ring[insert_pos].block_ids.push(block_id);
    }
    this.is_empty = false;
  }

  contains_block_hash_at_block_id(block_id, block_hash) {
    let insert_pos = block_id % this.ring_buffer_length;
    return this.ring[insert_pos].hashes.includes(block_hash)
  }

  delete_block(block) {
    let insert_pos = block.return_id() % this.ring_buffer_length;
    let block_id = block.return_id();
    let block_hash = block.return_hash();
    if (this.contains_block_hash_at_block_id(block_id, block_hash)) {

      let new_block_hashes = [];
      let new_block_ids = [];
      let idx_loop = 0;
      let new_lc_pos = 0;

      for (let i = 0; i < this.ring[insert_pos].block_hashes.length; i++) {
        if (this.ring[insert_pos].block_ids[i] == block_id && this.ringp[insert_pos].block_hashes[i] == hash) {
        } else {
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

  is_empty() {
    return this.is_empty;
  }

  on_chain_reorganization(block_id, block_hash, lc) {

    let insert_pos = block_id % this.ring_buffer_length;

    for (let i = 0; i < this.ring[insert_pos].block_hashes.length; i++) {
      if (this.ring[insert_pos].block_hashes[i] === block_hash) {
	this.ring[insert_pos].lc_pos = i;
      }
    }

    if (lc) {
      this.lc_pos = insert_pos;
    } else {
      let previous_insert_pos = insert_pos - 1;
      if (previous_insert_pos < 0) { previous_insert_pos === this.ring_buffer_length - 1; }
      if (this.ring[previous_insert_pos].block_hashes.length > 0) { this.lc_pos = previous_insert_pos; }
    }

  }

  return_block_hashes_at_block_id(block_id) {
    let insert_pos = block_id % this.ring_buffer_length;
    let v = [];
    for (let i = 0; i < this.ring[insert_pos].block_hashes.length; i++) {
      v.push(this.ring[insert_pos].block_hashes[i]);
    }
    return v;
  }

  return_latest_block_hash() {
    if (this.lc_pos == 0) { return ""; }
    if (this.ring[this.lc_pos].block_hashes.length > this.ring[this.lc_pos].lc_pos) {
      return this.ring[this.lc_pos].block_hashes[this.ring[this.lc_pos].lc_pos];
    }
    return "";
  }

  return_latest_block_id() {
    if (this.lc_pos == 0) { return 0; }
    if (this.ring[this.lc_pos].block_ids.length > this.ring[this.lc_pos].lc_pos) {
      return this.ring[this.lc_pos].block_ids[this.ring[this.lc_pos].lc_pos];
    }
    return 0;
  }
    
  return_longest_chain_block_hash_by_block_id(block_id) {
    let insert_pos = block_id % this.ring_buffer_length;
    if (this.ring[insert_pos].block_hashes.length > this.ring[insert_pos].lc_pos) {
      return this.ring[insert_pos].block_hashes[this.ring[insert_pos].lc_pos];
    }
    return "";
  }

}

module.exports = Blockring;


