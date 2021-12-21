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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockType = void 0;
var JSON = __importStar(require("json-bigint"));
var slip_1 = __importStar(require("./slip"));
var transaction_1 = __importStar(require("./transaction"));
var BLOCK_HEADER_SIZE = 213;
var BlockType;
(function (BlockType) {
    BlockType[BlockType["Ghost"] = 0] = "Ghost";
    BlockType[BlockType["Header"] = 1] = "Header";
    BlockType[BlockType["Pruned"] = 2] = "Pruned";
    BlockType[BlockType["Full"] = 3] = "Full";
})(BlockType = exports.BlockType || (exports.BlockType = {}));
var Block = /** @class */ (function () {
    function Block(app, blkobj, confirmations) {
        if (blkobj === void 0) { blkobj = null; }
        if (confirmations === void 0) { confirmations = -1; }
        this.app = app || {};
        //
        // consensus variables
        //
        this.block = {};
        this.block.id = 0;
        this.block.timestamp = 0;
        this.block.previous_block_hash = "";
        this.block.merkle = "";
        this.block.creator = "";
        this.block.burnfee = BigInt(0);
        this.block.difficulty = 0;
        this.block.treasury = BigInt(0);
        this.block.staking_treasury = BigInt(0);
        this.block.signature = "";
        this.lc = 0;
        this.force = 0; // set to 1 if "force" loaded -- used to avoid duplicating callbacks
        this.transactions = [];
        this.block_type = BlockType.Full;
        this.hash = "";
        this.prehash = "";
        this.filename = ""; // set when saved
        this.total_fees = BigInt(0);
        this.total_work = BigInt(0);
        this.routing_work_for_creator = BigInt(0);
        this.is_valid = 1;
        this.has_golden_ticket = false;
        this.has_fee_transaction = false;
        this.ft_idx = 0;
        this.gt_idx = 0;
        this.has_issuance_transaction = false;
        this.has_hashmap_of_slips_spent_this_block = false;
        this.slips_spent_this_block = {};
        this.rebroadcast_hash = "";
        this.total_rebroadcast_slips = 0;
        this.total_rebroadcast_nolan = BigInt(0);
        this.callbacks = [];
        this.callbackTxs = [];
        this.confirmations = -1; // set to +1 when we start callbacks
    }
    Block.prototype.affixCallbacks = function () {
        for (var z = 0; z < this.transactions.length; z++) {
            if (this.transactions[z].transaction.type === transaction_1.TransactionType.Normal) {
                var txmsg = this.transactions[z].returnMessage();
                this.app.modules.affixCallbacks(this.transactions[z], z, txmsg, this.callbacks, this.callbackTxs, this.app);
            }
        }
    };
    /**
     * deserialize block
     * @param {array} buffer -
     * @returns {Block}
     */
    Block.prototype.deserialize = function (buffer) {
        var transactions_length = this.app.binary.u32FromBytes(buffer.slice(0, 4));
        this.block.id = parseInt(this.app.binary.u64FromBytes(buffer.slice(4, 12)).toString()); // TODO : fix this to support correct ranges.
        this.block.timestamp = parseInt(this.app.binary.u64FromBytes(buffer.slice(12, 20)).toString());
        this.block.previous_block_hash = Buffer.from(buffer.slice(20, 52)).toString('hex');
        this.block.creator = this.app.crypto.toBase58(Buffer.from(buffer.slice(52, 85)).toString('hex'));
        this.block.merkle = Buffer.from(buffer.slice(85, 117)).toString('hex');
        this.block.signature = Buffer.from(buffer.slice(117, 181)).toString('hex');
        this.block.treasury = BigInt(this.app.binary.u64FromBytes(buffer.slice(181, 189)));
        this.block.staking_treasury = BigInt(this.app.binary.u64FromBytes(buffer.slice(189, 197)));
        this.block.burnfee = BigInt(this.app.binary.u64FromBytes(buffer.slice(197, 205)));
        this.block.difficulty = parseInt(this.app.binary.u64FromBytes(buffer.slice(205, 213)));
        var start_of_transaction_data = BLOCK_HEADER_SIZE;
        //
        // TODO - there is a cleaner way to do this
        //
        if (this.block.previous_block_hash === "0000000000000000000000000000000000000000000000000000000000000000") {
            this.block.previous_block_hash = "";
        }
        if (this.block.merkle === "0000000000000000000000000000000000000000000000000000000000000000") {
            this.block.merkle = "";
        }
        if (this.block.creator === "000000000000000000000000000000000000000000000000000000000000000000") {
            this.block.creator = "";
        }
        if (this.block.signature ===
            "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000") {
            this.block.signature = "";
        }
        console.debug("transaction count = " + transactions_length);
        for (var i = 0; i < transactions_length; i++) {
            var inputs_len = this.app.binary.u32FromBytes(buffer.slice(start_of_transaction_data, start_of_transaction_data + 4));
            var outputs_len = this.app.binary.u32FromBytes(buffer.slice(start_of_transaction_data + 4, start_of_transaction_data + 8));
            var message_len = this.app.binary.u32FromBytes(buffer.slice(start_of_transaction_data + 8, start_of_transaction_data + 12));
            var path_len = this.app.binary.u32FromBytes(buffer.slice(start_of_transaction_data + 12, start_of_transaction_data + 16));
            var end_of_transaction_data = start_of_transaction_data +
                transaction_1.TRANSACTION_SIZE +
                ((inputs_len + outputs_len) * transaction_1.SLIP_SIZE) +
                message_len +
                path_len *
                    transaction_1.HOP_SIZE;
            var transaction = new transaction_1.default();
            transaction.deserialize(this.app, buffer, start_of_transaction_data);
            this.transactions.push(transaction);
            start_of_transaction_data = end_of_transaction_data;
        }
    };
    //
    // if the block is not at the proper type, try to downgrade it by removing elements
    // that take up significant amounts of data / memory. if this is possible return
    // true, otherwise return false.
    //
    Block.prototype.downgradeBlockToBlockType = function (block_type) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.isType(block_type)) {
                    return [2 /*return*/, true];
                }
                if (block_type === "Pruned") {
                    this.block.transactions = [];
                    this.block_type = BlockType.Pruned;
                    return [2 /*return*/, true];
                }
                return [2 /*return*/, false];
            });
        });
    };
    Block.prototype.deserializeFromNet = function (buffer) {
        return this.deserialize();
    };
    Block.prototype.findWinningRouter = function (random_number) {
        //
        // find winning nolan
        //
        var x = BigInt('0x' + random_number);
        //
        // fee calculation should be the same used in block when
        // generating the fee transaction.
        //
        var y = BigInt(this.returnFeesTotal());
        //
        // if there are no fees, payout to no-one
        //
        if (y === BigInt(0)) {
            return "";
        }
        var winning_nolan = x % y;
        //
        // winning tx is either fee-paying or ATR transaction
        //
        var winning_tx = this.transactions[0];
        for (var i = 0; i < this.transactions.length; i++) {
            if (this.transactions[i].transaction.cumulative_fees > winning_nolan) {
                break;
            }
            winning_tx = this.transactions[i];
        }
        //
        // if winner is atr, take inside TX
        //
        if (winning_tx.returnTransactionType === transaction_1.TransactionType.ATR) {
            var buffer = winning_tx.returnMessage();
            var winning_tx_placeholder = new transaction_1.default();
            winning_tx_placeholder.deserialize(this.app, buffer, 0);
            winning_tx = winning_tx_placeholder;
        }
        //
        // hash random number to pick routing node
        //
        var rn = this.app.crypto.hash(random_number);
        //
        // and pick from path, if exists
        //
        return winning_tx.returnWinningRoutingNode(rn);
    };
    Block.prototype.isType = function (type) {
        if (type === "Ghost") {
            return (this.block_type === BlockType.Ghost);
        }
        if (type === "Pruned") {
            return (this.block_type === BlockType.Pruned);
        }
        if (type === "Header") {
            return (this.block_type === BlockType.Header);
        }
        if (type === "Full") {
            return (this.block_type === BlockType.Full);
        }
    };
    Block.prototype.generateConsensusValues = function () {
        return __awaiter(this, void 0, void 0, function () {
            var MAX_STAKER_RECURSION, cv, i, previous_block, difficulty, pruned_block_id, pruned_block_hash, pruned_block, i, tx, k, output, REBROADCAST_FEE, rebroadcast_transaction, golden_ticket_transaction, gt, next_random_number, miner_publickey, miner_payment, router_payment, block_payout, cont, loop_idx, did_the_block_before_our_staking_block_have_a_golden_ticket, staking_block_hash, staking_block, sp, rp, block_payout_1, staker_slip, slip_was_spent, i, slip_ordinal, transaction, i, output, output, output, output, i, bid, previous_block_hash, previous_block_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        MAX_STAKER_RECURSION = 3;
                        cv = {};
                        cv.total_fees = BigInt(0);
                        cv.ft_num = 0;
                        cv.gt_num = 0;
                        cv.it_num = 0;
                        cv.ft_idx = 0;
                        cv.gt_idx = 0;
                        cv.it_idx = 0;
                        cv.expected_difficulty = 1;
                        cv.total_rebroadcast_nolan = BigInt(0);
                        cv.total_rebroadcast_fees_nolan = BigInt(0);
                        cv.total_rebroadcast_slips = 0;
                        cv.nolan_falling_off_chain = BigInt(0);
                        cv.rebroadcast_hash = "";
                        cv.staking_treasury = BigInt(0);
                        cv.rebroadcasts = [];
                        cv.block_payouts = [];
                        cv.fee_transaction = null;
                        //
                        // total fees and indices
                        //
                        for (i = 0; i < this.transactions.length; i++) {
                            try {
                                if (!this.transactions[i].isFeeTransaction()) {
                                    cv.total_fees += this.transactions[i].returnFeesTotal();
                                }
                                else {
                                    cv.ft_num += 1;
                                    cv.ft_idx = i;
                                    this.has_fee_transaction = true;
                                    this.ft_idx = i;
                                }
                                if (this.transactions[i].isGoldenTicket()) {
                                    cv.gt_num += 1;
                                    cv.gt_idx = i;
                                    this.has_golden_ticket = true;
                                    this.gt_idx = i;
                                }
                                if (this.transactions[i].isIssuanceTransaction()) {
                                    cv.it_num += 1;
                                    cv.it_idx = i;
                                    this.has_issuance_transaction = true;
                                }
                            }
                            catch (err) {
                                console.log("ERROR: " + err);
                                console.log("ERROR W/: " + JSON.stringify(this.transactions[i]));
                            }
                        }
                        return [4 /*yield*/, this.app.blockchain.loadBlockAsync(this.block.previous_block_hash)];
                    case 1:
                        previous_block = _a.sent();
                        if (previous_block) {
                            difficulty = previous_block.returnDifficulty();
                            if (previous_block.hasGoldenTicket() && cv.gt_num === 0) {
                                if (difficulty > 0) {
                                    cv.expected_difficulty = previous_block.returnDifficulty() - 1;
                                }
                            }
                            else if (previous_block.hasGoldenTicket() && cv.gt_num > 0) {
                                cv.expected_difficulty = difficulty + 1;
                            }
                            else {
                                cv.expected_difficulty = difficulty;
                            }
                        }
                        else {
                            //
                            // if there is no previous block, the burn fee is not adjusted. validation
                            // rules will cause the block to fail unless it is the first block.
                            //
                        }
                        if (!(this.block.id > (this.app.blockchain.returnGenesisPeriod() + 1))) return [3 /*break*/, 3];
                        pruned_block_id = this.block.id - this.app.blockchain.returnGenesisPeriod();
                        pruned_block_hash = this.app.blockring.returnLongestChainBlockHashByBlockId(pruned_block_id);
                        console.log("pruned block id: " + pruned_block_id);
                        console.log("pruned block hash: " + pruned_block_hash);
                        return [4 /*yield*/, this.app.blockchain.loadBlockAsync(pruned_block_hash)];
                    case 2:
                        pruned_block = _a.sent();
                        //
                        // generate metadata should have prepared us with a pre-prune block
                        // that contains all of the transactions and is ready to have its
                        // ATR rebroadcasts calculated.
                        //
                        if (pruned_block) {
                            //
                            // identify unspent transactions
                            //
                            for (i = 0; i < pruned_block.transactions.length; i++) {
                                tx = pruned_block.transactions[i];
                                for (k = 0; k < tx.transaction.to.length; k++) {
                                    output = tx.transaction.to[k];
                                    REBROADCAST_FEE = BigInt(200000000);
                                    //
                                    // valid means spendable and non-zero
                                    //
                                    if (output.validate(this.app)) {
                                        //
                                        // TODO - no parse int as numbers potentially too big
                                        //
                                        if (output.returnAmount() > REBROADCAST_FEE) {
                                            cv.total_rebroadcast_nolan += output.returnAmount();
                                            cv.total_rebroadcast_fees_nolan += REBROADCAST_FEE;
                                            cv.total_rebroadcast_slips += 1;
                                            rebroadcast_transaction = new transaction_1.default();
                                            rebroadcast_transaction.generateRebroadcastTransaction(this.app, output, REBROADCAST_FEE);
                                            //
                                            // update cryptographic hash of all ATRs
                                            //
                                            cv.rebroadcast_hash = this.app.crypto.hash(cv.rebroadcast_hash + rebroadcast_transaction.serializeForSignature(this.app));
                                        }
                                        else {
                                            //
                                            // rebroadcast dust is either collected into the treasury or
                                            // distributed as a fee for the next block producer. for now
                                            // we will simply distribute it as a fee. we may need to
                                            // change this if the DUST becomes a significant enough amount
                                            // each block to reduce consensus security.
                                            //
                                            cv.total_rebroadcast_fees_nolan += output.returnAmount();
                                        }
                                    }
                                }
                            }
                        }
                        _a.label = 3;
                    case 3:
                        if (!(cv.gt_idx > 0)) return [3 /*break*/, 9];
                        golden_ticket_transaction = this.transactions[cv.gt_idx];
                        gt = this.app.goldenticket.deserializeFromTransaction(golden_ticket_transaction);
                        next_random_number = this.app.crypto.hash(gt.random_bytes);
                        miner_publickey = gt.creator;
                        if (!previous_block) return [3 /*break*/, 8];
                        miner_payment = previous_block.returnFeesTotal() / BigInt(2);
                        router_payment = previous_block.returnFeesTotal() / BigInt(2);
                        block_payout = {
                            miner: "",
                            staker: "",
                            router: "",
                            miner_payout: BigInt(0),
                            staker_payout: BigInt(0),
                            router_payout: BigInt(0),
                            staking_treasury: BigInt(0),
                            staker_slip: null,
                            random_number: next_random_number,
                        };
                        block_payout.router = previous_block.findWinningRouter(next_random_number);
                        block_payout.miner = miner_publickey;
                        block_payout.miner_payout = miner_payment;
                        block_payout.router_payout = router_payment;
                        //
                        // these two from find_winning_router - 3, 4
                        //
                        next_random_number = this.app.crypto.hash(next_random_number);
                        next_random_number = this.app.crypto.hash(next_random_number);
                        //
                        // add these payouts to consensus values
                        //
                        cv.block_payouts.push(block_payout);
                        cont = 1;
                        loop_idx = 0;
                        did_the_block_before_our_staking_block_have_a_golden_ticket = previous_block.hasGoldenTicket();
                        staking_block_hash = previous_block.returnPreviousBlockHash();
                        _a.label = 4;
                    case 4:
                        if (!(cont === 1)) return [3 /*break*/, 8];
                        loop_idx += 1;
                        if (!(loop_idx >= MAX_STAKER_RECURSION)) return [3 /*break*/, 5];
                        cont = 0;
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.app.blockchain.loadBlockAsync(staking_block_hash)];
                    case 6:
                        staking_block = _a.sent();
                        if (staking_block) {
                            //
                            // in case we need another loop
                            //
                            staking_block_hash = staking_block.returnPreviousBlockHash();
                            if (!did_the_block_before_our_staking_block_have_a_golden_ticket) {
                                //
                                // update with this block info in case of next loop
                                //
                                did_the_block_before_our_staking_block_have_a_golden_ticket = staking_block.hasGoldenTicket();
                                sp = staking_block.returnFeesTotal() / BigInt(2);
                                rp = staking_block.returnFeesTotal() - sp;
                                block_payout_1 = {
                                    miner: "",
                                    staker: "",
                                    router: "",
                                    miner_payout: BigInt(0),
                                    staker_payout: BigInt(0),
                                    router_payout: BigInt(0),
                                    staking_treasury: BigInt(0),
                                    staker_slip: null,
                                    random_number: next_random_number,
                                };
                                block_payout_1.router = staking_block.findWinningRouter(next_random_number);
                                block_payout_1.router_payout = rp;
                                block_payout_1.staking_treasury = sp;
                                // router consumes 2 hashes
                                next_random_number = this.app.crypto.hash(next_random_number);
                                next_random_number = this.app.crypto.hash(next_random_number);
                                staker_slip = this.app.staking.findWinningStaker(next_random_number);
                                if (staker_slip) {
                                    slip_was_spent = 0;
                                    //
                                    // check to see if block already pays out to this slip
                                    //
                                    for (i = 0; i < cv.block_payouts.length; i++) {
                                        if (cv.block_payouts[i].staker_slip.returnKey() === staker_slip.returnKey()) {
                                            slip_was_spent = 1;
                                            break;
                                        }
                                    }
                                    //
                                    // check to see if staker slip already spent/withdrawn
                                    //
                                    if (this.slips_spent_this_block.includes(staker_slip.returnKey())) {
                                        slip_was_spent = 1;
                                    }
                                    //
                                    // add payout to staker if staker is new
                                    //
                                    if (slip_was_spent === 0) {
                                        block_payout_1.staker = staker_slip.returnPublicKey();
                                        block_payout_1.staker_payout = staker_slip.returnAmount() + staker_slip.returnPayout();
                                        block_payout_1.staker_slip = staker_slip.clone();
                                    }
                                    next_random_number = this.app.crypto.hash(next_random_number);
                                    cv.block_payouts.push(block_payout_1);
                                }
                            }
                        }
                        _a.label = 7;
                    case 7: return [3 /*break*/, 4];
                    case 8:
                        slip_ordinal = 0;
                        transaction = new transaction_1.default();
                        transaction.transaction.type = transaction_1.TransactionType.Fee;
                        for (i = 0; i < cv.block_payouts.length; i++) {
                            if (cv.block_payout[i].miner !== "") {
                                output = new slip_1.default();
                                output.add = cv.block_payout[i].miner;
                                output.amt = cv.block_payout[i].miner_payout;
                                output.type = slip_1.SlipType.MinerOutput;
                                output.sid = slip_ordinal;
                                transaction.addOutput(output.clone());
                                slip_ordinal += 1;
                            }
                            if (cv.block_payout[i].router !== "") {
                                output = new slip_1.default();
                                output.add = cv.block_payout[i].router;
                                output.amt = cv.block_payout[i].router_payout;
                                output.type = slip_1.SlipType.RouterOutput;
                                output.sid = slip_ordinal;
                                transaction.addOutput(output.clone());
                                slip_ordinal += 1;
                            }
                            if (cv.block_payout[i].router !== "") {
                                output = new slip_1.default();
                                output.add = cv.block_payout[i].router;
                                output.amt = cv.block_payout[i].router_payout;
                                output.type = slip_1.SlipType.RouterOutput;
                                output.sid = slip_ordinal;
                                transaction.addOutput(output.clone());
                                slip_ordinal += 1;
                            }
                            if (cv.block_payout[i].staker !== "") {
                                output = new slip_1.default();
                                output.add = cv.block_payout[i].staker;
                                output.amt = cv.block_payout[i].staker_payout;
                                output.type = slip_1.SlipType.StakerOutput;
                                output.sid = slip_ordinal;
                                transaction.addOutput(output.clone());
                                slip_ordinal += 1;
                                cv.staking_treasury += cv.block_payout[i].staking_treasury;
                                cv.staking_treasury -= cv.block_payout[i].staker_payout;
                            }
                        }
                        cv.fee_transaction = transaction;
                        _a.label = 9;
                    case 9:
                        if (!(cv.gt_num === 0)) return [3 /*break*/, 13];
                        i = 1;
                        _a.label = 10;
                    case 10:
                        if (!(i <= MAX_STAKER_RECURSION)) return [3 /*break*/, 13];
                        if (i >= this.returnId()) {
                            return [3 /*break*/, 13];
                        }
                        bid = this.returnId() - i;
                        previous_block_hash = this.app.blockring.returnLongestChainBlockHashByBlockId(bid);
                        if (!(previous_block_hash !== "")) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.app.blockchain.loadBlockAsync(previous_block_hash)];
                    case 11:
                        previous_block_1 = _a.sent();
                        if (previous_block_1) {
                            if (previous_block_1.hasGoldenTicket()) {
                                return [3 /*break*/, 13];
                            }
                            else {
                                //
                                // this is the block BEFORE from which we need to collect the nolan due to
                                // our iterator starting at 0 for the current block. i.e. if MAX_STAKER_
                                // RECURSION is 3, at 3 we are the fourth block back.
                                //
                                if (i === MAX_STAKER_RECURSION) {
                                    cv.nolan_falling_off_chain = previous_block_1.returnFeesTotal();
                                }
                            }
                        }
                        _a.label = 12;
                    case 12:
                        i++;
                        return [3 /*break*/, 10];
                    case 13: return [2 /*return*/, cv];
                }
            });
        });
    };
    Block.prototype.generate = function (previous_block_hash, mempool) {
        if (mempool === void 0) { mempool = null; }
        return __awaiter(this, void 0, void 0, function () {
            var previous_block_id, previous_block_timestamp, previous_block_difficulty, previous_block_burnfee, previous_block_treasury, previous_block_staking_treasury, current_timestamp, previous_block, current_burnfee, i, gt, cv, rlen, i, i, k, adjusted_staking_treasury, x;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        previous_block_id = 0;
                        previous_block_timestamp = 0;
                        previous_block_difficulty = 0;
                        previous_block_burnfee = BigInt(0);
                        previous_block_treasury = BigInt(0);
                        previous_block_staking_treasury = BigInt(0);
                        current_timestamp = new Date().getTime();
                        return [4 /*yield*/, mempool.app.blockchain.loadBlockAsync(previous_block_hash)];
                    case 1:
                        previous_block = _a.sent();
                        if (previous_block) {
                            previous_block_id = previous_block.block.id;
                            previous_block_burnfee = previous_block.block.burnfee;
                            previous_block_timestamp = previous_block.block.timestamp;
                            previous_block_difficulty = previous_block.block.difficulty;
                            previous_block_treasury = previous_block.block.treasury;
                            previous_block_staking_treasury = previous_block.block.staking_treasury;
                        }
                        current_burnfee = this.app.burnfee.returnBurnFeeForBlockProducedAtCurrentTimestampInNolan(previous_block_burnfee, current_timestamp, previous_block_timestamp);
                        //
                        // set our values
                        //
                        this.block.id = previous_block_id + 1;
                        this.block.previous_block_hash = previous_block_hash;
                        this.block.burnfee = current_burnfee;
                        this.block.timestamp = current_timestamp;
                        this.block.difficulty = previous_block_difficulty;
                        //
                        // swap in transactions
                        //
                        // note that these variables are submitted attached to the mempool
                        // object, so we can hot-swap using pass-by-reference. these
                        // modifications change the mempool in real-time.
                        //
                        this.transactions = mempool.mempool.transactions;
                        mempool.mempool.transactions = [];
                        //
                        // swap in golden ticket
                        //
                        // note that these variables are submitted attached to the mempool
                        // object, so we can hot-swap using pass-by-reference. these
                        // modifications change the mempool in real-time.
                        //
                        console.log("-----------------------------------");
                        console.log("how many gts to check? " + mempool.mempool.golden_tickets.length);
                        for (i = 0; i < mempool.mempool.golden_tickets.length; i++) {
                            console.log("checking GT: " + i);
                            gt = this.app.goldenticket.deserializeFromTransaction(mempool.mempool.golden_tickets[i]);
                            console.log("comparing " + gt.target_hash + " -- " + previous_block_hash);
                            if (gt.target_hash === previous_block_hash) {
                                console.log("ADDING GT TX TO BLOCK");
                                this.transactions.unshift(mempool.mempool.golden_tickets[i]);
                                this.has_golden_ticket = 1;
                                mempool.mempool.golden_tickets.splice(i, 1);
                                i = mempool.mempool.golden_tickets.length + 2;
                            }
                        }
                        console.log("-----------------------------------");
                        return [4 /*yield*/, this.generateConsensusValues()];
                    case 2:
                        cv = _a.sent();
                        rlen = cv.rebroadcasts.length;
                        for (i = 0; i < rlen; i++) {
                            cv.rebroadcasts[i].generateMetadata(this.app.wallet.returnPublicKey());
                            this.transactions.push(cv.rebroadcasts[i]);
                        }
                        //
                        // fee transactions
                        //
                        if (cv.fee_transaction != null) {
                            //
                            // creator signs fee transaction
                            //
                            cv.fee_transaction.sign(this.app);
                            this.add_transaction(cv.fee_transaction);
                        }
                        //
                        // update slips_spent_this_block so that we have a record of
                        // how many times input slips are spent in this block. we will
                        // use this later to ensure there are no duplicates. this include
                        // during the fee transaction, so that we cannot pay a staker
                        // that is also paid this block otherwise.
                        //
                        for (i = 0; i < this.transactions.length; i++) {
                            if (!this.transactions[i].isFeeTransaction()) {
                                for (k = 0; k < this.transactions[i].transaction.from.length; k++) {
                                    this.slips_spent_this_block[this.transactions[i].transaction.from[k].returnKey()] = 1;
                                }
                            }
                        }
                        this.created_hashmap_of_slips_spent_this_block = true;
                        //
                        // set difficulty
                        //
                        this.block.difficulty = cv.expected_difficulty;
                        //
                        // set treasury
                        //
                        if (cv.nolan_falling_off_chain !== 0) {
                            this.block.treasury = previous_block_treasury + cv.nolan_falling_off_chain;
                        }
                        //
                        // set staking treasury
                        //
                        if (cv.staking_treasury !== 0) {
                            adjusted_staking_treasury = previous_block_staking_treasury;
                            if (cv.staking_treasury < 0) {
                                x = cv.staking_treasury * BigInt(-1);
                                if (adjusted_staking_treasury > x) {
                                    adjusted_staking_treasury -= x;
                                }
                                else {
                                    adjusted_staking_treasury = BigInt(0);
                                }
                            }
                            else {
                                adjusted_staking_treasury += cv.staking_treasury;
                            }
                        }
                        //
                        // generate merkle root
                        //
                        this.block.merkle = this.generateMerkleRoot();
                        //
                        // sign the block
                        //
                        this.sign(this.app.wallet.returnPublicKey(), this.app.wallet.returnPrivateKey());
                        //
                        // and return to normal
                        //
                        this.bundling_active = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    Block.prototype.generateMetadata = function () {
        //
        // generate block hashes
        //
        this.generateHashes();
        //
        // if we are generating the metadata for a block, we use the
        // publickey of the block creator when we calculate the fees
        // and the routing work.
        //
        var creator_publickey = this.returnCreator();
        this.transactions.map(function (tx) { return tx.generateMetadata(creator_publickey); });
        //
        // we need to calculate the cumulative figures AFTER the
        // original figures.
        //
        var cumulative_fees = 0;
        var cumulative_work = 0;
        var has_golden_ticket = false;
        var has_fee_transaction = false;
        var has_issuance_transaction = false;
        var issuance_transaction_idx = 0;
        var golden_ticket_idx = 0;
        var fee_transaction_idx = 0;
        //
        // we have to do a single sweep through all of the transactions in
        // non-parallel to do things like generate the cumulative order of the
        // transactions in the block for things like work and fee calculations
        // for the lottery.
        //
        // we take advantage of the sweep to perform other pre-validation work
        // like counting up our ATR transactions and generating the hash
        // commitment for all of our rebroadcasts.
        //
        for (var i = 0; i < this.transactions.length; i++) {
            var transaction = this.transactions[i];
            cumulative_fees = transaction.generateMetadataCumulativeFees(cumulative_fees);
            cumulative_work = transaction.generateMetadataCumulativeWork(cumulative_work);
            //
            // update slips_spent_this_block so that we have a record of
            // how many times input slips are spent in this block. we will
            // use this later to ensure there are no duplicates. this include
            // during the fee transaction, so that we cannot pay a staker
            // that is also paid this block otherwise.
            //
            // we skip the fee transaction as otherwise we have trouble
            // validating the staker slips if we have received a block from
            // someone else -- i.e. we will think the slip is spent in the
            // block when generating the FEE TX to check against the in-block
            // fee tx.
            //
            if (!this.has_hashmap_of_slips_spent_this_block) {
                if (transaction.transaction.type !== transaction_1.TransactionType.Fee) {
                    for (var i_1 = 0; i_1 < transaction.transaction.from.length; i_1++) {
                        var key = transaction.transaction.from[i_1].returnKey();
                        this.slips_spent_this_block[key] = 1;
                    }
                    this.has_hashmap_of_slips_spent_this_block = true;
                }
            }
            //
            // also check the transactions for golden ticket and fees
            //
            switch (transaction.transaction.type) {
                case transaction_1.TransactionType.Issuance:
                    has_issuance_transaction = true;
                    issuance_transaction_idx = i;
                    break;
                case transaction_1.TransactionType.Fee:
                    has_fee_transaction = true;
                    fee_transaction_idx = i;
                    break;
                case transaction_1.TransactionType.GoldenTicket:
                    has_golden_ticket = true;
                    golden_ticket_idx = i;
                    break;
                case transaction_1.TransactionType.ATR: {
                    // TODO : move to another method
                    var bytes = new Uint8Array(__spreadArray(__spreadArray([], __read(this.rebroadcast_hash), false), __read(transaction.serializeForSignature(this.app)), false));
                    this.rebroadcast_hash = this.app.crypto.hash(bytes);
                    for (var i_2 = 0; i_2 < transaction.transaction.from.length; i_2++) {
                        var input = transaction.transaction.from[i_2];
                        this.total_rebroadcast_slips += 1;
                        this.total_rebroadcast_nolan += input.returnAmount();
                    }
                    break;
                }
                default:
                    break;
            }
        }
        this.has_fee_tranasction = has_fee_transaction;
        this.has_golden_ticket = has_golden_ticket;
        this.has_issuance_transaction = has_issuance_transaction;
        this.fee_transaction_idx = fee_transaction_idx;
        this.golden_ticket_idx = golden_ticket_idx;
        this.issuance_transaction_idx = issuance_transaction_idx;
        //
        // update block with total fees
        //
        this.total_fees = cumulative_fees;
        this.routing_work_for_creator = cumulative_work;
        return true;
    };
    Block.prototype.generateHashes = function () {
        this.hash = this.returnHash();
    };
    Block.prototype.hasFeeTransaction = function () {
        return this.has_fee_transaction;
    };
    Block.prototype.hasGoldenTicket = function () {
        return this.has_golden_ticket;
    };
    Block.prototype.hasIssuanceTransaction = function () {
        return this.has_issuance_transaction;
    };
    Block.prototype.onChainReorganization = function (lc) {
        var block_id = this.returnId();
        for (var i = 0; i < this.transactions.length; i++) {
            this.transactions[i].onChainReorganization(this.app, lc, block_id);
        }
        this.lc = lc;
    };
    Block.prototype.asReadableString = function () {
        var html = '';
        html += "\n Block ".concat(this.block.id, " - ").concat(this.returnHash(), "\n   timestamp:   ").concat(this.block.timestamp, "\n   prevblock:   ").concat(this.block.previous_block_hash, "\n   merkle:      ").concat(this.block.merkle, "\n   burnfee:     ").concat(this.block.burnfee.toString(), "\n   difficulty:  ").concat(this.block.difficulty, "\n   streasury:   ").concat(this.block.staking_treasury.toString(), "\n   *** transactions ***\n");
        for (var i = 0; i < this.transactions.length; i++) {
            html += this.transactions[i].asReadableString();
            html += "\n";
        }
        return html;
    };
    Block.prototype.returnBurnFee = function () {
        return this.block.burnfee;
    };
    Block.prototype.returnCreator = function () {
        return this.block.creator;
    };
    Block.prototype.returnFeeTransaction = function () {
        if (!this.has_fee_transaction) {
            return null;
        }
        if (this.transactions.length === 0) {
            return null;
        }
        return this.transactions[this.ft_idx];
    };
    Block.prototype.returnFeesTotal = function () {
        return this.total_fees;
    };
    Block.prototype.returnGoldenTicketTransaction = function () {
        if (!this.has_golden_ticket) {
            return null;
        }
        if (this.transactions.length === 0) {
            return null;
        }
        return this.transactions[this.gt_idx];
    };
    Block.prototype.returnDifficulty = function () {
        return this.block.difficulty;
    };
    Block.prototype.returnFilename = function () {
        return this.filename;
    };
    Block.prototype.returnHash = function () {
        if (this.hash) {
            return this.hash;
        }
        this.prehash = this.app.crypto.hash(this.serializeForSignature());
        this.hash = this.app.crypto.hash(this.prehash + this.block.previous_block_hash);
        return this.hash;
    };
    Block.prototype.returnId = function () {
        return this.block.id;
    };
    Block.prototype.runCallbacks = function (conf, run_callbacks) {
        if (run_callbacks === void 0) { run_callbacks = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var i, ii, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.confirmations && this.callbacks)) return [3 /*break*/, 9];
                        i = this.confirmations + 1;
                        _a.label = 1;
                    case 1:
                        if (!(i <= conf)) return [3 /*break*/, 9];
                        ii = 0;
                        _a.label = 2;
                    case 2:
                        if (!(ii < this.callbacks.length)) return [3 /*break*/, 8];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 7]);
                        if (!(run_callbacks === 1)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.callbacks[ii](this, this.transactions[this.callbackTxs[ii]], i, this.app)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        err_1 = _a.sent();
                        console.log("ERROR 567567: ", err_1);
                        return [3 /*break*/, 7];
                    case 7:
                        ii++;
                        return [3 /*break*/, 2];
                    case 8:
                        i++;
                        return [3 /*break*/, 1];
                    case 9:
                        this.confirmations = conf;
                        return [2 /*return*/];
                }
            });
        });
    };
    Block.prototype.generateMerkleRoot = function () {
        //
        // if we are lite-client and have been given a block without transactions
        // we accept the merkle root since it is what has been provided. users who
        // do not wish to run this risk need necessarily to fully-validate, since
        // they are trusting the server to notify them when there *are* transactions
        // as in any other blockchains/SPV/MR implementation.
        //
        if (this.transactions.length === 0 && (this.app.BROWSER === 1 || this.app.SPVMODE === 1)) {
            return this.block.merkle;
        }
        var mr = "";
        var txs = [];
        for (var i = 0; i < this.transactions.length; i++) {
            if (this.transactions[i].transaction.type === transaction_1.TransactionType.SPV) {
                txs.push(this.transactions[i].transaction.sig);
            }
            else {
                txs.push(this.app.crypto.hash(this.transactions[i].serializeForSignature(this.app)));
            }
        }
        while (mr === "") {
            var tx2 = [];
            if (txs.length <= 2) {
                if (txs.length === 1) {
                    mr = txs[0];
                }
                else {
                    mr = this.app.crypto.hash(("" + txs[0] + txs[1]));
                }
            }
            else {
                for (var i = 0; i < txs.length; i++) {
                    if (i <= txs.length - 2) {
                        tx2.push(this.app.crypto.hash(("" + txs[i] + txs[i + 1])));
                        i++;
                    }
                    else {
                        tx2.push(txs[i]);
                    }
                }
                txs = tx2;
            }
        }
        return mr;
    };
    Block.prototype.returnPreviousBlockHash = function () {
        return this.block.previous_block_hash;
    };
    Block.prototype.returnStakingTreasury = function () {
        return this.block.staking_treasury;
    };
    Block.prototype.returnTreasury = function () {
        return this.block.treasury;
    };
    Block.prototype.returnTimestamp = function () {
        return this.block.timestamp;
    };
    /**
     * Serialize Block
     * @param {Block} block
     * @returns {array} - raw bytes
     */
    Block.prototype.serialize = function (block_type) {
        if (block_type === void 0) { block_type = BlockType.Full; }
        //
        // ensure strings have appropriate number of bytes if empty
        //
        var block_previous_block_hash = this.block.previous_block_hash;
        // if (block_previous_block_hash === "") { block_previous_block_hash = "0000000000000000000000000000000000000000000000000000000000000000"; }
        //
        // TODO - there is a cleaner way to do this
        //
        var block_merkle = this.block.merkle;
        var block_creator = this.block.creator;
        var block_signature = this.block.signature;
        var transactions_length = this.app.binary.u32AsBytes(0);
        if (this.transactions.length > 0) {
            transactions_length = this.app.binary.u32AsBytes(this.transactions.length);
        }
        var id = this.app.binary.u64AsBytes(this.block.id);
        var timestamp = this.app.binary.u64AsBytes(this.block.timestamp);
        var previous_block_hash = this.app.binary.hexToSizedArray(block_previous_block_hash, 32);
        var creator = this.app.binary.hexToSizedArray(this.app.crypto.fromBase58(block_creator).toString('hex'), 33);
        var merkle_root = this.app.binary.hexToSizedArray(block_merkle, 32);
        var signature = this.app.binary.hexToSizedArray(block_signature, 64);
        var treasury = this.app.binary.u64AsBytes(this.block.treasury.toString());
        var staking_treasury = this.app.binary.u64AsBytes(this.block.staking_treasury.toString());
        var burnfee = this.app.binary.u64AsBytes(this.block.burnfee.toString());
        var difficulty = this.app.binary.u64AsBytes(this.block.difficulty);
        var block_header_data = new Uint8Array(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], __read(transactions_length), false), __read(id), false), __read(timestamp), false), __read(previous_block_hash), false), __read(creator), false), __read(merkle_root), false), __read(signature), false), __read(treasury), false), __read(staking_treasury), false), __read(burnfee), false), __read(difficulty), false));
        if (block_type === BlockType.Header) {
            var ret_1 = new Uint8Array(BLOCK_HEADER_SIZE);
            ret_1.set(block_header_data, 0);
            return ret_1;
        }
        //
        // add transactions for FULL blocks
        //
        var total_tx_length = 0;
        var transactions = [];
        for (var i = 0; i < this.transactions.length; i++) {
            var next_tx_data = this.transactions[i].serialize(this.app);
            total_tx_length += next_tx_data.length;
            transactions.push(next_tx_data);
        }
        var ret = new Uint8Array(BLOCK_HEADER_SIZE + total_tx_length);
        ret.set(block_header_data, 0);
        var next_tx_location = BLOCK_HEADER_SIZE;
        for (var i = 0; i < transactions.length; i++) {
            ret.set(transactions[i], next_tx_location);
            next_tx_location += transactions[i].length;
        }
        return ret;
    };
    Block.prototype.serializeForSignature = function () {
        return Uint8Array.from(Buffer.concat([
            this.app.binary.u64AsBytes(this.block.id),
            this.app.binary.u64AsBytes(this.block.timestamp),
            this.app.binary.hexToSizedArray(this.block.previous_block_hash, 32),
            this.app.binary.hexToSizedArray(this.app.crypto.fromBase58(this.block.creator).toString('hex'), 33),
            this.app.binary.hexToSizedArray(this.block.merkle, 32),
            this.app.binary.u64AsBytes(this.block.treasury.toString()),
            this.app.binary.u64AsBytes(this.block.staking_treasury.toString()),
            this.app.binary.u64AsBytes(this.block.burnfee.toString()),
            this.app.binary.u64AsBytes(this.block.difficulty)
        ]));
    };
    Block.prototype.sign = function (publickey, privatekey) {
        //console.log("block::sign", privatekey);
        this.block.creator = publickey;
        this.block.signature = this.app.crypto.signBuffer(Buffer.from(this.serializeForSignature()), privatekey);
    };
    Block.prototype.validate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cv_1, cv, previous_block, adjusted_staking_treasury, cv_st, x, x, new_burnfee, amount_of_routing_work_needed, golden_ticket_transaction, gt, solution, fee_transaction, hash1, hash2, i, is_valid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.app.BROWSER == 1)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.generateConsensusValues()];
                    case 1:
                        cv_1 = _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        //console.log("block::validate");
                        //
                        // invalid if no transactions
                        //
                        if (this.transactions.length === 0) {
                            console.log("ERROR 582034: no transactions in blocks, thus invalid");
                            return [2 /*return*/, false];
                        }
                        //
                        // verify creator signed
                        //
                        if (!this.app.crypto.verifyHash(this.app.crypto.hash(this.serializeForSignature()), this.block.signature, this.block.creator)) {
                            console.log("ERROR 582039: block is not signed by creator or signature does not validate");
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.generateConsensusValues()];
                    case 3:
                        cv = _a.sent();
                        //
                        // only block #1 can have an issuance transaction
                        //
                        if (cv.it_num > 0 && this.get_id() > 1) {
                            console.log("ERROR 712923: blockchain contains issuance after block 1 in chain");
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.app.blockchain.loadBlockAsync(this.block.previous_block_hash)];
                    case 4:
                        previous_block = _a.sent();
                        if (previous_block) {
                            //
                            // treasury
                            //
                            if (this.returnTreasury() !== (previous_block.returnTreasury() + cv.nolan_falling_off_chain)) {
                                console.log("ERROR 123243: treasury is not calculated properly");
                                return [2 /*return*/, false];
                            }
                            adjusted_staking_treasury = previous_block.returnStakingTreasury();
                            cv_st = cv.staking_treasury;
                            if (cv_st < BigInt(0)) {
                                x = cv_st * -1;
                                if (adjusted_staking_treasury < x) {
                                    adjusted_staking_treasury = adjusted_staking_treasury - x;
                                }
                                else {
                                    adjusted_staking_treasury = BigInt(0);
                                }
                            }
                            else {
                                x = cv_st;
                                adjusted_staking_treasury = adjusted_staking_treasury + x;
                            }
                            if (this.returnStakingTreasury().toString() !== adjusted_staking_treasury.toString()) {
                                console.log("ERROR 820391: staking treasury does not validate");
                                return [2 /*return*/, false];
                            }
                            new_burnfee = this.app.burnfee.returnBurnFeeForBlockProducedAtCurrentTimestampInNolan(previous_block.returnBurnFee(), this.returnTimestamp(), previous_block.returnTimestamp());
                            if (new_burnfee !== this.returnBurnFee()) {
                                console.log("ERROR 182085: burn fee not calculated properly thus invalid");
                                return [2 /*return*/, false];
                            }
                            amount_of_routing_work_needed = this.app.burnfee.returnRoutingWorkNeededToProduceBlockInNolan(previous_block.returnBurnFee(), this.returnTimestamp(), previous_block.returnTimestamp());
                            if (this.routing_work_for_creator < amount_of_routing_work_needed) {
                                console.log("ERROR 510293: block lacking adequate routing work from creator");
                                return [2 /*return*/, false];
                            }
                            //
                            // validate golden ticket
                            //
                            // the golden ticket is a special kind of transaction that stores the
                            // solution to the network-payment lottery in the transaction message
                            // field. it targets the hash of the previous block, which is why we
                            // tackle it's validation logic here.
                            //
                            // first we reconstruct the ticket, then calculate that the solution
                            // meets our consensus difficulty criteria. note that by this point in
                            // the validation process we have already examined the fee transaction
                            // which was generated using this solution. If the solution is invalid
                            // we find that out now, and it invalidates the block.
                            //
                            if (cv.gt_idx > 0) {
                                golden_ticket_transaction = this.transactions[cv.gt_idx];
                                gt = this.app.goldenticket.deserializeFromTransaction(golden_ticket_transaction);
                                solution = this.app.goldenticket.generateSolution(previous_block.returnHash(), gt.target_hash, gt.random_bytes, gt.creator);
                                if (!this.app.goldenticket.isValidSolution(solution, previous_block.returnDifficulty())) {
                                    console.log("ERROR 801923: golden ticket included in block is invalid");
                                    return [2 /*return*/, false];
                                }
                            }
                        }
                        else {
                            //
                            // no previous block?
                            //
                        }
                        //
                        // validate atr
                        //
                        // Automatic Transaction Rebroadcasts are removed programmatically from
                        // an earlier block in the blockchain and rebroadcast into the latest
                        // block, with a fee being deducted to keep the data on-chain. In order
                        // to validate ATR we need to make sure we have the correct number of
                        // transactions (and ONLY those transactions!) included in our block.
                        //
                        // we do this by comparing the total number of ATR slips and nolan
                        // which we counted in the generate_metadata() function, with the
                        // expected number given the consensus values we calculated earlier.
                        //
                        if (cv.total_rebroadcast_slips !== this.total_rebroadcast_slips) {
                            console.log("ERROR 624442: rebroadcast slips total incorrect");
                            return [2 /*return*/, false];
                        }
                        if (cv.total_rebroadcast_nolan !== this.total_rebroadcast_nolan) {
                            console.log("ERROR 294018: rebroadcast nolan amount incorrect: ".concat(cv.total_rebroadcast_nolan, " - ").concat(this.total_rebroadcast_nolan));
                            return [2 /*return*/, false];
                        }
                        if (cv.rebroadcast_hash !== this.rebroadcast_hash) {
                            console.log("ERROR 123422: hash of rebroadcast transactions incorrect");
                            return [2 /*return*/, false];
                        }
                        //
                        // validate merkle root
                        //
                        if (this.block.merkle !== this.generateMerkleRoot()) {
                            console.log("merkle root is unset or is invalid false 1");
                            return [2 /*return*/, false];
                        }
                        //
                        // validate fee transactions
                        //
                        // if this block contains a golden ticket, we have to use the random
                        // number associated with the golden ticket to create a fee-transaction
                        // that stretches back into previous blocks and finds the winning nodes
                        // that should collect payment.
                        //
                        if (cv.ft_num > 0) {
                            //
                            // no golden ticket? invalid
                            //
                            if (cv.gt_num === 0) {
                                console.log("ERROR 48203: fee transaction exists but no golden ticket, thus invalid");
                                return [2 /*return*/, false];
                            }
                            fee_transaction = this.transactions[cv.ft_idx];
                            //
                            // the fee transaction we receive from the CV needs to be updated with
                            // block-specific data in the same way that all of the transactions in
                            // the block have been. we must do this prior to comparing them.
                            //
                            cv.fee_transaction.generateMetadata(this.returnCreator());
                            hash1 = this.app.crypto.hash(fee_transaction.serializeForSignature());
                            hash2 = this.app.crypto.hash(cv.fee_transaction.serialize_for_signature());
                            if (hash1 !== hash2) {
                                console.log("ERROR 892032: block {} fee transaction doesn't match cv fee transaction");
                                return [2 /*return*/, false];
                            }
                        }
                        //
                        // validate difficulty
                        //
                        // difficulty here refers the difficulty of generating a golden ticket
                        // for any particular block. this is the difficulty of the mining
                        // puzzle that is used for releasing payments.
                        //
                        // those more familiar with POW and POS should note that "difficulty" of
                        // finding a block is represented in the burn fee variable which we have
                        // already examined and validated above. producing a block requires a
                        // certain amount of golden ticket solutions over-time, so the
                        // distinction is in practice less clean.
                        //
                        if (cv.expected_difficulty !== this.returnDifficulty()) {
                            console.log("ERROR 202392: difficulty is invalid - " + cv.expected_difficulty + " versus " + this.returnDifficulty());
                            return [2 /*return*/, false];
                        }
                        //
                        // validate transactions
                        //
                        // validating transactions requires checking that the signatures are valid,
                        // the routing paths are valid, and all of the input slips are pointing
                        // to spendable tokens that exist in our UTXOSET. this logic is separate
                        // from the validation of block-level variables, so is handled in the
                        // transaction objects.
                        //
                        // this is one of the most computationally intensive parts of processing a
                        // block which is why we handle it in parallel. the exact logic needed to
                        // examine a transaction may depend on the transaction itself, as we have
                        // some specific types (Fee / ATR / etc.) that are generated automatically
                        // and may have different requirements.
                        //
                        // the validation logic for transactions is contained in the transaction
                        // class, and the validation logic for slips is contained in the slips
                        // class. Note that we are passing in a read-only copy of our UTXOSet so
                        // as to determine spendability.
                        //
                        // TODO - remove when convenient. when transactions fail to validate using
                        // parallel processing can make it difficult to find out exactly what the
                        // problem is. ergo this code that tries to do them on the main thread so
                        // debugging output works.
                        //
                        for (i = 0; i < this.transactions.length; i++) {
                            is_valid = this.transactions[i].validate(this.app);
                            if (!is_valid) {
                                console.log("ERROR 579128: transaction is invalid");
                                return [2 /*return*/, false];
                            }
                        }
                        return [2 /*return*/, true];
                }
            });
        });
    };
    //
    // if the block is not at the proper type, try to upgrade it to have the
    // data that is necessary for blocks of that type if possible. if this is
    // not possible, return false. if it is possible, return true once upgraded.
    //
    Block.prototype.upgradeBlockToBlockType = function (block_type) {
        return __awaiter(this, void 0, void 0, function () {
            var block;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isType(block_type)) {
                            return [2 /*return*/, true];
                        }
                        if (!(block_type === "Full")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.app.storage.loadBlockByFilename(this.app.storage.generateBlockFilename(this))];
                    case 1:
                        block = _a.sent();
                        block.generateHashes();
                        this.transactions = block.transactions;
                        this.generateMetadata();
                        this.block_type = BlockType.Full;
                        return [2 /*return*/, true];
                    case 2: return [2 /*return*/, false];
                }
            });
        });
    };
    return Block;
}());
exports.default = Block;
//# sourceMappingURL=block.js.map