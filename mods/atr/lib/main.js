const MainTemplate = require('./main.template');

class Main {
        constructor(app, mod, container="") {
                this.app = app;
                this.mod = mod;
                this.container = '.saito-container';
                this.app.connection.on('saito-atr-render-request', () => {
                	console.log("event atr-render-request");
			this.render();
		});
        }

        render() {
        	document.querySelector('body').innerHTML = MainTemplate(this.app, this.mod);

        	console.log("mod blocks: ", this.mod.blocks);

        	for (let i = 0; i < this.mod.blocks.length; i++) {

                	let block = this.mod.blocks[i];		
			let blockslot = (i+1);

			console.log("block: ", blockslot);

			document.querySelector(`.blocktable .table-header .blockslot${blockslot}`).innerHTML = block.id;

			document.querySelector(`.blocktable .total_fees .blockslot${blockslot}`).innerHTML = block.totalFees;
			document.querySelector(`.blocktable .total_fees_new .blockslot${blockslot}`).innerHTML = block.totalFeesNew;
			document.querySelector(`.blocktable .total_fees_atr .blockslot${blockslot}`).innerHTML = block.totalFeesAtr;

			document.querySelector(`.blocktable .avg_total_fees .blockslot${blockslot}`).innerHTML = block.avgTotalFees;
			document.querySelector(`.blocktable .avg_total_fees_new .blockslot${blockslot}`).innerHTML = block.avgTotalFeesNew;
			document.querySelector(`.blocktable .avg_total_fees_atr .blockslot${blockslot}`).innerHTML = block.avgTotalFeesAtr;

			document.querySelector(`.blocktable .total_payout_routing .blockslot${blockslot}`).innerHTML = block.totalPayoutRouting;
			document.querySelector(`.blocktable .total_payout_mining .blockslot${blockslot}`).innerHTML = block.totalPayoutMining;
			document.querySelector(`.blocktable .total_payout_treasury .blockslot${blockslot}`).innerHTML = block.totalPayoutTreasury;
			document.querySelector(`.blocktable .total_payout_graveyard .blockslot${blockslot}`).innerHTML = block.totalPayoutGraveyard;
			document.querySelector(`.blocktable .total_payout_atr .blockslot${blockslot}`).innerHTML = block.totalPayoutAtr;

			document.querySelector(`.blocktable .avg_payout_routing .blockslot${blockslot}`).innerHTML = block.avgPayoutRouting;
			document.querySelector(`.blocktable .avg_payout_mining .blockslot${blockslot}`).innerHTML = block.avgPayoutMining;
			document.querySelector(`.blocktable .avg_payout_treasury .blockslot${blockslot}`).innerHTML = block.avgPayoutTreasury;
			document.querySelector(`.blocktable .avg_payout_graveyard .blockslot${blockslot}`).innerHTML = block.avgPayoutGraveyard;
			document.querySelector(`.blocktable .avg_payout_atr .blockslot${blockslot}`).innerHTML = block.avgPayoutAtr;

			document.querySelector(`.blocktable .avg_fee_per_byte .blockslot${blockslot}`).innerHTML = block.avgFeePerByte;
			document.querySelector(`.blocktable .fee_per_byte .blockslot${blockslot}`).innerHTML = block.feePerByte;

			document.querySelector(`.blocktable .avg_nolan_rebroadcast_per_block .blockslot${blockslot}`).innerHTML = block.avgNolanRebroadcastPerBlock;
			document.querySelector(`.blocktable .burn_fee .blockslot${blockslot}`).innerHTML = block.burnFee;
			document.querySelector(`.blocktable .difficulty .blockslot${blockslot}`).innerHTML = block.difficulty;
			document.querySelector(`.blocktable .previous_block_unpaid .blockslot${blockslot}`).innerHTML = block.previousBlockUnpaid;

		}

		this.attachEvents();
        }

        attachEvents() {
        	let this_self = this;
		document.querySelector(".new_block_with_ticket").onclick = async(e) => {
			alert("new block with golden ticket");
			await this_self.app.wallet.produceBlockWithGt();
		}
		document.querySelector(".new_block_no_ticket").onclick = async(e) => {
			alert("new block no golden ticket");
			await this_self.app.wallet.produceBlockWithoutGt();
		}
		document.querySelector("#add_transaction_to_mempool").onclick = async (e) => {
			alert('adding tx to Mempool');
			let newtx = await this.app.wallet.createUnsignedTransaction();
    			newtx.msg = {
      				module: "ATR" ,
      				request: 'test',
 				data: { random : Math.random() }
			};
               		await newtx.sign();
    			await this.app.network.propagateTransaction(newtx);
		}

        }
}

module.exports = Main;

