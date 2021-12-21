"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
Object.defineProperty(exports, "__esModule", { value: true });
var Mods = /** @class */ (function () {
    function Mods(app, config) {
        this.app = app;
        this.mods = [];
        this.uimods = [];
        this.mods_list = config;
        this.lowest_sync_bid = -1;
    }
    Mods.prototype.isModuleActive = function (modname) {
        if (modname === void 0) { modname = ""; }
        for (var i = 0; i < this.mods.length; i++) {
            if (this.mods[i].browser_active == 1) {
                if (modname == this.mods[i].name) {
                    return 1;
                }
            }
        }
        return 0;
    };
    Mods.prototype.returnActiveModule = function () {
        for (var i = 0; i < this.mods.length; i++) {
            if (this.mods[i].browser_active == 1) {
                return this.mods[i];
            }
        }
        return null;
    };
    Mods.prototype.attachEvents = function () {
        for (var imp = 0; imp < this.mods.length; imp++) {
            if (this.mods[imp].browser_active == 1) {
                this.mods[imp].attachEvents(this.app);
            }
        }
        return null;
    };
    Mods.prototype.affixCallbacks = function (tx, txindex, message, callbackArray, callbackIndexArray) {
        //
        // no callbacks on type=9 spv stubs
        //
        if (tx.transaction.type == 9) {
            return;
        }
        for (var i = 0; i < this.mods.length; i++) {
            if (message.module != undefined) {
                if (this.mods[i].shouldAffixCallbackToModule(message.module, tx) == 1) {
                    callbackArray.push(this.mods[i].onConfirmation.bind(this.mods[i]));
                    callbackIndexArray.push(txindex);
                }
            }
            else {
                if (this.mods[i].shouldAffixCallbackToModule("", tx) == 1) {
                    callbackArray.push(this.mods[i].onConfirmation.bind(this.mods[i]));
                    callbackIndexArray.push(txindex);
                }
            }
        }
    };
    Mods.prototype.handlePeerRequest = function (message, peer, mycallback) {
        if (mycallback === void 0) { mycallback = null; }
        return __awaiter(this, void 0, void 0, function () {
            var iii;
            return __generator(this, function (_a) {
                for (iii = 0; iii < this.mods.length; iii++) {
                    try {
                        this.mods[iii].handlePeerRequest(this.app, message, peer, mycallback);
                    }
                    catch (err) {
                        console.log("handlePeerRequest Unknown Error: \n" + err);
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    Mods.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var i, z, new_mods_installed, start_installation, i, mi, mi_idx, install_this_module, j, modNames, i, i, onPeerHandshakeComplete, onConnectionUnstable;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        //
                        // remove any disabled / inactive modules
                        //
                        if (this.app.options) {
                            if (this.app.options.modules) {
                                for (i = 0; i < this.app.options.modules.length; i++) {
                                    if (this.app.options.modules[i].active == 0) {
                                        for (z = 0; z < this.mods.length; z++) {
                                            if (this.mods[z].name === this.app.options.modules[i].name) {
                                                this.mods.splice(z, 1);
                                                z = (this.mods.length + 1);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        new_mods_installed = 0;
                        start_installation = 0;
                        if (this.app.options.modules == null) {
                            start_installation = 1;
                            this.app.options.modules = [];
                        }
                        else {
                            if (this.app.options.modules.length < this.mods.length) {
                                start_installation = 1;
                            }
                        }
                        if (!(start_installation || true)) return [3 /*break*/, 5];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < this.mods.length)) return [3 /*break*/, 4];
                        mi = 0;
                        mi_idx = -1;
                        install_this_module = 0;
                        for (j = 0; j < this.app.options.modules.length; j++) {
                            if (this.mods[i].name == this.app.options.modules[j].name) {
                                mi = 1;
                                mi_idx = j;
                            }
                        }
                        if (mi == 0) {
                            install_this_module = 1;
                        }
                        else {
                            if (this.app.options.modules[mi_idx].installed == 0) {
                                install_this_module = 1;
                            }
                        }
                        if (!(install_this_module == 1)) return [3 /*break*/, 3];
                        new_mods_installed = 1;
                        return [4 /*yield*/, this.mods[i].installModule(this.app)];
                    case 2:
                        _a.sent();
                        if (mi_idx != -1) {
                            this.app.options.modules[mi_idx].installed = 1;
                            if (this.app.options.modules[mi_idx].version == undefined) {
                                this.app.options.modules[mi_idx].version == "";
                            }
                            if (this.app.options.modules[mi_idx].publisher == undefined) {
                                this.app.options.modules[mi_idx].publisher == "";
                            }
                            this.app.options.modules[mi_idx].active = 1;
                        }
                        else {
                            this.app.options.modules.push({
                                name: this.mods[i].name,
                                installed: 1,
                                version: "",
                                publisher: "",
                                active: 1
                            });
                        }
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (new_mods_installed == 1) {
                            this.app.storage.saveOptions();
                        }
                        _a.label = 5;
                    case 5:
                        modNames = {};
                        this.mods.forEach(function (mod, i) {
                            if (modNames[mod.name]) {
                                console.log("*****************************************************************");
                                console.log("***** WARNING: mod ".concat(mod.name, " is installed more than once! *****"));
                                console.log("*****************************************************************");
                            }
                            modNames[mod.name] = true;
                        });
                        //
                        // browsers install UIMODs
                        //
                        if (this.app.BROWSER == 1) {
                            for (i = 0; i < this.uimods.length; i++) {
                                this.mods.push(this.uimods[i]);
                            }
                        }
                        i = 0;
                        _a.label = 6;
                    case 6:
                        if (!(i < this.mods.length)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.mods[i].initialize(this.app)];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        i++;
                        return [3 /*break*/, 6];
                    case 9:
                        onPeerHandshakeComplete = this.onPeerHandshakeComplete.bind(this);
                        //
                        // include events here
                        //
                        this.app.connection.on('handshake_complete', function (peer) {
                            onPeerHandshakeComplete(peer);
                        });
                        onConnectionUnstable = this.onConnectionUnstable.bind(this);
                        this.app.connection.on('connection_dropped', function (peer) {
                            onConnectionUnstable(peer);
                        });
                        this.app.connection.on('connection_up', function (peer) {
                            _this.onConnectionStable(peer);
                        });
                        if (!this.app.BROWSER) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.app.modules.initializeHTML()];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, this.app.modules.attachEvents()];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, this.app.modules.render()];
                    case 12:
                        _a.sent();
                        _a.label = 13;
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    Mods.prototype.render = function () {
        for (var icb = 0; icb < this.mods.length; icb++) {
            if (this.mods[icb].browser_active == 1) {
                this.mods[icb].render(this.app);
            }
        }
        return null;
    };
    Mods.prototype.initializeHTML = function () {
        for (var icb = 0; icb < this.mods.length; icb++) {
            if (this.mods[icb].browser_active == 1) {
                this.mods[icb].initializeHTML(this.app);
            }
        }
        return null;
    };
    Mods.prototype.respondTo = function (request) {
        return this.mods
            .filter(function (mod) {
            return mod.respondTo(request) != null;
        });
    };
    Mods.prototype.getRespondTos = function (request) {
        var compliantInterfaces = [];
        this.mods.forEach(function (mod) {
            var itnerface = mod.respondTo(request);
            if (itnerface != null) {
                compliantInterfaces.push(__assign(__assign({}, itnerface), { modname: mod.name }));
            }
        });
        return compliantInterfaces;
    };
    Mods.prototype.returnModulesBySubType = function (subtype) {
        var mods = [];
        this.mods.forEach(function (mod) {
            if (mod instanceof subtype) {
                mods.push(mod);
            }
        });
        return mods;
    };
    Mods.prototype.returnFirstModulBySubType = function (subtype) {
        for (var i = 0; i < this.mods.length; i++) {
            if (this.mods[i] instanceof subtype) {
                return this.mods[i];
            }
        }
        return null;
    };
    Mods.prototype.returnModulesByTypeName = function (subtypeName) {
        // TODO: implement if you need this.
    };
    Mods.prototype.returnFirstModuleByTypeName = function (subtypeName) {
        // using type name allows us to check for the type without having a
        // reference to it(e.g. for modules which might not be installed). However
        // this technique(constructor.name) will not allow us to check for subtypes.
        for (var i = 0; i < this.mods.length; i++) {
            if (this.mods[i].constructor.name === subtypeName) {
                return this.mods[i];
            }
        }
        return null;
    };
    Mods.prototype.returnFirstRespondTo = function (request) {
        for (var i = 0; i < this.mods.length; i++) {
            if (this.mods[i].respondTo(request)) {
                return this.mods[i].respondTo(request);
            }
        }
        throw "Module responding to " + request + " not found";
    };
    Mods.prototype.onNewBlock = function (blk, i_am_the_longest_chain) {
        for (var iii = 0; iii < this.mods.length; iii++) {
            this.mods[iii].onNewBlock(blk, i_am_the_longest_chain);
        }
        return;
    };
    Mods.prototype.onChainReorganization = function (block_id, block_hash, lc, pos) {
        for (var imp = 0; imp < this.mods.length; imp++) {
            this.mods[imp].onChainReorganization(block_id, block_hash, lc, pos);
        }
        return null;
    };
    Mods.prototype.onPeerHandshakeComplete = function (peer) {
        for (var i = 0; i < this.mods.length; i++) {
            this.mods[i].onPeerHandshakeComplete(this.app, peer);
        }
    };
    Mods.prototype.onConnectionStable = function (peer) {
        for (var i = 0; i < this.mods.length; i++) {
            this.mods[i].onConnectionStable(this.app, peer);
        }
    };
    Mods.prototype.onConnectionUnstable = function (peer) {
        for (var i = 0; i < this.mods.length; i++) {
            this.mods[i].onConnectionUnstable(this.app, peer);
        }
    };
    Mods.prototype.onWalletReset = function () {
        for (var i = 0; i < this.mods.length; i++) {
            this.mods[i].onWalletReset();
        }
    };
    Mods.prototype.returnModuleBySlug = function (modslug) {
        for (var i = 0; i < this.mods.length; i++) {
            if (modslug === this.mods[i].returnSlug()) {
                return this.mods[i];
            }
        }
        return null;
    };
    Mods.prototype.returnModule = function (modname) {
        for (var i = 0; i < this.mods.length; i++) {
            if (modname === this.mods[i].name) {
                return this.mods[i];
            }
        }
        return null;
    };
    Mods.prototype.returnModuleIndex = function (modname) {
        for (var i = 0; i < this.mods.length; i++) {
            if (modname === this.mods[i].name.toLowerCase()) {
                return i;
            }
        }
        return -1;
    };
    Mods.prototype.updateBlockchainSync = function (current, target) {
        if (this.lowest_sync_bid == -1) {
            this.lowest_sync_bid = current;
        }
        target = target - (this.lowest_sync_bid - 1);
        current = current - (this.lowest_sync_bid - 1);
        if (target < 1) {
            target = 1;
        }
        if (current < 1) {
            current = 1;
        }
        var percent_downloaded = 100;
        if (target > current) {
            percent_downloaded = Math.floor(100 * (current / target));
        }
        for (var i = 0; i < this.mods.length; i++) {
            this.mods[i].updateBlockchainSync(this.app, percent_downloaded);
        }
        return null;
    };
    Mods.prototype.webServer = function (expressapp, express) {
        if (expressapp === void 0) { expressapp = null; }
        if (express === void 0) { express = null; }
        for (var i = 0; i < this.mods.length; i++) {
            this.mods[i].webServer(this.app, expressapp, express);
        }
        return null;
    };
    return Mods;
}());
exports.default = Mods;
//# sourceMappingURL=modules.js.map