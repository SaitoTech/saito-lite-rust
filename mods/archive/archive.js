const PeerService = require("saito-js/lib/peer_service").default;

const ModTemplate = require("../../lib/templates/modtemplate");
const saito = require("../../lib/saito/saito");
const JSON = require("json-bigint");
const { default: Factory } = require("../../lib/saito/factory");
const Transaction = require("../../lib/saito/transaction").default;

//
// HOW THE ARCHIVE SAVES TXS
//
// modules call ---> app.storage.saveTransaction()
//    ---> saveTransaction() submits TX to peers via "archive save"
//    ---> peers receive by handlePeerTransaction();
//    ---> peers save to DB with ID or TYPE
//
class Archive extends ModTemplate {
  constructor(app) {
    super(app);

    this.name = "Archive";
    this.description = "Supports the saving and serving of network transactions";
    this.categories = "Utilities Core";

    this.events = [];

    this.description = "A tool for storing transactions for asynchronous retreival.";
    this.categories = "Utilities";

    this.last_clean_on = Date.now();
    this.cleaning_period_in_ms = 1000000;

    app.connection.on("archive-save-transaction", async (data) => {
      if (data.key) {
        await this.saveTransactionByKey(data.key, data.tx, data?.type);
      } else {
        await this.saveTransaction(data.tx, data?.type);
      }
    });
  }

  returnServices() {
    let services = [];
    if (this.app.BROWSER == 0) {
      services.push(new PeerService(null, "archive"));
    }
    return services;
  }

  async onConfirmation(blk, tx, conf) {
    let txmsg = tx.returnMessage();

    //
    // by default we just save everything that is an application
    //
    if (conf == 0) {
      if (tx.msg.module != "") {
        await this.saveTransaction(tx);
      }
    }
  }

  async handlePeerTransaction(app, tx = null, peer, mycallback) {
    if (tx == null) {
      return;
    }
    let req = tx.returnMessage();

    if (req.request == null) {
      return;
    }
    if (req.data == null) {
      return;
    }

    let txs;
    const response = {};

    //
    // saves TX containing archive insert instruction
    //
    if (req.request === "archive insert") {
      let type = "";
      if (req.type) {
        type = req.type;
      }
      await this.saveTransaction(tx, type);
    }
    //
    // saves TX embedded in data
    //
    if (req.request === "archive save") {
      let values = Object.keys(req.data)
        .sort((a, b) => a - b)
        .map((key) => req.data[key]);
      let uint8Array = new Uint8Array(values);
      let newtx = Transaction.deserialize(uint8Array, new Factory());
      let txmsg = newtx.returnMessage();

      try {
        let type = "";
        if (txmsg.module) {
          type = txmsg.module;
        }
        if (req.type) {
          type = req.type;
        }

        await this.saveTransaction(newtx, type);
      } catch (err) {}

      mycallback(true);
      return;
    }
    if (req.request === "archive") {
      if (req.data.request === "delete") {
        await this.deleteTransaction(req.data.tx, req.data.publickey, req.data.sig);
      }
      if (req.data.request === "save") {
        await this.saveTransaction(req.data.tx, req.data.type);
      }
      if (req.data.request === "update") {
        await this.updateTransaction(req.data.tx);
      }
      if (req.data.request === "save_key") {
        if (!req.data.key) {
          return;
        }
        await this.saveTransactionByKey(req.data.key, req.data.tx, req.data.type);
      }
      if (req.data.request === "update_optional") {
        if (!req.data.optional) {
          return;
        }
        await this.updateTransactionOptional(req.data.sig, req.data.publickey, req.data.optional);
      }
      if (req.data.request === "update_optional_value") {
        if (!req.data.optional) {
          return;
        }
        await this.updateTransactionOptionalValue(
          req.data.sig,
          req.data.publickey,
          req.data.optional_key,
          req.data.optional_value
        );
      }
      if (req.data.request === "increment_optional_value") {
        if (!req.data.optional) {
          return;
        }
        await this.incrementTransactionOptionalValue(
          req.data.sig,
          req.data.publickey,
          req.data.optional_key
        );
      }
      if (req.data.request === "delete") {
        if (!req.data.publickey) {
          return;
        }
        await this.deleteTransactions(req.data.type, req.data.publickey);
        response.err = "";
        response.txs = [];
        mycallback(response);
        return;
      }
      if (req.data.request === "load") {
        let type = "";
        let num = 50;
        if (req.data.num != "") {
          num = req.data.num;
        }
        if (req.data.type != "") {
          type = req.data.type;
        }
        txs = await this.loadTransactions(req.data.publickey, req.data.sig, type, num);
        response.err = "";
        response.txs = txs;

        mycallback(response);
        return;
      }
      if (req.data.request === "load_keys") {
        if (!req.data.keys) {
          return;
        }
        txs = await this.loadTransactionsByKeys(req.data);
        response.err = "";
        response.txs = txs;
        mycallback(response);
        return;
      }
      if (req.data.request === "load_sig") {
        if (!req.data.sig) {
          return;
        }
        txs = await this.loadTransactionBySig(req.data.sig);
        response.err = "";
        response.txs = txs;
        mycallback(response);
        return;
      }
    }

    await super.handlePeerTransaction(app, tx, peer, mycallback);
  }

  async updateTransactionOptional(sig = "", publickey = "", optional = "") {
    if (sig === "" || publickey === "" || optional === "") {
      return;
    }

    let sql = "";
    let params = {};

    sql = "UPDATE txs SET optional = $optional WHERE sig = $sig AND publickey = $publickey";
    params = {
      $sig: sig,
      $publickey: publickey,
      $optional: JSON.stringify(optional),
    };
    await this.app.storage.executeDatabase(sql, params, "archive");
  }

  async saveTransaction(tx = null, msgtype = "") {
    //console.log("IN SAVE TRANSACTION IN ARCHIVE>JS");

    if (tx == null) {
      return;
    }

    let sql = "";
    let params = {};
    let optional = {};
    if (tx.optional) {
      optional = tx.optional;
    }

    //console.log("TXS to: " + tx.transaction.to.length);

    for (let i = 0; i < tx.to.length; i++) {
      sql =
        "INSERT OR IGNORE INTO txs (sig, publickey, tx, optional, ts, preserve, type) VALUES ($sig, $publickey, $tx, $optional, $ts, $preserve, $type)";
      params = {
        $sig: tx.signature,
        $publickey: tx.to[i].publicKey,
        $tx: tx.serialize(),
        $optional: JSON.stringify(optional),
        $ts: tx.timestamp,
        $preserve: 0,
        $type: msgtype,
      };
      await this.app.storage.executeDatabase(sql, params, "archive");
    }

    //
    // TODO:
    //
    // sanity check that we want to be saving this for the FROM fields
    //
    for (let i = 0; i < tx.from.length; i++) {
      sql =
        "INSERT OR IGNORE INTO txs (sig, publickey, tx, optional, ts, preserve, type) VALUES ($sig, $publickey, $tx, $optional, $ts, $preserve, $type)";
      params = {
        $sig: tx.signature,
        $publickey: tx.from[i].publicKey,
        $tx: tx.serialize(),
        $optional: JSON.stringify(optional),
        $ts: tx.timestamp,
        $preserve: 0,
        $type: msgtype,
      };
      await this.app.storage.executeDatabase(sql, params, "archive");
    }

    //
    // prune periodically
    //
    if (Date.now() - this.last_clean_on >= this.cleaning_period_in_ms) {
      await this.pruneOldTransactions();
    }
  }

  async updateTransaction(tx = null) {
    if (tx == null) {
      return;
    }

    let sql = "";
    let params = {};
    let optional = {};
    if (tx.optional) {
      optional = tx.optional;
    }

    for (let i = 0; i < tx.to.length; i++) {
      sql = "UPDATE txs SET tx = $tx WHERE sig = $sig AND publickey = $publickey";
      params = {
        $tx: tx.serialize(),
        $sig: tx.signature,
        $publickey: tx.to[i].publicKey,
        $optional: JSON.stringify(optional),
      };
      await this.app.storage.executeDatabase(sql, params, "archive");
    }
    for (let i = 0; i < tx.from.length; i++) {
      sql = "UPDATE txs SET tx = $tx WHERE sig = $sig AND publickey = $publickey";
      params = {
        $tx: tx.serialize(),
        $sig: tx.signature,
        $publickey: tx.from[i].publicKey,
        $optional: JSON.stringify(optional),
      };
      await this.app.storage.executeDatabase(sql, params, "archive");
    }
  }

  async pruneOldTransactions() {
    console.debug("archive.pruneOldTransactions");
    this.last_clean_on = Date.now();

    let ts = new Date().getTime() - 100000000;
    let sql = "DELETE FROM txs WHERE ts < $ts AND type = $type AND preserve = 0";
    let params = {
      $ts: ts,
      $type: "Chat",
    };
    await this.app.storage.executeDatabase(sql, params, "archive");
  }

  async saveTransactionByKey(key = "", tx = null, type = "") {
    if (tx == null) {
      return;
    }
    let optional = tx.optional ? tx.optional : {};

    let sql =
      "INSERT OR IGNORE INTO txs (sig, publickey, tx, optional, ts, preserve, type) VALUES ($sig, $publickey, $tx, $optional, $ts, $preserve, $type)";
    let params = {
      $sig: tx.signature,
      $publickey: key,
      $tx: tx.serialize(),
      $optional: optional,
      $ts: tx.timestamp,
      $preserve: 0,
      $type: type,
    };

    await this.app.storage.executeDatabase(sql, params, "archive");

    //
    // prune periodically
    //
    if (Date.now() - this.last_clean_on >= this.cleaning_period_in_ms) {
      await this.pruneOldTransactions();
    }
  }

  async deleteTransaction(tx = null, authorizing_publickey = "", authorizing_sig = "") {
    if (tx == null) {
      return;
    }

    //
    // the individual requesting deletion should sign the transaction.sig with their own
    // privatekey. this provides a sanity check on ensuring that the right message is
    // deleted
    //
    if (
      this.app.crypto.verifyMessage(
        "delete_" + tx.signature,
        authorizing_sig,
        authorizing_publickey
      )
    ) {
      let sql = "DELETE FROM txs WHERE publickey = $publickey AND sig = $sig";
      let params = {
        $sig: tx.signature,
        $publickey: authorizing_publickey,
      };

      await this.app.storage.executeDatabase(sql, params, "archive");
    }
  }

  async loadTransactions(publickey, sig, type, num) {
    let sql = "";
    let params = {};

    if (type === "all") {
      sql = "SELECT * FROM txs WHERE publickey = $publickey ORDER BY id DESC LIMIT $num";
      params = { $publickey: publickey, $num: num };
    } else {
      sql =
        "SELECT * FROM txs WHERE publickey = $publickey AND type = $type ORDER BY id DESC LIMIT $num";
      params = { $publickey: publickey, $type: type, $num: num };
    }

    let rows = await this.app.storage.queryDatabase(sql, params, "archive");
    let txs = [];

    if (rows != undefined) {
      if (rows.length > 0) {
        for (let i = 0; i < rows.length; i++) {
          txs.push({ tx: rows[i].tx, optional: rows[i].optional });
        }
      }
    }
    return txs;
  }

  async deleteTransactions(type = "all", publickey = null) {
    if (publickey == null) {
      return;
    }

    let sql = "";
    let params = {};

    if (type === "all") {
      sql = "DELETE FROM txs WHERE publickey = $publickey";
      params = { $publickey: publickey };
    } else {
      sql = "DELETE FROM txs WHERE publickey = $publickey AND type = $type";
      params = { $publickey: publickey, $type: type };
    }

    await this.app.storage.executeDatabase(sql, params, "archive");
    return;
  }

  async loadTransactionsByKeys({ keys = [], type = "all", num = 50 }) {
    let sql = "";
    let params = {};

    let count = 0;
    let paramkey = "";
    let where_statement_array = [];

    try {
      keys.forEach((key) => {
        paramkey = `$key${count}`;
        where_statement_array.push(paramkey);
        params[paramkey] = key;
        count++;
      });

      if (type === "all") {
        sql = `SELECT *
               FROM txs
               WHERE publickey IN (${where_statement_array.join(",")})
               ORDER BY id DESC LIMIT $num`;
        params = Object.assign(params, { $num: num });
      } else {
        sql = `SELECT *
               FROM txs
               WHERE publickey IN (${where_statement_array.join(",")})
                 AND type = $type
               ORDER BY id DESC LIMIT $num`;
        params = Object.assign(params, { $type: type, $num: num });
      }

      let rows = await this.app.storage.queryDatabase(sql, params, "archive");
      let txs = [];
      if (rows?.length > 0) {
        for (let row of rows) {
          txs.push({ tx: row.tx, optional: row.optional });
        }
      }
      return txs;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async loadTransactionBySig(sig = "") {
    let sql = "";
    let params = {};

    let count = 0;
    let paramkey = "";
    let where_statement_array = [];

    try {
      sql = `SELECT *
             FROM txs
             WHERE sig = $sig`;
      params = Object.assign(params, { $sig: sig });
      let rows = await this.app.storage.queryDatabase(sql, params, "archive");
      let txs = [];

      if (rows?.length > 0) {
        for (let row of rows) {
          txs.push({ tx: row.tx, optional: row.optional });
        }
      }
      return txs;
    } catch (err) {
      console.log(err);
      return [];
    }
  }
}

module.exports = Archive;
