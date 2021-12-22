"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Blockring = /** @class */ (function () {
    function Blockring(app, genesis_period) {
        this.app = app || {};
        //
        // consensus variables
        //
        this.ring_buffer_length = genesis_period * 2;
        this.ring = [this.ring_buffer_length];
        for (var i = 0; i < this.ring_buffer_length; i++) {
            this.ring[i] = {};
            this.ring[i].block_hashes = [];
            this.ring[i].block_ids = [];
            this.ring[i].lc_pos = 0;
        }
        this.is_empty = true;
        this.lc_pos = 0;
    }
    Blockring.prototype.addBlock = function (block) {
        console.debug("blockring.addBlock : " + block.hash);
        var insert_pos = block.returnId() % this.ring_buffer_length;
        var block_id = block.returnId();
        var block_hash = block.returnHash();
        if (!this.containsBlockHashAtBlockId(block_id, block_hash)) {
            this.ring[insert_pos].block_hashes.push(block_hash);
            this.ring[insert_pos].block_ids.push(block_id);
        }
    };
    Blockring.prototype.containsBlockHashAtBlockId = function (block_id, block_hash) {
        var insert_pos = block_id % this.ring_buffer_length;
        console.debug("block hashes", this.ring[insert_pos].block_hashes);
        return this.ring[insert_pos].block_hashes.includes(block_hash);
    };
    Blockring.prototype.deleteBlock = function (block) {
        var insert_pos = block.returnId() % this.ring_buffer_length;
        var block_id = block.returnId();
        var block_hash = block.returnHash();
        if (this.containsBlockHashAtBlockId(block_id, block_hash)) {
            var new_block_hashes = [];
            var new_block_ids = [];
            var idx_loop = 0;
            var new_lc_pos = 0;
            for (var i = 0; i < this.ring[insert_pos].block_hashes.length; i++) {
                if (this.ring[insert_pos].block_ids[i] == block_id && this.ringp[insert_pos].block_hashes[i] == block_hash) {
                }
                else {
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
    };
    Blockring.prototype.isEmpty = function () {
        return this.is_empty;
    };
    Blockring.prototype.print = function () {
        var idx = this.lc_pos % this.ring_buffer_length;
        var cont = true;
        while (idx >= 0 && cont == true) {
            cont = false;
            if (this.ring[idx].block_hashes.length > 0) {
                console.log("block " + this.ring[idx].block_ids[this.ring[idx].lc_pos] + ": " + this.ring[idx].block_hashes[this.ring[idx].lc_pos]);
                idx--;
                cont = true;
            }
        }
    };
    Blockring.prototype.onChainReorganization = function (block_id, block_hash, lc) {
        var insert_pos = block_id % this.ring_buffer_length;
        for (var i = 0; i < this.ring[insert_pos].block_hashes.length; i++) {
            if (this.ring[insert_pos].block_hashes[i] === block_hash) {
                this.ring[insert_pos].lc_pos = i;
            }
        }
        if (lc) {
            this.lc_pos = insert_pos;
        }
        else {
            var previous_insert_pos = insert_pos - 1;
            if (previous_insert_pos < 0) {
                previous_insert_pos === this.ring_buffer_length - 1;
            }
            if (this.ring[previous_insert_pos].block_hashes.length > 0) {
                this.lc_pos = previous_insert_pos;
            }
        }
    };
    Blockring.prototype.returnBlockHashesAtBlockId = function (block_id) {
        var insert_pos = block_id % this.ring_buffer_length;
        var v = [];
        for (var i = 0; i < this.ring[insert_pos].block_hashes.length; i++) {
            v.push(this.ring[insert_pos].block_hashes[i]);
        }
        return v;
    };
    Blockring.prototype.returnLongestChainBlockHashAtBlockId = function (block_id) {
        var insert_pos = block_id % this.ring_buffer_length;
        if (this.ring[insert_pos].lc_pos < this.ring[insert_pos].block_hashes.length) {
            return this.ring[insert_pos].block_hashes[this.ring[insert_pos].lc_pos];
        }
        return "";
    };
    Blockring.prototype.returnLatestBlockHash = function () {
        if (this.lc_pos == 0) {
            return "";
        }
        if (this.ring[this.lc_pos].block_hashes.length > this.ring[this.lc_pos].lc_pos) {
            return this.ring[this.lc_pos].block_hashes[this.ring[this.lc_pos].lc_pos];
        }
        return "";
    };
    Blockring.prototype.returnLatestBlockId = function () {
        if (this.lc_pos == 0) {
            return 0;
        }
        if (this.ring[this.lc_pos].block_ids.length > this.ring[this.lc_pos].lc_pos) {
            return this.ring[this.lc_pos].block_ids[this.ring[this.lc_pos].lc_pos];
        }
        return 0;
    };
    Blockring.prototype.returnLatestBlock = function () {
        var block_hash = this.returnLatestBlockHash();
        if (this.app.blockchain.isBlockIndexed(block_hash)) {
            return this.app.blockchain.blocks[block_hash];
        }
        return null;
    };
    Blockring.prototype.returnLongestChainBlockHashByBlockId = function (block_id) {
        var insert_pos = block_id % this.ring_buffer_length;
        if (this.ring[insert_pos].block_hashes.length > this.ring[insert_pos].lc_pos) {
            return this.ring[insert_pos].block_hashes[this.ring[insert_pos].lc_pos];
        }
        return "";
    };
    return Blockring;
}());
exports.default = Blockring;
//# sourceMappingURL=blockring.js.map