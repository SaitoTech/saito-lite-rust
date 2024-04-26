const saito = require('../../lib/saito/saito');
const Transaction = require("../../lib/saito/transaction").default;
const ModTemplate = require('../../lib/templates/modtemplate');



class Profile extends ModTemplate {

    constructor(app) {
        super(app);
        this.app = app;
        this.name = 'Profile';
        this.description = 'Profile Module';
        this.archive_public_key
    }


    async onConfirmation(blk, tx, conf) {
        let txmsg = tx.returnMessage();
        if (conf == 0) {
            if (txmsg.request === "update profile") {
                this.receiveProfileTransaction(tx)
            }
        }
    }


    async onPeerServiceUp(peer) {
        if (this.app.BROWSER === 1) {
            this.sendProfileTransaction({ description: "a description", banner: "banner", image: "image", archive: JSON.stringify({ publicKey: "key" }) })


        }

    }





    /**
 * Asynchronously sends a transaction to update a user's profile.
 * 
 * 
 */

    async sendProfileTransaction(data) {
        try {
            const obj = {};
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    if (key === "archive" && typeof data[key] === 'object' && !Array.isArray(data[key])) {
                        obj[key] = JSON.stringify(data[key]);
                    } else {
                        obj[key] = data[key];
                    }
                }
            }

            let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey)
            newtx.msg = {
                module: this.name,
                request: "update profile",
                data: obj
            }
            newtx.serialize_to_web(this.app);
            await newtx.sign();
            await this.app.network.propagateTransaction(newtx);
        } catch (error) {
            console.error("Profile: Error creating profile transaction ", error)
        }
    }

    /**
 * Processes a received transaction to update a user's profile.
 *
 * @param {Object} tx - The transaction object received, containing data to be processed.
 */
    async receiveProfileTransaction(tx) {
        try {

            let from = tx.from && tx.from.length > 0 ? tx.from[0].publicKey : null;
            if (!from) {
                throw new Error("No `from` public key");
            }
            let txmsg = tx.returnMessage();

            if (this.app.keychain.returnKey(from)) {
                let data = {};
                for (let key in txmsg.data) {

                    if (!txmsg.data.hasOwnProperty(key)) continue;


                    if (key === "banner" || key === "image" || key === "description") {
                        data[key] = tx.signature;
                    } else if (key === "archive" && typeof txmsg.data[key] === 'string') {

                        try {
                            data[key] = JSON.parse(txmsg.data[key]);
                        } catch (parseError) {
                            console.error("Error parsing archive data", parseError);
                            data[key] = txmsg.data[key];
                        }
                    } else {
                        // console.error("")
                        // key not supported
                    }
                }
                this.app.keychain.addKey(from, data);
                await this.saveProfileTransaction(tx)
            } else {
                console.log("Key not found");
            }
        } catch (error) {
            console.error("Profile: Error receiving profile transaction", error);
        }
    }




    // / LOAD PROFILE VALUES

    async returnProfilePicture(sig) {
        let tx = await this.app.storage.loadTransactions({ field1: "Profile" }, (txs) => {
            console.log(txs, "loaded transactions: profile picture")
        });
        console.log(tx)
    }

    async returnProfileBanner(sig) {
        let tx = await this.app.storage.loadTransactions({}, (txs) => {

        });
        console.log(tx)
    }

    async returnProfileDescription(sig) {
        let tx = await this.app.storage.loadTransactions({}, (txs) => {

        });
        console.log(tx)
    }

    async saveProfileTransaction(tx) {
        await this.app.storage.saveTransaction(tx, {}, "localhost")

        await this.returnProfileBanner("55c9babb413976e8ab7ea68a2c295e4bd52fb595affe411d31366763d780315309f3946109adbde592e33f119aee8558c55cbaca286d2947c2a3114d3eccf3fd")
        await this.returnProfileDescription("55c9babb413976e8ab7ea68a2c295e4bd52fb595affe411d31366763d780315309f3946109adbde592e33f119aee8558c55cbaca286d2947c2a3114d3eccf3fd")
        await this.returnProfilePicture("55c9babb413976e8ab7ea68a2c295e4bd52fb595affe411d31366763d780315309f3946109adbde592e33f119aee8558c55cbaca286d2947c2a3114d3eccf3fd")
    }


}

module.exports = Profile;
