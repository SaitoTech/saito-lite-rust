"use strict";
// const saito = require('./../saito');
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
var express_1 = __importDefault(require("express"));
var http_1 = require("http");
// const io          = require('socket.io')(webserver, {
//   cors: {
//     origin: "*.*",
//     methods: ["GET", "POST"]
//   }
// });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var body_parser_1 = __importDefault(require("body-parser"));
var app = (0, express_1.default)();
var webserver = new http_1.Server(app);
/**
 * Constructor
 */
var Server = /** @class */ (function () {
    function Server(app) {
        this.app = app || {};
        this.blocks_dir = path_1.default.join(__dirname, '../../../data/blocks/');
        this.web_dir = path_1.default.join(__dirname, '../../../web/');
        this.server = {};
        this.server.host = "";
        this.server.port = 0;
        this.server.publickey = "";
        this.server.protocol = "";
        this.server.name = "";
        this.server.endpoint = {};
        this.server.endpoint.host = "";
        this.server.endpoint.port = 0;
        this.server.endpoint.protocol = "";
        this.webserver = null;
        //this.io                         = null;
        this.server_file_encoding = 'utf8';
    }
    Server.prototype.initializeWebSocketServer = function (app) {
        var _this = this;
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        var ws = require("ws");
        var server = new ws.Server({
            noServer: true,
            // port:5001, // TODO : setup this correctly
            path: "/wsopen"
        });
        app.on('upgrade', function (request, socket, head) {
            server.handleUpgrade(request, socket, head, function (websocket) {
                server.emit("connection", websocket, request);
            });
        });
        server.on('connection', function (wsocket, request) {
            //console.log("new connection received by server", request);
            _this.app.network.addRemotePeer(wsocket);
        });
    };
    Server.prototype.initialize = function () {
        var _this = this;
        if (this.app.BROWSER === 1) {
            return;
        }
        //
        // update server information from options file
        //
        if (this.app.options.server != null) {
            this.server.host = this.app.options.server.host;
            this.server.port = this.app.options.server.port;
            this.server.protocol = this.app.options.server.protocol;
            this.server.name = this.app.options.server.name || "";
            this.server.sendblks = (typeof this.app.options.server.sendblks == "undefined") ? 1 : this.app.options.server.sendblks;
            this.server.sendtxs = (typeof this.app.options.server.sendtxs == "undefined") ? 1 : this.app.options.server.sendtxs;
            this.server.sendgts = (typeof this.app.options.server.sendgts == "undefined") ? 1 : this.app.options.server.sendgts;
            this.server.receiveblks = (typeof this.app.options.server.receiveblks == "undefined") ? 1 : this.app.options.server.receiveblks;
            this.server.receivetxs = (typeof this.app.options.server.receivetxs == "undefined") ? 1 : this.app.options.server.receivetxs;
            this.server.receivegts = (typeof this.app.options.server.receivegts == "undefined") ? 1 : this.app.options.server.receivegts;
        }
        //
        // sanity check
        //
        if (this.server.host === "" || this.server.port === 0) {
            console.log("Not starting local server as no hostname / port in options file");
            return;
        }
        //
        // init endpoint
        //
        if (this.app.options.server.endpoint != null) {
            this.server.endpoint.port = this.app.options.server.endpoint.port;
            this.server.endpoint.host = this.app.options.server.endpoint.host;
            this.server.endpoint.protocol = this.app.options.server.endpoint.protocol;
            this.server.endpoint.publickey = this.app.options.server.publickey;
        }
        else {
            var _a = this.server, host = _a.host, port = _a.port, protocol = _a.protocol, publickey = _a.publickey;
            this.server.endpoint = { host: host, port: port, protocol: protocol, publickey: publickey };
            this.app.options.server.endpoint = { host: host, port: port, protocol: protocol, publickey: publickey };
            this.app.storage.saveOptions();
        }
        //
        // save options
        //
        this.app.options.server = this.server;
        this.app.storage.saveOptions();
        //
        // enable cross origin polling for socket.io
        // - FEB 16 - replaced w/ upgrade to v3
        //
        //io.origins('*:*');
        // body-parser
        app.use(body_parser_1.default.urlencoded({ extended: true }));
        app.use(body_parser_1.default.json());
        /////////////////
        // full blocks //
        /////////////////
        app.get('/blocks/:bhash/:pkey', function (req, res) {
            var bhash = req.params.bhash;
            if (bhash == null) {
                return;
            }
            try {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                var ts = _this.app.blockchain.bsh_ts_hmap[bhash];
                var filename = "".concat(ts, "-").concat(bhash, ".blk");
                if (ts > 0) {
                    res.writeHead(200, {
                        "Content-Type": "text/plain",
                        "Content-Transfer-Encoding": "utf8"
                    });
                    // const src = fs.createReadStream(this.blocks_dir + filename, {encoding: 'binary'});
                    // spv errors if we server different from server in SPV/Lite
                    var src = fs_1.default.createReadStream(_this.blocks_dir + filename, { encoding: 'utf8' });
                    src.pipe(res);
                }
            }
            catch (err) {
                //
                // file does not exist on disk, check in memory
                //
                //let blk = await this.app.blockchain.returnBlockByHash(bsh);
                console.error("FETCH BLOCKS ERROR SINGLE BLOCK FETCH: ", err);
                res.status(400);
                res.send({
                    error: {
                        message: "FAILED SERVER REQUEST: could not find block: ".concat(bhash)
                    }
                });
            }
        });
        /////////////////
        // lite-blocks //
        /////////////////
        app.get('/lite-blocks/:bhash/:pkey', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var bsh, pkey, keylist, peer, blk_1, blk, newblk, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (req.params.bhash == null) {
                            return [2 /*return*/];
                        }
                        if (req.params.pkey == null) {
                            return [2 /*return*/];
                        }
                        bsh = req.params.bhash;
                        pkey = req.params.pkey;
                        keylist = [];
                        peer = this.app.network.returnPeerByPublicKey(pkey);
                        if (peer == null) {
                            keylist.push(pkey);
                        }
                        else {
                            keylist = peer.peer.keylist;
                        }
                        //
                        // SHORTCUT hasKeylistTranactions returns (1 for yes, 0 for no, -1 for unknown)
                        // if we have this block but there are no transactions for it in the block hashmap
                        // then we just fetch the block header from memory and serve that.
                        //
                        // this avoids the need to run blk.returnLiteBlock because we know there are no
                        // transactions and thus no need for lite-clients that are not fully-validating
                        // the entire block to calculate the merkle root.
                        //
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        if (this.app.blockchain.hasKeylistTransactions(bsh, keylist) === 0) {
                            res.writeHead(200, {
                                "Content-Type": "text/plain",
                                "Content-Transfer-Encoding": "utf8"
                            });
                            blk_1 = this.app.blockchain.returnBlockByHashFromBlockIndex(bsh, 0);
                            res.write(Buffer.from(blk_1.returnBlockHeaderData(), 'utf8'), 'utf8');
                            res.end();
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.app.blockchain.returnBlockByHashFromMemoryOrDisk(bsh, 1)];
                    case 1:
                        blk = _a.sent();
                        if (blk == null) {
                            res.send("{}");
                            return [2 /*return*/];
                        }
                        else {
                            newblk = blk.returnLiteBlock(bsh, keylist);
                            //
                            // formerly binary / binary, but that results in different encoding push than full blocks, so SPV fails
                            //
                            //res.end(Buffer.from(newblk.returnBlockFileData(), 'utf8'), 'binary');
                            res.writeHead(200, {
                                "Content-Type": "text/plain",
                                "Content-Transfer-Encoding": "utf8"
                            });
                            res.write(Buffer.from(newblk.returnBlockHeaderData(), 'utf8'), 'utf8');
                            for (i = 0; i < blk.transactions.length; i++) {
                                res.write(Buffer.from("\n", 'utf8'), 'utf8');
                                res.write(Buffer.from(JSON.stringify(blk.transactions[i]), 'utf8'), 'utf8');
                            }
                            res.end();
                            //        fs.closeSync(fd);
                            //res.end(Buffer.from(newblk.returnBlockFileData(), 'binary'), 'binary');
                            return [2 /*return*/];
                        }
                        return [2 /*return*/];
                }
            });
        }); });
        app.get("/block/:hash", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var hash, block, buffer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hash = req.params.hash;
                        if (!hash) {
                            console.warn("hash not provided");
                            return [2 /*return*/, res.sendStatus(400)]; // Bad request
                        }
                        console.log("requesting block : " + hash);
                        return [4 /*yield*/, this.app.blockchain.loadBlockAsync(hash)];
                    case 1:
                        block = _a.sent();
                        if (!block) {
                            console.warn("block not found for : " + hash);
                            return [2 /*return*/, res.sendStatus(404)]; // Not Found
                        }
                        buffer = block.serialize();
                        buffer = Buffer.from(buffer, 'binary').toString('base64');
                        res.status(200);
                        res.end(buffer);
                        return [2 /*return*/];
                }
            });
        }); });
        /////////
        // web //
        /////////
        app.get('/options', function (req, res) {
            //this.app.storage.saveClientOptions();
            // res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
            // res.setHeader("expires","-1");
            // res.setHeader("pragma","no-cache");
            var client_options_file = _this.web_dir + "client.options";
            if (!fs_1.default.existsSync(client_options_file)) {
                var fd = fs_1.default.openSync(client_options_file, 'w');
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                fs_1.default.writeSync(fd, _this.app.storage.returnClientOptions(), _this.server_file_encoding);
                fs_1.default.closeSync(fd);
            }
            res.sendFile(client_options_file);
            //res.send(this.app.storage.returnClientOptions());
            return;
        });
        app.get('/runtime', function (req, res) {
            res.writeHead(200, {
                "Content-Type": "text/json",
                "Content-Transfer-Encoding": "utf8"
            });
            res.write(Buffer.from(JSON.stringify(_this.app.options.runtime)), 'utf8');
            res.end();
        });
        app.get('/r', function (req, res) {
            res.sendFile(_this.web_dir + "refer.html");
            return;
        });
        app.get('/saito/saito.js', function (req, res) {
            //
            // may be useful in the future, if we gzip
            // files before releasing for production
            //
            // gzipped, cached
            //
            //res.setHeader("Cache-Control", "public");
            //res.setHeader("Content-Encoding", "gzip");
            //res.setHeader("Content-Length", "368432");
            //res.sendFile(server_self.web_dir + 'saito.js.gz');
            //
            // non-gzipped, cached
            //
            //res.setHeader("Cache-Control", "public");
            //res.setHeader("expires","72000");
            //res.sendFile(server_self.web_dir + '/dist/saito.js');
            //
            // caching in prod
            //
            var caching = process.env.NODE_ENV === 'prod' ? "private max-age=31536000" : "private, no-cache, no-store, must-revalidate";
            res.setHeader("Cache-Control", caching);
            res.setHeader("expires", "-1");
            res.setHeader("pragma", "no-cache");
            res.sendFile(_this.web_dir + '/saito/saito.js');
            return;
        });
        //
        // make root directory recursively servable
        app.use(express_1.default.static(this.web_dir));
        //
        /////////////
        // modules //
        /////////////
        this.app.modules.webServer(app, express_1.default);
        app.get('*', function (req, res) {
            res.status(404).sendFile("".concat(_this.web_dir, "404.html"));
            res.status(404).sendFile("".concat(_this.web_dir, "tabs.html"));
        });
        //     io.on('connection', (socket) => {
        // console.log("IO CONNECTION on SERVER: ");
        //       this.app.network.addRemotePeer(socket);
        //     });
        this.initializeWebSocketServer(webserver);
        webserver.listen(this.server.port);
        // try webserver.listen(this.server.port, {cookie: false});
        this.webserver = webserver;
    };
    Server.prototype.close = function () {
        this.webserver.close();
    };
    return Server;
}());
exports.default = Server;
//# sourceMappingURL=server.js.map