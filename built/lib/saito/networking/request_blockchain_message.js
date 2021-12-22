"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RequestBlockchainMessage = /** @class */ (function () {
    function RequestBlockchainMessage(app, latest_block_id, latest_block_hash, fork_id) {
        this.latest_block_id = 0;
        this.latest_block_hash = Buffer.alloc(32, 0);
        this.fork_id = Buffer.alloc(32, 0);
        this.app = app;
        this.latest_block_id = latest_block_id;
        this.latest_block_hash = latest_block_hash;
        this.fork_id = fork_id;
    }
    RequestBlockchainMessage.deserialize = function (bytes, app) {
        var block_id = app.binary.u64FromBytes(Buffer.from(bytes.slice(0, 8)));
        if (!block_id) { // for initial request
            return new RequestBlockchainMessage(app, 0, Buffer.alloc(32, 0), Buffer.alloc(32, 0));
        }
        var hash = bytes.slice(8, 40);
        var fork_id = bytes.slice(40, 72);
        return new RequestBlockchainMessage(app, Number(block_id), Buffer.from(hash), Buffer.from(fork_id));
    };
    RequestBlockchainMessage.prototype.serialize = function () {
        return Buffer.concat([this.app.binary.u64AsBytes(this.latest_block_id), this.latest_block_hash, this.fork_id]);
    };
    return RequestBlockchainMessage;
}());
exports.default = RequestBlockchainMessage;
//# sourceMappingURL=request_blockchain_message.js.map