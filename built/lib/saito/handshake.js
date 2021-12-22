"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var Handshake = /** @class */ (function () {
    function Handshake(app) {
        this.app = app || {};
        return this;
    }
    Handshake.prototype.newHandshake = function () {
        var h = {};
        h.publickey = this.app.wallet.returnPublicKey();
        h.challenge = Math.floor(Math.random() * 100000000000000);
        return h;
    };
    //
    // TODO - base58 conversion through app.crypto
    //
    Handshake.prototype.serializeHandshake = function (h) {
        return Buffer.concat([
            Buffer.from(this.app.crypto.fromBase58(h.publickey), 'hex'),
            this.app.binary.u64AsBytes(h.challenge)
        ]);
    };
    Handshake.prototype.deserializeHandshake = function (buffer) {
        var h2 = this.newHandshake();
        h2.publickey = this.app.crypto.toBase58(Buffer.from(buffer.slice(0, 33)).toString('hex'));
        h2.challenge = this.app.binary.u64FromBytes(buffer.slice(33, 41));
        return h2;
    };
    Handshake.prototype.initiateHandshake = function (socket) {
        return __awaiter(this, void 0, void 0, function () {
            var h, peer_response, h2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        h = this.newHandshake();
                        return [4 /*yield*/, this.app.networkApi.sendAPICall(socket, "SHAKINIT", this.serializeHandshake(h))];
                    case 1:
                        peer_response = _a.sent();
                        h2 = this.deserializeHandshake(peer_response);
                        socket.peer.peer.publickey = h2.publickey;
                        console.log("INITIATING HANDSHAKE!");
                        console.log("setting peer publickey to " + socket.peer.peer.publickey);
                        return [2 /*return*/];
                }
            });
        });
    };
    Handshake.prototype.handleIncomingHandshakeRequest = function (peer, buffer) {
        return __awaiter(this, void 0, void 0, function () {
            var h2, h;
            return __generator(this, function (_a) {
                h2 = this.deserializeHandshake(buffer);
                peer.peer.publickey = h2.publickey;
                console.log("INCOMING HANDSHAKE REQUEST");
                console.log("setting publickey to " + h2.publickey);
                this.app.connection.emit("handshake_complete", peer);
                h = this.newHandshake();
                return [2 /*return*/, this.serializeHandshake(h)];
            });
        });
    };
    return Handshake;
}());
exports.default = Handshake;
//# sourceMappingURL=handshake.js.map