"use strict";
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
exports.SlipType = void 0;
var SlipType;
(function (SlipType) {
    SlipType[SlipType["Normal"] = 0] = "Normal";
    SlipType[SlipType["ATR"] = 1] = "ATR";
    SlipType[SlipType["VipInput"] = 2] = "VipInput";
    SlipType[SlipType["VipOutput"] = 3] = "VipOutput";
    SlipType[SlipType["MinerInput"] = 4] = "MinerInput";
    SlipType[SlipType["MinerOutput"] = 5] = "MinerOutput";
    SlipType[SlipType["RouterInput"] = 6] = "RouterInput";
    SlipType[SlipType["RouterOutput"] = 7] = "RouterOutput";
    SlipType[SlipType["StakerOutput"] = 8] = "StakerOutput";
    SlipType[SlipType["StakerDeposit"] = 9] = "StakerDeposit";
    SlipType[SlipType["StakerWithdrawalPending"] = 10] = "StakerWithdrawalPending";
    SlipType[SlipType["StakerWithdrawalStaking"] = 11] = "StakerWithdrawalStaking";
    SlipType[SlipType["Other"] = 12] = "Other";
})(SlipType = exports.SlipType || (exports.SlipType = {}));
var Slip = /** @class */ (function () {
    // amount can be a string in NOLAN or a BigInt
    function Slip(publickey, amount, type, uuid, slip_ordinal, payout, lc) {
        if (publickey === void 0) { publickey = ""; }
        if (amount === void 0) { amount = BigInt(0); }
        if (type === void 0) { type = SlipType.Normal; }
        if (uuid === void 0) { uuid = ""; }
        if (slip_ordinal === void 0) { slip_ordinal = 0; }
        if (payout === void 0) { payout = 0; }
        if (lc === void 0) { lc = 1; }
        //
        // consensus variables
        //
        this.add = publickey;
        this.amt = BigInt(amount);
        this.type = type;
        this.uuid = uuid;
        this.sid = slip_ordinal;
        //
        // non-consensus variables
        //
        this.lc = lc; // longest-chain
        this.timestamp = 0; // timestamp
        this.payout = BigInt(payout); // calculated for staking slips
        this.key = ""; // index in utxoset hashmap
    }
    Slip.prototype.returnAmount = function () {
        return this.amt;
    };
    //
    // slip comparison is used when inserting slips (staking slips) into the
    // staking tables, as the order of the stakers table needs to be identical
    // regardless of the order in which components are added, lest we get
    // disagreement.
    //
    // 1 = self is bigger
    // 2 = other is bigger
    // 3 = same
    //
    Slip.prototype.compare = function (other_slip) {
        var x = BigInt('0x' + this.returnPublicKey());
        var y = BigInt('0x' + other_slip.returnPublicKey());
        if (x > y) {
            return 1;
        }
        if (y > x) {
            return 2;
        }
        //
        // use the part of the utxoset key that does not include the
        // publickey but includes the amount and slip ordinal, so that
        // testing is happy that manually created slips are somewhat
        // unique for staker-table insertion..
        //
        var a = BigInt(this.returnKey().substring(42, 74));
        var b = BigInt(other_slip.returnKey().substring(42, 74));
        if (a > b) {
            return 1;
        }
        if (b > a) {
            return 2;
        }
        return 3;
    };
    Slip.prototype.clone = function () {
        return new Slip(this.add, BigInt(this.amt.toString()), this.type, this.uuid, this.sid, this.payout, this.lc);
    };
    Slip.prototype.deserialize = function (app, buffer) {
        this.add = app.crypto.toBase58(Buffer.from(buffer.slice(0, 33)).toString("hex"));
        this.uuid = Buffer.from(buffer.slice(33, 65)).toString("hex");
        this.amt = app.binary.u64FromBytes(buffer.slice(65, 73)).toString();
        this.sid = app.binary.u8FromByte(buffer[73]);
        this.type = app.binary.u32FromBytes(buffer.slice(74, 78));
        // convert to BigInts
        this.amt = BigInt(this.amt.toString());
    };
    Slip.prototype.isNonZeroAmount = function () {
        if (this.amt == BigInt(0)) {
            return 0;
        }
        return 1;
    };
    Slip.prototype.onChainReorganization = function (app, lc, slip_value) {
        if (this.isNonZeroAmount()) {
            app.utxoset.update(this.returnKey(), slip_value);
        }
    };
    Slip.prototype.asReadableString = function () {
        return "         ".concat(this.sid, " | ").concat(this.add, " | ").concat(this.amt.toString());
    };
    Slip.prototype.returnKey = function () {
        return this.add + this.uuid + this.amt.toString() + this.sid;
    };
    Slip.prototype.returnPublicKey = function () {
        return this.add;
    };
    Slip.prototype.returnPayout = function () {
        return this.payout;
    };
    /**
     * Serialize Slip
     * @param {Slip} slip
     * @returns {Uint8Array} raw bytes
     */
    Slip.prototype.serialize = function (app, uuid) {
        if (uuid === void 0) { uuid = ""; }
        if (uuid === "") {
            uuid = this.uuid;
        }
        if (uuid === "") {
            uuid = "0";
        }
        var publickey = app.binary.hexToSizedArray(app.crypto.fromBase58(this.add).toString('hex'), 33);
        var uuidx = app.binary.hexToSizedArray(uuid, 32);
        var amount = app.binary.u64AsBytes(this.amt.toString());
        var slip_ordinal = app.binary.u8AsByte(this.sid);
        var slip_type = app.binary.u32AsBytes(this.type);
        return new Uint8Array(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], __read(publickey), false), __read(uuidx), false), __read(amount), false), [
            slip_ordinal
        ], false), __read(slip_type), false));
    };
    Slip.prototype.serializeInputForSignature = function (app) {
        return this.serialize(app, this.uuid);
    };
    Slip.prototype.serializeOutputForSignature = function (app) {
        return this.serialize(app, "0");
        //(new Array(32).fill(0).toString()));
    };
    Slip.prototype.setPayout = function (payout) {
        this.payout = payout;
    };
    Slip.prototype.validate = function (app) {
        if (this.amt > BigInt(0)) {
            if (app.utxoset.isSpendable(this.returnKey())) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return true;
        }
    };
    return Slip;
}());
exports.default = Slip;
//# sourceMappingURL=slip.js.map