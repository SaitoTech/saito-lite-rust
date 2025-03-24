const ModTemplate = require('../../lib/templates/modtemplate');
const sanitizer = require('sanitizer');
const JSON = require('json-bigint');
const ATRMain = require('./lib/main');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');
const HomePage = require('./index');

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
		this.social = {
	      twitter: '@SaitoOfficial',
	      title: 'Saito ATR Explorer',
	      url: 'https://saito.io/atr/',
	      description: 'ATR explorer for Saito Network blockchain',
	      image:
	        'https://saito.tech/wp-content/uploads/2022/04/saito_card_horizontal.png'
	    };
	}

	async initialize(app) {
		await super.initialize(app);
		this.ui = new ATRMain(app, this);
		this.header = new SaitoHeader(this.app, this);

	}

	shouldAffixCallbackToModule() {
		return 1;
	}

	async render(app) {
		this.addComponent(this.header);
		await this.loadBlocks(null, 'old');
		//this.ui.render();
		this.styles = ['/atr/style.css'];
		await super.render(app);
	}

	async loadBlocks(blk = null, type) {
		try {
			if (blk == null) {
				let last_blk_hash = await this.app.blockchain.getLastBlockHash();
				console.log("last_blk_hash:", last_blk_hash);
				//if (last_blk_hash !== "0000000000000000000000000000000000000000000000000000000000000000") {
					for (let i=0; i< 10; i++) {
						console.log("fetcing blk: ", last_blk_hash);
						let blk = await this.fetchBlock(last_blk_hash);
						console.log('fetched blk:', blk);
						if (blk != null) {
							if (Number(blk.id) >= 1) {
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

					console.log("all blocks: ", this.blocks);
				// }else{
				// 	console.warn("we don't have a last block hash set");
				// }
			} else {
				let blk_data = await this.getBlockData(blk, type);

				if (Number(blk_data.id) > this.last_block_id) {
					this.last_block_id = Number(blk_data.id);
					if (this.blocks.length >= 10) {
						this.blocks.shift();
					}
					this.blocks.push(blk_data);
				}
			}

			this.ui.render();
		} catch(err) {
			console.log("Err getBlock: ", err);
		}
	}

	async getBlockData(blk, type){
		let atr_obj = {};
		atr_obj.id = blk.id;
		atr_obj.totalFees = blk.totalFees
		atr_obj.totalFeesNew = blk.totalFeesNew;
		atr_obj.totalFeesAtr = blk.totalFeesAtr;
		atr_obj.totalFeesCumulative = blk.totalFeesCumulative;
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
		atr_obj.hasGoldenTicket = blk.hasGoldenTicket;
		atr_obj.treasury = blk.treasury;
		atr_obj.graveyard = blk.graveyard;

		console.log("blk: ", blk);

		let utxo = null;
		if (type == 'old') {
			atr_obj.utxo = '-';
			atr_obj.total_supply = '-';
		} else {
			utxo = await this.fetchBalanceSnapshot('');
			console.log("")
			atr_obj.utxo = utxo;
			atr_obj.total_supply = utxo+blk.treasury+blk.graveyard+blk.totalFees+blk.previousBlockUnpaid;
		}

		let fullblock = JSON.parse(blk.toJson());
		atr_obj.previous_block_hash = fullblock.previous_block_hash;

		console.log("atr_obj: ", atr_obj);

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

	webServer(app, expressapp, express) {
	    let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
	    var atr_self = app.modules.returnModule('ATR');

	    expressapp.get(
	      '/' + encodeURI(this.returnSlug()),
	      async function (req, res) {
	        let reqBaseURL = req.protocol + '://' + req.headers.host + '/';

	        atr_self.social.url = reqBaseURL + encodeURI(atr_self.returnSlug());

		if (!res.finished) {
	        	res.setHeader('Content-type', 'text/html');
	        	res.charset = 'UTF-8';
	        	return res.send(HomePage(app, atr_self, app.build_number, atr_self.social));
		}
		return;

	      }
	    );

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

					let atr_obj = await atr_self.getBlockData(blk, 'old');

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
	  expressapp.use('/' + encodeURI(this.returnSlug()), express.static(webdir));
	}

	async onConfirmation(blk, tx, conf) {
		// only run on the browser	
		if (this.app.BROWSER == 0) { return };
		let txmsg = tx.returnMessage();
		let atr_self = this.app.modules.returnModule('ATR');

		if (conf === 0) {
			await this.loadBlocks(blk, 'new');
		}
	}

	async onNewBlock(blk, lc) {
		if (this.app.BROWSER == 0) { return };
		await this.loadBlocks(blk, 'new');
	}

	async handlePeerTransaction(app, tx = null, peer, mycallback = null) {
		if (tx == null) {
			return;
		}
		let txmsg = tx.returnMessage();
		console.log("atr.handlePeerTransaction : " + txmsg.request);

		if (txmsg.request === 'new-block-with-gt') {
			await app.wallet.produceBlockWithGt()
			return 0;
		}else if (txmsg.request === 'new-block-with-no-gt') {
			await app.wallet.produceBlockWithoutGt();
			return 0;
		}
		return super.handlePeerTransaction(app, tx, peer, mycallback);
	}

	async fetchBalanceSnapshot(key) {
        try {
            let response = await fetch('/balance/' + key);
            let data = await response.text();
            let utxo = null;

            console.log("utxo: ", data);

            let split_data = data.split(' ');

            const result = split_data.slice(1).filter(item => item.includes('\n')).map(item => {
			  return item.split('\n')[0];
			});

            utxo = result.reduce((acc, num) => acc + BigInt(num), BigInt(0));
        	return utxo;
        } catch (error) {
            console.error(error);
        }
    }

    async getBalanceString(balance = null) {
    	if (balance == null) {
    		balance = await this.app.wallet.getBalance();
		}

		let balanceSaito = balance/BigInt(100000000);
		let nolansRemainder = balance - (balanceSaito * BigInt(100000000));

		let balance_str = balanceSaito+"."+nolansRemainder;

		return Number(balance_str).toFixed(2);
    }
}

module.exports = ATR;
