"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BlockIdMask = 1;
var BlockHashMask = 2;
var SyncTypeMask = 4;
var RequestBlockMessage = /** @class */ (function () {
    function RequestBlockMessage(block_id, block_hash, sync_type, app) {
        this.block_id = undefined;
        this.block_hash = undefined;
        this.sync_type = undefined;
        this.block_id = block_id;
        this.block_hash = block_hash;
        this.sync_type = sync_type;
        this.app = app;
    }
    RequestBlockMessage.deserialize = function (bytes, app) {
        var has_block_id = BlockIdMask & bytes[0];
        var has_block_hash = BlockHashMask & bytes[0];
        var has_sync_type = SyncTypeMask & bytes[0];
        var block_id = undefined;
        var block_hash = undefined;
        var sync_type = undefined;
        if (has_block_id) {
            block_id = app.binary.u64FromBytes(bytes.slice(1, 9));
        }
        if (has_block_hash) {
            block_hash = bytes.slice(9, 41);
        }
        if (has_sync_type) {
            sync_type = bytes[41];
        }
        return new RequestBlockMessage(block_id, block_hash, sync_type, app);
    };
    RequestBlockMessage.prototype.serialize = function () {
        var array = [
            Buffer.from([(this.block_id === undefined ? BlockIdMask : 0) + (this.block_hash === undefined ? BlockHashMask : 0) + (this.sync_type === undefined ? SyncTypeMask : 0)]),
        ];
        if (this.block_id !== undefined) {
            array.push(this.app.binary.u64AsBytes(this.block_id));
        }
        else {
            array.push(Buffer.alloc(8, 0));
        }
        if (this.block_hash !== undefined) {
            array.push(this.block_hash);
        }
        else {
            array.push(Buffer.alloc(32, 0));
        }
        if (this.sync_type !== undefined) {
            array.push(Buffer.from([this.sync_type]));
        }
        else {
            array.push(Buffer.from([0]));
        }
        return Buffer.concat(array);
    };
    return RequestBlockMessage;
}());
exports.default = RequestBlockMessage;
//# sourceMappingURL=request_block_message.js.map