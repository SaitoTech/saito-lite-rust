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
		await super.render(app);
	}

		

	async onConfirmation(blk, tx, conf) {
console.log("A 1");
		let txmsg = tx.returnMessage();
console.log("A 2");
		let atr_self = this.app.modules.returnModule('ATR');
console.log("A 3");


		if (conf == 0) {
console.log("A 4");


			//	console.log("block info: ", blk);
			 console.log("block.id: ", blk.id);
			 console.log("block.totalFees: ", blk.totalFees);
			// console.log("block.totalFeesNew: ", blk.totalFeesNew);
			// console.log("block.totalFeesAtr: ", blk.totalFeesAtr);
			// console.log("block.avgTotalFees: ", blk.avgTotalFees);

			// console.log("block.avgTotalFeesNew: ", blk.avgTotalFeesNew);
			// console.log("block.avgTotalFeesAtr: ", blk.avgTotalFeesAtr);
			// console.log("block.totalPayoutRouting: ", blk.totalPayoutRouting);

			// console.log("block.totalPayoutMining: ", blk.totalPayoutMining);
			// console.log("block.totalPayoutTreasury: ", blk.totalPayoutTreasury);
			// console.log("block.totalPayoutGraveyard: ", blk.totalPayoutGraveyard);
			// console.log("block.avgPayoutAtr: ", blk.avgPayoutAtr);

			// console.log("block.avgFeePerByte: ", blk.avgFeePerByte);
			// console.log("block.feePerByte: ", blk.feePerByte);
			// console.log("block.burnFee: ", blk.burnFee);
			// console.log("block.difficulty: ", blk.difficulty);
			// console.log("block.previousBlockUnpaid: ", blk.previousBlockUnpaid);
console.log("A 5");

			console.log('blk.id', Number(blk.id)); 
			console.log('this.last_block_id', atr_self.last_block_id);
			console.log(Number(blk.id) > atr_self.last_block_id);

console.log("A 6");
			if (Number(blk.id) > atr_self.last_block_id) {

console.log("A 7");

				atr_self.last_block_id = Number(blk.id);
console.log("A 8");

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

console.log("A 9");
				console.log('atr_self.last_block_id: ', atr_self.last_block_id);

				console.log('atr_self.app.BROWSER ///', atr_self.app.BROWSER);

				
				atr_self.app.connection.emit('saito-atr-render-request', {});	
			}
			
			
		}

		return;
	}

}

module.exports = ATR;
