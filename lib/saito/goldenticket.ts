const saito = require('./saito');
const Big = require('big.js');


export default class GoldenTicket {
    public app: any;


    constructor(app) {
        this.app = app || {};
    }


    validate(previous_block_hash, random_hash, publickey, difficulty) {

        if (previous_block_hash === "") {
            previous_block_hash = "00000000000000000000000000000000";
        }

        const solution = this.app.crypto.hash(previous_block_hash + random_hash + publickey);
        const leading_zeroes_required = Math.floor(difficulty / 16);
        const final_digit = 15 - (difficulty % 16);

        //
        // create our target hash
        //
        let target_hash = "";
        for (let i = 0; i < 64; i++) {
            if (i < leading_zeroes_required) {
                target_hash += "0";
            } else {
                if (i === leading_zeroes_required) {
                    target_hash += final_digit.toString(16);
                } else {
                    target_hash += "F";
                }
            }
        }

        //
        // anything lower than target hash acceptable
        //
        for (let i = 0; i < leading_zeroes_required + 1 && i < 64; i++) {
            if (parseInt(solution[i], 16) > parseInt(target_hash[i], 16)) {
                return false;
            }
        }

        //
        // if we hit here, true
        //
        return true;

    }

    serialize(target_hash, random_hash) {

        const th = Buffer.from(target_hash, 'hex');
        const rh = Buffer.from(random_hash, 'hex');
        const cr = Buffer.from(this.app.crypto.fromBase58(this.app.wallet.returnPublicKey()), 'hex');

        return Buffer.concat([th, rh, cr]).toString("base64");

    }

    deserialize(base64buf) {
        const buffer = Buffer.from(base64buf, "base64");

        return {
            target_hash: Buffer.from(buffer.slice(0, 32)).toString("hex"),
            random_hash: Buffer.from(buffer.slice(32, 64)).toString("hex"),
            creator: this.app.crypto.toBase58(Buffer.from(buffer.slice(64, 97)).toString("hex"))
        };
    }

    deserializeFromTransaction(transaction) {
        return this.deserialize(transaction.transaction.m);
    }

}


