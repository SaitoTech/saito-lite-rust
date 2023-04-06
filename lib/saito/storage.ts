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

    console.log("saving options");
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

  //
  // check local archive if exists
  //
  async loadTransactionsFromLocal(type = "all", num = 50, mycallback) {
    const message = "archive";
    const data: any = {};
    data.request = "load";
    data.type = type;
    data.num = num;
    data.publickey = await this.app.wallet.getPublicKey();

    console.log("archive load!");

    let newtx = new Transaction();
    newtx.msg.request = message;
    newtx.msg.data = data;
    // newtx.presign(this.app);

    let archive_mod = this.app.modules.returnModule("Archive");
    if (archive_mod) {
      let res = await archive_mod.handlePeerTransaction(this.app, newtx, null, async (obj) => {
        let txs = [];
        if (obj) {
          if (obj.txs) {
            for (let i = 0; i < obj.txs.length; i++) {
              let tx = new Transaction(undefined, JSON.parse(obj.txs[i].tx));
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
        await mycallback(txs);
      });
    }
  }

  async initialize() {
    console.log("storage.initialize");
    await this.loadOptions();
    this.saveOptions();
    return;
  }

  async loadOptions() {
    console.log("loading options");
    if (typeof Storage !== "undefined") {
      const data = localStorage.getItem("options");
      if (data != "null" && data != null) {
        this.app.options = JSON.parse(data);
        // console.log("loaded from local storage", this.app.options);
      } else {
        try {
          console.log("fetching options from server...");
          const response = await fetch(`/options`);
          this.app.options = await response.json();
          console.log("options loaded : ", this.app.options);
          this.saveOptions();
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  async queryDatabase(sql, params, database) {}

  async executeDatabase(sql, params, database, mycallback = null) {}
}
