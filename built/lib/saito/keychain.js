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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var saito_1 = __importDefault(require("./saito"));
var modtemplate_1 = __importDefault(require("./../templates/modtemplate"));
var JSON = __importStar(require("json-bigint"));
var identicon_js_1 = __importDefault(require("identicon.js"));
var Keychain = /** @class */ (function () {
    function Keychain(app) {
        this.app = app || {};
        this.keys = [];
        this.groups = [];
        this.modtemplate = new modtemplate_1.default(this.app);
        this.fetched_keys = {};
    }
    Keychain.prototype.initialize = function () {
        if (this.app.options.keys == null) {
            this.app.options.keys = [];
        }
        for (var i = 0; i < this.app.options.keys.length; i++) {
            var tk = this.app.options.keys[i];
            var k = new saito_1.default.key();
            k.publickey = tk.publickey;
            k.watched = tk.watched;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            k.bid = tk.bid;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            k.bsh = tk.bsh;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            k.lc = tk.lc;
            k.aes_publickey = tk.aes_publickey;
            k.aes_privatekey = tk.aes_privatekey;
            k.aes_secret = tk.aes_secret;
            k.data = tk.data;
            for (var m = 0; m < tk.identifiers.length; m++) {
                k.identifiers[m] = tk.identifiers[m];
                if (m == 0) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    k.name = tk.identifiers[m];
                }
            }
            for (var m = 0; m < tk.tags.length; m++) {
                k.tags[m] = tk.tags[m];
            }
            this.keys.push(k);
        }
        //
        // add my key if nothing else
        //
        if (this.app.options.keys.length == 0) {
            this.addKey(this.app.wallet.returnPublicKey(), "", true);
        }
    };
    Keychain.prototype.addKey = function (publickey, identifier, watched, tag, bid, bsh, lc) {
        if (publickey === void 0) { publickey = ""; }
        if (identifier === void 0) { identifier = ""; }
        if (watched === void 0) { watched = false; }
        if (tag === void 0) { tag = ""; }
        if (bid === void 0) { bid = ""; }
        if (bsh === void 0) { bsh = ""; }
        if (lc === void 0) { lc = 1; }
        if (publickey === "") {
            return;
        }
        publickey = publickey.trim();
        var tmpkey = this.findByPublicKey(publickey);
        var added_identifier = 0;
        var added_tag = 0;
        if (tmpkey == null) {
            tmpkey = new saito_1.default.key();
            tmpkey.publickey = publickey;
            tmpkey.watched = watched;
            tmpkey.bid = bid;
            tmpkey.bsh = bsh;
            tmpkey.lc = lc;
            tmpkey.name = "";
            if (identifier != "") {
                if (!tmpkey.identifiers.includes(identifier)) {
                    added_identifier = 1;
                    tmpkey.addIdentifier(identifier);
                    tmpkey.name = identifier;
                }
            }
            if (tag != "") {
                if (!tmpkey.tags.includes(tag)) {
                    added_tag = 1;
                    tmpkey.addTag(tag);
                }
            }
            this.keys.push(tmpkey);
        }
        else {
            if (bid != "" && bsh != "") {
                if (tmpkey.bsh != bsh && tmpkey.bid != bid) {
                    tmpkey.publickey = publickey;
                    tmpkey.watched = watched;
                    tmpkey.bid = bid;
                    tmpkey.bsh = bsh;
                    tmpkey.lc = lc;
                    if (!tmpkey.identifiers.includes(identifier)) {
                        added_identifier = 1;
                        tmpkey.addIdentifier(identifier);
                    }
                    if (!tmpkey.tags.includes(tag)) {
                        added_tag = 1;
                        tmpkey.addTag(tag);
                    }
                }
                else {
                    tmpkey.publickey = publickey;
                    tmpkey.watched = watched;
                    tmpkey.bid = bid;
                    tmpkey.bsh = bsh;
                    tmpkey.lc = lc;
                    if (!tmpkey.identifiers.includes(identifier)) {
                        added_identifier = 1;
                        tmpkey.addIdentifier(identifier);
                    }
                    if (!tmpkey.tags.includes(tag)) {
                        added_tag = 1;
                        tmpkey.addTag(tag);
                    }
                }
            }
            else {
                if (!tmpkey.identifiers.includes(identifier)) {
                    added_identifier = 1;
                    tmpkey.addIdentifier(identifier);
                }
                if (!tmpkey.tags.includes(tag)) {
                    added_tag = 1;
                    tmpkey.addTag(tag);
                }
                if (watched) {
                    tmpkey.watched = true;
                }
            }
        }
        this.saveKeys();
        if (added_identifier == 1) {
            this.app.connection.emit("update_identifier", tmpkey);
        }
        if (added_tag == 1) {
            this.app.connection.emit("update_tag", tmpkey);
        }
    };
    Keychain.prototype.decryptMessage = function (publickey, encrypted_msg) {
        // submit JSON parsed object after unencryption
        for (var x = 0; x < this.keys.length; x++) {
            if (this.keys[x].publickey == publickey) {
                if (this.keys[x].aes_secret != "") {
                    var tmpmsg = this.app.crypto.aesDecrypt(encrypted_msg, this.keys[x].aes_secret);
                    if (tmpmsg != null) {
                        var tmpx = JSON.parse(tmpmsg);
                        if (tmpx.module != null) {
                            return tmpx;
                        }
                    }
                }
            }
        }
        // or return original
        return encrypted_msg;
    };
    // This is unused
    // addGroup(group_id = "", members = [], name = "", watched = false, tag = "", bid = "", bsh = "", lc = 1) {
    //
    //   for (let i = 0; i < members.length++; i++) {
    //     this.addKey(members[i]);
    //   }
    //   if (watched == true) {
    //     for (let i = 0; i < this.keys.length; i++) {
    //       this.keys[i].watched = true;
    //     }
    //     this.saveKeys();
    //   }
    //
    //   let group = {};
    //
    //   for (let z = 0; z < this.groups.length; z++) {
    //     if (this.groups[z].id === group_id) {
    //       group = this.groups[z];
    //     }
    //   }
    //
    //   group.id = group_id;
    //   group.members = members;
    //   group.name = name;
    //   if (watched == true) {
    //     group.watched = true;
    //   }
    //   if (group.watched == undefined) {
    //     group.watched = false;
    //   }
    //   if (group.tags == undefined) { group.tags = []; }
    //   if (tag != "") { if (!group.tags.includes(tag)) { group.tags.push(tag); } }
    //
    //   this.saveGroups();
    //
    // }
    Keychain.prototype.decryptString = function (publickey, encrypted_string) {
        for (var x = 0; x < this.keys.length; x++) {
            if (this.keys[x].publickey == publickey) {
                if (this.keys[x].aes_secret != "") {
                    var tmpmsg = this.app.crypto.aesDecrypt(encrypted_string, this.keys[x].aes_secret);
                    return tmpmsg;
                }
            }
        }
        return encrypted_string;
    };
    Keychain.prototype.encryptMessage = function (publickey, msg) {
        var jsonmsg = JSON.stringify(msg);
        for (var x = 0; x < this.keys.length; x++) {
            if (this.keys[x].publickey == publickey) {
                if (this.keys[x].aes_secret != "") {
                    return this.app.crypto.aesEncrypt(jsonmsg, this.keys[x].aes_secret);
                }
            }
        }
        return msg;
    };
    Keychain.prototype.findByPublicKey = function (publickey) {
        for (var x = 0; x < this.keys.length; x++) {
            if (this.keys[x].publickey == publickey) {
                return this.keys[x];
            }
        }
        return null;
    };
    Keychain.prototype.findByIdentifier = function (identifier) {
        for (var x = 0; x < this.keys.length; x++) {
            if (this.keys[x].isIdentifier(identifier) == 1) {
                return this.keys[x];
            }
        }
        return null;
    };
    Keychain.prototype.hasSharedSecret = function (publickey) {
        for (var x = 0; x < this.keys.length; x++) {
            if (this.keys[x].publickey == publickey || this.keys[x].isIdentifier(publickey) == 1) {
                if (this.keys[x].hasSharedSecret() == 1) {
                    return true;
                }
            }
        }
        return false;
    };
    Keychain.prototype.isWatched = function (publickey) {
        for (var x = 0; x < this.keys.length; x++) {
            if (this.keys[x].publickey == publickey || this.keys[x].isIdentifier(publickey)) {
                if (this.keys[x].isWatched()) {
                    return true;
                }
            }
        }
        return false;
    };
    Keychain.prototype.initializeKeyExchange = function (publickey) {
        var alice = this.app.crypto.createDiffieHellman();
        var alice_publickey = alice.getPublicKey(null, "compressed").toString("hex");
        var alice_privatekey = alice.getPrivateKey(null, "compressed").toString("hex");
        this.updateCryptoByPublicKey(publickey, alice_publickey, alice_privatekey, "");
        return alice_publickey;
    };
    Keychain.prototype.isTagged = function (publickey, tag) {
        var x = this.findByPublicKey(publickey);
        if (x == null) {
            return false;
        }
        return x.isTagged(tag);
    };
    Keychain.prototype.saveKeys = function () {
        this.app.options.keys = this.keys;
        this.app.storage.saveOptions();
    };
    Keychain.prototype.saveGrouos = function () {
        this.app.options.groups = this.groups;
        this.app.storage.saveOptions();
    };
    Keychain.prototype.removeKey = function (publickey) {
        for (var x = this.keys.length - 1; x >= 0; x--) {
            if (this.keys[x].publickey == publickey) {
                this.keys.splice(x, 1);
            }
        }
    };
    // unused
    // removeKeywordByIdentifierAndKeyword(identifier, tag) {
    //   for (let x = this.keys.length - 1; x >= 0; x--) {
    //     if (this.keys[x].isIdentifier(identifier) && this.keys[x].isTagged(tag)) {
    //       this.removeKey(this.keys[x].publickey);
    //       return;
    //     }
    //   }
    // }
    Keychain.prototype.returnKeys = function () {
        var kx = [];
        for (var x = 0; x < this.keys.length; x++) {
            if (this.keys[x].lc == 1 && this.keys[x].publickey != this.app.wallet.returnPublicKey()) {
                kx[kx.length] = this.keys[x];
            }
        }
        return kx;
    };
    Keychain.prototype.returnGroups = function () {
        return this.groups;
    };
    Keychain.prototype.returnKeychainByTag = function (tag) {
        var kx = [];
        for (var x = 0; x < this.keys.length; x++) {
            if (this.keys[x].isTagged(tag)) {
                kx[kx.length] = this.keys[x];
            }
        }
        return kx;
    };
    // used by email registration
    Keychain.prototype.updateEmail = function (publickey, email) {
        var added = 0;
        if (this.keys != undefined) {
            for (var x = 0; x < this.keys.length; x++) {
                if (this.keys[x].publickey === publickey) {
                    if (!this.keys[x].data) {
                        this.keys[x].data = {};
                    }
                    added = 1;
                    this.keys[x].data.email = email;
                    this.app.connection.emit("update_email", this.keys[x]);
                }
            }
        }
        if (added == 0) {
            this.addKey(publickey);
            this.updateEmail(publickey, email);
        }
        this.saveKeys();
    };
    Keychain.prototype.returnEmail = function (publickey) {
        if (this.keys != undefined) {
            for (var x = 0; x < this.keys.length; x++) {
                if (this.keys[x].publickey === publickey) {
                    if (this.keys[x].data.email != "" && typeof this.keys[x].data.email !== "undefined") {
                        return this.keys[x].data.email;
                    }
                }
            }
        }
        return "";
    };
    Keychain.prototype.updateIdenticon = function (publickey, identicon) {
        if (this.keys != undefined) {
            for (var x = 0; x < this.keys.length; x++) {
                if (this.keys[x].publickey === publickey) {
                    if (!this.keys[x].data) {
                        this.keys[x].data = {};
                    }
                    this.keys[x].data.identicon = identicon;
                }
            }
        }
        this.saveKeys();
    };
    Keychain.prototype.returnIdenticon = function (publickey) {
        if (this.keys != undefined) {
            for (var x = 0; x < this.keys.length; x++) {
                if (this.keys[x].publickey === publickey) {
                    if (this.keys[x].data.identicon != "" && typeof this.keys[x].data.identicon !== "undefined") {
                        return this.keys[x].data.identicon;
                    }
                }
            }
        }
        //
        // if we reach here, generate from publickey
        //
        var options = {
            //foreground: [247, 31, 61, 255],           // saito red
            //background: [255, 255, 255, 255],
            margin: 0.0,
            size: 420,
            format: 'svg' // use SVG instead of PNG
        };
        var data = new identicon_js_1.default(this.app.crypto.hash(publickey), options).toString();
        var img = 'data:image/svg+xml;base64,' + data;
        return img;
    };
    Keychain.prototype.returnIdenticonColor = function (publickey) {
        // foreground defaults to last 7 chars as hue at 70% saturation, 50% brightness
        var hue = parseInt(this.app.crypto.hash(publickey).substr(-7), 16) / 0xfffffff;
        var saturation = 0.7;
        var brightness = 0.5;
        var values = this.hsl2rgb(hue, saturation, brightness).map(Math.round);
        return "rgba(".concat(values.join(','), ")");
    };
    Keychain.prototype.hsl2rgb = function (h, s, b) {
        h *= 6;
        s = [
            b += s *= b < .5 ? b : 1 - b,
            b - h % 1 * s * 2,
            b -= s *= 2,
            b,
            b + h % 1 * s,
            b + s
        ];
        return [
            s[~~h % 6] * 255,
            s[(h | 16) % 6] * 255,
            s[(h | 8) % 6] * 255 // blue
        ];
    };
    Keychain.prototype.fetchIdentifierPromise = function (publickey) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.fetchIdentifier(publickey, function (answer) {
                resolve(answer);
            });
        });
    };
    Keychain.prototype.fetchManyIdentifiersPromise = function (publickeys) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.fetchManyIdentifiers(publickeys, function (answer) {
                resolve(answer);
            });
        });
    };
    Keychain.prototype.fetchIdentifier = function (publickey, mycallback) {
        var _this = this;
        if (publickey === void 0) { publickey = ""; }
        var identifier = "";
        var found_keys = [];
        if (publickey == "") {
            mycallback(identifier);
        }
        identifier = this.returnIdentifierByPublicKey(publickey);
        if (this.fetched_keys[publickey] == 1) {
            mycallback(identifier);
        }
        if (!identifier) {
            mycallback(identifier);
        }
        this.modtemplate.sendPeerDatabaseRequestWithFilter("Registry", ('SELECT * FROM records WHERE publickey = "' + publickey + '"'), function (res) {
            var rows = [];
            if (res.rows == undefined) {
                mycallback(rows);
            }
            if (res.err) {
                mycallback(rows);
            }
            if (res.rows == undefined) {
                mycallback(rows);
            }
            if (res.rows.length == 0) {
                mycallback(rows);
            }
            rows = res.rows.map(function (row) {
                var publickey = row.publickey, identifier = row.identifier, bid = row.bid, bsh = row.bsh, lc = row.lc;
                // keep track that we fetched this already
                _this.fetched_keys[publickey] = 1;
                _this.addKey(publickey, identifier, false, "", bid, bsh, lc);
                if (!found_keys.includes(publickey)) {
                    found_keys[publickey] = identifier;
                }
            });
            mycallback(found_keys);
        }, function (peer) {
            for (var z = 0; z < peer.peer.services.length; z++) {
                if (peer.peer.services[z].service === "registry") {
                    return 1;
                }
            }
        });
    };
    Keychain.prototype.fetchManyIdentifiers = function (publickeys, mycallback) {
        var _this = this;
        if (publickeys === void 0) { publickeys = []; }
        var found_keys = [];
        var missing_keys = [];
        publickeys.forEach(function (publickey) {
            var identifier = _this.returnIdentifierByPublicKey(publickey);
            if (identifier.length > 0)
                found_keys[publickey] = identifier;
            else
                missing_keys.push("'".concat(publickey, "'"));
        });
        if (missing_keys.length == 0) {
            mycallback(found_keys);
            return;
        }
        var where_statement = "publickey in (".concat(missing_keys.join(','), ")");
        var sql = "select *\n                     from records\n                     where ".concat(where_statement);
        this.modtemplate.sendPeerDatabaseRequestWithFilter("Registry", sql, function (res) {
            try {
                var rows = [];
                if (typeof res.rows == "undefined") {
                    mycallback(rows);
                    return;
                }
                if (res.err) {
                    mycallback(rows);
                    return;
                }
                if (res.rows.length == 0) {
                    mycallback(rows);
                    return;
                }
                rows = res.rows.map(function (row) {
                    var publickey = row.publickey, identifier = row.identifier, bid = row.bid, bsh = row.bsh, lc = row.lc;
                    _this.addKey(publickey, identifier, false, "", bid, bsh, lc);
                    if (!found_keys.includes(publickey)) {
                        found_keys[publickey] = identifier;
                    }
                });
                mycallback(found_keys);
            }
            catch (err) {
                console.log(err);
            }
        }, function (peer) {
            if (peer.peer.services) {
                for (var z = 0; z < peer.peer.services.length; z++) {
                    if (peer.peer.services[z].service === "registry") {
                        return 1;
                    }
                }
            }
        });
    };
    Keychain.prototype.fetchPublicKeyPromise = function (identifier) {
        var _this = this;
        if (identifier === void 0) { identifier = ""; }
        return new Promise(function (resolve, reject) {
            _this.fetchPublicKey(identifier, function (answer) {
                resolve(answer);
            });
        });
    };
    Keychain.prototype.fetchPublicKey = function (identifier, mycallback) {
        var _this = this;
        if (identifier === void 0) { identifier = null; }
        if (!identifier) {
            return null;
        }
        if (this.app.crypto.isPublicKey(identifier)) {
            mycallback(identifier);
        }
        var publickey = this.returnPublicKeyByIdentifier(identifier);
        if (publickey != "") {
            mycallback({ err: "", rows: [publickey] });
        }
        //
        // if no result, fetch from server (modtemplate)
        //
        this.modtemplate.sendPeerDatabaseRequest("registry", "records", "*", "identifier = '".concat(identifier, "'"), null, function (res) {
            var rows = [];
            if (res.rows == undefined) {
                mycallback(rows);
            }
            res.rows.forEach(function (row) {
                var publickey = row.publickey, identifier = row.identifier, bid = row.bid, bsh = row.bsh, lc = row.lc;
                _this.addKey(publickey, identifier, false, "", bid, bsh, lc);
            });
            //
            // should only get back one row
            mycallback(res);
        });
    };
    Keychain.prototype.returnPublicKeyByIdentifier = function (identifier) {
        for (var x = 0; x < this.keys.length; x++) {
            var key = this.keys[x];
            if (key.lc == 1 && key.isIdentifier(identifier)) {
                return key.publickey;
            }
        }
        return "";
    };
    Keychain.prototype.returnIdentifierByPublicKey = function (publickey, returnKey) {
        if (returnKey === void 0) { returnKey = false; }
        if (this.keys != undefined) {
            for (var x = 0; x < this.keys.length; x++) {
                var key = this.keys[x];
                if (key.publickey === publickey) {
                    if (key.identifiers != undefined && key.lc == 1) {
                        if (key.identifiers.length > 0) {
                            return key.identifiers[0];
                        }
                    }
                }
            }
        }
        if (returnKey) {
            return publickey;
        }
        else {
            return "";
        }
    };
    Keychain.prototype.returnUsername = function (publickey) {
        var name = this.returnIdentifierByPublicKey(publickey, true);
        if (name != "" && name != publickey) {
            return name;
        }
        if (name.length > 12) {
            return name.substr(0, 12) + "...";
        }
        if (name[0]) {
            if (name[0].length > 12) {
                return name[0].substr(0, 12) + "...";
            }
        }
        return name;
    };
    Keychain.prototype.returnWatchedPublicKeys = function () {
        var x = [];
        for (var i = 0; i < this.keys.length; i++) {
            if (this.keys[i].isWatched() && this.keys[i].lc == 1) {
                x.push(this.keys[i].publickey);
            }
        }
        return x;
    };
    Keychain.prototype.addWatchedPublicKey = function (publickey) {
        if (publickey === void 0) { publickey = ""; }
        this.addKey(publickey, "", true);
        this.saveKeys();
        this.app.network.updatePeersWithWatchedPublicKeys();
    };
    Keychain.prototype.updateCryptoByPublicKey = function (publickey, aes_publickey, aes_privatekey, shared_secret) {
        if (aes_publickey === void 0) { aes_publickey = ""; }
        if (aes_privatekey === void 0) { aes_privatekey = ""; }
        if (shared_secret === void 0) { shared_secret = ""; }
        if (publickey == "") {
            return;
        }
        this.addKey(publickey);
        for (var x = 0; x < this.keys.length; x++) {
            if (this.keys[x].publickey == publickey && this.keys[x].lc == 1) {
                this.keys[x].aes_publickey = aes_publickey;
                this.keys[x].aes_privatekey = aes_privatekey;
                this.keys[x].aes_secret = shared_secret;
            }
        }
        this.saveKeys();
        return true;
    };
    Keychain.prototype.alreadyHaveSharedSecret = function (publickey) {
        for (var x = 0; x < this.keys.length; x++) {
            if (this.keys[x].publickey == publickey && this.keys[x].lc == 1) {
                if (this.keys[x].aes_secret != "") {
                    return true;
                }
            }
        }
        return false;
    };
    Keychain.prototype.clean = function () {
        for (var x = 0; x < this.keys.length; x++) {
            if (this.keys[x].isWatched() == false) {
                if (this.keys[x].aes_secret != "") {
                    console.log("purging key records: " + this.keys[x].publickey + " " + JSON.stringify(this.keys[x].identifiers));
                    this.keys.splice(x, 1);
                    x--;
                }
            }
        }
    };
    return Keychain;
}());
exports.default = Keychain;
//# sourceMappingURL=keychain.js.map