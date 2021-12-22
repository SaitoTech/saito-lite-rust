'use strict';
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
var JSON = __importStar(require("json-bigint"));
var transaction_1 = __importDefault(require("./transaction"));
var Storage = /** @class */ (function () {
    function Storage(app) {
        this.app = app || {};
        this.active_tab = 1; // TODO - only active tab saves, move to Browser class
    }
    Storage.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadOptions()];
                    case 1:
                        _a.sent();
                        this.saveOptions();
                        return [2 /*return*/];
                }
            });
        });
    };
    Storage.prototype.loadOptions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, response, _a, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(typeof (Storage) !== "undefined")) return [3 /*break*/, 5];
                        data = localStorage.getItem("options");
                        if (!(data != "null" && data != null)) return [3 /*break*/, 1];
                        this.app.options = JSON.parse(data);
                        return [3 /*break*/, 5];
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch("/options")];
                    case 2:
                        response = _b.sent();
                        _a = this.app;
                        return [4 /*yield*/, response.json()];
                    case 3:
                        _a.options = _b.sent();
                        this.saveOptions();
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _b.sent();
                        console.error(err_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Storage.prototype.loadTransactions = function (type, num, mycallback) {
        if (type === void 0) { type = "all"; }
        if (num === void 0) { num = 50; }
        var message = "archive";
        var data = {};
        data.request = "load";
        data.type = type;
        data.num = num;
        data.publickey = this.app.wallet.returnPublicKey();
        this.app.network.sendRequestWithCallback(message, data, function (obj) {
            var txs = [];
            if (obj) {
                if (obj.txs) {
                    if (obj.txs.length > 0) {
                        txs = obj.txs.map(function (tx) { return new transaction_1.default(JSON.parse(tx)); });
                    }
                }
            }
            mycallback(txs);
        });
    };
    Storage.prototype.loadTransactionsByKeys = function (keys, type, num, mycallback) {
        if (type === void 0) { type = "all"; }
        if (num === void 0) { num = 50; }
        var message = "archive";
        var data = {};
        data.request = "load_keys";
        data.keys = keys;
        data.type = type;
        data.num = num;
        this.app.network.sendRequestWithCallback(message, data, function (obj) {
            if (obj == undefined) {
                mycallback([]);
                return;
            }
            if (obj.txs == undefined) {
                mycallback([]);
                return;
            }
            if (obj.txs.length == 0) {
                mycallback([]);
                return;
            }
            var txs = [];
            if (obj) {
                if (obj.txs) {
                    if (obj.txs.length > 0) {
                        txs = obj.txs.map(function (tx) { return new transaction_1.default(JSON.parse(tx)); });
                    }
                }
            }
            mycallback(txs);
        });
    };
    Storage.prototype.resetOptions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, _a, err_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch("/options")];
                    case 1:
                        response = _b.sent();
                        _a = this.app;
                        return [4 /*yield*/, response.json()];
                    case 2:
                        _a.options = _b.sent();
                        this.saveOptions();
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _b.sent();
                        console.error(err_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Storage.prototype.saveOptions = function () {
        if (this.app.BROWSER == 1) {
            if (this.active_tab == 0) {
                return;
            }
        }
        try {
            if (typeof (Storage) !== "undefined") {
                localStorage.setItem("options", JSON.stringify(this.app.options));
            }
        }
        catch (err) {
            console.log(err);
        }
    };
    Storage.prototype.getModuleOptionsByName = function (modname) {
        for (var i = 0; i < this.app.options.modules.length; i++) {
            if (this.app.options.modules[i].name === modname) {
                return this.app.options.modules[i];
            }
        }
        return null;
    };
    /**
     * FUNCTIONS OVERWRITTEN BY STORAGE-CORE WHICH HANDLES ITS OWN DATA STORAGE IN ./core/storage-core.js
     **/
    Storage.prototype.saveTransaction = function (tx) {
        var txmsg = tx.returnMessage();
        var message = "archive";
        var data = {};
        data.request = "save";
        data.tx = tx;
        data.type = txmsg.module;
        this.app.network.sendRequestWithCallback(message, data, function (res) {
        });
    };
    Storage.prototype.saveTransactionByKey = function (key, tx) {
        var txmsg = tx.returnMessage();
        var message = "archive";
        var data = {};
        data.request = "save_key";
        data.tx = tx;
        data.key = key;
        data.type = txmsg.module;
        this.app.network.sendRequestWithCallback(message, data, function (res) {
        });
    };
    /**
     * DUMMY FUNCTIONS IMPLEMENTED BY STORAGE-CORE IN ./core/storage-core.js
     **/
    Storage.prototype.deleteBlockFromDisk = function (filename) {
    };
    Storage.prototype.loadBlockById = function (bid) {
    };
    Storage.prototype.loadBlockByHash = function (bsh) {
    };
    Storage.prototype.loadBlockFromDisk = function (filename) {
    };
    Storage.prototype.loadBlockByFilename = function (filename) {
    };
    Storage.prototype.loadBlocksFromDisk = function (maxblocks) {
        if (maxblocks === void 0) { maxblocks = 0; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    Storage.prototype.returnFileSystem = function () {
        return null;
    };
    Storage.prototype.saveBlock = function (block) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, ""];
            });
        });
    };
    Storage.prototype.saveClientOptions = function () {
    };
    Storage.prototype.returnDatabaseByName = function (dbname) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, null];
            });
        });
    };
    Storage.prototype.returnBlockFilenameByHash = function (block_hash, mycallback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    Storage.prototype.returnBlockFilenameByHashPromise = function (block_hash) {
    };
    Storage.prototype.queryDatabase = function (sql, params, database) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    Storage.prototype.executeDatabase = function (sql, params, database, mycallback) {
        if (mycallback === void 0) { mycallback = null; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    return Storage;
}());
exports.default = Storage;
//# sourceMappingURL=storage.js.map