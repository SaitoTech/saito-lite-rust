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
var node_fetch_1 = __importDefault(require("node-fetch"));
var transaction_1 = __importDefault(require("./transaction"));
var Network = /** @class */ (function () {
    function Network(app) {
        this.app = app || {};
        this.peers = [];
        this.peers_connected = 0;
        this.peers_connected_limit = 2048; // max peers
        //
        // default comms behavior
        //
        this.sendblks = 1;
        this.sendtxs = 1;
        this.sendgts = 1;
        this.receiveblks = 1;
        this.receivetxs = 1;
        this.receivegts = 1;
        //
        // downloads
        //
        this.downloads = {};
        this.downloads_hmap = {};
        this.downloading_active = 0;
        this.block_sample_size = 15;
        //
        // manage peer disconnections, to provide fall-back
        // reconnect logic in the event socket.io fails to
        // reconnect to a rebooted peer
        //
        this.dead_peers = [];
    }
    //
    // addPeer
    //
    // we initiate an outgoing connection
    //
    Network.prototype.addPeer = function (peerjson) {
        var peerhost = "";
        var peerport = "";
        var peerobj = {};
        peerobj.peer = JSON.parse(peerjson);
        console.log("ADD OUTGOING PEER!");
        if (peerobj.peer.protocol == null) {
            peerobj.peer.protocol = "http";
        }
        if (peerobj.peer.host !== undefined) {
            peerhost = peerobj.peer.host;
        }
        if (peerobj.peer.port !== undefined) {
            peerport = peerobj.peer.port;
        }
        //
        // no duplicate connections
        //
        for (var i = 0; i < this.peers.length; i++) {
            if (this.peers[i].peer.host === peerhost && this.peers[i].peer.port === peerport) {
                console.log("already connected to peer...");
                return;
            }
        }
        //
        // do not connect to ourselves
        //
        if (this.app.options.server != null) {
            if (peerhost === "localhost") {
                return;
            }
            if (this.app.options.server.host === peerhost && this.app.options.server.port === peerport) {
                console.log("ERROR 185203: not adding " + this.app.options.server.host + " as peer since it is our server.");
                return;
            }
            if (this.app.options.server.endpoint != null) {
                if (this.app.options.server.endpoint.host === peerhost && this.app.options.server.endpoint.port === peerport) {
                    console.log("ERROR 185204: not adding " + this.app.options.server.host + " as peer since it is our server.");
                    return;
                }
            }
        }
        //
        // create peer and add it
        //
        var peer = new saito_1.default.peer(this.app, JSON.stringify(peerobj));
        //
        // we connect to them
        //
        peer.socket = this.app.network.initializeWebSocket(peer, false, (this.app.BROWSER == 1));
        this.peers.push(peer);
        this.peers_connected++;
        //
        // initiate the handshake (verifying peers)
        //
    };
    //
    // addRemotePeer
    //
    // server sends us a websocket
    //
    Network.prototype.addRemotePeer = function (socket) {
        console.log("ADD INCOMING PEER!");
        // deny excessive connections
        if (this.peers_connected >= this.peers_connected_limit) {
            console.log("ERROR 757594: denying request to remote peer as server overloaded...");
            return null;
        }
        //
        // sanity check
        //
        //for (let i = 0; i < this.peers.length; i++) {
        //    if (this.peers[i].socket_id === socket.id) { // TODO : add a valid check. these fields are undefined in websockets
        //         console.log("error adding socket: already in pool [" + this.peers[i].socket_id + " - " + socket.id + "]");
        //         return;
        //    }
        //}
        //
        // add peer
        //
        var peer = new saito_1.default.peer(this.app);
        peer.socket = socket;
        //
        // create socket and attach events
        //
        this.initializeWebSocket(peer, true, false);
        //
        // they connected to us
        //
        // TODO - where and how are events attached to incoming sockets
        // if the handshake is not attaching data such as publickey, etc.
        // to the peer socket, then how we do we handle not adding dupes,
        // etc.
        //
        this.peers.push(peer);
        this.peers_connected++;
        //
        // initiate the handshake (verifying peers)
        // - this is normally done in initializeWebSocket, but it is not
        // done for remote-sockets created int he server, so we manually
        // do it here. this adds the message emission events to the socket
        this.app.handshake.initiateHandshake(socket);
        //
        // remote peers can do this here, as the connection is already open
        //
        this.app.network.requestBlockchain(peer);
        return peer;
    };
    /**
     * @param {string} block_hash
     * @param {string} preferred peer (if exists); // TODO - remove duplicate function and update blockchain.js
     */
    Network.prototype.fetchBlock = function (block_hash, peer) {
        if (peer === void 0) { peer = null; }
        return __awaiter(this, void 0, void 0, function () {
            var url, res, base64Buffer, buffer, block, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (peer === null) {
                            if (this.peers.length == 0) {
                                return [2 /*return*/];
                            }
                            peer = this.peers[0];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        url = "".concat(peer.peer.protocol, "://").concat(peer.peer.host, ":").concat(peer.peer.port, "/block/").concat(block_hash);
                        return [4 /*yield*/, (0, node_fetch_1.default)(url)];
                    case 2:
                        res = _a.sent();
                        if (!res.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, res.arrayBuffer()];
                    case 3:
                        base64Buffer = _a.sent();
                        buffer = Buffer.from(Buffer.from(base64Buffer).toString('utf-8'), "base64");
                        block = new saito_1.default.block(this.app);
                        block.deserialize(buffer);
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        block.peer = this;
                        return [2 /*return*/, block];
                    case 4:
                        console.error("Error fetching block: Status ".concat(res.status, " -- ").concat(res.statusText));
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        err_1 = _a.sent();
                        console.log("Error fetching block:");
                        console.error(err_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, null];
                }
            });
        });
    };
    Network.prototype.initializeWebSocket = function (peer, remote_socket, browser) {
        var _this = this;
        var _a;
        if (remote_socket === void 0) { remote_socket = false; }
        if (browser === void 0) { browser = false; }
        //
        // browsers can only use w3c sockets
        //
        if (browser == true) {
            console.log("PEER IS: " + JSON.stringify(peer.peer));
            var wsProtocol = 'ws';
            if ((_a = peer.peer) === null || _a === void 0 ? void 0 : _a.protocol) {
                if (peer.peer.protocol === 'https') {
                    wsProtocol = 'wss';
                }
            }
            peer.socket = new WebSocket("".concat(wsProtocol, "://").concat(peer.peer.host, ":").concat(peer.peer.port, "/wsopen"));
            peer.socket.peer = peer;
            peer.socket.onopen = function (event) {
                console.log("connected to network", event);
                _this.app.handshake.initiateHandshake(peer.socket);
                _this.app.network.requestBlockchain(peer);
            };
            peer.socket.onclose = function (event) {
                console.log("[close] Connection closed cleanly by web client, code=".concat(event.code, " reason=").concat(event.reason));
                _this.app.network.cleanupDisconnectedSocket(peer.socket);
            };
            peer.socket.onerror = function (event) {
                console.log("[error] ".concat(event.message));
            };
            peer.socket.onmessage = function (event) { return __awaiter(_this, void 0, void 0, function () {
                var data, api_message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, event.data.arrayBuffer()];
                        case 1:
                            data = _a.sent();
                            api_message = this.app.networkApi.deserializeAPIMessage(data);
                            if (!(api_message.message_name === "RESULT__")) return [3 /*break*/, 2];
                            this.app.networkApi.receiveAPIResponse(api_message);
                            return [3 /*break*/, 5];
                        case 2:
                            if (!(api_message.message_name === "ERROR___")) return [3 /*break*/, 3];
                            this.app.networkApi.receiveAPIError(api_message);
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, this.receiveRequest(peer, api_message)];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            }); };
            return peer.socket;
        }
        //
        // only create the socket if it is not a remote peer, as remote peers
        // have their socket code added by the server class.
        //
        if (remote_socket == false) {
            var wsProtocol = 'ws';
            if (peer.peer.protocol === 'https') {
                wsProtocol = 'wss';
            }
            peer.socket = new WebSocket("".concat(wsProtocol, "://").concat(peer.peer.host, ":").concat(peer.peer.port, "/wsopen"));
            peer.socket.peer = peer;
            //
            // default ws websocket
            //
            peer.socket.on('open', function (event) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.app.handshake.initiateHandshake(peer.socket);
                    this.app.network.requestBlockchain(peer);
                    return [2 /*return*/];
                });
            }); });
            peer.socket.on('close', function (event) {
                console.log("[close] Connection closed cleanly, code=".concat(event.code, " reason=").concat(event.reason));
            });
            peer.socket.on('error', function (event) {
                console.log("[error] ".concat(event.message));
            });
        }
        else {
            peer.socket.peer = peer;
        }
        peer.socket.on('message', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var api_message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        api_message = this.app.networkApi.deserializeAPIMessage(data);
                        if (!(api_message.message_name === "RESULT__")) return [3 /*break*/, 1];
                        this.app.networkApi.receiveAPIResponse(api_message);
                        return [3 /*break*/, 4];
                    case 1:
                        if (!(api_message.message_name === "ERROR___")) return [3 /*break*/, 2];
                        this.app.networkApi.receiveAPIError(api_message);
                        return [3 /*break*/, 4];
                    case 2: 
                    //console.debug("handling peer command - receiving peer id " + peer.socket.peer.id, api_message);
                    return [4 /*yield*/, this.receiveRequest(peer, api_message)];
                    case 3:
                        //console.debug("handling peer command - receiving peer id " + peer.socket.peer.id, api_message);
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        return peer.socket;
    };
    Network.prototype.cleanupDisconnectedSocket = function (peer, force) {
        if (force === void 0) { force = 0; }
        for (var c = 0; c < this.peers.length; c++) {
            if (this.peers[c] === peer) {
                var keep_peer = -1;
                //
                // do not remove peers we asked to add
                //
                if (this.app.options.peers != null) {
                    for (var d = 0; d < this.app.options.peers.length; d++) {
                        if (this.app.options.peers[d].host === peer.peer.host && this.app.options.peers[d].port === peer.peer.port) {
                            keep_peer = d;
                        }
                    }
                }
                //
                // do not remove peers if it's end point is in our options
                //
                if (this.app.options.peers != null && typeof peer.peer.endpoint != 'undefined') {
                    for (var d = 0; d < this.app.options.peers.length; d++) {
                        if (this.app.options.peers[d].host ===
                            peer.peer.endpoint.host &&
                            this.app.options.peers[d].port ===
                                peer.peer.endpoint.port) {
                            keep_peer = d;
                        }
                    }
                }
                //
                // do not remove peers serving dns
                //
                if (this.app.options.peers != null) {
                    if (this.app.options.dns != null) {
                        for (var d = 0; d < this.app.options.dns.length; d++) {
                            if (this.app.options.dns[d].host === peer.peer.host && this.app.options.dns[d].port === peer.peer.port) {
                                keep_peer = d;
                            }
                        }
                    }
                }
                //
                // respect our arbitrary force-kill ability
                //
                if (force !== 0) {
                    keep_peer = -1;
                }
                if (keep_peer >= 0) {
                    //
                    // we push onto dead peers list, which will
                    // continue to try and request a connection
                    //
                    this.dead_peers.push(this.app.options.peers[keep_peer]);
                }
                //
                // close and destroy socket, and stop timers
                //
                try {
                    this.peers[c].socket.close();
                }
                catch (err) {
                    console.log("ERROR 582034: error closing websocket: " + err);
                }
                this.peers.splice(c, 1);
                c--;
                this.peers_connected--;
            }
        }
    };
    Network.prototype.initialize = function () {
        var _this = this;
        if (this.app.options) {
            if (this.app.options.server) {
                if (this.app.options.server.receiveblks !== undefined && this.app.options.server.receiveblks === 0) {
                    this.receiveblks = 0;
                }
                if (this.app.options.server.receivetxs !== undefined && this.app.options.server.receivetxs === 0) {
                    this.receivetxs = 0;
                }
                if (this.app.options.server.receivegts !== undefined && this.app.options.server.receivegts === 0) {
                    this.receivegts = 0;
                }
                if (this.app.options.server.sendblks !== undefined && this.app.options.server.sendblks === 0) {
                    this.sendblks = 0;
                }
                if (this.app.options.server.sendtxs !== undefined && this.app.options.server.sendtxs === 0) {
                    this.sendtxs = 0;
                }
                if (this.app.options.server.sendgts !== undefined && this.app.options.server.sendgts === 0) {
                    this.sendgts = 0;
                }
            }
        }
        if (this.app.options.peers != null) {
            for (var i = 0; i < this.app.options.peers.length; i++) {
                this.addPeer(JSON.stringify(this.app.options.peers[i]));
            }
        }
        this.app.connection.on('peer_disconnect', function (peer) {
            _this.cleanupDisconnectedSocket(peer);
        });
    };
    Network.prototype.isPrivateNetwork = function () {
        for (var i = 0; i < this.peers.length; i++) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (this.peers[i].isConnected()) {
                return false;
            }
        }
        if (this.app.options.peers != null) {
            return false;
        }
        return true;
    };
    Network.prototype.isProductionNetwork = function () {
        if (this.app.BROWSER === 0) {
            // no peers, ok?
            if (this.peers.length === 0) {
                return true;
            }
            return process.env.NODE_ENV === 'prod';
        }
        else {
            return false;
        }
    };
    Network.prototype.receiveRequest = function (peer, message) {
        return __awaiter(this, void 0, void 0, function () {
            var block, block_hash, fork_id, block_id, bytes, challenge, is_block_indexed, tx, _a, publickey, count, i, last_shared_ancestor, i, mdata, reconstructed_obj, reconstructed_message, reconstructed_data, msg, mycallback, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = message.message_name;
                        switch (_a) {
                            case "SHAKINIT": return [3 /*break*/, 1];
                            case "REQBLOCK": return [3 /*break*/, 4];
                            case "REQBLKHD": return [3 /*break*/, 5];
                            case "REQCHAIN": return [3 /*break*/, 6];
                            case "SNDCHAIN": return [3 /*break*/, 11];
                            case "SNDBLOCK": return [3 /*break*/, 12];
                            case "SNDBLKHH": return [3 /*break*/, 16];
                            case "SNDTRANS": return [3 /*break*/, 19];
                            case "SNDKYLST": return [3 /*break*/, 21];
                            case "SENDMESG": return [3 /*break*/, 22];
                        }
                        return [3 /*break*/, 26];
                    case 1: return [4 /*yield*/, this.app.handshake.handleIncomingHandshakeRequest(peer, message.message_data)];
                    case 2:
                        challenge = _c.sent();
                        return [4 /*yield*/, peer.sendResponse(message.message_id, challenge)];
                    case 3:
                        _c.sent();
                        publickey = peer.peer.publickey;
                        count = 0;
                        for (i = this.peers.length - 1; i >= 0; i--) {
                            if (this.peers[i].peer.publickey === publickey) {
                                count++;
                            }
                            if (count > 1) {
                                this.cleanupDisconnectedSocket(this.peers[i], 1);
                                i--;
                            }
                        }
                        return [3 /*break*/, 28];
                    case 4: 
                    // NOT YET IMPLEMENTED -- send FULL block
                    return [3 /*break*/, 28];
                    case 5: 
                    // NOT YET IMPLEMENTED -- send HEADER block
                    return [3 /*break*/, 28];
                    case 6:
                        block_id = 0;
                        block_hash = "";
                        fork_id = "";
                        bytes = message.message_data;
                        block_id = this.app.binary.u64FromBytes(Buffer.from(bytes.slice(0, 8)));
                        if (!block_id) {
                            block_hash = Buffer.from(bytes.slice(8, 40), 'hex').toString('hex');
                            fork_id = Buffer.from(bytes.slice(40, 72), 'hex').toString('hex');
                        }
                        last_shared_ancestor = this.app.blockchain.generateLastSharedAncestor(block_id, fork_id);
                        i = last_shared_ancestor;
                        _c.label = 7;
                    case 7:
                        if (!(i < this.app.blockring.returnLatestBlockId())) return [3 /*break*/, 10];
                        block_hash = this.app.blockring.returnLongestChainBlockHashAtBlockId(i);
                        if (!(block_hash !== "")) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.app.blockchain.loadBlockAsync(block_hash)];
                    case 8:
                        block = _c.sent();
                        if (block) {
                            this.propagateBlock(block, peer);
                        }
                        _c.label = 9;
                    case 9:
                        i++;
                        return [3 /*break*/, 7];
                    case 10: return [3 /*break*/, 28];
                    case 11: 
                    // NOT YET IMPLEMENTED -- send chain
                    return [3 /*break*/, 28];
                    case 12:
                        block = new saito_1.default.block(this.app);
                        block.deserialize(message.message_data);
                        block_hash = block.returnHash();
                        is_block_indexed = this.app.blockchain.isBlockIndexed(block_hash);
                        if (!is_block_indexed) return [3 /*break*/, 13];
                        console.info("SNDBLOCK hash already known: " + block_hash);
                        return [3 /*break*/, 15];
                    case 13: return [4 /*yield*/, this.fetchBlock(block_hash, peer)];
                    case 14:
                        block = _c.sent();
                        this.app.mempool.addBlock(block);
                        _c.label = 15;
                    case 15: return [3 /*break*/, 28];
                    case 16:
                        block_hash = Buffer.from(message.message_data, 'hex').toString('hex');
                        is_block_indexed = this.app.blockchain.isBlockIndexed(block_hash);
                        if (!!is_block_indexed) return [3 /*break*/, 18];
                        return [4 /*yield*/, this.fetchBlock(block_hash)];
                    case 17:
                        block = _c.sent();
                        this.app.mempool.addBlock(block);
                        _c.label = 18;
                    case 18: return [3 /*break*/, 28];
                    case 19:
                        tx = new transaction_1.default();
                        tx.deserialize(this.app, message.message_data, 0);
                        return [4 /*yield*/, this.app.mempool.addTransaction(tx)];
                    case 20:
                        _c.sent();
                        return [3 /*break*/, 28];
                    case 21: 
                    //await this.app.networkApi.sendAPIResponse(this.socket, "ERROR___", message.message_id, Buffer.from("UNHANDLED COMMAND", "utf-8"));
                    return [3 /*break*/, 28];
                    case 22:
                        mdata = void 0;
                        reconstructed_obj = void 0;
                        reconstructed_message = "";
                        reconstructed_data = {};
                        try {
                            mdata = message.message_data.toString();
                            reconstructed_obj = JSON.parse(mdata);
                            reconstructed_message = reconstructed_obj.message;
                            reconstructed_data = reconstructed_obj.data;
                        }
                        catch (err) {
                            console.log("Error reconstructing data: " + JSON.stringify(mdata) + " - " + err);
                        }
                        msg = {};
                        msg.request = "";
                        msg.data = {};
                        if (reconstructed_message) {
                            msg.request = reconstructed_message;
                        }
                        if (reconstructed_data) {
                            msg.data = reconstructed_data;
                        }
                        mycallback = function (response_object) {
                            peer.sendResponse(message.message_id, Buffer.from(JSON.stringify(response_object), 'utf-8'));
                        };
                        _b = message.message_name;
                        return [3 /*break*/, 23];
                    case 23:
                        if (reconstructed_data) {
                            if (reconstructed_data.transaction) {
                                if (reconstructed_data.transaction.m) {
                                    // backwards compatible - in case modules try the old fashioned way
                                    console.log("aaa message : ", message);
                                    msg.data.transaction.msg = JSON.parse(this.app.crypto.base64ToString(msg.data.transaction.m));
                                    msg.data.msg = msg.data.transaction.msg;
                                }
                            }
                        }
                        console.log("SENDMESG received handle peer request!");
                        return [4 /*yield*/, this.app.modules.handlePeerRequest(msg, peer, mycallback)];
                    case 24:
                        _c.sent();
                        _c.label = 25;
                    case 25: return [3 /*break*/, 28];
                    case 26:
                        console.error("Unhandled command received by client... " + message.message_name);
                        return [4 /*yield*/, this.app.networkApi.sendAPIResponse(this.socket, "ERROR___", message.message_id, Buffer.from("NO SUCH", "utf-8"))];
                    case 27:
                        _c.sent();
                        return [3 /*break*/, 28];
                    case 28: return [2 /*return*/];
                }
            });
        });
    };
    Network.prototype.pollPeers = function (peers, app) {
        var _this = this;
        var this_network = app.network;
        //
        // loop through peers to see if disconnected
        //
        peers.forEach(function (peer) {
            //
            // if disconnected, cleanupDisconnectedSocket
            //
            if (!peer.socket.connected) {
                if (!_this.dead_peers.includes(peer)) {
                    _this.cleanupDisconnectedSocket(peer);
                }
            }
        });
        //console.log('dead peers to add: ' + this.dead_peers.length);
        // limit amount of time nodes spend trying to reconnect to
        // prevent ddos issues.
        var peer_add_delay = this.peer_monitor_timer_speed - this.peer_monitor_connection_timeout;
        this.dead_peers.forEach(function (peer) {
            setTimeout(function () {
                this_network.connectToPeer(JSON.stringify(peer));
            }, peer_add_delay);
        });
        this.dead_peers = [];
    };
    //
    // propagate block
    //
    Network.prototype.propagateBlock = function (blk, peer) {
        if (peer === void 0) { peer = null; }
        if (this.app.BROWSER) {
            return;
        }
        if (!blk) {
            return;
        }
        if (!blk.is_valid) {
            return;
        }
        var data = { bhash: blk.returnHash(), bid: blk.block.id };
        for (var i = 0; i < this.peers.length; i++) {
            if (peer === this.peers[i]) {
                this.sendRequest("SNDBLKHH", Buffer.from(blk.returnHash(), 'hex'), this.peers[i]);
            }
            else {
                if (this.peers[i].peer.sendblks === 1) {
                    this.sendRequest("SNDBLKHH", Buffer.from(blk.returnHash(), 'hex'), this.peers[i]);
                }
            }
        }
    };
    //
    // propagate transaction
    //
    Network.prototype.propagateTransaction = function (tx, outbound_message) {
        var _this = this;
        if (outbound_message === void 0) { outbound_message = "transaction"; }
        if (tx == null) {
            return;
        }
        if (!tx.is_valid) {
            return;
        }
        if (tx.transaction.type === 1) {
            outbound_message = "golden ticket";
        }
        //
        // if this is our (normal) transaction, add to pending
        //
        if (tx.transaction.from[0].add === this.app.wallet.returnPublicKey()) {
            this.app.wallet.addTransactionToPending(tx);
            this.app.connection.emit("update_balance", this.app.wallet);
        }
        if (this.app.BROWSER === 0 && this.app.SPVMODE === 0) {
            //
            // is this a transaction we can use to make a block
            //
            if (!this.app.mempool.containsTransaction(tx)) {
                //
                // return if we can create a transaction
                //
                if (!this.app.mempool.addTransaction(tx)) {
                    console.error("ERROR 810299: balking at propagating bad transaction");
                    console.error("BAD TX: " + JSON.stringify(tx.transaction));
                    return;
                }
                else {
                    console.log(" ... added transaftion");
                }
                if (this.app.mempool.canBundleBlock() === 1) {
                    return 1;
                }
            }
        }
        //
        // now send the transaction out with the appropriate routing hop
        //
        var fees = tx.returnFeesTotal(this.app);
        for (var i = 0; i < tx.transaction.path.length; i++) {
            fees = fees / 2;
        }
        this.peers.forEach(function (peer) {
            if (peer.peer.receivetxs === 0) {
                return;
            }
            if (!peer.inTransactionPath(tx) && peer.returnPublicKey() != null) {
                var tmptx = peer.addPathToTransaction(tx);
                if (peer.socket) {
                    _this.sendRequest("SNDTRANS", tx.serialize(_this.app), peer);
                }
                else {
                    console.error("socket not found");
                }
            }
        });
    };
    Network.prototype.requestBlockchain = function (peer) {
        if (peer === void 0) { peer = null; }
        var latest_block_id = this.app.blockring.returnLatestBlockId();
        var latest_block_hash = this.app.blockring.returnLatestBlockHash();
        var fork_id = this.app.blockchain.blockchain.fork_id;
        var buffer_to_send = Buffer.concat([this.app.binary.u64AsBytes(latest_block_id), Buffer.from(latest_block_hash, 'hex'), Buffer.from(fork_id, 'hex')]);
        for (var x = this.peers.length - 1; x >= 0; x--) {
            if (this.peers[x] === peer) {
                this.sendRequest("REQCHAIN", buffer_to_send, peer);
                return;
            }
        }
        if (this.peers.length > 0) {
            this.sendRequest("REQCHAIN", buffer_to_send, this.peers[0]);
        }
    };
    Network.prototype.sendRequest = function (message, data, peer) {
        if (data === void 0) { data = ""; }
        if (peer === void 0) { peer = null; }
        if (peer !== null) {
            for (var x = this.peers.length - 1; x >= 0; x--) {
                if (this.peers[x] === peer) {
                    this.peers[x].sendRequest(message, data);
                }
            }
            return;
        }
        for (var x = this.peers.length - 1; x >= 0; x--) {
            this.peers[x].sendRequest(message, data);
        }
    };
    Network.prototype.sendRequestWithCallback = function (message, data, callback, peer) {
        if (data === void 0) { data = ""; }
        if (peer === void 0) { peer = null; }
        if (peer !== null) {
            for (var x = this.peers.length - 1; x >= 0; x--) {
                if (this.peers[x] === peer) {
                    this.peers[x].sendRequestWithCallback(message, data, callback);
                }
            }
            return;
        }
        for (var x = this.peers.length - 1; x >= 0; x--) {
            this.peers[x].sendRequestWithCallback(message, data, callback);
        }
    };
    //
    // this function requires switching to the new network API
    //
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    Network.prototype.updatePeersWithWatchedPublicKeys = function () {
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    Network.prototype.close = function () {
    };
    return Network;
}());
exports.default = Network;
//# sourceMappingURL=network.js.map