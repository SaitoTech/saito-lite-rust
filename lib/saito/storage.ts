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

  //
  // hit up all peers
  //
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
          for (let i = 0; i < obj.txs.length; i++) {
            let tx = new Transaction(JSON.parse(obj.txs[i].tx));
            tx.optional = {};
            if (obj.txs[i].optional) {
              try {
                tx.optional = JSON.parse(obj.txs[i].optional);
              } catch (err) {
                console.log("error loading optional data into tx");
              }
            }
            txs.push(tx);
          }
        }
      }
      mycallback(txs);
    });
  }

  //
  // hit up specific peer
  //
  loadTransactionsFromPeer(type = "all", num = 50, peer, mycallback) {
    const message = "archive";
    const data: any = {};
    data.request = "load";
    data.type = type;
    data.num = num;
    data.publickey = this.app.wallet.returnPublicKey();

    peer.sendRequestWithCallback(message, data, (obj) => {
      let txs = [];
      if (obj) {
        if (obj.txs) {
          for (let i = 0; i < obj.txs.length; i++) {
            let tx = new Transaction(JSON.parse(obj.txs[i].tx));
            tx.optional = {};
            if (obj.txs[i].optional) {
              try {
                tx.optional = JSON.parse(obj.txs[i].optional);
              } catch (err) {
                console.log("error loading optional data into tx");
              }
            }
            txs.push(tx);
          }
        }
      }
      mycallback(txs);
    });
  }


  //
  // check local archive if exists
  //
  loadTransactionsFromLocal(type = "all", num = 50, peer, mycallback) {
    const message = "archive";
    const data: any = {};
    data.request = "load";
    data.type = type;
    data.num = num;
    data.publickey = this.app.wallet.returnPublicKey();

    let archive_mod = this.app.modules.returnModule("Archive");
    if (archive_mod) {

      let res = archive_mod.handlePeerRequest(this.app, message, null, (obj) => {
        let txs = [];
        if (obj) {
          if (obj.txs) {
            for (let i = 0; i < obj.txs.length; i++) {
              let tx = new Transaction(JSON.parse(obj.txs[i].tx));
              tx.optional = {};
              if (obj.txs[i].optional) {
                try {
                  tx.optional = JSON.parse(obj.txs[i].optional);
                } catch (err) {
                  console.log("error loading optional data into tx");
                }
              }
              txs.push(tx);
            }
          }
        }
        mycallback(txs);
      });
    }
  }

  deleteTransactions(type = "all", publickey = "", mycallback = null) {

    const message = "archive";
    const data: any = {};
    data.request = "delete";
    data.type = type;
    data.publickey = publickey;

    this.app.network.sendRequestWithCallback(message, data, function (obj) {
      mycallback();
    });
  }

  loadTransactionBySig(sig, mycallback) {
    const message = "archive";
    const data: any = {};
    data.request = "load_sig";
    data.sig = sig;

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
          for (let i = 0; i < obj.txs.length; i++) {
            let tx = new Transaction(JSON.parse(obj.txs[i].tx));
            tx.optional = {};
            if (obj.txs[i].optional) {
              try {
                tx.optional = JSON.parse(obj.txs[i].optional);
              } catch (err) {
                console.log("error loading optional data into tx");
              }
            }
            txs.push(tx);
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
          for (let i = 0; i < obj.txs.length; i++) {
            let tx = new Transaction(JSON.parse(obj.txs[i].tx));
            tx.optional = {};
            if (obj.txs[i].optional) {
              try {
                tx.optional = JSON.parse(obj.txs[i].optional);
              } catch (err) {
                console.log("error loading optional data into tx");
              }
            }
            txs.push(tx);
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

  getOptions() {
    if (this.app.BROWSER == 1) {
      if (this.active_tab == 0) {
        return;
      }
    }
    try {
      if (typeof Storage !== "undefined") {
        return localStorage.getItem("options");
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
  updateTransaction(tx) {
    const txmsg = tx.returnMessage();
    const message = "archive";
    const data: any = {};
    data.request = "update";
    data.tx = tx;
    this.app.network.sendRequestWithCallback(message, data, function (res) {});
  }
  incrementTransactionOptionalValue(sig, optional_key) {
    const message = "archive";
    const data: any = {};
    data.request = "increment_optional_value";
    data.sig = sig;
    data.publickey = this.app.wallet.returnPublicKey();
    data.optional_key = optional_key;
    this.app.network.sendRequestWithCallback(message, data, function (res) {});
  }
  updateTransactionOptionalValue(sig, optional_key, optional_value) {
    const message = "archive";
    const data: any = {};
    data.request = "update_optional_value";
    data.sig = sig;
    data.publickey = this.app.wallet.returnPublicKey();
    data.optional_value = optional_value;
    data.optional_key = optional_key;
    this.app.network.sendRequestWithCallback(message, data, function (res) {});
  }
  updateTransactionOptional(sig, optional) {
    const message = "archive";
    const data: any = {};
    data.request = "update_optional";
    data.sig = sig;
    data.publickey = this.app.wallet.returnPublicKey();
    data.optional = optional;
    this.app.network.sendRequestWithCallback(message, data, function (res) {});
  }
  saveTransaction(tx: Transaction) {
    console.log("savig tx 1");

    let newtx = this.app.wallet.createUnsignedTransaction();
    newtx.msg = {
      request: "archive save",
      data: tx.serialize(this.app),
    };
    console.log("signing tx...");
    newtx = this.app.wallet.signTransaction(newtx);
    console.log("signed tx...");
    this.app.network.sendTransactionWithCallback(newtx, function (res) {});

    //    const txmsg = tx.returnMessage();
    //    const message = "archive";
    //    const data: any = {};
    //    data.request = "save";
    //    data.tx = tx;
    //    data.type = txmsg.module;
    console.log("=============");
    console.log("SAVING THE TX");
    console.log("=============");
    //    this.app.network.sendRequestWithCallback(message, data, function (res) {});
    this.app.connection.emit("save-transaction", tx);
    console.log("save-transaction'd the tx");
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

    this.app.connection.emit("save-transaction", tx);
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

  returnTokenSupplySlipsFromDisk(): any {
    return [];
  }

  returnBlockFilenameByHashPromise(block_hash: string) {}

  async queryDatabase(sql, params, database) {}

  async executeDatabase(sql, params, database, mycallback = null) {}

  generateBlockFilename(block: Block): string {
    return ""; // empty
  }
}

export default Storage;
