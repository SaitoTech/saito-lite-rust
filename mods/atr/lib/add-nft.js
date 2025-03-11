const AddNftTemplate = require('./add-nft.template');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');

class AddNft {
    constructor(app, mod, container = '') {
        this.app = app;
        this.mod = mod;
        this.overlay = new SaitoOverlay(this.app, this.mod);
    }

    async render() {
        this.overlay.show(AddNftTemplate(this.app, this.mod, this));

        let balance_str = await this.mod.getBalanceString();
        if (document.querySelector(".slip-info .metric.balance h3 .metric-amount") != null) {
            document.querySelector(".slip-info .metric.balance h3 .metric-amount").innerHTML = balance_str;
        }

        await this.renderUtxo();
        this.attachEvents();
    }

    attachEvents() {
        let this_self = this;

        document.querySelector('#create_nft').onclick = async (e) => {
            //let fee = document.querySelector('#fee').value;
            console.log('create clicked: ');
        };

    }

    async renderUtxo() {
        let utxo = await this.fetchUtxo();
        console.log("renderUtxo: ", utxo);
        let html = ``;
        for (let i=0; i< utxo.length; i++) {
            let utxo_item = utxo[i];
            let block_id = utxo_item[1];
            let tx_ordinal = utxo_item[2];
            let slip_index = utxo_item[3];
            let amount = BigInt(utxo_item[4]);

            console.log("utxo amount: ", amount);

            html += `<div class="utxo-div">
                        <input type="radio" value="" name="utxo-input"> 
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

