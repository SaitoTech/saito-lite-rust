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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var saito_1 = __importDefault(require("./saito"));
var Hop = /** @class */ (function () {
    function Hop(from, to, sig) {
        if (from === void 0) { from = ""; }
        if (to === void 0) { to = ""; }
        if (sig === void 0) { sig = ""; }
        this.from = from;
        this.to = to;
        this.sig = sig;
    }
    /**
     * Serialize Hop
     * @param {Hop} hop
     * @returns {array} raw bytes
     */
    Hop.prototype.serialize = function (app) {
        var from = app.binary.hexToSizedArray(this.from, 33);
        var to = app.binary.hexToSizedArray(this.to, 32);
        var sig = app.binary.hexToSizedArray(this.sig, 64);
        return new Uint8Array(__spreadArray(__spreadArray(__spreadArray([], __read(from), false), __read(to), false), __read(sig), false));
    };
    Hop.prototype.clone = function () {
        return new saito_1.default.hop(this.from, this.to, this.sig);
    };
    /**
     * Deserialize Hop
     * @param {array} buffer
     * @returns {Hop}
     */
    Hop.prototype.deserialize = function (app, buffer) {
        this.from = Buffer.from(buffer.slice(0, 33)).toString("hex");
        this.to = Buffer.from(buffer.slice(33, 66)).toString("hex");
        this.sig = Buffer.from(buffer.slice(66, 130)).toString("hex");
        return this;
    };
    Hop.prototype.returnFrom = function () {
        return this.from;
    };
    Hop.prototype.returnSig = function () {
        return this.sig;
    };
    Hop.prototype.returnTo = function () {
        return this.to;
    };
    return Hop;
}());
exports.default = Hop;
//# sourceMappingURL=hop.js.map