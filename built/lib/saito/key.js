"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Key = /** @class */ (function () {
    function Key() {
        if (!(this instanceof Key)) {
            return new Key();
        }
        this.publickey = "";
        this.tags = [];
        this.identifiers = [];
        this.watched = false;
        this.lock_block = false; // after this bid, identifier is locked
        this.aes_publickey = "";
        this.aes_privatekey = "";
        this.aes_secret = "";
        this.identifiers = [];
        this.data = {};
    }
    Key.prototype.addTag = function (tag) {
        if (!this.isTagged(tag)) {
            this.tags.push(tag);
        }
    };
    Key.prototype.addIdentifier = function (identifier) {
        if (!this.isIdentifier(identifier)) {
            this.identifiers.push(identifier);
        }
    };
    Key.prototype.hasSharedSecret = function () {
        if (this.aes_secret != "") {
            return true;
        }
        return false;
    };
    Key.prototype.isIdentifier = function (identifier) {
        for (var x = 0; x < this.identifiers.length; x++) {
            if (this.identifiers[x] == identifier) {
                return true;
            }
        }
        return false;
    };
    Key.prototype.isPublicKey = function (publickey) {
        return this.publickey == publickey;
    };
    Key.prototype.isWatched = function (publickey) {
        return this.watched;
    };
    Key.prototype.isTagged = function (tag) {
        for (var x = 0; x < this.tags.length; x++) {
            if (this.tags[x] == tag) {
                return true;
            }
        }
        return false;
    };
    Key.prototype.removeIdentifier = function (identifier) {
        if (!this.isIdentifier(identifier)) {
            return;
        }
        for (var x = this.identifiers.length - 1; x >= 0; x++) {
            if (this.identifiers[x] == identifier) {
                this.identifiers.splice(x, 1);
            }
        }
    };
    Key.prototype.removeTag = function (tag) {
        if (!this.isTagged(tag)) {
            return;
        }
        for (var x = this.tags.length - 1; x >= 0; x++) {
            if (this.tags[x] == tag) {
                this.tags.splice(x, 1);
            }
        }
    };
    return Key;
}());
exports.default = Key;
//# sourceMappingURL=key.js.map