import { Saito } from "../../apps/core";
import Transaction from "./transaction";

export default class Storage {
  public app: Saito;
  public active_tab: any;

  constructor(app) {
    this.app = app || {};
    this.active_tab = 1; // TODO - only active tab saves, move to Browser class
  }

  async resetOptions() {
    try {
      const response = await fetch(`/options`);
      this.app.options = await response.json();
      if (typeof window !== "undefined") {
        this.app.options.spv_mode = true;
        this.app.options.browser_mode = true;
      } else {
        this.app.options.spv_mode = false;
        this.app.options.browser_mode = false;
      }
      this.saveOptions();
    } catch (err) {
      console.error(err);
    }
  }

  saveOptions() {
    if (this.app.BROWSER == 1 && this.active_tab == 0) {
      return;
    }

    // console.log("saving options : ", this.app.options);
    try {
      localStorage.setItem("options", JSON.stringify(this.app.options));
    } catch (err) {
      console.log(err);
    }
  }

  // getOptions() {
  //   if (this.app.BROWSER == 1) {
  //     if (this.active_tab == 0) {
  //       return;
  //     }
  //   }
  //   try {
  //     if (typeof Storage !== "undefined") {
  //       return localStorage.getItem("options");
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  loadTransactions(obj = {}, mycallback, peer = null) {
    let storage_self = this;

    const message = "archive";
    let data: any = {};
    data.request = "load";
    data = Object.assign(data, obj);

    let internal_callback = (res) => {
      let txs = [];
      if (res) {
        for (let i = 0; i < res.length; i++) {
          let tx = new Transaction(undefined, res[i].tx);
          // tx.deserialize_from_web(this.app, res[i].tx);
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

    this.app.network.sendRequestAsTransaction(
      message,
      data,
      function (res) {
        internal_callback(res);
      },
      peer?.peerIndex
    );
    return;
  }

  async initialize() {
    console.log("storage.initialize");
    await this.loadOptions();
    this.saveOptions();
  }

  getClientOptions(): string {
    throw new Error("Method not implemented.");
  }

  async loadOptions() {
    console.log("loading options");
    const data = localStorage.getItem("options");
    if (data) {
      this.app.options = JSON.parse(data);
    } else {
      try {
        console.log("fetching options from server...");
        const response = await fetch(`/options`);

        this.app.options = await response.json();
        this.app.options = JSON.parse(JSON.stringify(this.app.options));
        if (typeof window !== "undefined") {
          this.app.options.spv_mode = true;
          this.app.options.browser_mode = true;
        } else {
          this.app.options.spv_mode = false;
          this.app.options.browser_mode = false;
        }

        console.log("options loaded : ", this.app.options);
        this.saveOptions();
      } catch (err) {
        console.error(err);
      }
    }
    // this.convertOptionsBigInt(this.app.options);
    return this.app.options;
  }

  // convertOptionsBigInt(options: any) {
  //   console.log("options for conversion : ", options);
  //   if (options.blockchain) {
  //     // options.blockchain.last_block_id = BigInt(options.blockchain.last_block_id);
  //     // options.blockchain.last_timestamp = BigInt(options.blockchain.last_timestamp);
  //     // options.blockchain.genesis_block_id = BigInt(options.blockchain.genesis_block_id);
  //     // options.blockchain.genesis_timestamp = BigInt(options.blockchain.genesis_timestamp);
  //     // options.blockchain.lowest_acceptable_timestamp = BigInt(
  //     //   options.blockchain.lowest_acceptable_timestamp
  //     // );
  //     // options.blockchain.lowest_acceptable_block_id = BigInt(
  //     //   options.blockchain.lowest_acceptable_block_id
  //     // );
  //   }
  // }

  async queryDatabase(sql, params, database) {}

  async executeDatabase(sql, params, database, mycallback = null) {}

  /**
   * FUNCTIONS OVERWRITTEN BY STORAGE-CORE WHICH HANDLES ITS OWN DATA STORAGE IN ./core/storage-core.js
   **/
  updateTransaction(tx) {
    const txmsg = tx.returnMessage();
    const message = "archive";
    const data: any = {};
    data.request = "update";
    data.tx = tx;
    this.app.network.sendRequestAsTransaction(message, data, function (res) {});
  }

  async incrementTransactionOptionalValue(sig, optional_key) {
    const message = "archive";
    const data: any = {};
    data.request = "increment_optional_value";
    data.signature = sig;
    data.publickey = await this.app.wallet.getPublicKey();
    data.optional_key = optional_key;
    return this.app.network.sendRequestAsTransaction(message, data, function (res) {});
  }

  async updateTransactionOptionalValue(sig, optional_key, optional_value) {
    const message = "archive";
    const data: any = {};
    data.request = "update_optional_value";
    data.signature = sig;
    data.publickey = await this.app.wallet.getPublicKey();
    data.optional_value = optional_value;
    data.optional_key = optional_key;
    return this.app.network.sendRequestAsTransaction(message, data, function (res) {});
  }

  async updateTransactionOptional(sig, optional) {
    const message = "archive";
    const data: any = {};
    data.request = "update_optional";
    data.signature = sig;
    data.publickey = await this.app.wallet.getPublicKey();
    data.optional = optional;
    return this.app.network.sendRequestAsTransaction(message, data, function (res) {});
  }

  async saveTransaction(tx: Transaction, type = null) {
    console.log("storage.saveTransaction : ", tx);
    let newtx = await this.app.wallet.createUnsignedTransaction(
      await this.app.wallet.getPublicKey()
    );
    newtx.msg = {
      request: "archive save",
      data: tx.serialize(),
    };
    if (type != null) {
      newtx.msg.type = type;
    }
    await newtx.sign();
    await this.app.network.sendTransactionWithCallback(newtx, function (res) {});

    //    const txmsg = tx.returnMessage();
    //    const message = "archive";
    //    const data: any = {};
    //    data.request = "save";
    //    data.tx = tx;
    //    data.type = txmsg.module;
    //console.log("=============");
    //console.log("SAVING THE TX");
    //console.log("=============");
    this.app.connection.emit("save-transaction", tx);
  }

  saveTransactionByKey(key, tx) {
    const txmsg = tx.returnMessage();
    const message = "archive";
    const data: any = {};
    data.request = "save_key";
    data.tx = tx;
    data.key = key;
    data.type = txmsg.module;
    this.app.network.sendRequestAsTransaction(message, data, function (res) {});

    this.app.connection.emit("save-transaction", tx);
  }
}
