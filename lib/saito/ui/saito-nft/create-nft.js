const NftTemplate = require('./create-nft.template');
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

        this.app.connection.on('saito-create-nft-render-request', () => {
            this.render();
        });

    }

    async render() {

	this.callback.imageUploadCallback = async (file) => {
	    if (this.nft.image != "") { 
		alert("NFT Image Editing not allowed, refresh to restart...");
		return;
	    }
	    this.nft.image = file;
	    this.addImage(file);
	};

        this.overlay.show(NftTemplate(this.app, this.mod, this));

        let balance_str = await this.mod.getBalanceString();
        if (document.querySelector(".slip-info .metric.balance h3 .metric-amount") != null) {
            document.querySelector(".slip-info .metric.balance h3 .metric-amount").innerHTML = balance_str;
        }

        await this.renderUtxo();
	if (this.nft.image != "") { this.addImage(this.nft.image); }

        this.attachEvents();
    }

    createObject() {
	let obj = {};
	    obj.id = `${this.mod.publicKey}${this.nft.bid}${this.nft.tid}${this.nft.sid}${this.nft.amount}${1}`;
	    if (this.nft.image) { obj.image = this.nft.image; }
	    if (this.nft.data) { obj.data = this.nft.data; }
	    return obj;
    }

    attachEvents() {
	   let nft_self = this;

        nft_self.app.browser.addDragAndDropFileUploadToElement(
            "nft-image-upload",
            this.callback.imageUploadCallback,
            true
        );

        // document.querySelector('.data-nft-toggle').onclick = (e) => {
        //     if (this.editing_mode === "image") {
        //         let obj = this.createObject();
        //         if (!obj.data) { obj.data = {}; }
        //         e.target.style.opacity = "0.3";
        //         document.querySelector(".textarea-container").innerHTML = `<textarea class="data-nft-textarea">${JSON.stringify(obj, null, 2)}</textarea>`;
        //     } else {
        //         alert("Please reload to return to image editor...");
        //     }
    	// }

        document.querySelector('#nfts-fee').onchange = async (e) => {
	        nft_self.nft.fee = e.target.value;      
            nft_self.nft.deposit = document.querySelector('#nfts-deposit').value;

            let amt = this.app.wallet.convertNolanToSaito(BigInt(nft_self.nft.amt));
            let deposit = this.app.wallet.convertNolanToSaito(BigInt(nft_self.nft.deposit));
            let fee = this.app.wallet.convertNolanToSaito(BigInt(nft_self.nft.fee));

            let change = amt - deposit - fee;
            document.querySelector('#nfts-change').value = change;
	    }

        document.querySelector('#nfts-deposit').onchange = async (e) => {
	        nft_self.nft.deposit = e.target.value;
            nft_self.nft.fee =  document.querySelector('#nfts-fee').value;      
            
            let amt = this.app.wallet.convertNolanToSaito(BigInt(nft_self.nft.amt));
            let deposit = nft_self.nft.deposit;
            let fee = nft_self.nft.fee;

            console.log("amt:", amt);
            console.log("deposit:", deposit);
            console.log("fee:", fee);

            let change = amt - deposit - fee;

            console.log("change:", change);


            document.querySelector('#nfts-change').value = change;
	    }

        // document.querySelector('#nfts-change').onchange = async (e) => {
	    //     nft_self.nft.change = e.target.value;      

        //     let amt = this.app.wallet.convertNolanToSaito(BigInt(nft_self.nft.amt));
        //     let deposit = this.app.wallet.convertNolanToSaito(BigInt(nft_self.nft.deposit));
        //     let fee = this.app.wallet.convertNolanToSaito(BigInt(nft_self.nft.fee));

        //     let change = amt - deposit - fee;

        //     document.querySelector('#nfts-change').value = change;
	    // }

        document.querySelector('#create_nft').onclick = async (e) => {
    	    let obj = this.createObject();
    	  
            if (this.editing_mode === "image") {
            
                //alert("NFT: " + JSON.stringify(obj));
    	    
            } else {
        		
                let ta = document.querySelector(".data-nft-textarea");
        		let obj2 = JSON.parse(ta.value);
                		
                for (let key in obj2) {
        		    if (key != id) {
        			  obj.key = obj2.key
        		    }
        		}

    	    }



            let amount = BigInt(nft_self.nft.amt); // already in nolam
            // convert saito to nolan
            let depositAmt = this.app.wallet.convertSaitoToNolan(document.querySelector('#nfts-deposit').value);
            let fee = this.app.wallet.convertSaitoToNolan(document.querySelector('#nfts-fee').value);
            let change = this.app.wallet.convertSaitoToNolan(document.querySelector('#nfts-change').value);;

            console.log("SUBMIT NFT: ");
            console.log(nft_self.nft);
            console.log(amount);
            console.log(nft_self.nft.bid);
            console.log(nft_self.nft.tid);
            console.log(nft_self.nft.sid);
            console.log(nft_self.nft.num);
            console.log(depositAmt);
            console.log(change);
            console.log(JSON.stringify(obj));
            console.log(fee);
            console.log(nft_self.mod.publicKey);

            let newtx = await nft_self.app.wallet.createBoundTransaction(
                amount,
                nft_self.nft.bid,
                nft_self.nft.tid,
                nft_self.nft.sid,
                nft_self.nft.num,
                depositAmt,
                change,
                JSON.stringify(obj),
                fee,
                nft_self.mod.publicKey
            );
            console.log("createBoundTransaction:", newtx);
            await newtx.sign();
            await nft_self.app.network.propagateTransaction(newtx);
            console.log("propagateTransaction:", newtx);


            
            

            setTimeout(async function(){
                let nft_list = await nft_self.app.wallet.getNftList();            
                console.log("Fetched NFT list: ", nft_list);

                const nftArray    = JSON.parse(nft_list); 
                await nft_self.app.wallet.saveNftList(nftArray);

                console.log("Updated wallet nft list: ", nft_self.app.options.wallet.nft);

                salert("NFT created successfully!");
            }, 2000);

            nft_self.overlay.close();

        };

        if (document.querySelector('.utxo-selection-button')) {
            document.querySelectorAll('.utxo-selection-button').forEach(function(btn) {

                btn.onclick = async (e) => {
                    let utxo = nft_self.utxo[parseInt(e.target.value)-1];
                    console.log("UTXO: " + JSON.stringify(utxo));

                    let block_id = utxo[1];
                    let tx_ordinal = utxo[2];
                    let slip_index = utxo[3];
                    let amount = utxo[4];

            	    nft_self.nft.bid = block_id;
            	    nft_self.nft.tid = tx_ordinal;
            	    nft_self.nft.sid = slip_index;
            	    nft_self.nft.amt = amount;

            	    document.querySelectorAll(".nft-creator").forEach((el) => { el.classList.remove("nft-inactive"); });
            	    document.querySelectorAll(".create-button").forEach((el) => { el.classList.remove("nft-inactive"); });

                };
            });
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


    async renderUtxo() {

        this.utxo = await this.fetchUtxo();

        let html = ``;

        if (false && !Array.isArray(this.utxo) || !this.utxo.length) {
            html += `
                <div>
                   No UTXO in available in wallet.
                </div>
            `;
        } else {
            for (let i = 0; i < this.utxo.length; i++) {

                let utxo = this.utxo[i];
                let block_id = utxo[1];
                let tx_ordinal = utxo[2];
                let slip_index = utxo[3];
                let amount = this.app.wallet.convertNolanToSaito((BigInt(utxo[4])));


                html += `<div class="utxo-div">
                            <input type="radio" value="${i+1}" class="utxo-selection-button" name="utxo-input"> 
                            <span>${amount} SAITO</span>
                        </div>`;
            }
        }

        document.querySelector('#utxo-list').innerHTML = html;

    }

    async fetchUtxo(){
        let publicKey = this.mod.publicKey;        
        let response = await fetch('/balance/' + publicKey);
        let data = await response.text();

        const parts = data.split('.snap');
        let utxo =  parts[1].trim().split(/\n|\s{2,}/)
                    .filter(line => line.trim() !== '')
                    .map(line => line.split(' '));
        return utxo;
    }
}

module.exports = Nft;

