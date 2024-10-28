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

		this.blocks = [];
		this.last_block_id = 0;
	}

	async initialize(app) {
		this.styles = [
			'/saito/style.css',
		];
		this.ui = new ATRMain(app, this);
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


	async onConfirmation(blk, tx, conf) {
		if (conf == 0) {

			if (blk.getBlockId() > this.last_block_id) {

				this.last_block_id = blk.id;

				if (this.blocks.length < 10) {
					this.blocks.push(JSON.parse(blk.toJson()));
				} else {
					this.blocks[0] = this.block[1];
					this.blocks[1] = this.block[2];
					this.blocks[2] = this.block[3];
					this.blocks[3] = this.block[4];
					this.blocks[4] = this.block[5];
					this.blocks[5] = this.block[6];
					this.blocks[6] = this.block[7];
					this.blocks[7] = this.block[8];
					this.blocks[8] = this.block[9];
					this.blocks[9] = JSON.parse(blk.toJson());
				}

				this.app.connection.emit('saito-atr-render-request');

			}
		}

	}

}

module.exports = ATR;
