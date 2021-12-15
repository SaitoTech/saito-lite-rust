import {Saito} from "../../apps/core";

export default class Blockring {
    public ring: any;
    public is_empty: any;
    public lc_pos: any;
    public ringp: any;
    private ring_buffer_length: number;
    private app: Saito;

    constructor(app: Saito, genesis_period: number) {

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
        let insert_pos = block.returnId() % this.ring_buffer_length;
        let block_id = block.returnId();
        let block_hash = block.returnHash();
        if (!this.containsBlockHashAtBlockId(block_id, block_hash)) {
            this.ring[insert_pos].block_hashes.push(block_hash);
            this.ring[insert_pos].block_ids.push(block_id);
        }
    }

    containsBlockHashAtBlockId(block_id, block_hash) {
        console.debug("containsBlockHashAtBlockId", arguments);
        let insert_pos = block_id % this.ring_buffer_length;
        console.debug("block hashes", this.ring[insert_pos].block_hashes);
        return this.ring[insert_pos].block_hashes.includes(block_hash);
    }

    deleteBlock(block) {
        let insert_pos = block.returnId() % this.ring_buffer_length;
        let block_id = block.returnId();
        let block_hash = block.returnHash();
        if (this.containsBlockHashAtBlockId(block_id, block_hash)) {

            let new_block_hashes = [];
            let new_block_ids = [];
            let idx_loop = 0;
            let new_lc_pos = 0;

            for (let i = 0; i < this.ring[insert_pos].block_hashes.length; i++) {
                if (this.ring[insert_pos].block_ids[i] == block_id && this.ringp[insert_pos].block_hashes[i] == block_hash) {
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

    isEmpty() {
        return this.is_empty;
    }

    print() {
        let idx = this.lc_pos;
        while (this.ring[idx].block_hashes.length > 0) {
            console.log("block " + this.ring[idx].block_ids[this.ring[idx].lc_pos] + ": " + this.ring[idx].block_hashes[this.ring[idx].lc_pos]);
            idx--;
        }
    }

    onChainReorganization(block_id, block_hash, lc) {

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
            if (previous_insert_pos < 0) {
                previous_insert_pos = this.ring_buffer_length - 1;
            }
            if (this.ring[previous_insert_pos].block_hashes.length > 0) {
                this.lc_pos = previous_insert_pos;
            }
        }

    }

    returnBlockHashesAtBlockId(block_id) {
        let insert_pos = block_id % this.ring_buffer_length;
        let v = [];
        for (let i = 0; i < this.ring[insert_pos].block_hashes.length; i++) {
            v.push(this.ring[insert_pos].block_hashes[i]);
        }
        return v;
    }

    returnLongestChainBlockHashAtBlockId(block_id) {
        let insert_pos = block_id % this.ring_buffer_length;
        if (this.ring[insert_pos].lc_pos < this.ring[insert_pos].block_hashes.length) {
            return this.ring[insert_pos].block_hashes[this.ring[insert_pos].lc_pos];
        }
        return "";
    }

    returnLatestBlockHash() {
        if (this.lc_pos == 0) {
            return "";
        }
        if (this.ring[this.lc_pos].block_hashes.length > this.ring[this.lc_pos].lc_pos) {
            return this.ring[this.lc_pos].block_hashes[this.ring[this.lc_pos].lc_pos];
        }
        return "";
    }

    returnLatestBlockId() {
        if (this.lc_pos == 0) {
            return 0;
        }
        if (this.ring[this.lc_pos].block_ids.length > this.ring[this.lc_pos].lc_pos) {
            return this.ring[this.lc_pos].block_ids[this.ring[this.lc_pos].lc_pos];
        }
        return 0;
    }

    returnLatestBlock() {
        let block_hash = this.returnLatestBlockHash();
        if (this.app.blockchain.isBlockIndexed(block_hash)) {
            return this.app.blockchain.blocks[block_hash];
        }
        return null;
    }

    returnLongestChainBlockHashByBlockId(block_id) {
        let insert_pos = block_id % this.ring_buffer_length;
        if (this.ring[insert_pos].block_hashes.length > this.ring[insert_pos].lc_pos) {
            return this.ring[insert_pos].block_hashes[this.ring[insert_pos].lc_pos];
        }
        return "";
    }

}



