"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendBlockchainBlockData = exports.SyncType = void 0;
var SyncType;
(function (SyncType) {
    SyncType[SyncType["Full"] = 0] = "Full";
    SyncType[SyncType["Lite"] = 1] = "Lite";
})(SyncType = exports.SyncType || (exports.SyncType = {}));
var BlockchainBlockDataSize = 84;
var SendBlockchainBlockData = /** @class */ (function () {
    function SendBlockchainBlockData(block_id, block_hash, timestamp, pre_hash, number_of_transactions) {
        this.block_id = 0;
        this.block_hash = [];
        this.timestamp = 0;
        this.pre_hash = []; // TODO : remove this field if not required
        this.number_of_transactions = 0; // TODO : remove this field if not required
        this.block_id = block_id;
        this.block_hash = block_hash;
        this.timestamp = timestamp;
        this.pre_hash = pre_hash;
        this.number_of_transactions = number_of_transactions;
    }
    return SendBlockchainBlockData;
}());
exports.SendBlockchainBlockData = SendBlockchainBlockData;
var SendBlockchainMessage = /** @class */ (function () {
    function SendBlockchainMessage(sync_type, starting_hash, blocks_data, app) {
        this.sync_type = undefined;
        this.starting_hash = [];
        this.blocks_data = [];
        this.sync_type = sync_type;
        this.starting_hash = starting_hash;
        this.blocks_data = blocks_data;
        this.app = app;
    }
    SendBlockchainMessage.deserialize = function (bytes, app) {
        console.debug("SendBlockchainMessage.deserialize", bytes);
        var sync_type = Number(bytes[0]);
        var starting_hash = Buffer.from(bytes.slice(1, 33));
        var blocks_data_len = app.binary.u32FromBytes(Buffer.from(bytes.slice(33, 37)));
        var blocks_data = [];
        var start_of_block_data = 37;
        for (var i = 0; i < blocks_data_len; ++i) {
            var start_of_data = start_of_block_data + i * BlockchainBlockDataSize;
            var block_id = app.binary.u64FromBytes(bytes.slice(start_of_data, start_of_data + 8));
            var block_hash = Buffer.from(bytes.slice(start_of_data + 8, start_of_data + 40));
            var timestamp = Number(app.binary.u64FromBytes(bytes.slice(start_of_data + 40, start_of_data + 48)));
            var pre_hash = Buffer.from(bytes.slice(start_of_data + 48, start_of_data + 80));
            var number_of_transactions = app.binary.u32FromBytes(bytes.slice(start_of_data + 80, start_of_data + 84));
            blocks_data.push(new SendBlockchainBlockData(block_id, block_hash, timestamp, pre_hash, number_of_transactions));
        }
        return new SendBlockchainMessage(sync_type, starting_hash, blocks_data, app);
    };
    SendBlockchainMessage.prototype.serialize = function () {
        var e_1, _a;
        //console.log("SendBlockchainMessage.serialize", this);
        var bytes = Buffer.concat([Buffer.from([this.app.binary.u8AsByte(this.sync_type)]),
            Buffer.from(this.starting_hash),
            Buffer.from(this.app.binary.u32AsBytes(this.blocks_data.length))]);
        try {
            for (var _b = __values(this.blocks_data), _c = _b.next(); !_c.done; _c = _b.next()) {
                var block = _c.value;
                bytes = Buffer.concat([bytes,
                    Buffer.from(this.app.binary.u64AsBytes(block.block_id)),
                    Buffer.from(block.block_hash),
                    Buffer.from(this.app.binary.u64AsBytes(block.timestamp)),
                    Buffer.from(block.pre_hash),
                    Buffer.from(this.app.binary.u32AsBytes(block.number_of_transactions))
                ]);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return bytes;
    };
    return SendBlockchainMessage;
}());
exports.default = SendBlockchainMessage;
//# sourceMappingURL=send_blockchain_message.js.map