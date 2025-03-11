module.exports = (app, mod) => {

	let html = `
	    <div class="container">
            <div class="utxo-slips">
                <div><b>UTXO slips</b></div>
                
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
                </div>
                <div class="nft-creator">
                  <div class="inputs">
                    <div>
                      <label for="num-nfts">Number of NFTs</label>
                      <input type="number" id="nfts-num" value="1">
                    </div>
                    <div>
                      <label for="nfts-deposit">Deposit per NFT</label>
                      <input type="number" id="nfts-deposit" value="0">
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
                <div class="create-button">
                  <button id="create_nft">Create NFT</button>
                </div>
            </div>
        </div>
	`;

	return html;
}
