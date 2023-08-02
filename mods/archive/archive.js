const ModTemplate = require("../../lib/templates/modtemplate");
const saito = require("../../lib/saito/saito");
const JsStore = require("jsstore");
const JSON = require("json-bigint");

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
    this.load();

    if (app.BROWSER) {
      //
      //Create Local DB schema
      //
      let archives = {
        name: "archives",
        columns: {
          id: { primaryKey: true, autoIncrement: true },
          tx_id: {dataType: "number"},
          user_id: {dataType: "number", default: 0},
          publickey: {dataType: "string", default: ""},
          owner: {dataType: "string", default: ""},
          sig: {dataType: "string", default: ""},
          field1: {dataType: "string", default: ""},
          field2: {dataType: "string", default: ""},
          field3: {dataType: "string", default: ""},
          block_id: {dataType: "number", default: 0},
          block_hash: {dataType: "string", default: ""},
          created_at: {dataType: "number", default: 0},
          updated_at: {dataType: "number", default: 0},
          preserve: {dataType: "number", default: 0},
        },
      };

      let txs = {
        name: "txs",
        columns: {
          id: { primaryKey: true, autoIncrement: true },
          tx: { dataType: "string", unique: true },
        },
      };

      let db = {
        name: "archive_db",
        tables: [archives, txs],
      };

      var isDbCreated = await this.localDB.initDb(db);

      if (isDbCreated) {
        console.log("Db Created & connection is opened");
      } else {
        console.log("Connection is opened");
      }
    }
  }

  returnServices() {
    let services = [];
    if (this.app.BROWSER == 0) {
      services.push({ service: "archive" });
    }
    return services;
  }

  //
  // by default we just save everything that is an application
  //
  onConfirmation(blk, tx, conf, app) {
    //
    // save all on-chain transactions -- but only the service node...
    //
    if (conf == 0 && this.archive.index_blockchain == 1) {
    //if (conf == 0) {

      let block_id = 0;
      let block_hash = "";

      if (blk.block.id) {
        block_id = blk.block.id;
      }
      if (blk.returnHash()) {
        block_hash = blk.returnHash();
      }

      this.saveTransaction(tx, { block_id, block_hash }, 1);
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

    var txs;
    var response = {};

    //
    // saves TX containing archive insert instruction
    //
    if (req.request === "archive") {
      if (req.data.request === "delete") {
        let newtx = new saito.default.transaction(req.data.tx.transaction);
        this.deleteTransaction(newtx, req.data);
      }
      if (req.data.request === "save") {
        let newtx = new saito.default.transaction(req.data.tx.transaction);
        this.saveTransaction(newtx, req.data);
      }
      if (req.data.request === "update") {
        let newtx = new saito.default.transaction(req.data.tx.transaction);
        this.updateTransaction(newtx, req.data);
      }
      if (req.data.request === "load") {
        let txs = await this.loadTransactions(req.data);
        mycallback(txs);
        return;
      }
    }

    super.handlePeerTransaction(app, tx, peer, mycallback);
  }

  //////////
  // save //
  //////////
  async saveTransaction(tx, obj = {}, onchain = 0) {

    let newObj = {};

    newObj.user_id   = obj?.user_id || 0;    //What is this supposed to be
    newObj.publickey = obj?.publickey || tx.transaction.from[0].add;
    newObj.owner     = obj?.owner || "";
    newObj.sig       = obj?.sig || tx.transaction.sig;
    //Field1-3 are set by default in app.storage
    newObj.field1    = obj?.field1 || "";
    newObj.field2    = obj?.field2 || "";
    newObj.field3    = obj?.field3 || "";
    newObj.block_id  = obj?.block_id || 0;
    newObj.block_hash = obj?.block_hash || "";
    newObj.preserve   = obj?.preserve || 0;
    newObj.created_at = obj?.created_at || tx.transaction.ts;
    newObj.updated_at = obj?.updated_at || tx.transaction.ts;

    //
    // insert transaction
    //
    let sql = `INSERT OR IGNORE INTO txs (tx) VALUES ($tx)`;
    let params = { $tx: tx.serialize_to_web(this.app) };
    let tx_id = await this.app.storage.insertDatabase(sql, params, "archive");

    if (this.app.BROWSER){
      let inserted_rows = await this.localDB.insert({
        into: "txs",
        values: [{ tx: tx.serialize_to_web(this.app) }],
        return: true
      });
      tx_id = inserted_rows[0]["id"];
    }
        
    if (!tx_id) {
      return;
    }

    //
    // insert index record
    //
    sql = `INSERT OR IGNORE INTO archives (
      tx_id, 
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
      preserve
    ) VALUES (
      $tx_id, 
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
      $preserve
    )`;
    params = {
      $tx_id: tx_id,
      $publickey: newObj.publickey,
      $owner: newObj.owner,
      $sig: newObj.sig,
      $field1: newObj.field1,
      $field2: newObj.field2,
      $field3: newObj.field3,
      $block_id: newObj.block_id,
      $block_hash: newObj.block_hash,
      $created_at: newObj.created_at,
      $updated_at: newObj.updated_at,
      $preserve: newObj.preserve,
    };

    let archives_id = await this.app.storage.insertDatabase(sql, params, "archive");

    if (this.app.BROWSER){
      newObj.tx_id = tx_id;

      let numRows = await this.localDB.insert({
        into: "archives",
        values: [newObj]
      });

      if (numRows){
        console.log("Local Archive index successfully inserted");
      }
    }
  }

  ////////////
  // update //
  ////////////
  async updateTransaction(tx, obj = {}) {
    //
    // only owner can update
    //
    if (tx.transaction.from[0].add != obj.owner && obj.sig != "") {
      //
      // this may be a transaction that I have saved that was originally from
      // someone else, such as a RedSquare tweet that I have saved because it
      // is a reply or a like.
      //
      // in this situation, we want to update the version of the transaction
      // that we have saved rather than the original version of the transaction
      // that is somewhere on chain.
      //
      console.log("Archive: only owner has the rights to modify records");
      return 0;
    }


    //
    // update records
    //

    let newObj = {};
    newObj.tx_id     = obj?.tx_id || 0;
    newObj.user_id   = obj?.user_id || 0;    //What is this supposed to be
    newObj.publickey = obj?.publickey || "";
    newObj.owner     = obj?.owner || "";
    newObj.sig       = obj?.sig || "";
    //Field1-3 are set by default in app.storage
    newObj.field1    = obj?.field1 || "";
    newObj.field2    = obj?.field2 || "";
    newObj.field3    = obj?.field3 || "";
    newObj.block_id  = obj?.block_id || 0;
    newObj.block_hash = obj?.block_hash || "";
    newObj.preserve   = obj?.preserve || 0;
    newObj.updated_at = new Date().getTime();

    //
    // find entries to update
    //
    let sql = `SELECT id , tx_id FROM archives WHERE owner = $owner AND sig = $sig`;
    let params = { $owner: newObj.owner, $sig: newObj.sig };
    let rows = await this.app.storage.queryDatabase(sql, params, "archive");

    if (this.app.BROWSER){
      rows = await this.localDB.select({
        from: "archives",
        where: {
          owner: newObj.owner,
          sig: newObj.sig
        }
      });
    }

    if (!rows?.length) {
      return;
    }

    let id = rows[0].id;
    let tx_id = rows[0].tx_id;

    //
    // update index
    //
    sql = `UPDATE archives SET updated_at = $updated_at , owner = $owner , preserve = $preserve WHERE id = $id AND sig = $sig`;
    params = {
      $updated_at: newObj.updated_at,
      $owner: newObj.owner,
      $preserve: newObj.preserve,
      $id: id,
      $sig: newObj.sig,
    };
    await this.app.storage.executeDatabase(sql, params, "archive");

    if (this.app.BROWSER){
      await this.localDB.update({
        in: "archives",
        set: {
          updated_at: newObj.updated_at,
          owner: newObj.owner,
          preserve: newObj.preserve
        },
        where: {
          id: id,
          sig: newObj.sig
        }
      });
    }

    //
    // update tx
    //
    sql = `UPDATE txs SET tx = $tx WHERE id = $tx_id`;
    params = {
      $tx_id: tx_id,
      $tx: tx.serialize_to_web(this.app),
    };

    await this.app.storage.executeDatabase(sql, params, "archive");

    if (this.app.BROWSER){
      await this.localDB.update({
        in: "txs",
        set: { tx: tx.serialize_to_web(this.app) },
        where: { id: tx_id }
      });
    }

    return 1;
  }

  //////////
  // load //
  //////////
  async loadTransactionsWithCallback(obj = {}, callback = null){
    let txs = await this.loadTransactions(obj);
    if (callback){
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
      where_obj = {created_at: { '>': parseInt(obj.created_later_than)}};
    }
    if (obj.created_earlier_than) {
      timestamp_limiting_clause = " AND created_at < " + parseInt(obj.created_earlier_than);
      where_obj = {created_at: { '<': parseInt(obj.created_earlier_than)}};
    }
    if (obj.updated_later_than) {
      timestamp_limiting_clause = " AND updated_at > " + parseInt(obj.updated_later_than);
      where_obj = {updated_at: { '>': parseInt(obj.updated_later_than)}};
    }
    if (obj.updated_earlier_than) {
      timestamp_limiting_clause = " AND updated_at < " + parseInt(obj.updated_earlier_than);
      where_obj = {updated_at: { '<': parseInt(obj.updated_earlier_than)}};
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
    //
    if (obj.field1) {
      sql = `SELECT * FROM archives JOIN txs WHERE archives.field1 = $field1 AND txs.id = archives.tx_id ${timestamp_limiting_clause} ORDER BY archives.id DESC LIMIT $limit`;
      params = { $field1: obj.field1, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["field1"] = obj.field1;
    }
    if (obj.field2) {
      sql = `SELECT * FROM archives JOIN txs WHERE archives.field2 = $field2 AND txs.id = archives.tx_id ${timestamp_limiting_clause} ORDER BY archives.id DESC LIMIT $limit`;
      params = { $field2: obj.field2, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["field2"] = obj.field2;
    }
    if (obj.field3) {
      sql = `SELECT * FROM archives JOIN txs WHERE archives.field3 = $field3 AND txs.id = archives.tx_id ${timestamp_limiting_clause} ORDER BY archives.id DESC LIMIT $limit`;
      params = { $field3: obj.field3, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["field3"] = obj.field3;
    }
    if (obj.owner) {
      sql = `SELECT * FROM archives JOIN txs WHERE archives.owner = $owner AND txs.id = archives.tx_id ${timestamp_limiting_clause} ORDER BY archives.id DESC LIMIT $limit`;
      params = { $owner: obj.owner, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["owner"] = obj.owner;
    }
    if (obj.publickey) {
      sql = `SELECT * FROM archives JOIN txs WHERE archives.publickey = $publickey AND txs.id = archives.tx_id ${timestamp_limiting_clause} ORDER BY archives.id DESC LIMIT $limit`;
      params = { $publickey: obj.publickey, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["publickey"] = obj.publickey;
    }
    if (obj.sig) {
      sql = `SELECT * FROM archives JOIN txs WHERE archives.sig = $sig AND txs.id = archives.tx_id ${timestamp_limiting_clause} ORDER BY archives.id DESC LIMIT $limit`;
      params = { $sig: obj.sig, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["sig"] = obj.sig;
    }

    if (this.app.BROWSER){
      rows = await this.localDB.select({
                          from: "archives",
                          where: where_obj,
                          join: {
                            with: "txs",
                            on: "archives.tx_id=txs.id",
                            type: "inner",
                            as: { id: "tid" }
                          },
                          order: { by: "archives.id", type: "desc" },
                          limit
                        });
    }

    //
    // FILTER FOR TXS
    //
    if (rows != undefined) {
      if (rows.length > 0) {
        for (let i = 0; i < rows.length; i++) {
          txs.push({ tx: rows[i].tx });
        }
      }
    }

    return txs;
  }

  ////////////
  // delete //
  ////////////
  //
  // Our Rules:
  //
  // - users can delete any transactions they OWN
  // - server operator can delete any transactions anytime
  // - server operator will respectfully not delete transaction with preserve=1
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
    sql = `SELECT * FROM archives WHERE archives.sig = $sig`;
    params = { $sig: tx.transaction.sig };
    rows = await this.app.storage.queryDatabase(sql, params, "archive");

    if (rows.length > 0) {

      let archives_id = rows[0].id;
      let tx_id = rows[0].tx_id;

      let sql2 = "DELETE FROM archives WHERE id = $id";
      let params2 = { $id : archives_id };
      await this.app.storage.executeDatabase(sql2, params2);

      let sql3 = "DELETE FROM txs WHERE id = $id";
      let params3 = { $id : txs_id };
      await this.app.storage.executeDatabase(sql3, params3);

    }

    if (this.app.BROWSER) {
alert("delete request for single transaction in browser - unimplemented");
    }

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
  // - server operator will respectfully not delete transaction with preserve=1
  //
  async deleteTransactions(obj = {}) {

    let txs = [];
    let sql = "";
    let params = {};
    let rows = [];
    let timestamp_limiting_clause = "";
    let where_obj = {};

    if (obj.created_later_than) {
      timestamp_limiting_clause = " AND created_at > " + parseInt(obj.created_later_than);
      where_obj = {created_at: { '>': parseInt(obj.created_later_than)}};
    }
    if (obj.created_earlier_than) {
      timestamp_limiting_clause = " AND created_at < " + parseInt(obj.created_earlier_than);
      where_obj = {created_at: { '<': parseInt(obj.created_earlier_than)}};
    }
    if (obj.updated_later_than) {
      timestamp_limiting_clause = " AND updated_at > " + parseInt(obj.updated_later_than);
      where_obj = {updated_at: { '>': parseInt(obj.updated_later_than)}};
    }
    if (obj.updated_earlier_than) {
      timestamp_limiting_clause = " AND updated_at < " + parseInt(obj.updated_earlier_than);
      where_obj = {updated_at: { '<': parseInt(obj.updated_earlier_than)}};
    }

    //
    // SEARCH BASED ON CRITERIA PROVIDED
    //
    if (obj.field1) {
      sql = `SELECT * FROM archives JOIN txs WHERE archives.field1 = $field1 AND txs.id = archives.tx_id ${timestamp_limiting_clause} ORDER BY archives.id DESC`;
      params = { $field1: obj.field1, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["field1"] = obj.field1;
    }
    if (obj.field2) {
      sql = `SELECT * FROM archives JOIN txs WHERE archives.field2 = $field2 AND txs.id = archives.tx_id ${timestamp_limiting_clause} ORDER BY archives.id DESC`;
      params = { $field2: obj.field2, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["field2"] = obj.field2;
    }
    if (obj.field3) {
      sql = `SELECT * FROM archives JOIN txs WHERE archives.field3 = $field3 AND txs.id = archives.tx_id ${timestamp_limiting_clause} ORDER BY archives.id DESC`;
      params = { $field3: obj.field3, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["field3"] = obj.field3;
    }
    if (obj.owner) {
      sql = `SELECT * FROM archives JOIN txs WHERE archives.owner = $owner AND txs.id = archives.tx_id ${timestamp_limiting_clause} ORDER BY archives.id DESC`;
      params = { $owner: obj.owner, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["owner"] = obj.owner;
    }
    if (obj.publickey) {
      sql = `SELECT * FROM archives JOIN txs WHERE archives.publickey = $publickey AND txs.id = archives.tx_id ${timestamp_limiting_clause} ORDER BY archives.id DESC`;
      params = { $publickey: obj.publickey, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["publickey"] = obj.publickey;
    }
    if (obj.sig) {
      sql = `SELECT * FROM archives JOIN txs WHERE archives.sig = $sig AND txs.id = archives.tx_id ${timestamp_limiting_clause} ORDER BY archives.id DESC LIMI`;
      params = { $sig: obj.sig, $limit: limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
      where_obj["sig"] = obj.sig;
    }

    if (this.app.BROWSER){
alert("delete transactions for localDB not implemented in browser...");
    }

    //
    // FILTER FOR TXS
    //
    if (rows != undefined) {
      if (rows.length > 0) {
        for (let i = 0; i < rows.length; i++) {

          let archives_id = rows[i].id;
          let tx_id = rows[i].tx_id;

          let sql2 = "DELETE FROM archives WHERE id = $id";
          let params2 = { $id : archives_id };
          await this.app.storage.executeDatabase(sql2, params2);

          let sql3 = "DELETE FROM txs WHERE id = $id";
          let params3 = { $id : txs_id };
          await this.app.storage.executeDatabase(sql3, params3);
	
        }
      }
    }

    return;

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

    if (nuke && this.localDB) {
      await this.localDB.clear("archives");
      await this.localDB.clear("txs");
    }
    return 1;
  }
}

module.exports = Archive;

