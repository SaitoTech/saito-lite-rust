const ModTemplate = require('../../lib/templates/modtemplate');
const saito = require('../../lib/saito/saito');
const JsStore = require('jsstore');
const JSON = require('json-bigint');
const Transaction = require('../../lib/saito/transaction').default;
const PeerService = require('saito-js/lib/peer_service').default;
const ArchiveTemplate = require('./lib/archive.template');
const ArchiveSummary = require('./lib/archive-summary.template');
const SaitoOverlay = require('../../lib/saito/ui/saito-overlay/saito-overlay');
const jsonTree = require('json-tree-viewer');

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

		this.name = 'Archive';
		this.slug = 'archive';
		this.description =
			'Supports the saving and serving of network transactions';
		this.categories = 'Utilities Core';
		this.class = 'utility';
		this.localDB = null;

		this.schema = [
			'id',
			'user_id',
			'publickey',
			'owner',
			'sig',
			'field1',
			'field2',
			'field3',
			'field4',
			'field5',
			'block_id',
			'block_hash',
			'created_at',
			'updated_at',
			'tx',
			'tx_size',
			'flagged',
			'preserve'
		];
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
			last_prune: 0
		};

		if (this.app.BROWSER == 0) {
			this.archive.index_blockchain = 1;
		} else {
			this.localDB = new JsStore.Connection(
				new Worker('/saito/lib/jsstore/jsstore.worker.js')
			);
		}
	}

	async initialize(app) {
		await super.initialize(app);
		this.load();

		if (app.BROWSER) {
			await this.initInBrowserDatabase();

			//
			// dedicated logic for purges
			//
			// if version is below 5.555, then reset in-browser DB
			//
			if (this.archive?.wallet_version) {
				let wv = this.archive.wallet_version;
				try {
					wv = parseFloat(wv);
				} catch (err) {
					console.error(err);
					wv = 0;
				}
				if (wv <= 5.555) {
					console.warn("PURGING LOCAL DB ", wv);
					await this.localDB.dropDb();
					await this.initInBrowserDatabase();
				}
			}
		}

		let now = new Date().getTime();
		//
		// Don't prune more than once a day, but otherwise on connection/spin up
		//
		if (!this.archive?.last_prune || (this.archive.last_prune + (24*60*60*1000) < now)){
			this.pruneArchive();
		}

		setInterval(()=> {
			this.pruneArchive()
		}, 24*60*60*1000 + 5000);

	}

	async initInBrowserDatabase() {

		if (!this.app.BROWSER) { return; }

		//
		// Create Local DB schema
		//
		let archives = {
			name: 'archives',
			columns: {
				id: { primaryKey: true, autoIncrement: true },
				user_id: { dataType: 'number', default: 0 },
				publicKey: { dataType: 'string', default: '' },
				owner: { dataType: 'string', default: '' },
				sig: { dataType: 'string', default: '' },
				field1: { dataType: 'string', default: '' },
				field2: { dataType: 'string', default: '' },
				field3: { dataType: 'string', default: '' },
				field4: { dataType: 'string', default: '' },
				field5: { dataType: 'string', default: '' }, 
				block_id: { dataType: 'number', default: 0 },
				block_hash: { dataType: 'string', default: '' },
				created_at: { dataType: 'number', default: 0 },
				updated_at: { dataType: 'number', default: 0 },
				tx: { dataType: 'string', default: '' },
				tx_size: { dataType: 'number', default: '' },
				flagged: { dataType: 'number', default: 0 },
				preserve: { dataType: 'number', default: 0 }
			}
		};

		/*
			Ideally one, of the 5 arbitrary fields should be number with an ability to search above/below...
			without changing the db schemas, we will designate field5 as a string coded number 
			(since no apps are using it yet) and pending further flexibility treat its inclusion as a >= search tag
		*/

		let db = {
			name: 'archive_db',
			tables: [archives]
		};

		var isDbCreated = await this.localDB.initDb(db);

		/*if (isDbCreated) {
			console.log('ARCHIVE: Db Created & connection is opened');
		} else {
			console.log('ARCHIVE: Connection is opened');
		}*/
	}

	async render() {

		let ct = 0;
		let mem = 0;
		let ts = Date.now();

		this.app.browser.prependElementToDom(ArchiveSummary(this.app));

		this.app.browser.replaceElementBySelector(
			`<div class="local-archive-table"></div>`,
			'.main'
		);
		this.app.browser.addElementToSelector(
			ArchiveTemplate(this.app, null),
			'.local-archive-table'
		);

		const cHook = document.getElementById("tx-ct");
		const sHook = document.getElementById("db-size");

		let cont = true;
		while (cont){

			let rows = await this.loadTransactions({ updated_earlier_than: ts});

			/*let rows = await this.localDB.select({
				from: 'archives',
				order: { by: 'id', type: 'desc' }
			});*/

			for (let row of rows) {
				this.app.browser.addElementToSelector(
					ArchiveTemplate(this.app, row),
					'.local-archive-table'
				);
				mem += row.tx_size;
				ts = Math.min(ts, row.updated_at);
			}

			ct += rows.length;

			cHook.innerHTML = ct;
			sHook.innerHTML = mem;

			//0 rows returned ==> done!
			cont = rows.length;
			
		}

		siteMessage("Achive fully loaded!");
		this.attachEvents();
	}

	attachEvents() {
		document.querySelectorAll('.archive-button').forEach((tx_handle) => {
			tx_handle.onclick = (e) => {
				let tx_json = e.currentTarget.dataset.tx;

				let tx = new Transaction();
				tx.deserialize_from_web(this.app, tx_json);

				let overlay = new SaitoOverlay(this.app, this);
				overlay.show(`<div class="tx_overlay"></div>`);

				let txmsg = tx.returnMessage();

				//debug info
				let el = document.querySelector('.tx_overlay');

				var tree = jsonTree.create(txmsg, el);
				tree.expand(function (node) {
					return node.label !== 'images';
				});

				if (tx?.optional) {
					let tree2 = jsonTree.create(tx.optional, el);
					tree2.expand();
				}
			};
		});

		document.querySelectorAll(".delete-me").forEach(btn => {
			btn.onclick = async (e) => {
				let sig = e.currentTarget.dataset.id;

				let row = e.currentTarget.parentElement;

				e.currentTarget.onclick = null;

				let res = await this.deleteTransaction(sig);

				if (res){
					row.remove();
				}
			}
		})
	}

	returnServices() {
		let services = [];
		if (this.app.BROWSER == 0) {
			services.push(new PeerService(null, 'archive'));
		}
		return services;
	}

	//
	// by default we just save everything that is an application
	//
	async onConfirmation(blk, tx, conf) {

		if (this.app.BROWSER && !tx.isTo(this.publicKey)) {
			return;
		}

		//
		// save all on-chain transactions -- but only the service node...
		//
		if (conf == 0 && this.archive.index_blockchain == 1) {
			let block_id = blk?.id || 0;
			let block_hash = blk?.hash || '';

			setTimeout(async () => {
				let txs = await this.loadTransactions({
					signature: tx.signature
				});
				if (txs?.length > 0) {
					this.updateTransaction(tx, { block_id, block_hash });
				} else {
					// Use the storage function for standard formatting
					let txmsg = tx.returnMessage();
					if (txmsg?.module == "spam"){
						return;
					}
					this.app.storage.saveTransaction(tx, { block_id, block_hash }, "localhost");
				}
			}, 10000);
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
		if (req.request === 'archive') {
			if (req.data.request === 'load') {
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

			if (req.data.request === 'delete') {
				await this.deleteTransaction(newtx, req.data);
			}
			if (req.data.request === 'multidelete') {
				await this.deleteTransactions(req.data);
			}
			if (req.data.request === 'save') {
				await this.saveTransaction(newtx, req.data);
			}
			if (req.data.request === 'update') {
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
	async saveTransaction(tx, obj = {}) {
		let newObj = {};

		//
		// User_id should be the ID of the User table... for library ownership???
		//
		newObj.user_id = obj?.user_id || 0; //What is this supposed to be

		newObj.publicKey = obj?.publicKey || tx.from[0].publicKey;
		newObj.owner = obj?.owner || '';
		newObj.sig = obj?.signature || tx.signature;
		//Field1-3 are set by default in app.storage
		newObj.field1 = obj?.field1 || '';
		newObj.field2 = obj?.field2 || '';
		newObj.field3 = obj?.field3 || '';
		newObj.field4 = obj?.field4 || '';
		newObj.field5 = obj?.field5 || '';
		newObj.block_id = obj?.block_id || 0;
		newObj.block_hash = obj?.block_hash || '';
		newObj.flagged = 0;
		newObj.preserve = obj?.preserve || 0;
		newObj.created_at = obj?.created_at || tx.timestamp;
		newObj.updated_at = obj?.updated_at || tx.timestamp;
		newObj.tx = tx.serialize_to_web(this.app);
		newObj.tx_size = newObj.tx.length;

try {
  //alert("saving transaction in archive mod...");
} catch (err) {}

		if (this.app.BROWSER) {
			let numRows = await this.localDB.insert({
				into: 'archives',
				values: [newObj]
			});

			if (numRows) {
				//console.log("Local Archive index successfully inserted: ", JSON.parse(JSON.stringify(newObj)));
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
                    field4, 
                    field5, 
                    block_id, 
                    block_hash, 
                    created_at, 
                    updated_at, 
                    tx,
                    tx_size,
                    flagged,
                    preserve
                  ) VALUES (
                  $publickey,
                  $owner,
                  $sig,
                  $field1,
                  $field2,
                  $field3,
                  $field4,
                  $field5,
                  $block_id,
                  $block_hash,
                  $created_at,
                  $updated_at,
                  $tx,
                  $tx_size,
                  $flagged,
                  $preserve
                  )`;
			let params = {
				$publickey: newObj.publicKey,
				$owner: newObj.owner,
				$sig: newObj.sig,
				$field1: newObj.field1,
				$field2: newObj.field2,
				$field3: newObj.field3,
				$field4: newObj.field4,
				$field5: newObj.field5,
				$block_id: newObj.block_id,
				$block_hash: newObj.block_hash,
				$created_at: newObj.created_at,
				$updated_at: newObj.updated_at,
				$tx: newObj.tx,
				$tx_size: newObj.tx_size,
				$flagged: newObj.flagged,
				$preserve: newObj.preserve
			};

			await this.app.storage.runDatabase(sql, params, 'archive');
		}
	}

	/////////////////////////////////////////////////////
	// update  -- we can update any arbitrary set of the fields (though we usually just update the tx itself)
	/////////////////////////////////////////////////////
	async updateTransaction(tx, obj = {}) {
		//
		// update records
		//
		let newObj = {};

		newObj.signature = obj?.signature || obj?.sig || tx?.signature || '';
		newObj.tx = tx.serialize_to_web(this.app);
		newObj.tx_size = newObj.tx.length;
		newObj.updated_at = obj?.timestamp || tx?.updated_at || new Date().getTime();

		if (!newObj.signature) {
			console.warn('No tx signature for archive update:', tx);
		}

		//
		// update index
		//
		let sql = `UPDATE archives SET updated_at = $updated_at, tx = $tx, tx_size = $tx_size`;

		let params = {
			$updated_at: newObj.updated_at,
			$tx: newObj.tx,
			$tx_size: newObj.tx_size,
			$sig: newObj.signature
		};

		for (let key in obj) {
			if (this.schema.includes(key)) {
				sql += `, ${key} = $${key}`;
				params[`$${key}`] = obj[key];
			}
		}

		sql += ` WHERE sig = $sig`;

		await this.app.storage.runDatabase(sql, params, 'archive');

		if (this.app.BROWSER) {
			let results = await this.localDB.update({
				in: 'archives',
				set: {
					updated_at: newObj.updated_at,
					tx: newObj.tx,
					tx_size: newObj.tx_size
				},
				where: {
					sig: newObj.signature
				}
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
			return callback(txs);
		} else {
			return txs;
		}
	}

	async loadTransactions(obj = {}) {
		let limit = 10;
		let timestamp_limiting_clause = '';

		let order_clause = ' ORDER BY archives.id';
		let sort = "DESC";

		//For JS-Store
		let order_obj = { by: 'id', type: 'desc' };
		let where_obj = {};

		if (
			obj.created_later_than ||
			obj.hasOwnProperty('created_later_than')
		) {
			timestamp_limiting_clause +=
				' AND created_at > ' + parseInt(obj.created_later_than);
			where_obj = {
				created_at: { '>': parseInt(obj.created_later_than) }
			};
			order_clause = ' ORDER BY archives.created_at';
			order_obj.by = 'created_at';
		}
		if (
			obj.created_earlier_than ||
			obj.hasOwnProperty('created_earlier_than')
		) {
			timestamp_limiting_clause +=
				' AND created_at < ' + parseInt(obj.created_earlier_than);
			where_obj = {
				created_at: { '<': parseInt(obj.created_earlier_than) }
			};
			order_clause = ' ORDER BY archives.created_at';
			order_obj.by = 'created_at';
		}
		if (obj.tx_size_greater_than) {
			timestamp_limiting_clause +=
				' AND tx_size > ' + parseInt(obj.tx_size_greater_than);
			where_obj = {
				tx_size: { '>': parseInt(obj.tx_size_greater_than) }
			};
		}
		if (obj.tx_size_less_than) {
			timestamp_limiting_clause +=
				' AND tx_size < ' + parseInt(obj.tx_size_less_than);
			where_obj = { tx_size: { '<': parseInt(obj.tx_size_less_than) } };
		}
		if (
			obj.updated_later_than ||
			obj.hasOwnProperty('updated_later_than')
		) {
			timestamp_limiting_clause +=
				' AND updated_at > ' + parseInt(obj.updated_later_than);
			where_obj = {
				updated_at: { '>': parseInt(obj.updated_later_than) }
			};
			order_clause = ' ORDER BY archives.updated_at';
			order_obj.by = 'updated_at';
		}
		if (
			obj.updated_earlier_than ||
			obj.hasOwnProperty('updated_earlier_than')
		) {
			timestamp_limiting_clause +=
				' AND updated_at < ' + parseInt(obj.updated_earlier_than);
			where_obj = {
				updated_at: { '<': parseInt(obj.updated_earlier_than) }
			};
			order_clause = ' ORDER BY archives.updated_at';
			order_obj.by = 'updated_at';
		}
		if (obj.flagged) {
			timestamp_limiting_clause +=
				' AND flagged = ' + parseInt(obj.flagged);
			where_obj = { flagged: { '=': parseInt(obj.flagged) } };
		}

		if (obj.ascending || obj.hasOwnProperty('ascending')){
			sort = "ASC";
			order_obj.type = "asc";
		}

		//
		// ACCEPT REASONABLE LIMITS -- [10, 100]
		//
		if (obj.limit) {
			limit = Math.max(limit, obj.limit);
			limit = Math.min(limit, 100);
			delete obj.limit;
		}

		if (obj.signature) {
			obj.sig = obj.signature;
			delete obj.signature;
		}

		let param_count = 0;

		let params = { $limit: limit };

		let sql = `SELECT * FROM archives WHERE`;

		//Hardcode field5 as a flexible search term
		if (obj.field5 || obj.hasOwnProperty('field5')) {
			where_obj['field5'] = { '>=': obj.field5 };
			sql += ' archives.field5 >= $field5 AND';
			params["$field5"] = obj.field5;
			order_clause = ' ORDER BY archives.field5';
			order_obj.by = "field5";
			delete obj.field5;
		}

		for (let key in obj) {
			if (this.schema.includes(key)) {
				sql += ` archives.${key} = $${key} AND`;
				params[`$${key}`] = obj[key];
				where_obj[key] = obj[key];
			}
		}

		sql = sql.substring(0, sql.length - 4);

		//
		// Should we be ordering by time stamp instead of id?
		//

		sql += timestamp_limiting_clause + order_clause + ` ${sort} LIMIT $limit`;

		//
		// SEARCH BASED ON CRITERIA PROVIDED
		// Run SQL queries for full nodes, with JS-Store fallback for browsers
		//
		let rows = await this.app.storage.queryDatabase(sql, params, 'archive');

		if (this.app.BROWSER && !rows?.length) {
			rows = await this.localDB.select({
				from: 'archives',
				where: where_obj,
				order: order_obj,
				limit
			});
		}

		return rows;
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
		let sql = '';
		let params = {};
		let rows = [];
		let timestamp_limiting_clause = '';
		let where_obj = {};

		let sig;
		if (tx?.signature){
			sig = tx.signature;
		}else if (typeof tx === "string"){
			sig = tx;
		}else{
			console.error("Not a valid tx/signature");
			return false;
		}

		//
		// SEARCH BASED ON CRITERIA PROVIDED
		//
		//newObj.signature = obj?.signature || obj?.sig || tx?.signature || "";

		sql = `DELETE FROM archives WHERE archives.sig = $sig`;
		params = { $sig: sig };
		await this.app.storage.runDatabase(sql, params, 'archive');

		//
		// browsers handle with localDB search
		//
		where_obj['sig'] = sig;
		if (this.app.BROWSER) {

			rows = await this.localDB.remove({
				from: 'archives',
				where: where_obj
			});
			if (rows) {
				console.log('DELETED FROM localDB! ');
			}else{
				console.log("Record not found in localDB to delete");
			}
		}

		return true;
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
		let rows = [];

		let timestamp_limiting_clause = ' archives.preserve = 0';
		let where_obj1 = {};

		if (obj.created_later_than) {
			timestamp_limiting_clause +=
				' AND archives.created_at > ' +
				parseInt(obj.created_later_than);
			where_obj1 = {
				created_at: { '>': parseInt(obj.created_later_than) }
			};
		}
		if (obj.created_earlier_than) {
			timestamp_limiting_clause +=
				' AND archives.created_at < ' +
				parseInt(obj.created_earlier_than);
			where_obj1 = {
				created_at: { '<': parseInt(obj.created_earlier_than) }
			};
		}
		if (obj.updated_later_than) {
			timestamp_limiting_clause +=
				' AND archives.updated_at > ' +
				parseInt(obj.updated_later_than);
			where_obj1 = {
				updated_at: { '>': parseInt(obj.updated_later_than) }
			};
		}
		if (obj.updated_earlier_than) {
			timestamp_limiting_clause +=
				' AND archives.updated_at < ' +
				parseInt(obj.updated_earlier_than);
			where_obj1 = {
				updated_at: { '<': parseInt(obj.updated_earlier_than) }
			};
		}

		where_obj1['preserve'] = 0;

		//
		// SEARCH BASED ON CRITERIA PROVIDED
		//

		/*
      This is set up as an OR condition, can provide multiple fields to delete any partial match
    		*/
		let sql = `DELETE FROM archives WHERE `;
		let sql_substring = '';
		let params = {};
		let where_obj2 = {};
		let param_ct = 0;

		for (let key in obj) {
			if (this.schema.includes(key)) {
				sql_substring += `archives.${key} = $${key} OR `;
				params[`$${key}`] = obj[key];
				if (param_ct++ > 0) {
					if (where_obj2['or']) {
						where_obj2.or[key] = obj[key];
					} else {
						where_obj2['or'] = {};
						where_obj2.or[key] = obj[key];
					}
				} else {
					where_obj2[key] = obj[key];
				}
			}
		}

		sql_substring = sql_substring.substring(0, sql_substring.length - 4);

		if (param_ct > 1) {
			sql += `(${sql_substring})`;
		} else {
			sql += sql_substring;
		}

		let where_obj;
		if (param_ct > 1) {
			where_obj = [where_obj1, where_obj2];
			sql += ' AND' + timestamp_limiting_clause;
		} else if (param_ct == 1) {
			where_obj = Object.assign(where_obj1, where_obj2);
		} else {
			where_obj = where_obj1;
			sql += timestamp_limiting_clause;
		}

		rows = await this.app.storage.runDatabase(sql, params, 'archive');

		//
		// browsers handle with localDB search
		//
		if (this.app.BROWSER) {
			rows = await this.localDB.remove({
				from: 'archives',
				where: where_obj
			});
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
	async pruneArchive() {

		console.log('$');
		console.log('$');
		console.log('$ PURGING ARCHIVE');
		console.log('$');
		console.log('$');

		// SQL
		let now = new Date().getTime();

		let ts = now - this.prune_public_ts;

		//
		// delete public blockchain transactions
		//
		let pruned_ct = 0;
		let sql = `DELETE FROM archives WHERE owner = "" AND updated_at < $ts AND preserve = 0`;
		let params = { $ts: ts };
		let results = await this.app.storage.runDatabase(sql, params, 'archive');
		if (results?.changes){
			pruned_ct += results?.changes;
		}

		//
		// delete private transactions
		//
		ts = now - this.prune_private_ts;
		sql = `DELETE FROM archives WHERE owner != "" AND updated_at < $ts AND preserve = 0`;
		params = { $ts: ts };
		results = await this.app.storage.runDatabase(sql, params, 'archive');
		if (results?.changes){
			pruned_ct += results?.changes;
		}

		console.log(`Deleted ${pruned_ct} txs from archive`);

		//
		// localDB
		//
		// in order to avoid data simply building-up for eternity, and especially for content
		// saved such as likes, our pruning is turned off explicitly for anything where the
		// preserve flag is set to 0.
		//
		if (this.app.BROWSER) {

			ts = now - this.prune_public_ts;

			where_obj = { updated_at: { '<': ts } };
			where_obj['preserve'] = 0;
			rows = await this.localDB.remove({
				from: 'archives',
				where: where_obj
			});
			console.log(rows, 'automatically pruned from local archive');
		}

		this.archive.last_prune = now;
		this.save();

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
		this.archive.wallet_version = this.app.options.wallet.version;
		this.app.options.archive = this.archive;
		this.app.storage.saveOptions();
	}

	async onUpgrade(type, privatekey, walletfile) {
		if (type == 'nuke' && this.localDB) {
			await this.localDB.dropDb();
			await this.initInBrowserDatabase();
			//await this.localDB.clear("archives");
		}
		return 1;
	}
}

module.exports = Archive;
