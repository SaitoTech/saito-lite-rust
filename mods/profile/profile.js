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





    /**
 * Asynchronously sends a transaction to update a user's profile.
 * 
 * @param {string} image - Base64 encoded string 
 * @param {string} banner - Base64 encoded string
 * @param {string} description - Text description for the user's profile.
 * @param {Object} archive 
 */

    async sendProfileTransaction(image, banner, description, archive) {
        try {
            if (!image || !banner || !description || typeof archive !== 'object' || archive === null) {
                throw new Error("All parameters must be provided and valid.");
            }

            let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey)
            newtx.msg = {
                module: this.name,
                request: "update profile",
                data: {
                    image,
                    banner,
                    description,
                    archive: JSON.stringify(archive)
                }
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
    receiveProfileTransaction(tx) {
        try {
            let from = tx.from[0].publicKey;
            if (!from) {
                throw Error("No `from` public key")
            }
            let txmsg = tx.returnMessage();
            if (this.app.keychain.returnKey(from)) {
                let data = {}
                for (let i in txmsg.data) {
                    if (i === "banner" || i === "image") {
                        data[i] = tx.signature
                    }
                    if (i === "archive") {
                        data[i] = JSON.parse(txmsg.data[i]);
                    }
                }
                this.app.keychain.addKey(from, data)
            } else {
                console.log("key not found")
            }
        } catch (error) {
            console.error("Profile: Error receiving profile transaction ", error)
        }

    }

}

module.exports = Profile;
