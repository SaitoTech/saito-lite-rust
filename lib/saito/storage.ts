import Block from "./block";
import {Saito} from "../../apps/core";

const saito = require('./saito');
const JSON = require('json-bigint');

export default class Storage {
    public app: Saito;
    public active_tab: any;

    constructor(app) {
        this.app = app || {};
        this.active_tab = 1; 		// TODO - only active tab saves, move to Browser class
    }

    async initialize() {
        await this.loadOptions();
        this.saveOptions();
        return;
    }

    async loadOptions() {
        if (typeof (Storage) !== "undefined") {
            let data = localStorage.getItem("options");
            if (data != "null" && data != null) {
                this.app.options = JSON.parse(data);
            } else {
                try {
                    let response = await fetch(`/options`);
                    this.app.options = await response.json();
                    this.saveOptions();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    loadTransactions(type = "all", num = 50, mycallback) {

        let message = "archive";
        let data = {
            request: "load",
            publickey: this.app.wallet.returnPublicKey(),
            type: type,
            num: num
        };
        this.app.network.sendRequestWithCallback(message, data, function (obj) {
            let txs = [];
            if (obj) {
                if (obj.txs) {
                    if (obj.txs.length > 0) {
                        txs = obj.txs.map(tx => new saito.transaction(JSON.parse(tx)));
                    }
                }
            }
            mycallback(txs);
        });

    }

    loadTransactionsByKeys(keys, type = "all", num = 50, mycallback) {

        let message = "archive";
        let data = {
            request: "load_keys",
            keys: keys,
            type: type,
            num: num
        };

        this.app.network.sendRequestWithCallback(message, data, function (obj) {
            if (obj == undefined) {
                mycallback([]);
                return;
            }
            if (obj.txs == undefined) {
                mycallback([]);
                return;
            }
            if (obj.txs.length == 0) {
                mycallback([]);
                return;
            }
            let txs = [];
            if (obj) {
                if (obj.txs) {
                    if (obj.txs.length > 0) {
                        txs = obj.txs.map(tx => new saito.transaction(JSON.parse(tx)));
                    }
                }
            }
            mycallback(txs);
        });

    }


    async resetOptions() {
        try {
            let response = await fetch(`/options`);
            this.app.options = await response.json();
            this.saveOptions();
        } catch (err) {
            console.error(err);
        }
    }

    saveOptions() {
        if (this.app.BROWSER == 1) {
            if (this.active_tab == 0) {
                return;
            }
        }
        try {
            if (typeof (Storage) !== "undefined") {
                localStorage.setItem("options", JSON.stringify(this.app.options));
            }
        } catch (err) {
            console.log(err);
        }
    }


    getModuleOptionsByName(modname) {
        for (let i = 0; i < this.app.options.modules.length; i++) {
            if (this.app.options.modules[i].name === modname) {
                return this.app.options.modules[i];
            }
        }
        return null;
    }


    /**
     * FUNCTIONS OVERWRITTEN BY STORAGE-CORE WHICH HANDLES ITS OWN DATA STORAGE IN ./core/storage-core.js
     **/

    saveTransaction(tx) {

        let txmsg = tx.returnMessage();

        let message = "archive";
        let data = {
            request: "save",
            tx: tx,
            type: txmsg.module
        };

        this.app.network.sendRequestWithCallback(message, data, function (res) {
        });

    }


    saveTransactionByKey(key, tx) {

        let txmsg = tx.returnMessage();

        let message = "archive";
        let data = {
            request: "save_key",
            tx: tx,
            key: key,
            type: txmsg.module
        };

        this.app.network.sendRequestWithCallback(message, data, function (res) {
        });

    }


    /**
     * DUMMY FUNCTIONS IMPLEMENTED BY STORAGE-CORE IN ./core/storage-core.js
     **/
    deleteBlockFromDisk(filename) {
    }

    loadBlockById(bid) {
    }

    loadBlockByHash(bsh) {
    }

    loadBlockFromDisk(filename) {
    }

    async loadBlockByFilename(filename): Promise<Block | null> {
        return null;
    }

    async loadBlocksFromDisk(maxblocks = 0) {
    }

    returnFileSystem() {
        return null;
    }

    async saveBlock(block) {
        return "";
    }

    saveClientOptions() {
    }

    async returnDatabaseByName(dbname) {
        return null;
    }

    async returnBlockFilenameByHash(block_hash, mycallback) {
    }

    returnBlockFilenameByHashPromise(block_hash) {
    }

    async queryDatabase(sql, params, database) {
    }

    async executeDatabase(sql, params, database, mycallback = null) {
    }

    generateBlockFilename(block: Block): string {
        return "";
    }
}


