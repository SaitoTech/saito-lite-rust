import * as JSON from "json-bigint";
import Transaction from "./transaction";
import { Saito } from "../../apps/core";
import Block from "./block";

class Storage {
  public app: Saito;
  public active_tab: any;

  constructor(app) {
    this.app = app || {};
    this.active_tab = 1; // TODO - only active tab saves, move to Browser class
  }

  async initialize() {
    await this.loadOptions();
    this.saveOptions();
    return;
  }

  async loadOptions() {
    if (typeof Storage !== "undefined") {
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
  returnClientOptions(): string {
    throw new Error("Method not implemented.");
  }
  loadTransactions(type = "all", num = 50, mycallback) {
    const message = "archive";
    const data: any = {};
    data.request = "load";
    data.type = type;
    data.num = num;
    data.publickey = this.app.wallet.returnPublicKey();

    this.app.network.sendRequestWithCallback(message, data, function (obj) {
      let txs = [];
      if (obj) {
        if (obj.txs) {
          if (obj.txs.length > 0) {
            txs = obj.txs.map((tx) => new Transaction(JSON.parse(tx)));
          }
        }
      }
      mycallback(txs);
    });
  }

  loadTransactionsByKeys(keys, type = "all", num = 50, mycallback) {
    const message = "archive";
    const data: any = {};
    data.request = "load_keys";
    data.keys = keys;
    data.type = type;
    data.num = num;

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
            txs = obj.txs.map((tx) => new Transaction(JSON.parse(tx)));
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
      if (typeof Storage !== "undefined") {
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
    const data: any = {};
    data.request = "save";
    data.tx = tx;
    data.type = txmsg.module;

    this.app.network.sendRequestWithCallback(message, data, function (res) {});
  }

  saveTransactionByKey(key, tx) {
    const txmsg = tx.returnMessage();

    const message = "archive";
    const data: any = {};
    data.request = "save_key";
    data.tx = tx;
    data.key = key;
    data.type = txmsg.module;

    this.app.network.sendRequestWithCallback(message, data, function (res) {});
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

  returnTokenSupplySlipsFromDisk(): any { return []; }

  returnBlockFilenameByHashPromise(block_hash) {}

  async queryDatabase(sql, params, database) {}

  async executeDatabase(sql, params, database, mycallback = null) {}

  generateBlockFilename(block: Block): string {
    return ""; // empty
  }
}

export default Storage;
