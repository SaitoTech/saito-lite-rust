const MainTemplate = require('./main.template');

class Main {
        constructor(app, mod, container="") {
                this.app = app;
                this.mod = mod;
                this.container = '.saito-container';
                this.app.connection.on('saito-atr-render-request', () => {
                	console.log("rendering atr ");
			this.render();
		});
        }

        render() {

        	document.querySelector('.saito-container').innerHTML = MainTemplate(this.app, this.mod);

        	for (let i = 0; i < this.mod.blocks.length; i++) {

                	let block = this.mod.blocks[i];		
			let blockslot = (i+1);

			document.querySelector(`.blocktable .header .blockslot${blockslot}`).innerHTML = block.id;

			document.querySelector(`.blocktable .total_fees .blockslot${blockslot}`).innerHTML = block.cv.total_fees;
			document.querySelector(`.blocktable .total_fees_new .blockslot${blockslot}`).innerHTML = block.cv.total_fees_new;
			document.querySelector(`.blocktable .total_fees_atr .blockslot${blockslot}`).innerHTML = block.cv.total_fees_atr;

			document.querySelector(`.blocktable .avg_total_fees .blockslot${blockslot}`).innerHTML = block.cv.avg_total_fees;
			document.querySelector(`.blocktable .avg_total_fees_new .blockslot${blockslot}`).innerHTML = block.cv.avg_total_fees_new;
			document.querySelector(`.blocktable .avg_total_fees_atr .blockslot${blockslot}`).innerHTML = block.cv.avg_total_fees_atr;

			document.querySelector(`.blocktable .total_payout_routing .blockslot${blockslot}`).innerHTML = block.cv.total_payout_routing;
			document.querySelector(`.blocktable .total_payout_mining .blockslot${blockslot}`).innerHTML = block.cv.total_payout_mining;
			document.querySelector(`.blocktable .total_payout_treasury .blockslot${blockslot}`).innerHTML = block.cv.total_payout_treasury;
			document.querySelector(`.blocktable .total_payout_graveyard .blockslot${blockslot}`).innerHTML = block.cv.total_payout_graveyard;
			document.querySelector(`.blocktable .total_payout_atr .blockslot${blockslot}`).innerHTML = block.cv.total_payout_atr;

			document.querySelector(`.blocktable .avg_payout_routing .blockslot${blockslot}`).innerHTML = block.cv.avg_payout_routing;
			document.querySelector(`.blocktable .avg_payout_mining .blockslot${blockslot}`).innerHTML = block.cv.avg_payout_mining;
			document.querySelector(`.blocktable .avg_payout_treasury .blockslot${blockslot}`).innerHTML = block.cv.avg_payout_treasury;
			document.querySelector(`.blocktable .avg_payout_graveyard .blockslot${blockslot}`).innerHTML = block.cv.avg_payout_graveyard;
			document.querySelector(`.blocktable .avg_payout_atr .blockslot${blockslot}`).innerHTML = block.cv.avg_payout_atr;

			document.querySelector(`.blocktable .avg_fee_per_byte .blockslot${blockslot}`).innerHTML = block.cv.avg_fee_per_byte;
			document.querySelector(`.blocktable .fee_per_byte .blockslot${blockslot}`).innerHTML = block.cv.fee_per_byte;

			document.querySelector(`.blocktable .avg_nolan_rebroadcast_per_block .blockslot${blockslot}`).innerHTML = block.cv.avg_nolan_rebroadcast_per_block;
			document.querySelector(`.blocktable .burnfee .blockslot${blockslot}`).innerHTML = block.cv.burnfee;
			document.querySelector(`.blocktable .difficulty .blockslot${blockslot}`).innerHTML = block.cv.difficulty;
			document.querySelector(`.blocktable .previous_block_unpaid .blockslot${blockslot}`).innerHTML = block.cv.previous_block_unpaid;

		}

		this.attachEvents();
        }

        attachEvents() {

		document.querySelector(".new_block_with_ticket").onclick = (e) => {
			alert("new block with golden ticket");
		}
		document.querySelector(".new_block_no_ticket").onclick = (e) => {
			alert("new block no golden ticket");
		}
		document.querySelector(".add_transaction_to_mempool").onclick = async (e) => {
			let newtx = await this.app.wallet.createUnsignedTransaction();
    			newtx.msg = {
      				module: "ATR" ,
      				request: 'test',
 				data: { random : Math.random() }
			};
               		await newtx.sign();
    			await this.app.network.propagateTransaction(newtx);
			alert("send transaction to mempool");
		}

        }
}

module.exports = Main;

