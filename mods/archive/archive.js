const ModTemplate = require('../../lib/templates/modtemplate');
const JSON = require('json-bigint');

class Archive extends ModTemplate {

  constructor(app) {

    super(app);
    this.name = "Archive";
    this.description = "Supports the saving and serving of network transactions";
    this.categories = "Utilities Core";

    this.events = [];

    this.description = "A tool for storing transactions for asynchronous retreival.";
    this.categories  = "Utilities";

    this.last_clean_on = Date.now();
    this.cleaning_period_in_ms = 1000000;

  }



  onConfirmation(blk, tx, conf, app) {

    let txmsg = tx.returnMessage();

    //
    // by default we just save everything that is an application
    //
    if (conf == 0) {
      if (tx.msg.module != "") {
        this.saveTransaction(tx);
      }
    }
  }




  async handlePeerRequest(app, req, peer, mycallback) {

    if (req.request == null) { return; }
    if (req.data == null) { return; }

    var txs;
    var response = {};
    //
    // only handle archive request
    //
    if (req.request === "archive") {
      if (req.data.request === "delete") {
        this.deleteTransaction(req.data.tx, req.data.publickey, req.data.sig);
      }
      if (req.data.request === "save") {
        this.saveTransaction(req.data.tx, req.data.type);
      }
      if (req.data.request === "update") {
        this.updateTransaction(req.data.tx);
      }
      if (req.data.request === "save_key") {
        if (!req.data.key) { return; }
        this.saveTransactionByKey(req.data.key, req.data.tx, req.data.type);
      }
      if (req.data.request === "update_optional") {
        if (!req.data.optional) { return; }
        this.updateTransactionOptional(req.data.sig, req.data.publickey, req.data.optional);
      }
      if (req.data.request === "update_optional_value") {
        if (!req.data.optional) { return; }
        this.updateTransactionOptionalValue(req.data.sig, req.data.publickey, req.data.optional_key, req.data.optional_value);
      }
      if (req.data.request === "increment_optional_value") {
        if (!req.data.optional) { return; }
        this.incrementTransactionOptionalValue(req.data.sig, req.data.publickey, req.data.optional_key);
      }
      if (req.data.request === "load") {
        let type = "";
        let num  = 50;
        if (req.data.num != "")  { num = req.data.num; }
        if (req.data.type != "") { type = req.data.type; }
        txs = await this.loadTransactions(req.data.publickey, req.data.sig, type, num);
        response.err = "";
        response.txs = txs;
        mycallback(response);
      }
      if (req.data.request === "load_keys") {
        if (!req.data.keys) { return; }
        txs = await this.loadTransactionsByKeys(req.data);
        response.err = "";
        response.txs = txs;
        mycallback(response);
      }
    }

    super.handlePeerRequest(app, req, peer, mycallback);


  }



  async updateTransactionOptional(sig, publickey, optional) {

    let sql = "UPDATE txs SET optional = $optional WHERE sig = $sig AND publickey = $publickey";
    let params = {
        $optional	:	JSON.stringify(optional) ,
        $sig		:	sig ,
        $publickey	:	publickey ,
    };
    await this.app.storage.executeDatabase(sql, params, "archive");

  }


  async updateTransactionOptionalValue(sig, publickey, key, new_value) {

    let sql = "SELECT id, sig, publickey, tx, optional FROM txs WHERE sig = $sig AND publickey = $publickey";
    let params = {
        $sig		:	sig ,
        $publickey	:	publickey ,
    };

    let rows = await this.app.storage.queryDatabase(sql, params, "archive");
    if (rows != undefined) {
      if (rows.length > 0) {
	for (let i = 0; i < rows.length; i++) {

          let optional = JSON.parse(rows[i].optional);
	  if (!optional) { optional = {}; }
	  optional[key] = new_value;
	  await this.updateTransactionOptional(rows[i].sig, rows[i].publickey, optional);
        }
      }
    }
  }



  async incrementTransactionOptionalValue(sig, publickey, key) {

    let sql = "SELECT id, sig, publickey, tx, optional FROM txs WHERE sig = $sig AND publickey = $publickey";
    let params = {
        $sig		:	sig ,
        $publickey	:	publickey ,
    };

    let rows = await this.app.storage.queryDatabase(sql, params, "archive");
    if (rows != undefined) {
      if (rows.length > 0) {
	for (let i = 0; i < rows.length; i++) {

          let optional = JSON.parse(rows[i].optional);
	  if (!optional) { optional = {}; }
	  if (!optional[key]) { optional[key] = 0; }
	  optional[key]++;
	  await this.updateTransactionOptional(rows[i].sig, rows[i].publickey, optional);
        }
      }
    }
  }





  async updateTransactionOptional(sig="", publickey="", optional="") {

    if (sig === "" || publickey === "" || optional === "") { return; }

    let sql = "";
    let params = {};

    sql = "UPDATE txs SET optional = $optional WHERE sig = $sig AND publickey = $publickey";
    params = {
      $sig		:	sig ,
      $publickey	:	publickey ,
      $optional		:	JSON.stringify(optional) ,
    };
    await this.app.storage.executeDatabase(sql, params, "archive");

  }


  async saveTransaction(tx=null, msgtype="") {

    if (tx == null) { return; }

    let sql = "";
    let params = {};
    let optional = {};
    if (tx.optional) { optional = tx.optional; }

    for (let i = 0; i < tx.transaction.to.length; i++) {
      sql = "INSERT OR IGNORE INTO txs (sig, publickey, tx, optional, ts, type) VALUES ($sig, $publickey, $tx, $optional, $ts, $type)";
      params = {
        $sig		:	tx.transaction.sig ,
        $publickey	:	tx.transaction.to[i].add ,
        $tx		:	JSON.stringify(tx.transaction) ,
        $optional	:	JSON.stringify(optional) ,
        $ts		:	tx.transaction.ts ,
        $type		:	msgtype
      };
      await this.app.storage.executeDatabase(sql, params, "archive");
    }

    //
    // TODO:
    //
    // sanity check that we want to be saving this for the FROM fields
    //
    for (let i = 0; i < tx.transaction.from.length; i++) {
      sql = "INSERT OR IGNORE INTO txs (sig, publickey, tx, optional, ts, type) VALUES ($sig, $publickey, $tx, $optional, $ts, $type)";
      params = {
        $sig		:	tx.transaction.sig ,
        $publickey	:	tx.transaction.from[i].add ,
        $tx		:	JSON.stringify(tx.transaction) ,
        $optional	:	JSON.stringify(optional) ,
        $ts		:	tx.transaction.ts ,
        $type		:	msgtype
      };
      await this.app.storage.executeDatabase(sql, params, "archive");
    }

    //
    // prune periodically
    //
    if ((Date.now() - this.last_clean_on) >= this.cleaning_period_in_ms) { await this.pruneOldTransactions(); }
  }



  async updateTransaction(tx=null) {

    if (tx == null) { return; }

    let sql = "";
    let params = {};
    let optional = {};
    if (tx.optional) { optional = tx.optional; }

    for (let i = 0; i < tx.transaction.to.length; i++) {
      sql = "UPDATE txs SET tx = $tx WHERE sig = $sig AND publickey = $publickey";
      params = {
        $tx		:	JSON.stringify(tx.transaction) ,
        $sig		:	tx.transaction.sig ,
        $publickey	:	tx.transaction.to[i].add ,
        $optional	:	JSON.stringify(optional) ,
      };
      await this.app.storage.executeDatabase(sql, params, "archive");
    }
    for (let i = 0; i < tx.transaction.from.length; i++) {
      sql = "UPDATE txs SET tx = $tx WHERE sig = $sig AND publickey = $publickey";
      params = {
        $tx		:	JSON.stringify(tx.transaction) ,
        $sig		:	tx.transaction.sig ,
        $publickey	:	tx.transaction.from[i].add ,
        $optional	:	JSON.stringify(optional) ,
      };
      await this.app.storage.executeDatabase(sql, params, "archive");
    }
  }



  async pruneOldTransactions() {
    console.debug("archive.pruneOldTransactions");
    this.last_clean_on = Date.now();

    let ts = (new Date().getTime()) - 100000000;
    let sql = "DELETE FROM txs WHERE ts < $ts AND type = $type";
    let params = {
        $ts		:	ts ,
        $type		:	"Chat"
    };
    await this.app.storage.executeDatabase(sql, params, "archive");
  }


  async saveTransactionByKey(key="", tx=null, msgtype="") {

    if (tx == null) { return; }
    let optional = {};
    if (tx.optional) { optional = tx.optional; }

    let sql = "INSERT OR IGNORE INTO txs (sig, publickey, tx, optional, ts, type) VALUES ($sig, $publickey, $tx, $optional, $ts, $type)";
    let params = {
      $sig:		tx.transaction.sig ,
      $publickey:	key,
      $tx:		JSON.stringify(tx.transaction),
      $optional: 	optional,
      $ts:		tx.transaction.ts,
      $type:		msgtype
    };
    await this.app.storage.executeDatabase(sql, params, "archive");

    //
    // prune periodically
    //
    if ((Date.now() - this.last_clean_on) >= this.cleaning_period_in_ms) { await this.pruneOldTransactions(); }

  }


  async deleteTransaction(tx=null, authorizing_publickey="", authorizing_sig="") {

    if (tx == null) { return; }

    //
    // the individual requesting deletion should sign the transaction.sig with their own
    // privatekey. this provides a sanity check on ensuring that the right message is
    // deleted
    //
    if (this.app.crypto.verifyMessage(("delete_"+tx.transaction.sig), authorizing_sig, authorizing_publickey)) {

      let sql = "DELETE FROM txs WHERE publickey = $publickey AND sig = $sig";
      let params = {
        $sig		:	tx.transaction.sig ,
        $publickey	:	authorizing_publickey
      };

      await this.app.storage.executeDatabase(sql, params, "archive");

    }
  }


  async loadTransactions(publickey, sig, type, num) {

    let sql = "";
    let params = {};

    if (type === "all") {
      sql = "SELECT * FROM txs WHERE publickey = $publickey ORDER BY id DESC LIMIT $num";
      params = { $publickey : publickey , $num : num};
    } else {
      sql = "SELECT * FROM txs WHERE publickey = $publickey AND type = $type ORDER BY id DESC LIMIT $num";
      params = { $publickey : publickey , $type : type , $num : num};
    }

    let rows = await this.app.storage.queryDatabase(sql, params, "archive");
    let txs = [];

    if (rows != undefined) {
      if (rows.length > 0) {
	for (let i = 0; i < rows.length; i++) {
          txs.push({ tx : rows[i].tx , optional : rows[i].optional });
        }
      }
    }
    return txs;

  }


  async loadTransactionsByKeys({keys=[], type='all', num=50}) {
    let sql = "";
    let params = {};

    let count = 0;
    let paramkey = '';
    let where_statement_array = [];

    try {

      keys.forEach(key => {
        paramkey = `$key${count}`;
        where_statement_array.push(paramkey);
        params[paramkey] =  key;
        count++;
      });

      if (type === "all") {
        sql = `SELECT * FROM txs WHERE publickey IN ( ${where_statement_array.join(',')} ) ORDER BY id DESC LIMIT $num`;
        params = Object.assign(params, { $num : num });
      } else {
        sql = `SELECT * FROM txs WHERE publickey IN ( ${where_statement_array.join(',')} ) AND type = $type ORDER BY id DESC LIMIT $num`;
        params = Object.assign(params, { $type : type , $num : num});
      }
    } catch(err) {
      console.log(err);
    }

    try {
      let rows = await this.app.storage.queryDatabase(sql, params, "archive");
      let txs = [];
      if (rows != undefined) {
	if (rows.length > 0) {
          txs.push({ tx : row.tx , optional : row.optional });
        }
      }
      return txs;
    } catch (err) {
      console.log(err);
    }

  }

}


module.exports = Archive;

