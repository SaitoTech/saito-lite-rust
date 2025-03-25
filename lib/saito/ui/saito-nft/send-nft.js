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

        this.nft_list = await this.fetchNFT();

        let html = ``;
        for (let i = 0; i < this.nft_list.length; i++) {

            let nft_json = JSON.stringify(this.nft_list[i]);
        
            console.log(nft_json);
        }

        document.querySelector('#nft-list').innerHTML = html;

    }

    async fetchNFT(){
        let data = await this.app.wallet.getNftList();

        console.log("nft data:", data);

        return data;
    }
}

module.exports = Nft;

