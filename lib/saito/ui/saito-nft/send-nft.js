const NftTemplate = require('./send-nft.template');
const SaitoOverlay = require('./../saito-overlay/saito-overlay');

class Nft {

    constructor(app, mod, container = '') {
        this.app = app;
        this.mod = mod;
        this.overlay = new SaitoOverlay(this.app, this.mod);

	    this.editing_mode = "image"; // "data" shows textarea

        this.nft = {};
    	this.nft.num     = 1;
    	this.nft.deposit = 0;
    	this.nft.change  = 0;
    	this.nft.fee     = 0;
    	this.nft.slip    = "";
    	this.nft.id      = "";

    	this.nft.bid     = 0;
    	this.nft.tid     = 0;
    	this.nft.sid     = 0;
    	this.nft.amt     = 0;
    	this.nft.type    = 0;
    	this.nft.image   = "";

    	this.callback    = {};
    	this.utxo = [];
        this.nft_selected = 0;

    }

    async render() {


        this.overlay.show(NftTemplate(this.app, this.mod, this));


        await this.renderNft();

        this.attachEvents();
    }


    attachEvents() {
	   let nft_self = this;


        document.querySelector('#nfts-change').onchange = async (e) => {
	        nft_self.nft.change = e.target.value;      
	        let change = BigInt(nft_self.nft.amt) - BigInt(nft_self.nft.deposit) - BigInt(nft_self.nft.fee);
            document.querySelector('#nfts-change').value = change.toString();
	    }

        if (document.querySelector('.utxo-selection-button')) {
            document.querySelectorAll('.utxo-selection-button').forEach(function(btn) {



                btn.onclick = async (e) => {

                    console.log("btn clicked");

                    nft_self.nft_selected = e.target.value;
                    let utxo = nft_self.nft_list[parseInt(e.target.value)];
                    console.log("UTXO: " + (utxo));
                    console.log("nft_selected: ", nft_self.nft_selected);

                  let nft_id = utxo.nft_id;
                  let utxokey_bound = utxo.utxokey_bound;
                  let utxokey_normal = utxo.utxokey_normal;
                  let tx_sig = utxo.tx_sig;


                    document.querySelectorAll(".nft-creator").forEach((el) => { el.classList.remove("nft-inactive"); });
                    document.querySelectorAll(".create-button").forEach((el) => { el.classList.remove("nft-inactive"); });

                };
            });
        }

        if (document.querySelector('.create-button #send_nft')) {
            document.querySelector('.create-button #send_nft').onclick = async (e) => {

                console.log("clicked on send nft");
                let amt = BigInt(1);
                let obj = {image: ''};
                let receiver = document.querySelector("#nfts-receiver").value;

                let nft_item = nft_self.nft_list[nft_self.nft_selected];

                let newtx = await nft_self.app.wallet.createSendBoundTransaction(
                    amt,
                    nft_item.nft_id,
                    JSON.stringify(obj),
                    receiver
                );

                 console.log("createBoundUtxoTransaction:", newtx);
                 await newtx.sign();
                 await nft_self.app.network.propagateTransaction(newtx);
                 console.log("propagateTransaction:", newtx);

                let nft_list = await nft_self.app.wallet.getNftList();            
                console.log("NFT list: ", nft_list);

            };
        }

    }


    addImage(img="") {

        let nft_self = this;
        let html = `<div class="nft-image-preview">
                      <img style="max-height: inherit; max-width: inherit; height: inherit; width: inherit" src="${img}"/>
                      <i class="fa fa-times" onclick="alert('reload to change image')"></i>
                    </div>`;
                                
        this.app.browser.addElementToSelector(html, ".create-button");
                        
    }


    async renderNft() {

        let nft_string = await this.fetchNFT();

        let html = ``;
        let i = 0;
        this.nft_list = JSON.parse(nft_string);
        this.nft_list.forEach(item => {
          console.log("NFT ID:", item.nft_id);
          console.log("Bound UTXO Key:", item.utxokey_bound);
          console.log("Normal UTXO Key:", item.utxokey_normal);
          console.log("TX Signature:", item.tx_sig);

          html += `<div class="utxo-div send-nft">
                        <input type="radio" value="${i}" class="utxo-selection-button" name="utxo-input"> 
                        <span>${item.nft_id} NFT ID</span>
                        <span>-</span>
                        <span>${item.utxokey_bound} Bound UTXO Key</span>
                        <span>-</span>
                        <span>${item.utxokey_normal} Normal UTXO Key</span>
                        <span>-</span>
                        <span>${item.tx_sig} TX Signature</span>
                    </div>`;

            i++;
        });

        document.querySelector('#nft-list').innerHTML = html;

    }

    async fetchNFT(){
        let data = await this.app.wallet.getNftList();

        console.log("nft data:", data);

        return data;
    }
}

module.exports = Nft;

