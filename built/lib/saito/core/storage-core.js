'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var saito_1 = __importDefault(require("../saito"));
var storage_1 = __importDefault(require("../storage"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var JSON = __importStar(require("json-bigint"));
var path_1 = __importDefault(require("path"));
var sqlite_1 = __importDefault(require("sqlite"));
var StorageCore = /** @class */ (function (_super) {
    __extends(StorageCore, _super);
    function StorageCore(app, data, dest) {
        if (dest === void 0) { dest = "blocks"; }
        var _this = _super.call(this, app) || this;
        _this.data_dir = data || path_1.default.join(__dirname, '../../../data');
        _this.config_dir = path_1.default.join(__dirname, '../../../config');
        _this.dest = dest;
        _this.db = [];
        _this.dbname = [];
        _this.loading_active = false;
        _this.file_encoding_save = 'utf8';
        _this.file_encoding_load = 'utf8';
        return _this;
        //    this.file_encoding_load    = 'binary';
        //this.file_encoding         = 'binary';
    }
    StorageCore.prototype.deleteBlockFromDisk = function (filename) {
        return fs_extra_1.default.unlinkSync(filename);
    };
    StorageCore.prototype.returnFileSystem = function () {
        return fs_extra_1.default;
    };
    StorageCore.prototype.returnDatabaseByName = function (dbname) {
        return __awaiter(this, void 0, void 0, function () {
            var i, db, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        for (i = 0; i < this.dbname.length; i++) {
                            if (dbname == this.dbname[i]) {
                                return [2 /*return*/, this.db[i]];
                            }
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, sqlite_1.default.open(this.data_dir + '/' + dbname + '.sq3')];
                    case 2:
                        db = _a.sent();
                        this.dbname.push(dbname);
                        this.db.push(db);
                        return [2 /*return*/, this.db[this.db.length - 1]];
                    case 3:
                        err_1 = _a.sent();
                        console.log("Error creating database for db-name: " + dbname);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StorageCore.prototype.generateBlockFilename = function (block) {
        var filename = this.data_dir + "/" + this.dest + "/";
        filename += Buffer.from(this.app.binary.u64AsBytes(block.block.timestamp).toString('hex'));
        filename += "-";
        filename += Buffer.from(block.hash).toString("hex");
        filename += ".sai";
        return filename;
    };
    StorageCore.prototype.loadBlockFromDisk = function (filename) {
        try {
            if (fs_extra_1.default.existsSync(filename)) {
                var buffer = fs_extra_1.default.readFileSync(filename);
                var block = new saito_1.default.block(this.app);
                block.deserialize(buffer);
                block.generateMetadata();
                return block;
            }
        }
        catch (error) {
            console.log("Error reading block from disk");
            console.error(error);
        }
        return null;
    };
    StorageCore.prototype.loadBlocksFromDisk = function (maxblocks) {
        if (maxblocks === void 0) { maxblocks = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var dir, files, i, fileID, blk, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.loading_active = true;
                        dir = "".concat(this.data_dir, "/").concat(this.dest, "/");
                        files = fs_extra_1.default.readdirSync(dir);
                        //
                        // "empty" file only
                        //
                        if (files.length == 1) {
                            this.loading_active = false;
                            return [2 /*return*/];
                        }
                        files.sort(function (a, b) {
                            var compres = fs_extra_1.default.statSync(dir + a).mtime.getTime() - fs_extra_1.default.statSync(dir + b).mtime.getTime();
                            if (compres == 0) {
                                return parseInt(a) - parseInt(b);
                            }
                            return compres;
                        });
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < files.length)) return [3 /*break*/, 8];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        fileID = files[i];
                        if (!(fileID !== "empty")) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.loadBlockByFilename(fileID)];
                    case 3:
                        blk = _a.sent();
                        if (blk == null) {
                            console.log("block is null: " + fileID);
                            return [2 /*return*/, null];
                        }
                        if (blk.is_valid == 0) {
                            console.log("We have saved an invalid block: " + fileID);
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this.app.blockchain.addBlockToBlockchain(blk, 1)];
                    case 4:
                        _a.sent();
                        console.log("Loaded block " + i + " of " + files.length);
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        err_2 = _a.sent();
                        console.log("ERROR");
                        console.log(err_2);
                        return [3 /*break*/, 7];
                    case 7:
                        i++;
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Saves a block to database and disk and shashmap
     *
     * @param {saito.block} block block
     */
    StorageCore.prototype.saveBlock = function (block) {
        return __awaiter(this, void 0, void 0, function () {
            var filename, fd, buffer;
            return __generator(this, function (_a) {
                filename = this.generateBlockFilename(block);
                if (!fs_extra_1.default.existsSync(filename)) {
                    fd = fs_extra_1.default.openSync(filename, 'w');
                    buffer = block.serialize();
                    fs_extra_1.default.writeSync(fd, buffer);
                    fs_extra_1.default.fsyncSync(fd);
                    fs_extra_1.default.closeSync(fd);
                }
                return [2 /*return*/, filename];
            });
        });
    };
    /* deletes block from shashmap and disk */
    StorageCore.prototype.deleteBlock = function (bid, bsh, lc) {
        return __awaiter(this, void 0, void 0, function () {
            var blk, b, bb, block_filename;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadBlockByHash(bsh)];
                    case 1:
                        blk = _a.sent();
                        if (!(blk != null)) return [3 /*break*/, 3];
                        //
                        // delete txs
                        //
                        if (blk.transactions != undefined) {
                            for (b = 0; b < blk.transactions.length; b++) {
                                for (bb = 0; bb < blk.transactions[b].transaction.to.length; bb++) {
                                    blk.transactions[b].transaction.to[bb].bid = bid;
                                    blk.transactions[b].transaction.to[bb].bhash = bsh;
                                    blk.transactions[b].transaction.to[bb].tid = blk.transactions[b].transaction.id;
                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                    // @ts-ignore
                                    shashmap.delete_slip(blk.transactions[b].transaction.to[bb].returnIndex());
                                }
                            }
                        }
                        return [4 /*yield*/, this.returnBlockFilenameByHashPromise(bsh)];
                    case 2:
                        block_filename = _a.sent();
                        fs_extra_1.default.unlink(block_filename.toString(), function (err) {
                            if (err) {
                                console.error(err);
                            }
                        });
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    StorageCore.prototype.loadBlockById = function (bid) {
        return __awaiter(this, void 0, void 0, function () {
            var bsh, ts, filename, blk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bsh = this.app.blockchain.bid_bsh_hmap[bid];
                        ts = this.app.blockchain.bsh_ts_hmap[bsh];
                        filename = ts + "-" + bsh + ".blk";
                        return [4 /*yield*/, this.loadBlockByFilename(filename)];
                    case 1:
                        blk = _a.sent();
                        return [2 /*return*/, blk];
                }
            });
        });
    };
    StorageCore.prototype.loadBlockByHash = function (bsh) {
        return __awaiter(this, void 0, void 0, function () {
            var ts, filename, blk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ts = this.app.blockchain.bsh_ts_hmap[bsh];
                        filename = ts + "-" + bsh + ".blk";
                        return [4 /*yield*/, this.loadBlockByFilename(filename)];
                    case 1:
                        blk = _a.sent();
                        return [2 /*return*/, blk];
                }
            });
        });
    };
    StorageCore.prototype.loadBlockByFilename = function (filename) {
        return __awaiter(this, void 0, void 0, function () {
            var block_filename, data, block;
            return __generator(this, function (_a) {
                block_filename = "".concat(this.data_dir, "/").concat(this.dest, "/").concat(filename);
                console.log("trying to load: " + block_filename);
                try {
                    if (fs_extra_1.default.existsSync(block_filename)) {
                        data = fs_extra_1.default.readFileSync(block_filename);
                        block = new saito_1.default.block(this.app);
                        block.deserialize(data);
                        block.generateMetadata();
                        block.generateHashes();
                        return [2 /*return*/, block];
                    }
                    else {
                        console.error("cannot open: ".concat(block_filename, " as it does not exist on disk"));
                        return [2 /*return*/, null];
                    }
                }
                catch (err) {
                    console.log("Error reading block from disk");
                    console.error(err);
                }
                console.log("Block not being returned... returning null");
                return [2 /*return*/, null];
            });
        });
    };
    /**
     * Load the options file
     */
    StorageCore.prototype.loadOptions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var optionsfile;
            return __generator(this, function (_a) {
                if (fs_extra_1.default.existsSync("".concat(this.config_dir, "/options"))) {
                    //
                    // open options file
                    //
                    try {
                        optionsfile = fs_extra_1.default.readFileSync("".concat(this.config_dir, "/options"), this.file_encoding_load);
                        this.app.options = JSON.parse(optionsfile.toString());
                    }
                    catch (err) {
                        // this.app.logger.logError("Error Reading Options File", {message:"", stack: err});
                        console.error(err);
                        process.exit();
                    }
                }
                else {
                    //
                    // default options file
                    //
                    this.app.options = JSON.parse('{"server":{"host":"localhost","port":12101,"protocol":"http"}}');
                }
                return [2 /*return*/];
            });
        });
    };
    StorageCore.prototype.loadRuntimeOptions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var configfile;
            return __generator(this, function (_a) {
                if (fs_extra_1.default.existsSync("".concat(this.config_dir, "/runtime.config.js"))) {
                    //
                    // open runtime config file
                    //
                    try {
                        configfile = fs_extra_1.default.readFileSync("".concat(this.config_dir, "/runtime.config.js"), this.file_encoding_load);
                        this.app.options.runtime = JSON.parse(configfile.toString());
                    }
                    catch (err) {
                        // this.app.logger.logError("Error Reading Runtime Config File", {message:"", stack: err});
                        console.error(err);
                        process.exit();
                    }
                }
                else {
                    //
                    // default options file
                    //
                    this.app.options.runtime = {};
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Save the options file
     */
    StorageCore.prototype.saveOptions = function () {
        this.app.options = Object.assign({}, this.app.options);
        try {
            fs_extra_1.default.writeFileSync("".concat(this.config_dir, "/options"), JSON.stringify(this.app.options), null);
        }
        catch (err) {
            // this.app.logger.logError("Error thrown in storage.saveOptions", {message: "", stack: err});
            console.error(err);
            return;
        }
    };
    // overwrite to stop the server from attempting to reset options live
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    StorageCore.prototype.resetOptions = function () {
    };
    ///////////////////////
    // saveClientOptions //
    ///////////////////////
    //
    // when browsers connect to our server, we check to see
    // if the client.options file exists in our web directory
    // and generate one here if it does not.
    //
    // this is fed out to client browsers and serves as their
    // default options, specifying us as the node to which they
    // should connect and through which they can route their
    // transactions. :D
    //
    StorageCore.prototype.saveClientOptions = function () {
        if (this.app.BROWSER == 1) {
            return;
        }
        var client_peer = Object.assign({}, this.app.server.server.endpoint, { synctype: "lite" });
        //
        // mostly empty, except that we tell them what our latest
        // block_id is and send them information on where our
        // server is located so that they can sync to it.
        //
        var t = {};
        t.keys = [];
        t.peers = [];
        t.services = this.app.options.services;
        t.dns = [];
        t.blockchain = {};
        t.registry = this.app.options.registry;
        t.appstore = {};
        t.appstore.default = this.app.wallet.returnPublicKey();
        t.peers.push(client_peer);
        //
        // write file
        //
        try {
            fs_extra_1.default.writeFileSync("".concat(__dirname, "/web/client.options"), JSON.stringify(t));
        }
        catch (err) {
            console.log(err);
            console.error(err);
            // this.app.logger.logError("Error thrown in storage.saveBlock", {message: "", stack: err});
        }
    };
    StorageCore.prototype.returnClientOptions = function () {
        if (this.app.BROWSER == 1) {
            return;
        }
        if (this.app.options) {
            if (this.app.options.client_options) {
                return JSON.stringify(this.app.options.client_options, null, 2);
            }
        }
        var client_peer = Object.assign({}, this.app.server.server.endpoint, { synctype: "lite" });
        //
        // mostly empty, except that we tell them what our latest
        // block_id is and send them information on where our
        // server is located so that they can sync to it.
        //
        var t = {};
        t.keys = [];
        t.peers = [];
        t.services = this.app.options.services;
        t.dns = [];
        t.runtime = this.app.options.runtime;
        t.blockchain = {};
        t.wallet = {};
        t.registry = this.app.options.registry;
        //t.appstore             = {};
        //t.appstore.default     = this.app.wallet.returnPublicKey();
        t.peers.push(client_peer);
        //
        // return json
        //
        return JSON.stringify(t, null, 2);
    };
    /**
     * TODO: uses a callback and should be moved to await / async promise
     **/
    StorageCore.prototype.returnBlockFilenameByHash = function (block_hash, mycallback) {
        return __awaiter(this, void 0, void 0, function () {
            var sql, params, row, filename, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sql = "SELECT id, ts, block_id FROM blocks WHERE hash = $block_hash";
                        params = { $block_hash: block_hash };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.db.get(sql, params)];
                    case 2:
                        row = _a.sent();
                        if (row == undefined) {
                            mycallback(null, "Block not found on this server");
                            return [2 /*return*/];
                        }
                        filename = "".concat(row.ts, "-").concat(block_hash, ".blk");
                        mycallback(filename, null);
                        return [3 /*break*/, 4];
                    case 3:
                        err_3 = _a.sent();
                        console.log("ERROR getting block filename in storage: " + err_3);
                        mycallback(null, err_3);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StorageCore.prototype.returnBlockFilenameByHashPromise = function (block_hash) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.returnBlockFilenameByHash(block_hash, function (filename, err) {
                if (err) {
                    reject(err);
                }
                resolve(filename);
            });
        });
    };
    /**
     *
     * @param {*} sql
     * @param {*} params
     * @param {*} callback
     */
    StorageCore.prototype.executeDatabase = function (sql, params, database, mycallback) {
        if (mycallback === void 0) { mycallback = null; }
        return __awaiter(this, void 0, void 0, function () {
            var db, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.returnDatabaseByName(database)];
                    case 1:
                        db = _a.sent();
                        if (!(mycallback == null)) return [3 /*break*/, 3];
                        return [4 /*yield*/, db.run(sql, params)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3: return [4 /*yield*/, db.run(sql, params, mycallback)];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        err_4 = _a.sent();
                        console.log(err_4);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    StorageCore.prototype.queryDatabase = function (sql, params, database) {
        return __awaiter(this, void 0, void 0, function () {
            var db, rows, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.returnDatabaseByName(database)];
                    case 1:
                        db = _a.sent();
                        return [4 /*yield*/, db.all(sql, params)];
                    case 2:
                        rows = _a.sent();
                        if (rows == undefined) {
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/, rows];
                    case 3:
                        err_5 = _a.sent();
                        console.log(err_5);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return StorageCore;
}(storage_1.default));
exports.default = StorageCore;
//# sourceMappingURL=storage-core.js.map