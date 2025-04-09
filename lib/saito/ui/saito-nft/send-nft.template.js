module.exports = (app, mod) => {

	let html = `
	    <div class="container">

            <div class="utxo-slips">
	      <div class="instructions">
	         Select NFT from your wallet to send
	      </div>
              <div><b>Your NFTs</b></div>
              <div id="nft-list"></div>
            </div>
            
            <div class="right-section">
                <div class="slip-info">
                    <div class="metrics">
                        <div class="metric balance">
                            <h3><span class='metric-amount'>0.00</span> <span class='metric-amount'>SAITO</span></h3>
                            <p class="positive">Balance</p>
                        </div>
                    </div>
		    <div class="options"><div class="data-nft-toggle">image editor</div></div>
                </div>
                <div class="nft-creator nft-inactive">
                  <div class="inputs">
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
                  <div>
                      <label for="nfts-receiver">Receiver</label>
                      <input type="text" placeholder='Receiver public key' id="nfts-receiver" value="">
                  </div>

                  <div class="textarea-container">
                    <div class="saito-app-upload active-tab paste_event" id="nft-image-upload">
                        NFT image
                    </div>
                  </div>
                </div>
                <div class="create-button nft-inactive">
                  <button id="send_nft">Send NFT</button>
                </div>
            </div>
        </div>
	`;

	return html;
}
