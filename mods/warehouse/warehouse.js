const ModTemplate = require('../../lib/templates/modtemplate');

class Warehouse extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.name = 'Warehouse';
		this.slug = 'warehouse';
		this.description = 'Block data warehouse for the Saito blockchain. Not suitable for lite-clients';
		this.categories = 'Utilities Dev';
	}

	onConfirmation(blk, tx, conf) {
		if (conf == 0) {
			// removed addTransactionsToDatabase from here
		}
	}

	onNewBlock(blk, lc) {
		// console.log('warehouse - on new block');
		var json_block = JSON.parse(blk.toJson());
		var txwmsgs = [];
		try {
			blk.transactions.forEach((transaction) => {
				let tx = transaction.toJson();
				tx.msg = transaction.returnMessage();
				txwmsgs.push(tx);
			});
		} catch (err) {
			console.error(err);
		}
		if (txwmsgs.length > 0) {
			json_block.transactions = txwmsgs;
			this.addTransactionsToDatabase(json_block);
		}
	}

	async addTransactionsToDatabase(blk) {
		try {
			console.log('adding block to warehouse : ' + blk.hash);
			for (let i = 0; i < blk.transactions.length; i++) {
				//if (blk.transactions[i].type && blk.transactions[i].type >= -999) {
				//need to come back and make tx value add up all recipients... and remove change.
				let ii = 0;
				//          for (let ii = 0; ii < blk.transactions[i].to.length; ii++) {
				let sql = `INSERT
            OR IGNORE INTO transactions (
                                address, 
                                amt, 
                                bid, 
                                tid, 
                                sid, 
                                bhash, 
                                lc, 
                                rebroadcast,
                                sig,
                                ts,
                                block_ts,
                                type,
                                tx_from,
                                tx_to,
                                name,
                                module
                                )
                             VALUES (
            $address,
            $amt,
            $bid,
            $tid,
            $sid,
            $bhash,
            $lc,
            $rebroadcast,
            $sig,
            $ts,
            $block_ts,
            $type,
            $tx_from,
            $tx_to,
            $name,
            $module
            )`;
				let ttype = 0;
				let tname = '';
				let tmodule = '';
				if (blk.transactions[i].msg){
					if(blk.transactions[i].type) {
						ttype = blk.transactions[i].type;
					}
					if (blk.transactions[i].msg.name) {
						tname = blk.transactions[i].msg.name;
					}
					if (blk.transactions[i].msg.module) {
						tmodule = blk.transactions[i].msg.module;
					} else if (
						this.app.crypto.isAesEncrypted(blk.transactions[i].msg)
					) {
						tmodule = 'Encrypted';
					}
				} 

				let tx_to = '';
				if (
					blk.transactions[i].to &&
					blk.transactions[i].to.length > 0
				) {
					tx_to =
						blk.transactions[i].to[
							blk.transactions[i].to.length - 1
						].publicKey;
				}
				let tx_from = '';
				if (
					blk.transactions[i].from &&
					blk.transactions[i].from.length > 0
				) {
					tx_from = blk.transactions[i].from[0].publicKey;
				}
				let params = {
					$address: blk.transactions[i].to[ii]?.publicKey || '',
					$amt: Number(blk.transactions[i].to[ii]?.amount || 0),
					$bid: blk.id,
					$tid: '',
					$sid: ii,
					$bhash: blk.hash,
					$lc: 1,
					$rebroadcast: 0,
					$sig: blk.transactions[i]?.signature || '',
					$ts: blk.transactions[i]?.timestamp || 0,
					$block_ts: blk.transactions[i]?.timestamp || 0,
					$type: ttype,
					$tx_from: tx_from,
					$tx_to: tx_to,
					$name: tname,
					$module: tmodule
				};
				await this.app.storage.runDatabase(sql, params, 'warehouse');
				//          }
				//       }
			}
		} catch (err) {
			console.error(err);
		}
	}

	shouldAffixCallbackToModule() {
		return 1;
	}
}

module.exports = Warehouse;
