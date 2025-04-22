import StorageCore from '../lib/saito/core/storage-core';
import { Saito } from '../apps/core';
import fs from 'fs-extra';

import mods_config from '../config/modules.config';
import * as blake3 from 'blake3';
import S, { initialize as initS } from 'saito-js/index.node';
import { NodeSharedMethods } from '../lib/saito/core/server';
import Factory from '../lib/saito/factory';
import { LogLevel } from 'saito-js/saito';
import Wallet from '../lib/saito/wallet';
import Blockchain from '../lib/saito/blockchain';

let processing_started = false;
let work_queue: any[] = [];

async function initCLI() {
	const app = new Saito({
		mod_paths: mods_config.core
	});

	//app.server = new Server(app);
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	app.storage = new StorageCore(app);

	app.BROWSER = 0;
	app.SPVMODE = 0;
	//
	// app.hash = (data) => {
	//   return blake3.hash(data).toString("hex");
	// };
	await app.storage.initialize();

	let privateKey = app.options.wallet?.privateKey || '';

	await initS(
		app.options,
		new NodeSharedMethods(app),
		new Factory(),
		privateKey,
		LogLevel.Info,
		BigInt(1),
		false,
	).then(() => {
		console.log('saito wasm lib initialized');
	});
	app.wallet = (await S.getInstance().getWallet()) as Wallet;
	app.wallet.app = app;
	app.blockchain = (await S.getInstance().getBlockchain()) as Blockchain;
	app.blockchain.app = app;
	// await app.init();
	//
	// S.getInstance().start();

	console.log('\nnpm run cli help - for help');

	switch (process.argv[2]) {
		case 'count':
			count(process.argv[3], process.argv[4]);
			break;
		case 'save':
			loadTxToDatabase(process.argv[3]);
			break;
		case 'version':
			console.log(1);
			break;
		case 'help':
			printHelp();
			break;
		case 'h':
			printHelp();
			break;
		default:
			console.log('Argument not recognised.');
	}

	function queue(item) {
		work_queue.push(item);
		console.info('Queu length: ' + work_queue.length);
	}

	function processBlocks() {
		if (processing_started && work_queue.length > 0) {
			app.storage.loadBlockByFilename(work_queue[0]).then((blk) => {
				inflateBlockforDatabase(blk);
			});
			console.info(
				work_queue.shift() +
					' added to DB, ' +
					work_queue.length +
					' remaining in queue.'
			);
			setInterval(processBlocks, 1000);
		} else {
			console.info('Processing Complete');
			process.exit(0);
		}
	}

	function loadTxToDatabase(dir) {
		let count = 0;
		const files = fs.readdirSync(dir);
		const total = files.length;
		files.forEach((file) => {
			count += 1;
			console.log(
				'Adding block ' + count + ' of ' + total + ' to queue.'
			);
			try {
				if (file !== 'empty') {
					queue(dir + '/' + file);
				}
			} catch (err) {
				console.error(err);
			}
		});
		console.info(total + ' blocks added queue (' + work_queue.length + ')');
		processing_started = true;
		console.info('Processing Started');
		processBlocks();
	}

	function count(what, dir) {
		let x = 0;
		const files = fs.readdirSync(dir);
		if (what == 'blocks') {
			x = files.length;
			console.log(x + ' ' + what + ' on disk.');
		} else {
			files.forEach((file) => {
				try {
					if (file !== 'empty') {
						app.storage
							.loadBlockByFilename(dir + '/' + file)
							.then((blk) => {
								x += blk.transactions.length;
								console.log(
									'another: ' +
										blk.transactions.length +
										' for ' +
										x +
										' total.'
								);
								if (file == files[files.length - 1]) {
									console.log(x + ' ' + what + ' on disk.');
								}
							});
					}
				} catch (err) {
					console.error(err);
				}
			});
		}
	}

	function inflateBlockforDatabase(blk) {
		let json_block = JSON.parse(blk.toJson());

		let txwmsgs = [];
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
			addTransactionsToDatabase(json_block);
		}
	}

	async function addTransactionsToDatabase(blk) {
		try {
			for (let i = 0; i < blk.transactions.length; i++) {
				if (blk.transactions[i].type >= -999) {
					for (let ii = 0; ii < blk.transactions[i].to.length; ii++) {
						if (blk.transactions[i].type >= -999) {
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
							if (blk.transactions[i].msg.type) {
								ttype = blk.transactions[i].msg.type;
							}
							if (blk.transactions[i].msg.name) {
								tname = blk.transactions[i].msg.name;
							}
							if (blk.transactions[i].msg.module) {
								tmodule = blk.transactions[i].msg.module;
							}
							let tx_from = '';
							if (blk.transactions[i].from.length > 0) {
								tx_from = blk.transactions[i].from[0].publicKey;
							}
							let params = {
								$address: blk.transactions[i].to[ii].publicKey,
								$amt: blk.transactions[i].to[ii].amount,
								$bid: blk.id,
								$tid: blk.transactions[i].id,
								$sid: ii,
								$bhash: blk.hash,
								$lc: 1,
								$rebroadcast: 0,
								$sig: blk.transactions[i].signature,
								$ts: blk.transactions[i].timestamp,
								$block_ts: blk.timestamp,
								$type: ttype,
								$tx_from: tx_from,
								$tx_to: blk.transactions[i].to[ii].publicKey,
								$name: tname,
								$module: tmodule
							};
							await app.storage.runDatabase(
								sql,
								params,
								'warehouse'
							);
						}
					}
				}
			}
			return;
		} catch (err) {
			console.error(err);
		}
	}

	function printHelp() {
		let help = `
    Commands:

     block <path and file name>     print block;
     block.tx <path and file name>  print transactions from block
     blocks <directory>             print out blocks in directory
     blocks.tx <directory>          print out all tx from all bocks in direcory
    `;
		console.log(help);
	}

	/////////////////////
	// Cntl-C to Close //
	/////////////////////
	process.on('SIGTERM', function () {
		console.log('Network Shutdown');
		process.exit(0);
	});
	process.on('SIGINT', function () {
		console.log('Network Shutdown');
		process.exit(0);
	});
}

initCLI();
