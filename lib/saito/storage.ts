import * as JSON from "json-bigint";
import Transaction from "./transaction";
import { Saito } from "../../apps/core";
import Block from "./block";
const localforage = require("localforage");

class Storage {
  public app: Saito;
  public active_tab: any;
  public timeout: any;

  constructor(app) {
    this.app = app || {};
    this.active_tab = 1; // TODO - only active tab saves, move to Browser class
    this.timeout = null;
  }

  async initialize() {
    await this.loadOptions();
    return;
  }

  //
  // Oct 12, 2023 added the safety check from deprecated getOptions()
  // Should we worry about app.BROWSER == 0 ???
  //
  async loadOptions() {
    if (this.app.BROWSER == 1) {
      if (this.active_tab == 0) {
        return;
      }
    }

    if (typeof Storage !== "undefined") {
      const data = localStorage.getItem("options");
      if (data != "null" && data != null) {
        this.app.options = JSON.parse(data);
        return;
      }
    }

    await this.resetOptions();
  }

  returnClientOptions(): string {
    throw new Error("Method not implemented.");
  }

  //
  // HOW THE STORAGE CLASS SAVES TXS
  //
  // modules call ---> app.storage.saveTransaction(tx, obj, peer))
  //    ---> saveTransaction() creates TX type="archive" / request="save" transaction
  //    ---> saveTransaction() directs this transaction to:
  //                    "localhost"   ==> its own archive module
  //      peer    ==> this specific peer via offchain handlePeerTransaction() request)
  //      null    ==> all peers via offchain handlePeerTransaction() request)
  //    ---> peers receive via Archive module
  //    ---> peers save to DB
  //
  // HOW THE STORAGE CLASS LOADS TXS
  //
  // modules call ---> app.storage.loadTransactions()
  //    ---> loadTransactions() creates TX type="archive" / request="load" transaction
  //    ---> loadTransactions() directs this transaction to:
  //                    "localhost"   ==> its own archive module
  //      peer    ==> this specific peer via offchain handlePeerTransaction() request)
  //      null    ==> all peers via offchain handlePeerTransaction() request)
  //    ---> peers receive via Archive module
  //    ---> peers fetch from DB, return via callback or return TX
  //
  async saveTransaction(tx: Transaction, obj = {}, peer = null) {
    try {
      const txmsg = tx.returnMessage();
      const message = "archive";

      let data: any = {};
      data.request = "save";
      data.serial_transaction = tx.serialize_to_web(this.app);

      data = Object.assign(data, obj);

      if (!data.field1) {
        data.field1 = txmsg.module;
      }
      if (!data.field2) {
        data.field2 = tx.from[0].publicKey;
      }
      if (!data.field3) {
        data.field3 = tx.to[0].publicKey;
      }

      this.app.connection.emit("saito-save-transaction", tx);

      if (peer === "localhost") {
        let archive_mod = this.app.modules.returnModule("Archive");
        if (archive_mod) {
          return await archive_mod.saveTransaction(tx, data);
        }
      }
      if (peer != null) {
        return await this.app.network.sendRequestAsTransaction(message, data, null, peer.peerIndex);
      } else {
        return await this.app.network.sendRequestAsTransaction(message, data);
      }
    } catch (error) {
      console.warn("failed saving tx : " + tx.signature);
      console.error(error);
      return { err: error };
    }
    return { err: "Save Transaction failed" };
  }

  async updateTransaction(tx: Transaction, obj = {}, peer = null) {
    const txmsg = tx.returnMessage();
    const message = "archive";
    let data: any = {};
    data.request = "update";
    data.optional = tx.optional;
    data.serial_transaction = tx.serialize_to_web(this.app);

    data = Object.assign(data, obj);

    if (peer === "localhost") {
      let archive_mod = this.app.modules.returnModule("Archive");
      if (archive_mod) {
        return await archive_mod.updateTransaction(tx, obj);
      }
    } else {
      if (peer != null) {
        return await this.app.network.sendRequestAsTransaction(message, data, null, peer.peerIndex);
      } else {
        return await this.app.network.sendRequestAsTransaction(message, data);
      }
    }
    return { err: "Save Transaction failed" };
  }

  loadTransactions(obj = {}, mycallback, peer = null) {
    let storage_self = this;

    const message = "archive";
    let data: any = {};
    data.request = "load";
    data = Object.assign(data, obj);

    //
    // We could have the archive module handle this
    // idk why we have it return an array of objects that are just {"tx": serialized/stringified transaction}
    //
    let internal_callback = (res) => {
      let txs = [];
      if (res) {
        for (let i = 0; i < res.length; i++) {
          let tx = new Transaction();
          tx.deserialize_from_web(storage_self.app, res[i].tx);
          txs.push(tx);
        }
      }
      mycallback(txs);
    };

    if (peer === "localhost") {
      let archive_mod = this.app.modules.returnModule("Archive");
      if (archive_mod) {
        archive_mod.loadTransactionsWithCallback(obj, (res) => {
          internal_callback(res);
        });
      }
      return;
    }

    if (peer != null) {
      //peer.sendRequestAsTransaction(message, data, function (res) {
      this.app.network.sendRequestAsTransaction(
        message,
        data,
        function (res) {
          internal_callback(res);
        },
        peer.peerIndex
      );
      return;
    } else {
      this.app.network.sendRequestAsTransaction(message, data, function (res) {
        internal_callback(res);
      });
      return;
    }
  }

  deleteTransactions(obj = {}, mycallback = null, peer = null) {
    const message = "archive";
    let data: any = {};
    data.request = "delete";
    data = Object.assign(data, obj);

    this.app.network.sendRequestAsTransaction(message, data, function (obj) {
      mycallback();
    });
  }

  async resetOptions() {
    try {
      //Wipe local storage before resaving options
      localStorage.clear();

      const response = await fetch(`/options`);
      this.app.options = await response.json();
      this.saveOptions();
    } catch (err) {
      console.error(err);
    }
  }

  async resetOptionsFromKey(publicKey) {
    let wallet = await localforage.getItem(publicKey);
    if (wallet) {
      console.log(`Found wallet for ${publicKey} in IndexedDB`);
      //siteMessage(`Found wallet for ${publicKey} in IndexedDB`);
      this.app.options = wallet;
      this.app.storage.saveOptions();
    } else {
      console.log(`Creating fresh wallet for ${publicKey}`);
      //siteMessage(`Creating fresh wallet for ${publicKey}`);
      await this.resetOptions();
    }
  }

  //
  // Note: this function won't save options for at least 250 ms from it's call
  // So, if you are going to redirect the browser after calling it, you need to
  // build in a sufficient delay so that the browser can complete
  //
  saveOptions() {
    if (this.app.BROWSER == 1) {
      if (this.active_tab == 0) {
        return;
      }
    }

    const saveOptionsForReal = async () => {
      clearTimeout(this.timeout);
      //console.log("Actually saving options");
      try {
        localStorage.setItem("options", JSON.stringify(this.app.options));

        if (this.app?.wallet) {
          let key = await this.app.wallet.getPublicKey();
          localforage.setItem(key, this.app.options).then(function (value) {
            //console.log("Local forage updated for public key: " + key);
          });
        }
      } catch (err) {
        console.error(err);
        for (let i = 0; i < localStorage.length; i++) {
          let item = localStorage.getItem(localStorage.key(i));
          console.log(localStorage.key(i), item.length, item, JSON.parse(item));
        }
      }
    };

    clearTimeout(this.timeout);
    this.timeout = setTimeout(saveOptionsForReal, 250);
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
   * DUMMY FUNCTIONS IMPLEMENTED BY STORAGE-CORE IN ./core/storage-core.js
   **/
  deleteBlockFromDisk(filename) {}

  async loadBlockById(bid): Promise<Block> {
    return null;
  }

  async loadBlockByHash(bsh): Promise<Block> {
    return null;
  }

  async loadBlockFromDisk(filename): Promise<Block> {
    return null;
  }

  async loadBlockByFilename(filename): Promise<Block> {
    return null;
  }

  async loadBlocksFromDisk(maxblocks = 0): Promise<Block> {
    return null;
  }

  returnPath() {
    return null;
  }

  returnFileSystem() {
    return null;
  }

  async saveBlock(block: Block): Promise<string> {
    return "";
  }

  saveClientOptions() {}

  async returnDatabaseByName(dbname) {
    return null;
  }

  async returnBlockFilenameByHash(block_hash, mycallback) {}

  returnTokenSupplySlipsFromDisk(): any {
    return [];
  }

  returnBlockFilenameByHashPromise(block_hash: string) {}

  async queryDatabase(sql, params, database) {}

  async insertDatabase(sql, params, database, mycallback = null) {}

  async executeDatabase(sql, params, database, mycallback = null) {}

  generateBlockFilename(block: Block): string {
    return ""; // empty
  }
}

export default Storage;
