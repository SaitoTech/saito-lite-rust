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
var fs = require('fs');
var path = require('path');
var JSON = require('json-bigint');
var treatment = require('../../lib/helpers/dom-treatment');
var ModTemplate = /** @class */ (function () {
    function ModTemplate(app, path) {
        this.app = app || {};
        this.dirname = "";
        this.appname = "";
        this.name = "";
        this.slug = "";
        this.link = "";
        this.events = []; // events to which i respond
        this.alerts = 0;
        this.categories = "";
        this.db_tables = [];
        // A module which wishes to be rendered in the client can include it's own
        // web directory which will automatically be served by the Saito Core's
        // server. However, if the author prefers, Core can also simple serve the
        // default index.html found in /lib/templates/html, which can then be
        // manipulated via initializeHTML.
        this.default_html = 0;
        // browser active will be set by Saito Client if the module name matches
        // the current path. e.g. when the user is at /chat, chat.js which has
        // this.name = "chat", will have this.browser_active = 1;
        this.browser_active = 0;
    }
    ////////////////////////////
    // Extend these Functions //
    ////////////////////////////
    //
    // INSTALL MODULE
    //
    // this callback is run the first time the module is loaded. You
    // can override this callback in your module if you would like,
    // but should be a bit careful to include this line at the top:
    //
    //    super.installModule(app);
    //
    // ... if you want to keep the default functionality of auto-
    // creating a database with the necessary tables on install
    // if it does not exist.
    //
    //
    // onlyOnActive can be used to blacklist a module method from being run unless it is the active module.
    // For example, this might be useful for a chat module which wants to run initializedHTML only when
    // the user is at /chat, but otherwise would like to enable this.alwaysRun so all it's other methods are
    // available to other modules.
    //
    ModTemplate.prototype.onlyOnActiveBrowser = function (someMethod) {
        return function () {
            if (this.app.BROWSER && this.browser_active) {
                var returnVal = someMethod.apply(this, arguments);
                return returnVal;
            }
        };
    };
    // onlyOnFrontend can be used to blacklist a module method from being run
    // on the server. Wrapping this around your methods will cause them to only
    // run in a browser environment.
    //
    ModTemplate.prototype.onlyInBrowser = function (someMethod) {
        return function () {
            if (this.app.BROWSER) {
                var returnVal = someMethod.apply(this, arguments);
                return returnVal;
            }
        };
    };
    //
    // onlyOnFrontend can be used to blacklist a module method from being run
    // on the server. Wrapping this around your methods will cause them to only
    // run in a browser environment.
    //
    ModTemplate.prototype.onlyOnServer = function (someMethod) {
        return function () {
            if (!this.app.BROWSER) {
                var returnVal = someMethod.apply(this, arguments);
                return returnVal;
            }
        };
    };
    ModTemplate.prototype.installModule = function (app) {
        return __awaiter(this, void 0, void 0, function () {
            var sqldir, fs, dbname, sql_files, i, filename, data, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.app.BROWSER == 1) {
                            return [2 /*return*/];
                        }
                        sqldir = "".concat(__dirname, "/../../mods/").concat(this.dirname, "/sql");
                        fs = app.storage.returnFileSystem();
                        dbname = encodeURI(this.returnSlug());
                        if (!(fs != null)) return [3 /*break*/, 6];
                        if (!fs.existsSync(path.normalize(sqldir))) return [3 /*break*/, 6];
                        sql_files = fs.readdirSync(sqldir).sort();
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < sql_files.length)) return [3 /*break*/, 6];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        filename = path.join(sqldir, sql_files[i]);
                        data = fs.readFileSync(filename, 'utf8');
                        return [4 /*yield*/, app.storage.executeDatabase(data, {}, dbname)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        console.log(err_1);
                        return [3 /*break*/, 5];
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    //
    // INITIALIZE
    //
    // this callback is run every time the module is initialized. It
    // takes care of the events to which we want to listen by default
    // so if you over-write it, be careful to include this line at
    // the top:
    //
    //    super.initialize(app);
    //
    // that will ensure default behavior appies to inherited modules
    // and the the sendEvent and receiveEvent functions will still work
    //
    ModTemplate.prototype.initialize = function (app) {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_1, this_1, i, sqldir, fs, sql_files, i, tablename;
            var _this = this;
            return __generator(this, function (_a) {
                _loop_1 = function (i) {
                    app.connection.on(this_1.events[i], function (data) {
                        _this.receiveEvent(_this.events[i], data);
                    });
                };
                this_1 = this;
                for (i = 0; i < this.events.length; i++) {
                    _loop_1(i);
                }
                sqldir = "".concat(__dirname, "/../../mods/").concat(this.dirname, "/sql");
                fs = app.storage.returnFileSystem();
                if (fs != null) {
                    if (fs.existsSync(path.normalize(sqldir))) {
                        sql_files = fs.readdirSync(sqldir);
                        for (i = 0; i < sql_files.length; i++) {
                            tablename = sql_files[i].slice(0, -4);
                            //
                            // remove digits from end, used as we sometimes
                            // use numbers at end of sql file to order indexes
                            // or run post-processing on table create and need
                            // guaranteed order
                            //
                            tablename = tablename.replace(/\d+$/, "");
                            this.db_tables.push(tablename);
                        }
                    }
                }
                if (this.appname == "") {
                    this.appname = this.name;
                }
                return [2 /*return*/];
            });
        });
    };
    //
    // INITIALIZE HTML (deprecated by render(app))
    //
    // this callback is called whenever web applications are loaded
    //
    ModTemplate.prototype.initializeHTML = function (app) { };
    ;
    //
    // ATTACH EVENTS (deprecated by render(app))
    //
    // this callback attaches the javascript interactive bindings to the
    // DOM, allowing us to incorporate the web applications to our own
    // internal functions and send and receive transactions natively.
    //
    ModTemplate.prototype.attachEvents = function (app) { };
    //
    // RENDER
    //
    // adds elements to the DOM and then attaches events to them as needed.
    // this replaces initializeHTML and attachEvents with a single function
    //
    ModTemplate.prototype.render = function (app) { };
    //
    // LOAD FROM ARCHIVES
    //
    // this callback is run whenever our archives loads additional data
    // either from its local memory or whenever it is fetched from a
    // remote server
    //
    //loadFromArchives(app, tx) { }
    // implementsKeys(request) {
    //   let response = {};
    //   request.forEach(key => {
    //     if (this[key]) {
    //       response[key] = this[key];
    //     }
    //   });
    //   if (Object.entries(response).length != request.length) {
    //     return null;
    //   }
    //   return this;
    // }
    //
    // ON CONFIRMATION
    //
    // this callback is run every time a block receives a confirmation.
    // this is where the most important code in your module should go,
    // listening to requests that come in over the blockchain and replying.
    //
    // By convention Saito Core will fire the onConfirmation for any modules
    // whose name matches tx.msg.module. Other modules which are also interested
    // in those transcations can also subscribe to those confirmations by
    // by using shouldAffixCallbackToModule.
    //
    ModTemplate.prototype.onConfirmation = function (blk, tx, confnum, app) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    //
    //
    // ON NEW BLOCK
    //
    // this callback is run every time a block is added to the longest_chain
    // it differs from the onConfirmation function in that it is not linked to
    // individual transactions -- i.e. it will only be run once per block, while
    // the onConfirmation function is run by every TRANSACTION tagged as
    // this is where the most important code in your module should go,
    // listening to requests that come in over the blockchain and replying.
    //
    ModTemplate.prototype.onNewBlock = function (blk, lc) { };
    //
    //
    //
    // ON CHAIN REORGANIZATION
    //
    // this callback is run everytime the chain is reorganized, for every block
    // with a status that is changed. so it is invoked first to notify us when
    // longest_chain is set to ZERO as we unmark the previously dominant chain
    // and then it is run a second time setting the LC to 1 for all of the
    // blocks that are moved (back?) into the longest_chain
    //
    ModTemplate.prototype.onChainReorganization = function (block_id, block_hash, lc, pos) { };
    //
    //
    // ON CONNECTION UNSTABLE
    //
    // this function runs when a node completes its handshake with another peer
    ModTemplate.prototype.onConnectionUnstable = function (app) { };
    //
    //
    //
    // ON CONNECTION STABLE
    //
    // this function runs when a node completes its handshake with another peer
    ModTemplate.prototype.onConnectionStable = function (app) { };
    //
    //
    //
    // ON WALLET RESET
    //
    // this function runs if the wallet is reset
    ModTemplate.prototype.onWalletReset = function () { };
    //
    //
    //
    // ON PEER HANDSHAKE COMPLETE
    //
    // this function runs when a node completes its handshake with another peer
    ModTemplate.prototype.onPeerHandshakeComplete = function (app, peer) { };
    //
    //
    // ON CONNECTION STABLE
    //
    // this function runs "connect" event
    ModTemplate.prototype.onConnectionStable = function (app, peer) { };
    //
    //
    // ON CONNECTION UNSTABLE
    //
    // this function runs "disconnect" event
    ModTemplate.prototype.onConnectionUnstable = function (app, peer) { };
    //
    // SHOULD AFFIX CALLBACK TO MODULE
    //
    // sometimes modules want to run the onConfirmation function for transactions
    // that belong to OTHER modules. onConfirmation will be fired automatically
    // for any module whose name matches tx.msg.module. Other modules who are
    // interested in those transactions can use this method to subscribe to those
    // onConfirmation events. See onConfirmation for more details.
    //
    // An example is a server that wants to monitor
    // AUTH messages, or a module that needs to parse third-party email messages
    // for custom data processing.
    //
    ModTemplate.prototype.shouldAffixCallbackToModule = function (modname, tx) {
        if (tx === void 0) { tx = null; }
        if (modname == this.name) {
            return 1;
        }
        return 0;
    };
    //
    // SERVER
    //
    // this callback allows the module to serve pages through the main application
    // server, by listening to specific route-requests and serving data from its own
    // separate web directory.
    //
    // This can be overridden to provide advanced interfaces, for example you may
    // want to create a module which serves JSON objects as an RESTFUL API. See
    // Express.js for details.
    //
    ModTemplate.prototype.webServer = function (app, expressapp, express) {
        //
        // if a web directory exists, we make it broswable if server
        // functionality exists on this machine. the contents of the
        // web directory will be in a subfolder under the client name
        //
        var webdir = "".concat(__dirname, "/../../mods/").concat(this.dirname, "/web");
        var fs = app.storage.returnFileSystem();
        if (fs != null) {
            if (fs.existsSync(webdir)) {
                expressapp.use('/' + encodeURI(this.returnSlug()), express.static(webdir));
            }
            else if (this.default_html) {
                expressapp.use('/' + encodeURI(this.returnSlug()), express.static(__dirname + "/../../lib/templates/html"));
            }
        }
    };
    ;
    //
    // UPDATE BLOCKCHAIN SYNC
    //
    // this callback is run to notify applications of the state of
    // blockchain syncing. It will be triggered on startup and with
    // every additional block added.
    //
    ModTemplate.prototype.updateBlockchainSync = function (app, current, target) { };
    /////////////////////////
    // MODULE INTERACTIONS //
    /////////////////////////
    //
    // these functions allow your module to communicate and interact with
    // other modules. They automate issuing and listening to events and 
    // allow modules to respond to requests from other modules by returning
    // data objects that can be used to update the DOMS managed by other
    // modules.
    //
    //
    // modules may ask other modules to respond to "request_types". The
    // response that they get may or may not be suitable, but if suitable
    // can be used by the requesting module to format data or update
    // its DOM as needed. This is a basic method of providing inter-app
    // interactivity and extensibility.
    //
    ModTemplate.prototype.respondTo = function (request_type) {
        if (request_type === void 0) { request_type = ""; }
        return null;
    };
    //
    // when an event to which modules are listening triggers, we push the
    // data out into this function, which can be overridden as needed in
    // order to
    //
    ModTemplate.prototype.receiveEvent = function (eventname, data) { };
    //
    // you probably don't want to over-write this, it is basicaly just
    // simplifying the event-emitting and receiving functionality in the
    // connection class, so that developers can use this without worrying
    // about their own events.
    //
    ModTemplate.prototype.sendEvent = function (eventname, data) {
        this.app.connection.emit(eventname, data);
    };
    /////////////////////////////////
    // PEER-TO-PEER COMMUNICATIONS //
    /////////////////////////////////
    //
    // HANDLE PEER REQUEST
    //
    // not all messages sent from peer-to-peer need to be transactions. the
    // underlying software structure supports a number of alternatives,
    // including requests for transmitting blocks, transactions, etc.
    //
    // DNS messages are one example, and are treated specially because of
    // the importance of the DNS system for routing data. This is a more
    // generic way to plug into P2P routing.
    //
    // if your web application defines a lower-level massage format, it can
    // send and receive data WITHOUT the need for that data to be confirmed
    // in the blockchain. See our search module for an example of this in
    // action. This is useful for applications that are happy to pass data
    // directly between peers, but still want to use the blockchain for peer
    // discovery (i.e. "what is your IP address" requests)
    //
    ModTemplate.prototype.handlePeerRequest = function (app, message, peer, mycallback) {
        if (mycallback === void 0) { mycallback = null; }
        return __awaiter(this, void 0, void 0, function () {
            var i, expected_request, select, dbname, tablename, where, sql, params, rows, res, sql, params, rows, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < this.db_tables.length)) return [3 /*break*/, 4];
                        expected_request = this.name.toLowerCase() + " load " + this.db_tables[i];
                        if (!(message.request === expected_request)) return [3 /*break*/, 3];
                        select = message.data.select;
                        dbname = message.data.dbname;
                        tablename = message.data.tablename;
                        where = message.data.where;
                        if (!/^[a-z"`'=_*()\.\n\t\r ,0-9A-Z]+$/.test(select)) {
                            return [2 /*return*/];
                        }
                        if (!/^[a-z"`'=_()\. ,0-9A-Z]+$/.test(dbname)) {
                            return [2 /*return*/];
                        }
                        if (!/^[a-z"`'=_()\. ,0-9A-Z]+$/.test(tablename)) {
                            return [2 /*return*/];
                        }
                        sql = "SELECT ".concat(select, " FROM ").concat(tablename);
                        if (where != "") {
                            sql += " WHERE ".concat(where);
                        }
                        params = {};
                        return [4 /*yield*/, this.app.storage.queryDatabase(sql, params, message.data.dbname)];
                    case 2:
                        rows = _a.sent();
                        res = {};
                        res.err = "";
                        res.rows = rows;
                        mycallback(res);
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (!(message.request == 'rawSQL')) return [3 /*break*/, 6];
                        if (!(message.data.module == this.name)) return [3 /*break*/, 6];
                        sql = message.data.sql;
                        params = {};
                        return [4 /*yield*/, this.app.storage.queryDatabase(sql, params, message.data.dbname)];
                    case 5:
                        rows = _a.sent();
                        res = {};
                        res.err = "";
                        res.rows = rows;
                        mycallback(res);
                        return [2 /*return*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    //
    // PEER DATABASE CHECK
    //
    // this piggybacks on handlePeerRequest to provide automated database
    // row-retrieval for clients who are connected to servers that run the
    // data silos.
    //
    ModTemplate.prototype.sendPeerDatabaseRequest = function (dbname, tablename, select, where, peer, mycallback) {
        if (select === void 0) { select = ""; }
        if (where === void 0) { where = ""; }
        if (peer === void 0) { peer = null; }
        if (mycallback === void 0) { mycallback = null; }
        return __awaiter(this, void 0, void 0, function () {
            var message;
            return __generator(this, function (_a) {
                message = {};
                message.request = dbname + " load " + tablename;
                message.data = {};
                message.data.dbname = dbname;
                message.data.tablename = tablename;
                message.data.select = select;
                message.data.where = where;
                if (peer == null) {
                    this.app.network.sendRequestWithCallback(message.request, message.data, function (res) {
                        mycallback(res);
                    });
                }
                else {
                    peer.sendRequestWithCallback(message.request, message.data, function (res) {
                        mycallback(res);
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    ModTemplate.prototype.sendPeerDatabaseRequestWithFilter = function (modname, sql, success_callback, peerfilter) {
        if (modname === void 0) { modname = ""; }
        if (sql === void 0) { sql = ""; }
        if (success_callback === void 0) { success_callback = null; }
        if (peerfilter === void 0) { peerfilter = null; }
        return __awaiter(this, void 0, void 0, function () {
            var msg;
            return __generator(this, function (_a) {
                if (sql == "") {
                    return [2 /*return*/];
                }
                if (modname == "") {
                    return [2 /*return*/];
                }
                msg = {};
                msg.request = 'rawSQL';
                msg.data = {};
                msg.data.sql = sql;
                msg.data.module = modname;
                msg.data.dbname = modname.toLowerCase();
                this.sendPeerRequestWithFilter(function () { return msg; }, success_callback, peerfilter);
                return [2 /*return*/];
            });
        });
    };
    ModTemplate.prototype.sendPeerRequestWithServiceFilter = function (servicename, msg, success_callback) {
        if (success_callback === void 0) { success_callback = function (res) { }; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.sendPeerRequestWithFilter(function () { return msg; }, success_callback, function (peer) {
                    if (peer.peer.services) {
                        for (var z = 0; z < peer.peer.services.length; z++) {
                            if (peer.peer.services[z].service === servicename) {
                                return 1;
                            }
                        }
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    ModTemplate.prototype.sendPeerRequestWithFilter = function (msg_callback, success_callback, peerfilter) {
        if (msg_callback === void 0) { msg_callback = null; }
        if (success_callback === void 0) { success_callback = null; }
        if (peerfilter === void 0) { peerfilter = null; }
        return __awaiter(this, void 0, void 0, function () {
            var message, peers, i;
            return __generator(this, function (_a) {
                message = msg_callback();
                if (message == null) {
                    return [2 /*return*/];
                }
                peers = [];
                if (peerfilter == null) {
                    peers = this.app.network.peers;
                }
                else {
                    for (i = 0; i < this.app.network.peers.length; i++) {
                        if (peerfilter(this.app.network.peers[i])) {
                            peers.push(this.app.network.peers[i]);
                        }
                    }
                }
                if (peers.length == 0) {
                    return [2 /*return*/];
                }
                peers.forEach(function (peer) {
                    peer.sendRequestWithCallback(message.request, message.data, function (res) {
                        if (success_callback != null) {
                            success_callback(res);
                        }
                    });
                });
                return [2 /*return*/];
            });
        });
    };
    ModTemplate.prototype.sendPeerDatabaseRequestRaw = function (db, sql, mycallback) {
        if (mycallback === void 0) { mycallback = null; }
        return __awaiter(this, void 0, void 0, function () {
            var message;
            return __generator(this, function (_a) {
                message = {};
                message.request = 'rawSQL';
                message.data = {};
                message.data.sql = sql;
                message.data.dbname = db;
                message.data.module = this.name;
                this.app.network.sendRequestWithCallback(message.request, message.data, function (res) {
                    //JSON.stringify("callback data1: " + JSON.stringify(res));
                    mycallback(res);
                });
                return [2 /*return*/];
            });
        });
    };
    ModTemplate.prototype.returnSlug = function () {
        if (this.slug != "") {
            return this.slug;
        }
        else {
            if (this.appname) {
                this.slug = this.appname.toLowerCase();
            }
            else {
                this.slug = this.name.toLowerCase();
            }
            this.slug = this.slug.replace(/\t/g, "_");
            return this.slug;
        }
    };
    ModTemplate.prototype.returnLink = function () {
        if (this.link != "") {
            return this.link;
        }
        else {
            this.link = "/" + this.returnSlug();
            return this.link;
        }
    };
    ModTemplate.prototype.returnServices = function () {
        return []; // no services by default
    };
    ModTemplate.prototype.handleUrlParams = function (urlParams) { };
    ModTemplate.prototype.showAlert = function () {
        this.alerts++;
        try {
            var qs = '#' + this.returnSlug() + ' > .redicon';
            document.querySelector(qs).style.display = "block";
        }
        catch (err) {
        }
    };
    return ModTemplate;
}());
module.exports = ModTemplate;
//# sourceMappingURL=modtemplate.js.map