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
      let field1 = "";
      let field2 = "";
      let field3 = "";

      if (blk.block.id) {
         block_id = blk.block.id;
      }
      if (blk.returnHash()) {
         block_hash = blk.returnHash();
      }
      if (txmsg.type) {
        field1 = txmsg.type;
      }
      if (tx.transaction.from.length > 0) {
        field2 = tx.transaction.from[0].add;
      }
      if (tx.transaction.to.length > 0) {
        field3 = tx.transaction.to[0].add;
      }

      this.saveTransaction(tx, { block_id : block_id , block_hash : block_hash , field1 : field1 , field2 : field2, field3 : field3 }, 1);

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
	let newtx = new saito.default.transaction(req.data.tx);
        this.deleteTransaction(newtx, req.data);
      }
      if (req.data.request === "save") {
	let newtx = new saito.default.transaction(req.data.tx);
        this.saveTransaction(newtx, req.data);
      }
      if (req.data.request === "update") {
	let newtx = new saito.default.transaction(req.data.tx);
        this.updateTransaction(newtx, req.data);
      }
      if (req.data.request === "load") {
        let txs = this.loadTransactions(req.data);
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
    if (rows.length < 1) { return; }
    let id  	= rows[0].id;
    let tx_id 	= rows[0].tx_id;

    //
    // update index
    //
    sql = `UPDATE archives SET updated_at = $updated_at , owner = $owner , preserve = $preserve WHERE id = $id AND sig = $sig`;
    params = {
      $updated_at : obj.updated_at ,
      $id : id ,
      $tx_id : tx_id ,
      $owner :  obj.owner ,
      $sig :  obj.sig ,
    }
    await this.app.storage.executeDatabase(sql, params, "archive");
    
    //
    // update tx
    //
    sql = `UPDATE txs SET tx = $tx WHERE tx_id = $tx_id`;
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

    //
    // ACCEPT REASONABLE LIMITS
    //
    if (obj.limit && obj.limit <= 100) { limit = obj.limit; }

    //
    // SEARCH BASED ON CRITERIA PROVIDED
    //
    if (obj.field1) {
      sql = "SELECT * FROM archives JOIN txs WHERE archives.field1 = $field1 AND txs.id = archives.tx_id ORDER BY archives.id DESC LIMIT $limit";
      params = { $field1 : obj.field1 , $limit : limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
    }
    if (obj.field2) {
      sql = "SELECT * FROM archives JOIN txs WHERE archives.field2 = $field2 AND txs.id = archives.tx_id ORDER BY archives.id DESC LIMIT $limit";
      params = { $field2 : obj.field2 , $limit : limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
    }
    if (obj.field3) {
      sql = "SELECT * FROM archives JOIN txs WHERE archives.field3 = $field3 AND txs.id = archives.tx_id ORDER BY archives.id DESC LIMIT $limit";
      params = { $field3 : obj.field3 , $limit : limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
    }
    if (obj.owner) {
      sql = "SELECT * FROM archives JOIN txs WHERE archives.owner = $owner AND txs.id = archives.tx_id ORDER BY archives.id DESC LIMIT $limit";
      params = { $owner : obj.owner , $limit : limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
    }
    if (obj.publickey) {
      sql = "SELECT * FROM archives JOIN txs WHERE archives.publickey = $publickey AND txs.id = archives.tx_id ORDER BY archives.id DESC LIMIT $limit";
      params = { $publickey : obj.publickey , $limit : limit };
      rows = await this.app.storage.queryDatabase(sql, params, "archive");
    }
    if (obj.sig) {
      sql = "SELECT * FROM archives JOIN txs WHERE archives.sig = $sig AND txs.id = archives.tx_id ORDER BY archives.id DESC LIMIT $limit";
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
