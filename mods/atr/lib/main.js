const MainTemplate = require('./main.template');
const AddMempool = require('./add-mempool');
const Nft = require('./../../../lib/saito/ui/saito-nft/create-nft');
const SendNft = require('./../../../lib/saito/ui/saito-nft/send-nft');

class Main {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = '.saito-container';
		this.app.connection.on('saito-atr-render-request', () => {
			this.render();
		});
		this.add_mempool = new AddMempool(app, mod);
		this.nft = new Nft(app, mod);
		this.send_nft = new SendNft(app, mod);
	}


    async render() {
    	if (document.querySelector('.saito-container.atr') == null){
    		return;
    	}

    	document.querySelector('.saito-container.atr').innerHTML = MainTemplate(this.app, this.mod);

		  const resp     = await fetch('/atr/cache');
		  const cacheObj = await resp.json();
		  const blocks   = Object.values(cacheObj);

		  console.log("serverCache inside main.js:", blocks);

		  blocks.forEach((block, i) => {

			let blockslot = (i + 1);

			console.log("main.js block: ", block);

			document.querySelector(`.blocktable .table-header .blockslot${blockslot}`).innerHTML = block.id;
			
			document.querySelectorAll(`.blocktable .total_fees .blockslot${blockslot}`).forEach(function(item,index){
				item.innerHTML = (block.totalFees).toLocaleString();
			});
			document.querySelector(`.blocktable .total_fees_new .blockslot${blockslot}`).innerHTML = (block.totalFeesNew).toLocaleString();
			document.querySelector(`.blocktable .total_fees_atr .blockslot${blockslot}`).innerHTML = (block.totalFeesAtr).toLocaleString();
			document.querySelector(`.blocktable .avg_total_fees .blockslot${blockslot}`).innerHTML = (block.avgTotalFees).toLocaleString();
			document.querySelector(`.blocktable .avg_total_fees_new .blockslot${blockslot}`).innerHTML = (block.avgTotalFeesNew).toLocaleString();
			document.querySelector(`.blocktable .avg_total_fees_atr .blockslot${blockslot}`).innerHTML = (block.avgTotalFeesAtr).toLocaleString();

			document.querySelector(`.blocktable .total_fees_cumulative .blockslot${blockslot}`).innerHTML = (block.totalFeesCumulative).toLocaleString();

			document.querySelector(`.blocktable .total_payout_routing .blockslot${blockslot}`).innerHTML = (block.totalPayoutRouting).toLocaleString();
			document.querySelector(`.blocktable .total_payout_mining .blockslot${blockslot}`).innerHTML = (block.totalPayoutMining).toLocaleString();
			document.querySelector(`.blocktable .total_payout_treasury .blockslot${blockslot}`).innerHTML = (block.totalPayoutTreasury).toLocaleString();
			document.querySelector(`.blocktable .total_payout_graveyard .blockslot${blockslot}`).innerHTML = (block.totalPayoutGraveyard).toLocaleString();
			document.querySelector(`.blocktable .total_payout_atr .blockslot${blockslot}`).innerHTML = (block.totalPayoutAtr).toLocaleString();
			document.querySelector(`.blocktable .avg_payout_routing .blockslot${blockslot}`).innerHTML = (block.avgPayoutRouting).toLocaleString();
			document.querySelector(`.blocktable .avg_payout_mining .blockslot${blockslot}`).innerHTML = (block.avgPayoutMining).toLocaleString();
			document.querySelector(`.blocktable .avg_payout_treasury .blockslot${blockslot}`).innerHTML = (block.avgPayoutTreasury).toLocaleString();
			document.querySelector(`.blocktable .avg_payout_graveyard .blockslot${blockslot}`).innerHTML = (block.avgPayoutGraveyard).toLocaleString();
			document.querySelector(`.blocktable .avg_payout_atr .blockslot${blockslot}`).innerHTML = (block.avgPayoutAtr).toLocaleString();
			document.querySelector(`.blocktable .avg_fee_per_byte .blockslot${blockslot}`).innerHTML = (block.avgFeePerByte).toLocaleString();
			document.querySelector(`.blocktable .fee_per_byte .blockslot${blockslot}`).innerHTML = (block.feePerByte).toLocaleString();
			document.querySelector(`.blocktable .avg_nolan_rebroadcast_per_block .blockslot${blockslot}`).innerHTML = (block.avgNolanRebroadcastPerBlock).toLocaleString();
			document.querySelector(`.blocktable .burn_fee .blockslot${blockslot}`).innerHTML = (block.burnFee).toLocaleString();
			document.querySelector(`.blocktable .difficulty .blockslot${blockslot}`).innerHTML = (block.difficulty).toLocaleString();
			document.querySelector(`.blocktable .previous_block_unpaid .blockslot${blockslot}`).innerHTML = (block.previousBlockUnpaid).toLocaleString();
			document.querySelector(`.blocktable .hasGoldenTicket .blockslot${blockslot}`).innerHTML = (block.hasGoldenTicket).toLocaleString();
			document.querySelector(`.blocktable .treasury .blockslot${blockslot}`).innerHTML = (block.treasury).toLocaleString();
			document.querySelector(`.blocktable .graveyard .blockslot${blockslot}`).innerHTML = (block.graveyard).toLocaleString();
			document.querySelector(`.blocktable .utxo .blockslot${blockslot}`).innerHTML = (block.utxo).toLocaleString();
			document.querySelector(`.blocktable .total_supply .blockslot${blockslot}`).innerHTML = (block.total_supply).toLocaleString();
		});

		await this.renderBalance();

		this.attachEvents();
	}

	attachEvents() {
		let this_self = this;
		document.querySelector('.new_block_with_ticket').onclick = async (e) => {
			await this.app.network.sendRequestAsTransaction("new-block-with-gt");
		};
		document.querySelector('.new_block_no_ticket').onclick = async (e) => {
			await this.app.network.sendRequestAsTransaction("new-block-with-no-gt");
		};
		document.querySelector('#add_transaction_to_mempool').onclick = async (e) => {
			
			this_self.app.connection.emit(
				'saito-crypto-withdraw-render-request',
				{ ticker: 'SAITO', autofill: true, dynamicFee: true, fee: 0 }
			);
			//this_self.add_mempool.render();
			// let newtx = await this.app.wallet.createUnsignedTransaction();
			// newtx.msg = {
			// 	module: "ATR" ,
			// 	request: 'test',
			// 	data: { random : Math.random() }
			// };
			// await newtx.sign();
			// await this.app.network.propagateTransaction(newtx);
		};


		document.querySelector('#add_nft').onclick = async (e) => {
			await this.nft.render();
		};

		document.querySelector('#send_nft').onclick = async (e) => {
			await this.send_nft.render();
		};
	}

	async renderBalance(){
		let balance_str = await this.mod.getBalanceString();

		console.log('balance string: ', balance_str);
		if (document.querySelector(".metric.balance h3 .metric-amount") != null) {
			document.querySelector(".metric.balance h3 .metric-amount").innerHTML = balance_str;
		}
	}
}

module.exports = Main;

