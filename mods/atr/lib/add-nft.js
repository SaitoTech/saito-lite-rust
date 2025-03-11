const AddNftTemplate = require('./add-nft.template');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');

class AddNft {

    constructor(app, mod, container = '') {
        this.app = app;
        this.mod = mod;
        this.overlay = new SaitoOverlay(this.app, this.mod);

        this.nft = {};
	this.nft.num     = 1;
	this.nft.deposit = 0;
	this.nft.change  = 0;
	this.nft.slip    = "";
	this.nft.id      = "";

	this.utxo = [];

    }

    async render() {

	this.nft.test = "abc";
	this.nft.imageUploadCallback = async (file) => {
	    alert(JSON.stringify(this.nft.test));
	    this.nft.data = file;
	};

        this.overlay.show(AddNftTemplate(this.app, this.mod, this));

        let balance_str = await this.mod.getBalanceString();
        if (document.querySelector(".slip-info .metric.balance h3 .metric-amount") != null) {
            document.querySelector(".slip-info .metric.balance h3 .metric-amount").innerHTML = balance_str;
        }

        await this.renderUtxo();
        this.attachEvents();
    }

    attachEvents() {

	let nft_self = this;

        nft_self.app.browser.addDragAndDropFileUploadToElement(
             "nft-image-upload",
              this.nft.imageUploadCallback,
              true
        );

        document.querySelector('#nfts-num').onchange = async (e) => {
	     nft_self.nft.num = e.target.value;      
	}
        document.querySelector('#nfts-deposit').onchange = async (e) => {
	     nft_self.nft.deposit = e.target.value;      
	}
        document.querySelector('#nfts-change').onchange = async (e) => {
	     nft_self.nft.change = e.target.value;      
	}

        document.querySelector('#create_nft').onclick = async (e) => {
            console.log('create clicked: ');
        };

        document.querySelector('.utxo-selection-button').onclick = async (e) => {
alert("VAL: " + JSON.stringify(e.target.value));

            let utxo_item = this.utxo[parseInt(e.target.value)-1];
            let block_id = utxo[1];
            let tx_ordinal = utxo[2];
            let slip_index = utxo[3];
            let amount = BigInt(utxo[4]);

	    this.nft.bid = block_id;
	    this.nft.tid = tx_ordinal;
	    this.nft.sid = slip_index;
	    this.nft.amt = amount;


        };

	

    }


    async renderUtxo() {

        this.utxo = await this.fetchUtxo();

        let html = ``;
        for (let i = 0; i < this.utxo.length; i++) {

            let utxo_item = this.utxo[i];
            let block_id = utxo[1];
            let tx_ordinal = utxo[2];
            let slip_index = utxo[3];
            let amount = BigInt(utxo[4]);

            html += `<div class="utxo-div">
                        <input type="radio" value="${i+1}" class="utxo-selection-button" name="utxo-input"> 
                        <span>${await this.mod.getBalanceString(amount)} SAITO</span>
                        <span>-</span>
                        <span>${block_id} block_id</span>
                        <span>-</span>
                        <span>${tx_ordinal} tx_ordinal</span>
                        <span>-</span>
                        <span>${slip_index} slip_index</span>
                    </div>`;
        }

        document.querySelector('#utxo-list').innerHTML = html;

    }

    async fetchUtxo(){
        let publicKey = this.mod.publicKey;        
        let response = await fetch('/balance/' + publicKey);
        let data = await response.text();

        console.log("utxo response: ", data);

        // slip.public_key = key[0..33].to_vec().try_into().unwrap();
        // slip.block_id = u64::from_be_bytes(key[33..41].try_into().unwrap());
        // slip.tx_ordinal = u64::from_be_bytes(key[41..49].try_into().unwrap());
        // slip.slip_index = key[49];
        // slip.amount

        const parts = data.split('.snap');
        let utxo =  parts[1].trim().split(/\n|\s{2,}/)
                    .filter(line => line.trim() !== '')
                    .map(line => line.split(' '));
        return utxo;
    }
}

module.exports = AddNft;

