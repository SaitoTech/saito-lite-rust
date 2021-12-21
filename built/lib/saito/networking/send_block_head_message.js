"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SendBlockHeadMessage = /** @class */ (function () {
    function SendBlockHeadMessage(block_hash) {
        this.block_hash = [];
        this.block_hash = block_hash;
    }
    SendBlockHeadMessage.deserialize = function (bytes) {
        var block_hash = bytes.slice(0, 32);
        return new SendBlockHeadMessage(block_hash);
    };
    SendBlockHeadMessage.prototype.serialize = function () {
        return Buffer.from(this.block_hash);
    };
    return SendBlockHeadMessage;
}());
exports.default = SendBlockHeadMessage;
//# sourceMappingURL=send_block_head_message.js.map