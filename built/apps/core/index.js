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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saito_lib = exports.Saito = void 0;
var saito_1 = __importDefault(require("../../lib/saito/saito"));
exports.saito_lib = saito_1.default;
var binary_1 = __importDefault(require("../../lib/saito/binary"));
var crypto_1 = __importDefault(require("../../lib/saito/crypto"));
var utxoset_1 = __importDefault(require("../../lib/saito/utxoset"));
var blockchain_1 = __importDefault(require("../../lib/saito/blockchain"));
var blockring_1 = __importDefault(require("../../lib/saito/blockring"));
var connection_1 = __importDefault(require("../../lib/saito/connection"));
var browser_1 = __importDefault(require("../../lib/saito/browser"));
var goldenticket_1 = __importDefault(require("../../lib/saito/goldenticket"));
var mempool_1 = __importDefault(require("../../lib/saito/mempool"));
var wallet_1 = __importDefault(require("../../lib/saito/wallet"));
var miner_1 = __importDefault(require("../../lib/saito/miner"));
var keychain_1 = __importDefault(require("../../lib/saito/keychain"));
var burnfee_1 = __importDefault(require("../../lib/saito/burnfee"));
var storage_1 = __importDefault(require("../../lib/saito/storage"));
var networkapi_1 = __importDefault(require("../../lib/saito/networkapi"));
var network_1 = __importDefault(require("../../lib/saito/network"));
var staking_1 = __importDefault(require("../../lib/saito/staking"));
var hash_loader_1 = __importDefault(require("./hash-loader"));
var handshake_1 = __importDefault(require("../../lib/saito/handshake"));
var path = require("path");
var Saito = /** @class */ (function () {
    function Saito(config) {
        if (config === void 0) { config = {}; }
        this.options = {};
        this.config = {};
        this.BROWSER = 1;
        this.SPVMODE = 0;
        this.options = config;
        this.config = {};
        this.newSaito();
        // TODO : where does this mod_paths come from?
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.modules = new saito_1.default.modules(this, config.mod_paths);
        return this;
    }
    Saito.prototype.newSaito = function () {
        this.binary = new binary_1.default(this);
        this.crypto = new crypto_1.default(this);
        this.connection = new connection_1.default();
        this.browser = new browser_1.default(this);
        this.storage = new storage_1.default(this);
        this.goldenticket = new goldenticket_1.default(this);
        this.utxoset = new utxoset_1.default();
        this.mempool = new mempool_1.default(this);
        this.wallet = new wallet_1.default(this);
        this.miner = new miner_1.default(this);
        this.keys = new keychain_1.default(this);
        this.network = new network_1.default(this);
        this.networkApi = new networkapi_1.default(this);
        this.burnfee = new burnfee_1.default();
        this.blockchain = new blockchain_1.default(this);
        this.blockring = new blockring_1.default(this, this.blockchain.returnGenesisPeriod());
        this.staking = new staking_1.default(this);
        this.handshake = new handshake_1.default(this);
    };
    Saito.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.storage.initialize()];
                    case 1:
                        _a.sent();
                        //
                        // import hashing library here because of complications with both
                        // performant blake3 library and less performant blake3-js that neeeds
                        // to run in the browser but cannot be deployed via WASM.
                        //
                        // app.crypto.hash()
                        //
                        // is still our go-to function for hashing. This just prepares the
                        // functions and puts them on the app object so that the crypto.hash
                        // function can invoke whichever one is being used in that specific
                        // configuration (server / browser);
                        //
                        return [4 /*yield*/, (0, hash_loader_1.default)(this)];
                    case 2:
                        //
                        // import hashing library here because of complications with both
                        // performant blake3 library and less performant blake3-js that neeeds
                        // to run in the browser but cannot be deployed via WASM.
                        //
                        // app.crypto.hash()
                        //
                        // is still our go-to function for hashing. This just prepares the
                        // functions and puts them on the app object so that the crypto.hash
                        // function can invoke whichever one is being used in that specific
                        // configuration (server / browser);
                        //
                        _a.sent();
                        // if (!this.BROWSER) {
                        //     // eslint-disable-next-line @typescript-eslint/no-var-requires
                        //     // const blake3 = require('blake3');
                        //     const blake3 = await import ("blake3");
                        //     this.hash = (data) => {
                        //         return blake3.hash(data).toString('hex');
                        //     };
                        //
                        // } else {
                        //     // await import("blake3-js").then(blake3 => {
                        //     //     this.hash = (data) => {
                        //     //         return blake3.newRegular().update(data).finalize();
                        //     //     }
                        //     // });
                        //     // eslint-disable-next-line @typescript-eslint/no-var-requires
                        //     const blake3 = require("blake3-js");
                        //
                        //     this.hash = (data) => {
                        //         return blake3.newRegular().update(data).finalize();
                        //         // return blake3.hash(data).toString('hex');
                        //     };
                        //     //
                        //     // this.hash = (data) => {
                        //     //     return blake3.hash(data).toString('hex');
                        //     // };
                        //     // eslint-disable-next-line @typescript-eslint/no-var-requires
                        //     // const blake3 = require("blake3-js");
                        //
                        // }
                        this.wallet.initialize();
                        this.mempool.initialize();
                        this.miner.initialize();
                        this.keys.initialize();
                        this.modules.mods = this.modules.mods_list.map(function (mod_path) {
                            // eslint-disable-next-line @typescript-eslint/no-var-requires
                            var Module = require("../../mods/".concat(mod_path));
                            var x = new Module(_this);
                            x.dirname = path.dirname(mod_path);
                            return x;
                        });
                        //
                        // browser sets active module
                        //
                        return [4 /*yield*/, this.browser.initialize(this)];
                    case 3:
                        //
                        // browser sets active module
                        //
                        _a.sent();
                        return [4 /*yield*/, this.modules.initialize()];
                    case 4:
                        _a.sent();
                        //
                        // blockchain after modules create dbs
                        //
                        return [4 /*yield*/, this.blockchain.initialize()];
                    case 5:
                        //
                        // blockchain after modules create dbs
                        //
                        _a.sent();
                        this.network.initialize();
                        if (this.server) {
                            this.server.initialize();
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        err_1 = _a.sent();
                        console.log("Error occured initializing your Saito install. The most likely cause of this is a module that is throwing an error on initialization. You can debug this by removing modules from your config file to test which ones are causing the problem and restarting.");
                        console.log(err_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Saito.prototype.reset = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.options = config;
                        this.newSaito();
                        return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Saito.prototype.shutdown = function () {
        // TODO : couldn't find close method implementation
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.network.close();
    };
    return Saito;
}());
exports.Saito = Saito;
//# sourceMappingURL=index.js.map