const ModTemplate = require("../../lib/templates/modtemplate");
const saito = require("../../lib/saito/saito");
const JsStore = require("jsstore");
const JSON = require("json-bigint");
const Transaction = require("../../lib/saito/transaction").default;
const PeerService = require("saito-js/lib/peer_service").default;

//
// HOW THE ARCHIVE SAVES TXS
//
// modules call ---> app.storage.saveTransaction()
//    ---> saveTransaction() sends TX to peers via "archive" request="save" transaction
//    ---> peers receive by handlePeerTransaction();
//    ---> peers save to DB
//
// HOW THE ARCHIVE LOADS TXS
//
// modules call ---> app.storage.loadTransactions()
//    ---> loadTransactions() sends TX to peers via "archive" request="save" transaction
//    ---> peers receive by handlePeerTransaction();
//    ---> peers fetch from DB, return via callback or return TX
//
class Archive extends ModTemplate {
  constructor(app) {
    super(app);

    this.name = "Archive";
    this.description = "Supports the saving and serving of network transactions";
    this.categories = "Utilities Core";

    this.localDB = null;

    //
    //
    //
    this.prune_public_ts = 600000000; // about 1 week
    this.prune_private_ts = 450000000; // about 5 days

    //
    // settings saved and loaded from app.options
    //
    this.archive = {
      index_blockchain: 0,
    };

    if (this.app.BROWSER == 0) {
      this.archive.index_blockchain = 1;
    } else {
      this.localDB = new JsStore.Connection(new Worker("/saito/lib/jsstore/jsstore.worker.js"));
    }
  }

  async initialize(app) {
    await super.initialize(app);
    this.load();

    if (app.BROWSER) {
      //
      //Create Local DB schema
      //
      let archives = {
        name: "archives",
        columns: {
          id: { primaryKey: true, autoIncrement: true },
          user_id: { dataType: "number", default: 0 },
          publicKey: { dataType: "string", default: "" },
          owner: { dataType: "string", default: "" },
          sig: { dataType: "string", default: "" },
          field1: { dataType: "string", default: "" },
          field2: { dataType: "string", default: "" },
          field3: { dataType: "string", default: "" },
          block_id: { dataType: "number", default: 0 },
          block_hash: { dataType: "string", default: "" },
          created_at: { dataType: "number", default: 0 },
          updated_at: { dataType: "number", default: 0 },
          tx: { dataType: "string", default: "" },
          preserve: { dataType: "number", default: 0 },
        },
      };

      let db = {
        name: "archive_db",
        tables: [archives],
      };

      var isDbCreated = await this.localDB.initDb(db);

      if (isDbCreated) {
        console.log("ARCHIVE: Db Created & connection is opened");
      } else {
        console.log("ARCHIVE: Connection is opened");
      }
    }
  }

  returnServices() {
    let services = [];
    if (this.app.BROWSER == 0) {
      services.push(new PeerService(null, "archive"));
    }
    return services;
  }

  //
  // by default we just save everything that is an application
  //
  async onConfirmation(blk, tx, conf) {
    //
    // save all on-chain transactions -- but only the service node...
    //
    if (conf == 0 && this.archive.index_blockchain == 1) {
      //if (conf == 0) {

      let block_id = 0;
      let block_hash = "";

      if (blk.id) {
        block_id = blk.id;
      }
      if (blk.hash) {
        block_hash = blk.hash;
      }

      await this.saveTransaction(tx, { block_id, block_hash }, 1);
    }
  }

  async handlePeerTransaction(app, tx = null, peer, mycallback) {
    if (tx == null) {
      return 0;
    }

    let req = tx.returnMessage();

    if (!req?.request || !req?.data) {
      return 0;
    }

    var txs;
    var response = {};

    //
    // saves TX containing archive insert instruction
    //
    if (req.request === "archive") {
      if (req.data.request === "load") {
        //
        //Duplicates loadTransactionsWithCallback, but that's fine
        //
        let txs = await this.loadTransactions(req.data);
        if (mycallback) {
          mycallback(txs);
          return 1;
        }
      }

      let newtx = new Transaction();
      newtx.deserialize_from_web(app, req.data.serial_transaction);

      if (req.data.request === "delete") {
        await this.deleteTransaction(newtx, req.data);
      }
      if (req.data.request === "save") {
        await this.saveTransaction(newtx, req.data);
      }
      if (req.data.request === "update") {
        await this.updateTransaction(newtx, req.data);
      }

      // archive returns 0 if callback not sent !
      return 0;
    }

    return super.handlePeerTransaction(app, tx, peer, mycallback);
  }

  //////////
  // save //
  //////////
  async saveTransaction(tx, obj = {}, onchain = 0) {
    let newObj = {};

    //
    // User_id should be the ID of the User table... for library ownership???
    //
    newObj.user_id = obj?.user_id || 0; //What is this supposed to be

    newObj.publicKey = obj?.publicKey || tx.from[0].publicKey;
    newObj.owner = obj?.owner || "";
    newObj.signature = obj?.signature || tx.signature;
    //Field1-3 are set by default in app.storage
    newObj.field1 = obj?.field1 || "";
    newObj.field2 = obj?.field2 || "";
    newObj.field3 = obj?.field3 || "";
    newObj.block_id = obj?.block_id || 0;
    newObj.block_hash = obj?.block_hash || "";
    newObj.preserve = obj?.preserve || 0;
    newObj.created_at = obj?.created_at || tx.timestamp;
    newObj.updated_at = obj?.updated_at || tx.timestamp;
    newObj.tx = tx.serialize_to_web(this.app);

    if (this.app.BROWSER) {
      let numRows = await this.localDB.insert({
        into: "archives",
        values: [newObj],
      });

      if (numRows) {
        console.log("Local Archive index successfully inserted");
      }
    } else {
      //
      // insert index record
      //
      let sql = `INSERT
                  OR IGNORE INTO archives (
                    publickey, 
                    owner, 
                    sig, 
                    field1, 
                    field2, 
                    field3, 
                    block_id, 
                    block_hash, 
                    created_at, 
                    updated_at, 
                    tx,
                    preserve
                  ) VALUES (
                  $publickey,
                  $owner,
                  $sig,
                  $field1,
                  $field2,
                  $field3,
                  $block_id,
                  $block_hash,
                  $created_at,
                  $updated_at,
                  $tx,
                  $preserve
                  )`;
      let params = {
        $publickey: newObj.publicKey,
        $owner: newObj.owner,
        $sig: newObj.signature,
        $field1: newObj.field1,
        $field2: newObj.field2,
        $field3: newObj.field3,
        $block_id: newObj.block_id,
        $block_hash: newObj.block_hash,
        $created_at: newObj.created_at,
        $updated_at: newObj.updated_at,
        $tx: newObj.tx,
        $preserve: newObj.preserve,
      };

      await this.app.storage.insertDatabase(sql, params, "archive");
    }
  }

  ////////////
  // update //
  ////////////
  async updateTransaction(tx, obj = {}) {
    //
    // update records
    //
    let newObj = {};
    newObj.user_id = obj?.user_id || 0; //What is this supposed to be
    newObj.publicKey = obj?.publicKey || "";
    newObj.owner = obj?.owner || "";
    newObj.signature = obj?.signature || "";
    if (newObj.signature == "" && obj?.sig) {
      newObj.signature = obj.sig;
    }
    if (newObj.signature == "") {
      if (tx?.signature) {
        newObj.signature = tx.signature;
      }
    }
    //Field1-3 are set by default in app.storage
    newObj.field1 = obj?.field1 || "";
    newObj.field2 = obj?.field2 || "";
    newObj.field3 = obj?.field3 || "";
    newObj.block_id = obj?.block_id || 0;
    newObj.block_hash = obj?.block_hash || "";
    newObj.preserve = obj?.preserve || 0;
    newObj.tx = tx.serialize_to_web(this.app);
    newObj.updated_at = new Date().getTime();

    //
    // update index
    //
    let sql = `UPDATE archives
           SET updated_at = $updated_at,
               owner = $owner,
               tx  = $tx,
               preserve   = $preserve
           WHERE sig = $sig`;
    let params = {
      $updated_at: newObj.updated_at,
      $owner: newObj.owner,
      $tx: tx.serialize_to_web(this.app),
      $preserve: newObj.preserve,
      $sig: newObj.signature,
    };

    await this.app.storage.executeDatabase(sql, params, "archive");

    if (this.app.BROWSER) {
      await this.localDB.update({
        in: "archives",
        set: {
          updated_at: newObj.updated_at,
          owner: newObj.owner,
          tx: tx.serialize_to_web(this.app),
          preserve: newObj.preserve,
        },
        where: {
          sig: newObj.signature,
        },
      });
    }

    return 1;
  }

  //////////
  // load //
  //////////
  async loadTransactionsWithCallback(obj = {}, callback = null) {
    let txs = await this.loadTransactions(obj);
    if (callback) {
      callback(txs);
    }
  }

  async loadTransactions(obj = {}) {
    let limit = 10;
    let txs = [];
    let sql = "";
    let params = {};
    let rows = [];
    let timestamp_limiting_clause = "";
    let where_obj = {};

    if (obj.created_later_than) {
      timestamp_limiting_clause = " AND created_at > " + parseInt(obj.created_later_than);
      where_obj = { created_at: { ">": parseInt(obj.created_later_than) } };
    }
    if (obj.created_earlier_than) {
      timestamp_limiting_clause = " AND created_at < " + parseInt(obj.created_earlier_than);
      where_obj = { created_at: { "<": parseInt(obj.created_earlier_than) } };
    }
    if (obj.updated_later_than) {
      timestamp_limiting_clause = " AND updated_at > " + parseInt(obj.updated_later_than);
      where_obj = { updated_at: { ">": parseInt(obj.updated_later_than) } };
    }
    if (obj.updated_earlier_than) {
      timestamp_limiting_clause = " AND updated_at < " + parseInt(obj.updated_earlier_than);
      where_obj = { updated_at: { "<": parseInt(obj.updated_earlier_than) } };
    }

    //
    // ACCEPT REASONABLE LIMITS -- [10, 100]
    //
    if (obj.limit) {
      limit = Math.max(limit, obj.limit);
      limit = Math.min(limit, 100);
    }

    //
    // SEARCH BASED ON CRITERIA PROVIDED
    // Run SQL queries for full nodes and build where_obj for browser search
    //
    if (obj.signature && obj.owner) {
      sql = `SELECT *
             FROM archives
             WHERE archives.sig = $sig
               AND archives.owner = $owner ${timestamp_limiting_clause}
             ORDER BY archives.id DESC LIMIT $limit`;
      params = { $sig: obj.signature, $owner: obj.owner, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["sig"] = obj.signature;
      where_obj["owner"] = obj.owner;
    } else if (obj.signature) {
      sql = `SELECT *
             FROM archives
             WHERE archives.sig = $sig ${timestamp_limiting_clause}
             ORDER BY archives.id DESC LIMIT $limit`;
      params = { $sig: obj.signature, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["sig"] = obj.signature;
    } else if (obj.sig && obj.owner) {
      // acceptable variant on signature
      sql = `SELECT * 
             FROM archives
             WHERE archives.sig = $sig
               AND archives.owner = $owner ${timestamp_limiting_clause}
             ORDER BY archives.id DESC LIMIT $limit`;
      params = { $sig: obj.sig, $owner: obj.owner, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["sig"] = obj.sig;
      where_obj["owner"] = obj.owner;
    } else if (obj.sig) {
      sql = `SELECT * 
             FROM archives
             WHERE archives.sig = $sig ${timestamp_limiting_clause}
             ORDER BY archives.id DESC LIMIT $limit`;
      params = { $sig: obj.sig, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["sig"] = obj.sig;
    } else if (obj.field1 && obj.owner) {
      sql = `SELECT *
             FROM archives
             WHERE archives.field1 = $field1
               AND archives.owner = $owner ${timestamp_limiting_clause}
             ORDER BY archives.id DESC LIMIT $limit`;
      params = { $field1: obj.field1, $owner: obj.owner, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["field1"] = obj.field1;
      where_obj["owner"] = obj.owner;
    } else if (obj.field1) {
      sql = `SELECT *
             FROM archives
             WHERE archives.field1 = $field1 ${timestamp_limiting_clause}
             ORDER BY archives.id DESC LIMIT $limit`;
      params = { $field1: obj.field1, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["field1"] = obj.field1;
    } else if (obj.field2 && obj.owner) {
      sql = `SELECT *
             FROM archives
             WHERE archives.field2 = $field2
               AND archives.owner = $owner ${timestamp_limiting_clause}
             ORDER BY archives.id DESC LIMIT $limit`;
      params = { $field2: obj.field2, $owner: obj.owner, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["field2"] = obj.field2;
      where_obj["owner"] = obj.owner;
    } else if (obj.field2) {
      sql = `SELECT *
             FROM archives
             WHERE archives.field2 = $field2 ${timestamp_limiting_clause}
             ORDER BY archives.id DESC LIMIT $limit`;
      params = { $field2: obj.field2, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["field2"] = obj.field2;
    } else if (obj.field3 && obj.owner) {
      sql = `SELECT *
             FROM archives
             WHERE archives.field3 = $field3
               AND archives.owner = $owner ${timestamp_limiting_clause}
             ORDER BY archives.id DESC LIMIT $limit`;
      params = { $field3: obj.field3, $owner: obj.owner, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["field3"] = obj.field3;
      where_obj["owner"] = obj.owner;
    } else if (obj.field3) {
      sql = `SELECT *
             FROM archives
             WHERE archives.field3 = $field3 ${timestamp_limiting_clause}
             ORDER BY archives.id DESC LIMIT $limit`;
      params = { $field3: obj.field3, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["field3"] = obj.field3;
    } else if (obj.owner) {
      sql = `SELECT *
             FROM archives
             WHERE archives.owner = $owner ${timestamp_limiting_clause}
             ORDER BY archives.id DESC LIMIT $limit`;
      params = { $owner: obj.owner, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["owner"] = obj.owner;
    } else if (obj.publicKey) {
      sql = `SELECT *
             FROM archives
             WHERE archives.publickey = $publickey ${timestamp_limiting_clause}
             ORDER BY archives.id DESC LIMIT $limit`;
      params = { $publickey: obj.publicKey, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["publicKey"] = obj.publicKey;
    }

    //
    // browsers handle with localDB search
    //
    if (this.app.BROWSER) {
      rows = await this.localDB.select({
        from: "archives",
        where: where_obj,
        order: { by: "id", type: "desc" },
        limit,
      });
    }

    //
    // FILTER FOR TXS
    //
    if (rows?.length > 0) {
      for (let i = 0; i < rows.length; i++) {
        //
        // Shouldn't we return all the metadata too?
        //
        txs.push({ tx: rows[i].tx });
      }
    }

    return txs;
  }

  ////////////
  // delete //
  ////////////
  //
  // Our Requests:
  //
  // - users can delete any transactions they OWN
  // - server operator can delete any transactions anytime
  // - server operator respectfully avoid deleting transactions with preserve=1
  //
  async deleteTransaction(tx) {
    let sql = "";
    let params = {};
    let rows = [];
    let timestamp_limiting_clause = "";
    let where_obj = {};

    //
    // SEARCH BASED ON CRITERIA PROVIDED
    //
    sql = `DELETE FROM archives WHERE archives.sig = $sig`;
    params = { $sig: tx.transaction.sig };
    await this.app.storage.executeDatabase(sql3, params3, "archive");

    return;
  }

  ////////////
  // delete //
  ////////////
  //
  // Our Rules:
  //
  // - users can delete any transactions they OWN
  // - server operator can delete any transactions anytime
  // - server operator respectfully avoid deleting transactions with preserve=1
  //
  async deleteTransactions(obj = {}) {
    let txs = [];
    let sql = "";
    let params = {};
    let rows = [];
    let timestamp_limiting_clause = "";
    let where_obj = {};

    if (obj.created_later_than) {
      timestamp_limiting_clause = " AND archives.created_at > " + parseInt(obj.created_later_than);
      where_obj = { created_at: { ">": parseInt(obj.created_later_than) } };
    }
    if (obj.created_earlier_than) {
      timestamp_limiting_clause =
        " AND archives.created_at < " + parseInt(obj.created_earlier_than);
      where_obj = { created_at: { "<": parseInt(obj.created_earlier_than) } };
    }
    if (obj.updated_later_than) {
      timestamp_limiting_clause = " AND archives.updated_at > " + parseInt(obj.updated_later_than);
      where_obj = { updated_at: { ">": parseInt(obj.updated_later_than) } };
    }
    if (obj.updated_earlier_than) {
      timestamp_limiting_clause =
        " AND archives.updated_at < " + parseInt(obj.updated_earlier_than);
      where_obj = { updated_at: { "<": parseInt(obj.updated_earlier_than) } };
    }

    //
    // SEARCH BASED ON CRITERIA PROVIDED
    //

    /*
      This is set up as an OR condition, can provide multiple fields to delete any partial match
    */

    if (obj.field1) {
      sql = `DELETE FROM archives WHERE archives.field1 = $field1 ${timestamp_limiting_clause}`;
      params = { $field1: obj.field1, $limit: limit };
      await this.app.storage.executeDatabase(sql, params, "archive");
    }
    if (obj.field2) {
      sql = `DELETE FROM archives WHERE archives.field2 = $field2 ${timestamp_limiting_clause}`;
      params = { $field2: obj.field2, $limit: limit };
      await this.app.storage.executeDatabase(sql, params, "archive");
    }
    if (obj.field3) {
      sql = `DELETE FROM archives WHERE archives.field3 = $field3 ${timestamp_limiting_clause}`;
      params = { $field3: obj.field3, $limit: limit };
      await this.app.storage.executeDatabase(sql, params, "archive");
    }
    if (obj.owner) {
      sql = `DELETE FROM archives WHERE archives.owner = $owner ${timestamp_limiting_clause}`;
      params = { $owner: obj.owner, $limit: limit };
      await this.app.storage.executeDatabase(sql, params, "archive");
    }
    if (obj.publickey) {
      sql = `DELETE FROM archives WHERE archives.publickey = $publickey ${timestamp_limiting_clause}`;
      params = { $publickey: obj.publickey, $limit: limit };
      await this.app.storage.executeDatabase(sql, params, "archive");
    }
    if (obj.sig) {
      sql = `DELETE FROM archives WHERE archives.sig = $sig ${timestamp_limiting_clause}`;
      params = { $sig: obj.sig, $limit: limit };
      await this.app.storage.executeDatabase(sql, params, "archive");
    }

    return;
  }

  //
  // Pruning
  //
  // the Archive module stores two types of transactions:
  //
  // - blockchain transactions (no owner)
  // - saved user transactions (owner)
  //
  // we want to keep a copy of all blockchain transactions for about a month and then
  // prune them automatically since they can be restored by parsing the chain as needed
  // but should not be needed.
  //
  // users will submit requests to save-and-update copies of the transactions that affect
  // them, and this has the potential to place a greater load on the server. for this
  // reason, we have a harder limit for these transactions, and will delete them after
  // 2,000 transactions or once they are older than 3 weeks.
  //
  // modules that save data can decide which transactions to keep and which ones to
  // delete based on internal transaction logic. we will respectfully avoid deleting any
  // transactions that users have marked as prune = false, although this may change in
  // the future if it is abused.
  //
  async onNewBlock() {
    let x = Math.random();
    // 90% of blocks don't try to delete anything
    if (x < 0.9) {
      return;
    }

    console.log("$");
    console.log("$");
    console.log("$");
    console.log("$ PURGING ARCHIVE BLOCK");
    console.log("$");
    console.log("$");
    console.log("$");

    let ts = new Date().getTime() - this.prune_public_ts;

    //
    // delete public blockchain transactions
    //
    let sql = `DELETE FROM archives WHERE owner = "" AND updated_at < $ts AND preserve = 0`;
    let params = { $ts: ts };
    await this.app.storage.executeDatabase(sql, params, "archive");

    //
    // delete private transactions
    //
    ts = new Date().getTime() - this.prune_private_ts;
    sql = `DELETE FROM archives WHERE owner != "" AND updated_at < $ts AND preserve = 0`;
    params = { $ts: ts };
    await this.app.storage.executeDatabase(sql, params, "archive");

    x = Math.random();
    // 90% of prunings don't vacuum
    if (x < 0.9) {
      return;
    }

    let sql5 = "VACUUM archives";
    let params5 = {};
    await this.app.storage.executeDatabase(sql5, params5, "archive");
  }

  //////////////////////////
  // listen to everything //
  //////////////////////////
  shouldAffixCallbackToModule() {
    return 1;
  }

  ///////////////
  // save/load //
  ///////////////
  load() {
    if (this.app.options.archive) {
      this.archive = this.app.options.archive;
    } else {
      this.archive = {};
      this.archive.index_blockchain = 0;
      if (this.app.BROWSER == 0) {
        this.archive.index_blockchain = 1;
      }
      this.save();
    }
  }

  save() {
    this.app.options.archive = this.archive;
    this.app.storage.saveOptions();
  }

  async onWalletReset(nuke) {
    await super.onWalletReset(nuke);
    if (nuke && this.localDB) {
      await this.localDB.clear("archives");
    }
    return 1;
  }
}

module.exports = Archive;
