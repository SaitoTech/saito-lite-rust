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

        this.app.connection.on('saito-send-nft-render-request', () => {
            this.render();
        });

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
      this.nft_list = JSON.parse(nft_string);

      let   html = `<div class="utxo-div send-nft">
                  <div style="
                     display: none;
                     ">
                     <input type="radio" value="0" class="utxo-selection-button" name="utxo-input">
                  </div>
                  <div class="send-nft-row">
                     <div class="send-nft-row-item"></div>
                     <div class="send-nft-row-item">#</div>
                     <div class="send-nft-row-item">nft</div>
                     <div class="send-nft-row-item">value</div>
                     <div class="send-nft-row-item">minted by</div>
                     <div class="send-nft-row-item">minted at</div>
                  </div>
        `;


        if (false && !Array.isArray(this.nft_list) || !this.nft_list.length) {
            html += `
                <div class="send-nft-row">
                    <div class="send-nft-row-item">No NFTs in wallet.</div>
                     <div class="send-nft-row-item"></div>
                     <div class="send-nft-row-item"></div>
                     <div class="send-nft-row-item"></div>
                     <div class="send-nft-row-item"></div>
                </div>
            `;
        } else {

          this.nft_list.forEach((item, i) => {
                html += `
                <div class="send-nft-row">
                    <div class="send-nft-row-item">
                        <input type="radio" value="${i}" class="utxo-selection-button" name="utxo-input">
                    </div>
                     <div class="send-nft-row-item">1</div>
                     <div class="send-nft-row-item">
                        ${item.id}
                     </div>
                     <div class="send-nft-row-item">99 SAITO</div>
                     <div class="send-nft-row-item">
                        <div class="saito-user saito-user-wWvjqbuP4b7eqKvV3ZW5Y7tueSKRxEXqB37cpU4QY8yr" data-id="wWvjqbuP4b7eqKvV3ZW5Y7tueSKRxEXqB37cpU4QY8yr" data-disable="false">
                           <div class="saito-identicon-box">
                              <img class="saito-identicon" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MjAnIGhlaWdodD0nNDIwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDI0MCwyNDAsMjQwLDEpOyc+PGcgc3R5bGU9J2ZpbGw6cmdiYSg3NywxNjMsNDEsMSk7IHN0cm9rZTpyZ2JhKDc3LDE2Myw0MSwxKTsgc3Ryb2tlLXdpZHRoOjIuMTsnPjxyZWN0ICB4PScxNjgnIHk9JzAnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScxNjgnIHk9JzE2OCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzE2OCcgeT0nMzM2JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nODQnIHk9JzAnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9JzAnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9Jzg0JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMCcgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSczMzYnIHk9Jzg0JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48L2c+PC9zdmc+" data-id="wWvjqbuP4b7eqKvV3ZW5Y7tueSKRxEXqB37cpU4QY8yr">
                           </div>
                           <div class="saito-address treated" data-id="wWvjqbuP4b7eqKvV3ZW5Y7tueSKRxEXqB37cpU4QY8yr">Anon-wWvjqb</div>
                           <div class="saito-userline " style="--key-color:#4da329;" data-id="wWvjqbuP4b7eqKvV3ZW5Y7tueSKRxEXqB37cpU4QY8yr">wWvjqbuP4b7eqKvV3...</div>
                        </div>
                     </div>
                     <div class="send-nft-row-item">May 14, 2025 at 11:22</div>
                </div>`;

          });
        }

        html += `</div>`;

        console.log("html: ", html);

        document.querySelector('#nft-list').innerHTML = html;
    }

    async fetchNFT(){
        let data = await this.app.wallet.getNftList();

        console.log("nft data:", data);

        return data;
    }
}

module.exports = Nft;

