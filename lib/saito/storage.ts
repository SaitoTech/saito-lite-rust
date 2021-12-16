import Block from "./block";
import {Saito} from "../../apps/core";

import saito from "./saito";

import * as JSON from "json-bigint";

export default class Storage {
    public app: Saito;
    public active_tab: any;

    constructor(app: Saito) {
        this.app = app;
        this.active_tab = 1; 		// TODO - only active tab saves, move to Browser class
    }

    async initialize() {
        await this.loadOptions();
        this.saveOptions();
        return;
    }

    async loadOptions() {
        if (typeof (Storage) !== "undefined") {
            const data = localStorage.getItem("options");
            if (data != "null" && data != null) {
                this.app.options = JSON.parse(data);
            } else {
                try {
                    const response = await fetch(`/options`);
                    this.app.options = await response.json();
                    this.saveOptions();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    loadTransactions(type = "all", num = 50, mycallback) {

        const message = "archive";
        const data = {
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

    returnClientOptions(): any {
        return null;
    }

    loadTransactionsByKeys(keys, type = "all", num = 50, mycallback) {

        const message = "archive";
        const data = {
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
            const response = await fetch(`/options`);
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

        const txmsg = tx.returnMessage();

        const message = "archive";
        const data = {
            request: "save",
            tx: tx,
            type: txmsg.module
        };

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.app.network.sendRequestWithCallback(message, data, res => {
        });

    }


    saveTransactionByKey(key, tx) {

        const txmsg = tx.returnMessage();

        const message = "archive";
        const data = {
            request: "save_key",
            tx: tx,
            key: key,
            type: txmsg.module
        };

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.app.network.sendRequestWithCallback(message, data, function (res) {
        });

    }


    /**
     * DUMMY FUNCTIONS IMPLEMENTED BY STORAGE-CORE IN ./core/storage-core.js
     **/
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    deleteBlockFromDisk(filename) {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    loadBlockById(bid) {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    loadBlockByHash(bsh) {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    loadBlockFromDisk(filename) {
    }

    async loadBlockByFilename(filename): Promise<Block | null> {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async loadBlocksFromDisk(maxblocks = 0) {
    }

    returnFileSystem() {
        return null;
    }

    async saveBlock(block) {
        return "";
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    saveClientOptions() {
    }

    async returnDatabaseByName(dbname) {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async returnBlockFilenameByHash(block_hash, mycallback) {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    returnBlockFilenameByHashPromise(block_hash) {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async queryDatabase(sql, params, database) {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async executeDatabase(sql, params, database, mycallback = null) {
    }

    generateBlockFilename(block: Block): string {
        return "";
    }
}


