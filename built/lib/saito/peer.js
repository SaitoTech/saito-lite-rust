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
var JSON = __importStar(require("json-bigint"));
var Peer = /** @class */ (function () {
    function Peer(app, peerjson) {
        if (peerjson === void 0) { peerjson = ""; }
        this.peer = {
            host: "localhost",
            port: "12101",
            publickey: "",
            version: "",
            protocol: "http",
            synctype: "full",
            // lite : lite blocks
            endpoint: {
                host: "localhost",
                port: "12101",
                publickey: "",
                protocol: "http",
            },
            receiveblks: 1,
            receivetxs: 1,
            receivegts: 1,
            sendblks: 1,
            sendtxs: 1,
            sendgts: 1,
            minfee: 0.001,
            socket: {},
            modules: [],
            keylist: [],
        };
        this.app = app;
        this.id = new Date().getTime();
        if (peerjson !== "") {
            try {
                var peerobj = JSON.parse(peerjson);
                if (peerobj.peer.endpoint == null) {
                    peerobj.peer.endpoint = {};
                    peerobj.peer.endpoint.host = peerobj.peer.host;
                    peerobj.peer.endpoint.port = peerobj.peer.port;
                    peerobj.peer.endpoint.protocol = peerobj.peer.protocol;
                }
                this.peer = peerobj.peer;
            }
            catch (err) {
                console.error(err);
            }
        }
    }
    Peer.prototype.addPathToTransaction = function (tx) {
        var tmptx = tx.clone();
        // add our path
        var hop = new saito_1.default.hop();
        hop.from = this.app.wallet.returnPublicKey();
        hop.to = this.returnPublicKey();
        hop.sig = this.app.crypto.signMessage(hop.to, this.app.wallet.returnPrivateKey());
        tmptx.transaction.path.push(hop);
        return tmptx;
    };
    Peer.prototype.inTransactionPath = function (tx) {
        if (tx == null) {
            return 0;
        }
        if (tx.isFrom(this.peer.publickey)) {
            return 1;
        }
        for (var i = 0; i < tx.transaction.path.length; i++) {
            if (tx.transaction.path[i].from === this.peer.publickey) {
                return 1;
            }
        }
        return 0;
    };
    //
    // returns true if we are the first listed peer in the options file
    // TODO -- isFirstPeer
    Peer.prototype.isMainPeer = function () {
        var _a, _b, _c;
        if (((_c = (_b = (_a = this.app) === null || _a === void 0 ? void 0 : _a.options) === null || _b === void 0 ? void 0 : _b.peers) === null || _c === void 0 ? void 0 : _c.length) > 0) {
            var option_peer = this.app.options.peers[0];
            if (option_peer.host === this.peer.endpoint.host) {
                return true;
            }
            if (option_peer.host === this.peer.host) {
                return true;
            }
        }
        return false;
    };
    Peer.prototype.returnPublicKey = function () {
        return this.peer.publickey;
    };
    //
    // no checks on socket state necessary when sending response
    //
    Peer.prototype.sendResponse = function (message_id, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.app.networkApi.sendAPIResponse(this.socket, "RESULT__", message_id, data)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Peer.prototype.sendRequest = function (message, data) {
        //
        // respect prohibitions
        //
        if (data === void 0) { data = ""; }
        // block as Block.serialize(BlockType.Header)
        if (message === "SNDBLOCK") {
            this.app.networkApi.send(this.socket, "SNDBLOCK", data);
            return;
        }
        // block as block_hash
        if (message === "SNDBLKHH") {
            this.app.networkApi.send(this.socket, "SNDBLKHH", data);
            return;
        }
        // transaction as Transaction.serialize()
        if (message === "SNDTRANS") {
            this.app.networkApi.send(this.socket, "SNDTRANS", data);
            return;
        }
        // transaction as Transaction.serialize()
        if (message === "REQCHAIN") {
            this.app.networkApi.send(this.socket, "REQCHAIN", data);
            return;
        }
        //
        // alternately, we have a legacy transmission format, which is sent
        // as a JSON object for reconstruction and manipulation by apps on
        // the other side.
        //
        var data_to_send = { message: message, data: data };
        var buffer = Buffer.from(JSON.stringify(data_to_send), "utf-8");
        if (this.socket && this.socket.readyState === this.socket.OPEN) {
            this.app.networkApi.sendAPICall(this.socket, "SENDMESG", buffer)
                .then(function () {
                //console.debug("message sent with sendRequest");
            });
        }
        else {
            this.sendRequestWithCallbackAndRetry(message, data);
        }
    };
    //
    // new default implementation
    //
    Peer.prototype.sendRequestWithCallback = function (message, data, callback, loop) {
        if (data === void 0) { data = ""; }
        if (callback === void 0) { callback = null; }
        if (loop === void 0) { loop = true; }
        //console.log("sendRequestWithCallback : " + message);
        //
        // respect prohibitions
        //
        if (this.peer.receiveblks === 0 && message === "block") {
            return;
        }
        if (this.peer.receiveblks === 0 && message === "blockchain") {
            return;
        }
        if (this.peer.receivetxs === 0 && message === "transaction") {
            return;
        }
        if (this.peer.receivegts === 0 && message === "golden ticket") {
            return;
        }
        var data_to_send = { message: message, data: data };
        var buffer = Buffer.from(JSON.stringify(data_to_send), "utf-8");
        if (this.socket && this.socket.readyState === this.socket.OPEN) {
            this.app.networkApi.sendAPICall(this.socket, "SENDMESG", buffer)
                .then(function (response) {
                //console.log("RESPONSE RECEIVED: ", response);
                if (callback) {
                    var content = Buffer.from(response).toString('utf-8');
                    content = JSON.parse(content);
                    //console.log("SENDMESG callback: ", content);
                    callback(content);
                }
            })
                .catch(function (error) {
                console.error(error);
                if (callback) {
                    callback({ err: error.toString() });
                }
            });
        }
        else {
            if (loop) {
                //console.log("send request with callback and retry!");
                this.sendRequestWithCallbackAndRetry(message, data, callback);
            }
            else {
                if (callback) {
                    callback({ err: "Socket Not Connected" });
                }
            }
        }
    };
    //
    // repeats until success. this should no longer be called directly, it is called by the
    // above functions in the event that socket transmission is unsuccessful. this is part of
    // our effort to simplify and move down to having only two methods for requesting
    // request emission.
    //
    Peer.prototype.sendRequestWithCallbackAndRetry = function (request, data, callback, initialDelay, delayFalloff) {
        var _this = this;
        if (data === void 0) { data = {}; }
        if (callback === void 0) { callback = null; }
        if (initialDelay === void 0) { initialDelay = 1000; }
        if (delayFalloff === void 0) { delayFalloff = 1.3; }
        //console.debug("sendRequestWithCallbackAndRetry");
        var callbackWrapper = function (res) {
            if (!res.err) {
                if (callback != null) {
                    callback(res);
                }
            }
            else if (res.err === "Socket Not Connected") {
                setTimeout((function () {
                    initialDelay = initialDelay * delayFalloff;
                    _this.sendRequestWithCallback(request, data, callbackWrapper, false);
                }), initialDelay);
            }
            else if (res.err === "Peer not found") {
                if (callback != null) {
                    callback(res); // Server could not find peer,
                }
            }
            else {
                console.log("ERROR 12511: Unknown Error from socket...");
            }
        };
        this.sendRequestWithCallback(request, data, callbackWrapper, false);
    };
    return Peer;
}());
exports.default = Peer;
//# sourceMappingURL=peer.js.map