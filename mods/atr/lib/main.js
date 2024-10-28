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
		document.querySelector(".add_transaction_to_mempool").onclick = (e) => {
			alert("add transaction to mempool");
		}

        }
}

module.exports = Main;

