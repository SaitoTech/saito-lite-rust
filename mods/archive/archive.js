const ModTemplate = require("../../lib/templates/modtemplate");
const saito = require("../../lib/saito/saito");
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

    //
    // settings
    //
    this.archive = {};
    this.archive.index_blockchain = 0;
    if (this.app.BROWSER == 0) { this.archive.index_blockchain = 1; }

  }


  initialize(app) {
    //this.load();
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
    // save all on-chain transactions
    //
    //if (conf == 0 && this.archive.index_blockchain == 1) {
    if (conf == 0) {
      let txmsg = tx.returnMessage();

      let block_id = 0;
      let block_hash = "";

      if (blk.block.id) {
         block_id = blk.block.id;
      }
      if (blk.returnHash()) {
         block_hash = blk.returnHash();
      }

      this.saveTransaction(tx, { block_id : block_id , block_hash : block_hash }, 1);

    }

  }


  async handlePeerTransaction(app, tx = null, peer, mycallback) {

    if (tx == null) { return; }
    let req = tx.returnMessage();
    if (req.request == null) { return; }
    if (req.data == null) { return; }

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
  async saveTransaction(tx, obj = {} , onchain = 0) {

    if (!obj.tx_id) 		{ obj.tx_id = ""; }
    if (!obj.publickey) 	{ obj.publickey = ""; }
    if (!obj.owner) 		{ obj.owner = ""; }
    if (!obj.sig) 		{ obj.sig = ""; }
    if (!obj.field1) 		{ obj.field1 = ""; }
    if (!obj.field2) 		{ obj.field2 = ""; }
    if (!obj.field3) 		{ obj.field3 = ""; }
    if (!obj.block_id) 		{ obj.block_id = ""; }
    if (!obj.block_hash) 	{ obj.block_hash= ""; }
    if (!obj.preserve) 		{ obj.preserve = ""; }
    if (!obj.created_at) 	{ obj.created_at = tx.transaction.ts; }
    if (!obj.updated_at)        { new Date().getTime(); }
    obj.updated_at = new Date().getTime();

    //
    // insert transaction
    //
    let sql = `INSERT OR IGNORE INTO txs (tx) VALUES ($tx)`;
    let params = { $tx: tx.serialize_to_web(this.app) };
    let tx_id = await this.app.storage.insertDatabase(sql, params, "archive");

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
      $tx_id : tx_id ,
      $publickey : obj.publickey ,
      $owner :  obj.owner ,
      $sig :  obj.sig ,
      $field1 : obj.field1 ,
      $field2 : obj.field2 ,
      $field3 : obj.field3 ,
      $block_id : obj.block_id ,
      $block_hash :  obj.block_hash ,
      $created_at : obj.created_at ,
      $updated_at :  obj.updated_at ,
      $preserve : obj.preserve
    }

    let archives_id = await this.app.storage.insertDatabase(sql, params, "archive");

  }


  ////////////
  // update //
  ////////////
  async updateTransaction(tx, obj={}) {

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
    if (!obj.tx_id) 		{ obj.tx_id = ""; }
    if (!obj.publickey) 	{ obj.publickey = ""; }
    if (!obj.owner) 		{ obj.owner = ""; }
    if (!obj.sig) 		{ obj.sig = ""; }
    if (!obj.field1) 		{ obj.field1 = ""; }
    if (!obj.field2) 		{ obj.field2 = ""; }
    if (!obj.field3) 		{ obj.field3 = ""; }
    if (!obj.block_id) 		{ obj.block_id = ""; }
    if (!obj.block_hash) 	{ obj.block_hash= ""; }
    if (!obj.preserve) 		{ obj.preserve = ""; }
    obj.updated_at = new Date().getTime();

    //
    // find entries to update
    //
    let sql = `SELECT id , tx_id FROM archives WHERE owner = $owner AND sig = $sig`;
    let params = { $owner : obj.owner , $sig : obj.sig };
    let rows = await this.app.storage.queryDatabase(sql, params, "archive");
    if (!rows?.length) { return; }

    let id  	= rows[0].id;
    let tx_id 	= rows[0].tx_id;

    //
    // update index
    //
    sql = `UPDATE archives SET updated_at = $updated_at , owner = $owner , preserve = $preserve WHERE id = $id AND sig = $sig`;
    params = {
      $updated_at : obj.updated_at ,
      $owner :  obj.owner ,
      $preserve : obj.preserve ,
      $id : id ,
      $sig :  obj.sig ,
    }
    await this.app.storage.executeDatabase(sql, params, "archive");
    
    //
    // update tx
    //
    sql = `UPDATE txs SET tx = $tx WHERE id = $tx_id`;
    params = {
      $tx_id : tx_id ,
      $tx :  tx.serialize_to_web(this.app)
    }
    await this.app.storage.executeDatabase(sql, params, "archive");

    return 1;
 
  }


  //////////
  // load //
  //////////
  async loadTransactions(obj={}) {

    let limit = 10;
    let txs = [];
    let sql = "";
    let params = {};
    let rows = [];
    let timestamp_limiting_clause = "";

    if (obj.created_later_than)   { timestamp_limiting_clause = " AND created_at > " + parseInt(obj.created_later_than); }
    if (obj.created_earlier_than) { timestamp_limiting_clause = " AND created_at < " + parseInt(obj.created_earlier_than); }
    if (obj.updated_later_than)   { timestamp_limiting_clause = " AND updated_at > " + parseInt(obj.updated_later_than); }
    if (obj.updated_earlier_than) { timestamp_limiting_clause = " AND updated_at < " + parseInt(obj.updated_earlier_than); }

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
      params = { $field1 : obj.field1 , $limit : limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
    }
    if (obj.field2) {
      sql = `SELECT * FROM archives JOIN txs WHERE archives.field2 = $field2 AND txs.id = archives.tx_id ${timestamp_limiting_clause} ORDER BY archives.id DESC LIMIT $limit`;
      params = { $field2 : obj.field2 , $limit : limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
    }
    if (obj.field3) {
      sql = `SELECT * FROM archives JOIN txs WHERE archives.field3 = $field3 AND txs.id = archives.tx_id ${timestamp_limiting_clause} ORDER BY archives.id DESC LIMIT $limit`;
      params = { $field3 : obj.field3 , $limit : limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
    }
    if (obj.owner) {
      sql = `SELECT * FROM archives JOIN txs WHERE archives.owner = $owner AND txs.id = archives.tx_id ${timestamp_limiting_clause} ORDER BY archives.id DESC LIMIT $limit`;
      params = { $owner : obj.owner , $limit : limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
    }
    if (obj.publickey) {
      sql = `SELECT * FROM archives JOIN txs WHERE archives.publickey = $publickey AND txs.id = archives.tx_id ${timestamp_limiting_clause} ORDER BY archives.id DESC LIMIT $limit`;
      params = { $publickey : obj.publickey , $limit : limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
    }
    if (obj.sig) {
      sql = `SELECT * FROM archives JOIN txs WHERE archives.sig = $sig AND txs.id = archives.tx_id ${timestamp_limiting_clause} ORDER BY archives.id DESC LIMIT $limit`;
      params = { $sig : obj.sig , $limit : limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
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
  async deleteTransaction(tx, obj={}) {
  }

  ////////////
  // delete //
  ////////////
  async deleteTransactions(obj={}) {
  }




  //////////////////////////
  // listen to everything //
  //////////////////////////
  shouldAffixCallbackToModule() { return 1; }


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
    
    



}

module.exports = Archive;
