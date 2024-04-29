const saito = require('../../lib/saito/saito');
const Transaction = require("../../lib/saito/transaction").default;
const ModTemplate = require('../../lib/templates/modtemplate');



class Profile extends ModTemplate {

    constructor(app) {
        super(app);
        this.app = app;
        this.name = 'Profile';
        this.description = 'Profile Module';
        this.archive_public_key;
        this.cache = {}

        app.connection.on('profile-fetch-content-and-update-dom', async (key) => {
            console.log('retrieving keychain')


            // get the sig using the key
            let key_ = this.app.keychain.returnKey(key);
            let signature = key_.banner
            console.log(key_)

            await this.returnProfileBanner(signature, key, (banner) => {
                const elementId = `${key}-profile-banner`;
                const element = document.querySelector(`#${elementId}`);
                const imageUrl = URL.createObjectURL(banner);
                element.style.backgroundImage = `url('${imageUrl}')`;
            })


            // await this.returnProfileDescription()
            // await this.returnProfileImage()
        })
    }


    async onConfirmation(blk, tx, conf) {
        let txmsg = tx.returnMessage();
        if (conf == 0) {
            if (txmsg.request === "update profile") {
                this.receiveProfileTransaction(tx)
            }
        }
    }




    // async onPeerHandshakeComplete() {
    //     await this.sendProfileTransaction({
    //         archive: {
    //             publicKey: ""
    //         },
    //         image: "an image",
    //         banner: "a banner",
    //         description: "dafadf"
    //     })
    // }




    /**
 * Asynchronously sends a transaction to update a user's profile.
 *  
 * @param {Object} data { image, banner, description, archive: {publicKey}}
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
            console.log('from', from)

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
                        // todo: handle key not found
                    }
                }
                this.app.keychain.addKey(from, data);
                await this.saveProfileTransaction(tx)
                this.saveCache(tx, from)

            } else {
                console.log("Key not found");
            }
        } catch (error) {
            console.error("Profile: Error receiving profile transaction", error);
        }
    }




    // 
    // 
    //  LOAD PROFILE VALUES FUNCTIONS
    // 

    async returnProfileImage(sig, publicKey) {
        // if (typeof callback !== "function") {
        //     console.error(`Callback not present or not a function for "returnProfileImage"`);
        //     return;
        // }

        if (this.cache[publicKey] && this.cache[publicKey].image) {
            console.log('Cache hit for image');
            // callback(this.cache[publicKey].image);
            return;
        }

        this.app.storage.loadTransactions({ sig, field1: "Profile" }, (txs) => {
            if (txs?.length > 0) {
                const tx = txs[0];
                console.log(tx);
                const image = tx.msg.data.image;
                this.cache[publicKey] = this.cache[publicKey] || {};
                this.cache[publicKey].image = image;  // Update cache
                // callback(image);/

                // update the profile image with the gotten image
            }
        }, "localhost");
    }

    async returnProfileBanner(sig, publicKey, callback = null) {
        if (this.cache[publicKey] && this.cache[publicKey].banner) {
            if (callback) {
                callback(this.cache[publicKey].banner)
            }
            return;
        }

        this.app.storage.loadTransactions({ sig, field1: "Profile" }, (txs) => {
            if (txs?.length > 0) {
                const tx = txs[0];
                console.log(tx);
                const banner = tx.msg.data.banner;
                this.cache[publicKey] = this.cache[publicKey] || {};
                this.cache[publicKey].banner = banner;  // Update cache
                console.log(banner, "this is the banner")
                if (callback) {
                    callback(banner)
                }
            }
        }, "localhost");
    }

    async returnProfileDescription(sig, publicKey) {
        // if (typeof callback !== "function") {
        //     console.error(`Callback not present or not a function for "returnProfileDescription"`);
        //     return;
        // }

        if (this.cache[publicKey] && this.cache[publicKey].description) {
            // callback(this.cache[publicKey].description);
            return;
        }

        this.app.storage.loadTransactions({ sig, field1: "Profile" }, (txs) => {
            if (txs?.length > 0) {
                const tx = txs[0];
                console.log(tx);
                const description = tx.msg.data.description;
                this.cache[publicKey] = this.cache[publicKey] || {};
                this.cache[publicKey].description = description;  // Update cache
                // callback(description);
            }
        }, "localhost");
    }



    // 
    // SAVE VALUE FUNCTIONS
    // 

    async saveProfileTransaction(tx) {
        await this.app.storage.saveTransaction(tx, { field1: "Profile" }, "localhost")
    }

    saveCache(tx, from) {
        const cacheData = {};
        if (tx.msg.data) {
            if (tx.msg.data.banner) {
                cacheData.banner = tx.msg.data.banner;
            }
            if (tx.msg.data.image) {
                cacheData.image = tx.msg.data.image;
            }
            if (tx.msg.data.description) {
                cacheData.description = tx.msg.data.description;
            }
        }

        if (Object.keys(cacheData).length > 0) {
            this.cache[from] = cacheData;
            console.log("Cache saved locally:", this.cache[from]);
        } else {
            console.log("No valid data to cache.");
        }


    }


}

module.exports = Profile;


// save cache

