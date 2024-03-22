const ModTemplate = require('../../lib/templates/modtemplate');

class Warehousex extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.name = 'Warehousex';
		this.description =
			'Block data warehouse for the Saito blockchain. Not suitable for lite-clients';
		this.categories = 'Utilities Dev';
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
			console.log(
				Date() + '[ INFO |  WAREHOUSEX ] - block added : ' + blk.hash
			);
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
				'[ ERROR | WAREHOUSEX ] *** ERROR ***\n' +
					err +
					'\n[ WAREHOUSEX ] *** END OF ERROR ***'
			);
		}
	}
	shouldAffixCallbackToModule() {
		return 1;
	}
}

module.exports = Warehousex;
