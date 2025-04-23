module.exports = (app, mod) => {

	let html = `
	    <div class="container">

            <div class="utxo-slips">
	      <div class="instructions">
		Creating NFTs requires you to have SAITO in your wallet.
		<p></p>
		Once you pick a slip you will be able to specify the transaction fee you wish to pay and the "deposit" that you wish to affix to your NFT. This deposit is what keeps your NFT from -- only the user who is able to spend the UTXO you "deposit" will be able to transfer the NFT to a new address.
	      </div>
              <div><b>Your UTXO</b></div>
              <div id="utxo-list"></div>
            </div>
            
            <div class="right-section">
                <div class="slip-info">
                    <div class="metrics">
                        <div class="metric balance">
                            <h3><span class='metric-amount'>0.00</span> <span class='metric-amount'>SAITO</span></h3>
                            <p class="positive">Balance</p>
                        </div>
                    </div>
		    <div class="options"><div class="data-nft-toggle">switch to json</div></div>
                </div>
                <div class="nft-creator nft-inactive">
                  <div class="inputs">
<!-----
                    <div>
                      <label for="nfts-num">Number of NFTs</label>
                      <input type="number" id="nfts-num" value="1">
                    </div>
------>
                    <div>
                      <label for="nfts-deposit">Deposit</label>
                      <input type="number" id="nfts-deposit" value="0">
                    </div>
                    <div>
                      <label for="nfts-fee">Tx Fee</label>
                      <input type="number" id="nfts-fee" value="1">
                    </div>
                    <div>
                      <label for="nfts-change">Change</label>
                      <input type="number" id="nfts-change">
                    </div>
                  </div>
                  <div class="textarea-container">
                    <div class="saito-app-upload active-tab paste_event" id="nft-image-upload">
                        drag-and-drop NFT image
                    </div>
                  </div>
                </div>
                <div class="create-button nft-inactive">
                  <button id="create_nft">Create NFT</button>
                </div>
            </div>
        </div>
	`;

	return html;
}
