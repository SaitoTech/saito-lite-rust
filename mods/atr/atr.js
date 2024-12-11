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
		//this.addComponent(this.header);
		await this.loadBlocks();
		this.ui.render();
		await super.render(app);
	}

	async loadBlocks(blk = null) {
		try {
			if (blk == null) {
				
				let last_blk_hash = await this.app.blockchain.getLastBlockHash();
				if (last_blk_hash.includes("0000000000") == false) {
					console.log("if case: ");
					for (let i=0; i< 10; i++) {
						let blk = await this.fetchBlock(last_blk_hash);
						if (blk != null) {
							if (Number(blk.id) > 1) {
								if (this.blocks.length < 10) {
									this.blocks.push(blk);
								}
								last_blk_hash = blk.previous_block_hash;
							}
						}
					}

					if (this.blocks.length > 0) {
						this.blocks.reverse();
						this.last_block_id = this.blocks[this.blocks.length-1].id;
					}
				}
			} else {
				let blk_data = this.getBlockData(blk);

				if (Number(blk_data.id) > this.last_block_id) {
					this.last_block_id = Number(blk_data.id);

					if (this.blocks.length < 10) {
						this.blocks.push(blk_data);
					} else {
						this.blocks.shift();
						this.blocks.push(blk_data);
					}
				}
			}


			this.ui.render();
		} catch(err) {
			//console.log("Err getBlock: ", err);
		}
	}

	getBlockData(blk){
		let atr_obj = {};
		atr_obj.id = blk.id;
		atr_obj.totalFees = blk.totalFees
		atr_obj.totalFeesNew = blk.totalFeesNew;
		atr_obj.totalFeesAtr = blk.totalFeesAtr;
		atr_obj.avgTotalFees = blk.avgTotalFees;
		atr_obj.avgTotalFeesNew = blk.avgTotalFeesNew;
		atr_obj.avgTotalFeesAtr = blk.avgTotalFeesAtr;
		atr_obj.totalPayoutRouting = blk.totalPayoutRouting;
		atr_obj.totalPayoutMining = blk.totalPayoutMining;
		atr_obj.totalPayoutTreasury = blk.totalPayoutTreasury;
		atr_obj.totalPayoutGraveyard = blk.totalPayoutGraveyard;
		atr_obj.totalPayoutAtr = blk.totalPayoutAtr;
		atr_obj.avgPayoutRouting = blk.avgPayoutRouting;
		atr_obj.avgPayoutMining = blk.avgPayoutMining;
		atr_obj.avgPayoutTreasury = blk.avgPayoutTreasury;
		atr_obj.avgPayoutGraveyard = blk.avgPayoutGraveyard;
		atr_obj.avgPayoutAtr = blk.avgPayoutAtr;
		atr_obj.avgFeePerByte = blk.avgFeePerByte;
		atr_obj.feePerByte = blk.feePerByte;
		atr_obj.avgNolanRebroadcastPerBlock = blk.avgNolanRebroadcastPerBlock;
		atr_obj.burnFee = blk.burnFee;
		atr_obj.difficulty = blk.difficulty;
		atr_obj.previousBlockUnpaid = blk.previousBlockUnpaid;
		atr_obj.gtNum = blk.gtNum;

		let fullblock = JSON.parse(blk.toJson());
		atr_obj.previous_block_hash = fullblock.previous_block_hash;

		return atr_obj;
	}

	async fetchBlock(hash) {
		let atr_self = this;
		var url = window.location.origin + '/atr/json-block/' + hash;
		let blk = null;

		await fetch(url)
		.then((response) => response.json())
		.then(async(data) => {
			blk = data;
		})
		.catch((err) => {
			console.error('Error fetching content: ' + err);
			blk = null;
		});

		return blk;
	}

	webServer(app, expressapp) {
		var atr_self = app.modules.returnModule('ATR');
		expressapp.get('/atr/json-block/:bhash', async (req, res) => {

				const bhash = req.params.bhash;
				if (bhash == null) {
					return JSON.stringify({});
				}
				try {
					const blk = await app.blockchain.getBlock(bhash);
					if (blk == null) {
						let html_to_return = JSON.stringify({});
						res.writeHead(200, {
							'Content-Type': 'text/plain',
							'Content-Transfer-Encoding': 'utf8'
						});
						return res.end(html_to_return);
					}

					var txwmsgs = [];
					blk.transactions.forEach((transaction) => {
						let tx = transaction.toJson();
						tx.msg = transaction.returnMessage();
						txwmsgs.push(tx);
					});

					let atr_obj = atr_self.getBlockData(blk);

					let html_to_return = JSON.stringify(atr_obj);

					if (!res.finished) {
						res.writeHead(200, {
							'Content-Type': 'text/plain',
							'Content-Transfer-Encoding': 'utf8'
						});
						return res.end(html_to_return);
					}

				} catch (err) {

					console.error('FETCH BLOCKS ERROR SINGLE BLOCK FETCH: ', err);
					if (!res.finished) {
						res.status(400);
						return res.end({
							error: {
								message: `FAILED SERVER REQUEST: could not find block: ${bhash}`
							}
						});
					}
				}
			});
	}

	async onConfirmation(blk, tx, conf) {
		let txmsg = tx.returnMessage();
		let atr_self = this.app.modules.returnModule('ATR');

		if (!txmsg.module == 'ATR') {
	    	return;
	    }

		if (conf == 0) {
			await this.loadBlocks(blk);
		}
		return;
	}

}

module.exports = ATR;