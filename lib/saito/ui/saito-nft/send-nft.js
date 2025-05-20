const NftTemplate = require('./send-nft.template');
const SaitoOverlay = require('./../saito-overlay/saito-overlay');
const SaitoUser = require('./../saito-user/saito-user');

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
        this.nft_list = [];

        this.app.connection.on('saito-send-nft-render-request', () => {
            this.render();
        });

    }

    async render() {


        this.overlay.show(NftTemplate(this.app, this.mod, this));


        let balance_str = await this.mod.getBalanceString();
        if (document.querySelector(".slip-info .metric.balance h3 .metric-amount") != null) {
            document.querySelector(".slip-info .metric.balance h3 .metric-amount").innerHTML = balance_str;
        }

        await this.renderNft();

        this.attachEvents();
    }


    attachEvents() {
	   let nft_self = this;


        // document.querySelector('#nfts-change').onchange = async (e) => {
	    //     nft_self.nft.change = e.target.value;      
	    //     let change = BigInt(nft_self.nft.amt) - BigInt(nft_self.nft.deposit) - BigInt(nft_self.nft.fee);
        //     document.querySelector('#nfts-change').value = change.toString();
	    // }

        if (document.querySelector('.utxo-selection-button')) {
            document.querySelectorAll('.utxo-selection-button').forEach(function(btn) {



                btn.onclick = async (e) => {

                    console.log("btn clicked");

                  //   nft_self.nft_selected = e.target.value;
                  //   let utxo = nft_self.nft_list[parseInt(e.target.value)];
                  //   console.log("UTXO: " + (utxo));
                  //   console.log("nft_selected: ", nft_self.nft_selected);

                  // let nft_id = utxo.nft_id;
                  // let utxokey_bound = utxo.utxokey_bound;
                  // let utxokey_normal = utxo.utxokey_normal;
                  // let tx_sig = utxo.tx_sig;


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

                console.log("nft item:", nft_item);

                let slip1UtxoKey = nft_item.slip1.utxo_key;
                let slip2UtxoKey = nft_item.slip2.utxo_key;
                let slip3UtxoKey = nft_item.slip3.utxo_key;

                let newtx = await nft_self.app.wallet.createSendBoundTransaction(
                    amt,
                    slip1UtxoKey,
                    slip2UtxoKey,
                    slip3UtxoKey,
                    JSON.stringify(obj),
                    receiver
                );

                 console.log("createBoundUtxoTransaction:", newtx);
                 await newtx.sign();
                 await nft_self.app.network.propagateTransaction(newtx);
                 console.log("propagateTransaction:", newtx);

         
                setTimeout(async function(){
                    let nft_list = await nft_self.app.wallet.getNftList();            
                    console.log("Fetched NFT list: ", nft_list);

                    const nftArray    = JSON.parse(nft_list); 
                    await nft_self.app.wallet.saveNftList(nftArray);

                    console.log("Updated wallet nft list: ", nft_self.app.options.wallet.nft);

                    salert("NFT sent successfully!");
                }, 2000);

                nft_self.overlay.close();

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
      let this_self = this;
      let saito_users = [];
      this.nft_list = await this.fetchNFT();
      
      let   html = `<div class="utxo-div send-nft">
                  <div style="
                     display: none;
                     ">
                     <input type="radio" value="0" class="utxo-selection-button" name="utxo-input">
                  </div>
                  <div class="send-nft-row">
                     <div class="send-nft-row-item"></div>
                     <div class="send-nft-row-item">#</div>
                     <div class="send-nft-row-item">nft id</div>
                     <div class="send-nft-row-item">value</div>
                     <div class="send-nft-row-item">minted by</div>
                     <!--<div class="send-nft-row-item">minted at</div>-->
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

          this.nft_list.forEach((nft, i) => {

                let slip1 = nft.slip1;
                let slip2 = nft.slip2;
                let slip3 = nft.slip3;

                let nft_value = this.app.wallet.convertNolanToSaito(BigInt(slip1.amount));
                let nft_creator = slip1.public_key;

                let saito_user = new SaitoUser(
                    this.app,
                    this.mod,
                    `.saito-user-${nft_creator}`,
                    nft_creator,
                );
                saito_users[nft_creator] = saito_user;



                html += `
                <div class="send-nft-row">
                    <div class="send-nft-row-item">
                        <input type="radio" value="${i}" class="utxo-selection-button" name="utxo-input">
                    </div>
                     <div class="send-nft-row-item">1</div>
                     <div class="send-nft-row-item">
                        ${nft.id}
                     </div>
                     <div class="send-nft-row-item">${nft_value} SAITO</div>
                     <div class="send-nft-row-item saito-user-${nft_creator}">
                     </div>
                    <!--
                     <div class="send-nft-row-item">May 14, 2025 at 11:22</div>
                    -->
                </div>`;

          });
        }

        html += `</div>`;

        document.querySelector('#nft-list').innerHTML = html;

        for (const [publicKey, saito_user] of Object.entries(saito_users)) {

            console.log(saito_user, publicKey);
            saito_user.render();
            saito_user.updateUserline(publicKey);
        }

        console.log("nft_list: ", this.nft_list)
    }

    async fetchNFT(){
        let data = this.app.options.wallet.nft;

        console.log("nft data:", data);

        return data;
    }
}

module.exports = Nft;

