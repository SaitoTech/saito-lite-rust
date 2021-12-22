"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UtxoSet = /** @class */ (function () {
    function UtxoSet() {
        this.slips = [];
    }
    UtxoSet.prototype.update = function (slipkey, val) {
        this.slips[slipkey] = val;
    };
    UtxoSet.prototype.validate = function (slipkey) {
        if (this.slips[slipkey] == 1) {
            return true;
        }
        return false;
    };
    return UtxoSet;
}());
exports.default = UtxoSet;
//# sourceMappingURL=utxoset.js.map