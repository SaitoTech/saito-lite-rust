"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GoldenTicket = /** @class */ (function () {
    function GoldenTicket(app) {
        this.app = app || {};
    }
    GoldenTicket.prototype.validate = function (previous_block_hash, random_hash, publickey, difficulty) {
        if (previous_block_hash === "") {
            previous_block_hash = "00000000000000000000000000000000";
        }
        var solution = this.app.crypto.hash(previous_block_hash + random_hash + publickey);
        var leading_zeroes_required = Math.floor(difficulty / 16);
        var final_digit = 15 - (difficulty % 16);
        //
        // create our target hash
        //
        var target_hash = "";
        for (var i = 0; i < 64; i++) {
            if (i < leading_zeroes_required) {
                target_hash += "0";
            }
            else {
                if (i === leading_zeroes_required) {
                    target_hash += final_digit.toString(16);
                }
                else {
                    target_hash += "F";
                }
            }
        }
        //
        // anything lower than target hash acceptable
        //
        for (var i = 0; i < leading_zeroes_required + 1 && i < 64; i++) {
            if (parseInt(solution[i], 16) > parseInt(target_hash[i], 16)) {
                return false;
            }
        }
        //
        // if we hit here, true
        //
        return true;
    };
    GoldenTicket.prototype.serialize = function (target_hash, random_hash) {
        var th = Buffer.from(target_hash, 'hex');
        var rh = Buffer.from(random_hash, 'hex');
        var cr = Buffer.from(this.app.crypto.fromBase58(this.app.wallet.returnPublicKey()), 'hex');
        return Buffer.concat([th, rh, cr]).toString("base64");
        // let th2 = this.app.binary.hexToSizedArray(th.toString('hex'), 32);
        // let rh2 = this.app.binary.hexToSizedArray(rh.toString('hex'), 32);
        //
        // console.log("serializing th: " + th2.toString('hex'));
        // console.log("serializing rh: " + rh2.toString('hex'));
        // console.log("serializing cr: " + this.app.wallet.returnPublicKey());
        //
        // //
        // // miner converts to base64
        // //
        // return new Uint8Array([
        //                           ...th2,
        //                           ...rh2,
        //                           ...cr,
        //                       ]);
    };
    GoldenTicket.prototype.deserialize = function (base64buf) {
        // console.log("HERE WITH: " + base64buf);
        //
        // let b = this.app.crypto.base64ToString(base64buf);
        // console.log("HERE WITH: " + b);
        //
        // //
        // // buffer is base64, and needs conversion to binary
        // //
        // console.log("Deserialize Base64: " + base64buf);
        // console.log("BL : " + base64buf.length);
        // //let buffer = Buffer.from(base64buf, 'base64');
        // let buffer = base64buf;
        // let buffer2 = Buffer.from(base64buf, 'base64');
        //
        // console.log("BL2: " + buffer2.toString('utf-8'));
        //
        // let target_hash = buffer.slice(0, 32).toString('hex');
        // let random_hash = buffer.slice(32, 64).toString('hex');
        // let creator = this.app.crypto.toBase58(buffer.slice(64, 97));
        //
        // console.log("reconstructing th: " + target_hash);
        // console.log("reconstructing rh: " + random_hash);
        // console.log("reconstructing cr: " + creator);
        var buffer = Buffer.from(base64buf, "base64");
        return {
            target_hash: Buffer.from(buffer.slice(0, 32)).toString("hex"),
            random_hash: Buffer.from(buffer.slice(32, 64)).toString("hex"),
            creator: this.app.crypto.toBase58(Buffer.from(buffer.slice(64, 97)).toString("hex"))
        };
    };
    GoldenTicket.prototype.deserializeFromTransaction = function (transaction) {
        return this.deserialize(transaction.transaction.m);
    };
    return GoldenTicket;
}());
exports.default = GoldenTicket;
//# sourceMappingURL=goldenticket.js.map