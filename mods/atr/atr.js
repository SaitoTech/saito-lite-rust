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

		this.block_data = [];
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


	onNewBlock(blk, lc,conf,app) {

			var json_block = JSON.parse(blk.toJson());

			console.log("json_block: ", json_block);
			this.block_data.push(json_block);

			if (this.block_data.length > 10) {
				this.block_data.shift();
			}

			app.connection.emit('saito-atr-render-request');
	}

	async onConfirmation(blk, tx, conf) {
		let txmsg = tx.returnMessage();
		try {
			if (conf == 0) {

			}
		} catch (err) {
			console.log('ERROR in ' + this.name + ' onConfirmation: ' + err);
		}
	}

	async handlePeerTransaction(app, tx=null, peer, callback=null) { // BUILT-IN FUNCTION
		if (this.app.BROWSER) {

		}
	}

}

module.exports = ATR;
