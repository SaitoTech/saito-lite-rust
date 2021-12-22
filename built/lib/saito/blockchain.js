"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var saito_1 = __importDefault(require("./saito"));
var utxoset_1 = __importDefault(require("./utxoset"));
var JSON = __importStar(require("json-bigint"));
var Blockchain = /** @class */ (function () {
    function Blockchain(app) {
        this.app = app || {};
        this.blockchain = {};
        this.blockchain.fork_id = "";
        //
        // last in longest_chain
        //
        this.blockchain.last_block_hash = "";
        this.blockchain.last_block_id = 0;
        this.blockchain.last_timestamp = new Date().getTime();
        this.blockchain.last_burnfee = 0;
        //
        // earliest in epoch
        //
        this.blockchain.genesis_period = 100;
        this.blockchain.genesis_block_id = 0;
        this.blockchain.genesis_timestamp = 0;
        //
        // first received this sync (used to prevent recursive fetch forever)
        //
        this.blockchain.lowest_acceptable_timestamp = 0;
        this.blockchain.lowest_acceptable_block_hash = "";
        this.blockchain.lowest_acceptable_block_id = 0;
        //
        // core components
        //
        this.blockring = new saito_1.default.blockring(this.app, this.blockchain.genesis_period);
        this.staking = new saito_1.default.staking(this.app);
        this.blocks = {}; // hashmap of block_hash => block
        this.utxoset = new utxoset_1.default();
        //
        // downgrade blocks after N blocks
        //
        this.prune_after_blocks = 20;
        //
        // set to true when adding blocks to disk (must be done one at a time!)
        //
        // NOTE: this is set to true on creation so that mempool does not start
        // producing blocks on initialization until the blockchain class as got
        // through its own initialization process and had a chance to load blocks
        // off disk.
        //
        this.indexing_active = true;
        //
        // set to zero to disable module execution
        //
        this.run_callbacks = 1;
        this.callback_limit = 100;
    }
    Blockchain.prototype.addBlockToBlockchain = function (block, force) {
        if (force === void 0) { force = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var block_hash, block_id, block_difficulty, previous_block_hash, parent_block_hash, new_chain, old_chain, shared_ancestor_found, new_chain_hash, old_chain_hash, am_i_the_longest_chain, does_new_chain_validate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        //
                        //
                        //
                        this.indexing_active = true;
                        //
                        //
                        // first things first, ensure hashes OK
                        //
                        block.generateHashes();
                        console.log("ABTB: " + block.returnHash());
                        block_hash = block.returnHash();
                        block_id = block.returnId();
                        block_difficulty = block.returnDifficulty();
                        previous_block_hash = this.app.blockring.returnLatestBlockHash();
                        //
                        // sanity checks
                        //
                        if (this.isBlockIndexed(block_hash)) {
                            console.log("ERROR 581023: block exists in blockchain index");
                            this.indexing_active = false;
                            return [2 /*return*/];
                        }
                        parent_block_hash = block.block.previous_block_hash;
                        if (!this.app.blockring.isEmpty() && !this.isBlockIndexed(parent_block_hash)) {
                            console.log("fetching unknown block: " + parent_block_hash);
                            this.app.network.fetchBlock(parent_block_hash);
                        }
                        // pre-validation
                        //
                        // this would be a great place to put in a prevalidation check
                        // once we are finished implementing Saito Classic. Goal would
                        // be a fast form of lite-validation just to determine that it
                        // is worth going through the more general effort of evaluating
                        // this block for consensus.
                        //
                        //
                        // save block to disk
                        //
                        // we have traditionally saved blocks to disk AFTER validating them
                        // but this can slow down block propagation. So it may be sensible
                        // to start a save earlier-on in the process so that we can relay
                        // the block faster serving it off-disk instead of fetching it
                        // repeatedly from memory. Exactly when to do this is left as an
                        // optimization exercise.
                        //
                        //
                        // insert block into hashmap and index
                        //
                        // the blockring is a BlockRing which lets us know which blocks (at which depth)
                        // form part of the longest-chain. We also use the BlockRing to track information
                        // on network congestion (how many block candidates exist at various depths and
                        // in the future potentially the amount of work on each viable fork chain.
                        //
                        // we are going to transfer ownership of the block into the HashMap that stores
                        // the block next, so we insert it into our BlockRing first as that will avoid
                        // needing to borrow the value back for insertion into the BlockRing.
                        //
                        if (!this.app.blockring.containsBlockHashAtBlockId(block_id, block_hash)) {
                            this.app.blockring.addBlock(block);
                        }
                        //
                        // blocks are stored in a hashmap indexed by the block_hash. we expect all
                        // all block_hashes to be unique, so simply insert blocks one-by-one on
                        // arrival if they do not exist.
                        //
                        if (!this.isBlockIndexed(block_hash)) {
                            this.blocks[block_hash] = block;
                        }
                        new_chain = [];
                        old_chain = [];
                        shared_ancestor_found = false;
                        new_chain_hash = block_hash;
                        old_chain_hash = previous_block_hash;
                        while (!shared_ancestor_found) {
                            if (this.blocks[new_chain_hash]) {
                                if (this.blocks[new_chain_hash].lc === 1) {
                                    shared_ancestor_found = true;
                                    break;
                                }
                                else {
                                    if (new_chain_hash === "") {
                                        break;
                                    }
                                }
                                new_chain.push(new_chain_hash);
                                new_chain_hash = this.blocks[new_chain_hash].block.previous_block_hash;
                            }
                            else {
                                break;
                            }
                        }
                        //
                        // get old chain
                        //
                        if (shared_ancestor_found) {
                            while (true) {
                                if (new_chain_hash === old_chain_hash) {
                                    break;
                                }
                                if (this.blocks[old_chain_hash]) {
                                    old_chain.push(old_chain_hash);
                                    old_chain_hash = this.blocks[old_chain_hash].block.previous_block_hash;
                                    if (old_chain_hash === "") {
                                        break;
                                    }
                                    if (new_chain_hash === old_chain_hash) {
                                        break;
                                    }
                                }
                            }
                        }
                        else {
                            //
                            // we have a block without a parent.
                            //
                            if (this.app.blockring.isEmpty()) {
                                //
                                // no need for action as fall-through will result in proper default
                                // behavior. we have the comparison here to separate expected from
                                // unexpected / edge-case issues around block receipt.
                                //
                            }
                            else {
                                //
                                // if this not our first block, handle edge-case around receiving
                                // block 503 before block 453 when block 453 is our expected proper
                                // next block and we are getting blocks out-of-order because of
                                // connection or network issues.
                                //
                                console.log("potential edge case requires handling: blocks received out-of-order");
                                console.log("blkchn: " + JSON.stringify(this.blockchain));
                            }
                        }
                        am_i_the_longest_chain = this.isNewChainTheLongestChain(new_chain, old_chain);
                        if (am_i_the_longest_chain) {
                            block.lc = 1;
                        }
                        block.force = force;
                        //
                        // now update blockring so it is not empty
                        //
                        // we do this down here instead of automatically on
                        // adding a block, as we want to have the above check
                        // for handling the edge-case of blocks received in the
                        // wrong order. the longest_chain check also requires a
                        // first-block-received check that is conducted against
                        // the blockring.
                        //
                        this.app.blockring.is_empty = false;
                        if (!am_i_the_longest_chain) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.validate(new_chain, old_chain)];
                    case 1:
                        does_new_chain_validate = _a.sent();
                        if (!does_new_chain_validate) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.addBlockSuccess(block)];
                    case 2:
                        _a.sent();
                        this.blocks[block_hash].lc = 1;
                        this.app.connection.emit("BlockchainAddBlockSuccess", block_hash);
                        this.app.connection.emit("BlockchainNewLongestChainBlock", {
                            block_hash: block_hash, difficulty: block_difficulty
                        });
                        this.indexing_active = false;
                        return [2 /*return*/, 1];
                    case 3: return [4 /*yield*/, this.addBlockFailure(block)];
                    case 4:
                        _a.sent();
                        this.blocks[block_hash].lc = 0;
                        this.app.connection.emit("BlockchainAddBlockFailure", block_hash);
                        this.indexing_active = false;
                        return [2 /*return*/, 0];
                    case 5: return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, this.addBlockSuccess(block)];
                    case 7:
                        _a.sent();
                        this.app.connection.emit("BlockchainAddBlockSuccess", block_hash);
                        this.indexing_active = false;
                        return [2 /*return*/, 1];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Blockchain.prototype.addBlockSuccess = function (block) {
        return __awaiter(this, void 0, void 0, function () {
            var block_id, starting_block_id, block_id_in_which_to_delete_callbacks, i, blocks_back, this_confirmation, run_callbacks, callback_block_hash, callback_block, callback_block_hash, callback_block;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.app.blockring.print();
                        block_id = block.returnId();
                        if (!!block.isType("Header")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.app.storage.saveBlock(block)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        //
                        // pre-load for next block
                        //
                        //
                        // clean up mempool
                        //
                        this.app.mempool.removeBlockAndTransactions(block);
                        //
                        // propagate block to network
                        //
                        this.app.network.propagateBlock(block);
                        if (!(this.run_callbacks === 1)) return [3 /*break*/, 8];
                        //
                        // this block is initialized with zero-confs processed
                        //
                        block.affixCallbacks();
                        if (!(block.lc === 1 && block.force !== 1)) return [3 /*break*/, 7];
                        starting_block_id = block.returnId() - this.callback_limit;
                        block_id_in_which_to_delete_callbacks = block.returnId() - this.callback_limit;
                        if (starting_block_id < 1) {
                            starting_block_id = 1;
                        }
                        i = starting_block_id;
                        _a.label = 3;
                    case 3:
                        if (!(i <= block.returnId())) return [3 /*break*/, 6];
                        blocks_back = block.returnId() - i;
                        this_confirmation = blocks_back + 1;
                        run_callbacks = 1;
                        //
                        // if bid is less than our last-bid but it is still
                        // the biggest BID we have, then we should avoid
                        // running callbacks as we will have already run
                        // them. We check TS as sanity check as well.
                        //
                        if (block.returnId() < this.blockchain.last_block_id) {
                            if (block.returnTimestamp() < this.blockchain.last_timestamp) {
                                if (block.lc === 1) {
                                    run_callbacks = 0;
                                }
                            }
                        }
                        if (!(run_callbacks === 1)) return [3 /*break*/, 5];
                        callback_block_hash = this.app.blockring.returnLongestChainBlockHashAtBlockId(i);
                        if (!(callback_block_hash !== "")) return [3 /*break*/, 5];
                        callback_block = this.blocks[callback_block_hash];
                        if (!callback_block) return [3 /*break*/, 5];
                        return [4 /*yield*/, callback_block.runCallbacks(this_confirmation)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6:
                        //
                        // delete callbacks as appropriate to save memory
                        //
                        if (block_id_in_which_to_delete_callbacks > 0) {
                            callback_block_hash = this.app.blockring.returnLongestChainBlockHashAtBlockId(block_id_in_which_to_delete_callbacks);
                            callback_block = this.blocks[callback_block_hash];
                            if (callback_block) {
                                callback_block.callbacks = [];
                                callback_block.callbackTxs = [];
                            }
                        }
                        _a.label = 7;
                    case 7:
                        //
                        // callback
                        //
                        this.app.modules.onNewBlock(block, true /*i_am_the_longest_chain*/); // TODO : undefined i_am_the_longest_chain ???
                        _a.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Blockchain.prototype.addBlockFailure = function (block) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("FAILURE: " + block.returnHash());
                //
                // clean up mempool
                //
                this.app.mempool.removeBlockAndTransactions(block);
                return [2 /*return*/];
            });
        });
    };
    //
    // deletes all blocks at a single block_id
    //
    Blockchain.prototype.deleteBlocks = function (delete_block_id) {
        return __awaiter(this, void 0, void 0, function () {
            var block_hashes, _a, _b, _i, hash;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        block_hashes = this.app.blockring.returnBlockHashesAtBlockId(delete_block_id);
                        _a = [];
                        for (_b in block_hashes)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        hash = _a[_i];
                        return [4 /*yield*/, this.deleteBlock(delete_block_id, hash)];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Blockchain.prototype.downgradeBlockchainData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var prune_blocks_at_block_id, block_hashes_copy, block_hashes, hash, _a, _b, _i, hash, pblock;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        //
                        // downgrade blocks still on the chain
                        //
                        if (this.prune_after_blocks > this.app.blockring.returnLatestBlockId()) {
                            return [2 /*return*/];
                        }
                        prune_blocks_at_block_id = this.app.blockring.returnLatestBlockId() - this.prune_after_blocks;
                        if (prune_blocks_at_block_id < 1) {
                            return [2 /*return*/];
                        }
                        block_hashes_copy = [];
                        block_hashes = this.app.blockring.returnBlockHashesAtBlockId(prune_blocks_at_block_id);
                        for (hash in block_hashes) {
                            block_hashes_copy.push(hash);
                        }
                        _a = [];
                        for (_b in block_hashes_copy)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        hash = _a[_i];
                        return [4 /*yield*/, this.loadBlockAsync(hash)];
                    case 2:
                        pblock = _c.sent();
                        return [4 /*yield*/, pblock.downgradeBlockToBlockType("Pruned")];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Blockchain.prototype.generateForkId = function (block_id) {
        var fork_id = [];
        for (var i = 0; i < 32; i++) {
            fork_id.push(0);
        }
        var current_block_id = block_id;
        //
        // roll back to last even 10 blocks
        //
        for (var i = 0; i < 10; i++) {
            if ((current_block_id - i) % 10 === 0) {
                current_block_id -= i;
            }
        }
        var weights = [0, 10, 10, 10, 10, 10, 25, 25, 100, 300, 500, 4000, 10000, 20000, 50000, 100000];
        //
        // loop backwards through blockchain
        //
        for (var i = 0; i < 16; ++i) {
            current_block_id -= weights[i];
            //
            // do not loop around if block id < 0
            //
            if (current_block_id > block_id || current_block_id === 0) {
                break;
            }
            //
            // index to update
            //
            var idx = 2 * i;
            var block_hash = this.blockring.returnLongestChainBlockHashByBlockId(current_block_id);
            fork_id[idx] = block_hash[idx];
            fork_id[idx + 1] = block_hash[idx + 1];
        }
        return fork_id.toString();
    };
    // deletes a single block
    Blockchain.prototype.deleteBlock = function (deletedBlockId, deletedBlockHash) {
        return __awaiter(this, void 0, void 0, function () {
            var block, blockFilename, wallet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        block = this.blocks[deletedBlockHash];
                        blockFilename = this.app.storage.generateBlockFilename(block);
                        wallet = this.app.wallet;
                        wallet.deleteBlock(block);
                        // removes utxoset data
                        return [4 /*yield*/, block.delete(this.utxoset)];
                    case 1:
                        // removes utxoset data
                        _a.sent();
                        // deletes block from disk
                        this.app.storage.deleteBlockFromDisk(blockFilename);
                        // ask blockring to remove
                        this.blockring.deleteBlock(deletedBlockId, deletedBlockHash);
                        // remove from block index
                        if (this.isBlockIndexed(deletedBlockHash)) {
                            delete this.blocks[deletedBlockHash];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Blockchain.prototype.generateLastSharedAncestor = function (peer_latest_block_id, fork_id) {
        var my_latest_block_id = this.app.blockring.returnLatestBlockId();
        var pbid = peer_latest_block_id;
        var mbid = my_latest_block_id;
        var weights = [0, 10, 10, 10, 10, 10, 25, 25, 100, 300, 500, 4000, 10000, 20000, 50000, 100000];
        //
        // peer is further ahead
        //
        if (peer_latest_block_id >= my_latest_block_id) {
            //
            // roll back to last even 10 blocks
            //
            for (var i = 0; i < 10; i++) {
                if ((pbid - BigInt(i)) % BigInt(10) === BigInt(0)) {
                    pbid -= BigInt(i);
                    break;
                }
            }
            var current_block_id = pbid;
            //
            // loop backwards through blockchain
            //
            for (var i = 0; i < 16; ++i) {
                current_block_id -= BigInt(weights[i]);
                //
                // do not loop around if block id < 0
                //
                if (current_block_id < mbid && current_block_id > 0) {
                    var idx = 2 * i;
                    var block_hash = this.app.blockring.returnLongestChainBlockHashByBlockId(pbid);
                    if (fork_id[idx] === block_hash[idx] && fork_id[idx + 1] === block_hash[idx + 1]) {
                        return current_block_id;
                    }
                }
            }
            return 0;
            //
            // peer is not further ahead
            //
        }
        else {
            //
            // roll back to last even 10 blocks
            //
            for (var i = 0; i < 10; i++) {
                if ((mbid - i) % 10 === 0) {
                    mbid -= i;
                    break;
                }
            }
            var current_block_id = mbid;
            for (var i = 0; i < 16; ++i) {
                current_block_id -= weights[i];
                //
                // do not loop around if block id < 0
                //
                if (current_block_id <= peer_latest_block_id && current_block_id > 0) {
                    //
                    // index in fork_id hash
                    //
                    var idx = 2 * i;
                    //
                    // compare input hash to my hash
                    //
                    var block_hash = this.app.blockring.returnLongestChainBlockHashByBlockId(current_block_id);
                    if (fork_id[idx] === block_hash[idx] && fork_id[idx + 1] === block_hash[idx + 1]) {
                        return current_block_id;
                    }
                }
            }
            return 0;
        }
    };
    Blockchain.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        //
                        // TODO - remove when ready
                        //
                        this.resetBlockchain();
                        //
                        // prevent mempool from producing blocks while we load
                        //
                        this.app.mempool.bundling_active = true;
                        this.indexing_active = false;
                        //
                        // load blocks from disk
                        //
                        return [4 /*yield*/, this.app.storage.loadBlocksFromDisk()];
                    case 1:
                        //
                        // load blocks from disk
                        //
                        _a.sent();
                        //
                        // and start mining
                        //
                        this.app.miner.startMining(this.returnLatestBlockHash(), this.returnDifficulty());
                        //
                        // permit mempool to continue
                        //
                        this.app.mempool.bundling_active = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    Blockchain.prototype.isNewChainTheLongestChain = function (new_chain, old_chain) {
        if (this.app.blockring.isEmpty()) {
            return true;
        }
        if (old_chain.length > new_chain.length) {
            return false;
        }
        if (this.app.blockring.returnLatestBlockId() >= this.blocks[new_chain[0]].block.id) {
            return false;
        }
        var old_bf = BigInt(0);
        var new_bf = BigInt(0);
        for (var i = 0; i < old_chain.length; i++) {
            old_bf += BigInt(this.blocks[old_chain[i]].block.burnfee);
        }
        for (var i = 0; i < new_chain.length; i++) {
            new_bf += BigInt(this.blocks[new_chain[i]].block.burnfee);
        }
        //
        // new chain must have more accumulated work AND be longer
        //
        if (old_chain.length < new_chain.length && old_bf <= new_bf) {
            return true;
        }
        return false;
    };
    Blockchain.prototype.isBlockIndexed = function (block_hash) {
        if (this.blocks[block_hash]) {
            return true;
        }
        return false;
    };
    //
    // TODO - fetch from disk if needed, ergo async
    //
    Blockchain.prototype.loadBlockAsync = function (block_hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.blocks[block_hash]) {
                    return [2 /*return*/, this.blocks[block_hash]];
                }
                return [2 /*return*/, null];
            });
        });
    };
    //
    // keeps any blockchain variables like fork_id or genesis_period
    // tracking variables updated as the chain gets new blocks. also
    // pre-loads any blocks needed to improve performance.
    //
    Blockchain.prototype.onChainReorganization = function (block, lc) {
        if (lc === void 0) { lc = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!lc) return [3 /*break*/, 2];
                        //
                        // update consensus variables
                        //
                        this.blockchain.last_block_hash = block.returnHash();
                        this.blockchain.last_block_id = block.returnId();
                        this.blockchain.last_timestamp = block.returnTimestamp();
                        this.blockchain.last_burnfee = block.returnBurnFee();
                        //
                        // update on first received block (used to prevent recursive fetch forever)
                        //
                        if (this.blockchain.lowest_acceptable_timestamp === 0) {
                            this.blockchain.lowest_acceptable_timestamp = block.returnTimestamp();
                            this.blockchain.lowest_acceptable_block_hash = block.returnHash();
                            this.blockchain.lowest_acceptable_block_id = block.returnId();
                        }
                        //
                        // update genesis period, purge old data
                        //
                        return [4 /*yield*/, this.updateGenesisPeriod(block)];
                    case 1:
                        //
                        // update genesis period, purge old data
                        //
                        _a.sent();
                        //
                        // generate fork_id
                        //
                        this.blockchain.fork_id = this.generateForkId(block.returnId());
                        //
                        // save options
                        //
                        this.saveBlockchain();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.downgradeBlockchainData()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Blockchain.prototype.resetBlockchain = function () {
        //
        // last in longest_chain
        //
        this.blockchain.last_block_hash = "";
        this.blockchain.last_block_id = "";
        this.blockchain.last_timestamp = new Date().getTime();
        this.blockchain.last_burnfee = 0;
        //
        // earliest in epoch
        //
        this.blockchain.genesis_block_id = 0;
        this.blockchain.genesis_timestamp = 0;
        //
        // first received this sync (used to prevent recursive fetch forever)
        //
        this.blockchain.lowest_acceptable_timestamp = 0;
        this.blockchain.lowest_acceptable_block_hash = "";
        this.blockchain.lowest_acceptable_block_id = 0;
        this.saveBlockchain();
    };
    Blockchain.prototype.returnDifficulty = function () {
        return 1;
    };
    Blockchain.prototype.returnGenesisPeriod = function () {
        return this.blockchain.genesis_period;
    };
    //  TODO fix
    Blockchain.prototype.returnLowestSpendableBlock = function () {
        return 0;
    };
    // returns header info as indexed, txs and purged data not guaranteed
    Blockchain.prototype.returnLatestBlock = function () {
        return this.app.blockring.returnLatestBlock();
    };
    Blockchain.prototype.returnLatestBlockHash = function () {
        return this.app.blockring.returnLatestBlockHash();
    };
    Blockchain.prototype.returnLatestBlockId = function () {
        return this.app.blockring.returnLatestBlockId();
    };
    Blockchain.prototype.saveBlockchain = function () {
        this.app.options.blockchain = this.blockchain;
        this.app.storage.saveOptions();
    };
    Blockchain.prototype.unwindChain = function (new_chain, old_chain, current_unwind_index, wind_failure) {
        return __awaiter(this, void 0, void 0, function () {
            var block, _a, res_spend, res_unspend, res_delete, i, i, i, res, res;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.loadBlockAsync(old_chain[current_unwind_index])];
                    case 1:
                        block = _b.sent();
                        // utxoset update
                        block.onChainReorganization(false);
                        // blockring update
                        this.app.blockring.onChainReorganization(block.returnId(), block.returnHash(), false);
                        _a = this.staking.onChainReorganization(block, false), res_spend = _a.res_spend, res_unspend = _a.res_unspend, res_delete = _a.res_delete;
                        this.app.wallet.onChainReorganization(block, false);
                        return [4 /*yield*/, this.onChainReorganization(block, false)];
                    case 2:
                        _b.sent();
                        //
                        // we cannot pass the UTXOSet into the staking object to update as that would
                        // require multiple mutable borrows of the blockchain object, so we receive
                        // return vectors of the slips that need to be inserted, spent or deleted and
                        // handle this after-the-fact. this keeps the UTXOSet up-to-date with whatever
                        // is in the staking tables.
                        //
                        for (i = 0; i < res_spend.length; i++) {
                            //res_spend[i].onChainReorganization(this.app, true, 1);
                        }
                        for (i = 0; i < res_unspend.length; i++) {
                            //res_unspend[i].onChainReorganization(this.app, true, 0);
                        }
                        for (i = 0; i < res_delete.length; i++) {
                            //res_spend[i].delete(this.app);
                        }
                        if (!(current_unwind_index === old_chain.length - 1)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.windChain(new_chain, old_chain, new_chain.length - 1, wind_failure)];
                    case 3:
                        res = _b.sent();
                        return [2 /*return*/, res];
                    case 4: return [4 /*yield*/, this.unwindChain(new_chain, old_chain, current_unwind_index + 1, wind_failure)];
                    case 5:
                        res = _b.sent();
                        return [2 /*return*/, res];
                }
            });
        });
    };
    Blockchain.prototype.updateGenesisPeriod = function (longest_chain_block) {
        return __awaiter(this, void 0, void 0, function () {
            var latest_block_id, purge_bid, genesis_block;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        latest_block_id = longest_chain_block.returnId();
                        if (!(latest_block_id >= ((this.returnGenesisPeriod() * 2) + 1))) return [3 /*break*/, 2];
                        purge_bid = latest_block_id - (this.returnGenesisPeriod() * 2);
                        this.blockchain.genesis_block_id = latest_block_id - this.returnGenesisPeriod();
                        //
                        // in either case, we are OK to throw out everything below the
                        // lowest_block_id that we have found. we use the purge_id to
                        // handle purges.
                        //
                        return [4 /*yield*/, this.deleteBlocks(purge_bid)];
                    case 1:
                        //
                        // in either case, we are OK to throw out everything below the
                        // lowest_block_id that we have found. we use the purge_id to
                        // handle purges.
                        //
                        _a.sent();
                        //
                        // update blockchain consensus variables
                        //
                        this.blockchain.genesis_block_id = purge_bid + 1;
                        this.blockchain.genesis_block_hash = this.app.blockring.returnLongestChainBlockHashAtBlockId(purge_bid + 1);
                        genesis_block = this.blocks[this.blockchain.genesis_block_hash];
                        if (genesis_block) {
                            this.blockchain.genesis_timestamp = genesis_block.returnTimestamp();
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Blockchain.prototype.doesChainMeetGoldenTicketRequirements = function (previous_block_hash, current_block_has_golden_ticket) {
        if (current_block_has_golden_ticket === void 0) { current_block_has_golden_ticket = false; }
        return __awaiter(this, void 0, void 0, function () {
            var golden_tickets_found, search_depth_idx, latest_block_hash, MIN_GOLDEN_TICKETS_NUMERATOR, MIN_GOLDEN_TICKETS_DENOMINATOR, i, block;
            return __generator(this, function (_a) {
                golden_tickets_found = 0;
                search_depth_idx = 0;
                latest_block_hash = previous_block_hash;
                MIN_GOLDEN_TICKETS_NUMERATOR = 2;
                MIN_GOLDEN_TICKETS_DENOMINATOR = 6;
                //
                // make sure we have enough golden tickets
                //
                for (i = 0; i < MIN_GOLDEN_TICKETS_DENOMINATOR; i++) {
                    search_depth_idx += 1;
                    if (this.blocks[latest_block_hash]) {
                        block = this.blocks[latest_block_hash];
                        //console.log("does block have GT: " + block.hasGoldenTicket() + " ----> " + block.returnId());
                        if (i === 0) {
                            if (block.returnId() < MIN_GOLDEN_TICKETS_DENOMINATOR) {
                                golden_tickets_found = MIN_GOLDEN_TICKETS_DENOMINATOR;
                                break;
                            }
                        }
                        console.log("does block have GT: " + block.hasGoldenTicket());
                        if (block.hasGoldenTicket()) {
                            golden_tickets_found += 1;
                        }
                        latest_block_hash = block.returnPreviousBlockHash();
                    }
                    else {
                        break;
                    }
                }
                //
                // make sure we have enough golden tickets
                //
                if (golden_tickets_found < MIN_GOLDEN_TICKETS_NUMERATOR && search_depth_idx >= MIN_GOLDEN_TICKETS_DENOMINATOR) {
                    if (current_block_has_golden_ticket) {
                        golden_tickets_found++;
                    }
                }
                if (golden_tickets_found < MIN_GOLDEN_TICKETS_NUMERATOR && search_depth_idx >= MIN_GOLDEN_TICKETS_DENOMINATOR) {
                    console.log("not enough golden tickets: " + golden_tickets_found + " --- " + search_depth_idx);
                    //
                    // TODO - browsers might want to implement this check somehow
                    //
                    if (this.app.BROWSER != 1 && this.app.SPVMODE == 0) {
                        return [2 /*return*/, false];
                    }
                }
                return [2 /*return*/, true];
            });
        });
    };
    Blockchain.prototype.validate = function (new_chain, old_chain) {
        return __awaiter(this, void 0, void 0, function () {
            var block, previous_block_hash, does_chain_meet_golden_ticket_requirements;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        block = this.blocks[new_chain[0]];
                        previous_block_hash = block.returnPreviousBlockHash();
                        return [4 /*yield*/, this.doesChainMeetGoldenTicketRequirements(previous_block_hash, block.hasGoldenTicket())];
                    case 1:
                        does_chain_meet_golden_ticket_requirements = _a.sent();
                        if (!does_chain_meet_golden_ticket_requirements) {
                            console.log("not enough golden tickets!");
                            return [2 /*return*/, false];
                        }
                        if (!(old_chain.length === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.windChain(new_chain, old_chain, new_chain.length - 1, false)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        if (!(new_chain.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.unwindChain(new_chain, old_chain, 0, true)];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5:
                        console.log("lengths are inappropriate");
                        return [2 /*return*/, false];
                }
            });
        });
    };
    Blockchain.prototype.windChain = function (new_chain, old_chain, current_wind_index, wind_failure) {
        return __awaiter(this, void 0, void 0, function () {
            var block, latest_block_id, MAX_STAKER_RECURSION, i, bid, previous_block_hash, previous_block, does_block_validate, _a, res_spend, res_unspend, res_delete, i, i, i, res, res, chain_to_unwind, i, res;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        //
                        // if we are winding a non-existent chain with a wind_failure it
                        // means our wind attempt failed and we should move directly into
                        // add_block_failure() by returning false.
                        //
                        if (wind_failure === true && new_chain.length === 0) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.loadBlockAsync(new_chain[current_wind_index])];
                    case 1:
                        block = _b.sent();
                        latest_block_id = block.returnId();
                        MAX_STAKER_RECURSION = 3;
                        i = 0;
                        _b.label = 2;
                    case 2:
                        if (!(i < MAX_STAKER_RECURSION)) return [3 /*break*/, 6];
                        if (i >= latest_block_id) {
                            return [3 /*break*/, 6];
                        }
                        bid = latest_block_id - i;
                        previous_block_hash = this.app.blockring.returnLongestChainBlockHashByBlockId(bid);
                        if (!this.isBlockIndexed(previous_block_hash)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.loadBlockAsync(previous_block_hash)];
                    case 3:
                        previous_block = _b.sent();
                        return [4 /*yield*/, previous_block.upgradeBlockToBlockType("Full")];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 2];
                    case 6: return [4 /*yield*/, block.validate()];
                    case 7:
                        does_block_validate = _b.sent();
                        if (!does_block_validate) return [3 /*break*/, 10];
                        // update so block_id and block_hash updates
                        this.app.blockring.onChainReorganization(block.returnId(), block.returnHash(), true);
                        _a = this.staking.onChainReorganization(block, true), res_spend = _a.res_spend, res_unspend = _a.res_unspend, res_delete = _a.res_delete;
                        this.app.wallet.onChainReorganization(block, true);
                        //
                        // TODO - do we want async on this?
                        //
                        return [4 /*yield*/, this.onChainReorganization(block, true)];
                    case 8:
                        //
                        // TODO - do we want async on this?
                        //
                        _b.sent();
                        //
                        // we cannot pass the UTXOSet into the staking object to update as that would
                        // require multiple mutable borrows of the blockchain object, so we receive
                        // return vectors of the slips that need to be inserted, spent or deleted and
                        // handle this after-the-fact. this keeps the UTXOSet up-to-date with whatever
                        // is in the staking tables.
                        //
                        // this is actually not a problem in Javascript, but we are handling the same
                        // way as Rust in order to maintain consistency in approach across our two
                        // major codebases.
                        //
                        for (i = 0; i < res_spend.length; i++) {
                            //res_spend[i].onChainReorganization(this.app, true, 1);
                        }
                        for (i = 0; i < res_unspend.length; i++) {
                            //res_unspend[i].onChainReorganization(this.app, true, 0);
                        }
                        for (i = 0; i < res_delete.length; i++) {
                            //res_spend[i].delete(this.app);
                        }
                        //
                        // we have received the first entry in new_blocks() which means we
                        // have added the latest tip. if the variable wind_failure is set
                        // that indicates that we ran into an issue when winding the new_chain
                        // and what we have just processed is the old_chain (being rewound)
                        // so we should exit with failure.
                        //
                        // otherwise we have successfully wound the new chain, and exit with
                        // success.
                        //
                        if (current_wind_index === 0) {
                            if (wind_failure) {
                                return [2 /*return*/, false];
                            }
                            return [2 /*return*/, true];
                        }
                        return [4 /*yield*/, this.windChain(new_chain, old_chain, current_wind_index - 1, false)];
                    case 9:
                        res = _b.sent();
                        return [2 /*return*/, res];
                    case 10:
                        if (!(current_wind_index === new_chain.length - 1)) return [3 /*break*/, 14];
                        if (!(old_chain.length > 0)) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.windChain(old_chain, new_chain, old_chain.len() - 1, true)];
                    case 11:
                        res = _b.sent();
                        return [2 /*return*/, res];
                    case 12: return [2 /*return*/, false];
                    case 13: return [3 /*break*/, 16];
                    case 14:
                        chain_to_unwind = [];
                        //
                        // if we run into a problem winding our chain after we have
                        // wound any blocks, we take the subset of the blocks we have
                        // already pushed through on_chain_reorganization (i.e. not
                        // including this block!) and put them onto a new vector we
                        // will unwind in turn.
                        //
                        for (i = current_wind_index + 1; i < new_chain.length; i++) {
                            chain_to_unwind.push(new_chain[i]);
                        }
                        return [4 /*yield*/, this.unwindChain(old_chain, chain_to_unwind, 0, true)];
                    case 15:
                        res = _b.sent();
                        return [2 /*return*/, res];
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    return Blockchain;
}());
exports.default = Blockchain;
//# sourceMappingURL=blockchain.js.map