const ModTemplate = require('../../lib/templates/modtemplate');
const sanitizer = require('sanitizer');
const JSON = require('json-bigint');
const ATRMain = require('./lib/main');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');

class ATR extends ModTemplate {

	constructor(app) {
		super(app);
		this.app = app;
		this.name = 'ATR';
		this.slug = 'atr';
		this.description = `Explorer for ATR Testing`;
		this.categories = 'Utilities Dev';
		this.class = 'utility';
	}

	async initialize(app) {
		this.styles = [
			'/saito/style.css',
			//'/atr/style.css'
		];
		this.atrMain = new ATRMain(app, this);
	}

	shouldAffixCallbackToModule() {
		return 1;
	}

	async render(app) { 
		if (!this.app.BROWSER) {
			return;
		}

		this.atrMain.render();
	
		await super.render(app);
	}


	onNewBlock(blk, lc) {
		console.log('warehouse - on new block');
		var json_block = JSON.parse(blk.toJson());

		console.log("json_block: ", json_block);

		var txwmsgs = [];
		try {
			// blk.transactions.forEach((transaction) => {
			// 	let tx = transaction.toJson();
			// 	tx.msg = transaction.returnMessage();
			// 	txwmsgs.push(tx);
			// });
		} catch (err) {
			console.error(err);
		}
	}

	async onConfirmation(blk, tx, conf) {
		let txmsg = tx.returnMessage();

		console.log("BLK: ///////////",blk);

		try {



			if (conf == 0) {

				console.log("txmsg in ATR:", txmsg);
				if (txmsg.request === 'send spam tx') {
					
				}
			}
		} catch (err) {
			console.log('ERROR in ' + this.name + ' onConfirmation: ' + err);
		}
	}


	async handlePeerTransaction(app, tx=null, peer, callback=null) { // BUILT-IN FUNCTION
		// if (tx.returnMessage().request != "livedocs request") {
		// 	return;
		// }
		if (this.app.BROWSER) {
			let message = tx.returnMessage().data;

		}
	}

}

module.exports = ATR;
