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

		this.ui = null;
		this.blocks = [];
		this.last_block_id = 0;
	}

	async initialize(app) {
		await super.initialize(app);
		this.styles = [
			'/saito/style.css',
		];
		this.ui = new ATRMain(app, this);
		this.header = new SaitoHeader(this.app, this);
	}

	shouldAffixCallbackToModule() {
		return 1;
	}

	async render(app) { 
		if (!this.app.BROWSER) {
			return;
		}

		this.ui.render();
		this.addComponent(this.ui);
		// await this.header.initialize(this.app);
		// this.addComponent(this.header);
		await super.render(app);

	}

	async onConfirmation(blk, tx, conf) {
		let txmsg = tx.returnMessage();
		let atr_self = this.app.modules.returnModule('ATR');

		if (conf == 0) {
			if (Number(blk.id) > atr_self.last_block_id) {
				atr_self.last_block_id = Number(blk.id);

				if (atr_self.blocks.length < 10) {
					atr_self.blocks.push(blk);
				} else {
					atr_self.blocks[0] = atr_self.block[1];
					atr_self.blocks[1] = atr_self.block[2];
					atr_self.blocks[2] = atr_self.block[3];
					atr_self.blocks[3] = atr_self.block[4];
					atr_self.blocks[4] = atr_self.block[5];
					atr_self.blocks[5] = atr_self.block[6];
					atr_self.blocks[6] = atr_self.block[7];
					atr_self.blocks[7] = atr_self.block[8];
					atr_self.blocks[8] = atr_self.block[9];
					atr_self.blocks[9] = blk;
				}
				
				atr_self.app.connection.emit('saito-atr-render-request', {});	
			}	
		}
		return;
	}

}

module.exports = ATR;
