const ModTemplate = require('../../lib/templates/modtemplate');

class Warehousex extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.name = 'Warehousex';
		this.slug = 'warehousex';
		this.description = 'Block data warehouse for the Saito blockchain. Not suitable for lite-clients';
		this.categories = 'Utilities Dev';

		this.tx_cts = [];
		this.key_cts = [];
	}

	async initialize(app) {
		await super.initialize(app);
		this.publicKey = await app.wallet.getPublicKey();

		// When we spin up, query stats for yesterday and save them (for comparing later)
		//

		let today = new Date(Date.now() - 24*60*60*1000);
		await this.calculateStats(new Date(today.getFullYear(), today.getMonth(), today.getDate()), false);
		//
		// When we cross into a new day, generate the report
		//
		setInterval(() => {
			let now = new Date(Date.now());
			let tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate());

			if (tomorrow.getDate() != today.getDate()) {
				this.calculateStats(tomorrow);
				today = tomorrow;
			}
		}, 1000 * 60 * 60 * 5);

		//For local testing of tweet format
		//this.generateReport(Math.round(5000*Math.random()), Math.round(100*Math.random()), Math.round(9000*Math.random()), Math.round(100*Math.random()), "TEST");	
		

	}

	onNewBlock(blk, lc) {
		try {
			var block = JSON.parse(blk.toJson());
			var transblock = [];
			blk.transactions.forEach((transaction) => {
				let tx = transaction.toJson();
				tx.msg = transaction.returnMessage(); // .toJson() doesn't return msg field ?
				transblock.push(tx);
			});
			block.transactions = transblock;
			this.addTransactionsToDatabase(block);
		} catch (error) {
			console.log(error);
		}
	}

	async addTransactionsToDatabase(blk) {
		try {
			console.log(Date() + '[ INFO |  WAREHOUSEX ] - block added : ' + blk.hash);
			blk.transactions.forEach(async (transaction) => {
				let sql = `INSERT OR IGNORE INTO transactions (
                                block_time,
                                block_id,
                                block_hash,
                                tx_time,
                                tx_hash,
                                tx_from,
                                tx_msg,
                                tx_type,
                                tx_module
                            )
                             VALUES (
                                $block_time,
                                $block_id,
                                $block_hash,
                                $tx_time,
                                $tx_hash,
                                $tx_from,
                                $tx_msg,
                                $tx_type,
                                $tx_module
                            )`;
				let tx_msg = '';
				let tx_type = 0; // 0: normal tx | 1: Fee tx? | 2: block creator?
				if (transaction.type) {
					tx_type = transaction.type;
				}
				let tx_module = '';
				if (transaction.msg) {
					if (transaction.msg.module) {
						tx_module = transaction.msg.module;
						tx_msg = JSON.stringify(transaction.msg);
					} else if (this.app.crypto.isAesEncrypted(transaction.msg)) {
						tx_module = 'Encrypted';
						tx_msg = transaction.msg;
					}
				}
				let tx_from = '';
				if (transaction.from.length > 0) {
					tx_from = transaction.from[0].publicKey;
				}
				let params = {
					// $address: blk.transactions[i].to[ii]?.publicKey || "",
					// $amt: Number(blk.transactions[i].to[ii]?.amount || 0),
					$block_id: JSON.parse(JSON.parse(blk.id)), // blk.id value is '"36"' - double parsing to remove quotes?
					// $tid: "",
					// $sid: ii,
					$block_hash: blk.hash,
					// $lc: 1,
					// $rebroadcast: 0,
					$tx_hash: transaction.signature,
					$tx_time: transaction.timestamp,
					$block_time: Number(blk.timestamp),
					$tx_type: tx_type,
					$tx_from: tx_from,
					// $tx_to: tx_to,
					// $name: tname,
					$tx_module: tx_module,
					$tx_msg: tx_msg
				};
				// console.log(params);
				await this.app.storage.runDatabase(sql, params, 'warehousex');

				/*
                TODO: if tx_module is a game(s) or redsquare... 
                if (tx_module = "") {
                    // params to new db
                }
                */
			});
			return;
		} catch (err) {
			console.error(
				'[ ERROR | WAREHOUSEX ] *** ERROR ***\n' + err + '\n[ WAREHOUSEX ] *** END OF ERROR ***'
			);
		}
	}
	shouldAffixCallbackToModule() {
		return 1;
	}

	async calculateStats(today, tweet = true) {
		let midnight = today.getTime();
		let yesterday = midnight - 24 * 60 * 60 * 1000;

		let ranked = [];
		let tx_ct = 0;
		let unique_user_count = 0;

		try{

			let sql1 = `SELECT COUNT(DISTINCT tx_from) AS ct FROM transactions WHERE (tx_module != '' AND tx_time < $t1 AND tx_time >= $t2)`;
			let params1 = {
				$t1: midnight,
				$t2: yesterday
			};

			let uu = await this.app.storage.queryDatabase(sql1, params1, 'warehousex');

			let sql2 = `SELECT tx_module, COUNT(*) AS ct FROM transactions WHERE (tx_module != '' AND tx_time < $t1 AND tx_time >= $t2) GROUP BY tx_module ORDER BY 2 DESC`;
			let params2 = {
				$t1: midnight,
				$t2: yesterday
			};

			let tt = await this.app.storage.queryDatabase(sql2, params2, 'warehousex');

			// Get and minimally process data

			unique_user_count = uu[0]?.ct;
			tt.forEach((res) => {
				if (res.tx_module !== "spam"){
					ranked.push(`${res.tx_module} (${res.ct})`);	
				}
				tx_ct += res.ct;
			});

		}catch(err){
			console.error("WarehouseX: SQL error -- ", err);
			return;
		}

		try {

			let last_tx = this.tx_cts.slice(-1)[0];
			let last_key = this.key_cts.slice(-1)[0];

			this.tx_cts.push(tx_ct);
			this.key_cts.push(unique_user_count);

			if (tweet && ranked.length > 0){
				this.generateReport(last_tx, last_key, tx_ct, unique_user_count, ranked[0]);
			}
			
		}catch(err){
			console.error("WarehouseX: tweet report error -- ", err);
		}
	}

	async generateReport(last_tx, last_key, tx_ct, unique_user_count, top){
			let percent_user_change = 1000 * (unique_user_count - last_key) / last_key;
			percent_user_change = Math.round(percent_user_change)/10;

			let percent_tx_change = 1000 * (tx_ct - last_tx) / last_tx;
			percent_tx_change = Math.round(percent_tx_change)/10;

			let report = `###### *Today in Numbers:*\n`;
			report += `Unique Keys: ${unique_user_count}`; 
			if (last_key){
				report += ` (${percent_user_change}%)`;
				if (percent_user_change > 0){
					report += ' ⬆️';
				}
			}
			report += "\n";

			report += `Total Transactions: ${tx_ct}`; 
			if (last_tx){
				report += ` (${percent_tx_change}%)`;
				if (percent_tx_change > 0){
					report += ' ⬆️';
				}
			}
			report += "\n";

			report += `Top Module: ${top}`;

			let data = {
				text: report
			};

			// Won't do anything if redsquare not installed ! 
			//this.app.connection.emit('redsquare-post-tweet', data);	

		    let obj = {
		      module: 'RedSquare',
		      request: 'create tweet',
		      data
		    };

		    let newtx = await this.app.wallet.createUnsignedTransaction();
		    newtx.msg = obj;

		    await newtx.sign();
		    await this.app.network.propagateTransaction(newtx);

	}
}

module.exports = Warehousex;
